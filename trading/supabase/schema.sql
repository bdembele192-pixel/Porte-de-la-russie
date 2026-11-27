-- Mèche : table de progression des utilisateurs.
-- À exécuter une fois dans Supabase → SQL Editor.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Sécurité au niveau des lignes : chaque utilisateur ne voit et ne modifie que SA ligne.
alter table public.progress enable row level security;

create policy "lire sa progression"       on public.progress for select using (auth.uid() = user_id);
create policy "créer sa progression"      on public.progress for insert with check (auth.uid() = user_id);
create policy "modifier sa progression"   on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "supprimer sa progression"  on public.progress for delete using (auth.uid() = user_id);

-- Suppression complète du compte par l'utilisateur lui-même (bouton « Supprimer mon compte » de l'app).
-- Efface l'utilisateur d'auth.users ; sa progression part avec lui (on delete cascade).
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
