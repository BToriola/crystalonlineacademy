import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Blob, CircledGrade, Script, Sparkle, Squiggle } from "@/components/brand/doodles";
import { Logo } from "@/components/brand/logo";
import { AuthTestimonials } from "@/features/auth/components/auth-testimonials";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col xl:p-14">
        <Blob className="absolute -top-24 -right-24 size-96 text-white/10" />
        <Blob className="absolute -bottom-32 -left-24 size-[28rem] rotate-90 text-coral/40" />
        <Sparkle className="absolute top-[22%] right-[14%] size-10 animate-float" />
        <Sparkle className="absolute bottom-[30%] left-[10%] size-6 animate-float text-blush [animation-delay:2s]" />
        <CircledGrade grade="A+" className="absolute right-[10%] bottom-[12%] size-28 animate-float text-sun [--float-rotate:-10deg] [animation-delay:1s]" />
        <span
          aria-hidden
          className="absolute top-[42%] right-[30%] size-5 animate-float rounded-full bg-sun [animation-delay:3s]"
        />

        <div className="relative">
          <Logo inverted />
        </div>

        <div className="relative my-auto max-w-lg py-16">
          <p className="text-display text-5xl xl:text-6xl">
            Learning that <Script className="text-sun">clicks</Script>
          </p>
          <Squiggle className="mt-4 w-32 text-sun" />
          <div className="mt-12">
            <AuthTestimonials />
          </div>
        </div>

        <p className="relative text-sm text-white/70">Trusted by families in the UK and Canada.</p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden /> Back to site
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
