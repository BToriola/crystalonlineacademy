import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClockIcon, ChartLineIcon, StarIcon, UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/features/auth/session";
import { listReports } from "@/features/reports/queries";
import { listSessions } from "@/features/sessions/queries";
import { getTutorRoster } from "@/features/tutor/data";
import { curriculumFlag, curriculumLabel, studentName, zoneCity } from "@/features/tutor/utils";
import { formatInZone, friendlyDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "My students" };

export default async function TutorStudentsPage() {
  const user = await requireUser("tutor", "admin");
  const tz = user.timezone;
  const [roster, upcoming, reports] = await Promise.all([
    getTutorRoster(user.id),
    listSessions({ tutorId: user.id, from: new Date(), status: ["scheduled"] }),
    listReports({ tutorId: user.id }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="My students"
        title="The learners in your care"
        description={`${roster.students.length} student${roster.students.length === 1 ? "" : "s"} matched with you. Open a card for notes, history and reports.`}
      />

      {roster.students.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roster.students.map((s) => {
            const name = studentName(s);
            const next = upcoming.find((x) => x.student_id === s.id);
            const lastReport = reports.find((r) => r.student_id === s.id);
            const parent = roster.parents[s.parent_id];
            const linkPending = roster.assignments.some((a) => a.student_id === s.id && a.status !== "ended" && a.proposed_meeting_url);
            return (
              <li key={s.id}>
                <Link
                  href={`/tutor/students/${s.id}`}
                  className="group flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar name={name} seed={s.avatar_seed} className="size-14" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-display text-xl font-bold group-hover:text-primary">{name}</h2>
                      <p className="text-sm text-muted-foreground">
                        <span role="img" aria-label={curriculumLabel[s.curriculum]}>
                          {curriculumFlag[s.curriculum]}
                        </span>{" "}
                        {s.year_group}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sun/25 px-2.5 py-1 text-sm font-semibold text-ink dark:text-sun">
                      <StarIcon className="size-3.5 fill-current" /> {s.stars}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(roster.subjectsByStudent[s.id] ?? []).map((subject) => (
                      <Badge key={subject} variant="secondary" className="rounded-full">
                        {subject}
                      </Badge>
                    ))}
                    {linkPending && (
                      <Badge variant="secondary" className="rounded-full bg-sun/25 text-ink dark:text-sun">
                        Class link awaiting approval
                      </Badge>
                    )}
                  </div>

                  {s.learning_notes && <p className="line-clamp-3 text-sm text-muted-foreground">{s.learning_notes}</p>}

                  <dl className="mt-auto grid gap-2 border-t pt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <dt>
                        <CalendarClockIcon className="size-4 text-primary" aria-label="Next session" />
                      </dt>
                      <dd className="truncate">{next ? `${friendlyDateTime(next.starts_at, tz)} · ${next.subject}` : "No upcoming session"}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt>
                        <ChartLineIcon className="size-4 text-coral" aria-label="Last report" />
                      </dt>
                      <dd className="truncate">
                        {lastReport
                          ? `Last report ${formatInZone(lastReport.published_at ?? lastReport.created_at, tz, "d MMM")}${lastReport.published_at ? "" : " (draft)"}`
                          : "No reports yet"}
                      </dd>
                    </div>
                    {parent && (
                      <div className="flex gap-1 text-xs text-muted-foreground">
                        <dt>Family:</dt>
                        <dd className="truncate">
                          {parent.full_name} · {zoneCity(parent.timezone)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={UsersIcon} title="No students yet" description="Once the academy matches you with a family, your students will appear here." />
      )}
    </>
  );
}
