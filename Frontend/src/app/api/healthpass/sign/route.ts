import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";
import {
  encodeOfflineQRPayload,
  decodeOfflineQRPayload,
  type OfflineEmergencyProfile,
} from "@/lib/healthpass-offline-qr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, profile, qrData, healthId, reason } = body;
    const session = await getSessionUser(request);

    if (action === "audit_scan") {
      const targetId = String(healthId || "HP-UNKNOWN").slice(0, 128);
      await withDbTimeout(
        prisma.auditLog.create({
          data: {
            actorId: session?.id || "anonymous-emergency-responder",
            actorName: session?.name || "Emergency Responder",
            actorRole: session?.role || "public_responder",
            organizationId: session?.organizationId || "org-default",
            action: "QR_SCAN",
            targetType: "HealthPassCard",
            targetId,
            reason: String(reason || "Emergency HealthPass QR Triage Scan"),
          },
        }),
        1500
      ).catch(() => {});

      return NextResponse.json({ success: true, logged: true });
    }

    if (action === "verify" && typeof qrData === "string") {
      const decoded = decodeOfflineQRPayload(qrData);
      if (!decoded) {
        return NextResponse.json(
          { valid: false, error: "Invalid or tampered YUNET1 QR signature." },
          { status: 400 }
        );
      }
      return NextResponse.json({ valid: true, profile: decoded });
    }

    if (profile && typeof profile === "object") {
      const origin = new URL(request.url).origin;
      const qrUrl = encodeOfflineQRPayload(profile as OfflineEmergencyProfile, origin);
      return NextResponse.json({ success: true, qrUrl });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process HealthPass signature" },
      { status: 500 }
    );
  }
}
