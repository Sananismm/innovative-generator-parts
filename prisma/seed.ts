import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { importInitialCatalogue } from "./seed-catalogue";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL must be set before seeding.");

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const imported = await prisma.$transaction(importInitialCatalogue, { timeout: 60000 });
  console.info(imported ? "Initial catalogue imported." : "Catalogue already contains data; initial import skipped.");
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password && password.length >= 12 && !email.endsWith("@example.com")) {
    await prisma.user.upsert({ where: { email }, update: {}, create: { email, role: Role.ADMIN, passwordHash: await bcrypt.hash(password, 12) } });
  } else {
    console.warn("Admin user skipped. Set a non-example SEED_ADMIN_EMAIL and a 12+ character SEED_ADMIN_PASSWORD before seeding production.");
  }
}

main().finally(() => prisma.$disconnect());
