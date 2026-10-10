-- One-time owner setup. Replace the email with the owner's, then run this in the SQL editor.
-- It works whether she signs up before or after running it: the account becomes admin
-- (with a tutor profile, because she also teaches).
insert into public.staff_invites (email, role)
values (lower('owner@example.com'), 'admin')
on conflict (email) do update set role = excluded.role, accepted_at = null;

-- After this, invite tutors from Admin → Tutors → "Invite to team" (or by approving an
-- application). They then sign up at /signup with the invited email.
