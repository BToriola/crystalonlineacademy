import { MessageCircleQuestionMarkIcon, MicIcon, StarIcon, VideoIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { parentWorries } from "@/config/content";
import { cn } from "@/lib/utils";

const bubbleTones = ["bg-cream text-foreground", "bg-sky text-ink", "bg-blush text-ink", "bg-sun text-ink", "bg-white/12 text-white"];

function LaptopScene() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="rounded-t-[1.75rem] border-[0.6rem] border-b-[1rem] border-ink/90 bg-ink/90 shadow-2xl shadow-black/30">
        <div className="relative grid aspect-[16/10] grid-cols-5 gap-2 overflow-hidden rounded-xl bg-cream p-2 sm:gap-3 sm:p-3">
          <div className="col-span-3 flex flex-col rounded-lg bg-card p-2 sm:p-3">
            <p className="text-[0.55rem] font-bold tracking-widest text-muted-foreground uppercase sm:text-[0.65rem]">Whiteboard</p>
            <svg viewBox="0 0 200 110" className="mt-1 h-full w-full">
              <path d="M10 30c20-14 40 14 60 0s40 14 60 0" fill="none" className="stroke-coral" strokeWidth="5" strokeLinecap="round" />
              <path d="M12 62h70M12 80h50" fill="none" className="stroke-primary" strokeWidth="5" strokeLinecap="round" />
              <circle cx="150" cy="72" r="24" fill="none" className="stroke-leaf" strokeWidth="5" />
              <path d="M138 72l9 9 17-19" fill="none" className="stroke-leaf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <text x="104" y="104" className="fill-foreground font-script" fontSize="20">
                ½ + ¼ = ¾
              </text>
            </svg>
          </div>
          <div className="col-span-2 grid grid-rows-2 gap-2 sm:gap-3">
            <div className="relative grid place-items-center rounded-lg bg-sky/60">
              <UserAvatar name="Ms. Kemi" seed="kemi" className="size-10 bg-card sm:size-16" />
              <span className="absolute bottom-1 left-1 rounded-full bg-ink/70 px-1.5 text-[0.5rem] text-white sm:text-[0.6rem]">Ms. Kemi</span>
            </div>
            <div className="relative flex items-end justify-center overflow-hidden rounded-lg bg-blush/70">
              <div className="flex flex-col items-center">
                <span className="size-6 rounded-full bg-ink/70 sm:size-9" />
                <span className="-mt-0.5 h-5 w-12 rounded-t-full bg-ink/70 sm:h-8 sm:w-20" />
              </div>
              <span className="absolute bottom-1 left-1 rounded-full bg-ink/70 px-1.5 text-[0.5rem] text-white sm:text-[0.6rem]">You</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[112%] -translate-x-[5.4%] rounded-b-3xl bg-white/25 sm:h-4" />
      <div className="mx-auto h-1.5 w-24 rounded-b-xl bg-white/15" />

      <div className="absolute -top-5 -right-1 flex animate-float items-center gap-1.5 rounded-2xl rounded-br-sm bg-sun px-3 py-2 text-xs font-semibold text-ink shadow-lg sm:-right-6 sm:text-sm">
        <StarIcon className="size-4 fill-current" /> Brilliant effort today!
      </div>
      <div className="absolute -bottom-3 -left-1 flex animate-float gap-1.5 [animation-delay:-3s] sm:-left-6">
        {[MicIcon, VideoIcon].map((Icon, i) => (
          <span key={i} className="grid size-9 place-items-center rounded-full bg-white text-ink shadow-lg sm:size-11">
            <Icon className="size-4" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function ParentWorries() {
  return (
    <section className="overflow-hidden px-3 py-6 sm:px-5">
      <div className="relative slab bg-forest py-24 text-white sm:py-32">
        <Sparkle className="absolute top-12 right-[8%] size-8 animate-float" />
        <div className="container-page grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <LaptopScene />
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-sm font-bold tracking-[0.2em] text-sun uppercase">Sound familiar?</p>
              <h2 className="mt-4 text-display text-4xl sm:text-5xl lg:text-6xl">
                The questions parents <Script>quietly</Script> carry
              </h2>
            </Reveal>

            <Stagger className="mt-10 space-y-3">
              {parentWorries.map((worry, i) => (
                <StaggerItem key={worry} className={cn("flex", i % 2 === 1 ? "sm:justify-end" : "sm:pr-10")}>
                  <p
                    className={cn(
                      "flex max-w-md items-start gap-2.5 rounded-3xl px-5 py-3.5 text-base font-medium shadow-lg shadow-black/10 sm:text-lg",
                      i % 2 === 1 ? "rounded-br-md" : "rounded-bl-md",
                      bubbleTones[i % bubbleTones.length],
                    )}
                  >
                    <MessageCircleQuestionMarkIcon className="mt-0.5 size-5 shrink-0 opacity-70" aria-hidden />
                    {worry}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.2}>
              <p className="mt-10 text-xl font-medium text-pretty text-white/85 sm:text-2xl">
                With{" "}
                <span className="font-display font-extrabold tracking-tight text-white">
                  crystal<span className="text-coral">.</span>
                </span>{" "}
                you&apos;re never left to work it out alone.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
