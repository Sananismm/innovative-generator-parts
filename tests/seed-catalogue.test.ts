import { describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { importInitialCatalogue } from "../prisma/seed-catalogue";

describe("initial catalogue import", () => {
  it.each([[1, 0], [0, 1], [8, 80]])("preserves an existing catalogue (%i categories, %i products)", async (categories, products) => {
    const tx = { $executeRaw: vi.fn(), category: { count: vi.fn().mockResolvedValue(categories), create: vi.fn() }, product: { count: vi.fn().mockResolvedValue(products), create: vi.fn() } };
    expect(await importInitialCatalogue(tx as unknown as Prisma.TransactionClient)).toBe(false);
    expect(tx.category.create).not.toHaveBeenCalled();
    expect(tx.product.create).not.toHaveBeenCalled();
  });
  it("imports all categories and products into an empty database", async () => {
    const tx = { $executeRaw: vi.fn(), category: { count: vi.fn().mockResolvedValue(0), create: vi.fn().mockImplementation(({ data }) => ({ id: data.slug })) }, product: { count: vi.fn().mockResolvedValue(0), create: vi.fn() } };
    expect(await importInitialCatalogue(tx as unknown as Prisma.TransactionClient)).toBe(true);
    expect(tx.category.create).toHaveBeenCalledTimes(8);
    expect(tx.product.create).toHaveBeenCalledTimes(80);
  });
});
