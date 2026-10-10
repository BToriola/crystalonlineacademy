"use client";

import { useState, useTransition } from "react";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rateSession } from "@/features/sessions/parent-actions";
import { cn } from "@/lib/utils";

const labels = ["", "Not great", "Okay", "Good", "Great", "Brilliant"];

export function RateSession({
  sessionId,
  initialRating,
  initialFeedback,
}: {
  sessionId: string;
  initialRating: number | null;
  initialFeedback: string | null;
}) {
  const [saved, setSaved] = useState({ rating: initialRating, feedback: initialFeedback });
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, startTransition] = useTransition();

  if (saved.rating && !editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="flex items-center gap-0.5" aria-label={`You rated this ${saved.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} aria-hidden className={cn("size-4", n <= saved.rating! ? "fill-sun text-sun" : "text-muted-foreground/40")} />
          ))}
        </span>
        {saved.feedback && <span className="text-muted-foreground italic">&ldquo;{saved.feedback}&rdquo;</span>}
        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setEditing(true)}>
          Edit rating
        </Button>
      </div>
    );
  }

  const shown = hover || rating;

  const submit = () =>
    startTransition(async () => {
      const result = await rateSession({ sessionId, rating, feedback });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Thanks for your rating!");
      setSaved({ rating, feedback: feedback.trim() || null });
      setEditing(false);
    });

  return (
    <div className="space-y-3 rounded-2xl bg-muted/50 p-3">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Rate this session</legend>
        <span className="text-sm font-medium" aria-hidden>
          How was it?
        </span>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""} — ${labels[n]}`}
              aria-pressed={rating === n}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(n)}
              className="grid size-9 place-items-center rounded-full outline-none transition hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <StarIcon className={cn("size-5 transition", n <= shown ? "fill-sun text-sun" : "text-muted-foreground/50")} />
            </button>
          ))}
        </div>
        {shown > 0 && <span className="text-xs text-muted-foreground">{labels[shown]}</span>}
      </fieldset>
      {rating > 0 && (
        <div className="space-y-2">
          <label htmlFor={`feedback-${sessionId}`} className="sr-only">
            Feedback for the tutor (optional)
          </label>
          <Textarea
            id={`feedback-${sessionId}`}
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Anything you'd like the tutor to know? (optional)"
            className="bg-background"
          />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full" onClick={submit} disabled={pending}>
              {pending ? "Saving…" : "Save rating"}
            </Button>
            {editing && (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
