import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownIcon,
  BanknoteIcon,
  CalendarClockIcon,
  GraduationCapIcon,
  HomeIcon,
  LaptopIcon,
  SchoolIcon,
  SparklesIcon,
  UsersRoundIcon,
  WifiIcon,
} from "lucide-react";
import { CircledGrade, Script } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { vettingSteps } from "@/config/content";
import { ApplicationForm } from "@/features/marketing/pages/become-a-tutor/application-form";
import { PageHero, SectionHeading } from "@/features/marketing/pages/page-hero";

export const metadata: Metadata = {
  title: "Become a tutor",
  description:
    "Teach children in the UK and Canada from home. Flexible hours, steady students, proper training and on-time pay. Apply to tutor with Crystal Online Academy.",
};

const perks = [
  { icon: CalendarClockIcon, title: "Flexible hours", body: "Choose the slots that suit you. Most lessons fall in UK and Canadian after-school hours.", tone: "bg-sky text-ink" },
  { icon: UsersRoundIcon, title: "Steady students", body: "We find the families. You focus on teaching the same children week after week.", tone: "bg-sun text-ink" },
  { icon: SparklesIcon, title: "Real training", body: "Curriculum workshops, online classroom craft and safeguarding, led by Crystal.", tone: "bg-blush text-ink" },
  { icon: BanknoteIcon, title: "Paid on time", body: "Clear rates, monthly payments, no chasing invoices. Ever.", tone: "bg-leaf text-white" },
  { icon: HomeIcon, title: "A friendly community", body: "Peer sessions, lesson-sharing and a team that celebrates your wins.", tone: "bg-coral text-white" },
];

const requirements = [
  { icon: GraduationCapIcon, title: "A first or 2:1 degree", body: "Or a Master's. Strong academic foundations matter to our families." },
  { icon: SchoolIcon, title: "Teach what you studied", body: "Your degree should be in (or closely related to) the subjects you'll teach." },
  { icon: WifiIcon, title: "Reliable internet & laptop", body: "A stable connection, working webcam and a backup plan for power cuts." },
  { icon: LaptopIcon, title: "A quiet, tidy space", body: "Somewhere calm and well lit where children can focus on you." },
];

export default function BecomeATutorPage() {
  return (
    <>
      <PageHero
        eyebrow="Teach with Crystal"
        title={
          <>
            Do the teaching you <Script>love</Script>, from home
          </>
        }
        subtitle="We're looking for warm, brilliant graduates to tutor children in the UK and Canada, one-to-one and online. We bring the students, the training and the support."
      >
        <Button asChild className="h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-primary/25">
          <a href="#apply">
            Apply now <ArrowDownIcon />
          </a>
        </Button>
      </PageHero>

      <section className="container-page pb-20 sm:pb-28">
        <SectionHeading
          eyebrow="Why Crystal"
          title={
            <>
              A tutoring job that <Script>looks after you</Script>
            </>
          }
        />
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {perks.map((perk, i) => (
            <StaggerItem key={perk.title} className={`flex flex-col gap-4 rounded-[2rem] p-6 ${perk.tone} ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/30">
                <perk.icon className="size-6" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-bold">{perk.title}</h3>
              <p className="leading-relaxed opacity-80">{perk.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <div className="slab grid gap-12 bg-cream px-6 py-14 ring-1 ring-border sm:px-12 sm:py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative">
            <SectionHeading
              eyebrow="Requirements"
              title={
                <>
                  What we <Script>look for</Script>
                </>
              }
              subtitle="We're selective because parents trust us with their children. If this sounds like you, we'd love to hear from you."
            />
            <CircledGrade grade="2:1" className="mt-8 hidden size-28 -rotate-6 lg:block" />
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {requirements.map((r) => (
              <StaggerItem key={r.title} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
                <r.icon className="size-7 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-bold">{r.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{r.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <SectionHeading
          align="center"
          eyebrow="Our selection process"
          title={
            <>
              Four steps to your <Script>first lesson</Script>
            </>
          }
          subtitle="It's thorough, it's fair, and we keep you updated at every stage. Most applicants hear back within a week."
        />
        <ol className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden className="absolute top-8 right-[12%] left-[12%] hidden h-0.5 border-t-2 border-dashed border-border lg:block" />
          {vettingSteps.map((s, i) => (
            <li key={s.title} className="relative">
              <Reveal delay={i * 0.08} className="flex h-full flex-col items-center rounded-[2rem] border bg-card p-6 text-center">
                <span className="relative -mt-12 flex size-14 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground ring-8 ring-background">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section id="apply" className="container-page scroll-mt-24 pb-20 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Apply"
              title={
                <>
                  Ready to <Script>join us?</Script>
                </>
              }
              subtitle="It takes about ten minutes. Already approved? Your login details arrive by email once your training is complete."
            />
            <Reveal delay={0.1} className="mt-8 rounded-3xl bg-primary p-6 text-primary-foreground">
              <p className="font-display text-lg font-bold">Questions before you apply?</p>
              <p className="mt-1 text-primary-foreground/80">We&apos;re happy to help. Drop us a line and mention you&apos;re a tutor.</p>
              <Button asChild className="mt-4 h-11 rounded-full bg-white px-6 text-primary hover:bg-white/90">
                <Link href="/contact">Contact the team</Link>
              </Button>
            </Reveal>
          </div>
          <Reveal className="rounded-[2rem] border bg-card p-6 shadow-xl shadow-ink/5 sm:p-10">
            <ApplicationForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
