import { TriangleAlertIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "./page-hero";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

type LegalPageProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
};

const prose =
  "max-w-none text-base leading-relaxed text-pretty text-foreground/85 sm:text-[1.05rem] [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:pl-1 [&_li+li]:mt-1.5 [&_p+p]:mt-4 [&_strong]:text-foreground [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-coral";

export function LegalPage({ eyebrow, title, subtitle, updated, sections }: LegalPageProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} className="pb-10 sm:pb-14" />
      <section className="container-page pb-20 sm:pb-28">
        <Reveal className="mx-auto mb-10 flex max-w-4xl items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm sm:p-5">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <p>
            <strong>Template — not yet legal advice.</strong> This policy is a starting draft written for a UK and Canadian
            children&apos;s tutoring service. It must be reviewed by a qualified lawyer and completed with company details
            before it is relied upon. Last updated {updated}.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[15rem_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">On this page</p>
            <ol className="space-y-1 border-l">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="max-w-3xl">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-b py-8 first:pt-0 last:border-0">
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  <span className="mr-2 text-coral">{i + 1}.</span>
                  {s.title}
                </h2>
                <div className={`mt-4 ${prose}`}>{s.body}</div>
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
