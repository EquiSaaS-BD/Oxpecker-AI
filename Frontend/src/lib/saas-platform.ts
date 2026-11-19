import { getFlaggedAiOutputs } from "@/lib/ai-safety-guard";
import { listAnalyzedReports } from "@/lib/lab-report-engine";

export type SaasPlanId = "free" | "clinic_starter" | "clinic_pro" | "lab_enterprise";
export type PaymentProviderId = "bkash" | "nagad" | "sslcommerz";
export type LeadStatus = "new" | "contacted" | "booked";

export interface SaasPlanConfig {
  id: SaasPlanId;
  name: string;
  nameBn: string;
  monthlyPriceBdt: number;
  monthlyReportQuota: number;
  seatQuota: number;
  apiCallQuota: number;
  features: string[];
}

export const SAAS_PLANS: Record<SaasPlanId, SaasPlanConfig> = {
  free: {
    id: "free",
    name: "Patient Free",
    nameBn: "রোগীদের জন্য ফ্রি প্ল্যান",
    monthlyPriceBdt: 0,
    monthlyReportQuota: 15,
    seatQuota: 1,
    apiCallQuota: 100,
    features: ["Personal Health ID Timeline", "Bengali AI Lab Explainer", "Doctor Directory Routing"],
  },
  clinic_starter: {
    id: "clinic_starter",
    name: "Clinic Starter",
    nameBn: "ক্লিনিক স্টার্টার",
    monthlyPriceBdt: 2999,
    monthlyReportQuota: 250,
    seatQuota: 5,
    apiCallQuota: 2000,
    features: ["Patient Consent Report Upload", "Branded Clinic PDF", "Featured Directory Listing", "2-Line Website Booking Widget"],
  },
  clinic_pro: {
    id: "clinic_pro",
    name: "Clinic Pro",
    nameBn: "ক্লিনিক প্রো",
    monthlyPriceBdt: 7999,
    monthlyReportQuota: 1500,
    seatQuota: 25,
    apiCallQuota: 15000,
    features: ["Doctor Review Loop Queue", "Lead Routing & Analytics", "Webhook Events (report.analyzed, lead.created)", "MPI Cross-Branch Sync"],
  },
  lab_enterprise: {
    id: "lab_enterprise",
    name: "Lab / Enterprise",
    nameBn: "ডায়াগনস্টিক ল্যাব ও হাসপাতাল এন্টারপ্রাইজ",
    monthlyPriceBdt: 24999,
    monthlyReportQuota: 25000,
    seatQuota: 200,
    apiCallQuota: 250000,
    features: ["Dedicated Tenant API Keys", "HL7 FHIR R4 Bulk Pipeline", "Custom DGHS HFR Compliance Audit", "Priority SLA"],
  },
};

export interface OrgWorkspaceState {
  organizationId: string;
  name: string;
  type: "clinic" | "lab" | "hospital" | "solo_doctor";
  planId: SaasPlanId;
  brandColor: string;
  brandLogoText: string;
  usage: {
    reportsAnalyzed: number;
    seatsUsed: number;
    apiCallsUsed: number;
  };
  billingStatus: "active" | "sandbox_upgraded";
  lastTransaction?: {
    provider: PaymentProviderId;
    mode: "live" | "sandbox_stub";
    transactionRef: string;
    amountBdt: number;
    timestamp: string;
  } | null;
}

export interface SpecialistLead {
  id: string;
  organizationId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientPhone?: string;
  reportId?: string;
  notes?: string;
  patientConsent: boolean;
  consentTimestamp: string;
  status: LeadStatus;
  createdAt: string;
}

export interface WebhookDispatchRecord {
  id: string;
  organizationId: string;
  eventType: "report.analyzed" | "lead.created";
  status: "delivered" | "queued_sandbox";
  payload: Record<string, any>;
  createdAt: string;
}

export interface DoctorVerificationCandidate {
  id: string;
  name: string;
  specialty: string;
  bmdcRegNo: string;
  hospital: string;
  status: "pending" | "verified" | "rejected";
}

interface SaasMemoryStore {
  workspaces: Record<string, OrgWorkspaceState>;
  leads: SpecialistLead[];
  webhooks: WebhookDispatchRecord[];
  doctorApprovals: DoctorVerificationCandidate[];
}

const g = globalThis as typeof globalThis & { __oxpeckerSaasStore?: SaasMemoryStore };

function getSaasStore(): SaasMemoryStore {
  if (!g.__oxpeckerSaasStore) {
    g.__oxpeckerSaasStore = {
      workspaces: {
        "org-default": {
          organizationId: "org-default",
          name: "Oxpecker Flagship Medical & Diagnostic Hub",
          type: "clinic",
          planId: "clinic_pro",
          brandColor: "#0f766e",
          brandLogoText: "OXPECKER CARE",
          usage: {
            reportsAnalyzed: 3,
            seatsUsed: 4,
            apiCallsUsed: 28,
          },
          billingStatus: "active",
          lastTransaction: null,
        },
        "org-patient-free": {
          organizationId: "org-patient-free",
          name: "Personal Patient Workspace",
          type: "clinic",
          planId: "free",
          brandColor: "#0284c7",
          brandLogoText: "OXPECKER",
          usage: {
            reportsAnalyzed: 0,
            seatsUsed: 1,
            apiCallsUsed: 0,
          },
          billingStatus: "active",
          lastTransaction: null,
        },
      },
      leads: [
        {
          id: "lead-demo-01",
          organizationId: "org-default",
          doctorId: "doc-endo-1",
          doctorName: "Prof. Dr. Tofail Ahmed",
          specialty: "Endocrinology",
          patientName: "Rahim Uddin (Demo)",
          patientPhone: "+8801711000000",
          reportId: "rep-demo-003",
          notes: "HbA1c 7.4% & TSH 5.2 — requesting specialist consultation",
          patientConsent: true,
          consentTimestamp: new Date(Date.now() - 3600_000 * 6).toISOString(),
          status: "new",
          createdAt: new Date(Date.now() - 3600_000 * 6).toISOString(),
        },
      ],
      webhooks: [],
      doctorApprovals: [
        {
          id: "doc-verify-101",
          name: "Dr. Tasnim Tabassum",
          specialty: "Endocrinology",
          bmdcRegNo: "A-74219",
          hospital: "Dhaka Medical College Hospital",
          status: "pending",
        },
        {
          id: "doc-verify-102",
          name: "Dr. Ashraful Alam",
          specialty: "Cardiology",
          bmdcRegNo: "A-58912",
          hospital: "National Heart Foundation",
          status: "verified",
        },
      ],
    };
  }
  return g.__oxpeckerSaasStore;
}

export function getOrgWorkspaceState(organizationId = "org-default"): OrgWorkspaceState {
  const store = getSaasStore();
  if (!store.workspaces[organizationId]) {
    store.workspaces[organizationId] = {
      organizationId,
      name: `Partner Clinic (${organizationId})`,
      type: "clinic",
      planId: "clinic_starter",
      brandColor: "#0f766e",
      brandLogoText: organizationId.toUpperCase(),
      usage: { reportsAnalyzed: 0, seatsUsed: 1, apiCallsUsed: 0 },
      billingStatus: "active",
      lastTransaction: null,
    };
  }
  return store.workspaces[organizationId];
}

export function checkAndRecordOrgUsage(
  organizationId: string,
  metric: "reportsAnalyzed" | "apiCallsUsed" | "seatsUsed",
  increment = 1
): {
  allowed: boolean;
  status: number;
  error?: string;
  workspace: OrgWorkspaceState;
  plan: SaasPlanConfig;
} {
  const ws = getOrgWorkspaceState(organizationId);
  const plan = SAAS_PLANS[ws.planId] || SAAS_PLANS.free;
  const limit =
    metric === "reportsAnalyzed"
      ? plan.monthlyReportQuota
      : metric === "seatsUsed"
        ? plan.seatQuota
        : plan.apiCallQuota;

  if (ws.usage[metric] + increment > limit) {
    return {
      allowed: false,
      status: 429,
      error: `Monthly ${metric} quota (${limit}) exceeded for plan "${plan.name}". Upgrade workspace plan to continue.`,
      workspace: ws,
      plan,
    };
  }

  ws.usage[metric] += increment;
  return { allowed: true, status: 200, workspace: ws, plan };
}

export function initiateSaaSCheckout(input: {
  organizationId: string;
  targetPlan: SaasPlanId;
  provider: PaymentProviderId;
}): {
  success: boolean;
  providerMode: "live" | "sandbox_stub";
  transactionRef: string;
  workspace: OrgWorkspaceState;
  messageBn: string;
} {
  const plan = SAAS_PLANS[input.targetPlan];
  const ws = getOrgWorkspaceState(input.organizationId);

  const hasLiveCredentials =
    (input.provider === "bkash" && Boolean(process.env.BKASH_APP_KEY)) ||
    (input.provider === "nagad" && Boolean(process.env.NAGAD_MERCHANT_ID)) ||
    (input.provider === "sslcommerz" && Boolean(process.env.SSLCOMMERZ_STORE_ID));

  const providerMode: "live" | "sandbox_stub" = hasLiveCredentials ? "live" : "sandbox_stub";
  const transactionRef = `${input.provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  ws.planId = plan.id;
  ws.billingStatus = providerMode === "live" ? "active" : "sandbox_upgraded";
  ws.lastTransaction = {
    provider: input.provider,
    mode: providerMode,
    transactionRef,
    amountBdt: plan.monthlyPriceBdt,
    timestamp: new Date().toISOString(),
  };

  return {
    success: true,
    providerMode,
    transactionRef,
    workspace: ws,
    messageBn: `${plan.name} প্ল্যানে উন্নীত হয়েছে (${input.provider.toUpperCase()} ${providerMode})।`,
  };
}

export function updateOrgBranding(
  organizationId: string,
  branding: { name?: string; brandColor?: string; brandLogoText?: string }
): OrgWorkspaceState {
  const ws = getOrgWorkspaceState(organizationId);
  if (branding.name?.trim()) ws.name = branding.name.trim();
  if (branding.brandColor?.trim()) ws.brandColor = branding.brandColor.trim();
  if (branding.brandLogoText?.trim()) ws.brandLogoText = branding.brandLogoText.trim();
  return ws;
}

export function dispatchTenantWebhook(
  organizationId: string,
  eventType: "report.analyzed" | "lead.created",
  payload: Record<string, any>
): WebhookDispatchRecord {
  const store = getSaasStore();
  const record: WebhookDispatchRecord = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId,
    eventType,
    status: process.env.TENANT_WEBHOOK_LIVE_DISPATCH === "true" ? "delivered" : "queued_sandbox",
    payload,
    createdAt: new Date().toISOString(),
  };
  store.webhooks.unshift(record);
  if (store.webhooks.length > 100) store.webhooks.pop();
  return record;
}

export function createSpecialistLead(input: {
  organizationId?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientPhone?: string;
  reportId?: string;
  notes?: string;
  patientConsent: boolean;
}): { success: boolean; status: number; error?: string; lead?: SpecialistLead } {
  if (!input.patientConsent) {
    return {
      success: false,
      status: 400,
      error: "রোগীর সম্মতি (Patient consent) ছাড়া যোগাযোগের তথ্য শেয়ার করা যাবে না।",
    };
  }
  const organizationId = input.organizationId || "org-default";
  const lead: SpecialistLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId,
    doctorId: input.doctorId,
    doctorName: input.doctorName,
    specialty: input.specialty,
    patientName: input.patientName.trim() || "Patient",
    patientPhone: input.patientPhone?.trim() || undefined,
    reportId: input.reportId,
    notes: input.notes?.trim() || undefined,
    patientConsent: true,
    consentTimestamp: new Date().toISOString(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const store = getSaasStore();
  store.leads.unshift(lead);
  dispatchTenantWebhook(organizationId, "lead.created", {
    leadId: lead.id,
    specialty: lead.specialty,
    doctorName: lead.doctorName,
  });
  return { success: true, status: 201, lead };
}

export function listOrgLeads(organizationId?: string): SpecialistLead[] {
  const store = getSaasStore();
  if (!organizationId || organizationId === "ALL") return [...store.leads];
  return store.leads.filter((l) => l.organizationId === organizationId);
}

export function updateLeadStatus(leadId: string, status: LeadStatus): SpecialistLead | null {
  const store = getSaasStore();
  const lead = store.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.status = status;
  return lead;
}

export function getOrgAnalytics(organizationId = "org-default") {
  const reports = listAnalyzedReports({ organizationId });
  const leads = listOrgLeads(organizationId);
  const distribution = { normal: 0, low: 0, high: 0 };
  const specialtyCounts: Record<string, number> = {};

  for (const r of reports) {
    specialtyCounts[r.primarySpecialty] = (specialtyCounts[r.primarySpecialty] || 0) + 1;
    for (const p of r.parameters) {
      if (p.flag === "স্বাভাবিক") distribution.normal++;
      else if (p.flag === "কম") distribution.low++;
      else if (p.flag === "বেশি") distribution.high++;
    }
  }

  const bookedCount = leads.filter((l) => l.status === "booked").length;
  const conversionRatePercent = leads.length > 0 ? Math.round((bookedCount / leads.length) * 100) : 0;

  return {
    totalReportsAnalyzed: reports.length,
    doctorVerifiedCount: reports.filter((r) => r.doctorVerified).length,
    abnormalDistribution: distribution,
    totalLeads: leads.length,
    bookedLeads: bookedCount,
    conversionRatePercent,
    topSpecialties: Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([specialty, count]) => ({ specialty, count })),
    webhooksDispatched: getSaasStore().webhooks.filter((w) => w.organizationId === organizationId).slice(0, 10),
  };
}

export function getSuperAdminSaasOverview() {
  const store = getSaasStore();
  return {
    organizations: Object.values(store.workspaces),
    flaggedAiOutputs: getFlaggedAiOutputs(),
    pendingDoctorApprovals: store.doctorApprovals,
    totalLeadsCount: store.leads.length,
    totalReportsCount: listAnalyzedReports({ organizationId: "ALL" }).length,
  };
}

export function approveDoctorCandidate(id: string, status: "verified" | "rejected") {
  const store = getSaasStore();
  const item = store.doctorApprovals.find((d) => d.id === id);
  if (!item) return null;
  item.status = status;
  return item;
}

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Oxpecker AI Healthcare Data Hub & Report Analyzer API",
    version: "2.0.0",
    description: "Deterministic lab report range verification, Bengali AI explainer, Health ID 360 sync, and B2B clinic SaaS endpoints.",
  },
  paths: {
    "/api/reports/analyze": {
      post: { summary: "Analyze lab report, radiology text, or skin guidance deterministically with safety guardrails" },
      get: { summary: "List reports & longitudinal test trends or resolve expiring 24h share token" },
      patch: { summary: "Doctor verification loop, expiring share link generation, export or deletion" },
    },
    "/api/saas/workspace": {
      get: { summary: "Fetch tenant plan, usage metering, analytics, leads, and OpenAPI schema (?openapi=1)" },
      post: { summary: "Create consent-gated specialist lead, upgrade plan (bKash/Nagad/SSLCommerz sandbox), or clinic upload" },
      patch: { summary: "Update lead pipeline status or approve doctor verification" },
    },
    "/api/integrations/v1/sync": {
      post: { summary: "Idempotent external EMR/widget clinical sync" },
    },
  },
};
