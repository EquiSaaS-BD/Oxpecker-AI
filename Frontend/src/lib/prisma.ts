import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Executes a database operation with a strict timeout guard.
 * If the connection cannot be established within `timeoutMs` (e.g. offline dev or firewall delay),
 * it immediately rejects so callers can trigger resilient local persistence without lagging.
 */
export async function withDbTimeout<T>(op: Promise<T>, timeoutMs = 2000): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs);
  });

  return Promise.race([op, timeoutPromise]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}
