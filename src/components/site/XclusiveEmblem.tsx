import { cn } from "@/lib/utils";

/**
 * Emblema vectorial de Xclusive.
 *
 * Se dibuja con SVG para que sea nítido en cualquier tamaño y no dependa de
 * assets remotos. La composición: gota de obsidiana, monograma X en perla,
 * vetas de cereza y anillos orbitales.
 */
export function XclusiveEmblem({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 640 640"
      role="img"
      aria-label="Emblema de Xclusive: gota de obsidiana con monograma X y vetas de cereza"
      className={cn("overflow-visible", className)}
      data-intro={animated ? "true" : undefined}
    >
      <defs>
        <radialGradient id="xc-halo" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#ff5b7a" stopOpacity="0.34" />
          <stop offset="52%" stopColor="#a30f2d" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#050203" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="xc-obsidian" x1="28%" y1="6%" x2="72%" y2="96%">
          <stop offset="0%" stopColor="#35141d" />
          <stop offset="46%" stopColor="#180a0f" />
          <stop offset="100%" stopColor="#070304" />
        </linearGradient>
        <linearGradient id="xc-cherry" x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#ff9aac" />
          <stop offset="34%" stopColor="#f43f5e" />
          <stop offset="70%" stopColor="#b31237" />
          <stop offset="100%" stopColor="#5c0718" />
        </linearGradient>
        <linearGradient id="xc-pearl" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffaf7" />
          <stop offset="52%" stopColor="#f1e4dd" />
          <stop offset="100%" stopColor="#bfa9a1" />
        </linearGradient>
        <linearGradient id="xc-vein" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff8fa3" stopOpacity="0" />
          <stop offset="48%" stopColor="#ff6b86" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd6dd" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="xc-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe3e8" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#ff5b7a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a30f2d" stopOpacity="0" />
        </radialGradient>
        <filter id="xc-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="xc-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <clipPath id="xc-drop-clip">
          <path d="M320 74C414 206 512 300 512 402c0 108-86 186-192 186s-192-78-192-186c0-102 98-196 192-328Z" />
        </clipPath>
      </defs>

      {/* Halo */}
      <circle cx="320" cy="330" r="300" fill="url(#xc-halo)" />

      {/* Anillos orbitales */}
      <g className="emblem-orbit" style={{ transformOrigin: "320px 330px" }}>
        <ellipse
          cx="320"
          cy="330"
          rx="286"
          ry="120"
          fill="none"
          stroke="url(#xc-cherry)"
          strokeOpacity="0.34"
          strokeWidth="1.4"
          transform="rotate(-24 320 330)"
        />
        <ellipse
          cx="320"
          cy="330"
          rx="250"
          ry="96"
          fill="none"
          stroke="#f6e8e2"
          strokeOpacity="0.12"
          strokeWidth="0.9"
          strokeDasharray="3 9"
          transform="rotate(28 320 330)"
        />
        <circle cx="52" cy="300" r="3.2" fill="#ffb3c1" />
        <circle cx="586" cy="360" r="2.2" fill="#f6e8e2" opacity="0.75" />
      </g>
      <g className="emblem-orbit-reverse" style={{ transformOrigin: "320px 330px" }}>
        <ellipse
          cx="320"
          cy="330"
          rx="268"
          ry="268"
          fill="none"
          stroke="#ff5b7a"
          strokeOpacity="0.09"
          strokeWidth="1"
          strokeDasharray="1 14"
        />
      </g>

      {/* Gota */}
      <g filter="url(#xc-glow)">
        <path
          d="M320 74C414 206 512 300 512 402c0 108-86 186-192 186s-192-78-192-186c0-102 98-196 192-328Z"
          fill="url(#xc-obsidian)"
          stroke="url(#xc-cherry)"
          strokeWidth="2.2"
        />
      </g>

      {/* Interior de la gota */}
      <g clipPath="url(#xc-drop-clip)">
        <ellipse
          cx="248"
          cy="352"
          rx="210"
          ry="150"
          fill="#ff5b7a"
          opacity="0.08"
          filter="url(#xc-soft)"
        />
        <path
          d="M118 512C210 448 280 452 356 486c72 32 138 24 196-18"
          fill="none"
          stroke="url(#xc-vein)"
          strokeWidth="1.4"
          opacity="0.6"
        />
        <path
          d="M150 566C238 508 300 520 372 548c62 24 122 12 174-26"
          fill="none"
          stroke="url(#xc-vein)"
          strokeWidth="1"
          opacity="0.35"
        />
        <ellipse
          cx="320"
          cy="250"
          rx="118"
          ry="42"
          fill="none"
          stroke="#f6e8e2"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      </g>

      {/* Monograma X */}
      <g
        filter="url(#xc-glow)"
        stroke="url(#xc-pearl)"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      >
        <path className="emblem-draw" d="M236 262C282 314 356 364 406 452" />
        <path className="emblem-draw emblem-draw-late" d="M404 262C358 314 284 364 234 452" />
      </g>
      <g fill="url(#xc-pearl)">
        <path d="M236 248l9 14-9 14-9-14z" />
        <path d="M404 248l9 14-9 14-9-14z" />
        <path d="M236 438l9 14-9 14-9-14z" opacity="0.8" />
        <path d="M404 438l9 14-9 14-9-14z" opacity="0.8" />
      </g>

      {/* Núcleo de cereza */}
      <circle cx="320" cy="358" r="54" fill="url(#xc-core)" />
      <circle
        cx="320"
        cy="358"
        r="26"
        fill="none"
        stroke="#ffe3e8"
        strokeOpacity="0.55"
        strokeWidth="0.9"
      />

      {/* Destellos */}
      <g fill="#fff4ef">
        <path
          d="M164 190l3.4 10.6L178 204l-10.6 3.4L164 218l-3.4-10.6L150 204l10.6-3.4z"
          opacity="0.85"
        />
        <path d="M486 226l2.4 7.4 7.6 2.6-7.6 2.6-2.4 7.4-2.4-7.4-7.6-2.6 7.6-2.6z" opacity="0.6" />
        <path d="M470 470l1.8 5.6 5.6 1.8-5.6 1.8-1.8 5.6-1.8-5.6-5.6-1.8 5.6-1.8z" opacity="0.5" />
      </g>
    </svg>
  );
}
