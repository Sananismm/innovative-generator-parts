import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) throw new Error("DATABASE_URL is required for database operations.");

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log,
  });
}

let client: PrismaClient | undefined;

// Catalogue fallback must remain usable without constructing a database client.
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    client ??= globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
