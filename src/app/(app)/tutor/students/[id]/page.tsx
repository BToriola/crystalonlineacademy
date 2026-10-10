import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarClockIcon,
  ChartLineIcon,
  CheckIcon,
  ClipboardPenIcon,
  FlameIcon,
  GlobeIcon,
  HeartIcon,
  LightbulbIcon,
  MessageCircleIcon,
  StarIcon,
  VideoIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/session";
import { listConversations } from "@/features/messaging/queries";
import { ReportStatusBadge } from "@/features/reports/components/report-status-badge";
import { listReports } from "@/features/reports/queries";
import { listSessions } from "@/features/sessions/queries";
import { ClassLinkPanel } from "@/features/tutor/components/class-link-panel";
import { getTutorRoster } from "@/features/tutor/data";
import { curriculumFlag, curriculumLabel, nowMs, studentName, weekOffsetFor, zoneCity } from "@/features/tutor/utils";
import { formatInZone, friendlyDateTime, shortZone } from "@/lib/format";

export const metadata: Metadata = { title: "Student" };

export default async function TutorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("tutor", "admin");
  const tz = user.timezone;
  const roster = await getTutorRoster(user.id);
  const student = roster.studentById[id];
  if (!student) notFound();

  const [sessions, reports, conversations] = await Promise.all([
    listSessions({ tutorId: user.id, studentIds: [id] }),
    listReports({ tutorId: user.id, studentIds: [id] }),
    listConversations(user.id),
  ]);

  const name = studentName(student);
  const classAssignments = roster.assignments.filter((a) => a.student_id === id && a.status !== "ended");
  const parent = roster.parents[student.parent_id];
  const conversation = conversations.find((c) => c.student_id === id) ?? conversations.find((c) => c.parent_id === student.parent_id);
  const now = nowMs();
  const upcoming = sessions.filter((s) => s.status === "scheduled" && new Date(s.starts_at).getTime() > now - s.duration_min * 60_000);
  const history = sessions.filter((s) => !upcoming.includes(s)).reverse();

  return (
    <>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full text-muted-foreground">
          <Link href="/tutor/students">
            <ArrowLeftIcon /> All students
          </Link>
        </Button>

        <header className="slab flex flex-col gap-6 bg-sky/40 p-6 sm:flex-row sm:items-center sm:p-8 dark:bg-sky/10">
          <UserAvatar name={name} seed={student.avatar_seed} className="size-20 ring-4 ring-background sm:size-24" />
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
            <p className="text-muted-foreground">
              <span role="img" aria-label={curriculumLabel[student.curriculum]}>
                {curriculumFlag[student.curriculum]}
              </span>{" "}
              {student.year_group} · {(roster.subjectsByStudent[id] ?? []).join(", ")}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-sun/30 px-3 py-1 font-semibold text-ink dark:text-sun">
                <StarIcon className="size-3.5 fill-current" /> {student.stars} stars
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-coral/12 px-3 py-1 font-semibold text-coral">
                <FlameIcon className="size-3.5" /> {student.streak_days}-day streak
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button asChild className="h-11 rounded-full px-6">
              <Link href={conversation ? `/messages?c=${conversation.id}` : "/messages"}>
                <MessageCircleIcon /> Message {parent ? parent.full_name.split(" ")[0] : "parent"}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full px-6">
              <Link href={`/tutor/reports/new?student=${id}`}>
                <ClipboardPenIcon /> New report
              </Link>
            </Button>
          </div>
        </header>
      </div>

      <div className="grid gap-6 *:min-w-0 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <CalendarClockIcon className="size-5 text-primary" /> Coming up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {upcoming.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium">{friendlyDateTime(s.starts_at, tz)}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {s.subject} · {s.topic ?? "Topic to be set"}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <BookOpenIcon className="size-5 text-leaf" /> Session history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length ? (
                <ol className="space-y-4">
                  {history.map((s) => (
                    <li key={s.id} className="rounded-2xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">
                          {formatInZone(s.starts_at, tz, "EEE d MMM")}{" "}
                          <span className="text-muted-foreground">· {s.subject}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {s.parent_rating && (
                            <span className="inline-flex items-center gap-1 text-xs text-coral" aria-label={`Parent rating ${s.parent_rating} of 5`}>
                              <HeartIcon className="size-3.5 fill-current" /> {s.parent_rating}/5
                            </span>
                          )}
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                      {s.topic && <p className="mt-1 text-sm font-medium">{s.topic}</p>}
                      {s.tutor_notes ? (
                        <p className="mt-2 text-sm text-muted-foreground">{s.tutor_notes}</p>
                      ) : (
                        s.status === "completed" && (
                          <Link href={`/tutor/schedule?week=${weekOffsetFor(s.starts_at, tz)}&session=${s.id}`} className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline">
                            Add notes for this lesson
                          </Link>
                        )
                      )}
                      {s.homework && (
                        <p className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm">
                          <span className="font-medium">Homework:</span> {s.homework}
                          {s.homework_done && (
                            <Badge variant="secondary" className="ml-auto rounded-full bg-success/12 text-success">
                              <CheckIcon /> Done
                            </Badge>
                          )}
                        </p>
                      )}
                      {s.parent_feedback && <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{s.parent_feedback}&rdquo;</p>}
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState icon={BookOpenIcon} title="No lessons yet" description="Past lessons and your notes will build up here." />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <LightbulbIcon className="size-5 text-sun" /> Learning notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{student.learning_notes ?? "No learning notes yet."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <VideoIcon className="size-5 text-primary" /> Class link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {classAssignments.length ? (
                classAssignments.map((a) => (
                  <ClassLinkPanel
                    key={a.id}
                    assignmentId={a.id}
                    subject={a.subject}
                    meetingUrl={a.meeting_url}
                    approvedAt={a.meeting_url_approved_at}
                    proposedUrl={a.proposed_meeting_url}
                    timezone={tz}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active classes with {student.first_name}.</p>
              )}
            </CardContent>
          </Card>

          {parent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-xl">
                  <GlobeIcon className="size-5 text-primary" /> Family
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{parent.full_name}</p>
                <p className="text-muted-foreground">
                  {zoneCity(parent.timezone)} · {shortZone(parent.timezone)} · it&rsquo;s {formatInZone(new Date(), parent.timezone, "h:mm a")} there now
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <ChartLineIcon className="size-5 text-coral" /> Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length ? (
                <ul className="space-y-2">
                  {reports.map((r) => (
                    <li key={r.id}>
                      <Link href={`/tutor/reports/${r.id}`} className="flex items-center justify-between gap-2 rounded-xl p-2 transition hover:bg-muted">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{r.period_label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {r.subject} · {formatInZone(r.published_at ?? r.created_at, tz, "d MMM yyyy")}
                          </span>
                        </span>
                        <ReportStatusBadge published={!!r.published_at} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No reports yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
