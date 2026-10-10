import { BellRingIcon, CheckIcon, HeartIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { pillars } from "@/config/content";
import { cn } from "@/lib/utils";

const toneClasses: Record<(typeof pillars)[number]["tone"], { card: string; art: string; body: string }> = {
  leaf: { card: "bg-leaf text-white", art: "bg-white/12", body: "text-white/80" },
  cream: { card: "bg-cream text-foreground", art: "bg-sun/35", body: "text-muted-foreground" },
  primary: { card: "bg-primary text-primary-foreground", art: "bg-white/15", body: "text-primary-foreground/80" },
};

function TrustArt() {
  return (
    <div className="relative flex items-center">
      <UserAvatar name="Ms. Adaeze" seed="adaeze" className="size-20 bg-sun ring-4 ring-white/30" />
      <span className="z-10 -mx-3 grid size-11 place-items-center rounded-full bg-coral text-white shadow-lg transition-transform duration-500 group-hover:scale-125">
        <HeartIcon className="size-5 fill-current" />
      </span>
      <UserAvatar name="Tolu" seed="tolu" className="size-20 bg-blush ring-4 ring-white/30" />
    </div>
  );
}

function UpdatesArt() {
  return (
    <div className="relative w-48 rotate-[-4deg] rounded-2xl bg-card p-4 text-card-foreground shadow-xl transition-transform duration-500 group-hover:rotate-0">
      <p className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">Session notes</p>
      <div className="mt-3 space-y-2">
        {["w-full", "w-4/5", "w-3/5"].map((w) => (
          <div key={w} className="flex items-center gap-2">
            <span className="grid size-4 place-items-center rounded-full bg-success text-white">
              <CheckIcon className="size-2.5" />
            </span>
            <span className={cn("h-2 rounded-full bg-muted", w)} />
          </div>
        ))}
      </div>
      <span className="absolute -top-3 -right-3 grid size-9 animate-wiggle place-items-center rounded-full bg-coral text-white shadow-lg">
        <BellRingIcon className="size-4" />
      </span>
    </div>
  );
}

function PlanArt() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-52" aria-hidden>
      <path
        d="M14 100C50 100 40 30 90 40s50 50 90 20 20-40 26-44"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="4"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <circle cx="14" cy="100" r="9" className="fill-sun" />
      <circle cx="90" cy="40" r="9" className="fill-blush" />
      <circle cx="160" cy="68" r="9" className="fill-sky" />
      <path d="M200 44V6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M202 8l16 7-16 8Z" className="fill-sun" />
    </svg>
  );
}

const arts = [TrustArt, UpdatesArt, PlanArt];

export function Pillars() {
  return (
    <section className="overflow-hidden px-3 py-6 sm:px-5">
      <div className="relative slab bg-ink py-24 text-white sm:py-32">
        <Sparkle className="absolute top-16 left-[6%] size-7 animate-float text-blush" />
        <div className="container-page">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Why families stay</p>
            <h2 className="mt-4 text-display text-4xl sm:text-6xl lg:text-7xl">
              Support that fits around school, home and <Script>life</Script>
            </h2>
          </Reveal>

          <Stagger className="mt-16 grid gap-5 md:grid-cols-3 lg:gap-6">
            {pillars.map((pillar, i) => {
              const tone = toneClasses[pillar.tone];
              const Art = arts[i % arts.length];
              return (
                <StaggerItem key={pillar.title}>
                  <article
                    className={cn(
                      "group flex h-full flex-col rounded-[2rem] p-5 transition-transform duration-500 ease-out hover:-translate-y-3 sm:p-6",
                      i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1",
                      tone.card,
                    )}
                  >
                    <div className={cn("grid h-48 place-items-center rounded-3xl", tone.art)}>
                      <Art />
                    </div>
                    <h3 className="mt-7 font-display text-2xl leading-tight font-extrabold sm:text-[1.7rem]">{pillar.title}</h3>
                    <p className={cn("mt-3 text-base leading-relaxed", tone.body)}>{pillar.body}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
