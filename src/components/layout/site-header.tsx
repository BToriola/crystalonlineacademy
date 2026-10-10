"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRightIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { marketingNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled && !open ? "border-b border-border/60 bg-background/80 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <Logo className="relative z-10" />

        <nav className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition hover:bg-muted hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <Button asChild variant="outline" className="hidden h-10 rounded-full px-5 sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="h-10 rounded-full px-5 font-semibold shadow-lg shadow-primary/25">
            <Link href="/book-trial">Free trial</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border bg-background transition hover:bg-muted lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span className={cn("absolute left-0 h-0.5 w-4 rounded bg-foreground transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute top-1.5 left-0 h-0.5 w-3 rounded bg-foreground transition-all", open && "opacity-0")} />
              <span className={cn("absolute left-0 h-0.5 w-4 rounded bg-foreground transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-sand pt-24 lg:hidden"
          >
            <nav className="container-page flex flex-col gap-1">
              {[...marketingNav, { title: "Become a tutor", href: "/become-a-tutor" }, { title: "Contact", href: "/contact" }].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-ink/10 py-4 font-display text-4xl font-bold tracking-tight"
                  >
                    {item.title}
                    <ArrowUpRightIcon className="size-7 text-coral transition group-hover:rotate-45" />
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex gap-3">
                <Button asChild variant="outline" size="lg" className="h-12 flex-1 rounded-full">
                  <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
                </Button>
                <Button asChild size="lg" className="h-12 flex-1 rounded-full">
                  <a href={siteConfig.whatsapp} target="_blank" rel="noreferrer">WhatsApp us</a>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
