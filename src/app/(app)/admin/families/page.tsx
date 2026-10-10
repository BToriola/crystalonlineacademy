import Link from "next/link";
import { MailIcon, StarIcon, UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubjectChips } from "@/features/admin/components/detail-list";
import { flagFor } from "@/features/admin/lib/labels";
import { zoneCity } from "@/features/admin/lib/time";
import { listAssignments } from "@/features/assignments/queries";
import { requireUser } from "@/features/auth/session";
import { listInvoices } from "@/features/billing/queries";
import { listParents } from "@/features/profiles/queries";
import { listStudents } from "@/features/students/queries";
import { listAllTutors } from "@/features/tutors/queries";
import { formatInZone, formatMoney, shortZone } from "@/lib/format";
import type { Student } from "@/types/database";

export const metadata = { title: "Families" };

export default async function AdminFamiliesPage() {
  await requireUser("admin");
  const [parents, students, assignments, tutors, invoices] = await Promise.all([
    listParents(),
    listStudents(),
    listAssignments(),
    listAllTutors(),
    listInvoices(),
  ]);

  const childrenByParent = new Map<string, Student[]>();
  for (const s of students) childrenByParent.set(s.parent_id, [...(childrenByParent.get(s.parent_id) ?? []), s]);
  const tutorName = Object.fromEntries(tutors.map((t) => [t.id, t.full_name]));
  const liveMatches = assignments.filter((a) => a.status !== "ended");
  const now = new Date();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy"
        title="Families"
        description={`${parents.length} families and ${students.length} children across the UK and Canada. Expand a family to see each child and who teaches them.`}
      />

      {parents.length ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,2fr)_1rem] gap-4 border-b bg-muted/40 px-5 py-2.5 text-sm font-medium md:grid">
            <span>Family</span>
            <span>Location</span>
            <span>Children</span>
            <span>Active subjects</span>
            <span />
          </div>
          <Accordion type="multiple">
            {parents.map((parent) => {
              const kids = childrenByParent.get(parent.id) ?? [];
              const kidIds = new Set(kids.map((k) => k.id));
              const matches = liveMatches.filter((a) => kidIds.has(a.student_id));
              const subjects = [...new Set(matches.filter((a) => a.status === "active").map((a) => a.subject))];
              const owed = invoices.filter((i) => i.parent_id === parent.id && (i.status === "sent" || i.status === "overdue"));

              return (
                <AccordionItem key={parent.id} value={parent.id}>
                  <AccordionTrigger className="items-center rounded-none px-5 py-4 hover:bg-muted/40 hover:no-underline focus-visible:ring-inset">
                    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,2fr)] md:items-center md:gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar name={parent.full_name} src={parent.avatar_url} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{parent.full_name}</p>
                          <p className="truncate text-xs font-normal text-muted-foreground">{parent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-normal">
                        <span className="text-lg leading-none" role="img" aria-label={parent.country === "CA" ? "Canada" : parent.country === "UK" ? "United Kingdom" : parent.country}>
                          {flagFor(parent.country)}
                        </span>
                        <span>
                          {zoneCity(parent.timezone)}
                          <span className="block text-xs text-muted-foreground">
                            {formatInZone(now, parent.timezone, "h:mm a")} {shortZone(parent.timezone, now)}
                          </span>
                        </span>
                      </div>
                      <div className="text-sm font-normal">
                        <span className="md:hidden">Children: </span>
                        <span className="font-medium">{kids.length}</span>
                        {kids.length > 0 && <span className="text-muted-foreground"> · {kids.map((k) => k.first_name).join(", ")}</span>}
                      </div>
                      <div className="font-normal">
                        {subjects.length ? <SubjectChips subjects={subjects} max={3} /> : <span className="text-sm text-muted-foreground">No active matches</span>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/30 px-5 pt-4 pb-5 [&_a]:no-underline [&_p:not(:last-child)]:mb-0">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <a href={`mailto:${parent.email}`}>
                          <MailIcon data-icon="inline-start" />
                          Email family
                        </a>
                      </Button>
                      {owed.length > 0 && (
                        <span className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                          {owed.length} unpaid {owed.length === 1 ? "invoice" : "invoices"} ·{" "}
                          {owed.map((i) => formatMoney(Number(i.amount), i.currency)).join(" + ")}
                        </span>
                      )}
                    </div>
                    {kids.length ? (
                      <ul className="grid gap-3 lg:grid-cols-2">
                        {kids.map((kid) => {
                          const kidMatches = matches.filter((a) => a.student_id === kid.id);
                          return (
                            <li key={kid.id} className="rounded-2xl border bg-card p-4">
                              <div className="flex items-start gap-3">
                                <UserAvatar name={kid.first_name} seed={kid.avatar_seed} className="size-11" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold">
                                    {kid.first_name} {kid.last_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {kid.year_group} · {kid.curriculum === "uk" ? "UK curriculum" : "Canadian curriculum"}
                                  </p>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-sun/25 px-2 py-0.5 text-xs font-semibold text-ink dark:text-sun">
                                  <StarIcon className="size-3 fill-current" aria-hidden />
                                  {kid.stars}
                                </span>
                              </div>
                              {kid.learning_notes && <p className="mt-3 text-sm text-muted-foreground">{kid.learning_notes}</p>}
                              <ul className="mt-3 space-y-1.5">
                                {kidMatches.length ? (
                                  kidMatches.map((m) => (
                                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                                      <span>
                                        <span className="font-medium">{m.subject}</span>
                                        <span className="text-muted-foreground">
                                          {" "}
                                          with {tutorName[m.tutor_id] ?? "a tutor"} · {m.sessions_per_week}×/week
                                        </span>
                                      </span>
                                      <StatusBadge status={m.status} />
                                    </li>
                                  ))
                                ) : (
                                  <li className="rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground">Not matched with a tutor yet</li>
                                )}
                              </ul>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No children added to this family yet.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      ) : (
        <EmptyState icon={UsersIcon} title="No families yet" description="Families appear here once a trial request is converted.">
          <Button asChild className="rounded-full">
            <Link href="/admin/leads">View trial requests</Link>
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
