"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const messages: Record<string, string> = {
  closed: "This class opens 15 minutes before it starts.",
  forbidden: "You don't have access to that class.",
  unavailable: "That class has been cancelled or no longer exists.",
  "no-link": "This class doesn't have an approved meeting link yet. The academy has been notified.",
};

export function JoinNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reason = params.get("join");

  useEffect(() => {
    if (!reason) return;
    toast.error(messages[reason] ?? "We couldn't open that class.");
    router.replace(pathname, { scroll: false });
  }, [reason, router, pathname]);

  return null;
}
