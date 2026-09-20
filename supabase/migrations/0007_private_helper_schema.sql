-- Take the RLS helpers off the public API.
--
-- They are SECURITY DEFINER functions, and anything in `public` is served by
-- PostgREST, so each one answered at /rest/v1/rpc/<name> to anybody holding the
-- anon key. Revoking EXECUTE looks like the obvious fix and is not one: a policy
-- expression is evaluated as the calling role, so denying the function denies the
-- policy, and every read fails with "permission denied for function". Verified
-- against a throwaway table before writing this.
--
-- Moving them to a schema PostgREST does not serve keeps the policies working and
-- takes the endpoints away. Policies are rebuilt from the definitions Postgres
-- already holds rather than retyped, so the only thing that changes about any of
-- them is where the functions live.

set search_path = public;

-- Unpinned search_path on a trigger that writes a column: a caller able to set
-- their own search_path could shadow what `now()` resolves to. Empty and fully
-- qualified leaves nothing to shadow. REPLACE keeps all 14 triggers attached.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create schema if not exists private;

-- USAGE is required for policies to reach these, but PostgREST only serves the
-- schemas it is configured with, so this does not put them back on the API.
grant usage on schema private to authenticated, anon, service_role;

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function private.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_role() in ('ADMIN', 'SUPER_ADMIN')
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, role, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    'CUSTOMER',
    coalesce(
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'given_name',
      pg_catalog.split_part(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), ' ', 1),
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'last_name',
      new.raw_user_meta_data ->> 'family_name',
      nullif(pg_catalog.split_part(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), ' ', 2), ''),
      ''
    ),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

do $do$
declare
  p record;
  stmt text;
  moved int := 0;
begin
  for p in
    select * from pg_policies
    where coalesce(qual, '') || coalesce(with_check, '')
          ~ '(is_admin|current_profile_id|current_user_role)\(\)'
    order by schemaname, tablename, policyname
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);

    stmt := format(
      'create policy %I on %I.%I as %s for %s to %s',
      p.policyname, p.schemaname, p.tablename,
      case when p.permissive = 'PERMISSIVE' then 'permissive' else 'restrictive' end,
      lower(p.cmd),
      array_to_string(p.roles, ', ')
    );

    if p.qual is not null then
      stmt := stmt || ' using (' || replace(replace(replace(p.qual,
        'is_admin()', 'private.is_admin()'),
        'current_profile_id()', 'private.current_profile_id()'),
        'current_user_role()', 'private.current_user_role()') || ')';
    end if;

    if p.with_check is not null then
      stmt := stmt || ' with check (' || replace(replace(replace(p.with_check,
        'is_admin()', 'private.is_admin()'),
        'current_profile_id()', 'private.current_profile_id()'),
        'current_user_role()', 'private.current_user_role()') || ')';
    end if;

    execute stmt;
    moved := moved + 1;
  end loop;

  raise notice 'rebuilt % policies', moved;
end
$do$;

drop function if exists public.is_admin();
drop function if exists public.current_user_role();
drop function if exists public.current_profile_id();
drop function if exists public.handle_new_user();
