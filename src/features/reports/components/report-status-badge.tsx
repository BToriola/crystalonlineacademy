import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ReportStatusBadge({ published, className }: { published: boolean; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border-0 font-medium", published ? "bg-success/12 text-success" : "bg-muted text-muted-foreground", className)}
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
