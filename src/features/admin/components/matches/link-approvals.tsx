"use client";

import { useState, useTransition } from "react";
import { CheckIcon, ShieldCheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveMeetingLink, rejectMeetingLink } from "@/features/assignments/actions";
import { MEET_URL_PATTERN } from "@/features/attendance/constants";

export type PendingLink = {
  id: string;
  studentName: string;
  tutorName: string;
  subject: string;
  currentUrl: string | null;
  proposedUrl: string;
};

export function LinkApprovals({ items }: { items: PendingLink[] }) {
  const [done, setDone] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const visible = items.filter((i) => !done.includes(i.id));

  const act = (item: PendingLink, approve: boolean) =>
    startTransition(async () => {
      const result = approve ? await approveMeetingLink(item.id) : await rejectMeetingLink(item.id);
      if (result.ok) {
        setDone((prev) => [...prev, item.id]);
        toast.success(result.message ?? "Done.");
      } else toast.error(result.error);
    });

  if (!visible.length) return null;

  return (
    <section aria-labelledby="pending-links" className="rounded-2xl border border-sun/50 bg-sun/10 p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sun/30 text-ink dark:text-sun">
          <ShieldCheckIcon className="size-4.5" />
        </span>
        <div>
          <h2 id="pending-links" className="font-display text-lg font-bold">
            Pending link approvals
          </h2>
          <p className="text-sm text-muted-foreground">
            Tutors create their own Google Meet rooms. Check each one before families are sent to it.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {visible.map((item) => {
          const valid = MEET_URL_PATTERN.test(item.proposedUrl);
          return (
            <li key={item.id} className="flex flex-col gap-3 rounded-xl border bg-card p-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {item.tutorName} <span className="font-normal text-muted-foreground">for {item.studentName} · {item.subject}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Proposed:</span>
                  <a href={item.proposedUrl} target="_blank" rel="noreferrer" className="font-mono break-all text-primary hover:underline">
                    {item.proposedUrl}
                  </a>
                  {!valid && <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">Not a Google Meet link</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Current: <span className="font-mono break-all">{item.currentUrl ?? "none"}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" className="rounded-full" disabled={pending} onClick={() => act(item, false)}>
                  <XIcon data-icon="inline-start" />
                  Reject
                </Button>
                <Button size="sm" className="rounded-full" disabled={pending || !valid} onClick={() => act(item, true)}>
                  <CheckIcon data-icon="inline-start" />
                  Approve
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
