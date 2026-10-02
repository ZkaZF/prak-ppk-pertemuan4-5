import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let connectionString = process.env.DATABASE_URL?? "";
connectionString = connectionString.split("?")[0];

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false } as any
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV!== "production") {
  globalForPrisma.prisma = prisma;
}
