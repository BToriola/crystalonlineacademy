export const STARS_PER_LEVEL = 50;

export const levels = [
  { name: "Explorer", emoji: "🧭" },
  { name: "Adventurer", emoji: "🎒" },
  { name: "Trailblazer", emoji: "🚀" },
  { name: "Champion", emoji: "🏅" },
  { name: "Legend", emoji: "👑" },
] as const;

export function levelFor(stars: number) {
  const index = Math.min(Math.floor(stars / STARS_PER_LEVEL), levels.length - 1);
  const current = levels[index];
  const next = levels[index + 1] ?? null;
  const floor = index * STARS_PER_LEVEL;
  const into = stars - floor;
  return {
    number: index + 1,
    ...current,
    next,
    starsToNext: next ? (index + 1) * STARS_PER_LEVEL - stars : 0,
    progress: next ? Math.min(1, into / STARS_PER_LEVEL) : 1,
  };
}
