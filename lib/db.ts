import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const connectionString = process.env.DATABASE_URL;

  // Public catalogue pages retain their no-database fallback. Database-backed
  // paths only create an adapter when DATABASE_URL is configured.
  if (!connectionString) return new PrismaClient({ log });

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log,
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
