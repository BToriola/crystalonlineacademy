import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, PencilIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/features/auth/session";
import { ReportForm } from "@/features/reports/components/report-form";
import { ReportStatusBadge } from "@/features/reports/components/report-status-badge";
import { ReportView } from "@/features/reports/components/report-view";
import { getReport } from "@/features/reports/queries";
import { getStudent } from "@/features/students/queries";
import { getTutorRoster, reportStudentOptions } from "@/features/tutor/data";
import { studentName } from "@/features/tutor/utils";
import { formatInZone } from "@/lib/format";

export const metadata: Metadata = { title: "Progress report" };

export default async function TutorReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("tutor", "admin");
  const report = await getReport(id);
  if (!report || report.tutor_id !== user.id) notFound();

  const roster = await getTutorRoster(user.id);
  const student = roster.studentById[report.student_id] ?? (await getStudent(report.student_id));
  const options = reportStudentOptions(roster);
  if (student && !options.some((o) => o.id === student.id)) {
    options.push({ id: student.id, name: studentName(student), yearGroup: student.year_group, subjects: [report.subject] });
  }
  const name = student ? studentName(student) : "Student";

  return (
    <>
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full text-muted-foreground">
          <Link href="/tutor/reports">
            <ArrowLeftIcon /> All reports
          </Link>
        </Button>
        <PageHeader
          eyebrow={report.period_label}
          title={`${name} · ${report.subject}`}
          description={
            report.published_at
              ? `Published ${formatInZone(report.published_at, user.timezone, "d MMMM yyyy, h:mm a")} — visible to the family.`
              : "Draft — only you and the academy team can see this."
          }
          actions={<ReportStatusBadge published={!!report.published_at} className="h-7 px-3 text-sm" />}
        />
      </div>

      <Tabs defaultValue={report.published_at ? "view" : "edit"} className="gap-6">
        <TabsList className="h-10 rounded-full p-1">
          <TabsTrigger value="view" className="rounded-full px-4">
            <EyeIcon /> View
          </TabsTrigger>
          <TabsTrigger value="edit" className="rounded-full px-4">
            <PencilIcon /> Edit
          </TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <ReportView report={report} studentName={name} yearGroup={student?.year_group} tutorName={user.full_name} />
        </TabsContent>
        <TabsContent value="edit">
          <ReportForm
            students={options}
            tutorId={user.id}
            tutorName={user.full_name}
            published={!!report.published_at}
            initial={{
              id: report.id,
              student_id: report.student_id,
              subject: report.subject,
              period_label: report.period_label,
              current_focus: report.current_focus,
              curriculum_ref: report.curriculum_ref ?? "",
              next_assessment: report.next_assessment ?? "",
              skills: report.skills.length ? report.skills : [{ name: "", status: "improving" }],
              roadmap: report.roadmap.length ? report.roadmap : [{ title: "", status: "current" }],
              recommendation: report.recommendation,
              attendance_rate: report.attendance_rate,
              effort_score: report.effort_score,
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
