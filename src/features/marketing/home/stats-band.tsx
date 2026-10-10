import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { stats } from "@/config/content";
import { cn } from "@/lib/utils";

const dots = ["bg-primary", "bg-coral", "bg-leaf dark:bg-sun", "bg-blush"];

export function StatsBand() {
  return (
    <section aria-label="Crystal in numbers" className="overflow-hidden px-3 py-6 sm:px-5">
      <div className="slab bg-sand py-16 sm:py-20">
        <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center lg:border-l lg:first:border-l-0">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-display text-5xl sm:text-6xl lg:text-7xl">
                  <CountUp to={stat.value} suffix={stat.suffix} decimals={"decimals" in stat ? stat.decimals : 0} />
                </span>
                <span className="mx-auto mt-3 flex max-w-[14rem] items-start justify-center gap-2 text-sm text-muted-foreground sm:text-base">
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", dots[i % dots.length])} aria-hidden />
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
