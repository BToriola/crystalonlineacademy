import type { Metadata } from "next";
import { GlobeIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/session";
import { AvailabilityEditor } from "@/features/availability/components/availability-editor";
import { getAvailability } from "@/features/availability/queries";
import { zoneCity } from "@/features/tutor/utils";
import { shortZone } from "@/lib/format";

export const metadata: Metadata = { title: "Availability" };

export default async function TutorAvailabilityPage() {
  const user = await requireUser("tutor", "admin");
  const slots = await getAvailability(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Availability"
        title="When can you teach?"
        description={`Set your regular weekly hours in your own time (${zoneCity(user.timezone)}, ${shortZone(user.timezone)}). We use these to match you with new families.`}
      />

      <div className="flex items-start gap-3 rounded-3xl bg-sky/40 p-4 text-sm dark:bg-sky/10">
        <GlobeIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p>
          Under each slot you&rsquo;ll see what that time is for families in the UK, Toronto and Vancouver. After-school hours there
          (roughly 4–8pm) are the most requested — clocks change on different dates, so we always use the next real date to work it out.
        </p>
      </div>

      <AvailabilityEditor
        initial={slots.map(({ weekday, start_time, end_time }) => ({ weekday, start_time, end_time }))}
        timezone={user.timezone}
      />
    </>
  );
}
