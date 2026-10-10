import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Blob, Script, Sparkle } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

type ClosingCtaProps = {
  title?: React.ReactNode;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export function ClosingCta({
  title = (
    <>
      Ready when <Script className="text-sun">you are</Script>
    </>
  ),
  body = "Book a free 30-minute trial lesson. We'll match your child with a tutor who fits, usually within three days.",
  primary = { label: "Book a free trial", href: "/book-trial" },
  secondary = { label: "Talk to us", href: "/contact" },
}: ClosingCtaProps) {
  return (
    <section className="container-page py-16 sm:py-24">
      <Reveal>
        <div className="slab relative overflow-hidden bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-24">
          <Blob className="absolute -top-16 -left-16 size-64 text-white/10" />
          <Blob className="absolute -right-20 -bottom-24 size-72 rotate-45 text-coral/30" />
          <Sparkle className="absolute top-10 right-[12%] size-8 animate-float" />
          <Sparkle className="absolute bottom-12 left-[10%] size-5 animate-float text-blush [animation-delay:2s]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-display text-4xl text-balance sm:text-6xl">{title}</h2>
            <p className="mt-5 text-lg text-pretty text-primary-foreground/80">{body}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary hover:bg-white/90">
                <Link href={primary.href}>
                  {primary.label} <ArrowRightIcon />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground dark:border-white/40 dark:bg-transparent"
              >
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
