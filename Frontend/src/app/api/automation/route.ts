import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-auth";
import type { AutomationEventLog } from "@/lib/automation-engine";

const serverAutomationLog: AutomationEventLog[] = [];

export async function GET(req: Request) {
  const auth = await requireSessionUser(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const dbEvents = await withDbTimeout(
      prisma.automationEvent.findMany({
        where: user.role === "admin" ? {} : { organizationId: user.organizationId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      1800
    );

    if (dbEvents && dbEvents.length > 0) {
      const formatted: AutomationEventLog[] = dbEvents.map((ev) => ({
        id: ev.id,
        type: ev.type as AutomationEventLog["type"],
        title: ev.title,
        patientName: ev.patientName,
        patientPhone: ev.patientPhone || undefined,
        doctorName: ev.doctorName || undefined,
        channel: ev.channel as AutomationEventLog["channel"],
        status: ev.status as AutomationEventLog["status"],
        summary: ev.summary,
        smsPreview: ev.smsPreview || undefined,
        timestamp: ev.createdAt.toISOString(),
      }));
      return NextResponse.json({
        success: true,
        count: formatted.length,
        events: formatted,
        source: "database",
      });
    }
  } catch {}

  return NextResponse.json({
    success: true,
    count: serverAutomationLog.length,
    events: serverAutomationLog,
    source: "resilient_cache",
  });
}

export async function POST(req: Request) {
  const auth = await requireSessionUser(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await req.json();
    const incoming: AutomationEventLog[] = Array.isArray(body.events)
      ? body.events
      : body.event
      ? [body.event]
      : [];

    const orgId = user.organizationId || "org-default";

    for (const ev of incoming) {
      serverAutomationLog.unshift(ev);
      withDbTimeout(
        prisma.automationEvent.create({
          data: {
            organizationId: orgId,
            type: String(ev.type || "MEDICATION_SCHEDULE_CREATED"),
            title: String(ev.title || "Clinical Automation Triggered"),
            patientName: String(ev.patientName || "Patient"),
            patientPhone: ev.patientPhone || null,
            doctorName: ev.doctorName || user.name || null,
            channel: String(ev.channel || "HealthPass App"),
            status: String(ev.status || "Delivered"),
            summary: String(ev.summary || ""),
            smsPreview: ev.smsPreview || null,
            metadata: ev.medicationSlots ? (ev.medicationSlots as any) : undefined,
          },
        }),
        1500
      ).catch(() => {});
    }

    if (serverAutomationLog.length > 100) {
      serverAutomationLog.length = 100;
    }

    return NextResponse.json({
      success: true,
      dispatched: incoming.length,
      events: incoming,
    });
  } catch (error) {
    console.error("Automation dispatch error:", error);
    return NextResponse.json({ error: "Failed to dispatch automation event" }, { status: 500 });
  }
}
