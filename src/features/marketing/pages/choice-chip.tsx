import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ChoiceChipProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  selected: boolean;
  onToggle: () => void;
};

export function ChoiceChip({ selected, onToggle, className, children, ...props }: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:bg-accent hover:text-foreground",
        className,
      )}
      {...props}
    >
      {selected && <CheckIcon className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}
