-- Staff invites: an admin invites an email as 'admin' or 'tutor'. Whoever signs up
-- with that email gets the role automatically (or is promoted if they already exist).

create table public.staff_invites (
  email text primary key check (email = lower(email)),
  role public.user_role not null check (role in ('admin', 'tutor')),
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.staff_invites enable row level security;
create policy "staff_invites: admin all" on public.staff_invites for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.apply_staff_invite(p_user_id uuid, p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  invite public.staff_invites;
begin
  select * into invite from public.staff_invites where email = lower(p_email) and accepted_at is null;
  if not found then
    return;
  end if;

  update public.profiles set role = invite.role where id = p_user_id;
  insert into public.tutor_profiles (id, is_published) values (p_user_id, false) on conflict (id) do nothing;
  update public.staff_invites set accepted_at = now() where email = invite.email;
end;
$$;

-- New sign-ups pick up their invite.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, timezone, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'timezone', 'Europe/London'),
    coalesce((new.raw_user_meta_data ->> 'country')::public.region_code, 'UK')
  );
  perform public.apply_staff_invite(new.id, new.email);
  return new;
end;
$$;

-- Inviting someone who already has an account promotes them straight away.
create or replace function public.on_staff_invite_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  existing uuid;
begin
  select id into existing from public.profiles where lower(email) = new.email;
  if existing is not null then
    perform public.apply_staff_invite(existing, new.email);
  end if;
  return new;
end;
$$;

create trigger staff_invite_created
  after insert on public.staff_invites
  for each row execute function public.on_staff_invite_created();
