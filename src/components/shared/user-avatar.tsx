import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({ name, src, seed, className }: { name: string; src?: string | null; seed?: string; className?: string }) {
  return (
    <Avatar className={cn("size-9 rounded-full", className)}>
      <AvatarImage src={src ?? avatarUrl(seed ?? name)} alt={name} />
      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
