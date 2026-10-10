"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState icon={TriangleAlertIcon} title="Something went wrong" description="We couldn't load this page. Please try again.">
      <Button onClick={reset} className="rounded-full">
        <RotateCcwIcon /> Try again
      </Button>
    </EmptyState>
  );
}
