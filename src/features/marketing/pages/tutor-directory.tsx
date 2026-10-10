"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subjects as subjectOrder } from "@/config/site";
import type { Tutor } from "@/types/database";
import { ChoiceChip } from "./choice-chip";
import { TutorCard } from "./tutor-card";

export function TutorDirectory({ tutors }: { tutors: Tutor[] }) {
  const [subject, setSubject] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const reduce = useReducedMotion();

  const subjects = useMemo(() => {
    const taught = new Set(tutors.flatMap((t) => t.tutor.subjects));
    const ordered: string[] = subjectOrder.filter((s) => taught.has(s));
    return [...ordered, ...[...taught].filter((s) => !ordered.includes(s)).sort()];
  }, [tutors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutors.filter((t) => {
      if (subject && !t.tutor.subjects.includes(subject)) return false;
      if (!q) return true;
      const haystack = [t.full_name, t.tutor.headline, t.tutor.bio, t.tutor.qualification, ...t.tutor.subjects, ...t.tutor.levels, ...t.tutor.languages]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tutors, subject, query]);

  const reset = () => {
    setSubject(null);
    setQuery("");
  };

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-[2rem] border bg-card p-4 sm:p-6">
        <div className="relative">
          <label htmlFor="tutor-search" className="sr-only">
            Search tutors
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="tutor-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, subject, level or language"
            className="h-12 rounded-full pr-4 pl-12 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
          <ChoiceChip selected={subject === null} onToggle={() => setSubject(null)}>
            All subjects
          </ChoiceChip>
          {subjects.map((s) => (
            <ChoiceChip key={s} selected={subject === s} onToggle={() => setSubject(subject === s ? null : s)}>
              {s}
            </ChoiceChip>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {tutors.length} tutors
        {subject && (
          <>
            {" "}
            teaching <strong className="text-foreground">{subject}</strong>
          </>
        )}
      </p>

      {filtered.length > 0 ? (
        <motion.ul layout={!reduce} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((tutor) => (
              <motion.li
                key={tutor.id}
                layout={!reduce}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <TutorCard tutor={tutor} index={tutors.indexOf(tutor)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-[2rem] border border-dashed px-6 py-16 text-center">
          <p className="font-display text-2xl font-bold">No tutors match that just yet</p>
          <p className="mt-2 max-w-md text-muted-foreground">
            We&apos;re always recruiting. Tell us what your child needs and we&apos;ll find the right person.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="h-12 rounded-full px-7" onClick={reset}>
              <XIcon /> Clear filters
            </Button>
            <Button asChild className="h-12 rounded-full px-7">
              <Link href="/book-trial">Request a match</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
