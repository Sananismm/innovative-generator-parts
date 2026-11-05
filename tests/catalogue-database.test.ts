import { afterEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { product: queries } }));
import { getProducts } from "../lib/catalogue";

describe("database catalogue search", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
  it("includes AVR when searching for its full name", async () => {
    vi.stubEnv("DATABASE_URL", "configured-for-test");
    queries.findMany.mockResolvedValue([]); queries.count.mockResolvedValue(0);
    await getProducts({ query: "automatic voltage regulator" });
    const where = queries.findMany.mock.calls[0][0].where;
    expect(where.OR).toContainEqual({ name: { equals: "AVR", mode: "insensitive" } });
    expect(queries.count.mock.calls[0][0].where).toEqual(where);
  });
  it("does not silently fall back when production database queries fail", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "configured-for-test");
    queries.findMany.mockRejectedValueOnce(new Error("offline")); queries.count.mockResolvedValue(0);
    await expect(getProducts()).rejects.toThrow("Catalogue database is unavailable");
  });
});
