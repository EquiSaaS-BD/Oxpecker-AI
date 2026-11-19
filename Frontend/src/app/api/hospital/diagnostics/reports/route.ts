import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  getDiagnosticReports,
  runHospitalAiReportScan,
  saveDiagnosticReport,
  updateDiagnosticOrderStatus,
  verifyAndSignDiagnosticReport,
  type DiagnosticReportItem,
} from "@/lib/hospital-diagnostics";
import { requireSessionUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgWhere = auth.user.role === "admin" ? {} : { organizationId: auth.user.organizationId };

  let reports: DiagnosticReportItem[] = getDiagnosticReports();

  if (process.env.DATABASE_URL) {
    try {
      const rows = await withDbTimeout(
        prisma.diagnosticReportRecord.findMany({ where: orgWhere, orderBy: { createdAt: "desc" }, take: 100 }),
        1200
      );
      if (rows.length > 0) {
        reports = rows.map((r) => ({
          id: r.reportCode,
          reportCode: r.reportCode,
          orderId: r.orderId || undefined,
          accessionId: r.accessionId || undefined,
          organizationId: r.organizationId,
          patient: r.patientName,
          age: r.patientAge || 35,
          gender: r.patientGender || "Male",
          patientPhone: r.patientPhone || undefined,
          smartCardUid: r.smartCardUid || undefined,
          test: r.testName,
          dept: r.department,
          specimen: r.specimen || "Laboratory Specimen",
          doctor: r.referringDoctor || "Attending Doctor",
          date: r.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: (r.status as DiagnosticReportItem["status"]) || "Processing",
          parameters: Array.isArray(r.parameters) ? (r.parameters as any[]) : [],
          keyFindings: r.keyFindings,
          bengaliSummary: r.bengaliSummary || undefined,
          recommendedSpecialist: r.recommendedSpecialist || undefined,
          aiAnalyzed: Boolean(r.aiAnalysis),
          signedBy: r.signedBy || undefined,
          signedByDegrees: r.signedByDegrees || undefined,
          signedByBmdc: r.signedByBmdc || undefined,
          signedAt: r.signedAt?.toISOString(),
          publishedToHealthPass: r.publishedToHealthPass,
          qrHash: r.qrHash || undefined,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch {}
  }

  return NextResponse.json({ success: true, reports });
}

export async function POST(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();
    if (!body.patientName || !body.testTitle) {
      return NextResponse.json({ error: "Patient name and test title are required." }, { status: 400 });
    }

    const { report, engineAnalysis, isCritical } = runHospitalAiReportScan({
      mode: body.mode,
      rawText: body.rawText,
      structuredParameters: body.parameters,
      patientName: String(body.patientName),
      patientAge: body.patientAge ? Number(body.patientAge) : 38,
      patientGender: body.patientGender || "Male",
      patientPhone: body.patientPhone,
      smartCardUid: body.smartCardUid,
      testTitle: String(body.testTitle),
      department: String(body.department || "Pathology"),
      specimen: body.specimen,
      referringDoctor: body.referringDoctor,
      orderId: body.orderId,
      accessionId: body.accessionId,
      organizationId: orgId,
    });

    saveDiagnosticReport(report);

    if (body.orderId) {
      updateDiagnosticOrderStatus(String(body.orderId), "AI Analyzed");
    }

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.diagnosticReportRecord.create({
            data: {
              reportCode: report.reportCode,
              orderId: report.orderId || null,
              accessionId: report.accessionId || null,
              organizationId: orgId,
              patientName: report.patient,
              patientAge: report.age,
              patientGender: report.gender,
              patientPhone: report.patientPhone || null,
              smartCardUid: report.smartCardUid || null,
              testName: report.test,
              department: report.dept,
              specimen: report.specimen,
              referringDoctor: report.doctor,
              status: report.status,
              parameters: report.parameters as any,
              keyFindings: report.keyFindings,
              aiAnalysis: engineAnalysis as any,
              bengaliSummary: report.bengaliSummary || null,
              recommendedSpecialist: report.recommendedSpecialist || null,
              publishedToHealthPass: false,
              qrHash: report.qrHash || null,
            },
          }),
          1500
        );
      } catch {}
    }

    return NextResponse.json({ success: true, report, isCritical }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to analyze and save report." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();
    const reportId = String(body.reportId || body.id || "");
    if (!reportId) {
      return NextResponse.json({ error: "reportId is required." }, { status: 400 });
    }

    const signed = verifyAndSignDiagnosticReport(
      reportId,
      {
        name: String(body.signedBy || auth.user.name || "Prof. Dr. Selina Akter"),
        degrees: body.signedByDegrees ? String(body.signedByDegrees) : undefined,
        bmdc: body.signedByBmdc ? String(body.signedByBmdc) : undefined,
      },
      body.publishToHealthPass !== false
    );

    if (signed?.orderId) {
      updateDiagnosticOrderStatus(signed.orderId, "Verified & Published");
    }

    if (process.env.DATABASE_URL && signed) {
      try {
        await withDbTimeout(
          prisma.diagnosticReportRecord.updateMany({
            where: { OR: [{ id: reportId }, { reportCode: reportId }] },
            data: {
              status: signed.status,
              signedBy: signed.signedBy,
              signedByDegrees: signed.signedByDegrees,
              signedByBmdc: signed.signedByBmdc,
              signedAt: new Date(),
              publishedToHealthPass: Boolean(signed.publishedToHealthPass),
              qrHash: signed.qrHash,
            },
          }),
          1200
        );

        // Push verified report into Patient LabReport timeline if publishedToHealthPass
        if (signed.publishedToHealthPass && signed.smartCardUid) {
          const patientRow = await withDbTimeout(
            prisma.patient.findFirst({
              where: { OR: [{ mrn: signed.smartCardUid }, { phone: signed.patientPhone || "" }] },
            }),
            1000
          );
          if (patientRow) {
            await withDbTimeout(
              prisma.labReport.create({
                data: {
                  patientId: patientRow.id,
                  organizationId: orgId,
                  facilityName: "Oxpecker Verified Hospital LIS",
                  doctorName: signed.signedBy || signed.doctor,
                  findings: { parameters: signed.parameters, summaryBn: signed.bengaliSummary } as any,
                  reportDate: new Date().toISOString().slice(0, 10),
                  externalRefId: signed.reportCode,
                  name: signed.test,
                  type: signed.dept,
                  date: new Date(),
                  status: signed.status,
                },
              }),
              1000
            );
          }
        }
      } catch {}
    }

    return NextResponse.json({ success: true, report: signed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to verify diagnostic report." }, { status: 500 });
  }
}
