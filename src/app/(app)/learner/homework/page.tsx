import { BookOpenCheckIcon, SmileIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/session";
import { HomeworkList } from "@/features/learner/components/homework-list";
import { getLearnerSpace } from "@/features/learner/data";

export const metadata = { title: "Homework" };

export default async function LearnerHomeworkPage() {
  const user = await requireUser("student");
  const space = await getLearnerSpace(user);
  if (!space) {
    return <EmptyState icon={SmileIcon} title="Your space is nearly ready" description="Ask your grown-up to link your account — then your homework will appear here." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Homework"
        title={
          <>
            Your <Script>to-do</Script> list
          </>
        }
        description="Tap a task when you've finished it. Your tutor will see it straight away!"
      />
      {space.homework.length ? (
        <HomeworkList items={space.homework} />
      ) : (
        <EmptyState icon={BookOpenCheckIcon} title="No homework yet" description="When your tutor sets homework after a lesson, it'll pop up here." />
      )}
    </div>
  );
}
