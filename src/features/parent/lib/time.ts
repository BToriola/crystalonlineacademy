import { JOIN_OPENS_MIN_BEFORE } from "@/features/attendance/constants";
import type { Curriculum } from "@/types/database";

export { JOIN_OPENS_MIN_BEFORE };
export const JOIN_EARLY_MS = JOIN_OPENS_MIN_BEFORE * 60_000;

export type LessonPhase = "upcoming" | "joinable" | "live" | "ended";

export function lessonPhase(startsAt: string, durationMin: number, now: number): LessonPhase {
  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60_000;
  if (now >= end) return "ended";
  if (now >= start) return "live";
  if (now >= start - JOIN_EARLY_MS) return "joinable";
  return "upcoming";
}

/** "3d 4h", "2h 14m", "6m 05s" */
export function countdownParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export const curriculumFlag: Record<Curriculum, { flag: string; label: string }> = {
  uk: { flag: "🇬🇧", label: "UK curriculum" },
  ca: { flag: "🇨🇦", label: "Canadian curriculum" },
};

export function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function isUpcoming(s: { starts_at: string; duration_min: number; status: string }, now: number) {
  return s.status === "scheduled" && new Date(s.starts_at).getTime() + s.duration_min * 60_000 > now;
}
