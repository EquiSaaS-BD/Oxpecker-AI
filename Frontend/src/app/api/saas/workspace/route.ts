import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionUser } from "@/lib/server-auth";
import { recordUnifiedClinicalPayload } from "@/lib/patient-hub";
import {
  analyzeLabReport,
  listAnalyzedReports,
  saveAnalyzedReport,
  verifyReportByDoctor,
} from "@/lib/lab-report-engine";
import {
  approveDoctorCandidate,
  checkAndRecordOrgUsage,
  createSpecialistLead,
  getOrgAnalytics,
  getOrgWorkspaceState,
  getSuperAdminSaasOverview,
  initiateSaaSCheckout,
  listOrgLeads,
  OPENAPI_SPEC,
  SAAS_PLANS,
  updateLeadStatus,
  updateOrgBranding,
  type LeadStatus,
  type PaymentProviderId,
  type SaasPlanId,
} from "@/lib/saas-platform";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("openapi") === "1") {
    return NextResponse.json(OPENAPI_SPEC);
  }

  const session = await getSessionUser(request);
  const organizationId = searchParams.get("organizationId") || session?.organizationId || "org-default";

  const workspace = getOrgWorkspaceState(organizationId);
  const plan = SAAS_PLANS[workspace.planId];
  const analytics = getOrgAnalytics(organizationId);
  const leads = listOrgLeads(organizationId);
  const reviewQueue = listAnalyzedReports({ organizationId });
  const includeAdmin = session?.role === "admin" || searchParams.get("includeAdmin") === "1";

  return NextResponse.json({
    success: true,
    workspace,
    plan,
    plans: Object.values(SAAS_PLANS),
    analytics,
    leads,
    reviewQueue,
    superAdmin: includeAdmin ? getSuperAdminSaasOverview() : null,
  });
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "saas-workspace", 90, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const session = await getSessionUser(request);
    const organizationId = String(body.organizationId || session?.organizationId || "org-default");

    if (action === "create_lead") {
      const res = createSpecialistLead({
        organizationId,
        doctorId: String(body.doctorId || "doc-default"),
        doctorName: String(body.doctorName || "Specialist Doctor"),
        specialty: String(body.specialty || "General Medicine"),
        patientName: String(body.patientName || "Patient"),
        patientPhone: body.patientPhone ? String(body.patientPhone) : undefined,
        reportId: body.reportId ? String(body.reportId) : undefined,
        notes: body.notes ? String(body.notes) : undefined,
        patientConsent: Boolean(body.patientConsent),
      });
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: res.status });
      }
      return NextResponse.json({ success: true, lead: res.lead }, { status: 201 });
    }

    if (action === "upgrade_plan") {
      const targetPlan = String(body.targetPlan || "clinic_pro") as SaasPlanId;
      const provider = String(body.provider || "bkash") as PaymentProviderId;
      if (!SAAS_PLANS[targetPlan]) {
        return NextResponse.json({ error: "Invalid subscription plan." }, { status: 400 });
      }
      const checkout = initiateSaaSCheckout({ organizationId, targetPlan, provider });
      return NextResponse.json(checkout);
    }

    if (action === "update_branding") {
      const updated = updateOrgBranding(organizationId, {
        name: body.name,
        brandColor: body.brandColor,
        brandLogoText: body.brandLogoText,
      });
      return NextResponse.json({ success: true, workspace: updated });
    }

    if (action === "clinic_upload_report") {
      if (!body.patientConsent && !body.consentOtp) {
        return NextResponse.json(
          { error: "Patient consent or OTP authorization is required to upload a clinic report." },
          { status: 400 }
        );
      }

      const quota = checkAndRecordOrgUsage(organizationId, "reportsAnalyzed", 1);
      if (!quota.allowed) {
        return NextResponse.json({ error: quota.error }, { status: 429 });
      }

      const ws = quota.workspace;
      const analyzed = analyzeLabReport({
        rawText: String(body.rawText || ""),
        patientAge: body.patientAge ? Number(body.patientAge) : 38,
        patientGender: body.patientGender || "male",
        laboratory: ws.name,
        title: String(body.title || `${ws.name} Uploaded Report`),
        healthCardNumber: body.healthCardNumber ? String(body.healthCardNumber) : undefined,
        organizationId,
        consentRecorded: true,
      });
      saveAnalyzedReport(analyzed);

      if (body.patientPhone || body.patientName) {
        await recordUnifiedClinicalPayload(
          {
            patient: {
              mrn: body.healthCardNumber || undefined,
              name: String(body.patientName || "Clinic Patient"),
              phone: String(body.patientPhone || ""),
              age: body.patientAge ? Number(body.patientAge) : undefined,
              gender: body.patientGender || undefined,
            },
            labReport: {
              id: analyzed.id,
              name: analyzed.title,
              type: "Clinic Uploaded Lab Result",
              facilityName: ws.name,
              doctorName: analyzed.primarySpecialty,
              reportDate: analyzed.reportDate,
              status: analyzed.urgency,
              summary: analyzed.onePageSummaryBn.slice(0, 350),
              findings: analyzed.parameters,
            },
          },
          { organizationId, channel: "clinic_saas_portal", defaultHospitalName: ws.name }
        );
      }

      return NextResponse.json({
        success: true,
        report: analyzed,
        branding: { name: ws.name, brandColor: ws.brandColor, brandLogoText: ws.brandLogoText },
      });
    }

    return NextResponse.json({ error: "Unsupported workspace action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Workspace error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "update_lead_status") {
      const updated = updateLeadStatus(String(body.leadId || ""), String(body.status || "contacted") as LeadStatus);
      if (!updated) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      return NextResponse.json({ success: true, lead: updated });
    }

    if (action === "approve_doctor") {
      const updated = approveDoctorCandidate(
        String(body.candidateId || ""),
        body.status === "rejected" ? "rejected" : "verified"
      );
      if (!updated) return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
      return NextResponse.json({ success: true, candidate: updated });
    }

    if (action === "verify_queue_report") {
      const updated = verifyReportByDoctor(String(body.reportId || ""), {
        doctorName: String(body.doctorName || "Clinic Consultant"),
        bmdcRegNo: body.bmdcRegNo || "BMDC-Verified",
        noteBn: String(body.noteBn || "ক্লিনিক পোর্টাল থেকে ডাক্তার দ্বারা যাচাইকৃত।"),
      });
      if (!updated) return NextResponse.json({ error: "Report not found." }, { status: 404 });
      return NextResponse.json({ success: true, report: updated });
    }

    return NextResponse.json({ error: "Unsupported PATCH action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Workspace update failed." }, { status: 500 });
  }
}
