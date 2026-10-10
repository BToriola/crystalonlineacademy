import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, HeartHandshakeIcon, LightbulbIcon, ShieldCheckIcon, SproutIcon } from "lucide-react";
import { CircledGrade, Script, Sparkle } from "@/components/brand/doodles";
import { CountUp } from "@/components/motion/count-up";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { stats } from "@/config/content";
import { listPublishedTutors } from "@/features/tutors/queries";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { PageHero, SectionHeading } from "@/features/marketing/pages/page-hero";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Crystal Online Academy was founded by a teacher who still teaches. Meet the story, the mission and the tutors behind our 1:1 lessons for families in the UK and Canada.",
};

const values = [
  {
    icon: HeartHandshakeIcon,
    title: "Warmth before worksheets",
    body: "Children learn best from adults they trust. We protect that relationship by keeping the same tutor, week after week.",
    tone: "bg-blush text-ink",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safe, always",
    body: "Identity checks, references and safeguarding training for every tutor, and parents are welcome to drop into any lesson.",
    tone: "bg-sky text-ink",
  },
  {
    icon: LightbulbIcon,
    title: "Clarity for parents",
    body: "Plain-English notes after every session and a monthly report you can actually read. You should never have to guess.",
    tone: "bg-sun text-ink",
  },
  {
    icon: SproutIcon,
    title: "Growth for tutors too",
    body: "We pay on time, train continuously and treat our tutors as professionals. Happy tutors teach better lessons.",
    tone: "bg-leaf text-white",
  },
] as const;

export default async function AboutPage() {
  const tutors = await listPublishedTutors();

  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Started by a teacher, built for <Script>every child</Script>
          </>
        }
        subtitle="Crystal Online Academy began at a kitchen table with one pupil, one laptop and a stubborn belief that distance should never decide how well a child is taught."
      />

      <section className="container-page pb-20 sm:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="slab relative aspect-[4/5] overflow-hidden bg-sun">
              <div className="absolute inset-x-0 bottom-0 h-2/3 rounded-t-[50%] bg-coral/90" aria-hidden />
              <UserAvatar
                name="Crystal Adeyemi"
                seed="Crystal Adeyemi"
                className="absolute bottom-10 left-1/2 size-56 -translate-x-1/2 border-8 border-white/80 shadow-2xl sm:size-64"
              />
              <Sparkle className="absolute top-8 left-8 size-10 animate-float text-white" />
            </div>
            <div className="absolute -right-3 -bottom-6 rotate-3 rounded-3xl border bg-card px-5 py-4 shadow-xl sm:-right-8">
              <p className="font-display text-lg font-bold">Crystal Adeyemi</p>
              <p className="text-sm text-muted-foreground">Founder · still teaches English & 11+</p>
            </div>
            <CircledGrade grade="A*" className="absolute -top-6 -left-4 size-24 -rotate-12 sm:-left-10" />
          </Reveal>

          <div className="space-y-6 text-lg leading-relaxed text-pretty text-muted-foreground">
            <Reveal>
              <h2 className="text-display text-4xl text-foreground sm:text-5xl">
                Hello, I&apos;m <Script>Crystal</Script>
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p>
                I trained as a teacher and spent more than a decade in classrooms. Again and again I met bright children who
                were quietly falling behind, not for lack of ability, but because nobody had the time to sit beside them and
                find the gap.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Friends who had moved abroad kept asking me the same question: <em>&ldquo;Can you find my child a tutor who
                understands the curriculum <strong className="text-foreground">and</strong> understands us?&rdquo;</em> Families in
                London, Manchester, Toronto and Calgary wanted someone patient, properly qualified and culturally at home with
                their children.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                So I started teaching online, then recruiting and training brilliant graduates, many from Nigeria and across
                West Africa, to teach the way I would. I still have pupils of my own every week, because I never want to run
                an academy I don&apos;t personally teach in.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="font-script text-3xl text-coral">&ldquo;Every child deserves an adult who believes in them.&rdquo;</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <div className="slab bg-forest px-6 py-16 text-white sm:px-14 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.18em] text-sun uppercase">Our mission</p>
              <h2 className="mt-4 text-display text-4xl text-balance sm:text-5xl">
                Personal tutoring that feels like <Script className="text-sun">family</Script>, with standards that feel like
                school
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-white/80">
              <p>
                We serve diaspora families who want their children to thrive in UK and Canadian schools while staying
                connected to where they come from, and local families who simply want a dedicated, well-trained tutor at a fair
                price.
              </p>
              <p>
                Every match is personal, every lesson follows a plan mapped to your child&apos;s curriculum, and every parent
                can see exactly how things are going, in their own time zone.
              </p>
            </Reveal>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/15 pt-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp
                    to={stat.value}
                    suffix={stat.suffix}
                    decimals={"decimals" in stat ? stat.decimals : 0}
                    className="text-display text-4xl text-sun sm:text-5xl"
                  />
                  <p className="mt-2 text-sm text-white/70">{stat.label}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page pb-20 sm:pb-28">
        <SectionHeading
          eyebrow="What we value"
          title={
            <>
              Four promises we <Script>keep</Script>
            </>
          }
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <StaggerItem key={value.title} className={`flex flex-col gap-4 rounded-[2rem] p-7 ${value.tone}`}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/30">
                <value.icon className="size-6" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-bold">{value.title}</h3>
              <p className="leading-relaxed opacity-80">{value.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="overflow-hidden pb-12">
        <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="The team"
            title={
              <>
                The tutors your children <Script>adore</Script>
              </>
            }
            subtitle="Degree-qualified, carefully vetted and trained by Crystal herself."
          />
          <Reveal>
            <Button asChild variant="outline" className="h-12 rounded-full px-7">
              <Link href="/tutors">
                Meet everyone <ArrowRightIcon />
              </Link>
            </Button>
          </Reveal>
        </div>
        <Marquee className="mt-12" duration={45}>
          {tutors.map((tutor) => (
            <Link
              key={tutor.id}
              href={`/tutors/${tutor.id}`}
              className="flex w-64 shrink-0 items-center gap-4 rounded-3xl border bg-card p-4 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <UserAvatar name={tutor.full_name} src={tutor.avatar_url} className="size-14" />
              <span className="min-w-0">
                <span className="block truncate font-display font-bold">{tutor.full_name}</span>
                <span className="block truncate text-sm text-muted-foreground">{tutor.tutor.subjects.join(", ")}</span>
              </span>
            </Link>
          ))}
        </Marquee>
      </section>

      <ClosingCta
        title={
          <>
            Come and say <Script className="text-sun">hello</Script>
          </>
        }
      />
    </>
  );
}
