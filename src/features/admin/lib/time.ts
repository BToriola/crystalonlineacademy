import { TZDate } from "@date-fns/tz";
import { addDays, addWeeks, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";

/** Converts a wall-clock date ("2026-10-12") + time ("17:30") in `timezone` into a UTC ISO string. */
export function zonedToUtcIso(date: string, time: string, timezone: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  if ([y, m, d, hh, mm].some((n) => Number.isNaN(n))) return null;
  const zoned = new TZDate(y, m - 1, d, hh, mm, 0, timezone);
  return Number.isNaN(zoned.getTime()) ? null : new Date(zoned.getTime()).toISOString();
}

export function nowInZone(timezone: string, at: number = Date.now()) {
  return new TZDate(at, timezone);
}

/** Monday-start week containing `now`, shifted by `offset` weeks, computed in `timezone`. */
export function weekRange(timezone: string, offset = 0, at: number = Date.now()) {
  const base = addWeeks(nowInZone(timezone, at), offset);
  return {
    from: new Date(startOfWeek(base, { weekStartsOn: 1 }).getTime()),
    to: new Date(endOfWeek(base, { weekStartsOn: 1 }).getTime()),
  };
}

export function dayRange(timezone: string, offset = 0, at: number = Date.now()) {
  const base = addDays(nowInZone(timezone, at), offset);
  return { from: new Date(startOfDay(base).getTime()), to: new Date(endOfDay(base).getTime()) };
}

export function monthRange(timezone: string, at: number = Date.now()) {
  const base = nowInZone(timezone, at);
  return { from: new Date(startOfMonth(base).getTime()), to: new Date(endOfMonth(base).getTime()) };
}

export function greetingFor(timezone: string, at: number = Date.now()) {
  const hour = nowInZone(timezone, at).getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** "London", "Toronto", "Lagos" from an IANA zone. */
export function zoneCity(timezone: string) {
  return timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone;
}

export function inRange(date: string | Date, from: Date, to: Date) {
  const t = new Date(date).getTime();
  return t >= from.getTime() && t <= to.getTime();
}
