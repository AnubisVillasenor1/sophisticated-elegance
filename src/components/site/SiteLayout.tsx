import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandWatermark } from "./brand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className={cn("relative", className)}>{children}</main>
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
      <div className="pointer-events-none absolute inset-0 bg-ember opacity-60" />
      <BrandWatermark
        sizes="420px"
        className="-bottom-28 -right-24 hidden w-[26rem] opacity-[0.08] sm:block lg:w-[30rem]"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-10 lg:pb-16 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[0.98] text-pearl sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          {aside ? <div className="lg:col-span-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
