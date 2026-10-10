"use client";

import { useSyncExternalStore } from "react";
import { formatInZone } from "@/lib/format";

const zones = [
  { label: "London", tz: "Europe/London" },
  { label: "Toronto", tz: "America/Toronto" },
  { label: "Vancouver", tz: "America/Vancouver" },
  { label: "Lagos", tz: "Africa/Lagos" },
];

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 15_000);
  return () => window.clearInterval(id);
}

// Snapshot is the current minute so React only re-renders when the displayed time changes.
const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => null;

export function LiveClocks() {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = minute === null ? null : new Date(minute * 60_000);

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Current local times">
      {zones.map((zone) => (
        <li key={zone.tz} className="rounded-2xl bg-white/10 px-3 py-2.5 text-center">
          <span className="block text-xs text-white/70">{zone.label}</span>
          <span className="block font-display text-lg font-bold tabular-nums" suppressHydrationWarning>
            {now ? formatInZone(now, zone.tz, "h:mm a") : "--:--"}
          </span>
        </li>
      ))}
    </ul>
  );
}
