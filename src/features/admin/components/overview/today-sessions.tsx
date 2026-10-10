import { CalendarCheckIcon, VideoIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { joinHref } from "@/features/attendance/constants";
import { formatInZone } from "@/lib/format";
import type { Session } from "@/types/database";

type Row = { session: Session; studentName: string; studentSeed?: string; tutorName: string };

export function TodaySessions({ rows, timezone }: { rows: Row[]; timezone: string }) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CalendarCheckIcon className="size-5" />
        </span>
        <p className="font-medium">No sessions today</p>
        <p className="text-sm text-muted-foreground">A quiet day — a good moment to follow up on trial requests.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {rows.map(({ session, studentName, studentSeed, tutorName }) => (
        <li key={session.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50">
          <div className="w-20 shrink-0">
            <p className="font-display text-base font-bold tabular-nums">{formatInZone(session.starts_at, timezone, "h:mm a")}</p>
            <p className="text-xs text-muted-foreground">{session.duration_min} min</p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar name={studentName} seed={studentSeed} />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {studentName} <span className="font-normal text-muted-foreground">· {session.subject}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">with {tutorName}{session.topic ? ` · ${session.topic}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} />
            {session.meeting_url && session.status === "scheduled" && (
              <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
                <a href={joinHref(session.id)} target="_blank" rel="noreferrer" aria-label={`Drop in on ${studentName}'s session`}>
                  <VideoIcon />
                </a>
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
