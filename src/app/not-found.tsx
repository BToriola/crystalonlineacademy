import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Blob, CircledGrade, Script, Sparkle, Squiggle } from "@/components/brand/doodles";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      <Blob className="absolute -top-24 -right-24 size-96 text-sun/30" />
      <Blob className="absolute -bottom-32 -left-24 size-[26rem] rotate-90 text-blush/30" />
      <Sparkle className="absolute top-[24%] left-[12%] size-8 animate-float" />
      <Sparkle className="absolute right-[14%] bottom-[24%] size-6 animate-float text-coral [animation-delay:2s]" />

      <header className="relative container-page flex h-[4.5rem] items-center">
        <Logo />
      </header>

      <main className="relative container-page flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="relative">
          <p className="text-display text-[7rem] leading-none text-primary sm:text-[11rem]" aria-hidden>
            Oops
          </p>
          <CircledGrade grade="?" className="absolute -top-6 -right-10 size-20 rotate-12 animate-wiggle text-coral sm:-right-16 sm:size-28" />
        </div>
        <Squiggle className="mt-2 w-40 text-sun" />
        <h1 className="mt-8 text-display text-3xl text-balance sm:text-5xl">
          This page has gone <Script>off syllabus</Script>
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          We couldn&apos;t find what you were looking for. It may have moved, or the link might have a typo.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full px-7 text-base font-semibold">
            <Link href="/">
              <ArrowLeftIcon aria-hidden /> Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-7 text-base">
            <Link href="/tutors">Meet our tutors</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
