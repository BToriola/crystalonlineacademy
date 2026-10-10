"use client";

import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, ReceiptIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoiceSchema, type CreateInvoiceInput } from "@/features/admin/schemas";
import { createInvoice } from "@/features/billing/actions";
import { formatMoney } from "@/lib/format";

export type ParentOption = { id: string; name: string; currency: "GBP" | "CAD"; flag: string };

const emptyLine = { description: "", quantity: 4, unitAmount: 27 };

export function CreateInvoiceDialog({
  parents,
  defaultPeriod,
  defaultDueOn,
}: {
  parents: ParentOption[];
  defaultPeriod: string;
  defaultDueOn: string;
}) {
  const defaults: CreateInvoiceInput = { parentId: "", currency: "GBP", periodLabel: defaultPeriod, dueOn: defaultDueOn, lines: [emptyLine] };
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<CreateInvoiceInput>({ resolver: zodResolver(createInvoiceSchema), defaultValues: defaults });
  const lines = useFieldArray({ control: form.control, name: "lines" });
  const [watchedLines, currency] = useWatch({ control: form.control, name: ["lines", "currency"] });
  const total = (watchedLines ?? []).reduce((sum, l) => sum + (Number(l?.quantity) || 0) * (Number(l?.unitAmount) || 0), 0);
  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await createInvoice(values);
      if (result.ok) {
        toast.success(result.message ?? "Invoice created.");
        form.reset(defaults);
        setOpen(false);
      } else toast.error(result.error);
    }),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) form.reset(defaults);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <ReceiptIcon data-icon="inline-start" />
          Create invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">Create invoice</DialogTitle>
          <DialogDescription>It&apos;s sent to the family straight away and appears in their billing page.</DialogDescription>
        </DialogHeader>

        <form id="create-invoice" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <Controller
                control={form.control}
                name="parentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="invoice-parent">Family</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(id) => {
                        field.onChange(id);
                        const parent = parents.find((p) => p.id === id);
                        if (parent) form.setValue("currency", parent.currency);
                      }}
                    >
                      <SelectTrigger id="invoice-parent" className="w-full" aria-invalid={fieldState.invalid || undefined}>
                        <SelectValue placeholder="Choose a family" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span aria-hidden>{p.flag}</span> {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="invoice-currency">Currency</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="invoice-currency" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP £</SelectItem>
                        <SelectItem value="CAD">CAD $</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.periodLabel || undefined}>
                <FieldLabel htmlFor="invoice-period">Period</FieldLabel>
                <Input id="invoice-period" placeholder="November 2026" {...form.register("periodLabel")} aria-invalid={!!errors.periodLabel || undefined} />
                <FieldError errors={[errors.periodLabel]} />
              </Field>
              <Field data-invalid={!!errors.dueOn || undefined}>
                <FieldLabel htmlFor="invoice-due">Due date</FieldLabel>
                <Input id="invoice-due" type="date" {...form.register("dueOn")} aria-invalid={!!errors.dueOn || undefined} />
                <FieldError errors={[errors.dueOn]} />
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">Line items</FieldLegend>
              <div className="space-y-3">
                {lines.fields.map((line, index) => {
                  const lineErrors = errors.lines?.[index];
                  const qty = Number(watchedLines?.[index]?.quantity) || 0;
                  const unit = Number(watchedLines?.[index]?.unitAmount) || 0;
                  return (
                    <div key={line.id} className="rounded-xl border bg-muted/30 p-3">
                      <div className="grid gap-3 sm:grid-cols-[1fr_5rem_6.5rem_auto] sm:items-start">
                        <Field data-invalid={!!lineErrors?.description || undefined}>
                          <FieldLabel htmlFor={`line-${index}-desc`} className="sr-only sm:not-sr-only sm:text-xs">
                            Description
                          </FieldLabel>
                          <Input
                            id={`line-${index}-desc`}
                            placeholder="Maths — Maya (8 × 60 min)"
                            {...form.register(`lines.${index}.description`)}
                            aria-invalid={!!lineErrors?.description || undefined}
                          />
                          <FieldError errors={[lineErrors?.description]} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3 sm:contents">
                          <Field data-invalid={!!lineErrors?.quantity || undefined}>
                            <FieldLabel htmlFor={`line-${index}-qty`} className="text-xs">
                              Qty
                            </FieldLabel>
                            <Input
                              id={`line-${index}-qty`}
                              type="number"
                              min={1}
                              inputMode="numeric"
                              {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })}
                              aria-invalid={!!lineErrors?.quantity || undefined}
                            />
                            <FieldError errors={[lineErrors?.quantity]} />
                          </Field>
                          <Field data-invalid={!!lineErrors?.unitAmount || undefined}>
                            <FieldLabel htmlFor={`line-${index}-unit`} className="text-xs">
                              Unit price
                            </FieldLabel>
                            <Input
                              id={`line-${index}-unit`}
                              type="number"
                              min={0}
                              step="0.01"
                              inputMode="decimal"
                              {...form.register(`lines.${index}.unitAmount`, { valueAsNumber: true })}
                              aria-invalid={!!lineErrors?.unitAmount || undefined}
                            />
                            <FieldError errors={[lineErrors?.unitAmount]} />
                          </Field>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:pt-6">
                          <span className="text-sm font-medium tabular-nums">{formatMoney(qty * unit, currency)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full"
                            onClick={() => lines.remove(index)}
                            disabled={lines.fields.length === 1}
                            aria-label={`Remove line ${index + 1}`}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <FieldError errors={[errors.lines?.root ?? (errors.lines?.message ? { message: errors.lines.message } : undefined)]} />
              <Button type="button" variant="outline" size="sm" className="w-fit rounded-full" onClick={() => lines.append({ ...emptyLine, description: "" })}>
                <PlusIcon data-icon="inline-start" />
                Add line
              </Button>
            </FieldSet>

            <div className="flex items-center justify-between rounded-2xl bg-primary/8 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-extrabold tabular-nums">{formatMoney(total, currency)}</span>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="create-invoice" disabled={pending}>
            {pending ? "Creating…" : "Create & send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
