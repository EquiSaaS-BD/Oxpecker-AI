import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";
import { getHubMemoryStore, type MemorySyncLog } from "@/lib/patient-hub";

export const DEMO_CLINIC_API_KEY = "oxp_live_demo_clinic_hub_key_2026";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey.trim()).digest("hex");
}

function ensureDemoApiKeySeeded() {
  const store = getHubMemoryStore();
  const demoHash = hashApiKey(DEMO_CLINIC_API_KEY);
  if (!store.apiKeys.some((k) => k.keyHash === demoHash)) {
    store.apiKeys.unshift({
      id: "key-demo-clinic-01",
      organizationId: "org-default",
      label: "Primary Clinic Website & HMS Connector (Demo)",
      keyPrefix: "oxp_live_demo...",
      keyHash: demoHash,
      scopes: ["patients:write", "appointments:write", "prescriptions:write", "reports:write", "fhir:read"],
      lastUsedAt: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function generateTenantApiKey(
  organizationId: string,
  label: string,
  scopes: string[] = ["patients:write", "appointments:write", "prescriptions:write", "reports:write", "fhir:read"]
) {
  ensureDemoApiKeySeeded();
  const rawKey = `oxp_live_${randomBytes(18).toString("hex")}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = `${rawKey.slice(0, 14)}...${rawKey.slice(-4)}`;
  const id = `key-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const createdAt = new Date().toISOString();

  const record = {
    id,
    organizationId,
    label: label.trim() || "Clinic Integration Key",
    keyPrefix,
    keyHash,
    scopes,
    lastUsedAt: null,
    isActive: true,
    createdAt,
  };

  getHubMemoryStore().apiKeys.unshift(record);

  try {
    await withDbTimeout(
      prisma.tenantApiKey.create({
        data: {
          id,
          organizationId,
          label: record.label,
          keyPrefix,
          keyHash,
          scopes: scopes as any,
          isActive: true,
        },
      }),
      1500
    );
  } catch {}

  return { rawKey, record };
}

export async function revokeTenantApiKey(id: string, organizationId: string, isAdmin = false) {
  const store = getHubMemoryStore();
  const idx = store.apiKeys.findIndex(
    (k) => k.id === id && (isAdmin || k.organizationId === organizationId)
  );
  if (idx >= 0) store.apiKeys[idx].isActive = false;

  try {
    await withDbTimeout(
      prisma.tenantApiKey.updateMany({
        where: isAdmin ? { id } : { id, organizationId },
        data: { isActive: false },
      }),
      1500
    );
  } catch {}
}

export async function verifyIntegrationRequest(
  request: Request,
  options: { allowWidgetSlug?: string | null } = {}
): Promise<{
  valid: boolean;
  organizationId: string;
  organizationSlug: string;
  scopes: string[];
  authType: "api_key" | "session" | "widget";
  errorResponse?: NextResponse;
}> {
  ensureDemoApiKeySeeded();

  const headerKey =
    request.headers.get("x-oxpecker-api-key")?.trim() ||
    (request.headers.get("authorization")?.startsWith("Bearer oxp_")
      ? request.headers.get("authorization")!.slice(7).trim()
      : "");

  if (headerKey) {
    const keyHash = hashApiKey(headerKey);
    const store = getHubMemoryStore();

    try {
      const dbKey = await withDbTimeout(
        prisma.tenantApiKey.findFirst({ where: { keyHash, isActive: true } }),
        1500
      );
      if (dbKey) {
        withDbTimeout(
          prisma.tenantApiKey.update({
            where: { id: dbKey.id },
            data: { lastUsedAt: new Date() },
          }),
          800
        ).catch(() => {});
        return {
          valid: true,
          organizationId: dbKey.organizationId,
          organizationSlug: store.orgConfigs[dbKey.organizationId]?.slug || dbKey.organizationId,
          scopes: Array.isArray(dbKey.scopes) ? (dbKey.scopes as string[]) : ["*"],
          authType: "api_key",
        };
      }
    } catch {}

    const memKey = store.apiKeys.find((k) => k.keyHash === keyHash && k.isActive);
    if (memKey) {
      memKey.lastUsedAt = new Date().toISOString();
      return {
        valid: true,
        organizationId: memKey.organizationId,
        organizationSlug: store.orgConfigs[memKey.organizationId]?.slug || memKey.organizationId,
        scopes: memKey.scopes,
        authType: "api_key",
      };
    }

    return {
      valid: false,
      organizationId: "",
      organizationSlug: "",
      scopes: [],
      authType: "api_key",
      errorResponse: NextResponse.json({ error: "Invalid or revoked Oxpecker Integration API Key." }, { status: 401 }),
    };
  }

  // Fallback 1: Authenticated Hospital / Doctor / Assistant / Admin session
  const session = await getSessionUser(request);
  if (session && ["hospital", "doctor", "assistant", "admin"].includes(String(session.role))) {
    const orgId = session.organizationId || "org-default";
    const store = getHubMemoryStore();
    return {
      valid: true,
      organizationId: orgId,
      organizationSlug: store.orgConfigs[orgId]?.slug || orgId,
      scopes: ["*"],
      authType: "session",
    };
  }

  // Fallback 2: Public Embeddable Clinic Booking Widget (when clinicSlug is specified)
  if (options.allowWidgetSlug) {
    const slug = options.allowWidgetSlug.trim().toLowerCase();
    const store = getHubMemoryStore();
    const matchedConfig = Object.values(store.orgConfigs).find(
      (c) => c.slug.toLowerCase() === slug || c.organizationId.toLowerCase() === slug
    );
    const orgId = matchedConfig?.organizationId || "org-default";
    return {
      valid: true,
      organizationId: orgId,
      organizationSlug: matchedConfig?.slug || slug,
      scopes: ["patients:write", "appointments:write"],
      authType: "widget",
    };
  }

  return {
    valid: false,
    organizationId: "",
    organizationSlug: "",
    scopes: [],
    authType: "api_key",
    errorResponse: NextResponse.json(
      { error: "Authentication required. Provide x-oxpecker-api-key header or sign in." },
      { status: 401 }
    ),
  };
}

export async function checkIdempotencyKey(idempotencyKey?: string | null): Promise<MemorySyncLog | null> {
  if (!idempotencyKey) return null;
  const trimmed = idempotencyKey.trim();
  if (!trimmed) return null;

  const store = getHubMemoryStore();
  const memHit = store.syncLogs.find((l) => l.idempotencyKey === trimmed);
  if (memHit) return memHit;

  try {
    const dbHit = await withDbTimeout(
      prisma.integrationSyncLog.findUnique({ where: { idempotencyKey: trimmed } }),
      1200
    );
    if (dbHit) {
      return {
        id: dbHit.id,
        organizationId: dbHit.organizationId,
        direction: dbHit.direction as "inbound" | "outbound",
        channel: dbHit.channel,
        entityType: dbHit.entityType,
        externalRefId: dbHit.externalRefId,
        idempotencyKey: dbHit.idempotencyKey,
        status: dbHit.status as "success" | "failed" | "deduplicated",
        recordsProcessed: dbHit.recordsProcessed,
        errorMessage: dbHit.errorMessage,
        payload: dbHit.payload,
        createdAt: dbHit.createdAt.toISOString(),
      };
    }
  } catch {}

  return null;
}

export async function recordSyncLog(entry: Omit<MemorySyncLog, "id" | "createdAt">) {
  const id = `sync-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const createdAt = new Date().toISOString();
  const record: MemorySyncLog = { ...entry, id, createdAt };
  const store = getHubMemoryStore();
  store.syncLogs.unshift(record);
  if (store.syncLogs.length > 100) store.syncLogs.pop();

  try {
    await withDbTimeout(
      prisma.integrationSyncLog.create({
        data: {
          id,
          organizationId: entry.organizationId,
          direction: entry.direction,
          channel: entry.channel,
          entityType: entry.entityType,
          externalRefId: entry.externalRefId || null,
          idempotencyKey: entry.idempotencyKey || null,
          status: entry.status,
          recordsProcessed: entry.recordsProcessed,
          errorMessage: entry.errorMessage || null,
          payload: entry.payload as any,
        },
      }),
      1200
    );
  } catch {}

  return record;
}
