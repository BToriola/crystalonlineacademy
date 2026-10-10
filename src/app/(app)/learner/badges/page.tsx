import { SmileIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/session";
import { BadgeTile } from "@/features/learner/components/badge-tile";
import { LevelBar } from "@/features/learner/components/level-bar";
import { getBadges } from "@/features/rewards/queries";
import { getStudentForProfile } from "@/features/students/queries";
import { formatInZone } from "@/lib/format";

export const metadata = { title: "Badges" };

export default async function LearnerBadgesPage() {
  const user = await requireUser("student");
  const student = await getStudentForProfile(user.id);
  if (!student) {
    return <EmptyState icon={SmileIcon} title="Your space is nearly ready" description="Ask your grown-up to link your account — then your badges will appear here." />;
  }

  const badges = await getBadges(student.id);
  const earned = badges.filter((b) => b.earned_at).sort((a, b) => (b.earned_at ?? "").localeCompare(a.earned_at ?? ""));
  const locked = badges.filter((b) => !b.earned_at);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trophy cabinet"
        title={
          <>
            Your <Script>badges</Script>
          </>
        }
        description={`You've unlocked ${earned.length} of ${badges.length} badges. Keep going — every lesson counts!`}
      />

      <LevelBar stars={student.stars} />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[...earned, ...locked].map((b, i) => (
          <BadgeTile
            key={b.key}
            index={i}
            emoji={b.emoji}
            title={b.title}
            description={b.description}
            earnedLabel={b.earned_at ? formatInZone(b.earned_at, user.timezone, "d MMM") : null}
          />
        ))}
      </ul>
    </div>
  );
}
