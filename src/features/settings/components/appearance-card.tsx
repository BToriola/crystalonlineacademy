"use client";

import { useSyncExternalStore } from "react";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { brandThemes } from "@/components/theme/brand-themes";
import { useBrandTheme } from "@/components/theme/use-brand-theme";
import { cn } from "@/lib/utils";

const modes = [
  { value: "light", label: "Light", icon: SunIcon, preview: "bg-white", bar: "bg-neutral-200" },
  { value: "dark", label: "Dark", icon: MoonIcon, preview: "bg-neutral-900", bar: "bg-neutral-700" },
  { value: "system", label: "Match device", icon: MonitorIcon, preview: "bg-linear-to-r from-white from-50% to-neutral-900 to-50%", bar: "bg-neutral-400" },
] as const;

const noop = () => () => {};

export function AppearanceCard() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { theme, setTheme } = useBrandTheme();
  // next-themes only knows the stored mode after hydration.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-medium">Colour theme</legend>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {brandThemes.map((t) => {
            const selected = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected && "border-primary ring-2 ring-primary/25",
                )}
              >
                <span className="flex h-16 overflow-hidden rounded-xl" aria-hidden>
                  {t.swatch.map((c, i) => (
                    <span key={c} className={i === 0 ? "flex-2" : "flex-1"} style={{ background: c }} />
                  ))}
                </span>
                <span className="mt-2 flex items-center justify-between text-sm font-medium">
                  {t.label}
                  {selected && (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-3" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-medium">Light or dark</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {modes.map((m) => {
            const selected = mounted && mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(m.value)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected && "border-primary ring-2 ring-primary/25",
                )}
              >
                <span className={cn("block h-16 rounded-xl border p-2.5", m.preview)} aria-hidden>
                  <span className={cn("block h-2 w-2/3 rounded-full", m.bar)} />
                  <span className={cn("mt-1.5 block h-2 w-1/2 rounded-full", m.bar)} />
                </span>
                <span className="mt-2 flex items-center gap-2 text-sm font-medium">
                  <m.icon className="size-4" /> {m.label}
                  {selected && <CheckIcon className="ml-auto size-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
