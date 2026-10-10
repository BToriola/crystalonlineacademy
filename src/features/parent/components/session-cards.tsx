import { BookOpenIcon, CheckCircle2Icon, CircleDashedIcon, MessageSquareQuoteIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { siteConfig } from "@/config/site";
import { joinHref } from "@/features/attendance/constants";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatInZone, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile, Session, Student } from "@/types/database";
import { AddToCalendarButton } from "./add-to-calendar-button";
import { Countdown, JoinButton } from "./lesson-timing";
import { RateSession } from "./rate-session";
import { RescheduleDialog } from "./reschedule-dialog";

type Common = { session: Session; child?: Student; tutor?: Profile; timezone: string };

function DateBlock({ startsAt, timezone }: { startsAt: string; timezone: string }) {
  return (
    <div className="grid w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 py-2 text-primary">
      <span className="text-xs font-semibold uppercase">{formatInZone(startsAt, timezone, "EEE")}</span>
      <span className="font-display text-2xl leading-none font-extrabold">{formatInZone(startsAt, timezone, "d")}</span>
      <span className="text-xs">{formatInZone(startsAt, timezone, "MMM")}</span>
    </div>
  );
}

export function UpcomingSessionCard({ session, child, tutor, timezone }: Common) {
  const tutorName = tutor?.full_name ?? "Tutor";
  const zone = shortZone(timezone, new Date(session.starts_at));
  const time = `${formatInZone(session.starts_at, timezone, "h:mm a")} ${zone}`;
  const joinUrl = `${siteConfig.url}${joinHref(session.id)}`;
  const summary = `${child?.first_name ?? "Your child"}'s ${session.subject} with ${tutorName} — ${formatInZone(session.starts_at, timezone, "EEEE d MMMM")}, ${time}`;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 gap-4">
        <DateBlock startsAt={session.starts_at} timezone={timezone} />
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{time}</span> · {session.duration_min} min
          </p>
          <h3 className="font-display text-lg leading-tight font-bold">
            {session.subject}
            {child && <span className="font-sans text-base font-normal text-muted-foreground"> · {child.first_name}</span>}
          </h3>
          {session.topic && <p className="truncate text-sm text-muted-foreground">{session.topic}</p>}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserAvatar name={tutorName} src={tutor?.avatar_url} seed={tutor?.id} className="size-5" />
            {tutorName}
            {tutor && tutor.timezone !== timezone && (
              <span>
                · {formatInZone(session.starts_at, tutor.timezone, "h:mm a")} {shortZone(tutor.timezone, new Date(session.starts_at))} for them
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex items-center gap-3">
          <Countdown startsAt={session.starts_at} durationMin={session.duration_min} className="text-xs font-medium text-muted-foreground" />
          <JoinButton sessionId={session.id} startsAt={session.starts_at} durationMin={session.duration_min} meetingUrl={session.meeting_url} size="sm" label="Join" />
        </div>
        <div className="flex flex-wrap gap-1 sm:justify-end">
          <AddToCalendarButton
            filename={`crystal-${session.subject.toLowerCase().replace(/\W+/g, "-")}-${session.starts_at.slice(0, 10)}`}
            event={{
              uid: session.id,
              title: `${child?.first_name ?? "Lesson"}: ${session.subject} with ${tutorName}`,
              description: [session.topic, `Join: ${joinUrl}`].filter(Boolean).join("\n"),
              url: joinUrl,
              startsAt: session.starts_at,
              durationMin: session.duration_min,
            }}
          />
          <RescheduleDialog sessionId={session.id} summary={summary} zoneLabel={zone} />
        </div>
      </div>
    </article>
  );
}

export function PastSessionCard({ session, child, tutor, timezone, rateable = true }: Common & { rateable?: boolean }) {
  const tutorName = tutor?.full_name ?? "Tutor";
  return (
    <article className="space-y-3 rounded-3xl border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {formatInZone(session.starts_at, timezone, "EEE d MMM, h:mm a")} {shortZone(timezone, new Date(session.starts_at))}
          </p>
          <h3 className="font-display text-lg leading-tight font-bold">
            {session.subject}
            {child && <span className="font-sans text-base font-normal text-muted-foreground"> · {child.first_name}</span>}
          </h3>
          {session.topic && <p className="text-sm text-muted-foreground">{session.topic}</p>}
        </div>
        <StatusBadge status={session.status} />
      </header>

      {session.tutor_notes && (
        <blockquote className="flex gap-3 rounded-2xl bg-sand/50 p-3 text-sm">
          <MessageSquareQuoteIcon className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
          <div>
            <p>{session.tutor_notes}</p>
            <footer className="mt-1 text-xs text-muted-foreground">— {tutorName}</footer>
          </div>
        </blockquote>
      )}

      {session.homework && <HomeworkLine homework={session.homework} done={session.homework_done} />}

      {rateable && session.status === "completed" && (
        <RateSession sessionId={session.id} initialRating={session.parent_rating} initialFeedback={session.parent_feedback} />
      )}
    </article>
  );
}

export function HomeworkLine({ homework, done, className }: { homework: string; done: boolean; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-sm", className)}>
      <BookOpenIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <span className="flex-1">
        <span className="font-medium">Homework:</span> {homework}
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          done ? "bg-success/12 text-success" : "bg-sun/25 text-ink dark:text-sun",
        )}
      >
        {done ? <CheckCircle2Icon className="size-3" aria-hidden /> : <CircleDashedIcon className="size-3" aria-hidden />}
        {done ? "Done" : "To do"}
      </span>
    </p>
  );
}
