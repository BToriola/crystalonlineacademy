import type { Metadata } from "next";
import Link from "next/link";
import { Script } from "@/components/brand/doodles";
import { DemoAccounts } from "@/features/auth/components/demo-accounts";
import { LoginForm } from "@/features/auth/components/login-form";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Crystal Online Academy parent, learner or tutor portal.",
};

type Props = { searchParams: Promise<{ next?: string | string[]; error?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : undefined;
  const initialError = params.error ? "That sign-in link has expired or was already used. Please log in again." : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-4xl sm:text-5xl">
          Welcome <Script>back</Script>
        </h1>
        <p className="mt-3 text-muted-foreground">Log in to see lessons, progress and messages, all in your own time zone.</p>
      </div>

      {isDemoMode && <DemoAccounts />}

      {isDemoMode && (
        <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>
      )}

      <LoginForm next={next} initialError={initialError} />

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          New to Crystal?{" "}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create a parent account
          </Link>
        </p>
        <p>
          Tutors receive login details once approved.{" "}
          <Link href="/become-a-tutor" className="font-medium text-foreground underline-offset-4 hover:underline">
            Apply to teach
          </Link>
        </p>
      </div>
    </div>
  );
}
