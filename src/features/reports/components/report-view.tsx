import { CalendarIcon, CheckIcon, QuoteIcon, TargetIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import type { ProgressReport, SkillStatus } from "@/types/database";

const skillTone: Record<SkillStatus, { label: string; className: string; bar: string; width: string }> = {
  mastered: { label: "Mastered", className: "bg-success/12 text-success", bar: "bg-success", width: "w-full" },
  improving: { label: "Improving", className: "bg-primary/10 text-primary", bar: "bg-primary", width: "w-2/3" },
  needs_support: { label: "Needs support", className: "bg-coral/12 text-coral", bar: "bg-coral", width: "w-1/3" },
};

type ReportViewProps = {
  report: ProgressReport;
  studentName: string;
  yearGroup?: string;
  tutorName: string;
  schedule?: string;
  className?: string;
};

export function ReportView({ report, studentName, yearGroup, tutorName, schedule, className }: ReportViewProps) {
  return (
    <article className={cn("grid overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xl shadow-ink/5 md:grid-cols-2", className)}>
      <div className="space-y-6 bg-sand/60 p-6 sm:p-8">
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">{report.period_label}</p>
          <h3 className="font-display text-2xl font-extrabold">
            {studentName}
            <span className="font-sans text-base font-normal text-muted-foreground">
              {" "}· {report.subject}
              {yearGroup && ` · ${yearGroup}`}
            </span>
          </h3>
        </header>

        <div className="rounded-2xl bg-card p-4">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <TargetIcon className="size-3.5" /> Current focus
          </p>
          <p className="font-medium">{report.current_focus}</p>
          {report.curriculum_ref && <p className="mt-1 text-sm text-muted-foreground">{report.curriculum_ref}</p>}
          {report.next_assessment && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sun/25 px-2.5 py-1 text-xs font-medium">
              <CalendarIcon className="size-3" /> {report.next_assessment}
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {report.skills.map((skill) => {
            const tone = skillTone[skill.status];
            return (
              <li key={skill.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{skill.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone.className)}>{tone.label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", tone.bar, tone.width)} />
                </div>
              </li>
            );
          })}
        </ul>

        <blockquote className="relative rounded-2xl bg-card p-4 pl-11 text-sm leading-relaxed">
          <QuoteIcon className="absolute top-4 left-4 size-4 text-coral" />
          {report.recommendation}
          <footer className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground">
            <UserAvatar name={tutorName} seed={report.tutor_id} className="size-6" />
            {tutorName}
            {schedule && <span className="font-normal text-muted-foreground">· {schedule}</span>}
          </footer>
        </blockquote>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="font-display text-3xl font-extrabold">{report.attendance_rate}%</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs text-muted-foreground">Effort</p>
            <p className="font-display text-3xl font-extrabold">
              {report.effort_score}
              <span className="text-base text-muted-foreground">/5</span>
            </p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Roadmap</p>
          <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
            {report.roadmap.map((step) => (
              <li key={step.title} className="relative flex items-center gap-3">
                <span
                  className={cn(
                    "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 bg-card",
                    step.status === "done" && "border-success bg-success text-white",
                    step.status === "current" && "border-primary ring-4 ring-primary/15",
                  )}
                >
                  {step.status === "done" && <CheckIcon className="size-3.5" />}
                  {step.status === "current" && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className={cn("text-sm", step.status === "upcoming" && "text-muted-foreground", step.status === "current" && "font-semibold")}>
                  {step.title}
                  {step.status === "current" && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Now</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}
