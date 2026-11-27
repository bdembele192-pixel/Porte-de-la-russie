-- Tests des règles de sécurité (RLS) : les lignes « tentatives interdites » doivent toutes échouer.
\set ON_ERROR_STOP 0
insert into auth.users (id,email) values ('11111111-1111-1111-1111-111111111111','a@x'),('22222222-2222-2222-2222-222222222222','b@x');
select count(*) as profils_crees from profiles;
-- paiement payé pour A (comme le ferait la fonction serveur)
insert into payments (id,user_id,plan_id,provider,amount,currency,status) values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','pro','cinetpay',2500,'XOF','paid');
select grant_subscription('33333333-3333-3333-3333-333333333333');
select grant_subscription('33333333-3333-3333-3333-333333333333');
select plan_id, (current_period_end - now()) > interval '59 days' as prolonge_deux_fois from subscriptions;
insert into progress values ('22222222-2222-2222-2222-222222222222','{"xp":5}');
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'A voit ses profils' t, count(*) from profiles;
select 'A voit progression de B' t, count(*) from progress;
select 'A has_perk reel' t, has_perk('reel'), has_perk('xyz');
\echo --- tentatives interdites (doivent échouer ou ne rien faire)
insert into subscriptions values ('11111111-1111-1111-1111-111111111111','pro','active',now()+interval '10 years','x',now());
update subscriptions set current_period_end = now()+interval '10 years';
insert into payments (user_id,plan_id,provider,amount,currency,status) values ('11111111-1111-1111-1111-111111111111','pro','stripe',1,'EUR','paid');
select grant_subscription('33333333-3333-3333-3333-333333333333');
update plans set prices='{"XOF":1}' where id='pro';
update profiles set id='22222222-2222-2222-2222-222222222222';
update profiles set display_name='Awa' where id='22222222-2222-2222-2222-222222222222';
select 'B profil nom' t, count(*) from profiles where display_name='Awa';
update profiles set display_name='Awa';
select 'A nom' t, display_name from profiles;
insert into progress values ('22222222-2222-2222-2222-222222222222','{}');
insert into real_orders (user_id,symbol,side,type) values ('22222222-2222-2222-2222-222222222222','BTCUSDT','BUY','MARKET');
insert into real_orders (user_id,symbol,side,type) values ('11111111-1111-1111-1111-111111111111','BTCUSDT','BUY','MARKET');
select 'A ordres' t, count(*) from real_orders;
select 'details paiement' t, details from payments;
select 'colonnes paiement' t, status from payments;
reset role;
set role anon; select 'anon offres' t, count(*) from plans; select 'anon abonnements' t, count(*) from subscriptions; reset role;
