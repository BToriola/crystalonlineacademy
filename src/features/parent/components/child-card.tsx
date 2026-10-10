import Link from "next/link";
import { ArrowRightIcon, FlameIcon, StarIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";
import type { Profile, Student } from "@/types/database";
import { curriculumFlag } from "../lib/time";

export type ChildTutor = { subject: string; tutor?: Profile };

export function ChildCard({ child, tutors, className }: { child: Student; tutors: ChildTutor[]; className?: string }) {
  const flag = curriculumFlag[child.curriculum];
  const name = [child.first_name, child.last_name].filter(Boolean).join(" ");
  return (
    <Link
      href={`/parent/children/${child.id}`}
      className={cn(
        "group flex h-full flex-col gap-5 rounded-3xl border bg-card p-5 outline-none transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar name={name} seed={child.avatar_seed} className="size-16 ring-4 ring-sky/40" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-extrabold">{child.first_name}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span role="img" aria-label={flag.label}>
              {flag.flag}
            </span>
            {child.year_group}
          </p>
        </div>
        <ArrowRightIcon className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" aria-hidden />
      </div>

      <ul className="space-y-2">
        {tutors.length ? (
          tutors.map(({ subject, tutor }) => (
            <li key={`${subject}-${tutor?.id}`} className="flex items-center gap-2.5 text-sm">
              <UserAvatar name={tutor?.full_name ?? "Tutor"} src={tutor?.avatar_url} seed={tutor?.id} className="size-7" />
              <span className="font-medium">{subject}</span>
              <span className="truncate text-muted-foreground">with {tutor?.full_name ?? "your tutor"}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">We&apos;re matching {child.first_name} with a tutor.</li>
        )}
      </ul>

      <div className="mt-auto flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun/25 px-3 py-1 text-sm font-semibold text-ink dark:text-sun">
          <StarIcon className="size-4 fill-current" aria-hidden /> {child.stars} <span className="sr-only">stars</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/12 px-3 py-1 text-sm font-semibold text-coral">
          <FlameIcon className="size-4" aria-hidden /> {child.streak_days}-day streak
        </span>
      </div>
    </Link>
  );
}
