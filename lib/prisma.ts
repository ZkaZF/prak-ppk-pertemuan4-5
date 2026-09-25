import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7+ tidak lagi pakai binary engine bawaan (Rust-free),
// jadi koneksi ke PostgreSQL WAJIB lewat driver adapter.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Singleton Prisma Client supaya tidak membuat koneksi baru tiap hot-reload
// di development (best practice Next.js + Prisma).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
