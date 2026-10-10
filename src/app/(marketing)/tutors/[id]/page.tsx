import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenCheckIcon,
  BriefcaseIcon,
  CalendarHeartIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  LanguagesIcon,
  MessageCircleHeartIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { getTutor, listPublishedTutors } from "@/features/tutors/queries";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { TutorCard } from "@/features/marketing/pages/tutor-card";

type Props = { params: Promise<{ id: string }> };

async function getPublishedTutor(id: string) {
  const tutor = await getTutor(decodeURIComponent(id));
  return tutor && tutor.tutor.is_published ? tutor : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tutor = await getPublishedTutor(id);
  if (!tutor) return { title: "Tutor not found" };
  return {
    title: `${tutor.full_name} · ${tutor.tutor.subjects.slice(0, 2).join(" & ")} tutor`,
    description: tutor.tutor.headline ?? tutor.tutor.bio ?? undefined,
  };
}

const lessonSteps = [
  { icon: ClipboardListIcon, title: "A plan from day one", body: "After the free trial you'll get a roadmap mapped to your child's curriculum." },
  { icon: BookOpenCheckIcon, title: "Notes after every lesson", body: "What was covered, what clicked and the homework, straight to your portal." },
  { icon: MessageCircleHeartIcon, title: "A direct line", body: "Message your tutor any time and get a monthly progress report." },
];

export default async function TutorProfilePage({ params }: Props) {
  const { id } = await params;
  const tutor = await getPublishedTutor(id);
  if (!tutor) notFound();

  const t = tutor.tutor;
  const firstName = tutor.full_name.replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "").split(" ")[0];
  const others = (await listPublishedTutors())
    .filter((o) => o.id !== tutor.id && o.tutor.subjects.some((s) => t.subjects.includes(s)))
    .slice(0, 3);
  const requestHref = `/book-trial?tutor=${encodeURIComponent(tutor.id)}`;

  const facts = [
    { icon: StarIcon, label: "Rating", value: `${t.rating.toFixed(1)} / 5` },
    { icon: BriefcaseIcon, label: "Experience", value: `${t.years_experience} years teaching` },
    { icon: GraduationCapIcon, label: "Qualification", value: t.qualification ?? "Degree-qualified" },
    { icon: LanguagesIcon, label: "Languages", value: t.languages.join(", ") || "English" },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="container-page">
          <Reveal>
            <Link
              href="/tutors"
              className="inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" aria-hidden /> All tutors
            </Link>
          </Reveal>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
            <Reveal className="relative mx-auto lg:mx-0">
              <div className="slab relative flex size-64 items-center justify-center bg-sky sm:size-80">
                <UserAvatar name={tutor.full_name} src={tutor.avatar_url} className="size-48 border-8 border-white/80 shadow-2xl sm:size-60" />
                <Sparkle className="absolute top-6 right-6 size-9 animate-float" />
              </div>
              <span className="absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-bold whitespace-nowrap shadow-lg">
                <ShieldCheckIcon className="size-4 text-leaf dark:text-success" aria-hidden /> Vetted & safeguarding-trained
              </span>
            </Reveal>

            <div className="text-center lg:text-left">
              <Reveal delay={0.05}>
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  {tutor.role === "admin" ? "Founder & tutor" : "Crystal tutor"}
                </p>
                <h1 className="mt-3 text-display text-5xl sm:text-7xl">{tutor.full_name}</h1>
                {t.headline && (
                  <p className="mt-4 font-script text-3xl text-coral sm:text-4xl">{t.headline}</p>
                )}
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Subjects">
                  {t.subjects.map((s) => (
                    <li key={s} className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.15} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild className="h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-primary/25">
                  <Link href={requestHref}>
                    Request {firstName} <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full px-7 text-base">
                  <Link href="/contact">Ask a question</Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="rounded-[2rem] border bg-card p-7 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold">
              About <Script>{firstName}</Script>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
              {t.bio ?? `${tutor.full_name} is one of our hand-picked Crystal tutors.`}
            </p>
            <h3 className="mt-8 font-display text-lg font-bold">Levels taught</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {t.levels.map((level) => (
                <li key={level} className="rounded-full border px-4 py-1.5 text-sm font-medium">
                  {level}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="grid h-full gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-4 rounded-3xl bg-muted p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card text-primary">
                    <fact.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{fact.label}</dt>
                    <dd className="font-semibold">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
          {lessonSteps.map((step) => (
            <StaggerItem key={step.title} className="rounded-3xl border p-6">
              <step.icon className="size-6 text-coral" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-muted-foreground">{step.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-8 flex flex-col items-center justify-between gap-5 rounded-[2rem] bg-sun p-7 text-ink sm:flex-row sm:p-10">
          <div className="flex items-center gap-4">
            <CalendarHeartIcon className="size-10 shrink-0" aria-hidden />
            <p className="font-display text-xl font-bold text-balance sm:text-2xl">
              Lessons are shown in your local time, wherever you are.
            </p>
          </div>
          <Button asChild className="h-12 shrink-0 rounded-full bg-ink px-7 text-base text-white hover:bg-ink/85">
            <Link href={requestHref}>Request this tutor</Link>
          </Button>
        </Reveal>
      </section>

      {others.length > 0 && (
        <section className="container-page pb-8">
          <Reveal>
            <h2 className="text-display text-3xl sm:text-4xl">
              You might also <Script>like</Script>
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other, i) => (
              <Reveal key={other.id} delay={i * 0.06}>
                <TutorCard tutor={other} index={i + 1} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <ClosingCta
        title={
          <>
            Start with a <Script className="text-sun">free</Script> lesson
          </>
        }
        body={`Book a free 30-minute trial and we'll do our best to pair your child with ${firstName}.`}
        primary={{ label: `Request ${firstName}`, href: requestHref }}
        secondary={{ label: "Browse all tutors", href: "/tutors" }}
      />
    </>
  );
}
