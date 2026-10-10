function resolveSiteUrl() {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3100");
  const withProtocol = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
  return withProtocol.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Crystal Online Academy",
  shortName: "Crystal",
  tagline: "Personal 1:1 online tutoring for children in the UK & Canada",
  description:
    "Hand-picked, fully vetted tutors teaching children from Early Years to GCSE and Grade 12, live and one-to-one, with progress you can actually see.",
  url: resolveSiteUrl(),
  email: "hello@crystalonlineacademy.com",
  phone: "+44 20 0000 0000",
  whatsapp: "https://wa.me/440000000000",
  socials: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const marketingNav = [
  { title: "How it works", href: "/#how-it-works" },
  { title: "Tutors", href: "/tutors" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
  { title: "FAQ", href: "/faq" },
] as const;

export const footerNav = {
  Families: [
    { title: "Book a free trial", href: "/book-trial" },
    { title: "Pricing", href: "/pricing" },
    { title: "Meet our tutors", href: "/tutors" },
    { title: "FAQ", href: "/faq" },
  ],
  Tutors: [
    { title: "Become a tutor", href: "/become-a-tutor" },
    { title: "Tutor login", href: "/login" },
  ],
  Company: [
    { title: "About us", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Privacy policy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
  ],
} as const;

export const regions = [
  { value: "UK", label: "United Kingdom", flag: "🇬🇧", currency: "GBP", timezone: "Europe/London" },
  { value: "CA", label: "Canada", flag: "🇨🇦", currency: "CAD", timezone: "America/Toronto" },
] as const;

export type Region = (typeof regions)[number]["value"];

/** Where an account holder lives — wider than the markets we serve, since staff and some families live elsewhere. */
export const homeCountries = [
  { value: "UK", label: "United Kingdom", flag: "🇬🇧", timezone: "Europe/London" },
  { value: "CA", label: "Canada", flag: "🇨🇦", timezone: "America/Toronto" },
  { value: "NG", label: "Nigeria", flag: "🇳🇬", timezone: "Africa/Lagos" },
  { value: "OTHER", label: "Elsewhere", flag: "🌍", timezone: "Europe/London" },
] as const;

export type HomeCountry = (typeof homeCountries)[number]["value"];

export function countryFromTimezone(tz: string | null): HomeCountry {
  if (!tz) return "UK";
  if (tz === "Europe/London") return "UK";
  if (tz === "Africa/Lagos") return "NG";
  if (/^America\/(St_Johns|Halifax|Toronto|Montreal|Winnipeg|Regina|Edmonton|Vancouver|Moncton|Whitehorse)/.test(tz)) return "CA";
  return "OTHER";
}

export const yearGroups = {
  UK: [
    "Nursery (EYFS)",
    "Reception (EYFS)",
    "Year 1 (KS1)",
    "Year 2 (KS1)",
    "Year 3 (KS2)",
    "Year 4 (KS2)",
    "Year 5 (KS2)",
    "Year 6 (KS2 / SATs)",
    "Year 7 (KS3)",
    "Year 8 (KS3)",
    "Year 9 (KS3)",
    "Year 10 (GCSE)",
    "Year 11 (GCSE)",
  ],
  CA: [
    "Pre-K",
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ],
} as const;

export const subjects = [
  "Maths",
  "English",
  "Phonics & Reading",
  "Creative Writing",
  "Science",
  "Biology",
  "Chemistry",
  "Physics",
  "French",
  "Coding",
  "11+ Prep",
  "Yoruba",
  "Igbo",
  "Music",
] as const;

export const timezones = [
  "Europe/London",
  "America/St_Johns",
  "America/Halifax",
  "America/Toronto",
  "America/Winnipeg",
  "America/Edmonton",
  "America/Vancouver",
  "Africa/Lagos",
  "Africa/Accra",
  "Europe/Dublin",
  "America/New_York",
] as const;
