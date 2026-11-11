import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

function BrandMarkSvg({ className }: { className?: string }) {
  const rawId = useId();
  const id = `brand-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("h-8 w-auto", className)}>
      <defs>
        <linearGradient id={`${id}-obsidian`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#35141d" />
          <stop offset="100%" stopColor="#080405" />
        </linearGradient>
        <linearGradient id={`${id}-cherry`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9aac" />
          <stop offset="55%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#8f0d28" />
        </linearGradient>
        <linearGradient id={`${id}-pearl`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffaf7" />
          <stop offset="100%" stopColor="#c9b6ae" />
        </linearGradient>
      </defs>
      <path
        d="M24 3C31 12 39 20 39 29a15 15 0 1 1-30 0C9 20 17 12 24 3Z"
        fill={`url(#${id}-obsidian)`}
        stroke={`url(#${id}-cherry)`}
        strokeWidth="1.4"
      />
      <path
        d="M17 20.5 31 33M31 20.5 17 33"
        fill="none"
        stroke={`url(#${id}-pearl)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="29" r="2" fill="#ffb3c1" opacity="0.9" />
    </svg>
  );
}

export function Logo({
  className,
  showEmblem = true,
}: {
  className?: string;
  showEmblem?: boolean;
}) {
  const { state } = useApp();
  const brand = state.settings.brandName || "Xclusive";
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={`${brand}, inicio`}
    >
      {showEmblem ? <BrandMarkSvg className="transition-opacity group-hover:opacity-90" /> : null}
      <span className="flex flex-col leading-none">
        <span className="font-serif text-2xl tracking-tight text-silver-sheen">{brand}</span>
        <span className="mt-0.5 text-[0.48rem] uppercase tracking-[0.34em] text-muted-foreground">
          by TAMV
        </span>
      </span>
    </Link>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-lg text-pearl", className)}>
      <BrandMarkSvg className="h-7" />
      Xclusive
    </span>
  );
}
