"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all";

export function ReportFilters({
  kids,
  subjects,
}: {
  kids: { id: string; name: string }[];
  subjects: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === ALL) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <label className="sr-only" htmlFor="report-child">
        Filter by child
      </label>
      <Select value={params.get("child") ?? ALL} onValueChange={(v) => update("child", v)}>
        <SelectTrigger id="report-child" className="h-9 min-w-40 rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={ALL}>All children</SelectItem>
          {kids.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="sr-only" htmlFor="report-subject">
        Filter by subject
      </label>
      <Select value={params.get("subject") ?? ALL} onValueChange={(v) => update("subject", v)}>
        <SelectTrigger id="report-subject" className="h-9 min-w-40 rounded-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={ALL}>All subjects</SelectItem>
          {subjects.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Hides the app chrome when printing so only the report cards land on paper. */
const printCss = `@media print {
  [data-slot="sidebar"], [data-slot="sidebar-gap"], [data-slot="sidebar-container"], [data-slot="sidebar-inset"] > header { display: none !important; }
  [data-slot="sidebar-inset"] { margin: 0 !important; box-shadow: none !important; }
  body { background: white !important; }
  .report-print-card { break-inside: avoid; box-shadow: none !important; }
}`;

export function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <>
      <style>{printCss}</style>
      <Button variant="outline" className="rounded-full print:hidden" onClick={() => window.print()}>
        <PrinterIcon data-icon="inline-start" /> {label}
      </Button>
    </>
  );
}
