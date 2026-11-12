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
  },
  dungeon: {
    src: roomDungeon,
    alt: "Sala privada en penumbra con luz roja y mobiliario de cuero.",
  },
  curtain: {
    src: roomCurtain,
    alt: "Salón circular cubierto por velos rojos y luz de velas.",
  },
  lounge: {
    src: roomLounge,
    alt: "Lounge de terciopelo rojo con lámparas de araña y barra al fondo.",
  },
} as const;
