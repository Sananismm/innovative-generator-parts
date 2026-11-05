import { Prisma, ProductStatus } from "@prisma/client";
import { getLegacyCatalogue, legacyProductSlug } from "../lib/legacy-catalogue";
import { slugify } from "../lib/utils";

// The catalogue is an initial import, not a synchronization mechanism.
// Never re-create renamed, deleted, unpublished, or otherwise client-managed entries.
export async function importInitialCatalogue(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(1229402113)`;
  const [categoryCount, productCount] = await Promise.all([tx.category.count(), tx.product.count()]);
  if (categoryCount || productCount) return false;

  const catalogue = getLegacyCatalogue();
  const categoryByName = new Map<string, string>();
  for (const [sortOrder, name] of catalogue.categories.entries()) {
    const category = await tx.category.create({ data: { name, slug: slugify(name), sortOrder, status: ProductStatus.PUBLISHED } });
    categoryByName.set(name, category.id);
  }
  for (const product of catalogue.products) {
    const categoryId = categoryByName.get(product.category);
    if (!categoryId) throw new Error("Initial catalogue has an unknown category.");
    await tx.product.create({ data: { name: product.name, slug: legacyProductSlug(product), workingPrinciple: product.workingPrinciple, dailyUse: product.dailyUse, shortDescription: product.dailyUse, image: `/${product.image}`, imageAlt: `${product.name} generator part`, featured: product.featured, popular: product.featured, status: ProductStatus.PUBLISHED, categoryId } });
  }
  return true;
}
