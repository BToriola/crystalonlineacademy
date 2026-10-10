import "server-only";
import { startOfWeek } from "date-fns";
import { getProfilesByIds } from "@/features/profiles/queries";
import { getBadges, getStarEvents } from "@/features/rewards/queries";
import { listSessions } from "@/features/sessions/queries";
import { getStudentForProfile } from "@/features/students/queries";
import { formatInZone, inZone, relativeTime } from "@/lib/format";
import type { Badge, Profile, Session } from "@/types/database";
import { isUpcoming } from "@/features/parent/lib/time";
import { levelFor } from "./levels";
import type { HomeworkItem, StarItem } from "./types";

const DAY = 86_400_000;

export type WeekDay = {
  key: string;
  weekday: string;
  day: string;
  isToday: boolean;
  isPast: boolean;
  classes: { id: string; subject: string; time: string; done: boolean }[];
};

export type NextGoal = { emoji: string; title: string; detail: string; current: number; target: number };

function buildWeek(sessions: Session[], timezone: string, now: number): WeekDay[] {
  const monday = startOfWeek(inZone(new Date(now), timezone), { weekStartsOn: 1 });
  const todayKey = formatInZone(new Date(now), timezone, "yyyy-MM-dd");
  return Array.from({ length: 7 }, (_, i) => {
    // Noon avoids DST edges when stepping through days.
    const date = new Date(monday.getTime() + i * DAY + 12 * 3_600_000);
    const key = formatInZone(date, timezone, "yyyy-MM-dd");
    return {
      key,
      weekday: formatInZone(date, timezone, "EEE"),
      day: formatInZone(date, timezone, "d"),
      isToday: key === todayKey,
      isPast: key < todayKey,
      classes: sessions
        .filter((s) => s.status !== "cancelled" && formatInZone(s.starts_at, timezone, "yyyy-MM-dd") === key)
        .map((s) => ({ id: s.id, subject: s.subject, time: formatInZone(s.starts_at, timezone, "h:mm a"), done: s.status === "completed" })),
    };
  });
}

/** Picks the unearned badge the learner is closest to, falling back to the next level. */
function nextGoal(badges: Badge[], sessions: Session[], stars: number, streak: number, now: number): NextGoal {
  const completed = sessions.filter((s) => s.status === "completed");
  const homeworkDone = sessions.filter((s) => s.homework && s.homework_done).length;
  const lastMiss = sessions.filter((s) => s.status === "missed").map((s) => new Date(s.starts_at).getTime()).sort((a, b) => b - a)[0];
  const firstLesson = sessions.map((s) => new Date(s.starts_at).getTime()).sort((a, b) => a - b)[0];
  const since = Math.max(lastMiss ?? 0, firstLesson ?? now);
  const cleanDays = Math.max(0, Math.floor((now - since) / DAY));

  const metrics: Record<string, { current: number; target: number; unit: string }> = {
    "first-session": { current: completed.length, target: 1, unit: "lesson" },
    "streak-5": { current: streak, target: 5, unit: "days in a row" },
    "homework-hero": { current: homeworkDone, target: 10, unit: "homework tasks" },
    "star-100": { current: stars, target: 100, unit: "stars" },
    "perfect-month": { current: cleanDays, target: 30, unit: "days with no missed classes" },
  };

  const candidates = badges
    .filter((b) => !b.earned_at && metrics[b.key])
    .map((b) => ({ badge: b, ...metrics[b.key] }))
    .filter((c) => c.current < c.target)
    .sort((a, b) => b.current / b.target - a.current / a.target);

  const best = candidates[0];
  if (best) {
    return {
      emoji: best.badge.emoji,
      title: best.badge.title,
      detail: `${Math.min(best.current, best.target)} of ${best.target} ${best.unit}`,
      current: best.current,
      target: best.target,
    };
  }

  const level = levelFor(stars);
  if (!level.next) return { emoji: level.emoji, title: "Legend level", detail: "You've reached the top level!", current: 1, target: 1 };
  return {
    emoji: level.next.emoji,
    title: `${level.next.name} level`,
    detail: `${level.starsToNext} more star${level.starsToNext === 1 ? "" : "s"} to go`,
    current: Math.round(level.progress * 50),
    target: 50,
  };
}

export async function getLearnerSpace(user: Profile) {
  const student = await getStudentForProfile(user.id);
  if (!student) return null;

  const [sessions, badges, starEvents] = await Promise.all([
    listSessions({ studentIds: [student.id] }),
    getBadges(student.id),
    getStarEvents(student.id),
  ]);
  const tutors = await getProfilesByIds(sessions.map((s) => s.tutor_id));
  const now = Date.now();

  const upcoming = sessions.filter((s) => isUpcoming(s, now)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const homework: HomeworkItem[] = sessions
    .filter((s) => s.homework)
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at))
    .map((s) => ({
      id: s.id,
      task: s.homework!,
      done: s.homework_done,
      subject: s.subject,
      tutor: tutors[s.tutor_id]?.full_name ?? "your tutor",
      setOn: formatInZone(s.starts_at, user.timezone, "EEE d MMM"),
    }));

  return {
    student,
    tutors,
    badges,
    next: upcoming[0] ?? null,
    week: buildWeek(sessions, user.timezone, now),
    homework,
    stars: [...starEvents]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((e): StarItem => ({ id: e.id, amount: e.amount, reason: e.reason, when: relativeTime(e.created_at) })),
    goal: nextGoal(badges, sessions, student.stars, student.streak_days, now),
  };
}
