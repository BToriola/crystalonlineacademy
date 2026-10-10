import Link from "next/link";
import { AlarmClockIcon, CheckCircle2Icon, CircleDashedIcon, EyeIcon, RadioIcon, UserXIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatInZone, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/database";
import { joinHref } from "../constants";
import type { AttendanceFlag, AttendanceSummary } from "../queries";

export type LiveRow = {
  session: Session;
  studentName: string;
  studentSeed: string;
  tutorName: string;
  tutorTimezone: string;
  familyTimezone: string;
  attendance: AttendanceSummary;
};

const flagLabel: Record<AttendanceFlag, string> = {
  tutor_late: "Tutor late",
  tutor_no_show: "Tutor not joined",
  student_no_show: "Child not joined",
};

const bounds = (s: Session) => {
  const start = new Date(s.starts_at).getTime();
  return { start, end: start + s.duration_min * 60_000 };
};

export function LiveBoard({ rows, timezone, now }: { rows: LiveRow[]; timezone: string; now: number }) {
  const live = rows.filter((r) => {
    const { start, end } = bounds(r.session);
    return start <= now && now <= end && r.session.status !== "cancelled";
  });
  const soon = rows.filter((r) => {
    const { start } = bounds(r.session);
    return start > now && start - now <= 2 * 3_600_000 && r.session.status === "scheduled";
  });
  const flagged = rows
    .filter((r) => bounds(r.session).end < now && r.attendance.flags.length)
    .sort((a, b) => b.session.starts_at.localeCompare(a.session.starts_at));

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <RadioIcon className="size-5 text-coral" /> In progress
          <Badge variant="secondary" className="rounded-full">{live.length}</Badge>
        </h2>
        {live.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {live.map((row) => (
              <LiveCard key={row.session.id} row={row} timezone={timezone} now={now} />
            ))}
          </div>
        ) : (
          <EmptyState icon={RadioIcon} title="No classes in progress" description="Classes appear here from their start time until they end." />
        )}
      </section>

      {soon.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold">Starting within 2 hours</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {soon.map((row) => (
              <LiveCard key={row.session.id} row={row} timezone={timezone} now={now} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <AlarmClockIcon className="size-5 text-warning" /> Flags from the last 7 days
        </h2>
        {flagged.length ? (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When ({shortZone(timezone)})</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Tutor joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flagged.map(({ session, studentName, tutorName, attendance }) => (
                    <TableRow key={session.id}>
                      <TableCell className="whitespace-nowrap">{formatInZone(session.starts_at, timezone, "EEE d MMM, h:mm a")}</TableCell>
                      <TableCell>{session.subject} · {studentName}</TableCell>
                      <TableCell>{tutorName}</TableCell>
                      <TableCell className="space-x-1">
                        {attendance.flags.map((f) => (
                          <FlagBadge key={f} flag={f} minutes={attendance.tutorLateByMin} />
                        ))}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {attendance.tutorJoinedAt ? formatInZone(attendance.tutorJoinedAt, timezone, "h:mm a") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <EmptyState icon={CheckCircle2Icon} title="No issues this week" description="Every class started on time with both sides present." />
        )}
      </section>
    </div>
  );
}

function LiveCard({ row, timezone, now }: { row: LiveRow; timezone: string; now: number }) {
  const { session, attendance } = row;
  const { start, end } = bounds(session);
  const inProgress = start <= now && now <= end;
  const progress = inProgress ? Math.round(((now - start) / (end - start)) * 100) : 0;

  return (
    <Card className={cn("gap-4 p-5", inProgress && "border-coral/40 shadow-lg shadow-coral/5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={row.studentName} seed={row.studentSeed} className="size-11" />
          <div>
            <p className="font-semibold">{session.subject} · {row.studentName}</p>
            <p className="text-sm text-muted-foreground">{session.topic ?? "Lesson"} · with {row.tutorName}</p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-full">
          <Link href={joinHref(session.id)} target="_blank" rel="noreferrer">
            <EyeIcon /> Drop in
          </Link>
        </Button>
      </div>

      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
        <span>You: {formatInZone(session.starts_at, timezone, "h:mm a")} {shortZone(timezone)}</span>
        <span>Tutor: {formatInZone(session.starts_at, row.tutorTimezone, "h:mm a")} {shortZone(row.tutorTimezone)}</span>
        <span>Family: {formatInZone(session.starts_at, row.familyTimezone, "h:mm a")} {shortZone(row.familyTimezone)}</span>
      </div>

      {inProgress && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${progress}% through the lesson`}>
          <div className="h-full rounded-full bg-coral" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Presence label="Tutor" joinedAt={attendance.tutorJoinedAt} timezone={timezone} />
        <Presence label="Family" joinedAt={attendance.familyJoinedAt} timezone={timezone} />
        {attendance.adminJoinedAt && <Presence label="Admin" joinedAt={attendance.adminJoinedAt} timezone={timezone} />}
        {attendance.flags.map((f) => (
          <FlagBadge key={f} flag={f} minutes={attendance.tutorLateByMin} />
        ))}
      </div>
    </Card>
  );
}

function Presence({ label, joinedAt, timezone }: { label: string; joinedAt: string | null; timezone: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        joinedAt ? "bg-success/12 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {joinedAt ? <CheckCircle2Icon className="size-3.5" /> : <CircleDashedIcon className="size-3.5" />}
      {label} {joinedAt ? `joined ${formatInZone(joinedAt, timezone, "h:mm a")}` : "not joined"}
    </span>
  );
}

function FlagBadge({ flag, minutes }: { flag: AttendanceFlag; minutes: number }) {
  const Icon = flag === "tutor_late" ? AlarmClockIcon : UserXIcon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
      <Icon className="size-3.5" />
      {flagLabel[flag]}
      {flag === "tutor_late" && ` ${minutes} min`}
    </span>
  );
}
