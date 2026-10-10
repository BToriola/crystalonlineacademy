import { Script, Sparkle, Squiggle } from "@/components/brand/doodles";
import { ScrollText } from "@/components/motion/scroll-text";

export function Statement() {
  return (
    <section className="overflow-hidden px-3 py-6 sm:px-5">
      <div className="relative slab bg-cream py-24 sm:py-36">
        <Sparkle className="absolute top-10 left-[8%] size-8 animate-float sm:size-12" />
        <Sparkle className="absolute right-[10%] bottom-12 size-6 animate-float text-coral [animation-delay:-3s] sm:size-9" />
        <div className="container-page max-w-5xl text-center">
          <p className="mb-8 text-3xl sm:text-4xl">
            <Script>Here&apos;s the thing…</Script>
          </p>
          <ScrollText
            className="text-display text-3xl leading-[1.08] sm:text-5xl lg:text-6xl"
            text="Children don't need more pressure. They need the right attention, from the right person, at the right pace — and that's exactly what we're built for."
          />
          <Squiggle className="mx-auto mt-10 w-40 sm:w-56" />
        </div>
      </div>
    </section>
  );
}
