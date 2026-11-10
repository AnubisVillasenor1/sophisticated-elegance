import { createFileRoute, redirect } from "@tanstack/react-router";

// La página de membresías se sustituyó por el catálogo completo de creadoras
// (/explorar) y las páginas de cada creadora (/creadora/$slug).
export const Route = createFileRoute("/membresias")({
  beforeLoad: () => {
    throw redirect({ to: "/explorar" });
  },
});
