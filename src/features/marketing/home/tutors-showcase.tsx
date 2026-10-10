import Link from "next/link";
import { ArrowRightIcon, GraduationCapIcon, StarIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Tutor } from "@/types/database";

const avatarTones = ["bg-sun", "bg-sky", "bg-blush", "bg-leaf/25", "bg-coral/25", "bg-primary/20"];

function TutorCard({ tutor, index }: { tutor: Tutor; index: number }) {
  return (
    <article className="flex w-72 shrink-0 flex-col rounded-[2rem] border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-xl sm:w-80 sm:p-6">
      <div className="flex items-center gap-4">
        <div className={cn("grid size-18 shrink-0 place-items-center rounded-3xl", avatarTones[index % avatarTones.length])}>
          <UserAvatar name={tutor.full_name} src={tutor.avatar_url} seed={tutor.id} className="size-15" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-extrabold">{tutor.full_name}</h3>
          <p className="flex items-center gap-1 text-sm font-semibold">
            <StarIcon className="size-4 fill-sun text-sun" aria-hidden />
            {tutor.tutor.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">· {tutor.tutor.years_experience} yrs</span>
          </p>
        </div>
      </div>
      {tutor.tutor.headline && <p className="mt-4 line-clamp-2 text-sm font-medium">{tutor.tutor.headline}</p>}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tutor.tutor.subjects.slice(0, 3).map((subject) => (
          <span key={subject} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
            {subject}
          </span>
        ))}
      </div>
      {tutor.tutor.qualification && (
        <p className="mt-auto flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground">
          <GraduationCapIcon className="size-4 shrink-0 text-primary" aria-hidden />
          {tutor.tutor.qualification}
        </p>
      )}
    </article>
  );
}

export function TutorsShowcase({ tutors }: { tutors: Tutor[] }) {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="container-page flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">Our tutors</p>
          <h2 className="mt-4 text-display text-4xl sm:text-6xl lg:text-7xl">
            Someone you can trust with <Script>your child</Script>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Warm, brilliant graduates who know the UK and Canadian curricula inside out, and many who share your
            family&apos;s heritage, languages and stories.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Button asChild variant="outline" className="h-12 rounded-full px-7 font-semibold">
            <Link href="/tutors">
              Meet all our tutors <ArrowRightIcon />
            </Link>
          </Button>
        </Reveal>
      </div>

      {tutors.length > 0 && (
        <Reveal delay={0.15} className="mt-14">
          <Marquee duration={60} className="py-4">
            {tutors.map((tutor, i) => (
              <TutorCard key={tutor.id} tutor={tutor} index={i} />
            ))}
          </Marquee>
        </Reveal>
      )}
    </section>
  );
}
