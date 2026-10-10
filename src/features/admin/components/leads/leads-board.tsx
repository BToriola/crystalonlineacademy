"use client";

import { useMemo, useState, useTransition } from "react";
import { InboxIcon, MailIcon, SearchIcon, UserRoundPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DetailList, SubjectChips } from "@/features/admin/components/detail-list";
import { flagFor, humanise, whatsappLink } from "@/features/admin/lib/labels";
import { leadStatuses } from "@/features/admin/schemas";
import { saveLeadNotes, updateLeadStatus } from "@/features/leads/admin-actions";
import { formatInZone, relativeTime, shortZone } from "@/lib/format";
import type { Lead, LeadStatus } from "@/types/database";

type Filter = "all" | LeadStatus;

export function LeadsBoard({ leads, timezone }: { leads: Lead[]; timezone: string }) {
  const [overrides, setOverrides] = useState<Record<string, Partial<Lead>>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => leads.map((l) => ({ ...l, ...overrides[l.id] })), [leads, overrides]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const l of rows) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const visible = rows.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [l.parent_name, l.child_name, l.email, l.year_group, ...l.subjects].some((v) => v.toLowerCase().includes(q));
  });

  const active = rows.find((l) => l.id === openId) ?? null;
  const patch = (id: string, values: Partial<Lead>) => setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...values } }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="h-9">
            {(["all", ...leadStatuses] as const).map((s) => (
              <TabsTrigger key={s} value={s} className="px-3">
                {s === "all" ? "All" : humanise(s)}
                <span className="ml-1 text-xs text-muted-foreground tabular-nums">{counts[s] ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="h-9 w-full rounded-full lg:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parent, child, subject…"
            aria-label="Search trial requests"
          />
        </InputGroup>
      </div>

      <Card className="gap-0 overflow-hidden rounded-2xl py-0">
        {visible.length ? (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-5">Parent</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer" onClick={() => setOpenId(lead.id)}>
                  <TableCell className="py-3 pl-5">
                    <button
                      type="button"
                      className="text-left font-medium hover:text-primary focus-visible:underline focus-visible:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(lead.id);
                      }}
                    >
                      {lead.parent_name}
                    </button>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{lead.child_name}</p>
                    <p className="text-xs text-muted-foreground">{lead.year_group}</p>
                  </TableCell>
                  <TableCell>
                    <SubjectChips subjects={lead.subjects} max={2} />
                  </TableCell>
                  <TableCell>
                    <span className="mr-1.5" aria-hidden>
                      {flagFor(lead.country)}
                    </span>
                    <span className="text-muted-foreground">{shortZone(lead.timezone)}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{relativeTime(lead.created_at)}</TableCell>
                  <TableCell className="pr-5">
                    <StatusBadge status={lead.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <InboxIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No trial requests match</p>
            <p className="text-sm text-muted-foreground">Try a different status or clear the search.</p>
          </div>
        )}
      </Card>

      <Sheet open={!!active} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          {active && <LeadDetail key={active.id} lead={active} timezone={timezone} onPatch={(v) => patch(active.id, v)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LeadDetail({ lead, timezone, onPatch }: { lead: Lead; timezone: string; onPatch: (values: Partial<Lead>) => void }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [savingNotes, startSaving] = useTransition();
  const firstName = lead.parent_name.split(" ")[0];
  const greeting = `Hi ${firstName}, thank you for requesting a free trial for ${lead.child_name} with Crystal Online Academy.`;

  const changeStatus = (status: string) => {
    const previous = lead.status;
    onPatch({ status: status as LeadStatus });
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, status);
      if (result.ok) toast.success(result.message ?? "Status updated.");
      else {
        onPatch({ status: previous });
        toast.error(result.error);
      }
    });
  };

  const save = () =>
    startSaving(async () => {
      const result = await saveLeadNotes(lead.id, notes);
      if (result.ok) {
        onPatch({ notes });
        toast.success(result.message ?? "Notes saved.");
      } else toast.error(result.error);
    });

  return (
    <>
      <SheetHeader className="border-b p-5 pr-12">
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          <span className="text-xs text-muted-foreground">Received {formatInZone(lead.created_at, timezone, "d MMM, h:mm a")}</span>
        </div>
        <SheetTitle className="font-display text-2xl font-bold">{lead.parent_name}</SheetTitle>
        <SheetDescription>
          Trial request for {lead.child_name} · {lead.year_group}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 p-5">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your free trial for ${lead.child_name}`)}&body=${encodeURIComponent(greeting)}`}>
              <MailIcon data-icon="inline-start" />
              Email
            </a>
          </Button>
          {lead.phone && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={whatsappLink(lead.phone, greeting)} target="_blank" rel="noreferrer">
                <WhatsappIcon className="size-4" />
                WhatsApp
              </a>
            </Button>
          )}
          <Button
            className="rounded-full"
            onClick={() =>
              toast.success(`${lead.parent_name}'s family is ready to set up`, {
                description: "In the live app this creates a parent account and sends them an invite to set a password.",
              })
            }
          >
            <UserRoundPlusIcon data-icon="inline-start" />
            Convert to family
          </Button>
        </div>

        <Field>
          <FieldLabel htmlFor="lead-status">Status</FieldLabel>
          <Select value={lead.status} onValueChange={changeStatus} disabled={pending}>
            <SelectTrigger id="lead-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {humanise(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DetailList
          items={[
            { label: "Email", value: <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a> },
            { label: "Phone", value: lead.phone },
            { label: "Country", value: `${flagFor(lead.country)} ${lead.country === "UK" ? "United Kingdom" : lead.country === "CA" ? "Canada" : lead.country}` },
            { label: "Family's time", value: `${formatInZone(new Date(), lead.timezone, "h:mm a")} ${shortZone(lead.timezone)}` },
            { label: "Child", value: `${lead.child_name} · ${lead.year_group}` },
            { label: "Heard about us", value: lead.heard_from },
            { label: "Subjects", value: <SubjectChips subjects={lead.subjects} /> },
            { label: "Preferred times", value: lead.preferred_times },
          ]}
        />

        <div className="space-y-1 rounded-2xl bg-muted/60 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Goals</p>
          <p className="text-sm">{lead.goals ?? "No goals shared yet — worth asking on the first call."}</p>
        </div>

        <Field>
          <FieldLabel htmlFor="lead-notes">Internal notes</FieldLabel>
          <Textarea
            id="lead-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Call outcomes, tutor preferences, anything the team should know…"
            className="min-h-28"
          />
          <div className="flex justify-end">
            <Button onClick={save} disabled={savingNotes || notes === (lead.notes ?? "")} className="rounded-full">
              {savingNotes ? "Saving…" : "Save notes"}
            </Button>
          </div>
        </Field>
      </div>
    </>
  );
}
