import Link from "next/link";
import { CalendarDaysIcon, ClockIcon, CoffeeIcon } from "lucide-react";
import { Sparkle } from "@/components/brand/doodles";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { formatInZone, friendlyDateTime, shortZone } from "@/lib/format";
import type { Session, Student } from "@/types/database";
import { studentName, zoneCity } from "../utils";
import { Countdown } from "./countdown";
import { JoinLessonButton } from "./join-lesson-button";

type Props = {
  session: Session | null;
  student?: Student;
  tutorTimezone: string;
  familyTimezone?: string;
};

function ZoneChip({ who, timezone, at }: { who: string; timezone: string; at: string }) {
  const date = new Date(at);
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-primary-foreground/10 px-4 py-3">
      <p className="truncate text-xs text-primary-foreground/75">
        {who} · {zoneCity(timezone)}
      </p>
      <p className="font-display text-xl font-bold tabular-nums">
        {formatInZone(date, timezone, "h:mm a")}
        <span className="ml-1.5 text-xs font-medium text-primary-foreground/75">{shortZone(timezone, date)}</span>
      </p>
      <p className="text-xs text-primary-foreground/75">{formatInZone(date, timezone, "EEE d MMM")}</p>
    </div>
  );
}

export function NextSessionHero({ session, student, tutorTimezone, familyTimezone }: Props) {
  if (!session || !student) {
    return (
      <section className="slab relative overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
        <Sparkle className="absolute top-6 right-8 size-8 text-sun" />
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15">
            <CoffeeIcon className="size-6" />
          </span>
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-extrabold">Nothing else booked — enjoy the breather</h2>
            <p className="text-primary-foreground/80">New lessons appear here as soon as the team schedules them.</p>
          </div>
        </div>
      </section>
    );
  }

  const name = studentName(student);
  const sameZone = !familyTimezone || familyTimezone === tutorTimezone;

  return (
    <section
      aria-labelledby="next-session-title"
      className="slab relative overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-primary-foreground/10" aria-hidden />
      <Sparkle className="absolute top-6 right-8 size-8 animate-float text-sun" />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-primary-foreground/15 px-3 py-1 font-semibold tracking-wide uppercase">Up next</span>
            <Countdown startsAt={session.starts_at} durationMin={session.duration_min} className="rounded-full bg-sun px-3 py-1 font-semibold text-ink" />
          </div>

          <div className="flex items-center gap-4">
            <UserAvatar name={name} seed={student.avatar_seed} className="size-16 ring-4 ring-primary-foreground/20" />
            <div className="min-w-0">
              <h2 id="next-session-title" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {name} · {session.subject}
              </h2>
              <p className="text-primary-foreground/80">{session.topic ?? "Topic to be set"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-foreground/80">
                <ClockIcon className="size-3.5" /> {friendlyDateTime(session.starts_at, tutorTimezone)} · {session.duration_min} min
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ZoneChip who="You" timezone={tutorTimezone} at={session.starts_at} />
            {sameZone ? (
              <div className="flex flex-1 items-center rounded-2xl border border-dashed border-primary-foreground/25 px-4 py-3 text-sm text-primary-foreground/80">
                {student.first_name}&rsquo;s family shares your time zone.
              </div>
            ) : (
              <ZoneChip who={`${student.first_name}'s family`} timezone={familyTimezone} at={session.starts_at} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {session.meeting_url ? (
            <JoinLessonButton
              sessionId={session.id}
              startsAt={session.starts_at}
              durationMin={session.duration_min}
              className="h-12 rounded-full bg-background px-7 text-foreground hover:bg-background/90 disabled:opacity-70"
            />
          ) : (
            <p className="rounded-full bg-primary-foreground/10 px-5 py-3 text-sm">Class link awaiting approval</p>
          )}
          <Button asChild variant="ghost" className="h-12 rounded-full px-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link href="/tutor/schedule">
              <CalendarDaysIcon /> Full schedule
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
