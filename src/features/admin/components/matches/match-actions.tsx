"use client";

import { useTransition } from "react";
import { MoreHorizontalIcon, PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateAssignmentStatus } from "@/features/assignments/actions";
import type { AssignmentStatus } from "@/types/database";

export function MatchActions({ id, status, label }: { id: string; status: AssignmentStatus; label: string }) {
  const [pending, startTransition] = useTransition();

  const set = (next: AssignmentStatus) =>
    startTransition(async () => {
      const result = await updateAssignmentStatus(id, next);
      if (result.ok) toast.success(result.message ?? "Match updated.");
      else toast.error(result.error);
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full" disabled={pending} aria-label={`Actions for ${label}`}>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {status === "active" && (
          <DropdownMenuItem onSelect={() => set("paused")}>
            <PauseIcon />
            Pause match
          </DropdownMenuItem>
        )}
        {status !== "active" && (
          <DropdownMenuItem onSelect={() => set("active")}>
            <PlayIcon />
            {status === "ended" ? "Reactivate" : "Resume match"}
          </DropdownMenuItem>
        )}
        {status !== "ended" && (
          <DropdownMenuItem variant="destructive" onSelect={() => set("ended")}>
            <SquareIcon />
            End match
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
