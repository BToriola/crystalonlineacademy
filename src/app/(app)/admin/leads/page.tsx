import { PageHeader } from "@/components/shared/page-header";
import { LeadsBoard } from "@/features/admin/components/leads/leads-board";
import { requireUser } from "@/features/auth/session";
import { listLeads } from "@/features/leads/queries";

export const metadata = { title: "Trial requests" };

export default async function AdminLeadsPage() {
  const user = await requireUser("admin");
  const leads = await listLeads();
  const fresh = leads.filter((l) => l.status === "new").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pipeline"
        title="Trial requests"
        description={
          fresh
            ? `${fresh} new ${fresh === 1 ? "family is" : "families are"} waiting to hear from you. Open a request to see the details, log a call or change its stage.`
            : "Every family that has asked for a free trial. Open a request to see the details, log a call or change its stage."
        }
      />
      <LeadsBoard leads={leads} timezone={user.timezone} />
    </div>
  );
}
