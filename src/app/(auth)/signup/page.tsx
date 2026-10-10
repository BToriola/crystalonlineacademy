import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCapIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { FormMessage } from "@/features/auth/components/form-message";
import { SignupForm } from "@/features/auth/components/signup-form";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Crystal Online Academy account to manage lessons, progress reports and messages.",
};

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-4xl sm:text-5xl">
          Join the <Script>family</Script>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Parents: create an account to follow lessons, read progress reports and message your child&apos;s tutor.
        </p>
      </div>

      {isDemoMode && (
        <FormMessage tone="success">
          This is a demo, so new accounts can&apos;t be created yet.{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Explore with a demo account
          </Link>
          .
        </FormMessage>
      )}

      <SignupForm />

      <div className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm">
        <GraduationCapIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-muted-foreground">
          <strong className="text-foreground">Tutors &amp; academy staff:</strong> sign up here with the email address the academy
          invited, and your tutor or admin access is set up automatically. Not invited yet?{" "}
          <Link href="/become-a-tutor" className="font-semibold text-primary underline-offset-4 hover:underline">
            Apply to teach
          </Link>
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
