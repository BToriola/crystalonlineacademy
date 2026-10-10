"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandshakeIcon, SparklesIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newMatchSchema, type NewMatchInput } from "@/features/admin/schemas";
import { createAssignment } from "@/features/assignments/actions";
import { cn } from "@/lib/utils";
import type { StudentOption, TutorOption } from "./types";

const defaults: NewMatchInput = { studentId: "", tutorId: "", subject: "", sessionsPerWeek: 2, meetingUrl: "" };

/** Tutors who teach the subject, least busy first, then best rated. */
export function suggestTutors(tutors: TutorOption[], subject: string, limit = 3) {
  if (!subject) return [];
  return tutors
    .filter((t) => t.subjects.includes(subject))
    .sort((a, b) => a.activeStudents - b.activeStudents || b.rating - a.rating)
    .slice(0, limit);
}

export function NewMatchDialog({ students, tutors, subjects }: { students: StudentOption[]; tutors: TutorOption[]; subjects: string[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<NewMatchInput>({ resolver: zodResolver(newMatchSchema), defaultValues: defaults });
  const subject = useWatch({ control: form.control, name: "subject" });
  const tutorId = useWatch({ control: form.control, name: "tutorId" });
  const suggestions = suggestTutors(tutors, subject);

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await createAssignment(values);
      if (result.ok) {
        toast.success(result.message ?? "Match created.");
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
          <HandshakeIcon data-icon="inline-start" />
          New match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">New match</DialogTitle>
          <DialogDescription>Pair a child with a tutor for a subject. You can book their first session straight after.</DialogDescription>
        </DialogHeader>

        <form id="new-match" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Controller
              control={form.control}
              name="studentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="match-student">Student</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="match-student" className="w-full" aria-invalid={fieldState.invalid || undefined}>
                      <SelectValue placeholder="Choose a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} <span className="text-muted-foreground">· {s.yearGroup}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="subject"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="match-subject">Subject</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="match-subject" className="w-full" aria-invalid={fieldState.invalid || undefined}>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {subject && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5" aria-live="polite">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                  <SparklesIcon className="size-3.5" />
                  Suggested for {subject}
                </p>
                {suggestions.length ? (
                  <ul className="grid gap-2">
                    {suggestions.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => form.setValue("tutorId", t.id, { shouldValidate: true })}
                          aria-pressed={tutorId === t.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left text-sm transition hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                            tutorId === t.id && "border-primary ring-2 ring-primary/20",
                          )}
                        >
                          <UserAvatar name={t.name} seed={t.seed} className="size-7" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {t.name}
                              {t.isFounder && <span className="ml-1.5 text-xs font-normal text-coral">(you)</span>}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {t.activeStudents} active {t.activeStudents === 1 ? "student" : "students"}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium">
                            <StarIcon className="size-3 fill-sun text-sun" aria-hidden />
                            {t.rating.toFixed(1)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nobody on the team lists {subject} yet — worth flagging to recruitment.</p>
                )}
              </div>
            )}

            <Controller
              control={form.control}
              name="tutorId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="match-tutor">Tutor</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="match-tutor" className="w-full" aria-invalid={fieldState.invalid || undefined}>
                      <SelectValue placeholder="Choose a tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutors.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                          {t.isFounder ? " (you)" : ""}
                          <span className="text-muted-foreground">· {t.activeStudents} active</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
              <Controller
                control={form.control}
                name="sessionsPerWeek"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="match-frequency">Sessions / week</FieldLabel>
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger id="match-frequency" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="meetingUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="match-url">Meeting link</FieldLabel>
                    <Input id="match-url" type="url" placeholder="https://meet.google.com/…" aria-invalid={fieldState.invalid || undefined} {...field} />
                    <FieldDescription>Optional Google Meet room, reused for every session. Tutors can propose one later for you to approve.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="new-match" disabled={pending}>
            {pending ? "Creating…" : "Create match"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
