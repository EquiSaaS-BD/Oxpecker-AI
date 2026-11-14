import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/server-auth";
import {
  checkIdempotencyKey,
  recordSyncLog,
  verifyIntegrationRequest,
} from "@/lib/integration-auth";
import {
  recordUnifiedClinicalPayload,
  type UnifiedClinicalSyncPayload,
} from "@/lib/patient-hub";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "integrations-sync", 120, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const channel = String(body.channel || (body.clinicSlug ? "widget" : "rest_api"));
    const clinicSlug = body.clinicSlug ? String(body.clinicSlug) : null;

    // Allow patient self-booking / bed booking from Oxpecker portal without exposing arbitrary external write
    const session = await getSessionUser(request);
    let orgId = "org-default";
    let orgSlug = clinicSlug || "oxpecker-flagship-hospital";
    let authType = "session";

    if (
      session?.role === "patient" &&
      (channel === "oxpecker_booking" || channel === "widget") &&
      body.patient
    ) {
      orgId = session.organizationId || "org-default";
    } else {
      const auth = await verifyIntegrationRequest(request, {
        allowWidgetSlug: channel === "widget" || channel === "oxpecker_booking" ? clinicSlug || "oxpecker-flagship-hospital" : null,
      });
      if (!auth.valid) return auth.errorResponse!;
      orgId = auth.organizationId;
      orgSlug = auth.organizationSlug;
      authType = auth.authType;
    }

    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key") ||
      body.idempotencyKey ||
      null;

    if (idempotencyKey) {
      const existing = await checkIdempotencyKey(String(idempotencyKey));
      if (existing) {
        return NextResponse.json({
          success: true,
          deduplicated: true,
          organizationId: existing.organizationId,
          syncLogId: existing.id,
          cachedPayload: existing.payload,
        });
      }
    }

    const items: UnifiedClinicalSyncPayload[] = Array.isArray(body.records)
      ? body.records
      : body.patient
        ? [
            {
              patient: body.patient,
              appointment: body.appointment || null,
              prescription: body.prescription || null,
              labReport: body.labReport || null,
              vitals: body.vitals || null,
            },
          ]
        : [];

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Provide `patient` object or non-empty `records` array." },
        { status: 400 }
      );
    }

    const results = [];
    for (const item of items.slice(0, 100)) {
      if (!item?.patient?.name && !item?.patient?.phone && !item?.patient?.nidNumber && !item?.patient?.mrn) {
        continue;
      }
      const res = await recordUnifiedClinicalPayload(item, {
        organizationId: orgId,
        organizationSlug: orgSlug,
        channel,
        defaultHospitalName: body.hospitalName || item.appointment?.hospitalName || undefined,
      });
      results.push(res);
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Each record requires at least patient.name, phone, nidNumber, or mrn." },
        { status: 400 }
      );
    }

    const entityParts = [
      "Patient",
      items.some((i) => i.appointment) ? "Appointment" : null,
      items.some((i) => i.prescription) ? "Prescription" : null,
      items.some((i) => i.labReport) ? "LabReport" : null,
    ].filter(Boolean);

    const log = await recordSyncLog({
      organizationId: orgId,
      direction: "inbound",
      channel,
      entityType: entityParts.join("+"),
      externalRefId: results[0]?.mrn || null,
      idempotencyKey: idempotencyKey ? String(idempotencyKey) : null,
      status: "success",
      recordsProcessed: results.length,
      payload: { authType, sampleResult: results[0] },
    });

    try {
      await withDbTimeout(
        prisma.auditLog.create({
          data: {
            actorId: session?.id || `api-key:${orgId}`,
            actorName: session?.name || `External Connector (${channel})`,
            actorRole: session?.role || "integration",
            organizationId: orgId,
            action: "EXTERNAL_HUB_SYNC",
            targetType: "Patient",
            targetId: results[0]?.patientId || "batch",
            metadata: { channel, count: results.length, syncLogId: log.id } as any,
          },
        }),
        1000
      );
    } catch {}

    return NextResponse.json({
      success: true,
      deduplicated: false,
      organizationId: orgId,
      syncedCount: results.length,
      syncLogId: log.id,
      patientId: results[0]?.patientId,
      mrn: results[0]?.mrn,
      matchedExisting: results[0]?.matchedExisting,
      matchStrategy: results[0]?.matchStrategy,
      results,
    });
  } catch (error: any) {
    console.error("[Integrations Sync API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process external sync payload." },
      { status: 500 }
    );
  }
}
