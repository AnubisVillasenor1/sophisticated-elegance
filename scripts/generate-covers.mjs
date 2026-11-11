/**
 * Genera las 15 piezas visuales de Xclusive (13 portadas + 2 atmÃ³sferas).
 *
 * Arte editorial compuesto con degradados y geometrÃ­a. No usa filtros SVG
 * (librsvg los rasteriza muy lento): la luz se resuelve con degradados
 * radiales y el grano con un buffer de ruido. Sin modelos externos.
 *
 * Uso: npm i --no-save sharp && node scripts/generate-covers.mjs
 */
import { statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const OUT = "public/covers";
await mkdir(OUT, { recursive: true });

const W = 900;
const H = 1125;

/** Halo radial: color sÃ³lido en el centro que se disuelve en transparencia. */
const glow = (g, i) => `
  <radialGradient id="g${i}" gradientUnits="userSpaceOnUse" cx="${g.x}" cy="${g.y}" r="${Math.max(g.rx ?? g.r, g.ry ?? g.r)}">
    <stop offset="0%" stop-color="${g.c}" stop-opacity="${g.o}"/>
    <stop offset="55%" stop-color="${g.c}" stop-opacity="${g.o * 0.55}"/>
    <stop offset="100%" stop-color="${g.c}" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="${g.x}" cy="${g.y}" rx="${g.rx ?? g.r}" ry="${g.ry ?? g.r}" fill="url(#g${i})"/>`;

/** Cortina inferior con borde difuso (degradado vertical). */
const band = (b, i) => `
  <linearGradient id="b${i}" gradientUnits="userSpaceOnUse" x1="0" y1="${b.top}" x2="0" y2="${H}">
    <stop offset="0%" stop-color="${b.c}" stop-opacity="0"/>
    <stop offset="42%" stop-color="${b.c}" stop-opacity="${b.o * 0.92}"/>
    <stop offset="100%" stop-color="${b.c}" stop-opacity="${b.o}"/>
  </linearGradient>
  <path d="${b.d}" fill="url(#b${i})"/>`;

const ring = (cx, cy, r, stroke, o, w = 1.5, dash = "") =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-opacity="${o}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;

function svg({ base, glows = [], bands = [], shapes = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      ${glows.map(glow).join("")}
      ${bands.map(band).join("")}
      <radialGradient id="vig" cx="50%" cy="45%" r="75%">
        <stop offset="52%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.86"/>
      </radialGradient>
      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="50%" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${base}"/>
    ${glows.map((g, i) => `<ellipse cx="${g.x}" cy="${g.y}" rx="${g.rx ?? g.r}" ry="${g.ry ?? g.r}" fill="url(#g${i})"/>`).join("")}
    ${bands.map((b, i) => `<path d="${b.d}" fill="url(#b${i})"/>`).join("")}
    ${shapes}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </svg>`;
}

const pieces = [
  {
    key: "noir",
    art: {
      base: "#0a0507",
      glows: [
        { x: 640, y: 300, r: 360, c: "#8b152b", o: 0.62 },
        { x: 240, y: 900, rx: 400, ry: 320, c: "#2b1020", o: 0.8 },
        { x: 540, y: 640, r: 120, c: "#ffb9a0", o: 0.2 },
      ],
      bands: [
        {
          d: "M-80 700C180 730 330 790 500 690s260-180 500-90v620H-80Z",
          c: "#160a10",
          o: 0.85,
          top: 600,
        },
      ],
      shapes:
        `<path d="M90 220C280 140 400 180 540 90" fill="none" stroke="#f3d8cf" stroke-opacity="0.2" stroke-width="1.5"/>` +
        `<ellipse cx="620" cy="330" rx="16" ry="74" fill="#ffcf9d" opacity="0.32"/>`,
    },
  },
  {
    key: "sol",
    art: {
      base: "#160b07",
      glows: [
        { x: 600, y: 330, r: 320, c: "#f0a34a", o: 0.68 },
        { x: 270, y: 830, rx: 400, ry: 330, c: "#7a2c12", o: 0.66 },
        { x: 640, y: 200, r: 90, c: "#ffe0a8", o: 0.5 },
      ],
      bands: [
        {
          d: "M-80 820C160 760 380 830 590 720s240-110 390-50v540H-80Z",
          c: "#1a0d08",
          o: 0.88,
          top: 680,
        },
      ],
      shapes:
        ring(600, 340, 190, "#ffd7a1", 0.22, 1.4) +
        ring(600, 340, 250, "#ffb066", 0.14, 1, "5 12") +
        `<path d="M90 930h720" stroke="#ffb066" stroke-opacity="0.18" stroke-width="1"/>`,
    },
  },
  {
    key: "mystic",
    art: {
      base: "#0a0714",
      glows: [
        { x: 300, y: 360, r: 380, c: "#5b2a8c", o: 0.6 },
        { x: 680, y: 760, rx: 400, ry: 320, c: "#0e4a54", o: 0.6 },
        { x: 520, y: 560, r: 110, c: "#c9a6ff", o: 0.26 },
      ],
      shapes:
        `<path d="M-80 700C170 610 300 780 500 660s260-210 500-110" fill="none" stroke="#8f6ac2" stroke-opacity="0.16" stroke-width="70" stroke-linecap="round"/>` +
        `<path d="M-80 860C210 760 380 920 600 790s230-160 380-90" fill="none" stroke="#2e7f86" stroke-opacity="0.13" stroke-width="54" stroke-linecap="round"/>` +
        ring(520, 540, 150, "#cbb0ff", 0.24, 1.1, "2 9"),
    },
  },
  {
    key: "vinyl",
    art: {
      base: "#0c0705",
      glows: [
        { x: 620, y: 380, r: 400, c: "#7a3d12", o: 0.55 },
        { x: 220, y: 880, rx: 400, ry: 330, c: "#3a1608", o: 0.7 },
      ],
      shapes:
        Array.from({ length: 14 }, (_, i) =>
          ring(620, 440, 70 + i * 18, "#e6cba8", 0.06 + (i % 3) * 0.016, 0.7),
        ).join("") +
        `<circle cx="620" cy="440" r="40" fill="#1b0f09"/><circle cx="620" cy="440" r="9" fill="#d8b48c" opacity="0.7"/>` +
        `<path d="M80 960c180-60 320 30 500-30s250-100 380-60" fill="none" stroke="#d8b48c" stroke-opacity="0.16" stroke-width="1.4"/>`,
    },
  },
  {
    key: "vale",
    art: {
      base: "#120610",
      glows: [
        { x: 370, y: 320, r: 360, c: "#8e1236", o: 0.6 },
        { x: 700, y: 850, rx: 400, ry: 320, c: "#3d0f2c", o: 0.68 },
      ],
      shapes:
        Array.from({ length: 22 }, (_, i) => {
          const x = 80 + ((i * 167) % 740);
          const y = 100 + ((i * 271) % 940);
          const r = 5 + (i % 5) * 4;
          return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.8}" fill="#e7909f" opacity="${0.1 + (i % 4) * 0.05}" transform="rotate(${i * 27} ${x} ${y})"/>`;
        }).join("") + ring(450, 520, 230, "#e8a7b4", 0.12, 1, "1 14"),
    },
  },
  {
    key: "art",
    art: {
      base: "#080812",
      glows: [
        { x: 260, y: 280, r: 360, c: "#2f3b8f", o: 0.6 },
        { x: 700, y: 800, rx: 400, ry: 320, c: "#6b1b63", o: 0.6 },
        { x: 560, y: 500, r: 130, c: "#9fb4ff", o: 0.22 },
      ],
      shapes:
        `<path d="M40 900C240 740 400 880 580 700s230-200 380-130" fill="none" stroke="#4656c8" stroke-opacity="0.22" stroke-width="90" stroke-linecap="round"/>` +
        `<path d="M20 1030C250 880 430 1020 630 850s200-160 330-110" fill="none" stroke="#a03a8f" stroke-opacity="0.18" stroke-width="60" stroke-linecap="round"/>` +
        `<path d="M170 230c120 90 210 40 300 130" fill="none" stroke="#dfe6ff" stroke-opacity="0.24" stroke-width="2.4"/>`,
    },
  },
  {
    key: "marea",
    art: {
      base: "#05090c",
      glows: [
        { x: 500, y: 220, r: 400, c: "#0d5560", o: 0.55 },
        { x: 220, y: 860, rx: 420, ry: 330, c: "#0b2f45", o: 0.75 },
      ],
      bands: [
        {
          d: "M-80 560C120 480 240 600 400 540s250-130 420-60 210 120 300 80v600H-80Z",
          c: "#071820",
          o: 0.9,
          top: 460,
        },
        {
          d: "M-80 720C140 630 300 750 460 680s240-110 400-40 190 100 260 70v420H-80Z",
          c: "#04121a",
          o: 0.92,
          top: 620,
        },
        {
          d: "M-80 900C160 810 340 930 520 850s220-80 380-30 180 80 240 60v260H-80Z",
          c: "#020c12",
          o: 0.94,
          top: 800,
        },
      ],
      shapes: `<path d="M600 150c44-30 100-30 144 0" stroke="#a8e6ee" stroke-opacity="0.34" stroke-width="1.8" fill="none"/>`,
    },
  },
  {
    key: "jade",
    art: {
      base: "#050d0a",
      glows: [
        { x: 660, y: 260, r: 360, c: "#0f5a3c", o: 0.6 },
        { x: 240, y: 880, rx: 400, ry: 330, c: "#0a3a34", o: 0.66 },
        { x: 620, y: 640, r: 120, c: "#b99a5f", o: 0.16 },
      ],
      shapes:
        `<path d="M180 1060C230 800 400 700 500 500s170-300 300-370" fill="none" stroke="#1d6b4a" stroke-opacity="0.2" stroke-width="84" stroke-linecap="round"/>` +
        `<path d="M700 1080C640 840 500 720 430 540s-110-270-230-330" fill="none" stroke="#12503f" stroke-opacity="0.18" stroke-width="60" stroke-linecap="round"/>` +
        ring(460, 560, 210, "#c9b184", 0.2, 1, "2 11"),
    },
  },
  {
    key: "ai",
    art: {
      base: "#08060f",
      glows: [
        { x: 450, y: 440, r: 400, c: "#5a2bb5", o: 0.6 },
        { x: 220, y: 880, rx: 380, ry: 300, c: "#0e5a76", o: 0.55 },
      ],
      shapes:
        `<g stroke="#b79cff" stroke-opacity="0.1" stroke-width="1">` +
        Array.from({ length: 12 }, (_, i) => `<path d="M0 ${90 + i * 90}H${W}"/>`).join("") +
        Array.from({ length: 10 }, (_, i) => `<path d="M${90 + i * 90} 0V${H}"/>`).join("") +
        `</g>` +
        `<circle cx="460" cy="460" r="170" fill="none" stroke="#c3a9ff" stroke-opacity="0.5" stroke-width="2"/>` +
        `<circle cx="460" cy="460" r="110" fill="none" stroke="#8fe6ff" stroke-opacity="0.34" stroke-width="1.4"/>` +
        `<circle cx="460" cy="460" r="44" fill="#d9ccff" opacity="0.5"/>` +
        `<path d="M460 210v-60M460 770v-60M210 460h-60M770 460h-60" stroke="#c3a9ff" stroke-opacity="0.36" stroke-width="2"/>`,
    },
  },
  {
    key: "obsidian",
    art: {
      base: "#050505",
      glows: [
        { x: 560, y: 300, r: 400, c: "#2a2a30", o: 0.95 },
        { x: 340, y: 860, rx: 400, ry: 320, c: "#4a0d18", o: 0.36 },
        { x: 640, y: 520, r: 100, c: "#e9e6e2", o: 0.2 },
      ],
      bands: [
        {
          d: "M-80 620C160 550 320 690 500 580s240-190 500-100v580H-80Z",
          c: "#0c0c0e",
          o: 0.9,
          top: 520,
        },
        {
          d: "M-80 790C180 700 360 840 560 720s250-130 400-80v480H-80Z",
          c: "#070708",
          o: 0.93,
          top: 690,
        },
      ],
      shapes: `<path d="M310 190c100 160 170 250 170 350" fill="none" stroke="#f4f1ee" stroke-opacity="0.3" stroke-width="2.4"/>`,
    },
  },
  {
    key: "cherry",
    art: {
      base: "#0d0305",
      glows: [
        { x: 560, y: 400, r: 360, c: "#a40e2a", o: 0.66 },
        { x: 240, y: 880, rx: 400, ry: 330, c: "#4e0414", o: 0.75 },
      ],
      shapes:
        Array.from({ length: 11 }, (_, i) => {
          const x = 140 + ((i * 197) % 640);
          const y = 180 + ((i * 311) % 800);
          const r = 12 + (i % 4) * 10;
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#e02345" opacity="${0.14 + (i % 3) * 0.07}"/>`;
        }).join("") +
        `<path d="M452 546c34-60 110-70 158-14-32 56-104 66-158 14Z" fill="#ff2e55" opacity="0.3"/>` +
        `<path d="M520 512c0-70 30-118 84-150" stroke="#5e9a5a" stroke-opacity="0.45" stroke-width="5" fill="none"/>`,
    },
  },
  {
    key: "amber",
    art: {
      base: "#0d0803",
      glows: [
        { x: 450, y: 480, r: 410, c: "#b56a12", o: 0.6 },
        { x: 220, y: 200, r: 300, c: "#5e2c08", o: 0.55 },
      ],
      shapes:
        ring(450, 480, 200, "#f4c67a", 0.28, 1.3) +
        ring(450, 480, 260, "#f4c67a", 0.12, 1, "3 16") +
        `<circle cx="450" cy="480" r="110" fill="#ffcf87" opacity="0.18"/>` +
        `<path d="M290 880h320" stroke="#e0a95f" stroke-opacity="0.24" stroke-width="1"/>`,
    },
  },
  {
    key: "rose",
    art: {
      base: "#100609",
      glows: [
        { x: 620, y: 280, r: 360, c: "#a34a63", o: 0.55 },
        { x: 250, y: 840, rx: 400, ry: 320, c: "#4d1a2c", o: 0.66 },
        { x: 500, y: 560, r: 150, c: "#ffd9e0", o: 0.16 },
      ],
      bands: [
        {
          d: "M-80 680C160 600 330 740 520 620s260-170 500-80v600H-80Z",
          c: "#1c0b12",
          o: 0.88,
          top: 580,
        },
        {
          d: "M-80 870C180 770 380 900 600 780s230-110 380-60v420H-80Z",
          c: "#12070c",
          o: 0.92,
          top: 770,
        },
      ],
      shapes: `<path d="M240 300c130-44 230 14 300-56" fill="none" stroke="#ffe4e8" stroke-opacity="0.2" stroke-width="1.8"/>`,
    },
  },
  {
    key: "atrio",
    art: {
      base: "#060406",
      glows: [
        { x: 450, y: 660, r: 400, c: "#8d0f24", o: 0.55 },
        { x: 450, y: 340, r: 240, c: "#2a0a12", o: 0.75 },
      ],
      shapes:
        `<g fill="none" stroke="#c8a98f" stroke-opacity="0.28" stroke-width="2">` +
        `<path d="M240 1080V540a210 210 0 0 1 420 0v540"/>` +
        `<path d="M286 1080V552a164 164 0 0 1 328 0v528"/>` +
        `</g>` +
        `<rect x="364" y="640" width="172" height="440" fill="#12070a" opacity="0.94"/>` +
        `<rect x="364" y="640" width="172" height="440" fill="none" stroke="#d9b48d" stroke-opacity="0.36" stroke-width="2"/>` +
        `<path d="M450 640v440" stroke="#d9b48d" stroke-opacity="0.18" stroke-width="1"/>` +
        `<circle cx="450" cy="532" r="14" fill="#ffb27a" opacity="0.55"/>`,
    },
  },
  {
    key: "boveda",
    art: {
      base: "#070505",
      glows: [
        { x: 450, y: 520, r: 400, c: "#7d1b12", o: 0.5 },
        { x: 450, y: 520, r: 190, c: "#c9a05f", o: 0.3 },
      ],
      shapes:
        Array.from({ length: 6 }, (_, i) =>
          ring(450, 520, 110 + i * 46, "#d9b07a", 0.18 - i * 0.018, 1.3),
        ).join("") +
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = 450 + Math.cos(a) * 250;
          const y = 520 + Math.sin(a) * 250;
          return `<rect x="${x - 20}" y="${y - 20}" width="40" height="40" fill="#0d0a09" stroke="#d9b07a" stroke-opacity="0.3" stroke-width="1.1"/>`;
        }).join("") +
        `<circle cx="450" cy="520" r="42" fill="#150a08" stroke="#e8c08a" stroke-opacity="0.55" stroke-width="2"/>` +
        `<path d="M450 504v32M434 520h32" stroke="#e8c08a" stroke-opacity="0.65" stroke-width="2.5"/>`,
    },
  },
];

/** Grano de pelÃ­cula: ruido RGBA de baja opacidad sobre toda la pieza. */
const grain = Buffer.alloc(W * H * 4);
let seed = 1234567;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
for (let i = 0; i < W * H; i++) {
  const v = 90 + Math.round(rnd() * 110);
  grain[i * 4] = v;
  grain[i * 4 + 1] = v;
  grain[i * 4 + 2] = v;
  grain[i * 4 + 3] = 14;
}

for (const piece of pieces) {
  const file = `${OUT}/${piece.key}.webp`;
  const base = await sharp(Buffer.from(svg(piece.art)))
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: grain, raw: { width: W, height: H, channels: 4 }, blend: "over" }])
    .webp({ quality: 80, effort: 4 })
    .toFile(file);
  console.log(`${piece.key.padEnd(10)} ${(statSync(file).size / 1024).toFixed(1)} KB`);
}
console.log("done");
