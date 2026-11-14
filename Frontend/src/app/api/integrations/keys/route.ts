import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-auth";
import {
  DEMO_CLINIC_API_KEY,
  generateTenantApiKey,
  revokeTenantApiKey,
} from "@/lib/integration-auth";
import { getHubMemoryStore } from "@/lib/patient-hub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireSessionUser(request, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";
  const store = getHubMemoryStore();

  let keys = store.apiKeys.filter((k) => auth.user.role === "admin" || k.organizationId === orgId);
  let syncLogs = store.syncLogs.filter((l) => auth.user.role === "admin" || l.organizationId === orgId);

  try {
    const dbData = await withDbTimeout(
      Promise.all([
        prisma.tenantApiKey.findMany({
          where: auth.user.role === "admin" ? {} : { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
        prisma.integrationSyncLog.findMany({
          where: auth.user.role === "admin" ? {} : { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 40,
        }),
      ]),
      1500
    );
    if (dbData[0].length > 0) keys = dbData[0] as any;
    if (dbData[1].length > 0) syncLogs = dbData[1] as any;
  } catch {}

  const orgConfig = store.orgConfigs[orgId] || store.orgConfigs["org-default"];
  const slug = orgConfig?.slug || "oxpecker-flagship-hospital";

  return NextResponse.json({
    success: true,
    organizationConfig: orgConfig,
    demoApiKeyHint: DEMO_CLINIC_API_KEY,
    keys,
    syncLogs,
    snippets: {
      widgetEmbedHtml: `<iframe src="https://oxpecker.ai/embed/book/${slug}" width="100%" height="680" style="border:0;border-radius:16px;" loading="lazy" title="Oxpecker Booking"></iframe>`,
      curlSync: `curl -X POST https://oxpecker.ai/api/integrations/v1/sync \\\n  -H "Content-Type: application/json" \\\n  -H "x-oxpecker-api-key: ${DEMO_CLINIC_API_KEY}" \\\n  -H "Idempotency-Key: clinic-bk-1001" \\\n  -d '{"patient":{"name":"Rahim Uddin","phone":"+8801711000000","bloodGroup":"A+","heightCm":170,"weightKg":70},"appointment":{"doctorName":"Prof. Dr. Ahmed Rahman","hospitalName":"${orgConfig?.name || "City Care Clinic"}","date":"2026-11-22","time":"11:00 AM","source":"clinic_website"}}'`,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSessionUser(request, ["hospital", "doctor", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await request.json();
    const action = body.action || "create_key";

    if (action === "update_config") {
      const store = getHubMemoryStore();
      const existing = store.orgConfigs[orgId] || store.orgConfigs["org-default"];
      const updated = {
        ...existing,
        organizationId: orgId,
        name: body.name || existing.name,
        dghsFacilityCode: body.dghsFacilityCode ?? existing.dghsFacilityCode,
        licenseTier: body.licenseTier || existing.licenseTier,
        webhookUrl: body.webhookUrl ?? existing.webhookUrl,
      };
      store.orgConfigs[orgId] = updated;

      try {
        await withDbTimeout(
          prisma.organization.upsert({
            where: { id: orgId },
            update: {
              name: updated.name,
              dghsFacilityCode: updated.dghsFacilityCode,
              licenseTier: updated.licenseTier,
              webhookUrl: updated.webhookUrl,
            },
            create: {
              id: orgId,
              slug: updated.slug || orgId,
              name: updated.name,
              dghsFacilityCode: updated.dghsFacilityCode,
              licenseTier: updated.licenseTier,
              licenseKey: updated.licenseKey,
              webhookUrl: updated.webhookUrl,
            },
          }),
          1500
        );
      } catch {}

      return NextResponse.json({ success: true, organizationConfig: updated });
    }

    const label = String(body.label || "Hospital Website Connector");
    const scopes = Array.isArray(body.scopes)
      ? body.scopes
      : ["patients:write", "appointments:write", "prescriptions:write", "reports:write", "fhir:read"];

    const { rawKey, record } = await generateTenantApiKey(orgId, label, scopes);
    return NextResponse.json({
      success: true,
      rawKey,
      key: record,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update integrations." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireSessionUser(request, ["hospital", "doctor", "admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Key id required" }, { status: 400 });

  await revokeTenantApiKey(id, auth.user.organizationId || "org-default", auth.user.role === "admin");
  return NextResponse.json({ success: true, revokedId: id });
}
