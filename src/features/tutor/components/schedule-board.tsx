"use client";

import { useState } from "react";
import { CalendarOffIcon, ClockIcon, GlobeIcon, NotebookPenIcon, StarIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/database";
import { AwardStarsForm } from "./award-stars-form";
import { JoinLessonButton } from "./join-lesson-button";
import { LogSessionForm } from "./log-session-form";

export type ScheduleItem = {
  session: Session;
  studentName: string;
  studentFirstName: string;
  avatarSeed?: string;
  yearGroup?: string;
  timeLabel: string;
  endLabel: string;
  whenLabel: string;
  family?: { label: string; time: string };
  isPast: boolean;
};

export type ScheduleDay = { key: string; weekday: string; dateLabel: string; isToday: boolean; items: ScheduleItem[] };

const tone: Record<Session["status"], string> = {
  scheduled: "border-primary/25 bg-primary/8 hover:bg-primary/12",
  completed: "border-success/25 bg-success/8 hover:bg-success/12",
  missed: "border-destructive/25 bg-destructive/8 hover:bg-destructive/12",
  cancelled: "border-border bg-muted/60 text-muted-foreground line-through decoration-muted-foreground/50 hover:bg-muted",
};

const needsNotes = (i: ScheduleItem) => i.session.status === "completed" && !i.session.tutor_notes?.trim();

function SessionChip({ item, onOpen, compact }: { item: ScheduleItem; onOpen: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-2xl border p-2.5 text-left transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        tone[item.session.status],
      )}
      aria-label={`${item.studentName}, ${item.session.subject}, ${item.timeLabel}, ${item.session.status}`}
    >
      <div className="flex items-center gap-2">
        <UserAvatar name={item.studentName} seed={item.avatarSeed} className={compact ? "size-6" : "size-9"} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-semibold", compact ? "text-xs" : "text-sm")}>{item.studentFirstName}</p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">
            {item.timeLabel}
            {!compact && `–${item.endLabel}`} · {item.session.subject}
          </p>
        </div>
        {!compact && <StatusBadge status={item.session.status} />}
      </div>
      {!compact && item.session.topic && <p className="mt-1.5 truncate text-xs text-muted-foreground">{item.session.topic}</p>}
      {needsNotes(item) && (
        <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sun/30 px-2 py-0.5 text-[11px] font-medium text-ink no-underline dark:text-sun">
          <NotebookPenIcon className="size-3" /> Notes needed
        </p>
      )}
    </button>
  );
}

export function ScheduleBoard({ days, timezoneLabel, initialSessionId }: { days: ScheduleDay[]; timezoneLabel: string; initialSessionId?: string }) {
  const [openId, setOpenId] = useState<string | null>(initialSessionId ?? null);
  const all = days.flatMap((d) => d.items);
  const open = all.find((i) => i.session.id === openId) ?? null;
  const empty = all.length === 0;

  return (
    <>
      {/* Week grid (large screens) */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-7">
        {days.map((day) => (
          <section key={day.key} aria-label={`${day.weekday} ${day.dateLabel}`} className={cn("min-h-64 rounded-3xl border bg-card p-2", day.isToday && "border-primary ring-2 ring-primary/15")}>
            <header className="mb-2 px-1.5 pt-1">
              <p className={cn("text-xs font-semibold tracking-wide uppercase", day.isToday ? "text-primary" : "text-muted-foreground")}>{day.weekday}</p>
              <p className="font-display text-lg font-bold">{day.dateLabel}</p>
            </header>
            <div className="space-y-1.5">
              {day.items.map((item) => (
                <SessionChip key={item.session.id} item={item} compact onOpen={() => setOpenId(item.session.id)} />
              ))}
              {!day.items.length && <p className="px-1.5 text-xs text-muted-foreground/70">Free</p>}
            </div>
          </section>
        ))}
      </div>

      {/* Agenda (mobile & tablet) */}
      <div className="space-y-5 lg:hidden">
        {empty && (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
            <CalendarOffIcon className="size-6" />
            <p>No lessons this week.</p>
          </div>
        )}
        {days
          .filter((d) => d.items.length)
          .map((day) => (
            <section key={day.key} aria-label={`${day.weekday} ${day.dateLabel}`}>
              <h2 className={cn("mb-2 flex items-baseline gap-2 font-display text-lg font-bold", day.isToday && "text-primary")}>
                {day.weekday} <span className="text-sm font-medium text-muted-foreground">{day.dateLabel}</span>
                {day.isToday && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sans text-xs text-primary">Today</span>}
              </h2>
              <div className="space-y-2">
                {day.items.map((item) => (
                  <SessionChip key={item.session.id} item={item} onOpen={() => setOpenId(item.session.id)} />
                ))}
              </div>
            </section>
          ))}
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader className="gap-3 border-b pr-12">
                <div className="flex items-center gap-3">
                  <UserAvatar name={open.studentName} seed={open.avatarSeed} className="size-12" />
                  <div className="min-w-0">
                    <SheetTitle className="font-display text-xl font-bold">{open.studentName}</SheetTitle>
                    <SheetDescription>
                      {open.session.subject}
                      {open.yearGroup && ` · ${open.yearGroup}`}
                    </SheetDescription>
                  </div>
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <dt className="sr-only">Your time</dt>
                    <ClockIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                    <dd>
                      {open.whenLabel} · {open.session.duration_min} min
                      <span className="block text-xs text-muted-foreground">Your time ({timezoneLabel})</span>
                    </dd>
                  </div>
                  {open.family && (
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Family time</dt>
                      <GlobeIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                      <dd>
                        {open.family.time}
                        <span className="block text-xs text-muted-foreground">{open.family.label}</span>
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Status</dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={open.session.status} />
                      {open.session.topic && <span className="text-muted-foreground">{open.session.topic}</span>}
                    </dd>
                  </div>
                </dl>
                {open.session.meeting_url && open.session.status === "scheduled" && !open.isPast && (
                  <JoinLessonButton
                    sessionId={open.session.id}
                    startsAt={open.session.starts_at}
                    durationMin={open.session.duration_min}
                    className="h-10 rounded-full"
                  />
                )}
              </SheetHeader>

              <div className="px-4 pb-6">
                <Tabs key={open.session.id} defaultValue={open.isPast || open.session.status !== "scheduled" ? "log" : "stars"}>
                  <TabsList className="w-full">
                    <TabsTrigger value="log">
                      <NotebookPenIcon /> Log session
                    </TabsTrigger>
                    <TabsTrigger value="stars">
                      <StarIcon /> Award stars
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="log" className="pt-4">
                    <LogSessionForm key={open.session.id} session={open.session} onDone={() => setOpenId(null)} />
                  </TabsContent>
                  <TabsContent value="stars" className="pt-4">
                    <AwardStarsForm key={open.session.id} studentId={open.session.student_id} studentFirstName={open.studentFirstName} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
