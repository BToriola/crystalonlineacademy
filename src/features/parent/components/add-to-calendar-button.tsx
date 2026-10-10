"use client";

import { CalendarPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadIcs, type CalendarEvent } from "../lib/ics";

export function AddToCalendarButton({ event, filename }: { event: CalendarEvent; filename: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full"
      onClick={() => {
        downloadIcs(event, filename);
        toast.success("Calendar file downloaded — open it to add the lesson.");
      }}
    >
      <CalendarPlusIcon data-icon="inline-start" /> Add to calendar
    </Button>
  );
}
