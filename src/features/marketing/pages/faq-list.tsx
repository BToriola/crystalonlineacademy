"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

export function FaqList({ items, className }: { items: readonly FaqItem[]; className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn("rounded-3xl border bg-card px-5 sm:px-8", className)}>
      {items.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger className="py-5 font-display text-base font-bold sm:text-lg hover:no-underline hover:text-primary">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
