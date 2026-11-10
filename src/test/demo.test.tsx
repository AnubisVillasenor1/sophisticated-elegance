import { act, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";

import { AppProvider, useApp } from "@/lib/store";
import { createSeedState } from "@/lib/seed";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
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

type App = ReturnType<typeof useApp>;

function Probe({ onReady }: { onReady: (app: App) => void }) {
  const app = useApp();
  const ref = useRef(app);
  ref.current = app;
  if (app.hydrated) onReady(ref.current);
  return <div data-testid="ready">{app.hydrated ? "ready" : "wait"}</div>;
}

function renderApp() {
  let app: App | null = null;
  render(
    <AppProvider>
      <Probe
        onReady={(next) => {
          app = next;
        }}
      />
    </AppProvider>,
  );
  return { get: () => app };
}

describe("seed", () => {
  it("builds ten creators with three tiers each", () => {
    const state = createSeedState();
    expect(state.creators).toHaveLength(10);
    for (const creator of state.creators) {
      expect(creator.tiers).toHaveLength(3);
      expect(creator.posts.length).toBeGreaterThan(0);
    }
    expect(state.users.flatMap((u) => u.legalAcceptances).length).toBeGreaterThan(0);
  });
});

describe("demo flows", () => {
  it("logs in as fan, subscribes, unlocks, tips and requests ARCO", async () => {
    localStorage.clear();
    const { get } = renderApp();
    await waitFor(() => expect(screen.getByTestId("ready").textContent).toBe("ready"));
    const app = get();
    expect(app).not.toBeNull();

    act(() => {
      const result = app!.login("fan@xclusive.demo", "demo1234");
      expect(result.ok).toBe(true);
    });
    await waitFor(() => expect(get()!.user?.email).toBe("fan@xclusive.demo"));

    act(() => {
      expect(get()!.subscribe("valentina", "valentina-t1", false).ok).toBe(true);
      expect(get()!.unlock("clip", "valentina", "valentina-c2", "Clip demo", 120).ok).toBe(true);
      expect(get()!.tip("valentina", 50, "Demo").ok).toBe(true);
      expect(get()!.submitDataRequest("acceso", "Quiero ver mis datos").ok).toBe(true);
    });

    await waitFor(() => {
      expect(
        get()!.state.subscriptions.some(
          (s) => s.creatorId === "valentina" && s.fanId === "u-fan-demo",
        ),
      ).toBe(true);
      expect(get()!.state.purchases.some((p) => p.fanId === "u-fan-demo")).toBe(true);
      expect(get()!.state.dataRequests.some((r) => r.userId === "u-fan-demo")).toBe(true);
    });

    act(() => get()!.logout());
  });

  it("logs in as creator and creates content, posts a room and accepts legal", async () => {
    localStorage.clear();
    const { get } = renderApp();
    await waitFor(() => expect(screen.getByTestId("ready").textContent).toBe("ready"));

    act(() => {
      expect(get()!.login("valentina@xclusive.demo", "demo1234").ok).toBe(true);
    });
    await waitFor(() => expect(get()!.user?.role).toBe("creator"));

    const before = get()!.state.creators.find((c) => c.id === "valentina")!.posts.length;
    act(() => {
      expect(
        get()!.createPost("valentina", {
          title: "Prueba",
          body: "Cuerpo editorial",
          visibility: "members",
          tierId: null,
          priceMXN: 0,
          cover: "cherry",
          tags: ["demo"],
          mature: false,
        }).ok,
      ).toBe(true);
      expect(
        get()!.createRoom("valentina", {
          title: "Sala de prueba",
          description: "Demo",
          access: "members",
          ticketPriceMXN: 0,
          startsAt: new Date().toISOString(),
          durationMin: 60,
          capacity: 20,
        }).ok,
      ).toBe(true);
      expect(get()!.acceptLegal(["terminos"]).ok).toBeDefined();
    });

    await waitFor(() => {
      expect(get()!.state.creators.find((c) => c.id === "valentina")!.posts.length).toBe(
        before + 1,
      );
      expect(get()!.state.creators.find((c) => c.id === "valentina")!.rooms.length).toBeGreaterThan(
        0,
      );
    });
  });

  it("lets the admin approve and moderate", async () => {
    localStorage.clear();
    const { get } = renderApp();
    await waitFor(() => expect(screen.getByTestId("ready").textContent).toBe("ready"));

    act(() => {
      expect(get()!.login("admin@xclusive.demo", "demo1234").ok).toBe(true);
    });
    await waitFor(() => expect(get()!.user?.role).toBe("admin"));

    const pending = get()!.state.applications.find((a) => a.status === "pending");
    if (pending) {
      act(() => {
        expect(get()!.approveApplication(pending.id).ok).toBe(true);
      });
      await waitFor(() =>
        expect(get()!.state.applications.find((a) => a.id === pending.id)?.status).toBe("approved"),
      );
    }

    const report = get()!.state.reports.find((r) => r.status !== "resolved");
    if (report) {
      act(() => {
        expect(get()!.resolveReport(report.id, "Resuelto en prueba").ok).toBe(true);
      });
      await waitFor(() =>
        expect(get()!.state.reports.find((r) => r.id === report.id)?.status).toBe("resolved"),
      );
    }
  });
});
