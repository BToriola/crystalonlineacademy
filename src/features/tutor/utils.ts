import { TZDate } from "@date-fns/tz";
import { addDays, addWeeks, endOfMonth, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { inZone } from "@/lib/format";

/** Request-time clock for server components (kept out of render bodies for the purity lint). */
export const nowMs = () => Date.now();

/** "Africa/Lagos" → "Lagos", "America/St_Johns" → "St Johns" */
export function zoneCity(timezone: string) {
  return (timezone.split("/").pop() ?? timezone).replace(/_/g, " ");
}

export function greetingFor(timezone: string, date: Date = new Date()) {
  const hour = inZone(date, timezone).getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function dayKey(date: string | Date, timezone: string) {
  return format(inZone(date, timezone), "yyyy-MM-dd");
}

/** Monday-start week in the given zone, shifted by `offset` weeks from the current one. */
export function weekInZone(timezone: string, offset = 0) {
  const now = new TZDate(Date.now(), timezone);
  const start = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), offset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = new Date(addDays(start, 7).getTime() - 1);
  return { start, end, days };
}

/** How many weeks away (in the zone's Monday-start weeks) a date is from the current week. */
export function weekOffsetFor(date: string | Date, timezone: string) {
  const current = weekInZone(timezone).start.getTime();
  const target = startOfWeek(inZone(date, timezone), { weekStartsOn: 1 }).getTime();
  return Math.round((target - current) / (7 * 86_400_000));
}

export function todayInZone(timezone: string) {
  const start = startOfDay(new TZDate(Date.now(), timezone));
  return { start, end: new Date(addDays(start, 1).getTime() - 1) };
}

export function monthInZone(timezone: string, offset = 0) {
  const now = new TZDate(Date.now(), timezone);
  const start = startOfMonth(new TZDate(now.getFullYear(), now.getMonth() + offset, 1, timezone));
  return { start, end: endOfMonth(start) };
}

export const curriculumFlag = { uk: "🇬🇧", ca: "🇨🇦" } as const;
export const curriculumLabel = { uk: "UK curriculum", ca: "Canadian curriculum" } as const;

export function studentName(s: { first_name: string; last_name: string | null }) {
  return [s.first_name, s.last_name].filter(Boolean).join(" ");
}

/** "Mr. Tobi" stays as is; "Crystal Adeyemi" becomes "Crystal". */
export function callName(fullName: string) {
  const words = fullName.trim().split(/\s+/);
  return /^(Mr|Ms|Mrs|Miss|Dr)\.?$/i.test(words[0] ?? "") ? words.slice(0, 2).join(" ") : (words[0] ?? fullName);
}
