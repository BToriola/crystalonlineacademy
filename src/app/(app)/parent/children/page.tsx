import { UsersIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/session";
import { AddChildDialog } from "@/features/parent/components/add-child-dialog";
import { ChildCard } from "@/features/parent/components/child-card";
import { getFamily, tutorsFor } from "@/features/parent/data";

export const metadata = { title: "My children" };

export default async function ParentChildrenPage() {
  const user = await requireUser("parent");
  const family = await getFamily(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Family"
        title="My children"
        description="Each child gets their own hand-picked tutor, timetable and progress reports."
        actions={family.children.length ? <AddChildDialog /> : undefined}
      />

      {family.children.length ? (
        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {family.children.map((child) => (
            <StaggerItem key={child.id} className="space-y-2">
              <ChildCard
                child={child}
                tutors={tutorsFor(child.id, family).map(({ assignment, tutor }) => ({ subject: assignment.subject, tutor }))}
              />
              {child.learning_notes && <p className="px-2 text-sm text-muted-foreground">{child.learning_notes}</p>}
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState icon={UsersIcon} title="No children added yet" description="Add your child and our team will match them with the right tutor within 48 hours.">
          <AddChildDialog />
        </EmptyState>
      )}
    </div>
  );
}
