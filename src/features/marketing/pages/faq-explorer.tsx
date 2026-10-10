"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaqList, type FaqItem } from "./faq-list";

export type FaqGroup = { title: string; items: FaqItem[] };

export function FaqExplorer({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const count = visible.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative">
          <label htmlFor="faq-search" className="sr-only">
            Search questions
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="h-12 rounded-full pr-4 pl-12 text-base md:text-base"
          />
        </div>
        <p className="mt-3 px-2 text-sm text-muted-foreground" aria-live="polite">
          {query ? `${count} matching question${count === 1 ? "" : "s"}` : `${count} questions`}
        </p>
        <nav aria-label="FAQ sections" className="mt-6 hidden lg:block">
          <ul className="space-y-1">
            {visible.map((g) => (
              <li key={g.title}>
                <a
                  href={`#${slug(g.title)}`}
                  className="block rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="space-y-12">
        {visible.map((g) => (
          <section key={g.title} id={slug(g.title)} className="scroll-mt-28">
            <h2 className="mb-5 font-display text-2xl font-extrabold sm:text-3xl">{g.title}</h2>
            <FaqList items={g.items} />
          </section>
        ))}
        {count === 0 && (
          <div className="flex flex-col items-center rounded-[2rem] border border-dashed px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold">No answers for &ldquo;{query}&rdquo; yet</p>
            <p className="mt-2 max-w-md text-muted-foreground">Ask us directly and we&apos;ll get back to you within a working day.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="h-12 rounded-full px-7" onClick={() => setQuery("")}>
                Clear search
              </Button>
              <Button asChild className="h-12 rounded-full px-7">
                <Link href="/contact">Ask a question</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
