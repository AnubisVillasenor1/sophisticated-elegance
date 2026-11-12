import bannerAdmin from "@/assets/Gemini_Generated_Image_7e07zq7e07zq7e07.jpg";
import bannerCommunity from "@/assets/Gemini_Generated_Image_4ew3fa4ew3fa4ew3.jpg";
import bannerSections from "@/assets/Gemini_Generated_Image_3akt4e3akt4e3akt.jpg";
import roomAtrium from "@/assets/rooms1.avif";
import roomDungeon from "@/assets/rooms2.jpg";
import roomCurtain from "@/assets/rooms3.avif";
import roomLounge from "@/assets/rooms4.jpg";

/**
 * Arte editorial de la plataforma.
 *
 * Los archivos viven en `src/assets` para que Vite los optimice y les asigne un
 * hash de contenido. Nada se carga desde almacenamiento externo: si el archivo
 * no está en el bundle, no se muestra.
 */

export const BRAND_BANNERS = {
  sections: {
    src: bannerSections,
    alt: "Banner de Xclusive: perfiles, eventos, galerías y subpáginas.",
  },
  community: {
    src: bannerCommunity,
    alt: "Banner de Xclusive: comunidad, contenido, monetización y pagos.",
  },
  admin: {
    src: bannerAdmin,
    alt: "Banner de Xclusive: administración, legal y soporte técnico.",
  },
} as const;

export const ROOM_PHOTOS = {
  atrium: {
    src: roomAtrium,
    alt: "Salón privado con cortinas rojas, candelabros y sofás de terciopelo.",
    video: "/media/video/salon-atrium.mp4",
    poster: "/media/video/posters/salon-atrium.jpg",
  },
  dungeon: {
    src: roomDungeon,
    alt: "Sala privada en penumbra con luz roja y mobiliario de cuero.",
    video: "/media/video/salon-dungeon.mp4",
    poster: "/media/video/posters/salon-dungeon.jpg",
  },
  curtain: {
    src: roomCurtain,
    alt: "Salón circular cubierto por velos rojos y luz de velas.",
    video: "/media/video/salon-curtain.mp4",
    poster: "/media/video/posters/salon-curtain.jpg",
  },
  lounge: {
    src: roomLounge,
    alt: "Lounge de terciopelo rojo con lámparas de araña y barra al fondo.",
    video: "/media/video/salon-lounge.mp4",
    poster: "/media/video/posters/salon-lounge.jpg",
  },
} as const;

export type VideoAsset = {
  src: string;
  poster: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

/**
 * Video editorial del hero.
 *
 * Se sirve desde `public/media/video` (no del bundle) para que el navegador
 * pueda pedir rangos y cachear sin descargar el archivo entero. Es un clip
 * corto y silencioso: el peso real es de menos de 100 KB.
 */
export const HERO_VIDEO: VideoAsset = {
  src: "/media/video/hero-loop.mp4",
  poster: "/media/video/posters/hero-loop.jpg",
  alt: "Retrato editorial en movimiento, luz natural sobre pared de hormigón.",
  orientation: "portrait",
};

/** Piezas en movimiento para la sala de proyección y la portada. */
export const SHOWCASE_VIDEOS: VideoAsset[] = [
  {
    src: "/media/video/clip-vertical.mp4",
    poster: "/media/video/posters/clip-vertical.jpg",
    alt: "Pieza editorial vertical en penumbra.",
    orientation: "portrait",
  },
  {
    src: "/media/video/clip-nocturno.mp4",
    poster: "/media/video/posters/clip-nocturno.jpg",
    alt: "Pieza editorial horizontal con luz cálida.",
    orientation: "landscape",
  },
  {
    src: "/media/video/salon-dungeon.mp4",
    poster: "/media/video/posters/salon-dungeon.jpg",
    alt: "Salón privado en movimiento con luz roja.",
    orientation: "portrait",
  },
];

/** Video del salón según la foto asignada. Si no hay, se usa la foto fija. */
export function roomVideo(image: string | undefined): { video: string; poster: string } | null {
  if (!image) return null;
  for (const room of Object.values(ROOM_PHOTOS)) {
    if (room.src === image) return { video: room.video, poster: room.poster };
  }
  return null;
}
