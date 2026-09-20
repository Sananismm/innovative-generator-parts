import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, Role } from "@prisma/client";
import { getLegacyCatalogue, legacyProductSlug } from "../lib/legacy-catalogue";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  const catalogue = getLegacyCatalogue();
  const categories = await Promise.all(catalogue.categories.map((name, sortOrder) => prisma.category.upsert({
    where: { slug: slugify(name) },
    update: { name, sortOrder, status: ProductStatus.PUBLISHED },
    create: { name, slug: slugify(name), sortOrder, status: ProductStatus.PUBLISHED },
  })));
  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));
  for (const product of catalogue.products) {
    await prisma.product.upsert({
      where: { slug: legacyProductSlug(product) },
      update: { name: product.name, workingPrinciple: product.workingPrinciple, dailyUse: product.dailyUse, shortDescription: product.dailyUse, image: `/${product.image}`, imageAlt: `${product.name} generator part`, featured: product.featured, popular: product.featured, status: ProductStatus.PUBLISHED, categoryId: categoryByName.get(product.category)! },
      create: { name: product.name, slug: legacyProductSlug(product), workingPrinciple: product.workingPrinciple, dailyUse: product.dailyUse, shortDescription: product.dailyUse, image: `/${product.image}`, imageAlt: `${product.name} generator part`, featured: product.featured, popular: product.featured, status: ProductStatus.PUBLISHED, categoryId: categoryByName.get(product.category)! },
    });
  }
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password && password.length >= 12 && !email.endsWith("@example.com")) {
    await prisma.user.upsert({ where: { email }, update: { role: Role.ADMIN }, create: { email, role: Role.ADMIN, passwordHash: await bcrypt.hash(password, 12) } });
  } else {
    console.warn("Admin user skipped. Set a non-example SEED_ADMIN_EMAIL and a 12+ character SEED_ADMIN_PASSWORD before seeding production.");
  }
}

main().finally(() => prisma.$disconnect());
