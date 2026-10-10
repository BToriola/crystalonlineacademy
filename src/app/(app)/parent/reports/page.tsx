import { Suspense } from "react";
import { ChartLineIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/session";
import { PrintButton, ReportFilters } from "@/features/parent/components/report-tools";
import { getFamily } from "@/features/parent/data";
import { getProfilesByIds } from "@/features/profiles/queries";
import { ReportView } from "@/features/reports/components/report-view";
import { listReports } from "@/features/reports/queries";
import { formatInZone } from "@/lib/format";

export const metadata = { title: "Progress reports" };

export default async function ParentReportsPage({ searchParams }: { searchParams: Promise<{ child?: string; subject?: string }> }) {
  const [{ child: childFilter, subject: subjectFilter }, user] = await Promise.all([searchParams, requireUser("parent")]);
  const { children, assignments } = await getFamily(user.id);
  const childIds = children.map((c) => c.id);
  const all = childIds.length ? await listReports({ studentIds: childIds, publishedOnly: true }) : [];
  const tutors = await getProfilesByIds(all.map((r) => r.tutor_id));
  const byId = Object.fromEntries(children.map((c) => [c.id, c]));

  const reports = all
    .filter((r) => (!childFilter || r.student_id === childFilter) && (!subjectFilter || r.subject === subjectFilter))
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  const subjects = [...new Set(all.map((r) => r.subject))].sort();

  const scheduleFor = (studentId: string, tutorId: string, subject: string) => {
    const a = assignments.find((x) => x.student_id === studentId && x.tutor_id === tutorId && x.subject === subject);
    return a ? `${a.sessions_per_week}× a week` : undefined;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Progress"
        title="Progress reports"
        description="Clear, honest updates from your tutors: what's mastered, what's next and how you can help at home."
        actions={reports.length ? <PrintButton /> : undefined}
      />

      {all.length > 0 && (
        <Suspense>
          <ReportFilters kids={children.map((c) => ({ id: c.id, name: c.first_name }))} subjects={subjects} />
        </Suspense>
      )}

      {reports.length ? (
        <div className="space-y-10">
          {reports.map((r) => {
            const child = byId[r.student_id];
            return (
              <section key={r.id} aria-label={`${child?.first_name ?? "Report"} — ${r.subject}`} className="report-print-card space-y-2">
                {r.published_at && (
                  <p className="text-xs text-muted-foreground">Published {formatInZone(r.published_at, user.timezone, "d MMMM yyyy")}</p>
                )}
                <ReportView
                  report={r}
                  studentName={child?.first_name ?? "Your child"}
                  yearGroup={child?.year_group}
                  tutorName={tutors[r.tutor_id]?.full_name ?? "Tutor"}
                  schedule={scheduleFor(r.student_id, r.tutor_id, r.subject)}
                />
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ChartLineIcon}
          title={all.length ? "No reports match those filters" : "No reports yet"}
          description={all.length ? "Try a different child or subject." : "Your tutor publishes a progress report every half-term — you'll see it here first."}
        />
      )}
    </div>
  );
}
