import { Sparkle, Squiggle } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
};

/** Shared hero for inner marketing pages. Top padding clears the fixed 4.5rem header. */
export function PageHero({ eyebrow, title, subtitle, children, align = "center", className }: PageHeroProps) {
  const centered = align === "center";
  return (
    <section className={cn("relative isolate overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-20", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-[46rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <Sparkle className="absolute top-36 left-[8%] hidden size-7 animate-float sm:block" />
        <Sparkle className="absolute top-52 right-[10%] hidden size-5 animate-float text-coral [animation-delay:1.5s] sm:block" />
      </div>
      <div className={cn("container-page", centered && "text-center")}>
        <Reveal>
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase shadow-sm",
            )}
          >
            <span className="size-1.5 rounded-full bg-coral" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1
            className={cn(
              "mt-6 text-display text-[2.6rem] text-balance sm:text-6xl lg:text-7xl",
              centered && "mx-auto max-w-4xl",
              !centered && "max-w-3xl",
            )}
          >
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <Squiggle className={cn("mt-5 w-28 text-sun", centered && "mx-auto")} />
        </Reveal>
        {subtitle && (
          <Reveal delay={0.16}>
            <p
              className={cn(
                "mt-6 text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl",
                centered ? "mx-auto max-w-2xl" : "max-w-2xl",
              )}
            >
              {subtitle}
            </p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.22} className={cn("mt-8", centered && "flex justify-center")}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <Reveal className={cn("max-w-3xl", centered && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>}
      <h2 className="mt-3 text-display text-4xl text-balance sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}
