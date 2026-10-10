"use client";

import { ArrowUpRightIcon, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOIN_OPENS_MIN_BEFORE, joinHref } from "@/features/attendance/constants";
import { useNow } from "./use-now";

type Props = {
  sessionId: string;
  startsAt: string;
  durationMin: number;
  label?: string;
  compactLabel?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

/** Links through the logging join route; only clickable from JOIN_OPENS_MIN_BEFORE minutes before start until the end. */
export function JoinLessonButton({ sessionId, startsAt, durationMin, label = "Join lesson", compactLabel, className, variant, size }: Props) {
  const now = useNow();
  const start = new Date(startsAt).getTime();
  const opensAt = start - JOIN_OPENS_MIN_BEFORE * 60_000;
  const endsAt = start + durationMin * 60_000;
  const open = now !== null && now >= opensAt && now < endsAt;
  const text = compactLabel ? <span className="hidden sm:inline">{label}</span> : label;

  if (!open) {
    const ended = now !== null && now >= endsAt;
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled
        title={ended ? "This lesson has ended" : `Opens ${JOIN_OPENS_MIN_BEFORE} minutes before the start`}
        aria-label={ended ? "Lesson ended" : `${label} — opens ${JOIN_OPENS_MIN_BEFORE} minutes before the start`}
      >
        <VideoIcon /> {text}
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={joinHref(sessionId)} target="_blank" rel="noreferrer" aria-label={label}>
        <VideoIcon /> {text} {!compactLabel && <ArrowUpRightIcon className="opacity-60" />}
      </a>
    </Button>
  );
}
