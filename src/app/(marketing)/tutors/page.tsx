import type { Metadata } from "next";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { listPublishedTutors } from "@/features/tutors/queries";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { PageHero } from "@/features/marketing/pages/page-hero";
import { TutorDirectory } from "@/features/marketing/pages/tutor-directory";

export const metadata: Metadata = {
  title: "Meet our tutors",
  description:
    "Browse our degree-qualified, fully vetted online tutors for Maths, English, Science, languages, coding and 11+, teaching children in the UK and Canada.",
};

export default async function TutorsPage() {
  const tutors = await listPublishedTutors();

  return (
    <>
      <PageHero
        eyebrow="Our tutors"
        title={
          <>
            Meet the people behind the <Script>lightbulb moments</Script>
          </>
        }
        subtitle="Every tutor holds a strong degree in the subject they teach, has passed our four-step selection and is trained in the UK and Canadian curricula."
      />
      <section className="container-page pb-16">
        <Reveal>
          <TutorDirectory tutors={tutors} />
        </Reveal>
      </section>
      <ClosingCta
        title={
          <>
            Not sure who to <Script className="text-sun">pick?</Script>
          </>
        }
        body="You don't have to choose. Tell us about your child and we'll hand-match them with the tutor who suits their personality and goals."
        primary={{ label: "Get matched for free", href: "/book-trial" }}
        secondary={{ label: "Become a tutor", href: "/become-a-tutor" }}
      />
    </>
  );
}
