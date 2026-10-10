import type { Metadata } from "next";
import { CalendarCheckIcon, CreditCardIcon, HeartHandshakeIcon, ShieldCheckIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { testimonials } from "@/config/content";
import { getTutor } from "@/features/tutors/queries";
import { TrialForm } from "@/features/marketing/pages/book-trial/trial-form";
import { PageHero } from "@/features/marketing/pages/page-hero";

export const metadata: Metadata = {
  title: "Book a free trial",
  description:
    "Book a free 30-minute 1:1 trial lesson for your child. Tell us about their year group and goals and we'll match them with a vetted tutor in your time zone.",
};

const promises = [
  { icon: CreditCardIcon, title: "No card needed", body: "The trial is genuinely free, with no obligation." },
  { icon: CalendarCheckIcon, title: "Reply within 24 hours", body: "A real person gets in touch, not a bot." },
  { icon: HeartHandshakeIcon, title: "Hand-matched tutor", body: "Chosen for your child's personality and goals." },
  { icon: ShieldCheckIcon, title: "Safe & private", body: "Your details are only used to arrange lessons." },
];

type Props = { searchParams: Promise<{ tutor?: string | string[] }> };

export default async function BookTrialPage({ searchParams }: Props) {
  const { tutor: tutorParam } = await searchParams;
  const tutorId = typeof tutorParam === "string" ? tutorParam : undefined;
  const tutor = tutorId ? await getTutor(tutorId) : null;
  const requested = tutor && tutor.tutor.is_published ? { id: tutor.id, name: tutor.full_name } : null;
  const quote = testimonials[1] ?? testimonials[0];

  return (
    <>
      <PageHero
        eyebrow="Free trial lesson"
        title={
          <>
            Let&apos;s find your child&apos;s <Script>perfect tutor</Script>
          </>
        }
        subtitle="Four quick steps. We'll match your child with a vetted tutor and arrange a free 30-minute lesson at a time that suits your family."
        className="pb-10 sm:pb-14"
      />

      <section className="container-page pb-20 sm:pb-28">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
          <Reveal>
            <TrialForm tutor={requested} />
          </Reveal>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <Reveal delay={0.1} className="rounded-[2rem] bg-cream p-6 ring-1 ring-border">
              <h2 className="font-display text-lg font-bold">Our promise to you</h2>
              <ul className="mt-4 space-y-4">
                {promises.map((p) => (
                  <li key={p.title} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <p.icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold">{p.title}</span>
                      <span className="block text-sm text-muted-foreground">{p.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            {quote && (
              <Reveal delay={0.15}>
                <figure className="rounded-[2rem] bg-coral p-6 text-white">
                  <blockquote className="font-display text-lg leading-snug font-semibold">&ldquo;{quote.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm text-white/80">
                    <span className="font-semibold text-white">{quote.name}</span> · {quote.detail}
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
