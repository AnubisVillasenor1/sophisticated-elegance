import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta — Xclusive" },
      { name: "description", content: "Gestiona tu membresía en Xclusive." },
      { property: "og:title", content: "Mi cuenta — Xclusive" },
      { property: "og:description", content: "Tu espacio privado en Xclusive." },
    ],
  }),
  component: Cuenta,
});

function Cuenta() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 pt-36 pb-24">
      <p className="eyebrow">Tu espacio privado</p>
      <h1 className="mt-4 text-6xl">Mi <em className="text-silver-gradient">cuenta.</em></h1>
    </main>
  );
}
