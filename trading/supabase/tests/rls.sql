-- Tests des règles de sécurité de la base (RLS, droits, essai, région).
-- psql -v ON_ERROR_STOP=1 -d test -f auth_mock.sql -f ../migrations/20261127000000_meche.sql -f rls.sql
-- Chaque bloc lève une erreur si une règle est violée ; « OK » s'affiche à la fin.
\set ON_ERROR_STOP 1

-- Deux comptes : profil + 3 jours de Pro offerts, créés automatiquement
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'a@x'), ('22222222-2222-2222-2222-222222222222', 'b@x');
do $$ begin
  assert (select count(*) from public.profiles) = 2, 'profils non créés';
  assert (select count(*) from public.subscriptions where plan_id = 'pro-essai' and current_period_end between now() + interval '71 hours' and now() + interval '73 hours') = 2, 'essai de 3 jours absent';
end $$;

-- Paiement vérifié d'un pass d'un mois pour A : prolongé APRÈS l'essai, une seule fois même si rejoué
insert into public.payments (id, user_id, plan_id, provider, amount, currency, status)
values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'pro-1m', 'cinetpay', 3000, 'XOF', 'paid');
select public.grant_subscription('33333333-3333-3333-3333-333333333333');
do $$ begin
  assert (select current_period_end from public.subscriptions where user_id = '11111111-1111-1111-1111-111111111111')
         between now() + interval '32 days 23 hours' and now() + interval '33 days 1 hour', 'pass mal ajouté à l''essai';
  assert (select plan_id from public.subscriptions where user_id = '11111111-1111-1111-1111-111111111111') = 'pro-1m';
end $$;
insert into public.progress values ('22222222-2222-2222-2222-222222222222', '{"xp":5}');

-- Ce que voit A
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin
  assert (select count(*) from public.profiles) = 1, 'A voit d''autres profils';
  assert (select count(*) from public.progress) = 0, 'A voit la progression de B';
  assert (select count(*) from public.subscriptions) = 1, 'A voit d''autres abonnements';
  assert public.has_perk('pro'), 'A devrait être Pro';
  assert not public.has_perk('xyz');
  assert (select count(*) from public.plans where buyable) = 5, 'offres achetables';
end $$;

-- Tentatives interdites : chacune doit échouer
create or replace function pg_temp.must_fail(sql text, why text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then return; end;
  raise exception 'NON BLOQUÉ : %', why;
end $$;
select pg_temp.must_fail($q$insert into public.subscriptions values ('11111111-1111-1111-1111-111111111111','pro-6m','active',now()+interval '10 years','x',now())$q$, 'créer son abonnement');
select pg_temp.must_fail($q$update public.subscriptions set current_period_end = now()+interval '10 years'$q$, 'prolonger son abonnement');
select pg_temp.must_fail($q$insert into public.payments (user_id,plan_id,provider,amount,currency,status) values ('11111111-1111-1111-1111-111111111111','pro-1m','stripe',1,'EUR','paid')$q$, 'créer un paiement');
select pg_temp.must_fail($q$select public.grant_subscription('33333333-3333-3333-3333-333333333333')$q$, 'appeler grant_subscription');
select pg_temp.must_fail($q$update public.plans set prices='{"XOF":5}' where id='pro-1m'$q$, 'changer un prix');
select pg_temp.must_fail($q$update public.profiles set id='22222222-2222-2222-2222-222222222222'$q$, 'changer son identifiant');
select pg_temp.must_fail($q$update public.profiles set country_changed_at = now() - interval '1 year'$q$, 'tricher sur la date de région');
select pg_temp.must_fail($q$insert into public.progress values ('22222222-2222-2222-2222-222222222222','{}')$q$, 'écrire la progression de B');
select pg_temp.must_fail($q$insert into public.real_orders (user_id,symbol,side,type) values ('22222222-2222-2222-2222-222222222222','BTCUSDT','BUY','MARKET')$q$, 'écrire un ordre pour B');
select pg_temp.must_fail($q$select details from public.payments$q$, 'lire les détails techniques des paiements');

-- Modifications autorisées et limite de changement de région
update public.profiles set display_name = 'Awa' where id = '22222222-2222-2222-2222-222222222222';  -- sans effet (profil de B)
update public.profiles set display_name = 'Awa', country = 'ML';
select pg_temp.must_fail($q$update public.profiles set country = 'SN'$q$, 'changer de région deux fois en 30 jours');
update public.profiles set display_name = 'Awa B.';  -- renommer reste possible
insert into public.real_orders (user_id, symbol, side, type) values ('11111111-1111-1111-1111-111111111111', 'BTCUSDT', 'BUY', 'MARKET');
do $$ begin
  assert (select display_name from public.profiles) = 'Awa B.';
  assert (select country from public.profiles) = 'ML';
  assert (select count(*) from public.real_orders) = 1;
end $$;
reset role;
do $$ begin
  assert (select count(*) from public.profiles where display_name = 'Awa' and id = '22222222-2222-2222-2222-222222222222') = 0, 'A a renommé B';
end $$;

-- Visiteur anonyme : offres visibles, rien d'autre
set role anon;
do $$ begin assert (select count(*) from public.plans) = 7, 'offres visibles par tous'; end $$;
select pg_temp.must_fail($q$select count(*) from public.subscriptions$q$, 'anonyme lit les abonnements');
select pg_temp.must_fail($q$select count(*) from public.profiles$q$, 'anonyme lit les profils');
reset role;
\echo OK : toutes les règles de sécurité tiennent
