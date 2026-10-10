import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheckIcon,
  ChevronRightIcon,
  ClipboardPenIcon,
  ClockIcon,
  HeartIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  PartyPopperIcon,
  SunriseIcon,
  UsersIcon,
} from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { listConversations, listMessages } from "@/features/messaging/queries";
import { listReports } from "@/features/reports/queries";
import { listSessions } from "@/features/sessions/queries";
import { JoinLessonButton } from "@/features/tutor/components/join-lesson-button";
import { NextSessionHero } from "@/features/tutor/components/next-session-hero";
import { getTutorRoster } from "@/features/tutor/data";
import { callName, greetingFor, monthInZone, nowMs, studentName, todayInZone, weekInZone, weekOffsetFor } from "@/features/tutor/utils";
import { formatInZone, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Today" };

const DAY = 86_400_000;

type Todo = { id: string; href: string; icon: typeof ClockIcon; tone: string; title: string; detail: string };

export default async function TutorTodayPage() {
  const user = await requireUser("tutor", "admin");
  const tz = user.timezone;
  const now = nowMs();
  const week = weekInZone(tz);
  const month = monthInZone(tz);
  const today = todayInZone(tz);
  const from = new Date(Math.min(month.start.getTime(), week.start.getTime(), now - 45 * DAY));

  const [roster, sessions, reports, conversations] = await Promise.all([
    getTutorRoster(user.id),
    listSessions({ tutorId: user.id, from }),
    listReports({ tutorId: user.id }),
    listConversations(user.id),
  ]);
  const messages = await listMessages(conversations.map((c) => c.id));

  const time = (iso: string) => new Date(iso).getTime();
  const nextSession =
    sessions.find((s) => s.status === "scheduled" && time(s.starts_at) + s.duration_min * 60_000 > now) ?? null;
  const nextStudent = nextSession ? roster.studentById[nextSession.student_id] : undefined;
  const familyTimezone = nextStudent ? roster.parents[nextStudent.parent_id]?.timezone : undefined;

  const todays = sessions.filter((s) => time(s.starts_at) >= today.start.getTime() && time(s.starts_at) <= today.end.getTime());
  const thisWeek = sessions.filter(
    (s) => s.status !== "cancelled" && time(s.starts_at) >= week.start.getTime() && time(s.starts_at) <= week.end.getTime(),
  );
  const monthMinutes = sessions
    .filter((s) => s.status === "completed" && time(s.starts_at) >= month.start.getTime() && time(s.starts_at) <= month.end.getTime())
    .reduce((sum, s) => sum + s.duration_min, 0);
  const ratings = sessions.map((s) => s.parent_rating).filter((r): r is number => r !== null);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  const todos: Todo[] = [];
  for (const s of sessions.filter((s) => s.status === "completed" && !s.tutor_notes?.trim())) {
    const student = roster.studentById[s.student_id];
    todos.push({
      id: `notes-${s.id}`,
      href: `/tutor/schedule?week=${weekOffsetFor(s.starts_at, tz)}&session=${s.id}`,
      icon: NotebookPenIcon,
      tone: "bg-sun/25 text-ink dark:text-sun",
      title: `Add notes for ${student?.first_name ?? "your student"}'s ${s.subject} lesson`,
      detail: formatInZone(s.starts_at, tz, "EEE d MMM, h:mm a"),
    });
  }
  for (const student of roster.students) {
    const recent = reports.some((r) => r.student_id === student.id && time(r.created_at) > now - 30 * DAY);
    if (recent) continue;
    todos.push({
      id: `report-${student.id}`,
      href: `/tutor/reports/new?student=${student.id}`,
      icon: ClipboardPenIcon,
      tone: "bg-primary/10 text-primary",
      title: `Progress report due for ${student.first_name}`,
      detail: "No report in the last 30 days",
    });
  }
  for (const c of conversations) {
    const unread = messages.filter((m) => m.conversation_id === c.id && m.sender_id !== user.id && !m.read_at).length;
    if (!unread) continue;
    const parent = roster.parents[c.parent_id];
    todos.push({
      id: `msg-${c.id}`,
      href: `/messages?c=${c.id}`,
      icon: MessageCircleIcon,
      tone: "bg-coral/12 text-coral",
      title: `${unread} unread message${unread === 1 ? "" : "s"} from ${parent?.full_name ?? "a parent"}`,
      detail: c.student_id && roster.studentById[c.student_id] ? `About ${roster.studentById[c.student_id].first_name}` : "Reply when you can",
    });
  }

  return (
    <>
      <PageHeader
        eyebrow={`${formatInZone(new Date(now), tz, "EEEE d MMMM")} · ${shortZone(tz)}`}
        title={
          <>
            {greetingFor(tz)}, <Script>{callName(user.full_name)}</Script>
          </>
        }
        description={
          todays.length
            ? `You have ${todays.length} lesson${todays.length === 1 ? "" : "s"} today. Here's everything in one place.`
            : "No lessons today — a good moment to catch up on notes and reports."
        }
      />

      <NextSessionHero session={nextSession} student={nextStudent} tutorTimezone={tz} familyTimezone={familyTimezone} />

      <section aria-label="Your numbers" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sessions this week" value={thisWeek.length} icon={CalendarCheckIcon} hint="Mon–Sun, your time" />
        <StatCard label="Hours this month" value={(monthMinutes / 60).toFixed(monthMinutes % 60 ? 1 : 0)} icon={ClockIcon} tone="leaf" hint="Completed lessons" />
        <StatCard label="Students" value={roster.students.length} icon={UsersIcon} tone="coral" hint="Active matches" />
        <StatCard
          label="Avg parent rating"
          value={avgRating ? `${avgRating.toFixed(1)}★` : "—"}
          icon={HeartIcon}
          tone="sun"
          hint={ratings.length ? `From ${ratings.length} rating${ratings.length === 1 ? "" : "s"}` : "No ratings yet"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-xl">Today&rsquo;s timeline</CardTitle>
            <CardDescription>All times in {shortZone(tz)}</CardDescription>
          </CardHeader>
          <CardContent>
            {todays.length ? (
              <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[4.5rem] before:w-px before:bg-border">
                {todays.map((s) => {
                  const student = roster.studentById[s.student_id];
                  const name = student ? studentName(student) : "Student";
                  const start = time(s.starts_at);
                  const isLive = start <= now && now < start + s.duration_min * 60_000;
                  const isPast = start + s.duration_min * 60_000 <= now;
                  return (
                    <li key={s.id} className="relative flex items-start gap-4">
                      <span className={cn("w-14 shrink-0 pt-2 text-right text-sm font-semibold tabular-nums", isPast && "text-muted-foreground")}>
                        {formatInZone(s.starts_at, tz, "HH:mm")}
                      </span>
                      <span
                        className={cn(
                          "relative z-10 mt-3 size-2.5 shrink-0 rounded-full ring-4 ring-card",
                          isLive ? "bg-coral" : isPast ? "bg-muted-foreground/40" : "bg-primary",
                        )}
                        aria-hidden
                      />
                      <div className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-2xl border p-3", isLive && "border-coral/50 bg-coral/5")}>
                        <UserAvatar name={name} seed={student?.avatar_seed} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {name} <span className="text-muted-foreground">· {s.subject}</span>
                          </p>
                          <p className="truncate text-sm text-muted-foreground">{s.topic ?? "Topic to be set"}</p>
                        </div>
                        {s.status === "scheduled" && !isPast && s.meeting_url ? (
                          <JoinLessonButton
                            sessionId={s.id}
                            startsAt={s.starts_at}
                            durationMin={s.duration_min}
                            label="Join"
                            compactLabel
                            size="sm"
                            variant={isLive ? "default" : "outline"}
                            className="rounded-full"
                          />
                        ) : (
                          <StatusBadge status={s.status} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyState icon={SunriseIcon} title="A clear day" description="No lessons on your timetable today." />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">To do</CardTitle>
            <CardDescription>{todos.length ? `${todos.length} thing${todos.length === 1 ? "" : "s"} waiting for you` : "You're all caught up"}</CardDescription>
          </CardHeader>
          <CardContent>
            {todos.length ? (
              <ul className="space-y-2">
                {todos.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={t.href}
                      className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", t.tone)}>
                        <t.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{t.title}</span>
                        <span className="block text-xs text-muted-foreground">{t.detail}</span>
                      </span>
                      <ChevronRightIcon className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={PartyPopperIcon} title="Inbox zero, notes done" description="Nothing needs your attention right now." />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
