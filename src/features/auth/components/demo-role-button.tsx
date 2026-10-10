"use client";

import { useFormStatus } from "react-dom";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

type DemoRoleButtonProps = {
  label: string;
  name: string;
  description: string;
  avatarSeed: string;
  tone: string;
};

export function DemoRoleButton({ label, name, description, avatarSeed, tone }: DemoRoleButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group flex h-full w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition outline-none hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70",
      )}
    >
      <span className={cn("rounded-full p-0.5", tone)}>
        <UserAvatar name={name} seed={avatarSeed} className="size-10 border-2 border-card" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
        <span className="block truncate font-display font-bold">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      {pending ? (
        <Loader2Icon className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
      ) : (
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      )}
    </button>
  );
}
