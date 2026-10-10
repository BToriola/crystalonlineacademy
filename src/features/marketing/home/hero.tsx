import Link from "next/link";
import { ArrowRightIcon, StarIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { HeroCards } from "./hero-cards";
import { HeroDoodle } from "./hero-doodle";

const trustAvatars = [
  { name: "Ms. Adaeze", seed: "adaeze", tone: "bg-sun" },
  { name: "Mr. Tobi", seed: "tobi", tone: "bg-sky" },
  { name: "Ms. Kemi", seed: "kemi", tone: "bg-blush" },
  { name: "Mr. Ifeanyi", seed: "ifeanyi", tone: "bg-leaf/30" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-[calc(4.5rem+3.5rem)] pb-8 sm:pt-[calc(4.5rem+5rem)] sm:pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-sky)_0%,transparent_65%)] opacity-25 blur-2xl"
      />
      <div className="container-page relative text-center">
        <Reveal y={16}>
          <p className="text-xs font-bold tracking-[0.22em] text-primary uppercase sm:text-sm">
            <span lang="yo">Ẹ kú àbọ̀</span> · Welcome · <span lang="fr">Bienvenue</span>
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mx-auto mt-5 max-w-5xl text-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl">
            Personal tutoring shaped around how <Script className="whitespace-nowrap">your child</Script>{" "}
            <span className="relative inline-block whitespace-nowrap">
              learns.
              <HeroDoodle className="absolute -top-8 -right-10 size-16 sm:-top-12 sm:-right-16 sm:size-24 lg:-top-14 lg:-right-20 lg:size-32" />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Live one-to-one lessons with hand-picked tutors for children from Early Years to GCSE and Grade 12, wherever
            your family calls home in the UK or Canada.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-13 w-full rounded-full px-8 text-base font-semibold shadow-xl shadow-primary/30 sm:w-auto">
              <Link href="/book-trial">
                Book a free trial <ArrowRightIcon className="transition-transform group-hover/button:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-13 w-full rounded-full px-8 text-base font-semibold sm:w-auto">
              <Link href="/tutors">Meet our tutors</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {trustAvatars.map((a) => (
                  <UserAvatar key={a.seed} name={a.name} seed={a.seed} className={`size-10 ring-3 ring-background ${a.tone}`} />
                ))}
              </div>
              <div className="text-left">
                <div className="flex text-sun" role="img" aria-label="Rated 4.9 out of 5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="font-medium">
                  <span className="font-bold">4.9/5</span> from 300+ families
                </p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-border sm:block" />
            <p className="flex items-center gap-2 font-medium text-muted-foreground">
              <span className="text-xl" role="img" aria-label="United Kingdom flag">
                🇬🇧
              </span>
              <span className="text-xl" role="img" aria-label="Canada flag">
                🇨🇦
              </span>
              Families across the UK &amp; Canada
            </p>
          </div>
        </Reveal>
      </div>

      <div className="container-page relative mt-14 sm:mt-20">
        <HeroCards />
      </div>
    </section>
  );
}
