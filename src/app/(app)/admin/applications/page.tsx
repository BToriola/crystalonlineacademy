import { PageHeader } from "@/components/shared/page-header";
import { ApplicationsBoard } from "@/features/admin/components/applications/applications-board";
import { listApplications } from "@/features/applications/queries";
import { requireUser } from "@/features/auth/session";

export const metadata = { title: "Tutor applications" };

export default async function AdminApplicationsPage() {
  const user = await requireUser("admin");
  const applications = await listApplications();
  const inProgress = applications.filter((a) => a.status !== "approved" && a.status !== "rejected").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pipeline"
        title="Tutor applications"
        description={`${inProgress} ${inProgress === 1 ? "applicant is" : "applicants are"} moving through vetting. Open a card to score, add notes or move them to the next stage.`}
      />
      <ApplicationsBoard applications={applications} timezone={user.timezone} />
    </div>
  );
}
