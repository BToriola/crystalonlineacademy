import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { listPublishedTutors } from "@/features/tutors/queries";
import { Differentiators } from "@/features/marketing/home/differentiators";
import { FinalCta } from "@/features/marketing/home/final-cta";
import { Hero } from "@/features/marketing/home/hero";
import { HighlightsMarquee } from "@/features/marketing/home/highlights-marquee";
import { HowItWorks } from "@/features/marketing/home/how-it-works";
import { ParentWorries } from "@/features/marketing/home/parent-worries";
import { Pillars } from "@/features/marketing/home/pillars";
import { ProgressShowcase } from "@/features/marketing/home/progress-showcase";
import { Statement } from "@/features/marketing/home/statement";
import { StatsBand } from "@/features/marketing/home/stats-band";
import { Teasers } from "@/features/marketing/home/teasers";
import { Testimonials } from "@/features/marketing/home/testimonials";
import { TutorsShowcase } from "@/features/marketing/home/tutors-showcase";
import { Vetting } from "@/features/marketing/home/vetting";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} · Personal 1:1 tutoring for UK & Canadian families` },
  description: siteConfig.description,
};

export default async function HomePage() {
  const tutors = await listPublishedTutors();

  return (
    <>
      <Hero />
      <HighlightsMarquee />
      <Statement />
      <ParentWorries />
      <Pillars />
      <TutorsShowcase tutors={tutors} />
      <Vetting />
      <ProgressShowcase />
      <HowItWorks />
      <StatsBand />
      <Differentiators />
      <Testimonials />
      <Teasers />
      <FinalCta />
    </>
  );
}
