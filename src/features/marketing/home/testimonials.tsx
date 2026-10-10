import { StarIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Reveal } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { testimonials } from "@/config/content";
import { cn } from "@/lib/utils";

const tones = [
  { card: "bg-sun text-ink", muted: "text-ink/70", quote: "text-coral" },
  { card: "bg-sky text-ink", muted: "text-ink/70", quote: "text-primary" },
  { card: "bg-blush text-ink", muted: "text-ink/70", quote: "text-coral" },
  { card: "bg-leaf text-white", muted: "text-white/75", quote: "text-sun" },
  { card: "bg-cream text-foreground", muted: "text-muted-foreground", quote: "text-coral" },
];

export function Testimonials() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="container-page">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">Kind words</p>
          <h2 className="mt-4 text-display text-4xl sm:text-6xl lg:text-7xl">
            Families, in their <Script>own words</Script>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <Carousel opts={{ align: "start", loop: true }} aria-label="Parent testimonials">
            <CarouselContent className="-ml-5">
              {testimonials.map((t, i) => {
                const tone = tones[i % tones.length];
                return (
                  <CarouselItem key={t.name} className="basis-[88%] pl-5 sm:basis-1/2 lg:basis-1/3">
                    <figure className={cn("flex h-full flex-col rounded-[2rem] p-7 sm:p-8", tone.card)}>
                      <span aria-hidden className={cn("font-display text-7xl leading-[0.6] font-extrabold", tone.quote)}>
                        &ldquo;
                      </span>
                      <div className="mt-4 flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                        {[0, 1, 2, 3, 4].map((s) => (
                          <StarIcon key={s} className="size-4 fill-current" aria-hidden />
                        ))}
                      </div>
                      <blockquote className="mt-4 flex-1 text-lg leading-relaxed font-medium sm:text-xl">{t.quote}</blockquote>
                      <figcaption className="mt-8 flex items-center gap-3">
                        <UserAvatar name={t.name} seed={t.name} className="size-11 bg-white/60" />
                        <div>
                          <p className="font-display font-bold">{t.name}</p>
                          <p className={cn("text-sm", tone.muted)}>{t.detail}</p>
                        </div>
                      </figcaption>
                    </figure>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="mt-10 flex justify-end gap-3">
              <CarouselPrevious className="static inset-auto my-0 size-12 translate-x-0" />
              <CarouselNext className="static inset-auto my-0 size-12 translate-x-0" />
            </div>
          </Carousel>
        </Reveal>
      </div>
    </section>
  );
}
