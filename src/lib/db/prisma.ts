import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const createClient = () => new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Middleware to auto-reconnect on connection drop
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (e: any) {
    const isConnErr = e?.message?.includes("Closed") || e?.message?.includes("ECONNRESET") || e?.code === "P1001" || e?.code === "P1002" || e?.message?.includes("Can't reach database");
    if (isConnErr) {
      console.log("[prisma] Connection lost, reconnecting...");
      await prisma.$disconnect().catch(() => {});
      await new Promise(r => setTimeout(r, 1000));
      await prisma.$connect().catch(() => {});
      return await next(params);
    }
    throw e;
  }
});
