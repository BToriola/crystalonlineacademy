"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleTutorPublished } from "@/features/tutors/actions";

export function PublishSwitch({ tutorId, name, published }: { tutorId: string; name: string; published: boolean }) {
  const [checked, setChecked] = useState(published);
  const [pending, startTransition] = useTransition();

  const onChange = (value: boolean) => {
    setChecked(value);
    startTransition(async () => {
      const result = await toggleTutorPublished(tutorId, value);
      if (result.ok) toast.success(result.message ?? "Saved.");
      else {
        setChecked(!value);
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} disabled={pending} aria-label={`Show ${name} on the public website`} />
      <span className="text-xs text-muted-foreground">{checked ? "Live" : "Hidden"}</span>
    </div>
  );
}
