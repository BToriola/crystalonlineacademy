import type { Metadata } from "next";
import { BanknoteIcon, CalendarCheckIcon, ClockIcon, InfoIcon, WalletIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/features/auth/session";
import { listSessions } from "@/features/sessions/queries";
import { EarningsChart, type EarningsPoint } from "@/features/tutor/components/earnings-chart";
import { getTutorRoster } from "@/features/tutor/data";
import { getTutor } from "@/features/tutors/queries";
import { monthInZone, studentName } from "@/features/tutor/utils";
import { formatInZone, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Earnings" };

const MONTHS = 6;

export default async function TutorEarningsPage() {
  const user = await requireUser("tutor", "admin");
  const tz = user.timezone;
  const months = Array.from({ length: MONTHS }, (_, i) => monthInZone(tz, i - (MONTHS - 1)));
  const current = months[MONTHS - 1];

  const [tutor, roster, sessions] = await Promise.all([
    getTutor(user.id),
    getTutorRoster(user.id),
    listSessions({ tutorId: user.id, status: ["completed"], from: months[0].start, to: current.end }),
  ]);
  const rate = tutor?.tutor.hourly_rate ?? 0;
  const pay = (minutes: number) => Math.round(rate * (minutes / 60) * 100) / 100;

  const inRange = (iso: string, m: { start: Date; end: Date }) => {
    const t = new Date(iso).getTime();
    return t >= m.start.getTime() && t <= m.end.getTime();
  };

  const chart: EarningsPoint[] = months.map((m) => {
    const list = sessions.filter((s) => inRange(s.starts_at, m));
    return {
      month: formatInZone(m.start, tz, "MMM"),
      label: formatInZone(m.start, tz, "MMMM yyyy"),
      sessions: list.length,
      earnings: pay(list.reduce((sum, s) => sum + s.duration_min, 0)),
    };
  });

  const thisMonth = sessions.filter((s) => inRange(s.starts_at, current)).reverse();
  const monthMinutes = thisMonth.reduce((sum, s) => sum + s.duration_min, 0);
  const monthTotal = pay(monthMinutes);
  const sixMonthTotal = chart.reduce((sum, p) => sum + p.earnings, 0);
  const monthName = formatInZone(current.start, tz, "MMMM");

  return (
    <>
      <PageHeader
        eyebrow="Earnings"
        title="Your earnings"
        description={`Completed lessons × your rate of ${formatMoney(rate)}/hour. Missed and cancelled lessons aren't included.`}
      />

      <section aria-label="Earnings summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`${monthName} so far`} value={formatMoney(monthTotal)} icon={WalletIcon} hint="Paid at month end" />
        <StatCard label="Lessons this month" value={thisMonth.length} icon={CalendarCheckIcon} tone="leaf" />
        <StatCard label="Hours this month" value={(monthMinutes / 60).toFixed(monthMinutes % 60 ? 1 : 0)} icon={ClockIcon} tone="coral" />
        <StatCard label={`Last ${MONTHS} months`} value={formatMoney(sixMonthTotal)} icon={BanknoteIcon} tone="sun" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Monthly earnings</CardTitle>
          <CardDescription>Last {MONTHS} months, from completed lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <EarningsChart data={chart} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Completed in {monthName}</CardTitle>
          <CardDescription>Dates and times in your time zone</CardDescription>
        </CardHeader>
        <CardContent>
          {thisMonth.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">Subject</TableHead>
                  <TableHead className="text-right">Length</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thisMonth.map((s) => {
                  const student = roster.studentById[s.student_id];
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">{formatInZone(s.starts_at, tz, "EEE d MMM, HH:mm")}</TableCell>
                      <TableCell>{student ? studentName(student) : "Student"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{s.subject}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.duration_min} min</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatMoney(pay(s.duration_min))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="hidden sm:table-cell">
                    Total
                  </TableCell>
                  <TableCell colSpan={3} className="sm:hidden">
                    Total
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums sm:table-cell">{(monthMinutes / 60).toFixed(1)} h</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatMoney(monthTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <EmptyState icon={CalendarCheckIcon} title="No completed lessons yet this month" description="Log your lessons as completed from the schedule and they'll appear here." />
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-3xl bg-leaf/10 p-5 text-sm">
        <InfoIcon className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold">How payouts work</p>
          <p className="text-muted-foreground">
            Earnings are totalled at the end of each month from lessons you&rsquo;ve logged as completed, then paid out in the first week of
            the following month. Make sure every lesson is logged so nothing is missed — questions about a payout? Message the academy team.
          </p>
        </div>
      </div>
    </>
  );
}
