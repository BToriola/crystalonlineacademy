import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon, MailIcon, PhoneIcon } from "lucide-react";
import { Script } from "@/components/brand/doodles";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/components/contact-form";
import { LiveClocks } from "@/features/contact/components/live-clocks";
import { ClosingCta } from "@/features/marketing/pages/closing-cta";
import { PageHero } from "@/features/marketing/pages/page-hero";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about tutoring, pricing or becoming a tutor? Email, call or WhatsApp the Crystal Online Academy team.",
};

const channels = [
  {
    icon: MailIcon,
    title: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    note: "Replies within one working day",
    tone: "bg-sky text-ink",
  },
  {
    icon: PhoneIcon,
    title: "Phone",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\s/g, "")}`,
    note: "During office hours",
    tone: "bg-blush text-ink",
  },
  {
    icon: WhatsappIcon,
    title: "WhatsApp",
    value: "Chat with us",
    href: siteConfig.whatsapp,
    note: "Fastest way to reach us",
    tone: "bg-leaf text-white",
    external: true,
  },
];

const officeHours = [
  {
    region: "🇬🇧 UK families",
    zone: "UK time",
    rows: [
      ["Monday – Friday", "8:00 am – 8:00 pm"],
      ["Saturday", "9:00 am – 2:00 pm"],
    ],
  },
  {
    region: "🇨🇦 Canadian families",
    zone: "Eastern time",
    rows: [
      ["Monday – Friday", "9:00 am – 6:00 pm"],
      ["Saturday", "9:00 am – 1:00 pm"],
    ],
    footnote: "That's 6:00 am – 3:00 pm Pacific on weekdays.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            We&apos;d love to <Script>hear from you</Script>
          </>
        }
        subtitle="Whether you're weighing up tutoring for the first time or you're already part of the family, a real person will get back to you quickly."
      />

      <section className="container-page pb-16 sm:pb-24">
        <div className="grid gap-8 *:min-w-0 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="rounded-[2rem] border bg-card p-6 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Send us a message</h2>
            <p className="mt-2 mb-8 text-muted-foreground">
              Looking for a tutor? The quickest route is our{" "}
              <Link href="/book-trial" className="font-semibold text-primary underline-offset-4 hover:underline">
                free trial form
              </Link>
              .
            </p>
            <ContactForm />
          </Reveal>

          <div className="flex flex-col gap-4">
            <Stagger className="grid gap-4 *:min-w-0 sm:grid-cols-3 lg:grid-cols-1">
              {channels.map((c) => (
                <StaggerItem key={c.title}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`group flex h-full items-center gap-4 rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${c.tone}`}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/30">
                      <c.icon className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm opacity-75">{c.title}</span>
                      <span className="block truncate font-display text-lg font-bold">{c.value}</span>
                      <span className="block text-xs opacity-70">{c.note}</span>
                    </span>
                    <ArrowUpRightIcon className="size-5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </a>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1} className="rounded-[2rem] bg-ink p-6 text-white sm:p-8">
              <div className="flex items-center gap-2">
                <ClockIcon className="size-5 text-sun" aria-hidden />
                <h2 className="font-display text-xl font-bold">Office hours</h2>
              </div>
              <div className="mt-5 space-y-5">
                {officeHours.map((block) => (
                  <div key={block.region}>
                    <p className="font-semibold">
                      {block.region} <span className="text-sm font-normal text-white/60">({block.zone})</span>
                    </p>
                    <dl className="mt-2 space-y-1 text-sm">
                      {block.rows.map(([day, hours]) => (
                        <div key={day} className="flex justify-between gap-4 border-b border-white/10 pb-1">
                          <dt className="text-white/70">{day}</dt>
                          <dd className="font-medium tabular-nums">{hours}</dd>
                        </div>
                      ))}
                    </dl>
                    {block.footnote && <p className="mt-1.5 text-xs text-white/60">{block.footnote}</p>}
                  </div>
                ))}
              </div>
              <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">Right now it&apos;s</p>
              <LiveClocks />
            </Reveal>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
