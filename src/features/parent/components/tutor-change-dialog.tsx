"use client";

import { useState, useTransition } from "react";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { requestTutorChange } from "@/features/students/actions";

export function TutorChangeDialog({ studentId, childName }: { studentId: string; childName: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError("Please tell us a little more (at least 10 characters).");
      return;
    }
    startTransition(async () => {
      const result = await requestTutorChange({ studentId, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Request sent.");
      setReason("");
      setError(null);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <RefreshCwIcon data-icon="inline-start" /> Request a tutor change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Request a tutor change</DialogTitle>
          <DialogDescription>
            It&apos;s completely fine to ask — the right fit matters. We&apos;ll review {childName}&apos;s match personally and
            suggest options.
          </DialogDescription>
        </DialogHeader>
        <form id="tutor-change-form" onSubmit={submit} noValidate>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="tutor-change-reason">What isn&apos;t working?</FieldLabel>
            <Textarea
              id="tutor-change-reason"
              rows={5}
              value={reason}
              aria-invalid={!!error}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Different teaching style, schedule clashes, a subject change…"
            />
            <FieldDescription>Your current tutor won&apos;t see this message.</FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </Field>
        </form>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="tutor-change-form" className="rounded-full" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
