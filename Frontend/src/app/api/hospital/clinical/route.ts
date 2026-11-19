import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  addClinicalCareNote,
  getClinicalCareNotes,
  getErTriageCases,
  saveErTriageCase,
  type ErTriageCaseItem,
} from "@/lib/hospital-diagnostics";
import { requireSessionUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "notes";
  const admissionId = searchParams.get("admissionId") || undefined;

  if (type === "triage") {
    return NextResponse.json({ success: true, cases: getErTriageCases() });
  }

  if (process.env.DATABASE_URL) {
    try {
      const orgWhere = auth.user.role === "admin" ? {} : { organizationId: auth.user.organizationId };
      const rows = await withDbTimeout(
        prisma.clinicalCareNote.findMany({
          where: {
            ...orgWhere,
            ...(admissionId ? { admissionId } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 80,
        }),
        1200
      );
      if (rows.length > 0) {
        return NextResponse.json({
          success: true,
          notes: rows.map((r) => ({
            id: r.id,
            admissionId: r.admissionId || undefined,
            patientName: r.patientName,
            smartCardUid: r.smartCardUid || undefined,
            noteType: r.noteType,
            priority: r.priority,
            summary: r.summary,
            vitals: (r.payload as any)?.vitals,
            recordedBy: r.recordedBy || "Clinician",
            createdAt: r.createdAt.toISOString(),
          })),
        });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, notes: getClinicalCareNotes(admissionId) });
}

export async function POST(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();

    if (body.kind === "triage") {
      const triageCase: ErTriageCaseItem = {
        id: body.id || `er-${Date.now()}`,
        token: body.token || `ER-${Math.floor(10 + Math.random() * 89)}`,
        patientName: String(body.patientName || "Emergency Patient"),
        age: Number(body.age || 40),
        gender: String(body.gender || "Male"),
        smartCardUid: body.smartCardUid || undefined,
        phone: body.phone || undefined,
        chiefComplaint: String(body.chiefComplaint || "Acute evaluation required"),
        triageLevel: body.triageLevel || "Yellow - Urgent",
        vitalsSummary: String(body.vitalsSummary || "BP 120/80 | HR 82 | SpO2 98%"),
        status: body.status || "In Triage",
        arrivedAt: body.arrivedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const cases = saveErTriageCase(triageCase);
      return NextResponse.json({ success: true, case: triageCase, cases }, { status: 201 });
    }

    const summary = String(body.summary || "").trim();
    const patientName = String(body.patientName || "").trim();
    if (!summary || !patientName) {
      return NextResponse.json({ error: "patientName and summary are required." }, { status: 400 });
    }

    const updatedNotes = addClinicalCareNote({
      admissionId: body.admissionId,
      patientName,
      smartCardUid: body.smartCardUid,
      noteType: body.noteType || "Vitals",
      priority: body.priority || "Routine",
      summary,
      vitals: body.vitals,
      recordedBy: String(body.recordedBy || auth.user.name || "Hospital Clinician"),
    });

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.clinicalCareNote.create({
            data: {
              organizationId: orgId,
              admissionId: body.admissionId || null,
              patientName,
              smartCardUid: body.smartCardUid || null,
              noteType: String(body.noteType || "Vitals"),
              priority: String(body.priority || "Routine"),
              summary,
              payload: body.vitals ? { vitals: body.vitals } : undefined,
              recordedBy: String(body.recordedBy || auth.user.name || "Hospital Clinician"),
            },
          }),
          1200
        );
      } catch {}
    }

    return NextResponse.json({ success: true, notes: updatedNotes }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save clinical note." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const cases = getErTriageCases();
    const found = cases.find((c) => c.id === body.id);
    if (!found) {
      return NextResponse.json({ error: "ER triage case not found." }, { status: 404 });
    }
    const updated: ErTriageCaseItem = {
      ...found,
      status: body.status || found.status,
      triageLevel: body.triageLevel || found.triageLevel,
      vitalsSummary: body.vitalsSummary || found.vitalsSummary,
    };
    saveErTriageCase(updated);
    return NextResponse.json({ success: true, case: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update triage case." }, { status: 500 });
  }
}
