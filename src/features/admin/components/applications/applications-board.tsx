"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FileTextIcon, MailIcon, SendIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { saveApplicationReview, updateApplicationStatus } from "@/features/applications/admin-actions";
import { inviteStaff } from "@/features/staff/actions";
import { DetailList, SubjectChips } from "@/features/admin/components/detail-list";
import { humanise } from "@/features/admin/lib/labels";
import { applicationStatuses } from "@/features/admin/schemas";
import { formatInZone, relativeTime, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, TutorApplication } from "@/types/database";

const columns: { status: ApplicationStatus; label: string; hint: string; dot: string }[] = [
  { status: "new", label: "New", hint: "Just applied", dot: "bg-primary" },
  { status: "screening", label: "Screening", hint: "Checks & assessment", dot: "bg-sun" },
  { status: "interview", label: "Interview", hint: "Video call", dot: "bg-blush" },
  { status: "demo", label: "Demo lesson", hint: "Teach a sample", dot: "bg-sky" },
  { status: "approved", label: "Approved", hint: "Ready to onboard", dot: "bg-leaf" },
  { status: "rejected", label: "Rejected", hint: "Not this time", dot: "bg-muted-foreground/40" },
];

const pipeline: ApplicationStatus[] = ["new", "screening", "interview", "demo", "approved"];

function scoreTone(score: number | null) {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 80) return "bg-success/12 text-success";
  if (score >= 60) return "bg-sun/25 text-ink dark:text-sun";
  return "bg-destructive/10 text-destructive";
}

export function ApplicationsBoard({ applications, timezone }: { applications: TutorApplication[]; timezone: string }) {
  const [overrides, setOverrides] = useState<Record<string, Partial<TutorApplication>>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [approving, setApproving] = useState<TutorApplication | null>(null);
  const [inviting, startInvite] = useTransition();
  const [, startTransition] = useTransition();

  const rows = useMemo(() => applications.map((a) => ({ ...a, ...overrides[a.id] })), [applications, overrides]);
  const active = rows.find((a) => a.id === openId) ?? null;
  const patch = (id: string, values: Partial<TutorApplication>) =>
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...values } }));

  const move = (app: TutorApplication, status: ApplicationStatus) => {
    const previous = app.status;
    patch(app.id, { status });
    startTransition(async () => {
      const result = await updateApplicationStatus(app.id, status);
      if (!result.ok) {
        patch(app.id, { status: previous });
        toast.error(result.error);
        return;
      }
      if (status === "approved") setApproving({ ...app, status });
      else toast.success(`${app.full_name} moved to ${humanise(status).toLowerCase()}.`);
    });
  };

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" role="region" aria-label="Tutor application pipeline" tabIndex={0}>
        <div className="flex min-w-max gap-4">
          {columns.map((col) => {
            const cards = rows.filter((a) => a.status === col.status);
            return (
              <section key={col.status} aria-labelledby={`col-${col.status}`} className="flex w-[17rem] shrink-0 flex-col rounded-2xl bg-muted/50 p-3">
                <header className="flex items-center justify-between px-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", col.dot)} aria-hidden />
                    <h2 id={`col-${col.status}`} className="font-display text-sm font-bold">
                      {col.label}
                    </h2>
                    <span className="rounded-full bg-background px-2 text-xs font-medium tabular-nums">{cards.length}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{col.hint}</span>
                </header>
                <ul className="flex flex-1 flex-col gap-2.5">
                  {cards.map((app) => (
                    <li key={app.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(app.id)}
                        className="w-full rounded-xl border bg-card p-3.5 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar name={app.full_name} className="size-8" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{app.full_name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {app.qualification}
                              {app.degree_class ? ` · ${app.degree_class}` : ""}
                            </p>
                          </div>
                          <span className={cn("rounded-lg px-1.5 py-0.5 text-xs font-semibold tabular-nums", scoreTone(app.assessment_score))}>
                            {app.assessment_score ?? "–"}
                          </span>
                        </div>
                        <SubjectChips subjects={app.subjects} max={2} className="mt-3" />
                        <p className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{app.years_experience} yrs · {app.country}</span>
                          <span>{relativeTime(app.created_at)}</span>
                        </p>
                      </button>
                    </li>
                  ))}
                  {!cards.length && (
                    <li className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">Nobody here yet</li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <Sheet open={!!active} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          {active && (
            <ApplicationDetail
              key={active.id}
              app={active}
              timezone={timezone}
              onMove={(status) => move(active, status)}
              onSaved={(values) => patch(active.id, values)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!approving} onOpenChange={(open) => !open && setApproving(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <span className="mb-1 grid size-11 place-items-center rounded-2xl bg-leaf/12 text-leaf">
              <CheckIcon className="size-5" />
            </span>
            <DialogTitle className="font-display text-xl font-bold">{approving?.full_name} is approved</DialogTitle>
            <DialogDescription>
              Invite them to the team, then send them the sign-up link. When they sign up with {approving?.email} they get a tutor
              account automatically, fill in their profile and availability, and you publish them when ready.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
            <li>1. Create invite for {approving?.email}</li>
            <li>2. Tutor completes profile &amp; availability</li>
            <li>3. You review and publish their profile</li>
          </ol>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Later</Button>
            </DialogClose>
            <Button
              disabled={inviting}
              onClick={() => {
                if (!approving) return;
                const email = approving.email;
                startInvite(async () => {
                  const result = await inviteStaff({ email, role: "tutor" });
                  if (!result.ok) return void toast.error(result.error);
                  try {
                    await navigator.clipboard.writeText(`${window.location.origin}/signup`);
                  } catch {}
                  toast.success(`${email} invited as a tutor`, { description: "Sign-up link copied — send it to them with a welcome message." });
                  setApproving(null);
                });
              }}
            >
              <SendIcon data-icon="inline-start" />
              Create invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ApplicationDetail({
  app,
  timezone,
  onMove,
  onSaved,
}: {
  app: TutorApplication;
  timezone: string;
  onMove: (status: ApplicationStatus) => void;
  onSaved: (values: Partial<TutorApplication>) => void;
}) {
  const [score, setScore] = useState(app.assessment_score?.toString() ?? "");
  const [notes, setNotes] = useState(app.notes ?? "");
  const [saving, startSaving] = useTransition();

  const index = pipeline.indexOf(app.status);
  const previous = index > 0 ? pipeline[index - 1] : null;
  const next = index >= 0 && index < pipeline.length - 1 ? pipeline[index + 1] : null;
  const scoreNumber = score === "" ? null : Number(score);
  const scoreInvalid = scoreNumber !== null && (!Number.isInteger(scoreNumber) || scoreNumber < 0 || scoreNumber > 100);
  const dirty = score !== (app.assessment_score?.toString() ?? "") || notes !== (app.notes ?? "");

  const save = () =>
    startSaving(async () => {
      const result = await saveApplicationReview(app.id, { assessmentScore: scoreNumber, notes });
      if (result.ok) {
        onSaved({ assessment_score: scoreNumber, notes });
        toast.success(result.message ?? "Review saved.");
      } else toast.error(result.error);
    });

  return (
    <>
      <SheetHeader className="border-b p-5 pr-12">
        <div className="flex items-center gap-3">
          <UserAvatar name={app.full_name} className="size-12" />
          <div className="min-w-0">
            <SheetTitle className="font-display text-2xl font-bold">{app.full_name}</SheetTitle>
            <SheetDescription>
              Applied {formatInZone(app.created_at, timezone, "d MMM yyyy")} · {app.country}
            </SheetDescription>
          </div>
        </div>
        <div className="pt-2">
          <StatusBadge status={app.status} />
        </div>
      </SheetHeader>

      <div className="space-y-6 p-5">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Move stage</p>
          <div className="flex flex-wrap gap-2">
            {previous && app.status !== "rejected" && (
              <Button variant="outline" className="rounded-full" onClick={() => onMove(previous)}>
                <ArrowLeftIcon data-icon="inline-start" />
                {humanise(previous)}
              </Button>
            )}
            {next && (
              <Button className="rounded-full" onClick={() => onMove(next)}>
                {next === "approved" ? "Approve" : humanise(next)}
                {next === "approved" ? <CheckIcon data-icon="inline-end" /> : <ArrowRightIcon data-icon="inline-end" />}
              </Button>
            )}
            {app.status !== "rejected" && app.status !== "approved" && (
              <Button variant="destructive" className="rounded-full" onClick={() => onMove("rejected")}>
                <XIcon data-icon="inline-start" />
                Reject
              </Button>
            )}
            {app.status === "rejected" && (
              <Button variant="outline" className="rounded-full" onClick={() => onMove("screening")}>
                Reopen in screening
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Stages: {applicationStatuses.filter((s) => s !== "rejected").map(humanise).join(" → ")}
          </p>
        </div>

        <DetailList
          items={[
            { label: "Email", value: <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a> },
            { label: "Phone", value: app.phone },
            { label: "Qualification", value: app.qualification },
            { label: "Degree class", value: app.degree_class },
            { label: "Experience", value: `${app.years_experience} ${app.years_experience === 1 ? "year" : "years"}` },
            { label: "Local time", value: `${formatInZone(new Date(), app.timezone, "h:mm a")} ${shortZone(app.timezone)}` },
            { label: "Subjects", value: <SubjectChips subjects={app.subjects} /> },
            { label: "Levels", value: <SubjectChips subjects={app.levels} /> },
          ]}
        />

        {app.motivation && (
          <blockquote className="rounded-2xl bg-muted/60 p-4 text-sm italic">&ldquo;{app.motivation}&rdquo;</blockquote>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`mailto:${app.email}`}>
              <MailIcon data-icon="inline-start" />
              Email applicant
            </a>
          </Button>
          {app.cv_url && (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <a href={app.cv_url} target="_blank" rel="noreferrer">
                <FileTextIcon data-icon="inline-start" />
                View CV
              </a>
            </Button>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border p-4">
          <Field data-invalid={scoreInvalid || undefined}>
            <FieldLabel htmlFor="app-score">Assessment score</FieldLabel>
            <Input
              id="app-score"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              aria-invalid={scoreInvalid || undefined}
              className="w-32"
              placeholder="0–100"
            />
            <FieldDescription>Subject test + psychometric screen. 70+ usually goes through to interview.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="app-notes">Review notes</FieldLabel>
            <Textarea
              id="app-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interview impressions, references, safeguarding checks…"
              className="min-h-24"
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving || !dirty || scoreInvalid} className="rounded-full">
              {saving ? "Saving…" : "Save review"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
