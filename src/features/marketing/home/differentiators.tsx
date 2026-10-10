import { HeartIcon, RocketIcon, SproutIcon } from "lucide-react";
import { Script, Squiggle } from "@/components/brand/doodles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { differentiators } from "@/config/content";
import { cn } from "@/lib/utils";

const looks = [
  { icon: SproutIcon, tone: "text-leaf dark:text-sun", blob: "bg-sun" },
  { icon: HeartIcon, tone: "text-coral", blob: "bg-blush" },
  { icon: RocketIcon, tone: "text-primary", blob: "bg-sky" },
];

export function Differentiators() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-display text-4xl sm:text-6xl lg:text-7xl">
            What feels <Script>different</Script> here
          </h2>
          <Squiggle className="mx-auto mt-6 w-40" />
        </Reveal>

        <Stagger className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-14">
          {differentiators.map((item, i) => {
            const look = looks[i % looks.length];
            const Icon = look.icon;
            return (
              <StaggerItem key={item.title} className="group text-center md:text-left">
                <div className="relative mx-auto size-20 md:mx-0">
                  <span
                    className={cn(
                      "absolute inset-0 translate-x-2 translate-y-2 rounded-[1.75rem] transition-transform duration-500 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-6",
                      look.blob,
                    )}
                  />
                  <span className={cn("relative grid size-20 place-items-center rounded-[1.75rem] border-2 border-foreground/80 bg-card", look.tone)}>
                    <Icon className="size-9" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-extrabold sm:text-3xl">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{item.body}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
