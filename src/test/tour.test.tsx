import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: "/" } }),
}));

import { PlatformTourProvider, TourTrigger } from "@/components/site/PlatformTour";
import { AppProvider } from "@/lib/store";

const memory = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: (index: number) => Array.from(memory.keys())[index] ?? null,
    get length() {
      return memory.size;
    },
  },
});

function renderTour() {
  return render(
    <AppProvider>
      <PlatformTourProvider>
        <TourTrigger />
      </PlatformTourProvider>
    </AppProvider>,
  );
}

describe("tutorial interactivo", () => {
  beforeEach(() => {
    memory.clear();
    navigate.mockClear();
  });

  it("abre el recorrido, avanza y se puede saltar", async () => {
    renderTour();

    const trigger = await screen.findByRole("button", {
      name: /abrir la guía interactiva/i,
    });
    fireEvent.click(trigger);

    expect(await screen.findByText("Bienvenida al club")).toBeInTheDocument();
    expect(screen.getByText(/La entrada · 01/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(await screen.findByText("Creadoras con nombre propio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /saltar/i }));
    expect(screen.queryByText("Creadoras con nombre propio")).not.toBeInTheDocument();
  });

  it("cierra con Escape y recuerda la decisión", async () => {
    renderTour();
    fireEvent.click(await screen.findByRole("button", { name: /abrir la guía interactiva/i }));
    expect(await screen.findByText("Bienvenida al club")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("Bienvenida al club")).not.toBeInTheDocument();
  });
});
