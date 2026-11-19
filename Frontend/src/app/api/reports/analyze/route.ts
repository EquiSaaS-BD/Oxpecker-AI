import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/server-auth";
import { callMultimodalVision } from "@/lib/vision-engine";
import {
  encryptDocumentBytes,
  extractTextFromPdfBuffer,
  hasValidFileSignature,
} from "@/lib/medical-document-server";
import { recordUnifiedClinicalPayload } from "@/lib/patient-hub";
import {
  analyzeLabReport,
  analyzeRadiologyReportText,
  BUILT_IN_SAMPLE_LAB_REPORT_TEXT,
  computeParameterTrends,
  createExpiringShareLink,
  deleteAnalyzedReport,
  formatSkinGuidanceResult,
  getAnalyzedReportsStore,
  listAnalyzedReports,
  resolveExpiringShareLink,
  saveAnalyzedReport,
  verifyReportByDoctor,
  type AnalyzedReportRecord,
  type PatientGender,
  type RawExtractedParameter,
} from "@/lib/lab-report-engine";
import { checkAndRecordOrgUsage, dispatchTenantWebhook } from "@/lib/saas-platform";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OCR_LAB_EXTRACTION_PROMPT = `Extract ONLY test names, numeric/grade values, units, and the lab's printed reference range from this lab report image. Return JSON array under \`\`\`json:lab_params [...] \`\`\` with keys { "name", "value", "unit", "printedReferenceRange" } OR clean "Test Name: Value Unit (Min - Max)" lines. Do not diagnose or interpret.`;

const SKIN_GUIDANCE_PROMPT = `Provide careful, preliminary Bengali educational guidance for this visible skin lesion/rash photo. NEVER make a definitive diagnosis ("আপনার রোগ X হয়েছে" is strictly forbidden). Use probabilistic words ("সম্ভাব্য", "ধারণা করা যায়", "চর্মরোগ বিশেষজ্ঞের সাথে মিলিয়ে দেখুন"). Highlight red flags like rapid spread, pus, severe pain, or fever. If clarity/lighting is insufficient, clearly say confidence is low and advise seeing a Dermatologist.`;

function logReportAudit(input: {
  actorId: string;
  actorRole: string;
  organizationId: string;
  action: string;
  targetId: string;
  reason?: string;
}) {
  if (!process.env.DATABASE_URL) return;
  void withDbTimeout(
    prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorName: input.actorId,
        actorRole: input.actorRole,
        organizationId: input.organizationId,
        action: input.action,
        targetType: "LabReportAnalysis",
        targetId: input.targetId,
        reason: input.reason || null,
      },
    }),
    800
  ).catch(() => {});
}

function parseJsonLabParams(rawText: string): RawExtractedParameter[] {
  const match = rawText.match(/```json:lab_params\s*\n?([\s\S]*?)```/i);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareToken = searchParams.get("shareToken");

  if (shareToken) {
    const resolved = resolveExpiringShareLink(shareToken);
    if (!resolved) {
      return NextResponse.json(
        { error: "Share link is invalid or has expired." },
        { status: 404 }
      );
    }
    logReportAudit({
      actorId: "share-link-viewer",
      actorRole: "guest",
      organizationId: resolved.report.organizationId,
      action: "REPORT_SHARE_VIEW",
      targetId: resolved.report.id,
    });
    return NextResponse.json({
      success: true,
      sharedReport: resolved.report,
      expiresAt: resolved.expiresAt,
    });
  }

  const session = await getSessionUser(request);
  const orgFilter = searchParams.get("organizationId") || session?.organizationId || "ALL";
  const healthCardNumber = searchParams.get("healthCardNumber") || undefined;

  const reports = listAnalyzedReports({
    organizationId: orgFilter,
    healthCardNumber,
  });
  const trends = computeParameterTrends(reports);

  return NextResponse.json({
    success: true,
    reports,
    trends,
    sampleLabText: BUILT_IN_SAMPLE_LAB_REPORT_TEXT,
    demoHealthCardNumber: "HP-2026-8841",
  });
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "reports-analyze", 60, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const session = await getSessionUser(request);
    const contentType = request.headers.get("content-type") || "";

    let mode: "lab" | "radiology" | "skin" = "lab";
    let rawText = "";
    let parameters: RawExtractedParameter[] = [];
    let patientAge: number | null = 38;
    let patientGender: PatientGender = "male";
    let symptoms: string[] = [];
    let laboratory = "Oxpecker AI Lab Studio";
    let reportDate = new Date().toISOString().slice(0, 10);
    let title = "";
    let consentToSave = true;
    let organizationId = session?.organizationId || "org-default";
    let healthCardNumber = "HP-2026-8841";
    let patientName = session?.name || "Rahim Uddin";
    let patientPhone = "+8801711000000";
    let uploadedBuffer: Buffer | null = null;
    let uploadedMime = "";
    let uploadedName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      mode = (String(formData.get("mode") || "lab") as "lab" | "radiology" | "skin");
      rawText = String(formData.get("rawText") || "").trim();
      patientAge = parseInt(String(formData.get("patientAge") || "38"), 10) || 38;
      patientGender = (String(formData.get("patientGender") || "male").toLowerCase() as PatientGender);
      const symptomsStr = String(formData.get("symptoms") || "").trim();
      symptoms = symptomsStr ? symptomsStr.split(/[,\n;]/).map((s) => s.trim()).filter(Boolean) : [];
      laboratory = String(formData.get("laboratory") || laboratory);
      reportDate = String(formData.get("reportDate") || reportDate);
      title = String(formData.get("title") || "");
      consentToSave = String(formData.get("consentToSave") ?? "true") !== "false";
      organizationId = String(formData.get("organizationId") || organizationId);
      healthCardNumber = String(formData.get("healthCardNumber") || healthCardNumber);
      patientName = String(formData.get("patientName") || patientName);
      patientPhone = String(formData.get("patientPhone") || patientPhone);

      if (file && file.size > 0) {
        uploadedBuffer = Buffer.from(await file.arrayBuffer());
        uploadedMime = file.type || "image/jpeg";
        uploadedName = file.name || "report-upload";

        if (!hasValidFileSignature(uploadedMime, uploadedBuffer)) {
          return NextResponse.json(
            { error: "Unsupported or corrupted file signature. Upload valid JPEG, PNG, WEBP, or PDF." },
            { status: 400 }
          );
        }

        if (uploadedMime === "application/pdf") {
          const pdfText = extractTextFromPdfBuffer(uploadedBuffer);
          if (pdfText) rawText = rawText ? `${rawText}\n${pdfText}` : pdfText;
        } else if (mode === "skin") {
          try {
            const vision = await callMultimodalVision(uploadedBuffer, uploadedMime, SKIN_GUIDANCE_PROMPT, rawText);
            rawText = vision.rawText;
          } catch {
            rawText =
              "ছবিটি প্রাথমিক ত্বকের পর্যবেক্ষণের জন্য গৃহীত হয়েছে। আলোর তারতম্যের কারণে সম্ভাব্য ত্বকের পরিবর্তন সঠিকভাবে মূল্যায়নের জন্য চর্মরোগ বিশেষজ্ঞের পরামর্শ নিন।";
          }
        } else {
          try {
            const vision = await callMultimodalVision(
              uploadedBuffer,
              uploadedMime,
              mode === "radiology"
                ? "Transcribe all visible radiology/MRI/X-Ray text findings and impressions verbatim."
                : OCR_LAB_EXTRACTION_PROMPT,
              rawText
            );
            const extractedParams = parseJsonLabParams(vision.rawText);
            if (extractedParams.length > 0) {
              parameters = extractedParams;
            }
            if (!rawText && vision.rawText) {
              rawText = vision.rawText;
            }
          } catch {
            if (!rawText) {
              return NextResponse.json(
                { error: "OCR service unavailable right now. Paste report text or load the sample lab report." },
                { status: 503 }
              );
            }
          }
        }
      }
    } else {
      const body = await request.json();
      mode = (body.mode || "lab") as "lab" | "radiology" | "skin";
      rawText = String(body.rawText || body.reportText || "").trim();
      parameters = Array.isArray(body.parameters) ? body.parameters : [];
      patientAge = body.patientAge ? parseInt(String(body.patientAge), 10) || 38 : 38;
      patientGender = (String(body.patientGender || "male").toLowerCase() as PatientGender);
      symptoms = Array.isArray(body.symptoms) ? body.symptoms : [];
      laboratory = body.laboratory || laboratory;
      reportDate = body.reportDate || reportDate;
      title = body.title || "";
      consentToSave = body.consentToSave !== false;
      organizationId = body.organizationId || organizationId;
      healthCardNumber = body.healthCardNumber || healthCardNumber;
      patientName = body.patientName || patientName;
      patientPhone = body.patientPhone || patientPhone;
    }

    // Enforce multi-tenant monthly report quota
    const quota = checkAndRecordOrgUsage(organizationId, "reportsAnalyzed", 1);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.error, plan: quota.plan, usage: quota.workspace.usage },
        { status: quota.status }
      );
    }

    let analyzed: AnalyzedReportRecord;
    if (mode === "radiology") {
      if (!rawText) {
        return NextResponse.json(
          { error: "Please provide Radiology / X-Ray / MRI report text." },
          { status: 400 }
        );
      }
      analyzed = analyzeRadiologyReportText({
        reportText: rawText,
        title: title || "Radiology Report Text Analysis",
        organizationId,
        consentRecorded: consentToSave,
      });
    } else if (mode === "skin") {
      const hasVisionFallback = Boolean(uploadedBuffer || rawText);
      if (!hasVisionFallback) {
        return NextResponse.json(
          { error: "Please upload a skin photo or describe the visible skin change." },
          { status: 400 }
        );
      }
      analyzed = formatSkinGuidanceResult({
        visionAnalysisText:
          rawText ||
          "সম্ভাব্য ত্বকের পরিবর্তন পর্যবেক্ষণ করা হয়েছে। নির্ভরযোগ্য পরীক্ষার জন্য চর্মরোগ বিশেষজ্ঞ (Dermatology) দেখান।",
        confidence: rawText.length > 80 ? "medium" : "low",
        organizationId,
        consentRecorded: consentToSave,
      });
    } else {
      if (!rawText && parameters.length === 0) {
        return NextResponse.json(
          { error: "Upload a lab report, paste values, or click Sample Lab Report." },
          { status: 400 }
        );
      }
      analyzed = analyzeLabReport({
        rawText,
        parameters,
        patientAge,
        patientGender,
        symptoms,
        laboratory,
        reportDate,
        title: title || undefined,
        healthCardNumber: consentToSave ? healthCardNumber : undefined,
        organizationId,
        consentRecorded: consentToSave,
      });
    }

    saveAnalyzedReport(analyzed);

    // Sync to Health ID Timeline ONLY with explicit consent
    if (consentToSave) {
      await recordUnifiedClinicalPayload(
        {
          patient: {
            mrn: healthCardNumber,
            name: patientName,
            phone: patientPhone,
            age: patientAge,
            gender: patientGender,
          },
          labReport: {
            id: analyzed.id,
            name: analyzed.title,
            type: mode === "radiology" ? "Radiology Explainer" : mode === "skin" ? "Skin Triage" : "Lab Result",
            facilityName: analyzed.laboratory,
            doctorName: analyzed.primarySpecialty,
            reportDate: analyzed.reportDate,
            status: analyzed.urgency,
            summary: analyzed.onePageSummaryBn.slice(0, 400),
            findings: analyzed.parameters,
          },
        },
        {
          organizationId,
          channel: "lab_analyzer",
          defaultHospitalName: analyzed.laboratory,
        }
      );

      // Persist encrypted file bytes if authenticated user + DB active
      if (uploadedBuffer && session?.id && process.env.DATABASE_URL) {
        try {
          await withDbTimeout(
            prisma.medicalDocument.create({
              data: {
                ownerId: session.id,
                organizationId,
                kind: "report",
                originalName: uploadedName || "lab-report",
                mimeType: uploadedMime || "image/jpeg",
                provider: "Oxpecker-Lab-Analyzer",
                category: mode,
                analysis: encryptDocumentBytes(Buffer.from(analyzed.onePageSummaryBn, "utf8")).toString("base64"),
                image: encryptDocumentBytes(uploadedBuffer),
                consentAt: new Date(),
              },
            }),
            1500
          );
        } catch {}
      }
    }

    dispatchTenantWebhook(organizationId, "report.analyzed", {
      reportId: analyzed.id,
      urgency: analyzed.urgency,
      primarySpecialty: analyzed.primarySpecialty,
      parameterCount: analyzed.parameters.length,
    });

    logReportAudit({
      actorId: session?.id || "guest-or-demo",
      actorRole: session?.role || "patient",
      organizationId,
      action: "REPORT_ANALYZED",
      targetId: analyzed.id,
    });

    const allReports = listAnalyzedReports({ organizationId: "ALL" });
    return NextResponse.json({
      success: true,
      report: analyzed,
      trends: computeParameterTrends(allReports),
      usage: quota.workspace.usage,
      plan: quota.plan,
    });
  } catch (error: any) {
    console.error("[Reports Analyze API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze medical report." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");
    const reportId = String(body.reportId || "");
    const session = await getSessionUser(request);

    if (action === "doctor_verify") {
      const existing = getAnalyzedReportsStore().find((r) => r.id === reportId);
      if (!existing) {
        return NextResponse.json({ error: "Report not found." }, { status: 404 });
      }
      const isAuthorizedClinician =
        session && ["doctor", "hospital", "admin"].includes(String(session.role));
      const isSeededDemo = reportId.startsWith("rep-demo-") || Boolean(body.demoVerification);

      if (!isAuthorizedClinician && !isSeededDemo) {
        return NextResponse.json(
          { error: "Doctor or clinic clinician authentication required to verify clinical summaries." },
          { status: 403 }
        );
      }

      const updated = verifyReportByDoctor(reportId, {
        doctorName: body.doctorName || session?.name || "Prof. Dr. Ahmed Rahman (MBBS, FCPS)",
        bmdcRegNo: body.bmdcRegNo || "BMDC-A-41892",
        noteBn: String(body.noteBn || "রিপোর্টটি পর্যালোচনা ও যাচাই করা হয়েছে।"),
        correctedSummaryBn: body.correctedSummaryBn ? String(body.correctedSummaryBn) : undefined,
      });

      logReportAudit({
        actorId: session?.id || "demo-clinician",
        actorRole: session?.role || "doctor",
        organizationId: existing.organizationId,
        action: "DOCTOR_VERIFIED_REPORT",
        targetId: reportId,
      });

      return NextResponse.json({ success: true, report: updated });
    }

    if (action === "create_share_link") {
      const ttlHours = Math.min(168, Math.max(1, Number(body.ttlHours || 24)));
      const link = createExpiringShareLink(reportId, ttlHours);
      if (!link) {
        return NextResponse.json({ error: "Report not found." }, { status: 404 });
      }
      logReportAudit({
        actorId: session?.id || "patient",
        actorRole: session?.role || "patient",
        organizationId: session?.organizationId || "org-default",
        action: "REPORT_SHARE_LINK_CREATED",
        targetId: reportId,
      });
      return NextResponse.json({
        success: true,
        ...link,
        shareUrl: `/reports?shareToken=${encodeURIComponent(link.token)}`,
      });
    }

    if (action === "export_data") {
      const report = getAnalyzedReportsStore().find((r) => r.id === reportId);
      if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
      return NextResponse.json({
        success: true,
        exportedAt: new Date().toISOString(),
        report,
      });
    }

    if (action === "delete_report") {
      const deleted = deleteAnalyzedReport(reportId);
      if (!deleted) return NextResponse.json({ error: "Report not found." }, { status: 404 });
      logReportAudit({
        actorId: session?.id || "patient",
        actorRole: session?.role || "patient",
        organizationId: session?.organizationId || "org-default",
        action: "REPORT_DELETED_ON_REQUEST",
        targetId: reportId,
      });
      return NextResponse.json({ success: true, deletedId: reportId });
    }

    return NextResponse.json({ error: "Unsupported report action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update report." }, { status: 500 });
  }
}
