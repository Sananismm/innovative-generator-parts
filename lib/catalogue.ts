import { Prisma, ProductStatus } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";
import { getLegacyCatalogue, legacyProductSlug } from "@/lib/legacy-catalogue";
import type { CatalogueCategory, CatalogueFilters, CatalogueProduct } from "@/lib/types";
import { slugify } from "@/lib/utils";

const categoryDescriptions: Record<string, string> = {
  "Engine Parts": "Core engine components that support combustion, timing and mechanical power transfer.",
  "Fuel System": "Components that store, filter, meter and deliver diesel to the engine.",
  "Cooling System": "Components that circulate coolant and manage operating temperature.",
  "Lubrication System": "Components that circulate, filter and monitor engine lubrication.",
  "Air & Exhaust": "Intake and exhaust components that manage airflow, boost and exhaust routing.",
  "Electrical / Alternator": "Alternator components that generate, regulate and distribute electrical output.",
  "Control & Protection": "Control, monitoring and protection equipment for safe generator operation.",
  "Consumables & Replacement Parts": "Routine-service components used to maintain dependable generator operation.",
};

function toProduct(product: {
  id: string; name: string; slug: string; shortDescription: string | null; description: string | null;
  workingPrinciple: string; dailyUse: string; manufacturer: string | null; partNumber: string | null;
  oemReference: string | null; compatibleBrands: string[]; compatibleModels: string[]; engineFamily: string | null;
  attributes: Prisma.JsonValue | null; image: string | null; imageAlt: string | null; featured: boolean; popular: boolean;
  status: ProductStatus; seoTitle: string | null; seoDescription: string | null; createdAt: Date; updatedAt: Date;
  category: { name: string; slug: string };
}): CatalogueProduct {
  return { ...product, status: product.status, attributes: product.attributes && typeof product.attributes === "object" && !Array.isArray(product.attributes) ? product.attributes as Record<string, string> : null };
}

function legacyProducts(filters: CatalogueFilters = {}): CatalogueProduct[] {
  const query = filters.query?.trim().toLowerCase();
  const category = filters.category;
  const list = getLegacyCatalogue().products
    .filter((product) => !category || slugify(product.category) === category)
    .filter((product) => !query || `${product.name} ${product.category} ${product.workingPrinciple} ${product.dailyUse} ${product.name === "AVR" ? "Automatic Voltage Regulator" : ""}`.toLowerCase().includes(query))
    .map((product, index) => ({
      id: product.id,
      name: product.name,
      slug: legacyProductSlug(product),
      category: { name: product.category, slug: slugify(product.category) },
      shortDescription: product.dailyUse,
      description: null,
      workingPrinciple: product.workingPrinciple,
      dailyUse: product.dailyUse,
      manufacturer: null, partNumber: null, oemReference: null, compatibleBrands: [], compatibleModels: [], engineFamily: null,
      attributes: null, image: `/${product.image}`, imageAlt: `${product.name} generator part`, featured: product.featured, popular: product.featured,
      status: "PUBLISHED" as ProductStatus, seoTitle: null, seoDescription: null,
      createdAt: new Date(2026, 0, index + 1), updatedAt: new Date(2026, 0, index + 1),
    }));
  const sort = filters.sort ?? "featured";
  return list.sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "latest" ? b.createdAt.getTime() - a.createdAt.getTime() : Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
}

export const getCategories = cache(async (): Promise<CatalogueCategory[]> => {
  if (process.env.DATABASE_URL) {
    try {
      const categories = await db.category.findMany({
        where: { status: ProductStatus.PUBLISHED }, orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: { where: { status: ProductStatus.PUBLISHED } } } } },
      });
      return categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug, description: category.description, image: category.image, imageAlt: category.imageAlt, sortOrder: category.sortOrder, productCount: category._count.products, seoTitle: category.seoTitle, seoDescription: category.seoDescription }));
    } catch { /* A missing database must not make the initial catalogue unavailable. */ }
  }
  const source = getLegacyCatalogue();
  return source.categories.map((name, index) => ({ id: `legacy-category-${index + 1}`, name, slug: slugify(name), description: categoryDescriptions[name] ?? null, image: null, imageAlt: null, sortOrder: index, productCount: source.products.filter((product) => product.category === name).length, seoTitle: null, seoDescription: null }));
});

export async function getProducts(filters: CatalogueFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 24));
  if (process.env.DATABASE_URL) {
    try {
      const search = filters.query?.trim();
      const where: Prisma.ProductWhereInput = {
        status: ProductStatus.PUBLISHED,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.manufacturer ? { manufacturer: { equals: filters.manufacturer, mode: "insensitive" } } : {}),
        ...(filters.tag ? { tags: { some: { tag: { slug: filters.tag } } } } : {}),
        ...(search ? { OR: ["name", "shortDescription", "description", "workingPrinciple", "dailyUse", "manufacturer", "partNumber", "oemReference"].map((field) => ({ [field]: { contains: search, mode: "insensitive" } })) } : {}),
      };
      const orderBy: Prisma.ProductOrderByWithRelationInput[] = filters.sort === "name" ? [{ name: "asc" }] : filters.sort === "latest" ? [{ createdAt: "desc" }] : [{ featured: "desc" }, { name: "asc" }];
      const [items, total] = await Promise.all([db.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, include: { category: true } }), db.product.count({ where })]);
      return { items: items.map(toProduct), total, page, pageSize, database: true };
    } catch { /* See legacy fallback above. */ }
  }
  const all = legacyProducts(filters);
  return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize, database: false };
}

export const getProductBySlug = cache(async (slug: string): Promise<CatalogueProduct | null> => {
  if (process.env.DATABASE_URL) {
    try {
      const product = await db.product.findFirst({ where: { slug, status: ProductStatus.PUBLISHED }, include: { category: true } });
      if (product) return toProduct(product);
      const redirect = await db.productRedirect.findUnique({ where: { oldSlug: slug }, include: { product: { include: { category: true } } } });
      if (redirect?.product.status === ProductStatus.PUBLISHED) return toProduct(redirect.product);
    } catch { /* Fallback makes a configured but not-yet-migrated local setup usable. */ }
  }
  return legacyProducts().find((product) => product.slug === slug) ?? null;
});

export async function getRelatedProducts(product: CatalogueProduct, take = 4) {
  const results = await getProducts({ category: product.category.slug, pageSize: take + 1 });
  return results.items.filter((candidate) => candidate.id !== product.id).slice(0, take);
}
