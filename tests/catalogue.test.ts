import { afterEach, describe, expect, it, vi } from "vitest";
import { getLegacyCatalogue, legacyProductSlug } from "../lib/legacy-catalogue";
import { getProducts } from "../lib/catalogue";
import { slugify } from "../lib/utils";

describe("legacy catalogue migration", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("retains the supplied eighty-part catalogue with unique public slugs", () => {
    const catalogue = getLegacyCatalogue();
    expect(catalogue.products).toHaveLength(80);
    const slugs = catalogue.products.map(legacyProductSlug);
    expect(new Set(slugs).size).toBe(80);
  });

  it("creates safe URL slugs", () => {
    expect(slugify("Fuel Injection Pump / 12V")).toBe("fuel-injection-pump-12v");
  });

  it("finds products through the public fallback search and category filter", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const avr = await getProducts({ query: "automatic voltage regulator" });
    const fuel = await getProducts({ category: "fuel-system" });
    expect(avr.items.some((product) => product.name === "AVR")).toBe(true);
    expect(fuel.total).toBe(10);
  });
});
