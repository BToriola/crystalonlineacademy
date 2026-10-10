import { TZDate } from "@date-fns/tz";
import { format, formatDistanceToNowStrict, isToday, isTomorrow } from "date-fns";

export function inZone(date: string | Date, timezone: string) {
  return new TZDate(new Date(date).getTime(), timezone);
}

export function formatInZone(date: string | Date, timezone: string, pattern = "EEE d MMM, h:mm a") {
  return format(inZone(date, timezone), pattern);
}

/** "Today, 5:00 PM" / "Tomorrow, 9:30 AM" / "Thu 12 Oct, 4:00 PM" in the viewer's timezone. */
export function friendlyDateTime(date: string | Date, timezone: string) {
  const zoned = inZone(date, timezone);
  const time = format(zoned, "h:mm a");
  if (isToday(zoned)) return `Today, ${time}`;
  if (isTomorrow(zoned)) return `Tomorrow, ${time}`;
  return format(zoned, "EEE d MMM, h:mm a");
}

export function shortZone(timezone: string, date: Date = new Date()) {
  return (
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone, timeZoneName: "short" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? timezone
  );
}

export function relativeTime(date: string | Date) {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function formatMoney(amount: number, currency: "GBP" | "CAD" | "NGN" = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function initials(name: string) {
  return name
    .replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function avatarUrl(seed: string, style: "notionists" | "adventurer" | "fun-emoji" = "notionists") {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=ffd5dc,c0aede,d1d4f9,b6e3f4,ffdfbf`;
}
