"use client";

import { CheckIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { brandThemes } from "./brand-themes";
import { useBrandTheme } from "./use-brand-theme";

const modes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "Auto", icon: MonitorIcon },
] as const;

export function ThemeCustomizer({ className }: { className?: string }) {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { theme, setTheme } = useBrandTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("rounded-full", className)} aria-label="Customise theme">
          <PaletteIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">Colour theme</p>
          <div className="grid grid-cols-2 gap-2">
            {brandThemes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2 text-left text-sm transition hover:bg-muted",
                  theme === t.value && "border-primary ring-2 ring-primary/20",
                )}
              >
                <span className="flex -space-x-1.5">
                  {t.swatch.map((c) => (
                    <span key={c} className="size-4 rounded-full ring-2 ring-background" style={{ background: c }} />
                  ))}
                </span>
                {t.label}
                {theme === t.value && <CheckIcon className="ml-auto size-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Appearance</p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition",
                  mode === m.value && "bg-background text-foreground shadow-sm",
                )}
              >
                <m.icon className="size-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
