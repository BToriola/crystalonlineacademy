-- Crystal Online Academy: core schema
create extension if not exists "pgcrypto";

-- Enums ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'tutor', 'parent', 'student');
create type public.region_code as enum ('UK', 'CA', 'NG', 'OTHER');
create type public.curriculum as enum ('uk', 'ca');
create type public.lead_status as enum ('new', 'contacted', 'trial_booked', 'converted', 'closed');
create type public.application_status as enum ('new', 'screening', 'interview', 'demo', 'approved', 'rejected');
create type public.assignment_status as enum ('active', 'paused', 'ended');
create type public.session_status as enum ('scheduled', 'completed', 'cancelled', 'missed');
create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue');
create type public.currency_code as enum ('GBP', 'CAD');

-- Profiles ------------------------------------------------------------------
-- Admins can also teach: give them a tutor_profiles row and assign them like any tutor.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'parent',
  full_name text not null default '',
  email text not null,
  phone text,
  avatar_url text,
  timezone text not null default 'Europe/London',
  country public.region_code not null default 'UK',
  created_at timestamptz not null default now()
);

create table public.tutor_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  bio text,
  subjects text[] not null default '{}',
  levels text[] not null default '{}',
  qualification text,
  years_experience int not null default 0,
  hourly_rate numeric(10, 2) not null default 0,
  rating numeric(2, 1) not null default 5.0,
  languages text[] not null default '{English}',
  is_published boolean not null default false,
  intro_video_url text
);

-- Role helpers (security definer avoids recursive RLS on profiles)
create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

-- New auth users get a profile. Role is always 'parent' unless an admin changes it.
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Marketing intake ----------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  email text not null,
  phone text,
  country public.region_code not null default 'UK',
  timezone text not null default 'Europe/London',
  child_name text not null,
  year_group text not null,
  subjects text[] not null default '{}',
  goals text,
  preferred_times text,
  heard_from text,
  status public.lead_status not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create table public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  country text not null default 'Nigeria',
  timezone text not null default 'Africa/Lagos',
  subjects text[] not null default '{}',
  levels text[] not null default '{}',
  qualification text not null,
  degree_class text,
  years_experience int not null default 0,
  motivation text,
  cv_url text,
  status public.application_status not null default 'new',
  assessment_score int,
  notes text,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Learners & matching -------------------------------------------------------
create table public.students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text,
  curriculum public.curriculum not null default 'uk',
  year_group text not null,
  learning_notes text,
  avatar_seed text not null default gen_random_uuid()::text,
  stars int not null default 0,
  streak_days int not null default 0,
  created_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  status public.assignment_status not null default 'active',
  sessions_per_week int not null default 2,
  meeting_url text,
  started_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  starts_at timestamptz not null,
  duration_min int not null default 60,
  status public.session_status not null default 'scheduled',
  meeting_url text,
  topic text,
  tutor_notes text,
  homework text,
  homework_done boolean not null default false,
  parent_rating int check (parent_rating between 1 and 5),
  parent_feedback text,
  created_at timestamptz not null default now()
);
create index sessions_tutor_starts_idx on public.sessions (tutor_id, starts_at);
create index sessions_student_starts_idx on public.sessions (student_id, starts_at);

create table public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  period_label text not null,
  current_focus text not null,
  curriculum_ref text,
  next_assessment text,
  skills jsonb not null default '[]',
  roadmap jsonb not null default '[]',
  recommendation text not null default '',
  attendance_rate int not null default 100,
  effort_score int not null default 5,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tutor_availability (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- Messaging -----------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid references public.students (id) on delete set null,
  last_message_at timestamptz not null default now(),
  unique (parent_id, tutor_id, student_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- Billing & rewards ---------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  currency public.currency_code not null default 'GBP',
  amount numeric(10, 2) not null,
  status public.invoice_status not null default 'draft',
  period_label text not null,
  due_on date not null,
  paid_on date,
  lines jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.star_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  awarded_by uuid references public.profiles (id) on delete set null,
  amount int not null check (amount between 1 and 10),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.student_badges (
  student_id uuid not null references public.students (id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  primary key (student_id, badge_key)
);

create or replace function public.apply_star_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.students set stars = stars + new.amount where id = new.student_id;
  return new;
end;
$$;

create trigger on_star_event
  after insert on public.star_events
  for each row execute function public.apply_star_event();

-- Relationship helpers ------------------------------------------------------
create or replace function public.is_parent_of(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where id = sid and parent_id = auth.uid())
$$;

create or replace function public.is_tutor_of(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.assignments where student_id = sid and tutor_id = auth.uid() and status <> 'ended')
$$;

create or replace function public.is_student_self(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where id = sid and profile_id = auth.uid())
$$;

create or replace function public.can_view_student(sid uuid)
returns boolean language sql stable as $$
  select public.is_admin() or public.is_parent_of(sid) or public.is_tutor_of(sid) or public.is_student_self(sid)
$$;

-- Row level security --------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.tutor_applications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.sessions enable row level security;
alter table public.progress_reports enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.invoices enable row level security;
alter table public.star_events enable row level security;
alter table public.student_badges enable row level security;

-- profiles: self, admins, and people you work with
create policy "profiles: read related" on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or exists (select 1 from public.tutor_profiles tp where tp.id = profiles.id and tp.is_published)
  or exists (
    select 1 from public.assignments a join public.students s on s.id = a.student_id
    where (a.tutor_id = auth.uid() and s.parent_id = profiles.id)
       or (s.parent_id = auth.uid() and a.tutor_id = profiles.id)
  )
);
create policy "profiles: update self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "profiles: admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- tutor_profiles: public directory for published tutors
create policy "tutor_profiles: public read" on public.tutor_profiles for select using (is_published or id = auth.uid() or public.is_admin());
create policy "tutor_profiles: tutor update self" on public.tutor_profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "tutor_profiles: admin all" on public.tutor_profiles for all using (public.is_admin()) with check (public.is_admin());

-- Public forms can insert; only admins read
create policy "leads: anyone insert" on public.leads for insert with check (true);
create policy "leads: admin all" on public.leads for all using (public.is_admin()) with check (public.is_admin());
create policy "applications: anyone insert" on public.tutor_applications for insert with check (true);
create policy "applications: admin all" on public.tutor_applications for all using (public.is_admin()) with check (public.is_admin());
create policy "contact: anyone insert" on public.contact_messages for insert with check (true);
create policy "contact: admin all" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- students
create policy "students: read" on public.students for select using (public.can_view_student(id));
create policy "students: parent insert" on public.students for insert with check (parent_id = auth.uid() or public.is_admin());
create policy "students: parent update" on public.students for update using (parent_id = auth.uid() or public.is_admin());
create policy "students: admin delete" on public.students for delete using (public.is_admin());

-- assignments
create policy "assignments: read" on public.assignments for select using (
  tutor_id = auth.uid() or public.is_parent_of(student_id) or public.is_student_self(student_id) or public.is_admin()
);
create policy "assignments: admin write" on public.assignments for all using (public.is_admin()) with check (public.is_admin());

-- sessions
create policy "sessions: read" on public.sessions for select using (
  tutor_id = auth.uid() or public.is_parent_of(student_id) or public.is_student_self(student_id) or public.is_admin()
);
create policy "sessions: tutor update" on public.sessions for update using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "sessions: tutor insert" on public.sessions for insert with check (tutor_id = auth.uid() and public.is_tutor_of(student_id));
create policy "sessions: parent rate" on public.sessions for update using (public.is_parent_of(student_id)) with check (public.is_parent_of(student_id));
create policy "sessions: student homework" on public.sessions for update using (public.is_student_self(student_id)) with check (public.is_student_self(student_id));
create policy "sessions: admin all" on public.sessions for all using (public.is_admin()) with check (public.is_admin());

-- progress reports: tutors draft, families see published
create policy "reports: read" on public.progress_reports for select using (
  tutor_id = auth.uid() or public.is_admin()
  or (published_at is not null and (public.is_parent_of(student_id) or public.is_student_self(student_id)))
);
create policy "reports: tutor write" on public.progress_reports for insert with check (tutor_id = auth.uid() and public.is_tutor_of(student_id));
create policy "reports: tutor update" on public.progress_reports for update using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "reports: admin all" on public.progress_reports for all using (public.is_admin()) with check (public.is_admin());

-- availability
create policy "availability: read" on public.tutor_availability for select using (true);
create policy "availability: tutor write" on public.tutor_availability for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "availability: admin all" on public.tutor_availability for all using (public.is_admin()) with check (public.is_admin());

-- messaging
create policy "conversations: participants" on public.conversations for select using (
  parent_id = auth.uid() or tutor_id = auth.uid() or public.is_admin()
);
create policy "conversations: participants create" on public.conversations for insert with check (
  (parent_id = auth.uid() or tutor_id = auth.uid())
  and exists (
    select 1 from public.assignments a join public.students s on s.id = a.student_id
    where a.tutor_id = conversations.tutor_id and s.parent_id = conversations.parent_id
  )
);
create policy "messages: participants read" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.parent_id = auth.uid() or c.tutor_id = auth.uid()))
  or public.is_admin()
);
create policy "messages: participants send" on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from public.conversations c where c.id = conversation_id and (c.parent_id = auth.uid() or c.tutor_id = auth.uid()))
);
create policy "messages: mark read" on public.messages for update using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.parent_id = auth.uid() or c.tutor_id = auth.uid()))
);

-- billing
create policy "invoices: parent read" on public.invoices for select using (parent_id = auth.uid() or public.is_admin());
create policy "invoices: admin write" on public.invoices for all using (public.is_admin()) with check (public.is_admin());

-- rewards
create policy "stars: read" on public.star_events for select using (public.can_view_student(student_id));
create policy "stars: tutor award" on public.star_events for insert with check (
  awarded_by = auth.uid() and (public.is_tutor_of(student_id) or public.is_admin())
);
create policy "badges: read" on public.student_badges for select using (public.can_view_student(student_id));
create policy "badges: tutor award" on public.student_badges for insert with check (public.is_tutor_of(student_id) or public.is_admin());

-- Realtime for chat
alter publication supabase_realtime add table public.messages;
