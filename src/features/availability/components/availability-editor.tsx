"use client";

import { useMemo, useState, useTransition } from "react";
import { TZDate } from "@date-fns/tz";
import { addDays, format, startOfDay } from "date-fns";
import { ArrowRightIcon, CopyIcon, Loader2Icon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inZone, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { saveAvailability } from "../actions";
import type { AvailabilitySlot } from "../schemas";

const days = [
  { weekday: 1, label: "Monday", short: "Mon" },
  { weekday: 2, label: "Tuesday", short: "Tue" },
  { weekday: 3, label: "Wednesday", short: "Wed" },
  { weekday: 4, label: "Thursday", short: "Thu" },
  { weekday: 5, label: "Friday", short: "Fri" },
  { weekday: 6, label: "Saturday", short: "Sat" },
  { weekday: 0, label: "Sunday", short: "Sun" },
];

const familyZones = [
  { tz: "Europe/London", label: "UK" },
  { tz: "America/Toronto", label: "Toronto" },
  { tz: "America/Vancouver", label: "Vancouver" },
];

type Row = AvailabilitySlot & { key: string };

let counter = 0;
const newKey = () => `slot-${++counter}`;

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** The next real date this weekday/time occurs in the tutor's zone, so DST is applied correctly. */
function nextInstant(weekday: number, time: string, tz: string) {
  const today = startOfDay(new TZDate(Date.now(), tz));
  const date = addDays(today, (weekday - today.getDay() + 7) % 7);
  const [h, m] = time.split(":").map(Number);
  return new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), h, m, tz);
}

function Translation({ weekday, start, end, timezone }: { weekday: number; start: string; end: string; timezone: string }) {
  const from = nextInstant(weekday, start, timezone);
  const to = nextInstant(weekday, end, timezone);
  return (
    <ul className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
      {familyZones
        .filter((z) => z.tz !== timezone)
        .map((z) => {
          const a = inZone(from, z.tz);
          const b = inZone(to, z.tz);
          const dayShift = a.getDay() !== weekday;
          return (
            <li key={z.tz} className="rounded-full bg-muted px-2 py-0.5 tabular-nums">
              <span className="font-medium text-foreground">{z.label}</span> {dayShift && `${format(a, "EEE")} `}
              {format(a, "h:mm")}–{format(b, "h:mm a")} {shortZone(z.tz, from)}
            </li>
          );
        })}
    </ul>
  );
}

export function AvailabilityEditor({ initial, timezone }: { initial: AvailabilitySlot[]; timezone: string }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((s) => ({ ...s, key: newKey() })));
  const [pending, startTransition] = useTransition();

  const invalid = useMemo(() => new Set(rows.filter((r) => toMinutes(r.end_time) <= toMinutes(r.start_time)).map((r) => r.key)), [rows]);
  const weeklyHours = rows.reduce((sum, r) => sum + Math.max(0, toMinutes(r.end_time) - toMinutes(r.start_time)), 0) / 60;

  const update = (key: string, patch: Partial<AvailabilitySlot>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));
  const add = (weekday: number) =>
    setRows((rs) => {
      const last = rs.filter((r) => r.weekday === weekday).sort((a, b) => a.end_time.localeCompare(b.end_time)).at(-1);
      const start = last ? Math.min(toMinutes(last.end_time) + 30, 22 * 60) : 16 * 60;
      const end = Math.min(start + 120, 23 * 60 + 45);
      return [...rs, { key: newKey(), weekday, start_time: toTime(start), end_time: toTime(end) }];
    });
  const copyMondayToWeekdays = () =>
    setRows((rs) => {
      const monday = rs.filter((r) => r.weekday === 1);
      const others = rs.filter((r) => r.weekday === 0 || r.weekday === 6 || r.weekday === 1);
      const copies = [2, 3, 4, 5].flatMap((weekday) => monday.map((m) => ({ ...m, weekday, key: newKey() })));
      return [...others, ...copies];
    });

  function save() {
    if (invalid.size) {
      toast.error("Each time slot needs to end after it starts.");
      return;
    }
    startTransition(async () => {
      const result = await saveAvailability({
        slots: rows
          .map(({ weekday, start_time, end_time }) => ({ weekday, start_time, end_time }))
          .sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)),
      });
      if (result.ok) toast.success(result.message ?? "Availability saved");
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-card px-5 py-4">
        <p className="text-sm">
          <span className="font-display text-2xl font-extrabold">{weeklyHours.toFixed(weeklyHours % 1 ? 1 : 0)}</span>{" "}
          <span className="text-muted-foreground">hours a week available · times in {shortZone(timezone)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={copyMondayToWeekdays}
            disabled={!rows.some((r) => r.weekday === 1)}
          >
            <CopyIcon /> Copy Monday to Tue–Fri
          </Button>
          <Button type="button" className="rounded-full px-5" onClick={save} disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />} Save availability
          </Button>
        </div>
      </div>

      <ul className="divide-y overflow-hidden rounded-3xl border bg-card">
        {days.map((day) => {
          const dayRows = rows.filter((r) => r.weekday === day.weekday).sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <li key={day.weekday} className="grid gap-3 p-4 sm:grid-cols-[8rem_1fr] sm:p-5">
              <div className="flex items-center justify-between sm:block">
                <p className="font-display text-lg font-bold">{day.label}</p>
                <p className={cn("text-xs", dayRows.length ? "text-success" : "text-muted-foreground")}>
                  {dayRows.length ? `${dayRows.length} slot${dayRows.length === 1 ? "" : "s"}` : "Unavailable"}
                </p>
              </div>
              <div className="space-y-3">
                {dayRows.map((r) => {
                  const bad = invalid.has(r.key);
                  return (
                    <div key={r.key} className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="time"
                          step={900}
                          value={r.start_time}
                          onChange={(e) => update(r.key, { start_time: e.target.value })}
                          aria-label={`${day.label} start time`}
                          aria-invalid={bad}
                          className="w-32"
                        />
                        <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden />
                        <Input
                          type="time"
                          step={900}
                          value={r.end_time}
                          onChange={(e) => update(r.key, { end_time: e.target.value })}
                          aria-label={`${day.label} end time`}
                          aria-invalid={bad}
                          className="w-32"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.key)} aria-label={`Remove ${day.label} ${r.start_time} slot`}>
                          <Trash2Icon />
                        </Button>
                      </div>
                      {bad ? (
                        <p role="alert" className="text-xs text-destructive">
                          End time must be after the start time.
                        </p>
                      ) : (
                        r.start_time && r.end_time && <Translation weekday={r.weekday} start={r.start_time} end={r.end_time} timezone={timezone} />
                      )}
                    </div>
                  );
                })}
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => add(day.weekday)}>
                  <PlusIcon /> Add time
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
