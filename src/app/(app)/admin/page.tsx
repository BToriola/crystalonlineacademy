import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  GraduationCapIcon,
  HandshakeIcon,
  InboxIcon,
  ReceiptIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { AttentionList } from "@/features/admin/components/overview/attention-list";
import { LeadFunnel } from "@/features/admin/components/overview/lead-funnel";
import { SessionsChart } from "@/features/admin/components/overview/sessions-chart";
import { TodaySessions } from "@/features/admin/components/overview/today-sessions";
import { Panel } from "@/features/admin/components/panel";
import { firstName } from "@/features/admin/lib/labels";
import {
  activeCounts,
  chartWindow,
  leadFunnel,
  needsAttention,
  outstandingInvoices,
  revenueThisMonth,
  sessionsPerWeek,
  thisWeekSessions,
  todaysSessions,
} from "@/features/admin/lib/overview";
import { greetingFor } from "@/features/admin/lib/time";
import { listApplications } from "@/features/applications/queries";
import { listAssignments } from "@/features/assignments/queries";
import { requireUser } from "@/features/auth/session";
import { listInvoices } from "@/features/billing/queries";
import { listLeads } from "@/features/leads/queries";
import { listSessions } from "@/features/sessions/queries";
import { listStudents } from "@/features/students/queries";
import { listAllTutors } from "@/features/tutors/queries";
import { formatInZone, formatMoney, shortZone } from "@/lib/format";

export const metadata = { title: "Admin dashboard" };

export default async function AdminOverviewPage() {
  const user = await requireUser("admin");
  const tz = user.timezone;
  const chartRange = chartWindow(tz);

  const [students, tutors, assignments, sessions, leads, applications, invoices] = await Promise.all([
    listStudents(),
    listAllTutors(),
    listAssignments(),
    listSessions({ from: chartRange.from, to: chartRange.to }),
    listLeads(),
    listApplications(),
    listInvoices(),
  ]);

  const counts = activeCounts(assignments);
  const weekSessions = thisWeekSessions(sessions, tz);
  const newLeads = leads.filter((l) => l.status === "new").length;
  const revenue = revenueThisMonth(invoices, tz);
  const outstanding = outstandingInvoices(invoices);
  const attention = needsAttention({ leads, applications, invoices, sessions });
  const funnel = leadFunnel(leads);
  const today = todaysSessions(sessions, tz);
  const chartData = sessionsPerWeek(sessions, tz);

  const studentNames = Object.fromEntries(students.map((s) => [s.id, { name: [s.first_name, s.last_name].filter(Boolean).join(" "), seed: s.avatar_seed }]));
  const tutorNames = Object.fromEntries(tutors.map((t) => [t.id, t.full_name]));
  const todayRows = today.map((s) => ({
    session: s,
    studentName: studentNames[s.student_id]?.name ?? "Student",
    studentSeed: studentNames[s.student_id]?.seed,
    tutorName: tutorNames[s.tutor_id] ?? "Tutor",
  }));

  const now = new Date();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={formatInZone(now, tz, "EEEE d MMMM yyyy")}
        title={
          <>
            {greetingFor(tz)}, <Script>{firstName(user.full_name)}</Script>
          </>
        }
        description={`Here's how the academy is looking today. Times are shown in your timezone (${shortZone(tz, now)}).`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/matches">
                <HandshakeIcon data-icon="inline-start" />
                New match
              </Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/sessions">
                <CalendarPlusIcon data-icon="inline-start" />
                Schedule session
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active students" value={counts.students} hint={`${students.length} enrolled in total`} icon={UsersIcon} tone="primary" className="rounded-2xl" />
        <StatCard label="Active tutors" value={counts.tutors} hint={`${tutors.length} on the team, including you`} icon={GraduationCapIcon} tone="leaf" className="rounded-2xl" />
        <StatCard label="Sessions this week" value={weekSessions.length} hint={`${weekSessions.filter((s) => s.status === "completed").length} completed so far`} icon={CalendarDaysIcon} tone="sun" className="rounded-2xl" />
        <StatCard label="New trial requests" value={newLeads} hint={`${leads.length} requests in the pipeline`} icon={InboxIcon} tone="coral" className="rounded-2xl" />
        <StatCard
          label="Revenue this month"
          value={
            <span className="flex flex-wrap items-baseline gap-x-3">
              <span>{formatMoney(revenue.GBP, "GBP")}</span>
              <span className="text-xl text-muted-foreground">{formatMoney(revenue.CAD, "CAD")}</span>
            </span>
          }
          hint="Paid invoices, by currency"
          icon={WalletIcon}
          tone="leaf"
          className="rounded-2xl"
        />
        <StatCard
          label="Outstanding invoices"
          value={outstanding.count}
          hint={
            outstanding.count
              ? `${formatMoney(outstanding.GBP, "GBP")} + ${formatMoney(outstanding.CAD, "CAD")} · ${outstanding.overdue} overdue`
              : "Everything is paid up"
          }
          icon={ReceiptIcon}
          tone="coral"
          className="rounded-2xl"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Sessions per week"
          description="Last six weeks, this week and next"
          className="lg:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/sessions">
                All sessions
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          }
        >
          <SessionsChart data={chartData} />
        </Panel>
        <Panel title="Needs attention" description="Things worth a look today" bodyClassName="p-2">
          <AttentionList items={attention} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Today across the academy"
          description={`${today.length} ${today.length === 1 ? "session" : "sessions"} · times in ${shortZone(tz, now)}`}
          className="lg:col-span-2"
          bodyClassName="p-2"
        >
          <TodaySessions rows={todayRows} timezone={tz} />
        </Panel>
        <Panel
          title="Trial pipeline"
          description="How families move from enquiry to enrolled"
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/leads">
                Open
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          }
        >
          <LeadFunnel funnel={funnel} />
        </Panel>
      </div>
    </div>
  );
}
