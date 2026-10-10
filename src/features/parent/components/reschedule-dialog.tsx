"use client";

import { useState, useTransition } from "react";
import { CalendarSyncIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestReschedule } from "@/features/sessions/parent-actions";

export function RescheduleDialog({
  sessionId,
  summary,
  zoneLabel,
  trigger,
}: {
  sessionId: string;
  summary: string;
  zoneLabel: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preferred, setPreferred] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferred.trim().length < 3) {
      setError("Tell us when would suit you better.");
      return;
    }
    startTransition(async () => {
      const result = await requestReschedule({ sessionId, preferred, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Request sent.");
      setPreferred("");
      setReason("");
      setError(null);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="rounded-full">
            <CalendarSyncIcon data-icon="inline-start" /> Reschedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Request a new time</DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>
        <form id={`reschedule-${sessionId}`} onSubmit={submit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor={`preferred-${sessionId}`}>When would suit you better?</FieldLabel>
              <Input
                id={`preferred-${sessionId}`}
                value={preferred}
                aria-invalid={!!error}
                onChange={(e) => setPreferred(e.target.value)}
                placeholder="e.g. Thursday after 5pm, or Saturday morning"
              />
              <FieldDescription>Times in your timezone ({zoneLabel}) — we&apos;ll convert for the tutor.</FieldDescription>
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor={`reason-${sessionId}`}>Anything else? (optional)</FieldLabel>
              <Textarea id={`reason-${sessionId}`} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`reschedule-${sessionId}`} className="rounded-full" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
