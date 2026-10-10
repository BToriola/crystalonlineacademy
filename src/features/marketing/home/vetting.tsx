import { ShieldCheckIcon } from "lucide-react";
import { Script, Squiggle } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { vettingSteps } from "@/config/content";
import { cn } from "@/lib/utils";

const strokeTones = [
  "[-webkit-text-stroke:2px_var(--color-primary)]",
  "[-webkit-text-stroke:2px_var(--color-coral)]",
  "[-webkit-text-stroke:2px_var(--color-leaf)] dark:[-webkit-text-stroke:2px_var(--color-sun)]",
  "[-webkit-text-stroke:2px_var(--color-blush)]",
];

export function Vetting() {
  return (
    <section className="overflow-x-clip bg-background py-24 sm:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">Our standards</p>
            <h2 className="mt-4 text-display text-4xl sm:text-6xl">
              How we choose who teaches <Script>your child</Script>
            </h2>
            <Squiggle className="mt-6 w-40" />
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Great tutoring starts long before the first lesson. Every applicant goes through four careful stages, and
              only around the top 5% are invited to teach with us.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-leaf/10 px-5 py-3 text-sm font-semibold text-leaf dark:bg-sun/15 dark:text-sun">
              <ShieldCheckIcon className="size-5" aria-hidden />
              Identity-checked, referenced &amp; safeguarding-trained
            </div>
          </Reveal>
        </div>

        <ol className="space-y-5">
          {vettingSteps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={0.05}>
                <div className="group flex gap-5 rounded-[2rem] border bg-card p-6 transition-colors duration-500 hover:bg-muted/60 sm:gap-8 sm:p-8">
                  <span
                    aria-hidden
                    className={cn(
                      "shrink-0 font-display text-6xl leading-none font-extrabold text-transparent transition-transform duration-500 group-hover:-rotate-6 sm:text-8xl",
                      strokeTones[i % strokeTones.length],
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1 sm:pt-3">
                    <h3 className="font-display text-xl font-extrabold sm:text-2xl">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
