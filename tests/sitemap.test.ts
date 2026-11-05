import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ categories: vi.fn(), products: vi.fn() }));
vi.mock("@/lib/catalogue", () => ({ getCategories: mocks.categories, getProducts: mocks.products }));
import sitemap from "../app/sitemap";

describe("sitemap", () => {
  it("includes every page of a catalogue larger than 96 products", async () => {
    mocks.categories.mockResolvedValue([]);
    mocks.products.mockImplementation(async ({ page }: { page: number }) => ({ total: 97, pageSize: 48, items: [{ slug: `part-${page}`, updatedAt: new Date(0) }] }));
    const entries = await sitemap();
    expect(mocks.products).toHaveBeenCalledTimes(3);
    expect(entries.some(entry => entry.url.endsWith("/products/part-3"))).toBe(true);
  });
});
