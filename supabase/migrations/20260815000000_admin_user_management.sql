alter table public.profiles add column if not exists email text;

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

create unique index if not exists profiles_email_lower_unique
  on public.profiles (lower(email))
  where email is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'User'),
    'user'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create or replace function public.set_profile_role(p_profile_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  admin_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required';
  end if;

  if p_role not in ('user', 'admin') then
    raise exception 'Invalid account role';
  end if;

  select role into current_role
  from public.profiles
  where id = p_profile_id;

  if not found then
    raise exception 'Account profile was not found';
  end if;

  if current_role = 'admin' and p_role = 'user' then
    select count(*) into admin_count
    from public.profiles
    where role = 'admin';

    if admin_count <= 1 then
      raise exception 'Promote another administrator before removing the final administrator';
    end if;
  end if;

  update public.profiles
  set role = p_role
  where id = p_profile_id;
end;
$$;

revoke all on function public.set_profile_role(uuid, text) from public;
grant execute on function public.set_profile_role(uuid, text) to authenticated;
