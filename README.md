# Crystal Online Academy

Website and portals for a 1:1 online tutoring academy serving families in the UK and Canada.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · shadcn/ui (Radix) · Supabase (Postgres, Auth, Realtime) · Motion · Lenis

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3100. With no Supabase keys the app runs in **demo mode**: every portal works with sample data, and the login page offers one-click demo accounts (Admin, Tutor, Parent, Learner).

## Connecting Supabase (free tier)

1. Create a project at [supabase.com](https://supabase.com).
2. Run all three files in `supabase/migrations/` in order in the SQL editor (or `supabase db push` with the CLI).
3. Copy `.env.example` to `.env.local` and fill in the project URL and publishable (anon) key from **Project Settings → API**.
4. In **Authentication → URL Configuration**, add `http://localhost:3100/auth/callback` (and your production URL) to the redirect URLs.
5. Owner setup: edit the email in `supabase/seed.sql` and run it in the SQL editor, then sign up at `/signup` with that email (the order doesn't matter). That account becomes the admin, with a tutor profile because the owner also teaches.

Parents sign up themselves at `/signup`. To add tutors, approve their application or use **Admin → Tutors → Invite to team**, then send them the sign-up link. When they sign up with the invited email they get tutor access automatically.

## What's inside

| Area | Routes |
| --- | --- |
| Marketing | `/`, `/about`, `/pricing`, `/tutors`, `/book-trial`, `/become-a-tutor`, `/contact`, `/faq` |
| Auth | `/login`, `/signup`, `/forgot-password` |
| Admin (owner) | `/admin`: leads, tutor recruitment pipeline, tutors, families, matches, sessions, invoices |
| Tutor (and admin) | `/tutor`: today, schedule, students, progress reports, availability, earnings |
| Parent | `/parent`: children, sessions and ratings, progress reports, billing |
| Learner | `/learner`: next class, stars, streaks, homework, badges |
| Shared | `/messages` (realtime chat), `/settings` |

## Class supervision

Tutors run lessons on Google Meet links they create, and the academy keeps control of those links:

- Tutors **propose** a Meet link for each match from the student page. It only goes live after an admin approves it in **Admin → Matches**. Only `https://meet.google.com/xxx-xxxx-xxx` links are accepted.
- Every Join button goes through `/join/<session>`, which checks that the person belongs to the class, opens 15 minutes before the start, **logs who joined and when**, then redirects to Meet.
- **Admin → Live classes** shows lessons in progress, who has joined, late tutor starts and no-shows, with a one-click **Drop in**. Admins can join any class at any time.
- **Admin → Tutors** shows each tutor's on-time rate over the last 30 days.

Join tracking is only as complete as portal usage, so share class links only through the portal. For recordings and Meet's own attendance reports, the next step is moving to academy-owned Google Workspace meetings.

Every time is shown in the viewer's own time zone (tutors in Lagos, families in London, Toronto, Vancouver and elsewhere).

## Project structure

```
src/
  app/                 routes: (marketing), (auth), (app) groups
  features/<feature>/  queries.ts (reads), actions.ts (server actions), components/
  components/
    ui/                shadcn primitives
    motion/            Reveal, ScrollText, Marquee, CountUp, Parallax, SmoothScroll
    brand/             logo, doodles, social icons
    shared/            PageHeader, StatCard, StatusBadge, EmptyState, UserAvatar
    theme/             brand themes and the theme customiser
  config/              site, navigation and marketing content
  lib/                 supabase clients, env, formatting, demo data
supabase/              SQL migration and seed
```

## Theming

The palette is defined once as CSS variables in `src/app/globals.css`. Four brand themes (Crystal, Meadow, Berry, Ocean) and light/dark mode can be switched from the palette button in the portal top bar. To add a theme, add a `[data-theme="name"]` block and an entry in `src/components/theme/brand-themes.ts`.

To rebrand, edit `siteConfig` in `src/config/site.ts` and the copy in `src/config/content.ts`.
