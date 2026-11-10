import valentina from "@/assets/creator-valentina.jpg";
import selene from "@/assets/creator-selene.jpg";
import aurora from "@/assets/creator-aurora.jpg";
import isabella from "@/assets/creator-isabella.jpg";

export type TierName = "Insider" | "VIP Club" | "Xtrime Inner Circle";
export const TIER_NAMES: TierName[] = ["Insider", "VIP Club", "Xtrime Inner Circle"];

export type Room = {
  name: string;
  live: boolean;
  viewers?: number;
  time?: string;
  tier: TierName;
  theme: string;
};
export type Creator = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  tags: string[];
  tiers: { name: TierName; price: number; perks: string[] }[];
  rooms: Room[];
};

const tiers = (base: number) => [
  {
    name: "Insider" as const,
    price: base,
    perks: ["Feed privado", "Mensajes directos", "Galerías protegidas"],
  },
  {
    name: "VIP Club" as const,
    price: base * 3,
    perks: ["Todo lo de Insider", "Bóveda completa", "Salones en vivo"],
  },
  {
    name: "Xtrime Inner Circle" as const,
    price: base * 10,
    perks: ["Todo lo de VIP Club", "Eventos privados", "Sesiones uno a uno"],
  },
];

export const creators: Creator[] = [
  {
    slug: "valentina",
    name: "Valentina R.",
    title: "Musa de la luz carmesí",
    bio: "Fotógrafa y performer. Convierte cada transmisión en una pieza de cine nocturno: luz roja, silencio y miradas que cuentan historias.",
    image: valentina,
    tags: ["fotografía artística", "cine", "noche", "estética oscura"],
    tiers: tiers(9),
    rooms: [
      {
        name: "Salón Carmesí",
        live: true,
        viewers: 128,
        tier: "VIP Club",
        theme: "Sesión de fotografía en vivo bajo luz roja",
      },
    ],
  },
  {
    slug: "selene",
    name: "Selene M.",
    title: "Elegancia en obsidiana",
    bio: "Estilista y coleccionista de joyería. Comparte rituales de belleza, moda de autor y conversaciones íntimas sobre lujo silencioso.",
    image: selene,
    tags: ["moda", "joyería", "lujo", "belleza"],
    tiers: tiers(12),
    rooms: [
      {
        name: "Noche de Obsidiana",
        live: true,
        viewers: 64,
        tier: "Xtrime Inner Circle",
        theme: "Charla privada de moda y estilo",
      },
    ],
  },
  {
    slug: "aurora",
    name: "Aurora L.",
    title: "Guardiana del jardín prohibido",
    bio: "Artista visual y poeta. Mezcla flores, palabras y música ambiental en encuentros que se sienten como un sueño compartido.",
    image: aurora,
    tags: ["poesía", "arte", "música", "naturaleza"],
    tiers: tiers(8),
    rooms: [
      {
        name: "Jardín Prohibido",
        live: false,
        time: "Hoy · 22:00",
        tier: "VIP Club",
        theme: "Lectura de poesía con música en vivo",
      },
    ],
  },
  {
    slug: "isabella",
    name: "Isabella D.",
    title: "Sommelier de medianoche",
    bio: "Sommelier y anfitriona. Catas guiadas, maridajes y la conversación más elegante de la red, siempre a la luz de las velas.",
    image: isabella,
    tags: ["vino", "gastronomía", "conversación", "velas"],
    tiers: tiers(15),
    rooms: [
      {
        name: "La Gota de Plata",
        live: false,
        time: "Viernes · 23:00",
        tier: "Xtrime Inner Circle",
        theme: "Cata privada de vinos",
      },
    ],
  },
];

export const allRooms = creators.flatMap((c) =>
  c.rooms.map((r) => ({ ...r, host: c.name, slug: c.slug })),
);
export const getCreator = (slug: string) => creators.find((c) => c.slug === slug);

export const INTEREST_OPTIONS = [
  "fotografía artística",
  "cine",
  "moda",
  "joyería",
  "lujo",
  "belleza",
  "poesía",
  "arte",
  "música",
  "vino",
  "gastronomía",
  "conversación",
];
