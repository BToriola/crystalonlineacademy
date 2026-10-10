import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarSyncIcon,
  ChartLineIcon,
  MessageCircleIcon,
  NotebookPenIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { listInvoices } from "@/features/billing/queries";
import { AddChildDialog } from "@/features/parent/components/add-child-dialog";
import { ChildCard } from "@/features/parent/components/child-card";
import { NextLessonHero } from "@/features/parent/components/next-lesson-hero";
import { HomeworkLine } from "@/features/parent/components/session-cards";
import { currentHourIn, getFamily, splitSessions, tutorsFor } from "@/features/parent/data";
import { greetingFor } from "@/features/parent/lib/time";
import { listReports } from "@/features/reports/queries";
import { formatInZone, formatMoney, relativeTime } from "@/lib/format";

export const metadata = { title: "Home" };

export default async function ParentHomePage() {
  const user = await requireUser("parent");
  const family = await getFamily(user.id);
  const { children, sessions, people, now } = family;
  const childIds = children.map((c) => c.id);
  const [reports, invoices] = await Promise.all([
    childIds.length ? listReports({ studentIds: childIds, publishedOnly: true }) : Promise.resolve([]),
    listInvoices({ parentId: user.id }),
  ]);

  const byId = Object.fromEntries(children.map((c) => [c.id, c]));
  const { upcoming, past } = splitSessions(sessions, now);
  const next = upcoming[0];
  const notes = past.filter((s) => s.status === "completed" && (s.tutor_notes || s.homework)).slice(0, 4);
  const latestReport = [...reports].sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))[0];
  const unpaid = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const firstName = user.full_name.split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Family dashboard"
        title={
          <>
            {greetingFor(currentHourIn(user.timezone))}, <Script>{firstName}</Script>
          </>
        }
        description={
          upcoming.length
            ? `${upcoming.length} lesson${upcoming.length === 1 ? "" : "s"} coming up. All times are shown in your timezone.`
            : "Here's how your family's learning is going."
        }
      />

      {unpaid.map((invoice) => (
        <Alert key={invoice.id} variant={invoice.status === "overdue" ? "destructive" : "default"} className="rounded-2xl px-4 py-3">
          <AlertTriangleIcon />
          <AlertTitle>
            {invoice.status === "overdue" ? "Overdue invoice" : "Invoice ready"}: {invoice.number} · {formatMoney(invoice.amount, invoice.currency)}
          </AlertTitle>
          <AlertDescription>
            {invoice.period_label} — {invoice.status === "overdue" ? "was due" : "due"} {formatInZone(`${invoice.due_on}T12:00:00Z`, user.timezone, "d MMMM")}.
          </AlertDescription>
          <AlertAction>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/parent/billing">View</Link>
            </Button>
          </AlertAction>
        </Alert>
      ))}

      {next && (
        <Reveal>
          <NextLessonHero session={next} child={byId[next.student_id]} tutor={people[next.tutor_id]} timezone={user.timezone} />
        </Reveal>
      )}

      <section aria-labelledby="children-title" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="children-title" className="font-display text-2xl font-extrabold">
            Your children
          </h2>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/parent/children">
              Manage <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        {children.length ? (
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => (
              <StaggerItem key={child.id}>
                <ChildCard
                  child={child}
                  tutors={tutorsFor(child.id, family).map(({ assignment, tutor }) => ({ subject: assignment.subject, tutor }))}
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState icon={UsersIcon} title="Add your first child" description="Tell us about your child and we'll hand-pick the right tutor.">
            <AddChildDialog />
          </EmptyState>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="notes-title" className="space-y-4">
          <h2 id="notes-title" className="font-display text-2xl font-extrabold">
            Latest from tutors
          </h2>
          {notes.length ? (
            <ol className="space-y-3">
              {notes.map((s) => {
                const tutor = people[s.tutor_id];
                return (
                  <li key={s.id} className="space-y-2.5 rounded-3xl border bg-card p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">
                        {byId[s.student_id]?.first_name} · {s.subject}
                        {s.topic && <span className="font-normal text-muted-foreground"> — {s.topic}</span>}
                      </p>
                      <time dateTime={s.starts_at} className="text-xs text-muted-foreground">
                        {relativeTime(s.starts_at)}
                      </time>
                    </div>
                    {s.tutor_notes && (
                      <p className="text-sm leading-relaxed">
                        &ldquo;{s.tutor_notes}&rdquo; <span className="text-muted-foreground">— {tutor?.full_name ?? "Tutor"}</span>
                      </p>
                    )}
                    {s.homework && <HomeworkLine homework={s.homework} done={s.homework_done} />}
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon={NotebookPenIcon} title="No session notes yet" description="After each lesson, your tutor's notes and homework will appear here." />
          )}
        </section>

        <aside className="space-y-6">
          {latestReport && (
            <section aria-labelledby="report-teaser-title" className="slab relative overflow-hidden bg-sun/30 p-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">New progress report</p>
              <h2 id="report-teaser-title" className="mt-2 font-display text-xl font-extrabold">
                {byId[latestReport.student_id]?.first_name} · {latestReport.subject}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{latestReport.period_label}</p>
              <p className="mt-3 line-clamp-3 text-sm">{latestReport.recommendation}</p>
              <Button asChild className="mt-4 rounded-full">
                <Link href={`/parent/reports?child=${latestReport.student_id}`}>
                  <ChartLineIcon data-icon="inline-start" /> Read the report
                </Link>
              </Button>
            </section>
          )}

          <section aria-labelledby="quick-title" className="space-y-3 rounded-3xl border bg-card p-5">
            <h2 id="quick-title" className="flex items-center gap-2 font-display text-lg font-bold">
              <SparklesIcon className="size-4 text-coral" aria-hidden /> Quick actions
            </h2>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="h-11 justify-start rounded-2xl">
                <Link href="/messages">
                  <MessageCircleIcon data-icon="inline-start" /> Message a tutor
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 justify-start rounded-2xl">
                <Link href="/parent/sessions">
                  <CalendarSyncIcon data-icon="inline-start" /> Request a reschedule
                </Link>
              </Button>
              <AddChildDialog
                trigger={
                  <Button variant="outline" className="h-11 justify-start rounded-2xl">
                    <UserPlusIcon data-icon="inline-start" /> Add a child
                  </Button>
                }
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
