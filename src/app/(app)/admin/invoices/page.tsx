import Link from "next/link";
import { addDays, addMonths, format } from "date-fns";
import { AlertCircleIcon, CircleDollarSignIcon, ReceiptIcon, WalletIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateInvoiceDialog, type ParentOption } from "@/features/admin/components/invoices/create-invoice-dialog";
import { MarkPaidButton } from "@/features/admin/components/invoices/mark-paid-button";
import { Person } from "@/features/admin/components/person";
import { flagFor, humanise } from "@/features/admin/lib/labels";
import { nowInZone } from "@/features/admin/lib/time";
import { invoiceStatuses } from "@/features/admin/schemas";
import { requireUser } from "@/features/auth/session";
import { listInvoices } from "@/features/billing/queries";
import { getProfilesByIds, listParents } from "@/features/profiles/queries";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/database";

export const metadata = { title: "Invoices" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function sumBy(invoices: Invoice[], currency: Invoice["currency"]) {
  return invoices.filter((i) => i.currency === currency).reduce((s, i) => s + Number(i.amount), 0);
}

function dateLabel(date: string) {
  return format(new Date(`${date}T12:00:00Z`), "d MMM yyyy");
}

export default async function AdminInvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser("admin");
  const raw = (await searchParams).status;
  const statusParam = Array.isArray(raw) ? raw[0] : raw;
  const status = statusParam && (invoiceStatuses as readonly string[]).includes(statusParam) ? statusParam : "all";

  const [invoices, parents] = await Promise.all([listInvoices(), listParents()]);
  const profiles = await getProfilesByIds(invoices.map((i) => i.parent_id));

  const paid = invoices.filter((i) => i.status === "paid");
  const open = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const rows = status === "all" ? invoices : invoices.filter((i) => i.status === status);
  const counts = Object.fromEntries(invoiceStatuses.map((s) => [s, invoices.filter((i) => i.status === s).length]));

  const parentOptions: ParentOption[] = parents.map((p) => ({
    id: p.id,
    name: p.full_name,
    currency: p.country === "CA" ? "CAD" : "GBP",
    flag: flagFor(p.country),
  }));
  const today = nowInZone(user.timezone);
  const nextMonth = addMonths(today, 1);

  const money = (gbp: number, cad: number) => (
    <span className="flex flex-wrap items-baseline gap-x-3">
      <span>{formatMoney(gbp, "GBP")}</span>
      <span className="text-xl text-muted-foreground">{formatMoney(cad, "CAD")}</span>
    </span>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy"
        title="Invoices"
        description="Monthly billing for every family, in pounds for the UK and dollars for Canada."
        actions={
          <CreateInvoiceDialog
            parents={parentOptions}
            defaultPeriod={format(nextMonth, "MMMM yyyy")}
            defaultDueOn={format(addDays(today, 14), "yyyy-MM-dd")}
          />
        }
      />

      <section aria-label="Totals by currency" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Collected" value={money(sumBy(paid, "GBP"), sumBy(paid, "CAD"))} hint={`${paid.length} paid invoices`} icon={WalletIcon} tone="leaf" className="rounded-2xl" />
        <StatCard label="Outstanding" value={money(sumBy(open, "GBP"), sumBy(open, "CAD"))} hint={`${open.length} awaiting payment`} icon={CircleDollarSignIcon} tone="primary" className="rounded-2xl" />
        <StatCard
          label="Overdue"
          value={money(sumBy(overdue, "GBP"), sumBy(overdue, "CAD"))}
          hint={overdue.length ? `${overdue.length} past the due date — send a gentle reminder` : "Nothing overdue"}
          icon={AlertCircleIcon}
          tone="coral"
          className="rounded-2xl"
        />
      </section>

      <div className="space-y-4">
        <nav aria-label="Filter by status" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {(["all", ...invoiceStatuses] as const).map((s) => (
            <Link
              key={s}
              href={s === "all" ? "/admin/invoices" : `/admin/invoices?status=${s}`}
              aria-current={status === s ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                status === s && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {s === "all" ? "All" : humanise(s)}
              <span className={cn("text-xs tabular-nums", status === s ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {s === "all" ? invoices.length : counts[s]}
              </span>
            </Link>
          ))}
        </nav>

        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          {rows.length ? (
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">Invoice</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((inv) => {
                  const parent = profiles[inv.parent_id];
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="py-3 pl-5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} className="cursor-default font-mono text-sm font-medium underline decoration-dotted underline-offset-4">
                              {inv.number}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-72">
                            <ul className="space-y-0.5">
                              {inv.lines.map((l, i) => (
                                <li key={i}>
                                  {l.description} — {l.quantity} × {formatMoney(Number(l.unit_amount), inv.currency)}
                                </li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-muted-foreground">{inv.lines.length} {inv.lines.length === 1 ? "line" : "lines"}</p>
                      </TableCell>
                      <TableCell>
                        <Person
                          name={parent?.full_name ?? "Unknown family"}
                          src={parent?.avatar_url}
                          sub={parent ? `${flagFor(parent.country)} ${parent.email}` : undefined}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>{inv.period_label}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatMoney(Number(inv.amount), inv.currency)}</TableCell>
                      <TableCell>
                        <p className={cn(inv.status === "overdue" && "font-medium text-destructive")}>{dateLabel(inv.due_on)}</p>
                        {inv.paid_on && <p className="text-xs text-muted-foreground">Paid {dateLabel(inv.paid_on)}</p>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        {inv.status !== "paid" && inv.status !== "draft" && <MarkPaidButton id={inv.id} number={inv.number} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <ReceiptIcon className="size-8 text-muted-foreground" />
              <p className="font-medium">No {status === "all" ? "" : `${humanise(status).toLowerCase()} `}invoices</p>
              <p className="text-sm text-muted-foreground">Create one with the button above.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
