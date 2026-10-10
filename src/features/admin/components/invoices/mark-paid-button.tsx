"use client";

import { useState, useTransition } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markInvoicePaid } from "@/features/billing/actions";

export function MarkPaidButton({ id, number }: { id: string; number: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <CheckCircle2Icon className="size-3.5" />
        Paid
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={pending}
      aria-label={`Mark invoice ${number} as paid`}
      onClick={() =>
        startTransition(async () => {
          const result = await markInvoicePaid(id);
          if (result.ok) {
            setDone(true);
            toast.success(result.message ?? "Marked as paid.");
          } else toast.error(result.error);
        })
      }
    >
      <CheckCircle2Icon data-icon="inline-start" />
      {pending ? "Saving…" : "Mark paid"}
    </Button>
  );
}
