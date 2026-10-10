import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Script, Sparkle } from "@/components/brand/doodles";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function FinalCta() {
  return (
    <section className="overflow-hidden px-3 pt-6 pb-16 sm:px-5 sm:pb-24">
      <div className="relative slab overflow-hidden bg-primary py-24 text-center text-primary-foreground sm:py-36">
        <div aria-hidden className="absolute -top-24 -left-24 size-80 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -right-20 -bottom-28 size-96 rounded-full bg-coral/30" />
        <Sparkle className="absolute top-14 right-[12%] size-10 animate-float" />
        <Sparkle className="absolute bottom-16 left-[10%] size-7 animate-float text-blush [animation-delay:-3s]" />

        <div className="container-page relative">
          <Reveal>
            <h2 className="mx-auto max-w-4xl text-display text-5xl sm:text-7xl lg:text-8xl">
              Give your child support that <Script className="text-sun">fits</Script>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/85 sm:text-xl">
              Book a free 30-minute trial lesson. No card, no commitment — just a chance to see the difference the
              right tutor makes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="h-13 w-full rounded-full px-8 text-base font-semibold shadow-xl shadow-black/20 sm:w-auto">
                <Link href="/book-trial">
                  Book a free trial <ArrowRightIcon className="transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-13 w-full rounded-full border-white/40 bg-transparent px-8 text-base font-semibold text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:w-auto dark:border-white/40 dark:bg-transparent dark:hover:bg-white/10"
              >
                <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-5" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
