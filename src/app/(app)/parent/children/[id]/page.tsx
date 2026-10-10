import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarDaysIcon, ChartLineIcon, FlameIcon, HistoryIcon, MessageCircleIcon, StarIcon, TrophyIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { getProfilesByIds } from "@/features/profiles/queries";
import { PastSessionCard, UpcomingSessionCard } from "@/features/parent/components/session-cards";
import { TutorChangeDialog } from "@/features/parent/components/tutor-change-dialog";
import { PrintButton } from "@/features/parent/components/report-tools";
import { getFamily, splitSessions, tutorsFor } from "@/features/parent/data";
import { curriculumFlag } from "@/features/parent/lib/time";
import { ReportView } from "@/features/reports/components/report-view";
import { listReports } from "@/features/reports/queries";
import { getBadges, getStarEvents } from "@/features/rewards/queries";
import { formatInZone, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Child" };

export default async function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("parent");
  const family = await getFamily(user.id);
  const child = family.children.find((c) => c.id === id);
  if (!child) notFound();

  const [reports, badges, starEvents] = await Promise.all([
    listReports({ studentIds: [child.id], publishedOnly: true }),
    getBadges(child.id),
    getStarEvents(child.id),
  ]);

  const reportTutors = await getProfilesByIds(reports.map((r) => r.tutor_id));
  const { people, now } = family;
  const sessions = family.sessions.filter((s) => s.student_id === child.id);
  const { upcoming, past } = splitSessions(sessions, now);
  const tutors = tutorsFor(child.id, family);
  const earned = badges.filter((b) => b.earned_at);
  const completed = past.filter((s) => s.status === "completed").length;
  const attended = past.filter((s) => s.status === "completed" || s.status === "missed").length;
  const flag = curriculumFlag[child.curriculum];
  const fullName = [child.first_name, child.last_name].filter(Boolean).join(" ");

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="w-fit rounded-full print:hidden">
        <Link href="/parent/children">
          <ArrowLeftIcon data-icon="inline-start" /> All children
        </Link>
      </Button>

      <section className="slab relative overflow-hidden bg-sky/40 p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <UserAvatar name={fullName} seed={child.avatar_seed} className="size-20 ring-4 ring-card sm:size-24" />
            <div className="space-y-1">
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{fullName}</h1>
              <p className="flex items-center gap-2 text-muted-foreground">
                <span role="img" aria-label={flag.label}>
                  {flag.flag}
                </span>
                {child.year_group} · {flag.label}
              </p>
              {child.learning_notes && <p className="max-w-xl text-sm">{child.learning_notes}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button asChild className="rounded-full">
              <Link href="/messages">
                <MessageCircleIcon data-icon="inline-start" /> Message tutor
              </Link>
            </Button>
            <TutorChangeDialog studentId={child.id} childName={child.first_name} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stars earned" value={child.stars} icon={StarIcon} tone="sun" hint={starEvents[0] ? `Latest: ${starEvents[0].reason}` : undefined} />
        <StatCard label="Learning streak" value={`${child.streak_days} days`} icon={FlameIcon} tone="coral" />
        <StatCard label="Badges" value={`${earned.length}/${badges.length}`} icon={TrophyIcon} tone="leaf" />
        <StatCard
          label="Lessons completed"
          value={completed}
          icon={CalendarDaysIcon}
          hint={attended ? `${Math.round((completed / attended) * 100)}% attendance` : undefined}
        />
      </div>

      <section aria-labelledby="tutors-title" className="space-y-4">
        <h2 id="tutors-title" className="font-display text-2xl font-extrabold">
          Tutors
        </h2>
        {tutors.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tutors.map(({ assignment, tutor }) => (
              <li key={assignment.id} className="flex items-center gap-4 rounded-3xl border bg-card p-4">
                <UserAvatar name={tutor?.full_name ?? "Tutor"} src={tutor?.avatar_url} seed={tutor?.id} className="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{tutor?.full_name ?? "Tutor"}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.subject} · {assignment.sessions_per_week}× a week · since {formatInZone(`${assignment.started_on}T12:00:00Z`, user.timezone, "MMM yyyy")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">We&apos;re hand-picking a tutor for {child.first_name} — we&apos;ll be in touch shortly.</p>
        )}
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="upcoming-title" className="space-y-4">
          <h2 id="upcoming-title" className="font-display text-2xl font-extrabold">
            Upcoming lessons
          </h2>
          {upcoming.length ? (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((s) => (
                <UpcomingSessionCard key={s.id} session={s} tutor={people[s.tutor_id]} timezone={user.timezone} />
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDaysIcon} title="Nothing scheduled" description="New lessons will appear here as soon as they're booked." />
          )}
        </section>

        <section aria-labelledby="badges-title" className="space-y-4">
          <h2 id="badges-title" className="font-display text-2xl font-extrabold">
            Badges &amp; stars
          </h2>
          <ul className="grid grid-cols-4 gap-2 sm:gap-3">
            {badges.map((b) => (
              <li
                key={b.key}
                title={`${b.title} — ${b.description}`}
                className={cn("flex flex-col items-center gap-1 rounded-2xl border p-2 text-center sm:p-3", b.earned_at ? "bg-sun/15" : "opacity-45 grayscale")}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {b.emoji}
                </span>
                <span className="text-[11px] leading-tight font-medium sm:text-xs">{b.title}</span>
                <span className="sr-only">{b.earned_at ? "Earned" : "Not yet earned"}</span>
              </li>
            ))}
          </ul>
          {starEvents.length > 0 && (
            <ul className="divide-y rounded-3xl border bg-card">
              {starEvents.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sun/25 px-2 py-0.5 font-semibold text-ink dark:text-sun">
                    +{e.amount} <StarIcon className="size-3.5 fill-current" aria-hidden />
                  </span>
                  <span className="flex-1">{e.reason}</span>
                  <time dateTime={e.created_at} className="text-xs text-muted-foreground">
                    {relativeTime(e.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="history-title" className="space-y-4">
        <h2 id="history-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <HistoryIcon className="size-5 text-muted-foreground" aria-hidden /> Session history
        </h2>
        {past.length ? (
          <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-5 sm:pl-7">
            {past.map((s) => (
              <li key={s.id} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-6 -left-[27px] size-3 rounded-full ring-4 ring-background sm:-left-[35px]",
                    s.status === "completed" ? "bg-success" : s.status === "missed" ? "bg-destructive" : "bg-muted-foreground",
                  )}
                />
                <PastSessionCard session={s} tutor={people[s.tutor_id]} timezone={user.timezone} />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={HistoryIcon} title="No lessons yet" description="Notes, homework and ratings from each lesson will build up here." />
        )}
      </section>

      <section aria-labelledby="reports-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="reports-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
            <ChartLineIcon className="size-5 text-muted-foreground" aria-hidden /> Progress reports
          </h2>
          {reports.length > 0 && <PrintButton />}
        </div>
        {reports.length ? (
          <div className="space-y-6">
            {reports.map((r) => (
              <ReportView
                key={r.id}
                report={r}
                studentName={child.first_name}
                yearGroup={child.year_group}
                tutorName={reportTutors[r.tutor_id]?.full_name ?? "Tutor"}
                className="report-print-card"
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={ChartLineIcon} title="No reports yet" description="Tutors publish a progress report every half-term." />
        )}
      </section>
    </div>
  );
}
