-- Hosted administrator smoke check, safe to run after provisioning.
-- This does not replace the executable RLS/mutation suite: npm run test:db.
begin;
do $$begin
 if exists(select 1 from pg_tables where schemaname='public' and tablename in ('profiles','goals','muscle_groups','training_sessions','session_muscle_groups','nutrition_days','daily_checkins') and not rowsecurity) then raise exception 'RLS must be enabled on all fitness tables.';end if;
 if (select count(*) from app_private.owner_config)<>1 then raise exception 'Provision exactly one owner.';end if;
end$$;
rollback;
