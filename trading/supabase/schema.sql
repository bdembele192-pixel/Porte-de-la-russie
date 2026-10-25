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
