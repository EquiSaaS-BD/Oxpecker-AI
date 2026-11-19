import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus: "connected" | "resilient_memory_fallback" = "resilient_memory_fallback";

  if (process.env.DATABASE_URL) {
    try {
      await withDbTimeout(prisma.$queryRaw`SELECT 1`, 1200);
      dbStatus = "connected";
    } catch {
      dbStatus = "resilient_memory_fallback";
    }
  }

  return NextResponse.json({
    status: "healthy",
    service: "oxpecker-ai-web",
    timestamp: new Date().toISOString(),
    services: {
      frontend: "up",
      database: dbStatus,
      backendApiUrl: process.env.NEXT_PUBLIC_API_URL || "https://oxpecker-api.azurewebsites.net",
    },
  });
}
