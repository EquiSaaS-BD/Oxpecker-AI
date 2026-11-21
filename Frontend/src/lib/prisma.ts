import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

let dbCircuitOpenUntil = 0;

/**
 * Executes a database operation with a strict timeout guard and 60s circuit breaker.
 * If DATABASE_URL is missing, the circuit is open, or connection cannot complete within `timeoutMs`,
 * it immediately rejects so callers trigger resilient local persistence without lagging.
 */
export async function withDbTimeout<T>(op: Promise<T>, timeoutMs = 2000): Promise<T> {
  if (!process.env.DATABASE_URL || Date.now() < dbCircuitOpenUntil) {
    // Prevent unhandled rejection warnings on callers that intentionally catch/ignore
    op.catch(() => {});
    return Promise.reject(new Error("Database unavailable (circuit open)"));
  }

  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      dbCircuitOpenUntil = Date.now() + 60_000;
      reject(new Error("Database operation timed out"));
    }, timeoutMs);
  });

  return Promise.race([
    op.then(
      (res) => {
        dbCircuitOpenUntil = 0;
        return res;
      },
      (err) => {
        dbCircuitOpenUntil = Date.now() + 60_000;
        throw err;
      }
    ),
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}
