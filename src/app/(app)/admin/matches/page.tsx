import { HandshakeIcon, LinkIcon, VideoIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LinkApprovals, type PendingLink } from "@/features/admin/components/matches/link-approvals";
import { MatchActions } from "@/features/admin/components/matches/match-actions";
import { NewMatchDialog } from "@/features/admin/components/matches/new-match-dialog";
import type { StudentOption, TutorOption } from "@/features/admin/components/matches/types";
import { Person } from "@/features/admin/components/person";
import { listAssignments } from "@/features/assignments/queries";
import { requireUser } from "@/features/auth/session";
import { listStudents } from "@/features/students/queries";
import { listAllTutors } from "@/features/tutors/queries";
import { subjects as catalogSubjects } from "@/config/site";
import { formatInZone } from "@/lib/format";


export const metadata = { title: "Matches" };

const statusOrder = { active: 0, paused: 1, ended: 2 } as const;

export default async function AdminMatchesPage() {
  const user = await requireUser("admin");
  const [assignments, students, tutors] = await Promise.all([listAssignments(), listStudents(), listAllTutors()]);

  const activeByTutor = new Map<string, Set<string>>();
  for (const a of assignments) {
    if (a.status !== "active") continue;
    activeByTutor.set(a.tutor_id, (activeByTutor.get(a.tutor_id) ?? new Set()).add(a.student_id));
  }

  const studentOptions: StudentOption[] = students.map((s) => ({
    id: s.id,
    name: [s.first_name, s.last_name].filter(Boolean).join(" "),
    yearGroup: s.year_group,
    seed: s.avatar_seed,
  }));
  const tutorOptions: TutorOption[] = tutors
    .map((t) => ({
      id: t.id,
      name: t.full_name,
      subjects: t.tutor.subjects,
      activeStudents: activeByTutor.get(t.id)?.size ?? 0,
      rating: Number(t.tutor.rating),
      isFounder: t.role === "admin",
      seed: t.id.replace("u-tutor-", ""),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const subjectOptions = [...new Set([...catalogSubjects, ...tutors.flatMap((t) => t.tutor.subjects)])];

  const studentById = new Map(studentOptions.map((s) => [s.id, s]));
  const tutorById = new Map(tutorOptions.map((t) => [t.id, t]));
  const rows = [...assignments].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || b.created_at.localeCompare(a.created_at));
  const activeCount = assignments.filter((a) => a.status === "active").length;
  const pendingLinks: PendingLink[] = assignments
    .filter((a) => a.status !== "ended" && a.proposed_meeting_url && a.proposed_meeting_url !== a.meeting_url)
    .map((a) => ({
      id: a.id,
      studentName: studentById.get(a.student_id)?.name ?? "Unknown student",
      tutorName: tutorById.get(a.tutor_id)?.name ?? "Unknown tutor",
      subject: a.subject,
      currentUrl: a.meeting_url,
      proposedUrl: a.proposed_meeting_url ?? "",
    }));
  const weeklySessions = assignments.filter((a) => a.status === "active").reduce((s, a) => s + a.sessions_per_week, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy"
        title="Matches"
        description={`${activeCount} active pairings delivering ${weeklySessions} sessions a week. Each match links one child, one tutor and one subject.`}
        actions={<NewMatchDialog students={studentOptions} tutors={tutorOptions} subjects={subjectOptions} />}
      />

      <LinkApprovals items={pendingLinks} />

      {rows.length ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-5">Student</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Per week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meeting link</TableHead>
                <TableHead>Since</TableHead>
                <TableHead className="pr-5 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const student = studentById.get(a.student_id);
                const tutor = tutorById.get(a.tutor_id);
                const studentName = student?.name ?? "Unknown student";
                const tutorName = tutor?.name ?? "Unknown tutor";
                return (
                  <TableRow key={a.id} className={a.status === "ended" ? "opacity-60" : undefined}>
                    <TableCell className="py-3 pl-5">
                      <Person name={studentName} seed={student?.seed} sub={student?.yearGroup} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Person name={tutorName} seed={tutor?.seed} size="sm" />
                        {tutor?.isFounder && <Badge className="rounded-full border-0 bg-coral/12 text-coral">You</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{a.subject}</TableCell>
                    <TableCell className="text-center tabular-nums">{a.sessions_per_week}×</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>
                      {a.meeting_url ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="outline" size="sm" className="rounded-full">
                              <a href={a.meeting_url} target="_blank" rel="noreferrer">
                                <VideoIcon data-icon="inline-start" />
                                {meetLabel(a.meeting_url)}
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {a.meeting_url}
                            <br />
                            {a.meeting_url_approved_at
                              ? `Approved ${formatInZone(a.meeting_url_approved_at, user.timezone, "d MMM yyyy")}`
                              : "Set by the academy"}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <LinkIcon className="size-3.5" />
                          Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatInZone(`${a.started_on}T12:00:00Z`, user.timezone, "d MMM yyyy")}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <MatchActions id={a.id} status={a.status} label={`${studentName} · ${a.subject}`} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={HandshakeIcon} title="No matches yet" description="Create your first match to pair a child with a tutor." />
      )}
    </div>
  );
}

function meetLabel(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname === "meet.google.com" ? pathname.slice(1) : hostname.replace(/^www\./, "");
  } catch {
    return "Open link";
  }
}
