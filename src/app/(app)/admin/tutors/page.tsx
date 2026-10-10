import Link from "next/link";
import { ExternalLinkIcon, GraduationCapIcon, StarIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SubjectChips } from "@/features/admin/components/detail-list";
import { Person } from "@/features/admin/components/person";
import { PunctualityCell } from "@/features/attendance/components/punctuality-cell";
import { PublishSwitch } from "@/features/admin/components/tutors/publish-switch";
import { flagFor } from "@/features/admin/lib/labels";
import { listAssignments } from "@/features/assignments/queries";
import { punctualityByTutor } from "@/features/attendance/punctuality";
import { requireUser } from "@/features/auth/session";
import { InviteStaffDialog } from "@/features/staff/components/invite-staff-dialog";
import { PendingInvites } from "@/features/staff/components/pending-invites";
import { listPendingInvites } from "@/features/staff/queries";
import { listAllTutors } from "@/features/tutors/queries";
import { formatInZone, formatMoney, shortZone } from "@/lib/format";

export const metadata = { title: "Tutors" };

export default async function AdminTutorsPage() {
  await requireUser("admin");
  const [tutors, assignments, punctuality, invites] = await Promise.all([
    listAllTutors(),
    listAssignments(),
    punctualityByTutor(),
    listPendingInvites(),
  ]);

  const studentsByTutor = new Map<string, Set<string>>();
  for (const a of assignments) {
    if (a.status !== "active") continue;
    const set = studentsByTutor.get(a.tutor_id) ?? new Set<string>();
    set.add(a.student_id);
    studentsByTutor.set(a.tutor_id, set);
  }

  // Founder first, then busiest tutors.
  const sorted = [...tutors].sort((a, b) => {
    if (a.role === "admin" !== (b.role === "admin")) return a.role === "admin" ? -1 : 1;
    return (studentsByTutor.get(b.id)?.size ?? 0) - (studentsByTutor.get(a.id)?.size ?? 0) || a.full_name.localeCompare(b.full_name);
  });

  const published = tutors.filter((t) => t.tutor.is_published).length;
  const avgRating = tutors.length ? tutors.reduce((s, t) => s + Number(t.tutor.rating), 0) / tutors.length : 0;
  const withCapacity = tutors.filter((t) => (studentsByTutor.get(t.id)?.size ?? 0) < 2).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy"
        title="Tutors"
        description="Everyone teaching at Crystal — including you. Toggle who appears on the public tutors page."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/applications">
                <UserPlusIcon data-icon="inline-start" />
                Review applicants
              </Link>
            </Button>
            <InviteStaffDialog />
          </>
        }
      />

      <PendingInvites invites={invites} />

      <section aria-label="Team summary" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="On the team" value={tutors.length} hint={`${published} visible on the website`} icon={GraduationCapIcon} className="rounded-2xl" />
        <StatCard label="Average rating" value={avgRating.toFixed(2)} hint="From parent feedback" icon={StarIcon} tone="sun" className="rounded-2xl" />
        <StatCard label="Room for new students" value={withCapacity} hint="Tutors with fewer than 2 active students" icon={UsersIcon} tone="leaf" className="rounded-2xl" />
      </section>

      <Card className="gap-0 overflow-hidden rounded-2xl py-0">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-5">Tutor</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead className="text-center">Active students</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>On time (30d)</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Local time</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="pr-5 text-right">
                <span className="sr-only">Profile</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((t) => {
              const active = studentsByTutor.get(t.id)?.size ?? 0;
              return (
                <TableRow key={t.id}>
                  <TableCell className="py-3 pl-5">
                    <div className="flex items-center gap-2">
                      <Person
                        name={t.full_name}
                        src={t.avatar_url}
                        seed={t.id.replace("u-tutor-", "")}
                        sub={t.tutor.headline ?? t.tutor.qualification}
                        className="max-w-72"
                      />
                      {t.role === "admin" && <Badge className="rounded-full border-0 bg-coral/12 font-semibold text-coral">Founder</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SubjectChips subjects={t.tutor.subjects} max={2} />
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        active === 0
                          ? "inline-grid size-8 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
                          : "inline-grid size-8 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                      }
                    >
                      {active}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <StarIcon className="size-3.5 fill-sun text-sun" aria-hidden />
                      {Number(t.tutor.rating).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PunctualityCell stats={punctuality.get(t.id)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatMoney(Number(t.tutor.hourly_rate), "GBP")}/hr</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-muted-foreground underline decoration-dotted underline-offset-4">
                          <span aria-hidden className="mr-1">
                            {flagFor(t.country)}
                          </span>
                          {formatInZone(new Date(), t.timezone, "h:mm a")}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t.timezone} ({shortZone(t.timezone)})
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <PublishSwitch tutorId={t.id} name={t.full_name} published={t.tutor.is_published} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button asChild variant="ghost" size="sm" className="rounded-full">
                      <Link href={`/tutors/${t.id}`} target="_blank">
                        Profile
                        <ExternalLinkIcon data-icon="inline-end" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
