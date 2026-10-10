import { CalendarDaysIcon, HistoryIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/features/auth/session";
import { PastSessionCard, UpcomingSessionCard } from "@/features/parent/components/session-cards";
import { getFamily, splitSessions } from "@/features/parent/data";
import { shortZone } from "@/lib/format";

export const metadata = { title: "Sessions" };

export default async function ParentSessionsPage() {
  const user = await requireUser("parent");
  const { children, sessions, people, now } = await getFamily(user.id);
  const byId = Object.fromEntries(children.map((c) => [c.id, c]));
  const { upcoming, past } = splitSessions(sessions, now);
  const unrated = past.filter((s) => s.status === "completed" && !s.parent_rating).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Timetable"
        title="Sessions"
        description={`Every lesson for your family, shown in your timezone (${shortZone(user.timezone)}). Tutors see the same lesson in theirs.`}
      />

      <Tabs defaultValue="upcoming" className="gap-6">
        <TabsList className="rounded-full p-1 group-data-horizontal/tabs:h-11">
          <TabsTrigger value="upcoming" className="rounded-full px-4">
            Upcoming <span className="text-muted-foreground tabular-nums">({upcoming.length})</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-full px-4">
            Past
            {unrated > 0 && (
              <span className="rounded-full bg-coral px-1.5 text-[11px] font-semibold text-white tabular-nums" aria-label={`${unrated} to rate`}>
                {unrated}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length ? (
            upcoming.map((s) => (
              <UpcomingSessionCard key={s.id} session={s} child={byId[s.student_id]} tutor={people[s.tutor_id]} timezone={user.timezone} />
            ))
          ) : (
            <EmptyState icon={CalendarDaysIcon} title="No upcoming lessons" description="Once lessons are booked they'll show up here with a Join button." />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length ? (
            <>
              {unrated > 0 && (
                <p className="text-sm text-muted-foreground">
                  Ratings help tutors know what&apos;s working — it takes two seconds.
                </p>
              )}
              {past.map((s) => (
                <PastSessionCard key={s.id} session={s} child={byId[s.student_id]} tutor={people[s.tutor_id]} timezone={user.timezone} />
              ))}
            </>
          ) : (
            <EmptyState icon={HistoryIcon} title="No past lessons yet" description="Notes, homework and ratings will build up here after each lesson." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
