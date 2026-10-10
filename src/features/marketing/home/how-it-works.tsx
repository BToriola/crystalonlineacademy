import { CheckIcon, PencilIcon, ShieldCheckIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { processSteps } from "@/config/content";
import { cn } from "@/lib/utils";

const toneClasses: Record<(typeof processSteps)[number]["tone"], { card: string; art: string; body: string }> = {
  coral: { card: "bg-coral text-ink", art: "bg-white/45", body: "text-ink/80" },
  leaf: { card: "bg-leaf text-white", art: "bg-white/12", body: "text-white/80" },
  blush: { card: "bg-blush text-ink", art: "bg-white/45", body: "text-ink/80" },
  sun: { card: "bg-sun text-ink", art: "bg-white/50", body: "text-ink/80" },
};

function FormArt() {
  return (
    <div className="relative w-40 -rotate-3 rounded-2xl bg-white p-3 text-ink shadow-lg transition-transform duration-500 group-hover:rotate-0">
      {["Year group", "Subject"].map((label, i) => (
        <div key={label} className="mb-2 last:mb-0">
          <p className="text-[0.55rem] font-bold tracking-widest text-ink/50 uppercase">{label}</p>
          <p className="mt-0.5 rounded-lg bg-ink/6 px-2 py-1 text-xs font-semibold">{i === 0 ? "Year 6" : "Maths"}</p>
        </div>
      ))}
      <span className="absolute -right-3 -bottom-3 grid size-9 place-items-center rounded-full bg-ink text-white shadow-lg">
        <PencilIcon className="size-4" />
      </span>
    </div>
  );
}

function MatchArt() {
  return (
    <div className="relative flex items-center">
      <UserAvatar name="Child" seed="amara-child" className="size-16 bg-sun ring-4 ring-white/25" />
      <span className="z-10 -mx-2 grid size-12 place-items-center rounded-full bg-white text-leaf shadow-lg transition-transform duration-500 group-hover:scale-110">
        <ShieldCheckIcon className="size-6" />
      </span>
      <UserAvatar name="Tutor" seed="halima" className="size-16 bg-sky ring-4 ring-white/25" />
      <Sparkle className="absolute -top-4 right-0 size-5 animate-float" />
    </div>
  );
}

const milestones = [
  { x: 12, y: 80, done: true },
  { x: 80, y: 30, done: true },
  { x: 150, y: 66, done: false },
];

function RoadmapArt() {
  return (
    <svg viewBox="0 0 180 100" className="h-24 w-44 text-ink" aria-hidden>
      <path d="M12 80C40 80 40 24 80 30s30 50 70 36 20-40 20-46" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="3 9" strokeLinecap="round" />
      {milestones.map(({ x, y, done }) => (
        <g key={x}>
          <circle cx={x} cy={y} r="11" className={done ? "fill-ink" : "fill-white"} stroke="currentColor" strokeWidth="3" />
          {done && <path d={`M${x - 5} ${y}l3.5 3.5 6.5-7`} fill="none" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      ))}
      <path d="M170 22V2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M171.5 3l9 4-9 4.5Z" className="fill-coral" />
    </svg>
  );
}

function ChatArt() {
  return (
    <div className="w-44 space-y-2 text-xs font-medium text-ink">
      <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-md transition-transform duration-500 group-hover:-translate-y-1">
        How did Maya get on today?
      </p>
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3 py-2 text-white shadow-md transition-transform duration-500 group-hover:translate-y-1">
        Brilliant! She nailed equations
        <CheckIcon className="ml-1 inline size-3.5 text-sun" />
      </p>
    </div>
  );
}

const arts = [FormArt, MatchArt, RoadmapArt, ChatArt];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="container-page">
        <Reveal className="max-w-4xl">
          <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">How it works</p>
          <h2 className="mt-4 text-display text-4xl sm:text-6xl lg:text-7xl">
            From &lsquo;I think they need help&rsquo; to <Script>a clear plan forward.</Script>
          </h2>
        </Reveal>

        <Stagger className="-mx-5 mt-14 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:scroll-px-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-5 [&::-webkit-scrollbar]:hidden">
          {processSteps.map((step, i) => {
            const tone = toneClasses[step.tone];
            const Art = arts[i % arts.length];
            return (
              <StaggerItem key={step.title} className="w-[82%] shrink-0 snap-start sm:w-[55%] md:w-auto">
                <article
                  className={cn(
                    "group flex h-full flex-col rounded-[2rem] p-5 transition-transform duration-500 ease-out hover:-translate-y-2 sm:p-6",
                    tone.card,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-extrabold tracking-widest opacity-70">
                      STEP {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className={cn("mt-4 grid h-44 place-items-center rounded-3xl", tone.art)}>
                    <Art />
                  </div>
                  <h3 className="mt-6 font-display text-2xl leading-tight font-extrabold">{step.title}</h3>
                  <p className={cn("mt-3 leading-relaxed", tone.body)}>{step.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
