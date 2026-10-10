import Link from "next/link";
import { CalendarSearchIcon, StarIcon, VideoIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Person } from "@/features/admin/components/person";
import { ScheduleSessionDialog } from "@/features/admin/components/sessions/schedule-session-dialog";
import { SessionsFilters } from "@/features/admin/components/sessions/sessions-filters";
import { sessionRanges } from "@/features/admin/components/sessions/types";
import type { MatchOption } from "@/features/admin/components/sessions/types";
import { nowInZone, weekRange, zoneCity } from "@/features/admin/lib/time";
import { sessionStatuses } from "@/features/admin/schemas";
import { listAssignments } from "@/features/assignments/queries";
import { joinHref } from "@/features/attendance/constants";
import { requireUser } from "@/features/auth/session";
import { getProfilesByIds } from "@/features/profiles/queries";
import { listSessions } from "@/features/sessions/queries";
import { listStudents } from "@/features/students/queries";
import { listAllTutors } from "@/features/tutors/queries";
import { formatInZone, shortZone } from "@/lib/format";
import type { Session } from "@/types/database";
import { format, subDays } from "date-fns";

export const metadata = { title: "Sessions" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function rangeFor(range: string, tz: string): { from?: Date; to?: Date } {
  if (range === "next") return weekRange(tz, 1);
  if (range === "past") return { from: subDays(new Date(), 30), to: new Date() };
  if (range === "all") return {};
  return weekRange(tz, 0);
}

export default async function AdminSessionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser("admin");
  const tz = user.timezone;
  const params = await searchParams;

  const rangeParam = pick(params.range) ?? "this";
  const range = sessionRanges.some((r) => r.value === rangeParam) ? rangeParam : "this";
  const statusParam = pick(params.status) ?? "all";
  const status = (sessionStatuses as readonly string[]).includes(statusParam) ? (statusParam as Session["status"]) : "all";
  const tutorParam = pick(params.tutor) ?? "all";
  const lowRated = pick(params.rating) === "low";

  const { from, to } = rangeFor(range, tz);
  const [sessions, tutors, students, assignments] = await Promise.all([
    listSessions({ from, to, status: status === "all" ? undefined : [status], tutorId: tutorParam === "all" ? undefined : tutorParam }),
    listAllTutors(),
    listStudents(),
    listAssignments(),
  ]);
  const parents = await getProfilesByIds(students.map((s) => s.parent_id));

  const tutorById = new Map(tutors.map((t) => [t.id, t]));
  const studentById = new Map(students.map((s) => [s.id, s]));
  const familyTz = (studentId: string) => {
    const s = studentById.get(studentId);
    return (s && parents[s.parent_id]?.timezone) ?? "Europe/London";
  };

  let rows = lowRated ? sessions.filter((s) => s.parent_rating !== null && s.parent_rating <= 3) : sessions;
  if (range === "past") rows = [...rows].reverse();

  const matchOptions: MatchOption[] = assignments
    .filter((a) => a.status === "active")
    .map((a) => {
      const s = studentById.get(a.student_id);
      const t = tutorById.get(a.tutor_id);
      return {
        id: a.id,
        subject: a.subject,
        label: `${s?.first_name ?? "Student"} ${s?.last_name ?? ""} · ${a.subject} with ${t?.full_name ?? "tutor"}`.replace(/\s+·/, " ·"),
        tutorName: t?.full_name ?? "Tutor",
        tutorTimezone: t?.timezone ?? "Africa/Lagos",
        familyTimezone: familyTz(a.student_id),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const tutorFilterOptions = tutors.map((t) => ({ id: t.id, name: t.role === "admin" ? `${t.full_name} (you)` : t.full_name }));
  const counts = {
    scheduled: rows.filter((s) => s.status === "scheduled").length,
    completed: rows.filter((s) => s.status === "completed").length,
  };
  const zoneLabel = shortZone(tz);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy"
        title="Sessions"
        description={`Every lesson across the academy, shown in your time (${zoneLabel}) with the tutor's and family's local times underneath.`}
        actions={<ScheduleSessionDialog matches={matchOptions} timezone={tz} defaultDate={format(nowInZone(tz), "yyyy-MM-dd")} />}
      />

      <div className="space-y-4">
        <SessionsFilters values={{ range, status, tutor: tutorParam, rating: lowRated ? "low" : undefined }} tutors={tutorFilterOptions} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {rows.length} {rows.length === 1 ? "session" : "sessions"} · {counts.scheduled} scheduled · {counts.completed} completed
          {lowRated && (
            <>
              {" "}
              · showing low-rated only{" "}
              <Link href="/admin/sessions?range=past" className="text-primary hover:underline">
                (clear)
              </Link>
            </>
          )}
        </p>

        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          {rows.length ? (
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">When ({zoneLabel})</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => {
                  const tutor = tutorById.get(s.tutor_id);
                  const student = studentById.get(s.student_id);
                  const tutorTz = tutor?.timezone ?? "Africa/Lagos";
                  const famTz = familyTz(s.student_id);
                  const at = new Date(s.starts_at);
                  const studentName = student ? `${student.first_name} ${student.last_name ?? ""}`.trim() : "Student";
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="py-3 pl-5">
                        <p className="font-medium">{formatInZone(s.starts_at, tz, "EEE d MMM, h:mm a")}</p>
                        <p className="text-xs text-muted-foreground">
                          Tutor {formatInZone(s.starts_at, tutorTz, "h:mm a")} {shortZone(tutorTz, at)} · Family{" "}
                          {formatInZone(s.starts_at, famTz, "h:mm a")} {shortZone(famTz, at)}
                          <span className="sr-only"> ({zoneCity(famTz)})</span> · {s.duration_min} min
                        </p>
                      </TableCell>
                      <TableCell>
                        <Person name={studentName} seed={student?.avatar_seed} sub={student?.year_group} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm">{tutor?.full_name ?? "Tutor"}</TableCell>
                      <TableCell>
                        <p className="font-medium">{s.subject}</p>
                        {s.topic && <p className="max-w-56 truncate text-xs text-muted-foreground">{s.topic}</p>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>
                        {s.parent_rating ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                tabIndex={0}
                                className={
                                  s.parent_rating <= 3
                                    ? "inline-flex items-center gap-1 rounded-full bg-coral/12 px-2 py-0.5 text-xs font-semibold text-coral"
                                    : "inline-flex items-center gap-1 rounded-full bg-sun/25 px-2 py-0.5 text-xs font-semibold text-ink dark:text-sun"
                                }
                              >
                                <StarIcon className="size-3 fill-current" aria-hidden />
                                {s.parent_rating}/5
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64">{s.parent_feedback ?? "No written feedback."}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        {s.status === "scheduled" && (
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <a href={joinHref(s.id)} target="_blank" rel="noreferrer">
                              <VideoIcon data-icon="inline-start" />
                              Drop in
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <CalendarSearchIcon className="size-8 text-muted-foreground" />
              <p className="font-medium">No sessions match these filters</p>
              <p className="text-sm text-muted-foreground">Try another week, status or tutor.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
