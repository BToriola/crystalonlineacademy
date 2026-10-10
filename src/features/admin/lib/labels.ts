import type { RegionCode } from "@/types/database";

export const countryFlags: Record<string, string> = { UK: "🇬🇧", CA: "🇨🇦", NG: "🇳🇬", OTHER: "🌍" };

export function flagFor(country: RegionCode | string) {
  return countryFlags[country] ?? "🌍";
}

export function humanise(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(fullName: string) {
  return fullName.replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "").split(/\s+/)[0] ?? fullName;
}

/** Strips everything except digits so the number works in a wa.me link. */
export function whatsappLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
