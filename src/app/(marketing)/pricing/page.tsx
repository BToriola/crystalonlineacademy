import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, GiftIcon, MinusIcon, UsersIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { faqs, pricingPlans } from "@/config/content";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { FaqList } from "@/features/marketing/pages/faq-list";
import { PageHero, SectionHeading } from "@/features/marketing/pages/page-hero";
import { PricingPlans } from "@/features/marketing/pages/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple monthly plans for 1:1 online tutoring in GBP or CAD. Every plan includes a dedicated tutor, session notes and progress reports. Start with a free trial lesson.",
};

type Cell = boolean | string;

const comparison: { feature: string; cells: [Cell, Cell, Cell] }[] = [
  { feature: "Free 30-minute trial lesson", cells: [true, true, true] },
  { feature: "One dedicated, vetted tutor", cells: [true, true, true] },
  { feature: "Live 1:1 lessons per week", cells: ["1", "2", "3"] },
  { feature: "Session notes & homework", cells: [true, true, true] },
  { feature: "Parent portal & direct messaging", cells: [true, true, true] },
  { feature: "Progress reports", cells: ["Monthly", "Monthly", "Fortnightly"] },
  { feature: "Personal learning roadmap", cells: [false, true, true] },
  { feature: "Parent check-in call", cells: [false, "Monthly", "Monthly"] },
  { feature: "Rewards & badges for your child", cells: [false, true, true] },
  { feature: "Exam-aligned revision plan", cells: [false, false, true] },
  { feature: "Past-paper practice & marking", cells: [false, false, true] },
  { feature: "Priority tutor matching", cells: [false, false, true] },
  { feature: "Free rematch if it's not the right fit", cells: [true, true, true] },
];

const pricingFaqs = faqs.filter((f) =>
  ["How does the free trial work?", "How do payments work?", "What if the tutor isn't the right fit?", "How do time zones work?"].includes(f.q),
);

function ComparisonCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-leaf/15 text-leaf dark:text-success">
        <CheckIcon className="size-4" aria-hidden />
        <span className="sr-only">Included</span>
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex size-7 items-center justify-center text-muted-foreground/50">
        <MinusIcon className="size-4" aria-hidden />
        <span className="sr-only">Not included</span>
      </span>
    );
  return <span className="text-sm font-semibold">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Honest prices, <Script>no surprises</Script>
          </>
        }
        subtitle="One clear monthly fee in pounds or Canadian dollars. Pause or cancel with 14 days' notice, and always start with a free trial."
      />

      <section className="container-page pb-16">
        <PricingPlans plans={pricingPlans} />

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <Reveal className="flex items-start gap-4 rounded-[2rem] bg-blush p-6 text-ink sm:p-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/50">
              <UsersIcon className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Siblings learn for less</h2>
              <p className="mt-1.5 leading-relaxed text-ink/75">
                Enrol a second child and we&apos;ll take <strong className="text-ink">10% off</strong> their plan, every month,
                for as long as they learn with us.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="flex items-start gap-4 rounded-[2rem] bg-sun p-6 text-ink sm:p-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/50">
              <GiftIcon className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Try before you choose</h2>
              <p className="mt-1.5 leading-relaxed text-ink/75">
                Your first 30-minute lesson is free, with no card required. Only pick a plan once you&apos;re sure it&apos;s a
                good fit.
              </p>
              <Button asChild className="mt-4 h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/85">
                <Link href="/book-trial">Book a free trial</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <SectionHeading
          align="center"
          eyebrow="Compare plans"
          title={
            <>
              What&apos;s <Script>included</Script>
            </>
          }
          subtitle="The essentials come with every plan. More lessons a week unlock extra planning and exam support."
        />
        <Reveal className="mt-12 overflow-x-auto rounded-[2rem] border bg-card" data-lenis-prevent>
          <table className="w-full min-w-[36rem] text-left">
            <caption className="sr-only">Features included in each plan</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="p-5 text-sm font-semibold text-muted-foreground sm:px-8">
                  Feature
                </th>
                {pricingPlans.map((plan) => (
                  <th
                    key={plan.name}
                    scope="col"
                    className={`p-5 text-center font-display text-lg font-extrabold ${plan.featured ? "bg-primary/5 text-primary" : ""}`}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b last:border-0">
                  <th scope="row" className="p-4 text-sm font-medium sm:px-8 sm:text-base">
                    {row.feature}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={`p-4 text-center ${pricingPlans[i]?.featured ? "bg-primary/5" : ""}`}>
                      <ComparisonCell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Good questions"
              title={
                <>
                  Pricing, <Script>answered</Script>
                </>
              }
              subtitle="Anything else on your mind? We're happy to talk it through."
            />
            <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="h-12 rounded-full px-7">
                <Link href="/faq">All FAQs</Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 rounded-full px-7">
                <Link href="/contact">Contact us</Link>
              </Button>
            </Reveal>
          </div>
          <Reveal delay={0.05}>
            <FaqList items={pricingFaqs} />
          </Reveal>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
