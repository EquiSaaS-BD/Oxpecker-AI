import assert from "node:assert/strict";
import {
  checkRedFlagOverride,
  getFlaggedAiOutputs,
  MANDATORY_BENGALI_DISCLAIMER,
  validateAndSanitizeAiOutput,
} from "../ai-safety-guard";
import {
  analyzeLabReport,
  analyzeRadiologyReportText,
  BUILT_IN_SAMPLE_LAB_REPORT_TEXT,
  computeParameterTrends,
  createExpiringShareLink,
  estimateEgfrNote,
  evaluateLabParameter,
  extractLabParametersFromText,
  formatSkinGuidanceResult,
  normalizeBengaliDigits,
  resolveExpiringShareLink,
  saveAnalyzedReport,
  verifyReportByDoctor,
} from "../lab-report-engine";
import {
  checkAndRecordOrgUsage,
  createSpecialistLead,
  getOrgAnalytics,
  initiateSaaSCheckout,
} from "../saas-platform";
import { isRouteAuthorizedForRole, PUBLIC_ROUTES } from "../rbac";

async function runNeurapexSaasTests() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`✅ PASS: ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`❌ FAIL: ${name} -> ${err?.message || err}`);
    }
  }

  await test("Reference Engine: gender-aware Hb & eGFR note & unit variants", () => {
    const hbMale = evaluateLabParameter({ name: "Hemoglobin", value: 12.6, unit: "g/dL" }, { gender: "male", age: 35 });
    const hbFemale = evaluateLabParameter({ name: "Hemoglobin", value: 12.6, unit: "g/dL" }, { gender: "female", age: 35 });
    assert.equal(hbMale?.flag, "কম");
    assert.equal(hbFemale?.flag, "স্বাভাবিক");

    const fbsMmol = evaluateLabParameter({ name: "FBS", value: 7.4, unit: "mmol/L" }, { gender: "male", age: 40 });
    assert.equal(fbsMmol?.flag, "বেশি");

    const creat = evaluateLabParameter({ name: "Serum Creatinine", value: 1.9, unit: "mg/dL" }, { gender: "male", age: 52 });
    assert.equal(creat?.flag, "বেশি");
    assert.ok(creat?.clinicalNoteBn?.includes("eGFR"));

    const egfr = estimateEgfrNote(1.9, 52, "male");
    assert.ok(egfr && egfr.egfr < 60);
  });

  await test("Reference Engine: printed lab reference range overrides built-in catalog", () => {
    const custom = evaluateLabParameter(
      { name: "HbA1c", value: 5.9, unit: "%", printedReferenceRange: "4.0 - 6.0" },
      { gender: "male", age: 40 }
    );
    assert.equal(custom?.rangeSource, "lab_printed");
    assert.equal(custom?.flag, "স্বাভাবিক");

    const builtin = evaluateLabParameter(
      { name: "HbA1c", value: 5.9, unit: "%" },
      { gender: "male", age: 40 }
    );
    assert.equal(builtin?.rangeSource, "builtin_standard");
    assert.equal(builtin?.flag, "বেশি");
  });

  await test("Extraction Parser: decodes Bengali digits, messy units & comma-formatted numbers", () => {
    assert.equal(normalizeBengaliDigits("১১.৪ g/dL ও ১,৫০,০০০"), "11.4 g/dL ও 1,50,000");

    const messyOcr = `
      Hemoglobin (Hb): ১১.৪ gm/dl (13.5 - 17.5)
      Total WBC Count: 8.5 x10^9/L
      Platelet Count: ১,৫৫,০০০ /cmm (150000 - 450000)
      HbA1c: ৭.৪ %
      Vitamin D: 18 ng/mL
      Urine Albumin: +
    `;
    const extracted = extractLabParametersFromText(messyOcr);
    assert.equal(extracted.length, 6);

    const wbcEval = evaluateLabParameter(extracted.find((x) => x.name.includes("WBC"))!);
    assert.equal(wbcEval?.value, 8500);
    assert.equal(wbcEval?.flag, "স্বাভাবিক");
  });

  await test("Safety Guardrails: red-flag override + diagnostic phrase sanitization & audit logging", () => {
    const redPanic = checkRedFlagOverride({
      symptoms: ["বুকে ব্যথা"],
      parameters: [{ code: "hb", value: 5.8, unit: "g/dL" }],
    });
    assert.equal(redPanic.isEmergency, true);
    assert.equal(redPanic.callNumber, "999");

    const unsafe = "আপনার ডায়াবেটিস হয়েছে। আমাদের সিস্টেমের 99.4% accuracy রয়েছে।";
    const result = validateAndSanitizeAiOutput(unsafe, "test_safety_unit");
    assert.equal(result.flagged, true);
    assert.ok(result.violations.length >= 2);
    assert.ok(!result.sanitizedText.includes("আপনার ডায়াবেটিস হয়েছে"));
    assert.ok(!result.sanitizedText.includes("99.4%"));
    assert.ok(result.sanitizedText.includes(MANDATORY_BENGALI_DISCLAIMER));

    const logged = getFlaggedAiOutputs();
    assert.ok(logged.some((l) => l.sourceModule === "test_safety_unit"));
  });

  await test("Whole Report Analyzer + Doctor Review Loop + Trend Chart + Expiring Share Link", () => {
    const rep = analyzeLabReport({
      rawText: BUILT_IN_SAMPLE_LAB_REPORT_TEXT,
      patientAge: 38,
      patientGender: "male",
      consentRecorded: true,
    });
    assert.ok(rep.parameters.length >= 10);
    assert.equal(rep.urgency, "দ্রুত ডাক্তার দেখান");
    assert.ok(rep.recommendedSpecialties.length >= 2);
    assert.ok(rep.onePageSummaryBn.includes(MANDATORY_BENGALI_DISCLAIMER));

    saveAnalyzedReport(rep);
    const verified = verifyReportByDoctor(rep.id, {
      doctorName: "Prof. Dr. Tofail Ahmed",
      bmdcRegNo: "A-22190",
      noteBn: "HbA1c 7.4% — এন্ডোক্রাইনোলজি ফলোআপ নিশ্চিত করুন।",
      correctedSummaryBn: "সম্ভাব্য গ্লাইসেমিক ভারসাম্যহীনতা — ডাক্তারের সাথে মিলিয়ে দেখুন।",
    });
    assert.equal(verified?.doctorVerified, true);
    assert.equal(verified?.editHistory.length, 1);
    assert.ok(verified?.originalAiSummaryBn.includes("মোট"));

    const trends = computeParameterTrends([
      { ...rep, reportDate: "2026-08-01" },
      rep,
    ]);
    assert.ok(trends.some((t) => t.code === "hba1c" && t.points.length === 2));

    const link = createExpiringShareLink(rep.id, 24);
    assert.ok(link && link.token.startsWith("shr_"));
    const resolved = resolveExpiringShareLink(link!.token);
    assert.equal(resolved?.report.id, rep.id);
  });

  await test("Radiology Text & Skin Photo Guidance enforce safety & specialty routing", () => {
    const rad = analyzeRadiologyReportText({
      reportText: "CT Brain shows acute intracranial hemorrhage in left parietal region.",
    });
    assert.equal(rad.redFlag.isEmergency, true);
    assert.equal(rad.primarySpecialty, "Neurology");
    assert.ok(rad.onePageSummaryBn.includes("সরাসরি এক্স-রে বা এমআরআই ছবির ডায়াগনসিস নয়"));

    const skin = formatSkinGuidanceResult({
      visionAnalysisText: "সম্ভাব্য অ্যালার্জিক র‍্যাশ লক্ষ্য করা গেছে।",
      confidence: "low",
    });
    assert.equal(skin.primarySpecialty, "Dermatology");
    assert.ok(skin.onePageSummaryBn.includes("আত্মবিশ্বাস কম"));
  });

  await test("SaaS Layer: tenant quota enforcement (429), consent-gated leads & bKash/Nagad sandbox upgrade", () => {
    // Reject lead without patient consent
    const rejectedLead = createSpecialistLead({
      doctorId: "doc-1",
      doctorName: "Dr. Rahman",
      specialty: "Endocrinology",
      patientName: "Karim",
      patientPhone: "+8801711000000",
      patientConsent: false,
    });
    assert.equal(rejectedLead.success, false);
    assert.equal(rejectedLead.status, 400);

    const acceptedLead = createSpecialistLead({
      doctorId: "doc-1",
      doctorName: "Dr. Rahman",
      specialty: "Endocrinology",
      patientName: "Karim",
      patientPhone: "+8801711000000",
      patientConsent: true,
    });
    assert.equal(acceptedLead.success, true);

    // Exhaust patient free plan quota (15/mo) and ensure 429 triggers
    const orgId = `org-quota-test-${Date.now()}`;
    const checkoutStart = initiateSaaSCheckout({
      organizationId: orgId,
      targetPlan: "free",
      provider: "bkash",
    });
    assert.equal(checkoutStart.providerMode, "sandbox_stub");

    for (let i = 0; i < 15; i++) {
      const ok = checkAndRecordOrgUsage(orgId, "reportsAnalyzed", 1);
      assert.equal(ok.allowed, true);
    }
    const overQuota = checkAndRecordOrgUsage(orgId, "reportsAnalyzed", 1);
    assert.equal(overQuota.allowed, false);
    assert.equal(overQuota.status, 429);

    // Upgrade via SSLCommerz sandbox resets capacity cleanly
    initiateSaaSCheckout({
      organizationId: orgId,
      targetPlan: "clinic_pro",
      provider: "sslcommerz",
    });
    const afterUpgrade = checkAndRecordOrgUsage(orgId, "reportsAnalyzed", 1);
    assert.equal(afterUpgrade.allowed, true);

    const analytics = getOrgAnalytics("org-default");
    assert.ok(analytics.totalReportsAnalyzed >= 3);
    assert.ok(PUBLIC_ROUTES.includes("/demo"));
    assert.equal(isRouteAuthorizedForRole("/demo", "patient"), true);
  });

  console.log(`\nNeurapex + B2B SaaS Suite: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runNeurapexSaasTests();
