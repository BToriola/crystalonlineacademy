import { UserAvatar } from "@/components/shared/user-avatar";
import { cn } from "@/lib/utils";

export function Person({
  name,
  sub,
  seed,
  src,
  className,
  size = "default",
}: {
  name: string;
  sub?: React.ReactNode;
  seed?: string;
  src?: string | null;
  className?: string;
  size?: "sm" | "default";
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <UserAvatar name={name} seed={seed} src={src} className={size === "sm" ? "size-7" : undefined} />
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
