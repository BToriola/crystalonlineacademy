"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, HourglassIcon, Link2Icon, Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MEET_URL_PATTERN } from "@/features/attendance/constants";
import { proposeMeetingLink } from "@/features/sessions/actions";
import { formatInZone } from "@/lib/format";

type Props = {
  assignmentId: string;
  subject: string;
  meetingUrl: string | null;
  approvedAt: string | null;
  proposedUrl: string | null;
  timezone: string;
};

export function ClassLinkPanel({ assignmentId, subject, meetingUrl, approvedAt, proposedUrl, timezone }: Props) {
  const router = useRouter();
  const id = useId();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const awaiting = sent ?? proposedUrl;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const link = url.trim();
    if (!MEET_URL_PATTERN.test(link)) {
      setError("Use a Google Meet link like https://meet.google.com/abc-defg-hij");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await proposeMeetingLink(assignmentId, link);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Link sent for approval");
      setSent(link);
      setUrl("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border p-4">
      <p className="flex items-center gap-2 font-medium">
        <Link2Icon className="size-4 text-primary" /> {subject}
      </p>

      {meetingUrl && approvedAt ? (
        <p className="flex items-start gap-2 text-sm">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-mono text-xs">{meetingUrl.replace("https://", "")}</span>
            <span className="text-xs text-muted-foreground">Approved {formatInZone(approvedAt, timezone, "d MMM yyyy")}</span>
          </span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No approved class link yet.</p>
      )}

      {awaiting && (
        <p className="flex items-start gap-2 rounded-xl bg-sun/20 px-3 py-2 text-sm">
          <HourglassIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium">Awaiting admin approval</span>
            <span className="block truncate font-mono text-xs text-muted-foreground">{awaiting.replace("https://", "")}</span>
          </span>
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={`${id}-url`} className="text-xs">
            Propose a new Google Meet link
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id={`${id}-url`}
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              aria-invalid={!!error}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={pending || !url.trim()} aria-label="Send link for approval">
              {pending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            </Button>
          </div>
          {error ? <FieldError>{error}</FieldError> : <FieldDescription className="text-xs">The family sees it once the academy approves it.</FieldDescription>}
        </Field>
      </form>
    </div>
  );
}
