import Link from "next/link";
import { MailIcon, PhoneIcon } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/brand/social-icons";
import { Logo } from "@/components/brand/logo";
import { Script } from "@/components/brand/doodles";
import { footerNav, siteConfig } from "@/config/site";

const socials = [
  { href: siteConfig.socials.instagram, label: "Instagram", icon: InstagramIcon },
  { href: siteConfig.socials.facebook, label: "Facebook", icon: FacebookIcon },
  { href: siteConfig.socials.linkedin, label: "LinkedIn", icon: LinkedinIcon },
  { href: siteConfig.socials.youtube, label: "YouTube", icon: YoutubeIcon },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] md:py-20">
        <div className="space-y-5">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">{siteConfig.description}</p>
          <div className="space-y-2 text-sm text-white/80">
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-white">
              <MailIcon className="size-4" /> {siteConfig.email}
            </a>
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
              <PhoneIcon className="size-4" /> {siteConfig.phone}
            </a>
          </div>
        </div>
        {Object.entries(footerNav).map(([group, links]) => (
          <div key={group}>
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">{group}</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/80 transition hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <div className="flex gap-2">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full bg-white/5 text-white/70 transition hover:-translate-y-0.5 hover:bg-coral hover:text-white"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-[0.22em] text-center font-display text-[22vw] leading-none font-extrabold tracking-tighter text-white/[0.04] select-none"
      >
        crystal<Script className="text-coral/20">.</Script>
      </p>
    </footer>
  );
}
