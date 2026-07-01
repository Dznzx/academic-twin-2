import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Auto-reconnect on connection drop
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const isConnectionError =
        e?.message?.includes("Closed") ||
        e?.message?.includes("Connection") ||
        e?.message?.includes("ECONNRESET") ||
        e?.code === "P1001" ||
        e?.code === "P1002";

      if (isConnectionError && i < retries - 1) {
        console.log(`DB connection lost, reconnecting... (attempt ${i + 1})`);
        await prisma.$disconnect().catch(() => {});
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        await prisma.$connect().catch(() => {});
        continue;
      }
      throw e;
    }
  }
  throw new Error("Max retries reached");
}

export { withRetry };
