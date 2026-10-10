import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link for your Crystal Online Academy account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-4xl sm:text-5xl">
          Forgot your <Script>password?</Script>
        </h1>
        <p className="mt-3 text-muted-foreground">
          It happens to the best of us. Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
      </div>

      <ForgotPasswordForm />

      <Link
        href="/login"
        className="mx-auto flex w-fit items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden /> Back to log in
      </Link>
    </div>
  );
}
