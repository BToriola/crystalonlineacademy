import { CalendarCheckIcon, MessagesSquareIcon, NotebookPenIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ReportView } from "@/features/reports/components/report-view";
import { demoReports } from "@/lib/demo/data";
import { RotateIn } from "./rotate-in";

const points = [
  {
    icon: NotebookPenIcon,
    title: "Notes after every session",
    body: "What they covered, how they found it and the homework set — waiting in your portal the same evening.",
  },
  {
    icon: CalendarCheckIcon,
    title: "A proper monthly report",
    body: "Skills mastered, skills in progress and the next steps on their roadmap, mapped to the curriculum.",
  },
  {
    icon: MessagesSquareIcon,
    title: "A direct line to the tutor",
    body: "Message your child's tutor any time. Replies arrive in your inbox, timestamped in your own time zone.",
  },
];

export function ProgressShowcase() {
  return (
    <section className="overflow-hidden px-3 py-6 sm:px-5">
      <div className="relative slab bg-leaf py-24 text-white sm:py-32">
        <Sparkle className="absolute top-14 right-[7%] size-9 animate-float" />
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
            <Reveal>
              <p className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Progress you can see</p>
              <h2 className="mt-4 text-display text-4xl sm:text-6xl lg:text-7xl">
                You shouldn&apos;t have to ask, <Script className="text-sun">&ldquo;So… how&apos;s tutoring going?&rdquo;</Script>
              </h2>
            </Reveal>
            <Stagger className="space-y-6">
              {points.map(({ icon: Icon, title, body }) => (
                <StaggerItem key={title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/12">
                    <Icon className="size-5 text-sun" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-white/75">{body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <span className="absolute -top-5 left-4 z-10 inline-flex -rotate-3 animate-float items-center gap-2 rounded-full bg-sun px-4 py-2 text-sm font-bold text-ink shadow-xl sm:-top-6 sm:left-8">
              <Sparkle className="size-4 text-coral" /> New report ready
            </span>
            <RotateIn>
              <ReportView
                report={demoReports[0]}
                studentName="Maya"
                yearGroup="Year 7"
                tutorName="Mr. Tobi"
                schedule="Tue & Thu"
                className="text-left shadow-2xl shadow-black/25"
              />
            </RotateIn>
          </div>
        </div>
      </div>
    </section>
  );
}
