import { createFileRoute, redirect } from "@tanstack/react-router";

// Ruta heredada de la integración con Supabase Auth. El prototipo actual usa
// el acceso DEMO de Xclusive (/entrar). Se conserva el enlace para no romper
// marcadores ni enlaces antiguos.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/entrar" });
  },
});
