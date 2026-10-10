import type { Metadata } from "next";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/config/content";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { FaqExplorer, type FaqGroup } from "@/features/marketing/pages/faq-explorer";
import { PageHero } from "@/features/marketing/pages/page-hero";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Crystal Online Academy: free trials, tutors, curricula, safeguarding, time zones and payments.",
};

const groupOf: Record<string, string> = {
  "How does the free trial work?": "Getting started",
  "What happens in a lesson?": "Lessons & learning",
  "Which curricula do you cover?": "Lessons & learning",
  "How do time zones work?": "Lessons & learning",
  "Where are your tutors based?": "Tutors & safety",
  "How is my child kept safe?": "Tutors & safety",
  "What if the tutor isn't the right fit?": "Tutors & safety",
  "How do payments work?": "Plans & payments",
};

const extras: Record<string, { q: string; a: string }[]> = {
  "Getting started": [
    {
      q: "How quickly can my child start?",
      a: "Most families are matched within three days of booking a trial. Once you choose a plan, regular lessons can start the following week.",
    },
    {
      q: "What does my child need for lessons?",
      a: "A laptop or tablet with a camera, a reliable internet connection and a quiet spot. Headphones help. We'll send a simple setup guide before the first lesson.",
    },
  ],
  "Plans & payments": [
    {
      q: "Do you offer sibling discounts?",
      a: "Yes. A second child enrolled in the same family gets 10% off their plan every month.",
    },
  ],
};

const order = ["Getting started", "Lessons & learning", "Tutors & safety", "Plans & payments", "More questions"];

function buildGroups(): FaqGroup[] {
  return order
    .map((title) => ({
      title,
      items: [
        ...faqs.filter((f) => (groupOf[f.q] ?? "More questions") === title).map((f) => ({ q: f.q, a: f.a })),
        ...(extras[title] ?? []),
      ],
    }))
    .filter((g) => g.items.length > 0);
}

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions? We&apos;ve got <Script>answers</Script>
          </>
        }
        subtitle="Everything parents usually ask before starting. Can't find yours? Our team is a message away."
      />
      <section className="container-page pb-16 sm:pb-24">
        <Reveal>
          <FaqExplorer groups={buildGroups()} />
        </Reveal>
      </section>
      <ClosingCta
        title={
          <>
            Still <Script className="text-sun">curious?</Script>
          </>
        }
        body="The best way to know if Crystal is right for your child is to try a lesson. It's free, and there's no obligation."
      />
    </>
  );
}
