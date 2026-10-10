import Link from "next/link";
import { ArrowRightIcon, AwardIcon, FlameIcon, GlobeIcon, StarIcon, TrophyIcon, WalletIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const badges = [
  { icon: StarIcon, tone: "bg-coral text-white" },
  { icon: TrophyIcon, tone: "bg-primary text-white" },
  { icon: AwardIcon, tone: "bg-leaf text-white" },
];

export function Teasers() {
  return (
    <section className="overflow-hidden pb-24 sm:pb-32">
      <Stagger className="container-page grid gap-5 lg:grid-cols-2 lg:gap-6">
        <StaggerItem>
          <article className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-sun p-8 text-ink sm:p-10">
            <Sparkle className="absolute top-8 right-8 size-8 animate-float text-coral" />
            <p className="text-sm font-bold tracking-[0.2em] uppercase opacity-70">For children</p>
            <h2 className="mt-3 max-w-md text-display text-4xl sm:text-5xl">
              Stars, badges &amp; <Script>streaks</Script>
            </h2>
            <p className="mt-4 max-w-md text-lg text-ink/80">
              Every learner gets their own space to collect stars for effort, unlock badges and keep their learning
              streak glowing. Progress they can feel proud of.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-10" aria-hidden>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 font-display text-lg font-extrabold">
                <StarIcon className="size-5 fill-coral text-coral" /> 148
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 font-display text-lg font-extrabold">
                <FlameIcon className="size-5 text-coral transition-transform duration-500 group-hover:scale-125" /> 6-day streak
              </span>
              <span className="flex -space-x-2">
                {badges.map(({ icon: Icon, tone }, i) => (
                  <span
                    key={i}
                    className={`grid size-11 place-items-center rounded-full ring-4 ring-sun transition-transform duration-500 group-hover:-translate-y-1 ${tone}`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <Icon className="size-5" />
                  </span>
                ))}
              </span>
            </div>
          </article>
        </StaggerItem>

        <StaggerItem>
          <article className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground sm:p-10">
            <div aria-hidden className="absolute -right-16 -bottom-16 size-64 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-110" />
            <p className="text-sm font-bold tracking-[0.2em] uppercase opacity-75">For tutors</p>
            <h2 className="mt-3 max-w-md text-display text-4xl sm:text-5xl">
              Teach brilliantly. <Script className="text-sun">Join us.</Script>
            </h2>
            <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
              Are you a first-class or 2:1 graduate who loves helping children grow? Teach families in the UK and Canada
              from home, with training, steady students and pay on time.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <GlobeIcon className="size-4" aria-hidden /> Teach from anywhere
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <WalletIcon className="size-4" aria-hidden /> Reliable monthly pay
              </li>
            </ul>
            <div className="relative mt-auto pt-10">
              <Button asChild variant="secondary" className="h-12 rounded-full px-7 font-semibold">
                <Link href="/become-a-tutor">
                  Become a tutor <ArrowRightIcon className="transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </div>
          </article>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
