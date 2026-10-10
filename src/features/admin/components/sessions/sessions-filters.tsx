"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { humanise } from "@/features/admin/lib/labels";
import { sessionStatuses } from "@/features/admin/schemas";
import { cn } from "@/lib/utils";
import { sessionRanges } from "./types";

export type SessionFilterValues = { range: string; status: string; tutor: string; rating?: string };

export function SessionsFilters({ values, tutors }: { values: SessionFilterValues; tutors: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<SessionFilterValues>) => {
    const next = { ...values, ...patch };
    const params = new URLSearchParams();
    if (next.range !== "this") params.set("range", next.range);
    if (next.status !== "all") params.set("status", next.status);
    if (next.tutor !== "all") params.set("tutor", next.tutor);
    if (next.rating && !("range" in patch || "status" in patch)) params.set("rating", next.rating);
    const query = params.toString();
    startTransition(() => router.replace(query ? `/admin/sessions?${query}` : "/admin/sessions", { scroll: false }));
  };

  return (
    <div className={cn("flex flex-col gap-3 transition-opacity lg:flex-row lg:items-center lg:justify-between", pending && "opacity-60")}>
      <Tabs value={values.range} onValueChange={(range) => update({ range })} className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="h-9">
          {sessionRanges.map((r) => (
            <TabsTrigger key={r.value} value={r.value} className="px-3">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Select value={values.status} onValueChange={(status) => update({ status })}>
          <SelectTrigger className="h-9 w-full rounded-full sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {sessionStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {humanise(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={values.tutor} onValueChange={(tutor) => update({ tutor })}>
          <SelectTrigger className="h-9 w-full rounded-full sm:w-48" aria-label="Filter by tutor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tutors</SelectItem>
            {tutors.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
