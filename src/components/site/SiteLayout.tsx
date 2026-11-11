import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandWatermark } from "./brand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main data-tour="page-main" className={cn("relative", className)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div className="pointer-events-none absolute inset-0 aura" />
      <div className="pointer-events-none absolute inset-0 bg-ember opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/45 to-transparent" />
      <BrandWatermark
        sizes="420px"
        className="-bottom-28 -right-24 hidden w-[26rem] opacity-[0.08] sm:block lg:w-[30rem]"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 lg:px-10 lg:pb-18 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-10 bg-gradient-to-r from-signal/80 to-transparent"
              />
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl leading-[0.96] tracking-[-0.02em] text-pearl sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
            <div aria-hidden className="mystic-rule mt-10 max-w-xs opacity-70" />
          </div>
          {aside ? <div className="lg:col-span-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
