import aurora from "@/assets/creator-aurora.jpg";
import isabella from "@/assets/creator-isabella.jpg";
import selene from "@/assets/creator-selene.jpg";
import valentina from "@/assets/creator-valentina.jpg";
import modelo1 from "@/assets/modelo1.jpg";
import modelo2 from "@/assets/modelo2.jpg";
import modelo3 from "@/assets/modelo3.jpg";
import modelo4 from "@/assets/modelo4.jpg";
import jade from "@/assets/descarga.jpg";
import luna from "@/assets/videoframe_2014.png";

/**
 * Retratos editoriales de las creadoras.
 *
 * Se importan una sola vez y se reutilizan en la semilla, en las tarjetas y en
 * el perfil público. Los archivos viven en `src/assets` para que Vite los
 * optimice y les asigne hash de contenido.
 *
 * `modelo5.jpg` no aparece aquí a propósito: lleva la marca de agua de una
 * autora externa y no puede publicarse sin licencia. Está documentado en
 * `docs/AUDITORIA-REMEDIACION.md`.
 */
export const CREATOR_PORTRAITS = {
  valentina,
  selene,
  aurora,
  isabella,
  camila: modelo1,
  nina: modelo2,
  renata: modelo3,
  danna: modelo4,
  jade,
  luna,
} as const;

export type CreatorPortraitKey = keyof typeof CREATOR_PORTRAITS;
