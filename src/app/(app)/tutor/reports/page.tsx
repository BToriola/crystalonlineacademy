import type { Metadata } from "next";
import Link from "next/link";
import { ChartLineIcon, ChevronRightIcon, FilePenLineIcon, PlusIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { ReportStatusBadge } from "@/features/reports/components/report-status-badge";
import { listReports } from "@/features/reports/queries";
import { getTutorRoster } from "@/features/tutor/data";
import { studentName } from "@/features/tutor/utils";
import { formatInZone } from "@/lib/format";
import type { ProgressReport } from "@/types/database";

export const metadata: Metadata = { title: "Progress reports" };

export default async function TutorReportsPage() {
  const user = await requireUser("tutor", "admin");
  const tz = user.timezone;
  const [roster, reports] = await Promise.all([getTutorRoster(user.id), listReports({ tutorId: user.id })]);
  const drafts = reports.filter((r) => !r.published_at);
  const published = reports.filter((r) => r.published_at);

  const renderList = (items: ProgressReport[]) => (
    <ul className="divide-y overflow-hidden rounded-3xl border bg-card">
      {items.map((r) => {
        const student = roster.studentById[r.student_id];
        const name = student ? studentName(student) : "Former student";
        return (
          <li key={r.id}>
            <Link
              href={`/tutor/reports/${r.id}`}
              className="flex items-center gap-4 p-4 transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none sm:px-5"
            >
              <UserAvatar name={name} seed={student?.avatar_seed} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {name} <span className="text-muted-foreground">· {r.subject}</span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {r.period_label} · {r.published_at ? `Published ${formatInZone(r.published_at, tz, "d MMM yyyy")}` : `Started ${formatInZone(r.created_at, tz, "d MMM")}`}
                </p>
              </div>
              <ReportStatusBadge published={!!r.published_at} className="hidden sm:inline-flex" />
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <PageHeader
        eyebrow="Progress reports"
        title="Show families the progress"
        description="Clear, friendly reports parents can read in two minutes. Drafts stay private until you publish."
        actions={
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/tutor/reports/new">
              <PlusIcon /> New report
            </Link>
          </Button>
        }
      />

      {reports.length === 0 ? (
        <EmptyState icon={ChartLineIcon} title="No reports yet" description="Your first report takes about ten minutes — the live preview shows exactly what families will see.">
          <Button asChild className="rounded-full">
            <Link href="/tutor/reports/new">
              <PlusIcon /> Write a report
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {drafts.length > 0 && (
            <section className="space-y-3" aria-labelledby="drafts-heading">
              <h2 id="drafts-heading" className="flex items-center gap-2 font-display text-xl font-bold">
                <FilePenLineIcon className="size-5 text-sun" /> Drafts <span className="text-base font-medium text-muted-foreground">({drafts.length})</span>
              </h2>
              {renderList(drafts)}
            </section>
          )}
          <section className="space-y-3" aria-labelledby="published-heading">
            <h2 id="published-heading" className="flex items-center gap-2 font-display text-xl font-bold">
              <ChartLineIcon className="size-5 text-leaf" /> Published <span className="text-base font-medium text-muted-foreground">({published.length})</span>
            </h2>
            {published.length ? renderList(published) : <p className="text-sm text-muted-foreground">Nothing published yet.</p>}
          </section>
        </div>
      )}
    </>
  );
}
