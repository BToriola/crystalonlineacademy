import { AlertTriangleIcon, CalendarClockIcon, ReceiptIcon, WalletIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { siteConfig } from "@/config/site";
import { requireUser } from "@/features/auth/session";
import { listInvoices } from "@/features/billing/queries";
import { InvoiceDetailsDialog, PayNowButton, ReferralCard } from "@/features/parent/components/billing-actions";
import { currentYearIn } from "@/features/parent/data";
import { formatInZone, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";

export const metadata = { title: "Billing" };

const dayLabel = (date: string, tz: string) => formatInZone(`${date}T12:00:00Z`, tz, "d MMM yyyy");

function sumByCurrency(invoices: Invoice[]) {
  const totals = new Map<Invoice["currency"], number>();
  invoices.forEach((i) => totals.set(i.currency, (totals.get(i.currency) ?? 0) + i.amount));
  const parts = [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency));
  return parts.length ? parts.join(" + ") : formatMoney(0, "GBP");
}

export default async function ParentBillingPage() {
  const user = await requireUser("parent");
  const invoices = await listInvoices({ parentId: user.id });
  const year = currentYearIn(user.timezone);

  const paidThisYear = invoices.filter((i) => i.status === "paid" && i.paid_on?.startsWith(String(year)));
  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const nextDue = [...outstanding].sort((a, b) => a.due_on.localeCompare(b.due_on))[0];
  const referralLink = `${siteConfig.url}/book-trial?ref=${user.id.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase()}`;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Billing" description="Simple monthly invoices for every lesson your family takes. No contracts, no hidden fees." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={`Paid in ${year}`} value={sumByCurrency(paidThisYear)} icon={WalletIcon} tone="leaf" hint={`${paidThisYear.length} invoice${paidThisYear.length === 1 ? "" : "s"}`} />
        <StatCard
          label="Outstanding"
          value={sumByCurrency(outstanding)}
          icon={ReceiptIcon}
          tone={outstanding.some((i) => i.status === "overdue") ? "coral" : "primary"}
          hint={outstanding.length ? `${outstanding.length} to pay` : "You're all settled"}
        />
        <StatCard label="Next due" value={nextDue ? dayLabel(nextDue.due_on, user.timezone) : "—"} icon={CalendarClockIcon} tone="sun" hint={nextDue?.number} />
      </div>

      <section aria-labelledby="invoices-title" className="space-y-4">
        <h2 id="invoices-title" className="font-display text-2xl font-extrabold">
          Invoices
        </h2>
        {invoices.length ? (
          <ul className="space-y-3">
            {invoices.map((invoice) => {
              const payable = invoice.status === "sent" || invoice.status === "overdue";
              const due = dayLabel(invoice.due_on, user.timezone);
              const paid = invoice.paid_on ? dayLabel(invoice.paid_on, user.timezone) : null;
              return (
                <li
                  key={invoice.id}
                  className={cn(
                    "flex flex-col gap-4 rounded-3xl border bg-card p-4 sm:flex-row sm:items-center sm:p-5",
                    invoice.status === "overdue" && "border-destructive/40",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-muted">
                      {invoice.status === "overdue" ? <AlertTriangleIcon className="size-5 text-destructive" aria-hidden /> : <ReceiptIcon className="size-5 text-muted-foreground" aria-hidden />}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {invoice.period_label} <StatusBadge status={invoice.status} />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.number} · {paid ? `Paid ${paid}` : `${invoice.status === "overdue" ? "Was due" : "Due"} ${due}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="font-display text-2xl font-extrabold tabular-nums">{formatMoney(invoice.amount, invoice.currency)}</p>
                    <div className="flex gap-2">
                      <InvoiceDetailsDialog invoice={invoice} dueLabel={due} paidLabel={paid} />
                      {payable && <PayNowButton invoiceNumber={invoice.number} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={ReceiptIcon} title="No invoices yet" description="Your first invoice will appear here after your free trial lesson." />
        )}
      </section>

      <ReferralCard link={referralLink} />
    </div>
  );
}
