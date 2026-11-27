-- Simulation minimale du schéma auth de Supabase pour tester les règles de sécurité sur un PostgreSQL local.
-- psql -d test -f auth_mock.sql -f ../migrations/20261127000000_meche.sql -f rls.sql
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated;
