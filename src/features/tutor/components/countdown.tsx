"use client";

import { useNow } from "./use-now";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function Countdown({ startsAt, durationMin, className }: { startsAt: string; durationMin: number; className?: string }) {
  const now = useNow();
  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60_000;

  let label = "…";
  if (now !== null) {
    if (now >= end) label = "Just finished";
    else if (now >= start) label = "Live now";
    else label = `Starts in ${parts(start - now)}`;
  }

  const live = now !== null && now >= start && now < end;
  return (
    <span className={className} role="timer" aria-live="off">
      {live && <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-coral align-middle" aria-hidden />}
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
