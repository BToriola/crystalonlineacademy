import Link from "next/link";
import { ArrowUpRightIcon, BriefcaseIcon, GraduationCapIcon, LanguagesIcon, StarIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { Tutor } from "@/types/database";

const tones = ["bg-sky", "bg-blush", "bg-sun", "bg-leaf/70", "bg-coral/70", "bg-primary/60"];

export function TutorCard({ tutor, index = 0 }: { tutor: Tutor; index?: number }) {
  const t = tutor.tutor;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative h-24 ${tones[index % tones.length]}`} aria-hidden>
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-bold text-ink">
          <StarIcon className="size-3.5 fill-sun text-sun" /> {t.rating.toFixed(1)}
        </span>
      </div>
      <div className="-mt-12 flex flex-1 flex-col px-6 pb-6">
        <UserAvatar name={tutor.full_name} src={tutor.avatar_url} className="size-20 border-4 border-card bg-card shadow-md" />
        <h3 className="mt-4 font-display text-xl font-extrabold">
          <Link href={`/tutors/${tutor.id}`} className="outline-none after:absolute after:inset-0 after:rounded-[2rem] focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
            {tutor.full_name}
          </Link>
        </h3>
        {t.headline && <p className="mt-1 text-sm text-muted-foreground">{t.headline}</p>}

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Subjects">
          {t.subjects.map((subject) => (
            <li key={subject} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {subject}
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
          {t.levels.length > 0 && (
            <div className="flex items-start gap-2">
              <dt className="sr-only">Levels</dt>
              <GraduationCapIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <dd>{t.levels.join(" · ")}</dd>
            </div>
          )}
          {t.qualification && (
            <div className="flex items-start gap-2">
              <dt className="sr-only">Qualification</dt>
              <BriefcaseIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <dd>
                {t.qualification} · {t.years_experience} yrs teaching
              </dd>
            </div>
          )}
          {t.languages.length > 0 && (
            <div className="flex items-start gap-2">
              <dt className="sr-only">Languages</dt>
              <LanguagesIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <dd>{t.languages.join(", ")}</dd>
            </div>
          )}
        </dl>

        <span className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold text-primary">
          View profile
          <ArrowUpRightIcon className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}
