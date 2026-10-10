"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, CreditCardIcon, GiftIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";

export function PayNowButton({ invoiceNumber, className, size = "sm" }: { invoiceNumber: string; className?: string; size?: "sm" | "default" | "lg" }) {
  return (
    <Button
      size={size}
      className={cn("rounded-full", className)}
      onClick={() =>
        toast.info(`Online payment for ${invoiceNumber} is coming soon`, {
          description: "We're adding secure card payments via Stripe (UK) and Paystack. For now, please pay by bank transfer using the invoice number as your reference.",
        })
      }
    >
      <CreditCardIcon data-icon="inline-start" /> Pay now
    </Button>
  );
}

export function InvoiceDetailsDialog({ invoice, dueLabel, paidLabel }: { invoice: Invoice; dueLabel: string; paidLabel: string | null }) {
  const subtotal = invoice.lines.reduce((sum, l) => sum + l.quantity * l.unit_amount, 0);
  const payable = invoice.status === "sent" || invoice.status === "overdue";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold">
            {invoice.number} <StatusBadge status={invoice.status} />
          </DialogTitle>
          <DialogDescription>
            {invoice.period_label} · {paidLabel ? `Paid ${paidLabel}` : `Due ${dueLabel}`}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Invoice line items</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="py-2 font-medium">Description</th>
                <th scope="col" className="py-2 text-right font-medium">Qty</th>
                <th scope="col" className="py-2 text-right font-medium">Rate</th>
                <th scope="col" className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.description} className="border-b last:border-0">
                  <td className="py-2.5 pr-3">{line.description}</td>
                  <td className="py-2.5 text-right tabular-nums">{line.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatMoney(line.unit_amount, invoice.currency)}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{formatMoney(line.quantity * line.unit_amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="pt-3 text-right font-semibold">
                  Total
                </th>
                <td className="pt-3 text-right font-display text-lg font-extrabold tabular-nums">{formatMoney(invoice.amount, invoice.currency)}</td>
              </tr>
            </tfoot>
          </table>
          {Math.abs(subtotal - invoice.amount) > 0.009 && (
            <p className="mt-2 text-xs text-muted-foreground">Includes adjustments of {formatMoney(invoice.amount - subtotal, invoice.currency)}.</p>
          )}
        </div>
        <DialogFooter>
          {payable ? <PayNowButton invoiceNumber={invoice.number} size="default" /> : <p className="text-sm text-muted-foreground">Thank you — this invoice is settled.</p>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReferralCard({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  };

  return (
    <section aria-labelledby="referral-title" className="slab relative overflow-hidden bg-forest p-6 text-white sm:p-8">
      <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-leaf/30 blur-2xl" />
      <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <GiftIcon className="size-3.5" /> Refer a family
          </span>
          <h2 id="referral-title" className="font-display text-2xl font-extrabold sm:text-3xl">
            Share Crystal, get a <span className="font-script font-normal text-sun">free week</span>
          </h2>
          <p className="max-w-lg text-sm text-white/80">
            When a family you refer completes their first paid month, we&apos;ll add a week of lessons to your account — on us.
          </p>
        </div>
        <div className="flex w-full min-w-0 gap-2 md:w-96">
          <label htmlFor="referral-link" className="sr-only">
            Your referral link
          </label>
          <Input id="referral-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="h-10 min-w-0 rounded-full border-white/30 bg-white/10 text-white" />
          <Button onClick={copy} className="h-10 shrink-0 rounded-full bg-white px-4 text-forest hover:bg-white/90">
            {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </section>
  );
}
