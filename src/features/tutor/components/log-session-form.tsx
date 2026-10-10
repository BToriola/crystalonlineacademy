"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, CircleSlashIcon, InfoIcon, Loader2Icon, UserXIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { logSession } from "@/features/sessions/actions";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/database";
import { logSessionSchema, type LogSessionInput as Values } from "../schemas";

const statuses = [
  { value: "completed", label: "Completed", icon: CheckCircle2Icon, active: "border-success bg-success/10 text-success" },
  { value: "missed", label: "Missed", icon: UserXIcon, active: "border-destructive bg-destructive/10 text-destructive" },
  { value: "cancelled", label: "Cancelled", icon: CircleSlashIcon, active: "border-foreground/40 bg-muted text-foreground" },
] as const;

export function LogSessionForm({ session, onDone }: { session: Session; onDone?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(logSessionSchema),
    defaultValues: {
      sessionId: session.id,
      status: session.status === "scheduled" ? "completed" : session.status,
      topic: session.topic ?? "",
      notes: session.tutor_notes ?? "",
      homework: session.homework ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await logSession(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Session logged");
      router.refresh();
      onDone?.();
    }),
  );

  const errors = form.formState.errors;
  const idPrefix = `log-${session.id}`;

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label">How did it go?</FieldLegend>
              <div role="group" aria-label="Session status" className="grid grid-cols-3 gap-2">
                {statuses.map((s) => {
                  const checked = field.value === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => field.onChange(s.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs font-medium transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        checked ? s.active : "text-muted-foreground",
                      )}
                    >
                      <s.icon className="size-5" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </FieldSet>
          )}
        />

        <Field data-invalid={!!errors.topic}>
          <FieldLabel htmlFor={`${idPrefix}-topic`}>Topic covered</FieldLabel>
          <Input id={`${idPrefix}-topic`} placeholder="e.g. Equivalent fractions" {...form.register("topic")} />
          <FieldError errors={[errors.topic]} />
        </Field>

        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor={`${idPrefix}-notes`}>Notes for parents</FieldLabel>
          <Textarea
            id={`${idPrefix}-notes`}
            rows={4}
            placeholder="What clicked, what to keep practising, any wins worth celebrating at home…"
            {...form.register("notes")}
          />
          <FieldDescription>Families read these — keep them warm and specific.</FieldDescription>
          <FieldError errors={[errors.notes]} />
        </Field>

        <Field data-invalid={!!errors.homework}>
          <FieldLabel htmlFor={`${idPrefix}-homework`}>Homework</FieldLabel>
          <Textarea id={`${idPrefix}-homework`} rows={2} placeholder="Optional — e.g. Worksheet 3, questions 1–8" {...form.register("homework")} />
          <FieldError errors={[errors.homework]} />
        </Field>

        <p className="flex gap-2 rounded-2xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          The academy team can see when everyone joined the lesson, so please keep the status and notes true to how it went.
        </p>

        <Button type="submit" disabled={pending} className="h-11 rounded-full">
          {pending && <Loader2Icon className="animate-spin" />} Save session log
        </Button>
      </FieldGroup>
    </form>
  );
}
