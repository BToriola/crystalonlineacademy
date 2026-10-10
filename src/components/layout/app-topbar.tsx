"use client";

import { useEffect, useState } from "react";
import { GlobeIcon, SparklesIcon } from "lucide-react";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { roleLabel } from "@/features/auth/constants";
import { signInAsDemo } from "@/features/auth/actions";
import { shortZone } from "@/lib/format";
import type { Role } from "@/types/database";

const roles: Role[] = ["admin", "tutor", "parent", "student"];

export function AppTopbar({ role, timezone, demo }: { role: Role; timezone: string; demo: boolean }) {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setClock(new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur-lg">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <div className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground sm:flex">
        <GlobeIcon className="size-3.5" />
        <span suppressHydrationWarning>{clock ?? "--:--"}</span>
        <span>· {shortZone(timezone)}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {demo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full border-dashed border-coral/50 text-coral hover:text-coral">
                <SparklesIcon /> Demo · {roleLabel[role]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Sample data. Connect Supabase to go live.
              </DropdownMenuLabel>
              {roles.map((r) => (
                <DropdownMenuItem key={r} disabled={r === role} onSelect={() => signInAsDemo(r)}>
                  View as {roleLabel[r]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ThemeCustomizer />
      </div>
    </header>
  );
}
