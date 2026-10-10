import { CalendarHeartIcon, ClockIcon, ShieldCheckIcon } from "lucide-react";
import { Sparkle } from "@/components/brand/doodles";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatInZone, friendlyDateTime, shortZone } from "@/lib/format";
import type { Profile, Session, Student } from "@/types/database";
import { JOIN_OPENS_MIN_BEFORE } from "../lib/time";
import { Countdown, JoinButton } from "./lesson-timing";

export function NextLessonHero({ session, child, tutor, timezone }: { session: Session; child?: Student; tutor?: Profile; timezone: string }) {
  const tutorName = tutor?.full_name ?? "your tutor";
  const at = new Date(session.starts_at);
  return (
    <section aria-labelledby="next-lesson-title" className="slab relative overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
      <Sparkle className="absolute top-6 right-8 size-8 animate-float text-sun" />
      <div aria-hidden className="absolute -right-16 -bottom-20 size-64 rounded-full bg-white/10" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <CalendarHeartIcon className="size-3.5" aria-hidden /> Next lesson
          </p>
          <h2 id="next-lesson-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {child ? `${child.first_name}'s ` : ""}
            {session.subject}
          </h2>
          {session.topic && <p className="text-primary-foreground/85">{session.topic}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <ClockIcon className="size-4" aria-hidden />
              {friendlyDateTime(session.starts_at, timezone)} {shortZone(timezone, at)}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserAvatar name={tutorName} src={tutor?.avatar_url} seed={tutor?.id} className="size-6 ring-2 ring-white/40" />
              with {tutorName}
            </span>
          </div>
          {tutor && tutor.timezone !== timezone && (
            <p className="text-xs text-primary-foreground/70">
              That&apos;s {formatInZone(session.starts_at, tutor.timezone, "h:mm a")} {shortZone(tutor.timezone, at)} for {tutorName}.
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <Countdown
            startsAt={session.starts_at}
            durationMin={session.duration_min}
            className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl"
          />
          <JoinButton
            sessionId={session.id}
            startsAt={session.starts_at}
            durationMin={session.duration_min}
            meetingUrl={session.meeting_url}
            size="lg"
            className="h-12 bg-white px-7 text-primary hover:bg-white/90 disabled:bg-white/70"
          />
          <p className="text-xs text-primary-foreground/70">The Join button opens {JOIN_OPENS_MIN_BEFORE} minutes before the start.</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/70">
            <ShieldCheckIcon className="size-3.5" aria-hidden /> Lessons are monitored by the academy for safeguarding.
          </p>
        </div>
      </div>
    </section>
  );
}
