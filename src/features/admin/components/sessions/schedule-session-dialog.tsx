"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlusIcon, GlobeIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zoneCity, zonedToUtcIso } from "@/features/admin/lib/time";
import { scheduleSessionSchema, type ScheduleSessionInput } from "@/features/admin/schemas";
import { createSession } from "@/features/sessions/admin-actions";
import { formatInZone, shortZone } from "@/lib/format";
import type { MatchOption } from "./types";

export function ScheduleSessionDialog({ matches, timezone, defaultDate }: { matches: MatchOption[]; timezone: string; defaultDate: string }) {
  const defaults: ScheduleSessionInput = { assignmentId: "", date: defaultDate, time: "17:00", durationMin: 60, topic: "" };
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<ScheduleSessionInput>({ resolver: zodResolver(scheduleSessionSchema), defaultValues: defaults });
  const [assignmentId, date, time] = useWatch({ control: form.control, name: ["assignmentId", "date", "time"] });

  const match = matches.find((m) => m.id === assignmentId);
  const utc = date && time ? zonedToUtcIso(date, time, timezone) : null;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await createSession(values);
      if (result.ok) {
        toast.success(result.message ?? "Session booked.");
        form.reset(defaults);
        setOpen(false);
      } else toast.error(result.error);
    }),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) form.reset(defaults);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <CalendarPlusIcon data-icon="inline-start" />
          Schedule session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Schedule a session</DialogTitle>
          <DialogDescription>
            Pick the time in your own timezone ({shortZone(timezone)}). We&apos;ll convert it for the tutor and the family.
          </DialogDescription>
        </DialogHeader>

        <form id="schedule-session" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Controller
              control={form.control}
              name="assignmentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="session-match">Match</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="session-match" className="w-full" aria-invalid={fieldState.invalid || undefined}>
                      <SelectValue placeholder="Choose a student & subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!form.formState.errors.date || undefined}>
                <FieldLabel htmlFor="session-date">Date</FieldLabel>
                <Input id="session-date" type="date" {...form.register("date")} aria-invalid={!!form.formState.errors.date || undefined} />
                <FieldError errors={[form.formState.errors.date]} />
              </Field>
              <Field data-invalid={!!form.formState.errors.time || undefined}>
                <FieldLabel htmlFor="session-time">Start ({shortZone(timezone)})</FieldLabel>
                <Input id="session-time" type="time" step={300} {...form.register("time")} aria-invalid={!!form.formState.errors.time || undefined} />
                <FieldError errors={[form.formState.errors.time]} />
              </Field>
            </div>

            {utc && (
              <div className="space-y-1.5 rounded-2xl bg-muted/60 p-3.5 text-sm" aria-live="polite">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <GlobeIcon className="size-3.5" />
                  Around the world
                </p>
                <p>
                  <span className="font-medium">You:</span> {formatInZone(utc, timezone, "EEE d MMM, h:mm a")} {shortZone(timezone, new Date(utc))}
                </p>
                {match && (
                  <>
                    <p>
                      <span className="font-medium">{match.tutorName}:</span> {formatInZone(utc, match.tutorTimezone, "EEE d MMM, h:mm a")}{" "}
                      {shortZone(match.tutorTimezone, new Date(utc))} <span className="text-muted-foreground">({zoneCity(match.tutorTimezone)})</span>
                    </p>
                    <p>
                      <span className="font-medium">Family:</span> {formatInZone(utc, match.familyTimezone, "EEE d MMM, h:mm a")}{" "}
                      {shortZone(match.familyTimezone, new Date(utc))} <span className="text-muted-foreground">({zoneCity(match.familyTimezone)})</span>
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
              <Controller
                control={form.control}
                name="durationMin"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="session-duration">Duration</FieldLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger id="session-duration" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[30, 45, 60, 90].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Field data-invalid={!!form.formState.errors.topic || undefined}>
                <FieldLabel htmlFor="session-topic">Topic</FieldLabel>
                <Input id="session-topic" placeholder="Optional, e.g. Fractions of amounts" {...form.register("topic")} />
                <FieldError errors={[form.formState.errors.topic]} />
              </Field>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="schedule-session" disabled={pending || !matches.length}>
            {pending ? "Booking…" : "Book session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
