import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, SmileIcon } from "lucide-react";
import { Sparkle } from "@/components/brand/doodles";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { Bounce, ProgressRing, StarCounter, StarFeed, StreakFlame } from "@/features/learner/components/fun";
import { HomeworkList } from "@/features/learner/components/homework-list";
import { getLearnerSpace } from "@/features/learner/data";
import { levelFor } from "@/features/learner/levels";
import { Countdown, JoinButton } from "@/features/parent/components/lesson-timing";
import { JOIN_OPENS_MIN_BEFORE } from "@/features/parent/lib/time";
import { friendlyDateTime, shortZone } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "My space" };

const chipColours = ["bg-sky/60", "bg-blush/60", "bg-sun/50", "bg-leaf/25", "bg-coral/20"];
const chipFor = (subject: string) => chipColours[[...subject].reduce((n, c) => n + c.charCodeAt(0), 0) % chipColours.length];

export default async function LearnerHomePage() {
  const user = await requireUser("student");
  const space = await getLearnerSpace(user);

  if (!space) {
    return (
      <EmptyState
        icon={SmileIcon}
        title="Your space is nearly ready!"
        description="We couldn't find your learner profile yet. Ask your grown-up to link your account from their family dashboard."
      />
    );
  }

  const { student, next, week, homework, stars, goal, tutors } = space;
  const level = levelFor(student.stars);
  const todo = homework.filter((h) => !h.done).length;
  const nextTutor = next ? tutors[next.tutor_id] : undefined;

  return (
    <div className="space-y-8">
      <Bounce>
        <section aria-labelledby="hello" className="slab relative overflow-hidden bg-sun/40 p-6 sm:p-10">
          <Sparkle className="absolute top-6 right-6 size-10 animate-float text-coral" />
          <Sparkle className="absolute right-24 bottom-8 size-6 animate-float text-primary [animation-delay:1s]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <UserAvatar name={student.first_name} seed={student.avatar_seed} className="size-20 ring-4 ring-card sm:size-28" />
              <div>
                <h1 id="hello" className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
                  Hey {student.first_name}! <span className="inline-block animate-wiggle">👋</span>
                </h1>
                <p className="mt-1 text-lg font-medium text-ink/75 dark:text-foreground/75">
                  {level.emoji} Level {level.number} {level.name}
                  {todo ? ` · ${todo} homework task${todo === 1 ? "" : "s"} to do` : " · all homework done!"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <StarCounter stars={student.stars} />
              <StreakFlame days={student.streak_days} />
            </div>
          </div>
        </section>
      </Bounce>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Bounce delay={0.1}>
          <section aria-labelledby="next-class" className="slab relative h-full overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
            <div aria-hidden className="absolute -right-14 -bottom-16 size-56 rounded-full bg-white/10" />
            <p className="text-sm font-semibold tracking-wide text-primary-foreground/75 uppercase">Your next class</p>
            {next ? (
              <div className="relative mt-3 space-y-5">
                <div>
                  <h2 id="next-class" className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {next.subject}
                  </h2>
                  {next.topic && <p className="mt-1 text-lg text-primary-foreground/85">{next.topic}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <ClockIcon className="size-5" aria-hidden />
                    {friendlyDateTime(next.starts_at, user.timezone)} {shortZone(user.timezone, new Date(next.starts_at))}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <UserAvatar name={nextTutor?.full_name ?? "Tutor"} src={nextTutor?.avatar_url} seed={nextTutor?.id} className="size-8 ring-2 ring-white/40" />
                    with {nextTutor?.full_name ?? "your tutor"}
                  </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <JoinButton
                    sessionId={next.id}
                    startsAt={next.starts_at}
                    durationMin={next.duration_min}
                    meetingUrl={next.meeting_url}
                    label="Join my class"
                    size="lg"
                    className="h-16 bg-white px-8 text-lg font-bold text-primary shadow-xl shadow-ink/20 hover:scale-[1.03] hover:bg-white disabled:bg-white/70 [&_svg]:size-6!"
                  />
                  <div>
                    <Countdown startsAt={next.starts_at} durationMin={next.duration_min} className="block font-display text-2xl font-extrabold" />
                    <p className="text-sm text-primary-foreground/75">The button lights up {JOIN_OPENS_MIN_BEFORE} minutes before.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative mt-3 space-y-2">
                <h2 id="next-class" className="font-display text-3xl font-extrabold">
                  No classes booked right now
                </h2>
                <p className="text-primary-foreground/80">Time to relax — or have a go at your homework!</p>
              </div>
            )}
          </section>
        </Bounce>

        <Bounce delay={0.2}>
          <section aria-labelledby="goal-title" className="flex h-full flex-col items-center justify-center gap-4 rounded-[2rem] border bg-card p-6 text-center">
            <ProgressRing current={goal.current} target={goal.target} emoji={goal.emoji} label={`${goal.title}: ${goal.detail}`} />
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Next up</p>
              <h2 id="goal-title" className="font-display text-xl font-extrabold">
                {goal.title}
              </h2>
              <p className="text-muted-foreground">{goal.detail}</p>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-full px-5">
              <Link href="/learner/badges">
                My badges <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </section>
        </Bounce>
      </div>

      <section aria-labelledby="week-title" className="space-y-4">
        <h2 id="week-title" className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <CalendarDaysIcon className="size-6 text-primary" aria-hidden /> This week
        </h2>
        <ol className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {week.map((day) => (
            <li
              key={day.key}
              aria-current={day.isToday ? "date" : undefined}
              className={cn(
                "flex min-h-28 flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center sm:min-h-36 sm:rounded-3xl sm:p-3",
                day.isToday ? "bg-coral text-white shadow-lg shadow-coral/30" : "bg-card ring-1 ring-foreground/10",
                day.isPast && !day.isToday && "opacity-60",
              )}
            >
              <span className={cn("text-[11px] font-semibold uppercase sm:text-xs", !day.isToday && "text-muted-foreground")}>{day.weekday}</span>
              <span className="font-display text-xl leading-none font-extrabold sm:text-3xl">{day.day}</span>
              <ul className="mt-1 flex w-full flex-col gap-1">
                {day.classes.map((c) => (
                  <li
                    key={c.id}
                    className={cn(
                      "w-full truncate rounded-lg px-1 py-1 text-[10px] leading-tight font-semibold sm:rounded-xl sm:px-2 sm:text-xs",
                      day.isToday ? "bg-white/25" : cn(chipFor(c.subject), "text-ink dark:text-foreground"),
                    )}
                    title={`${c.subject} at ${c.time}`}
                  >
                    <span className="block truncate">{c.subject}</span>
                    <span className="hidden font-normal opacity-80 sm:block">
                      {c.done ? "✓ done" : c.time}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">Times in {shortZone(user.timezone)}.</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="hw-title" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="hw-title" className="font-display text-2xl font-extrabold">
              Homework to do
            </h2>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/learner/homework">
                See all <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <HomeworkList items={homework} compact />
        </section>

        <section aria-labelledby="stars-title" className="space-y-4">
          <h2 id="stars-title" className="font-display text-2xl font-extrabold">
            Stars from your tutors ⭐
          </h2>
          {stars.length ? (
            <StarFeed items={stars.slice(0, 5)} />
          ) : (
            <p className="rounded-3xl border-2 border-dashed p-5 text-muted-foreground">Your tutors give stars for great work — your first ones will sparkle here!</p>
          )}
        </section>
      </div>
    </div>
  );
}
