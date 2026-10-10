"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          router.refresh();
          return seconds;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      Auto-refresh in {left}s
      <button type="button" onClick={() => { router.refresh(); setLeft(seconds); }} aria-label="Refresh now" className="hover:text-foreground">
        <RefreshCwIcon className="size-3.5" />
      </button>
    </span>
  );
}
