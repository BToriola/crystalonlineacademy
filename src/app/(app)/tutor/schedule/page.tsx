import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { listSessions } from "@/features/sessions/queries";
import { ScheduleBoard, type ScheduleDay } from "@/features/tutor/components/schedule-board";
import { getTutorRoster } from "@/features/tutor/data";
import { dayKey, nowMs, studentName, weekInZone, zoneCity } from "@/features/tutor/utils";
import { formatInZone, shortZone } from "@/lib/format";

export const metadata: Metadata = { title: "Schedule" };

export default async function TutorSchedulePage({ searchParams }: { searchParams: Promise<{ week?: string; session?: string }> }) {
  const user = await requireUser("tutor", "admin");
  const params = await searchParams;
  const offset = Math.max(-52, Math.min(52, Number.parseInt(params.week ?? "0", 10) || 0));
  const tz = user.timezone;
  const week = weekInZone(tz, offset);

  const [roster, sessions] = await Promise.all([
    getTutorRoster(user.id),
    listSessions({ tutorId: user.id, from: week.start, to: week.end }),
  ]);

  const now = nowMs();
  const todayKey = dayKey(new Date(now), tz);
  const days: ScheduleDay[] = week.days.map((d) => {
    const key = dayKey(d, tz);
    return {
      key,
      weekday: formatInZone(d, tz, "EEE"),
      dateLabel: formatInZone(d, tz, "d MMM"),
      isToday: key === todayKey,
      items: sessions
        .filter((s) => dayKey(s.starts_at, tz) === key)
        .map((s) => {
          const student = roster.studentById[s.student_id];
          const parent = student ? roster.parents[student.parent_id] : undefined;
          const end = new Date(new Date(s.starts_at).getTime() + s.duration_min * 60_000);
          const familyTz = parent?.timezone;
          return {
            session: s,
            studentName: student ? studentName(student) : "Student",
            studentFirstName: student?.first_name ?? "your student",
            avatarSeed: student?.avatar_seed,
            yearGroup: student?.year_group,
            timeLabel: formatInZone(s.starts_at, tz, "HH:mm"),
            endLabel: formatInZone(end, tz, "HH:mm"),
            whenLabel: formatInZone(s.starts_at, tz, "EEE d MMM, h:mm a"),
            family:
              familyTz && familyTz !== tz
                ? {
                    label: `${student?.first_name}'s family · ${zoneCity(familyTz)} (${shortZone(familyTz, new Date(s.starts_at))})`,
                    time: formatInZone(s.starts_at, familyTz, "EEE d MMM, h:mm a"),
                  }
                : undefined,
            isPast: end.getTime() < now,
          };
        }),
    };
  });

  const total = sessions.filter((s) => s.status !== "cancelled").length;
  const hours = sessions.filter((s) => s.status !== "cancelled").reduce((sum, s) => sum + s.duration_min, 0) / 60;
  const rangeLabel = `${formatInZone(week.start, tz, "d MMM")} – ${formatInZone(week.days[6], tz, "d MMM yyyy")}`;

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title={offset === 0 ? "This week" : offset === 1 ? "Next week" : offset === -1 ? "Last week" : rangeLabel}
        description={`${rangeLabel} · ${total} lesson${total === 1 ? "" : "s"} · ${hours.toFixed(hours % 1 ? 1 : 0)} h · times in ${shortZone(tz)} (${zoneCity(tz)})`}
        actions={
          <nav aria-label="Week navigation" className="flex items-center gap-1 rounded-full border bg-card p-1">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href={`/tutor/schedule?week=${offset - 1}`} aria-label="Previous week">
                <ChevronLeftIcon />
              </Link>
            </Button>
            <Button asChild variant={offset === 0 ? "secondary" : "ghost"} size="sm" className="rounded-full px-3">
              <Link href="/tutor/schedule" aria-current={offset === 0 ? "page" : undefined}>
                <CalendarDaysIcon /> Today
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href={`/tutor/schedule?week=${offset + 1}`} aria-label="Next week">
                <ChevronRightIcon />
              </Link>
            </Button>
          </nav>
        }
      />

      <ScheduleBoard key={offset} days={days} timezoneLabel={`${zoneCity(tz)}, ${shortZone(tz)}`} initialSessionId={params.session} />

      <p className="text-sm text-muted-foreground">
        Tap a lesson to log how it went, add homework or send a few stars. Families see your notes on their dashboard straight away.
      </p>
    </>
  );
}
