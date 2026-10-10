import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const Icon = tone === "error" ? CircleAlertIcon : CircleCheckIcon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-sm",
        tone === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-success/30 bg-success/10 text-foreground",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "success" && "text-success")} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
