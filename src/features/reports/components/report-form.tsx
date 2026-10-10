"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, Loader2Icon, PencilIcon, PlusIcon, SaveIcon, SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { publishReport, saveReport } from "@/features/reports/actions";
import { cn } from "@/lib/utils";
import type { ProgressReport } from "@/types/database";
import { reportSchema, type ReportFormValues } from "./report-schema";
import { ReportView } from "./report-view";

export type ReportStudentOption = { id: string; name: string; yearGroup: string; subjects: string[] };

type Props = {
  students: ReportStudentOption[];
  tutorId: string;
  tutorName: string;
  initial?: ReportFormValues;
  defaultStudentId?: string;
  published?: boolean;
};

const skillStatuses = [
  { value: "mastered", label: "Mastered" },
  { value: "improving", label: "Improving" },
  { value: "needs_support", label: "Needs support" },
] as const;

const milestoneStatuses = [
  { value: "done", label: "Done" },
  { value: "current", label: "Current" },
  { value: "upcoming", label: "Upcoming" },
] as const;

function blankValues(student?: ReportStudentOption): ReportFormValues {
  return {
    student_id: student?.id ?? "",
    subject: student?.subjects[0] ?? "",
    period_label: "",
    current_focus: "",
    curriculum_ref: "",
    next_assessment: "",
    skills: [{ name: "", status: "improving" }],
    roadmap: [
      { title: "", status: "done" },
      { title: "", status: "current" },
      { title: "", status: "upcoming" },
    ],
    recommendation: "",
    attendance_rate: 100,
    effort_score: 4,
  };
}

function LivePreview({ control, students, tutorId, tutorName }: { control: Control<ReportFormValues>; students: ReportStudentOption[]; tutorId: string; tutorName: string }) {
  const v = useWatch({ control });
  const student = students.find((s) => s.id === v.student_id);
  const seen = new Set<string>();
  const unique = <T extends { key: string }>(items: T[]) => items.filter((i) => (seen.has(i.key) ? false : (seen.add(i.key), true)));

  const report: ProgressReport = {
    id: v.id ?? "preview",
    student_id: v.student_id ?? "",
    tutor_id: tutorId,
    subject: v.subject || "Subject",
    period_label: v.period_label || "Reporting period",
    current_focus: v.current_focus || "What you're working on right now",
    curriculum_ref: v.curriculum_ref || null,
    next_assessment: v.next_assessment || null,
    skills: unique(
      (v.skills ?? [])
        .filter((s) => s?.name?.trim())
        .map((s) => ({ key: `s:${s!.name}`, name: s!.name!, status: s!.status ?? "improving" })),
    ).map(({ name, status }) => ({ name, status })),
    roadmap: unique(
      (v.roadmap ?? [])
        .filter((m) => m?.title?.trim())
        .map((m) => ({ key: `m:${m!.title}`, title: m!.title!, status: m!.status ?? "upcoming" })),
    ).map(({ title, status }) => ({ title, status })),
    recommendation: v.recommendation || "Your advice for the family will appear here.",
    attendance_rate: Number.isFinite(v.attendance_rate) ? (v.attendance_rate as number) : 0,
    effort_score: v.effort_score ?? 0,
    published_at: null,
    created_at: new Date(0).toISOString(),
  };

  return (
    <ReportView
      report={report}
      studentName={student?.name ?? "Your student"}
      yearGroup={student?.yearGroup}
      tutorName={tutorName}
      className="md:grid-cols-1 2xl:grid-cols-2"
    />
  );
}

export function ReportForm({ students, tutorId, tutorName, initial, defaultStudentId, published = false }: Props) {
  const router = useRouter();
  const uid = useId();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"save" | "publish" | null>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: initial ?? blankValues(students.find((s) => s.id === defaultStudentId) ?? (students.length === 1 ? students[0] : undefined)),
  });
  const skills = useFieldArray({ control: form.control, name: "skills" });
  const roadmap = useFieldArray({ control: form.control, name: "roadmap" });
  const errors = form.formState.errors;
  const studentId = useWatch({ control: form.control, name: "student_id" });
  const subjectOptions = students.find((s) => s.id === studentId)?.subjects ?? [];

  const submit = (mode: "save" | "publish") =>
    form.handleSubmit(
      (values) => {
        setPendingAction(mode);
        startTransition(async () => {
          const result = await (mode === "publish" ? publishReport(values) : saveReport(values));
          setPendingAction(null);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(result.message ?? "Saved");
          const id = result.data?.id;
          if (!initial?.id && id && id !== "demo") router.push(`/tutor/reports/${id}`);
          else if (!initial?.id) router.push("/tutor/reports");
          else router.refresh();
        });
      },
      () => {
        setView("edit");
        toast.error("A few fields need attention before saving.");
      },
    )();

  const fid = (name: string) => `${uid}-${name}`;

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Edit or preview" className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 xl:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium text-muted-foreground transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              view === v && "bg-background text-foreground shadow-sm",
            )}
          >
            {v === "edit" ? <PencilIcon className="size-4" /> : <EyeIcon className="size-4" />}
            {v === "edit" ? "Edit" : "Live preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit(published ? "save" : "publish");
          }}
          className={cn("rounded-3xl border bg-card p-5 sm:p-6", view === "preview" && "hidden xl:block")}
        >
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="student_id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={fid("student")}>Student</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const subjects = students.find((s) => s.id === value)?.subjects ?? [];
                        if (subjects.length && !subjects.includes(form.getValues("subject"))) form.setValue("subject", subjects[0]);
                      }}
                      disabled={!!initial?.id}
                    >
                      <SelectTrigger id={fid("student")} className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} · {s.yearGroup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field data-invalid={!!errors.subject}>
                <FieldLabel htmlFor={fid("subject")}>Subject</FieldLabel>
                <Input id={fid("subject")} list={fid("subjects")} aria-invalid={!!errors.subject} {...form.register("subject")} />
                <datalist id={fid("subjects")}>
                  {subjectOptions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <FieldError errors={[errors.subject]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.period_label}>
              <FieldLabel htmlFor={fid("period")}>Period</FieldLabel>
              <Input id={fid("period")} placeholder="Autumn term · Weeks 1–6" aria-invalid={!!errors.period_label} {...form.register("period_label")} />
              <FieldError errors={[errors.period_label]} />
            </Field>

            <Field data-invalid={!!errors.current_focus}>
              <FieldLabel htmlFor={fid("focus")}>Current focus</FieldLabel>
              <Input id={fid("focus")} placeholder="e.g. Multi-step word problems" aria-invalid={!!errors.current_focus} {...form.register("current_focus")} />
              <FieldError errors={[errors.current_focus]} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor={fid("curriculum")}>Curriculum reference</FieldLabel>
                <Input id={fid("curriculum")} placeholder="KS3 Algebra — solving equations" {...form.register("curriculum_ref")} />
              </Field>
              <Field>
                <FieldLabel htmlFor={fid("assessment")}>Next assessment</FieldLabel>
                <Input id={fid("assessment")} placeholder="Class test in 2 weeks" {...form.register("next_assessment")} />
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">Skills</FieldLegend>
              <FieldDescription>How each skill is coming along.</FieldDescription>
              <ul className="space-y-2">
                {skills.fields.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Input
                        aria-label={`Skill ${index + 1} name`}
                        placeholder="e.g. Fractions & decimals"
                        aria-invalid={!!errors.skills?.[index]?.name}
                        {...form.register(`skills.${index}.name`)}
                      />
                      <FieldError errors={[errors.skills?.[index]?.name]} className="mt-1 text-xs" />
                    </div>
                    <Controller
                      control={form.control}
                      name={`skills.${index}.status`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-36 shrink-0" aria-label={`Skill ${index + 1} status`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {skillStatuses.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => skills.remove(index)}
                      disabled={skills.fields.length === 1}
                      aria-label={`Remove skill ${index + 1}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ul>
              <FieldError errors={[errors.skills?.root ?? (errors.skills?.message ? errors.skills : undefined)]} />
              <Button type="button" variant="outline" size="sm" className="w-fit rounded-full" onClick={() => skills.append({ name: "", status: "improving" })}>
                <PlusIcon /> Add skill
              </Button>
            </FieldSet>

            <FieldSet>
              <FieldLegend variant="label">Roadmap</FieldLegend>
              <FieldDescription>The journey so far and what comes next.</FieldDescription>
              <ol className="space-y-2">
                {roadmap.fields.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="mt-2 grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <Input
                        aria-label={`Milestone ${index + 1} title`}
                        placeholder="e.g. Writing two-step equations"
                        aria-invalid={!!errors.roadmap?.[index]?.title}
                        {...form.register(`roadmap.${index}.title`)}
                      />
                      <FieldError errors={[errors.roadmap?.[index]?.title]} className="mt-1 text-xs" />
                    </div>
                    <Controller
                      control={form.control}
                      name={`roadmap.${index}.status`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-32 shrink-0" aria-label={`Milestone ${index + 1} status`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {milestoneStatuses.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => roadmap.remove(index)}
                      disabled={roadmap.fields.length === 1}
                      aria-label={`Remove milestone ${index + 1}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ol>
              <FieldError errors={[errors.roadmap?.root ?? (errors.roadmap?.message ? errors.roadmap : undefined)]} />
              <Button type="button" variant="outline" size="sm" className="w-fit rounded-full" onClick={() => roadmap.append({ title: "", status: "upcoming" })}>
                <PlusIcon /> Add milestone
              </Button>
            </FieldSet>

            <Field data-invalid={!!errors.recommendation}>
              <FieldLabel htmlFor={fid("recommendation")}>Recommendation for the family</FieldLabel>
              <Textarea
                id={fid("recommendation")}
                rows={4}
                placeholder="One or two practical things they can do at home this month…"
                aria-invalid={!!errors.recommendation}
                {...form.register("recommendation")}
              />
              <FieldError errors={[errors.recommendation]} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.attendance_rate}>
                <FieldLabel htmlFor={fid("attendance")}>Attendance %</FieldLabel>
                <Input
                  id={fid("attendance")}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  aria-invalid={!!errors.attendance_rate}
                  {...form.register("attendance_rate", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.attendance_rate && { message: "Enter a number from 0 to 100" }]} />
              </Field>
              <Controller
                control={form.control}
                name="effort_score"
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant="label">Effort</FieldLegend>
                    <div role="group" aria-label="Effort score" className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          aria-pressed={field.value === n}
                          onClick={() => field.onChange(n)}
                          className={cn(
                            "grid size-9 place-items-center rounded-xl border text-sm font-semibold transition hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                            field.value === n && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </FieldSet>
                )}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              {!published && (
                <Button type="button" variant="outline" className="h-11 rounded-full px-6" disabled={pending} onClick={() => void submit("save")}>
                  {pendingAction === "save" ? <Loader2Icon className="animate-spin" /> : <SaveIcon />} Save draft
                </Button>
              )}
              <Button type="submit" className="h-11 rounded-full px-6" disabled={pending}>
                {pendingAction === (published ? "save" : "publish") ? <Loader2Icon className="animate-spin" /> : published ? <SaveIcon /> : <SendIcon />}
                {published ? "Save changes" : "Publish to family"}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <aside aria-label="Live preview" className={cn("space-y-3 xl:sticky xl:top-20 xl:self-start", view === "edit" && "hidden xl:block")}>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            <EyeIcon className="size-3.5" /> Live preview — what the family sees
          </p>
          <LivePreview control={form.control} students={students} tutorId={tutorId} tutorName={tutorName} />
        </aside>
      </div>
    </div>
  );
}
