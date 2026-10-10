import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { ReportForm } from "@/features/reports/components/report-form";
import { getTutorRoster, reportStudentOptions } from "@/features/tutor/data";

export const metadata: Metadata = { title: "New report" };

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ student?: string }> }) {
  const user = await requireUser("tutor", "admin");
  const { student } = await searchParams;
  const roster = await getTutorRoster(user.id);
  const options = reportStudentOptions(roster);
  const preselected = options.find((o) => o.id === student);

  return (
    <>
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full text-muted-foreground">
          <Link href="/tutor/reports">
            <ArrowLeftIcon /> All reports
          </Link>
        </Button>
        <PageHeader
          eyebrow="New progress report"
          title={preselected ? `Report for ${preselected.name.split(" ")[0]}` : "Write a progress report"}
          description="Save a draft any time. When you publish, the family sees it on their dashboard straight away."
        />
      </div>

      {options.length ? (
        <ReportForm students={options} tutorId={user.id} tutorName={user.full_name} defaultStudentId={preselected?.id} />
      ) : (
        <EmptyState icon={UsersIcon} title="No students to report on" description="Reports become available once you're matched with a student." />
      )}
    </>
  );
}
