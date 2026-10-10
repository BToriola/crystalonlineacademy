"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { BookOpenIcon, HandIcon, MicIcon, PencilLineIcon, StarIcon, VideoIcon } from "lucide-react";
import { Sparkle } from "@/components/brand/doodles";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type FanCardProps = {
  children: React.ReactNode;
  className: string;
  parallax: MotionValue<number>;
  from: { x: string; rotate: number };
  rotate: number;
  delay: number;
};

function FanCard({ children, className, parallax, from, rotate, delay }: FanCardProps) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("absolute top-0 left-1/2", className)}>
      <motion.div style={{ y: parallax }}>
        <motion.div
          initial={reduce ? { opacity: 0, rotate } : { opacity: 0, x: from.x, y: 80, rotate: from.rotate, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate, scale: 1 }}
          transition={{ duration: reduce ? 0.4 : 1.1, delay, ease }}
        >
          <div className="transition-transform duration-500 ease-out hover:-translate-y-2">{children}</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function HeroCards() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const slow = useTransform(scrollY, [0, 900], [0, reduce ? 0 : -40]);
  const mid = useTransform(scrollY, [0, 900], [0, reduce ? 0 : -70]);
  const fast = useTransform(scrollY, [0, 900], [0, reduce ? 0 : -100]);

  return (
    <div className="relative mx-auto h-[21rem] w-full max-w-5xl sm:h-[26rem] lg:h-[27rem]" aria-hidden>
      <FanCard
        className="top-14 z-10 w-[11rem] -translate-x-[102%] sm:top-20 sm:w-[16rem] sm:-translate-x-[118%] lg:w-[18rem] lg:-translate-x-[130%]"
        parallax={mid}
        from={{ x: "45%", rotate: 0 }}
        rotate={-8}
        delay={0.55}
      >
        <PhonicsCard />
      </FanCard>
      <FanCard
        className="top-14 z-10 w-[11rem] translate-x-[2%] sm:top-20 sm:w-[16rem] sm:translate-x-[18%] lg:w-[18rem] lg:translate-x-[30%]"
        parallax={fast}
        from={{ x: "-45%", rotate: 0 }}
        rotate={8}
        delay={0.65}
      >
        <MathsCard />
      </FanCard>
      <FanCard className="z-20 w-[17rem] -translate-x-1/2 sm:w-[24rem]" parallax={slow} from={{ x: "0%", rotate: -4 }} rotate={-1.5} delay={0.4}>
        <LiveLessonCard />
      </FanCard>

      <Sparkle className="absolute top-2 left-[8%] size-7 animate-float sm:size-10" />
      <Sparkle className="absolute top-1/2 right-[6%] size-5 animate-float text-coral [animation-delay:-2s] sm:size-8" />
      <Sparkle className="absolute bottom-6 left-[22%] size-4 animate-float text-primary [animation-delay:-4s] sm:size-6" />
    </div>
  );
}

function LiveLessonCard() {
  return (
    <div className="rounded-[2rem] border bg-card p-3 text-card-foreground shadow-2xl shadow-ink/15">
      <div className="flex items-center justify-between px-2 pt-1 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/12 px-2.5 py-1 text-xs font-semibold text-coral">
          <span className="size-1.5 animate-pulse rounded-full bg-coral" /> Live lesson
        </span>
        <span className="text-xs font-medium text-muted-foreground">Maths · Tue 5:00pm</span>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sky/45">
        <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/15" />
        <div className="absolute inset-0 grid place-items-center">
          <UserAvatar name="Mr. Tobi" seed="tobi" className="size-24 bg-card ring-4 ring-card/80 sm:size-32" />
        </div>
        <span className="absolute top-3 left-3 -rotate-3 rounded-xl bg-card/90 px-3 py-1 font-script text-lg text-foreground shadow-sm sm:text-xl">
          3x + 4 = 19
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.7rem] font-medium text-white">Mr. Tobi</span>
        <div className="absolute right-3 bottom-3 grid size-16 place-items-center rounded-2xl bg-blush shadow-lg ring-2 ring-card sm:size-20">
          <UserAvatar name="Maya" seed="maya" className="size-11 sm:size-14" />
        </div>
      </div>
      <div className="flex items-center justify-between px-1 pt-3">
        <div className="flex gap-1.5">
          {[MicIcon, VideoIcon, PencilLineIcon, HandIcon].map((Icon, i) => (
            <span key={i} className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground sm:size-9">
              <Icon className="size-4" />
            </span>
          ))}
        </div>
        <span className="hidden items-center gap-1 rounded-full bg-sun/30 px-2.5 py-1 text-xs font-semibold sm:inline-flex">
          <StarIcon className="size-3.5 fill-current text-sun" /> +3 stars
        </span>
      </div>
    </div>
  );
}

function PhonicsCard() {
  return (
    <div className="space-y-4 rounded-[2rem] bg-sun p-4 text-ink shadow-xl shadow-ink/10 sm:space-y-6 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-white/60 sm:size-11">
          <BookOpenIcon className="size-4 sm:size-5" />
        </span>
        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase sm:text-xs">Phonics</span>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {["sh", "ch", "th", "ai"].map((s) => (
          <span key={s} className="rounded-xl bg-white/70 px-2.5 py-1 font-display text-xl font-extrabold sm:px-3 sm:text-3xl">
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <StarIcon key={i} className="size-4 fill-current sm:size-5" />
          ))}
        </span>
        <span className="font-script text-lg sm:text-2xl">Phase 3</span>
      </div>
    </div>
  );
}

function MathsCard() {
  return (
    <div className="space-y-4 rounded-[2rem] bg-leaf p-4 text-white shadow-xl shadow-ink/10 sm:space-y-6 sm:p-6">
      <span className="block text-right text-[0.65rem] font-bold tracking-[0.16em] uppercase sm:text-xs">Fractions</span>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="size-14 shrink-0 rounded-full bg-[conic-gradient(var(--color-sun)_0_75%,rgb(255_255_255/0.2)_0)] ring-4 ring-white/20 sm:size-20" />
        <span className="font-script text-2xl leading-none sm:text-4xl">¾ done!</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-3/4 rounded-full bg-sun" />
        </div>
        <p className="text-[0.65rem] text-white/75 sm:text-xs">Unit progress</p>
      </div>
    </div>
  );
}
