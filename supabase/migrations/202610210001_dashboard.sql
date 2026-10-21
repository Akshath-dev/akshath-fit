-- Apply through the Supabase SQL editor or migrations. No owner is trusted until provisioning.
create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated;
create table app_private.owner_config (singleton boolean primary key default true check(singleton), user_id uuid not null references auth.users(id));
revoke all on app_private.owner_config from public, anon, authenticated;
create function app_private.is_owner() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from app_private.owner_config where user_id=auth.uid());
$$;
revoke all on function app_private.is_owner() from public;
grant execute on function app_private.is_owner() to anon,authenticated;
create function app_private.valid_metric(v numeric, minimum numeric default 0) returns boolean language sql immutable set search_path='' as $$ select v is null or (v>=minimum and v<'Infinity'::numeric); $$;
create table public.profiles(user_id uuid primary key references auth.users(id) on delete cascade, display_name text not null default 'Akshath' check(length(trim(display_name)) between 1 and 60), time_zone text not null default 'Asia/Kolkata');
create table public.goals(user_id uuid primary key references auth.users(id) on delete cascade,
 calories numeric check(app_private.valid_metric(calories) and (calories is null or calories>0)), protein numeric check(app_private.valid_metric(protein) and (protein is null or protein>0)), carbs numeric check(app_private.valid_metric(carbs) and (carbs is null or carbs>0)), fat numeric check(app_private.valid_metric(fat) and (fat is null or fat>0)), steps numeric check(app_private.valid_metric(steps) and (steps is null or (steps>0 and steps=trunc(steps)))), weekly_training numeric check(app_private.valid_metric(weekly_training) and (weekly_training is null or (weekly_training>0 and weekly_training=trunc(weekly_training)))));
create table public.muscle_groups(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null check(length(trim(name)) between 1 and 40), is_custom boolean not null default true, unique(id,user_id));
create unique index muscle_group_name on public.muscle_groups(user_id,lower(trim(name)));
create table public.training_sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,date date not null,kind text not null check(kind in ('strength','cardio')),activity_type text,duration_minutes numeric check(app_private.valid_metric(duration_minutes)),distance_km numeric check(app_private.valid_metric(distance_km)),notes text not null default '' check(length(notes)<=2000),created_at timestamptz not null default now(),unique(id,user_id),check((kind='cardio' and activity_type is not null and duration_minutes is not null and length(trim(activity_type))>0 and duration_minutes>0) or (kind='strength' and activity_type is null and distance_km is null)));
create index training_date on public.training_sessions(user_id,date);
create table public.session_muscle_groups(user_id uuid not null, session_id uuid not null,muscle_group_id uuid not null,primary key(session_id,muscle_group_id), foreign key(session_id,user_id) references public.training_sessions(id,user_id) on delete cascade, foreign key(muscle_group_id,user_id) references public.muscle_groups(id,user_id));
create table public.nutrition_days(user_id uuid not null references auth.users(id) on delete cascade,date date not null,calories numeric check(app_private.valid_metric(calories)),protein numeric check(app_private.valid_metric(protein)),carbs numeric check(app_private.valid_metric(carbs)),fat numeric check(app_private.valid_metric(fat)),notes text not null default '' check(length(notes)<=2000),primary key(user_id,date),check(num_nonnulls(calories,protein,carbs,fat)>0));
create table public.daily_checkins(user_id uuid not null references auth.users(id) on delete cascade,date date not null,steps numeric check(app_private.valid_metric(steps) and (steps is null or steps=trunc(steps))),weight_kg numeric check(app_private.valid_metric(weight_kg) and (weight_kg is null or weight_kg>0)),waist_cm numeric check(app_private.valid_metric(waist_cm) and (waist_cm is null or waist_cm>0)),rest_day boolean not null default false,notes text not null default '' check(length(notes)<=2000),primary key(user_id,date));
-- Owner predicate applies to every direct REST table operation, not just this application UI.
do $$declare tab text;begin foreach tab in array array['profiles','goals','muscle_groups','training_sessions','session_muscle_groups','nutrition_days','daily_checkins'] loop
 execute format('alter table public.%I enable row level security',tab);
 execute format('grant select on public.%I to anon,authenticated',tab);
 execute format('grant insert,update,delete on public.%I to authenticated',tab);
 execute format('create policy owner_only on public.%I for all using (user_id=auth.uid() and app_private.is_owner()) with check (user_id=auth.uid() and app_private.is_owner())',tab);
end loop;end$$;
create function public.owner_access() returns boolean language sql stable set search_path='' as $$select app_private.is_owner();$$;
revoke all on function public.owner_access() from public;
grant execute on function public.owner_access() to authenticated;
-- Serializing the owner's rest/session mutations also covers simultaneous tabs.
create function app_private.check_rest() returns trigger language plpgsql set search_path='' as $$begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text,0));
 if new.rest_day and exists(select 1 from public.training_sessions where user_id=new.user_id and date=new.date) then raise exception 'A day with training cannot be marked as rest.';end if;
 return new;end$$;
create trigger check_rest before insert or update on public.daily_checkins for each row execute function app_private.check_rest();
create function app_private.clear_rest() returns trigger language plpgsql set search_path='' as $$begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text,0));
 update public.daily_checkins set rest_day=false where user_id=new.user_id and date=new.date and rest_day;
 return new;end$$;
create trigger clear_rest before insert or update on public.training_sessions for each row execute function app_private.clear_rest();
create function app_private.check_session_groups() returns trigger language plpgsql set search_path='' as $$begin
 if exists(select 1 from public.training_sessions s where
 (s.kind='strength' and not exists(select 1 from public.session_muscle_groups g where g.session_id=s.id)) or
 (s.kind='cardio' and exists(select 1 from public.session_muscle_groups g where g.session_id=s.id)))
 then raise exception 'Strength sessions need muscle groups; cardio sessions cannot have muscle groups.';end if;
 return null;end$$;
create constraint trigger session_groups_valid after insert or update on public.training_sessions deferrable initially deferred for each row execute function app_private.check_session_groups();
create constraint trigger selection_valid after insert or update or delete on public.session_muscle_groups deferrable initially deferred for each row execute function app_private.check_session_groups();
create function public.save_training_session(p_id uuid,p_date date,p_kind text,p_activity_type text,p_duration_minutes numeric,p_distance_km numeric,p_notes text,p_muscle_group_ids uuid[]) returns uuid language plpgsql set search_path='' as $$declare sid uuid=coalesce(p_id,gen_random_uuid());begin
 if not app_private.is_owner() then raise exception 'Owner access required.' using errcode='42501';end if;
 if p_kind='strength' and coalesce(cardinality(p_muscle_group_ids),0)=0 then raise exception 'Select at least one muscle group.';end if;
 if p_kind='cardio' and coalesce(cardinality(p_muscle_group_ids),0)>0 then raise exception 'Cardio cannot contain muscle groups.';end if;
 if p_id is not null and not exists(select 1 from public.training_sessions where id=p_id) then raise exception 'Session not found.';end if;
 insert into public.training_sessions(id,user_id,date,kind,activity_type,duration_minutes,distance_km,notes) values(sid,auth.uid(),p_date,p_kind,p_activity_type,p_duration_minutes,p_distance_km,coalesce(p_notes,'')) on conflict(id) do update set date=excluded.date,kind=excluded.kind,activity_type=excluded.activity_type,duration_minutes=excluded.duration_minutes,distance_km=excluded.distance_km,notes=excluded.notes;
 delete from public.session_muscle_groups where session_id=sid;
 insert into public.session_muscle_groups(user_id,session_id,muscle_group_id) select auth.uid(),sid,x from (select distinct unnest(p_muscle_group_ids) x) groups;
 return sid;end$$;
create function public.save_settings(p_display_name text,p_time_zone text,p_goals jsonb) returns void language plpgsql set search_path='' as $$begin
 if not app_private.is_owner() then raise exception 'Owner access required.' using errcode='42501';end if;
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=p_time_zone) then raise exception 'Choose a valid timezone.';end if;
 update public.profiles set display_name=trim(p_display_name),time_zone=p_time_zone where user_id=auth.uid();
 insert into public.goals(user_id,calories,protein,carbs,fat,steps,weekly_training) values(auth.uid(),(p_goals->>'calories')::numeric,(p_goals->>'protein')::numeric,(p_goals->>'carbs')::numeric,(p_goals->>'fat')::numeric,(p_goals->>'steps')::numeric,(p_goals->>'weeklyTraining')::numeric) on conflict(user_id) do update set calories=excluded.calories,protein=excluded.protein,carbs=excluded.carbs,fat=excluded.fat,steps=excluded.steps,weekly_training=excluded.weekly_training;
 end$$;
revoke all on function public.save_training_session(uuid,date,text,text,numeric,numeric,text,uuid[]) from public;
revoke all on function public.save_settings(text,text,jsonb) from public;
grant execute on function public.save_training_session(uuid,date,text,text,numeric,numeric,text,uuid[]) to authenticated;
grant execute on function public.save_settings(text,text,jsonb) to authenticated;
create function app_private.provision_owner(p_owner_id uuid) returns void language plpgsql security definer set search_path='' as $$begin
 if exists(select 1 from app_private.owner_config where user_id<>p_owner_id) then raise exception 'An owner is already configured.';end if;
 insert into app_private.owner_config(singleton,user_id) values(true,p_owner_id) on conflict do nothing;
 insert into public.profiles(user_id) values(p_owner_id) on conflict do nothing;
 insert into public.goals(user_id,calories,protein,carbs,fat) values(p_owner_id,1900,150,190,55) on conflict do nothing;
 insert into public.muscle_groups(user_id,name,is_custom) select p_owner_id,n,false from unnest(array['Chest','Back','Shoulders','Biceps','Triceps','Quadriceps','Hamstrings','Glutes','Calves','Core','Full body']) n on conflict do nothing;
 end$$;
revoke all on function app_private.provision_owner(uuid) from public,anon,authenticated;
