"use client";

import { useState } from "react";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { Role } from "@/types/database";

type Pref = { key: string; label: string; description: string; roles: Role[]; on: boolean };

const prefs: Pref[] = [
  { key: "reminders", label: "Lesson reminders", description: "A nudge 1 hour before each lesson, in your time zone.", roles: ["parent", "tutor", "admin"], on: true },
  { key: "messages", label: "New messages", description: "An email when someone messages you and you haven't seen it.", roles: ["parent", "tutor", "admin"], on: true },
  { key: "reports", label: "Progress reports", description: "Hear as soon as a new report is published.", roles: ["parent"], on: true },
  { key: "billing", label: "Invoices & payments", description: "Receipts and gentle reminders before an invoice is due.", roles: ["parent"], on: true },
  { key: "schedule", label: "Schedule changes", description: "When a lesson is added, moved or cancelled.", roles: ["tutor", "admin"], on: true },
  { key: "digest", label: "Weekly summary", description: "One friendly email every Sunday with the week ahead.", roles: ["parent", "tutor", "admin"], on: false },
];

export function NotificationsCard({ role }: { role: Role }) {
  const visible = prefs.filter((p) => p.roles.includes(role));
  const [state, setState] = useState<Record<string, boolean>>(() => Object.fromEntries(visible.map((p) => [p.key, p.on])));

  return (
    <FieldGroup className="gap-4">
      {visible.map((p) => (
        <Field key={p.key} orientation="horizontal" className="rounded-2xl border p-4">
          <FieldContent>
            <FieldLabel htmlFor={`notify-${p.key}`}>{p.label}</FieldLabel>
            <FieldDescription>{p.description}</FieldDescription>
          </FieldContent>
          <Switch id={`notify-${p.key}`} checked={state[p.key]} onCheckedChange={(v) => setState((s) => ({ ...s, [p.key]: v }))} />
        </Field>
      ))}
      <p className="text-xs text-muted-foreground">Preview: these preferences aren&rsquo;t saved yet — email delivery settings are coming soon.</p>
    </FieldGroup>
  );
}
