"use client";

import { VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinHref } from "@/features/attendance/constants";
import { cn } from "@/lib/utils";
import { countdownParts, JOIN_OPENS_MIN_BEFORE, lessonPhase } from "../lib/time";
import { useNow } from "../lib/use-now";

type Timing = { startsAt: string; durationMin: number };

export function Countdown({ startsAt, durationMin, className }: Timing & { className?: string }) {
  const now = useNow();
  if (now === null) return <span className={className}>&nbsp;</span>;
  const phase = lessonPhase(startsAt, durationMin, now);
  const text =
    phase === "live"
      ? "Happening now"
      : phase === "ended"
        ? "Finished"
        : `Starts in ${countdownParts(new Date(startsAt).getTime() - now)}`;
  return (
    <span role="timer" className={cn("tabular-nums", className)}>
      {text}
    </span>
  );
}

/** Always routes through the academy's join endpoint (logs attendance, then redirects to the meeting). */
export function JoinButton({
  sessionId,
  startsAt,
  durationMin,
  meetingUrl,
  label = "Join lesson",
  className,
  size = "default",
}: Timing & { sessionId: string; meetingUrl: string | null; label?: string; className?: string; size?: "default" | "lg" | "sm" }) {
  const now = useNow();
  const phase = now === null ? "upcoming" : lessonPhase(startsAt, durationMin, now);
  const open = (phase === "joinable" || phase === "live") && Boolean(meetingUrl);
  const hint =
    phase === "ended" ? "This lesson has finished" : !meetingUrl ? "Link coming soon" : open ? undefined : `Opens ${JOIN_OPENS_MIN_BEFORE} minutes before the start`;

  if (open) {
    return (
      <Button asChild size={size} className={cn("rounded-full", className)}>
        <a href={joinHref(sessionId)} target="_blank" rel="noopener">
          <VideoIcon data-icon="inline-start" />
          {label}
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </Button>
    );
  }

  return (
    <Button size={size} disabled className={cn("rounded-full", className)} title={hint}>
      <VideoIcon data-icon="inline-start" />
      {label}
      {hint && <span className="sr-only"> — {hint}</span>}
    </Button>
  );
}
