import { describe, expect, it } from "vitest";
import { creators, TIER_NAMES } from "./creators";

describe("niveles de membresía", () => {
  it("cada creadora ofrece exactamente los 3 niveles Insider, VIP Club y Xtrime Inner Circle", () => {
    for (const c of creators) expect(c.tiers.map((t) => t.name)).toEqual(TIER_NAMES);
  });
});
