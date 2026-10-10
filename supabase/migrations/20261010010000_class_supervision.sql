-- Class supervision: academy-approved meeting links and join tracking.

alter table public.assignments
  add column proposed_meeting_url text,
  add column meeting_url_approved_at timestamptz;

-- Tutors can't edit assignments directly; they propose a link and an admin approves it.
create or replace function public.propose_meeting_link(p_assignment_id uuid, p_url text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_url !~ '^https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}$' then
    raise exception 'Only Google Meet links (https://meet.google.com/abc-defg-hij) are allowed';
  end if;
  update public.assignments
    set proposed_meeting_url = p_url
    where id = p_assignment_id and tutor_id = auth.uid();
  if not found then
    raise exception 'Not your assignment';
  end if;
end;
$$;

create table public.session_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.user_role not null,
  joined_at timestamptz not null default now()
);
create index session_attendance_session_idx on public.session_attendance (session_id, joined_at);

alter table public.session_attendance enable row level security;

create policy "attendance: read" on public.session_attendance for select using (
  public.is_admin()
  or exists (
    select 1 from public.sessions s
    where s.id = session_id
      and (s.tutor_id = auth.uid() or public.is_parent_of(s.student_id) or public.is_student_self(s.student_id))
  )
);

-- Rows are written by the /join route as the joining user, only for sessions they belong to.
create policy "attendance: self insert" on public.session_attendance for insert with check (
  profile_id = auth.uid()
  and role = public.my_role()
  and exists (
    select 1 from public.sessions s
    where s.id = session_id
      and (s.tutor_id = auth.uid() or public.is_parent_of(s.student_id) or public.is_student_self(s.student_id) or public.is_admin())
  )
);

-- Tutors may create/edit their own profile, but only admins decide who is published.
create policy "tutor_profiles: tutor insert self" on public.tutor_profiles for insert
  with check (id = auth.uid() and public.my_role() in ('tutor', 'admin') and not is_published);

create or replace function public.guard_tutor_publish()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_published is distinct from old.is_published and not public.is_admin() then
    new.is_published := old.is_published;
  end if;
  return new;
end;
$$;

create trigger guard_tutor_publish
  before update on public.tutor_profiles
  for each row execute function public.guard_tutor_publish();
