import aurora from "@/assets/creator-aurora.jpg";
import isabella from "@/assets/creator-isabella.jpg";
import selene from "@/assets/creator-selene.jpg";
import valentina from "@/assets/creator-valentina.jpg";

/**
 * Retratos editoriales de las creadoras.
 *
 * Se importan una sola vez y se reutilizan en la semilla, en las tarjetas y en
 * el perfil público. Los archivos viven en `src/assets` para que Vite los
 * optimice y les asigne hash de contenido.
 */
export const CREATOR_PORTRAITS = {
  valentina,
  selene,
  aurora,
  isabella,
} as const;

export type CreatorPortraitKey = keyof typeof CREATOR_PORTRAITS;
