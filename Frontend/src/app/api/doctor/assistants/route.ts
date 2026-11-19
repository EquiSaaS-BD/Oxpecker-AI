import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/server-auth";
import {
  connectAssistantByDoctorCode,
  createAssistantInvite,
  derive12DigitAssistantCode,
  getAssistantPairingState,
  getDoctorAssistantsState,
  respondToAssistantInvite,
  revokeAssistantConnection,
  syncDoctorQueue,
} from "@/lib/doctor-assistant-link";
import {
  hydratePairingStoreFromDb,
  persistDoctorQueueToDb,
  persistInviteToDb,
  persistRevokeToDb,
} from "@/lib/doctor-assistant-server";

export const dynamic = "force-dynamic";

function recordPairingAudit(actorId: string, action: string, targetId: string, reason?: string) {
  if (!process.env.DATABASE_URL) return;
  void withDbTimeout(
    prisma.auditLog.create({
      data: {
        actorId,
        actorName: actorId,
        actorRole: "clinician",
        organizationId: "org-default",
        action,
        targetType: "DoctorAssistantLink",
        targetId,
        reason: reason || null,
      },
    }),
    800
  ).catch(() => {});
}

export async function GET(request: NextRequest) {
  await hydratePairingStoreFromDb();
  const session = await getSessionUser(request);
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("role") || session?.role || "doctor";

  if (mode === "assistant") {
    const assistantId =
      searchParams.get("assistantId") ||
      session?.assistantId ||
      derive12DigitAssistantCode(session?.email || session?.id || "assistant");
    const assistantEmail = searchParams.get("email") || session?.email || "";
    const state = getAssistantPairingState({
      assistantId,
      assistantEmail,
      userId: session?.id,
    });
    return NextResponse.json({ success: true, ...state });
  }

  const doctorId = searchParams.get("doctorId") || session?.id || "doctor-default";
  const doctorEmail = searchParams.get("email") || session?.email || "doctor@oxpecker.equisaas-bd.com";
  const state = getDoctorAssistantsState({ doctorId, doctorEmail });
  return NextResponse.json({ success: true, ...state });
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "doctor-assistants", 60, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const session = await getSessionUser(request);
    const body = await request.json();
    const action = String(body.action || "send_invite");

    if (action === "connect_by_doctor_code") {
      await hydratePairingStoreFromDb();
      const assistantEmail = String(body.assistantEmail || session?.email || "assistant@oxpecker.ai");
      const assistantId =
        String(body.assistantId || session?.assistantId || "") ||
        derive12DigitAssistantCode(session?.id || assistantEmail);

      const res = connectAssistantByDoctorCode({
        assistantId,
        assistantName: String(body.assistantName || session?.name || "Clinic Assistant"),
        assistantEmail,
        doctorCodeOrEmail: String(body.doctorCodeOrEmail || ""),
      });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: res.status });
      }
      await persistInviteToDb(res.invite!, session?.organizationId || "org-default");
      recordPairingAudit(assistantId, "ASSISTANT_CONNECTED_VIA_CODE", res.invite!.doctorId);
      return NextResponse.json({ success: true, invite: res.invite }, { status: 201 });
    }

    const doctorId = String(body.doctorId || session?.id || "doctor-default");
    const doctorName = String(body.doctorName || session?.name || "Attending Doctor");
    const doctorEmail = String(body.doctorEmail || session?.email || "doctor@oxpecker.equisaas-bd.com");

    const res = createAssistantInvite({
      doctorId,
      doctorName,
      doctorEmail,
      assistantId: body.assistantId ? String(body.assistantId) : undefined,
      assistantEmail: body.assistantEmail ? String(body.assistantEmail) : undefined,
      role: body.role ? String(body.role) : undefined,
      permissions: body.permissions || undefined,
    });
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }

    await persistInviteToDb(res.invite!, session?.organizationId || "org-default");
    recordPairingAudit(doctorId, "DOCTOR_SENT_ASSISTANT_INVITE", res.invite!.assistantId);
    return NextResponse.json({ success: true, invite: res.invite }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to process pairing action." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const body = await request.json();
    const action = String(body.action || "respond_invite");

    if (action === "sync_queue" && Array.isArray(body.queue)) {
      const doctorId = String(body.doctorId || session?.id || "doctor-default");
      const synced = syncDoctorQueue(doctorId, body.queue);
      await persistDoctorQueueToDb(doctorId, synced);
      return NextResponse.json({ success: true, queue: synced });
    }

    await hydratePairingStoreFromDb();
    const res = respondToAssistantInvite({
      inviteId: String(body.inviteId || ""),
      assistantId: body.assistantId ? String(body.assistantId) : session?.assistantId,
      assistantEmail: body.assistantEmail ? String(body.assistantEmail) : session?.email,
      assistantName: body.assistantName ? String(body.assistantName) : session?.name,
      status: body.status === "declined" ? "declined" : "accepted",
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }

    await persistInviteToDb(res.invite!, session?.organizationId || "org-default");
    recordPairingAudit(
      res.invite!.assistantId,
      res.invite!.status === "accepted" ? "ASSISTANT_ACCEPTED_INVITE" : "ASSISTANT_DECLINED_INVITE",
      res.invite!.doctorId
    );
    return NextResponse.json({ success: true, invite: res.invite });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update pairing." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionUser(request);
  const { searchParams } = new URL(request.url);
  const assistantId = searchParams.get("assistantId") || "";
  const doctorId = searchParams.get("doctorId") || session?.id || undefined;
  const doctorName = searchParams.get("doctorName") || session?.name || "Attending Doctor";

  if (!assistantId) {
    return NextResponse.json({ error: "assistantId query parameter is required." }, { status: 400 });
  }

  const res = revokeAssistantConnection({ doctorId, doctorName, assistantId });
  await persistRevokeToDb(assistantId, doctorId);
  recordPairingAudit(doctorId || "doctor", "DOCTOR_REVOKED_ASSISTANT", assistantId);
  return NextResponse.json({ success: true, ...res });
}
