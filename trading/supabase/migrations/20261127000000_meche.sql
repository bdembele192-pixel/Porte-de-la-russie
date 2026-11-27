-- ============================================================================================
-- Mèche : base de données (Supabase / PostgreSQL)
-- Exécutée automatiquement par le workflow GitHub « Mèche : base de données et paiements »,
-- ou à la main : Supabase → SQL Editor → coller ce fichier → Run. Le script peut être relancé.
--
-- Principe de sécurité : chaque table a la sécurité au niveau des lignes (RLS) activée.
--   · Un utilisateur ne lit que SES lignes.
--   · Il ne peut modifier que sa progression, son pseudo/pays et son journal d'ordres.
--   · Abonnements et paiements ne sont écrits QUE par les fonctions serveur (clé service_role),
--     après vérification auprès du prestataire de paiement : impossible de s'offrir un abonnement
--     en modifiant l'app.
--   · Aucune clé d'API de plateforme d'échange (Binance…) n'est jamais stockée ici.
-- ============================================================================================

create extension if not exists pgcrypto;

-- ---------- Profils ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  country      text check (country ~ '^[A-Z]{2}$'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profil : lire le sien" on public.profiles;
create policy "profil : lire le sien" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profil : modifier le sien" on public.profiles;
create policy "profil : modifier le sien" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
-- Seuls le pseudo et le pays sont modifiables par l'utilisateur
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, country, updated_at) on public.profiles to authenticated;

-- Profil créé automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- Progression (XP, badges, portefeuille virtuel, réglages) ----------
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
-- Taille maximale d'une sauvegarde : 1 Mo (évite les abus de stockage)
do $$ begin
  alter table public.progress add constraint progress_size check (pg_column_size(data) < 1048576);
exception when duplicate_object then null; end $$;
drop policy if exists "lire sa progression" on public.progress;
drop policy if exists "créer sa progression" on public.progress;
drop policy if exists "modifier sa progression" on public.progress;
drop policy if exists "supprimer sa progression" on public.progress;
create policy "lire sa progression"      on public.progress for select using (auth.uid() = user_id);
create policy "créer sa progression"     on public.progress for insert with check (auth.uid() = user_id);
create policy "modifier sa progression"  on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "supprimer sa progression" on public.progress for delete using (auth.uid() = user_id);
revoke all on public.progress from anon;
grant select, insert, update, delete on public.progress to authenticated;

-- ---------- Offres d'abonnement (prix fixés plus tard, ici ou dans le tableau Supabase) ----------
create table if not exists public.plans (
  id          text primary key,
  name        text not null,
  description text,
  features    jsonb not null default '[]'::jsonb,   -- liste de textes affichés
  perks       jsonb not null default '[]'::jsonb,   -- droits techniques (ex. ["ia", "missions", "reel"])
  period_days int not null default 30 check (period_days between 1 and 3660),
  prices      jsonb not null default '{}'::jsonb,   -- {"XOF": 2500, "EUR": 3.99} ; null = prix pas encore fixé
  active      boolean not null default true,
  sort        int not null default 0
);
alter table public.plans enable row level security;
drop policy if exists "offres : lecture publique" on public.plans;
create policy "offres : lecture publique" on public.plans for select using (active);
revoke insert, update, delete on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;

insert into public.plans (id, name, description, features, perks, period_days, prices, sort) values
  ('gratuit', 'Gratuit', 'Tout pour apprendre, sans payer.',
   '["Trading live en argent virtuel", "Académie, quiz et glossaire", "Missions Time Machine", "Coach et copilote (règles de risque)"]', '[]', 3650, '{"XOF": 0, "EUR": 0}', 0),
  ('premium', 'Premium', 'Pour progresser plus vite.',
   '["Tout le gratuit", "Mèche IA (Claude) sans limite", "Analyses du coach détaillées", "Synchronisation sur tous tes appareils", "Sans publicité, pour toujours"]', '["ia", "coach"]', 30, '{"XOF": null, "EUR": null}', 1),
  ('premium-an', 'Premium · 1 an', 'Premium payé une fois pour l''année.',
   '["Tout le Premium", "12 mois pour le prix fixé à l''année"]', '["ia", "coach"]', 365, '{"XOF": null, "EUR": null}', 2),
  ('pro', 'Pro', 'Pour passer au réel avec méthode.',
   '["Tout le Premium", "Trading réel connecté à ton compte Binance", "Journal des ordres réels synchronisé", "Vega Desk : sessions sauvegardées"]', '["ia", "coach", "reel"]', 30, '{"XOF": null, "EUR": null}', 3)
on conflict (id) do nothing;

-- ---------- Abonnements (écrits uniquement par les fonctions serveur) ----------
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  plan_id            text not null references public.plans (id),
  status             text not null default 'active' check (status in ('active', 'expired', 'canceled')),
  current_period_end timestamptz not null,
  provider           text,
  updated_at         timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists "abonnement : lire le sien" on public.subscriptions;
create policy "abonnement : lire le sien" on public.subscriptions for select using (auth.uid() = user_id);
revoke all on public.subscriptions from anon;
revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;

-- ---------- Paiements (journal ; écrit uniquement par les fonctions serveur) ----------
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  plan_id      text not null references public.plans (id),
  provider     text not null check (provider in ('cinetpay', 'stripe')),
  amount       numeric(14, 2) not null check (amount > 0),
  currency     text not null check (currency in ('XOF', 'EUR', 'USD')),
  status       text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  provider_ref text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz,
  details      jsonb
);
create index if not exists payments_user on public.payments (user_id, created_at desc);
create index if not exists payments_ref on public.payments (provider, provider_ref);
alter table public.payments enable row level security;
drop policy if exists "paiements : lire les siens" on public.payments;
create policy "paiements : lire les siens" on public.payments for select using (auth.uid() = user_id);
revoke all on public.payments from anon, authenticated;
grant select (id, plan_id, provider, amount, currency, status, created_at, paid_at) on public.payments to authenticated;

-- ---------- Journal des ordres réels (aucun secret : seulement ce que l'utilisateur a fait) ----------
create table if not exists public.real_orders (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  exchange     text not null default 'binance' check (char_length(exchange) <= 20),
  testnet      boolean not null default true,
  symbol       text not null check (symbol ~ '^[A-Z0-9]{2,20}$'),
  side         text not null check (side in ('BUY', 'SELL')),
  type         text not null check (char_length(type) <= 30),
  quantity     numeric,
  quote_amount numeric,
  price        numeric,
  status       text check (char_length(status) <= 30),
  exchange_order_id text check (char_length(exchange_order_id) <= 40),
  note         text check (char_length(note) <= 200),
  created_at   timestamptz not null default now()
);
create index if not exists real_orders_user on public.real_orders (user_id, created_at desc);
alter table public.real_orders enable row level security;
drop policy if exists "ordres : lire les siens" on public.real_orders;
drop policy if exists "ordres : ajouter les siens" on public.real_orders;
drop policy if exists "ordres : supprimer les siens" on public.real_orders;
create policy "ordres : lire les siens"      on public.real_orders for select using (auth.uid() = user_id);
create policy "ordres : ajouter les siens"   on public.real_orders for insert with check (auth.uid() = user_id);
create policy "ordres : supprimer les siens" on public.real_orders for delete using (auth.uid() = user_id);
revoke all on public.real_orders from anon;
revoke update on public.real_orders from authenticated;
grant select, insert, delete on public.real_orders to authenticated;

-- ---------- Droits ----------
-- Vrai si l'utilisateur connecté a un abonnement actif donnant ce droit (ex. 'ia', 'reel')
create or replace function public.has_perk(perk text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions s join public.plans p on p.id = s.plan_id
    where s.user_id = auth.uid() and s.status = 'active' and s.current_period_end > now() and p.perks ? perk
  );
$$;
revoke all on function public.has_perk(text) from public, anon;
grant execute on function public.has_perk(text) to authenticated;

-- Prolonge (ou crée) un abonnement après un paiement vérifié. Réservé aux fonctions serveur.
create or replace function public.grant_subscription(p_payment uuid)
returns void language plpgsql security definer set search_path = public as $$
declare pay record; pl record; base timestamptz;
begin
  select * into pay from public.payments where id = p_payment for update;
  if not found or pay.status <> 'paid' then raise exception 'paiement non valide'; end if;
  select * into pl from public.plans where id = pay.plan_id;
  select greatest(now(), coalesce((select current_period_end from public.subscriptions where user_id = pay.user_id and status = 'active'), now())) into base;
  insert into public.subscriptions (user_id, plan_id, status, current_period_end, provider, updated_at)
  values (pay.user_id, pay.plan_id, 'active', base + make_interval(days => pl.period_days), pay.provider, now())
  on conflict (user_id) do update set plan_id = excluded.plan_id, status = 'active',
    current_period_end = excluded.current_period_end, provider = excluded.provider, updated_at = now();
end $$;
revoke all on function public.grant_subscription(uuid) from public, anon, authenticated;

-- Suppression complète du compte par l'utilisateur (bouton « Supprimer mon compte »)
create or replace function public.delete_my_account()
returns void language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
