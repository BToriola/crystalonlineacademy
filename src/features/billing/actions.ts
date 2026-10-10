"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInvoiceSchema, type CreateInvoiceInput } from "@/features/admin/schemas";
import { requireUser } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { demoResult } from "@/lib/action-result";
import { isDemoMode } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

function invoiceTotal(lines: CreateInvoiceInput["lines"]) {
  return Math.round(lines.reduce((sum, l) => sum + l.quantity * l.unitAmount, 0) * 100) / 100;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const amount = invoiceTotal(parsed.data.lines);
  if (isDemoMode) return demoResult(`Invoice for ${formatMoney(amount, parsed.data.currency)} created (demo mode — nothing was stored).`);

  const supabase = await createClient();
  const year = new Date().getUTCFullYear();
  const { count } = await supabase.from("invoices").select("id", { count: "exact", head: true }).like("number", `COA-${year}-%`);
  const number = `COA-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { error } = await supabase.from("invoices").insert({
    number,
    parent_id: parsed.data.parentId,
    currency: parsed.data.currency,
    amount,
    status: "sent",
    period_label: parsed.data.periodLabel,
    due_on: parsed.data.dueOn,
    lines: parsed.data.lines.map((l) => ({ description: l.description, quantity: l.quantity, unit_amount: l.unitAmount })),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  return { ok: true, message: `Invoice ${number} created.` };
}

export async function markInvoicePaid(id: string): Promise<ActionResult> {
  await requireUser("admin");
  const parsed = z.string().min(1).safeParse(id);
  if (!parsed.success) return { ok: false, error: "Invoice not found." };
  if (isDemoMode) return demoResult("Marked as paid (demo mode — nothing was stored).");

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_on: new Date().toISOString().slice(0, 10) })
    .eq("id", parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  return { ok: true, message: "Marked as paid." };
}
