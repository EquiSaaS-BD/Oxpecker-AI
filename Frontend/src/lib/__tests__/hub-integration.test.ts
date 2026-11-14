import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  computeBmiAndCategory,
  getPatient360Timeline,
  normalizeBdPhone,
  parseCsvToRows,
  recordUnifiedClinicalPayload,
  resolveOrUpsertUnifiedPatient,
} from "../patient-hub";
import {
  checkIdempotencyKey,
  generateTenantApiKey,
  recordSyncLog,
  revokeTenantApiKey,
  verifyIntegrationRequest,
} from "../integration-auth";
import { isRouteAuthorizedForRole, PUBLIC_ROUTES } from "../rbac";

async function runHubIntegrationTests() {
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

  await test("BMI Engine: classifies Underweight, Normal, Overweight, Obese & invalid inputs", () => {
    assert.equal(computeBmiAndCategory(170, 50).category, "Underweight");
    const norm = computeBmiAndCategory(170, 70);
    assert.equal(norm.bmi, 24.2);
    assert.equal(norm.category, "Normal");
    assert.equal(computeBmiAndCategory(170, 80).category, "Overweight");
    assert.equal(computeBmiAndCategory(165, 92).category, "Obese");
    assert.equal(computeBmiAndCategory(0, 70).bmi, null);
    assert.equal(computeBmiAndCategory(null, 70).category, null);
  });

  await test("BD Phone Normalizer: canonicalizes +880, 880, 10-digit, and 01x formats", () => {
    assert.equal(normalizeBdPhone("+880 1711-000000"), "01711000000");
    assert.equal(normalizeBdPhone("8801711000000"), "01711000000");
    assert.equal(normalizeBdPhone("1711000000"), "01711000000");
    assert.equal(normalizeBdPhone("01711000000"), "01711000000");
  });

  await test("MPI Deduplication: matches existing citizen by normalized phone & NID without duplication", async () => {
    const uniquePhone = "01899887766";
    const uniqueNid = "1991269554499";

    const first = await resolveOrUpsertUnifiedPatient(
      {
        name: "Sadia Afrin",
        phone: `+880 ${uniquePhone.slice(1)}`,
        nidNumber: uniqueNid,
        heightCm: 162,
        weightKg: 58,
        allergies: ["Dust Mites"],
      },
      "org-clinic-alpha"
    );
    assert.equal(first.matchedExisting, false);
    assert.equal(first.matchStrategy, "created_new");
    assert.equal(first.patient.bmi, 22.1);

    const byPhone = await resolveOrUpsertUnifiedPatient(
      {
        name: "Sadia Afrin",
        phone: uniquePhone,
        chronicConditions: ["Mild Asthma"],
      },
      "org-clinic-beta"
    );
    assert.equal(byPhone.matchedExisting, true);
    assert.equal(byPhone.matchStrategy, "phone");
    assert.equal(byPhone.patient.id, first.patient.id);
    assert.ok(byPhone.patient.allergies.includes("Dust Mites"));
    assert.ok(byPhone.patient.chronicConditions.includes("Mild Asthma"));

    const byNid = await resolveOrUpsertUnifiedPatient(
      {
        name: "Sadia Afrin",
        nidNumber: uniqueNid,
        weightKg: 60,
      },
      "org-clinic-gamma"
    );
    assert.equal(byNid.matchedExisting, true);
    assert.equal(byNid.matchStrategy, "nid");
    assert.equal(byNid.patient.id, first.patient.id);
    assert.equal(byNid.patient.weightKg, 60);
  });

  await test("Patient 360 Aggregation & HL7 FHIR R4 Bundle: unifies multi-hospital visits, Rx & labs", async () => {
    const targetPhone = "01955443322";
    await recordUnifiedClinicalPayload(
      {
        patient: {
          name: "Tariqul Islam",
          phone: targetPhone,
          gender: "Male",
          bloodGroup: "B+",
          heightCm: 175,
          weightKg: 74,
        },
        appointment: {
          doctorName: "Prof. Dr. Ahmed Rahman",
          specialty: "Cardiology",
          hospitalName: "City Care Specialized Clinic",
          date: "2026-11-12",
          time: "11:00 AM",
          source: "widget",
        },
        prescription: {
          doctorName: "Prof. Dr. Ahmed Rahman",
          hospitalName: "City Care Specialized Clinic",
          diagnosis: "Stage 1 Hypertension",
          medicines: [
            { brand_name: "Amlodipine 5mg", generic_name: "Amlodipine", dosage: "1+0+0" },
          ],
        },
        labReport: {
          name: "12-Lead ECG & Lipid Panel",
          facilityName: "Popular Diagnostic Center",
          doctorName: "Dr. Mahbubul Alam",
          summary: "Normal sinus rhythm; Total cholesterol 192 mg/dL",
        },
        vitals: {
          bloodPressure: "130/84 mmHg",
          spo2: "98%",
        },
      },
      { organizationId: "org-city-care", channel: "widget" }
    );

    const timelineData = await getPatient360Timeline({ phone: `+880${targetPhone.slice(1)}` });
    assert.equal(timelineData.patient.name, "Tariqul Islam");
    assert.equal(timelineData.patient.bmiCategory, "Normal");
    assert.ok(timelineData.appointments.length >= 1);
    assert.ok(timelineData.prescriptions.length >= 1);
    assert.ok(timelineData.labReports.length >= 1);
    assert.ok(timelineData.timeline.length >= 3);
    assert.ok(timelineData.participatingHospitals.includes("City Care Specialized Clinic"));
    assert.ok(timelineData.consultingDoctors.some((d) => d.name === "Prof. Dr. Ahmed Rahman"));
    assert.equal(timelineData.fhirBundle.resourceType, "Bundle");
    assert.ok(Array.isArray(timelineData.fhirBundle.entry) && timelineData.fhirBundle.entry.length >= 2);
  });

  await test("Tenant API Key Auth, 401 Rejection & Idempotency Deduplication", async () => {
    const { rawKey, record } = await generateTenantApiKey("org-test-clinic", "CI Integration Key");
    assert.ok(rawKey.startsWith("oxp_live_"));

    const validReq = new NextRequest("http://localhost:3000/api/integrations/v1/sync", {
      headers: { "x-oxpecker-api-key": rawKey },
    });
    const okAuth = await verifyIntegrationRequest(validReq);
    assert.equal(okAuth.valid, true);
    assert.equal(okAuth.organizationId, "org-test-clinic");
    assert.equal(okAuth.authType, "api_key");

    const badReq = new NextRequest("http://localhost:3000/api/integrations/v1/sync", {
      headers: { "x-oxpecker-api-key": "oxp_live_invalid_token_999" },
    });
    const badAuth = await verifyIntegrationRequest(badReq);
    assert.equal(badAuth.valid, false);
    assert.equal(badAuth.errorResponse?.status, 401);

    await revokeTenantApiKey(record.id, "org-test-clinic");
    const revokedAuth = await verifyIntegrationRequest(validReq);
    assert.equal(revokedAuth.valid, false);
    assert.equal(revokedAuth.errorResponse?.status, 401);

    const idemKey = `ci-idem-${Date.now()}`;
    await recordSyncLog({
      organizationId: "org-test-clinic",
      direction: "inbound",
      channel: "rest_api",
      entityType: "Patient+Appointment",
      idempotencyKey: idemKey,
      status: "success",
      recordsProcessed: 1,
      payload: { test: true },
    });
    const cached = await checkIdempotencyKey(idemKey);
    assert.ok(cached !== null);
    assert.equal(cached?.idempotencyKey, idemKey);
  });

  await test("CSV Bulk Parser: decodes quoted commas and normalizes flexible headers", () => {
    const csv = `Patient Name,Mobile,"Blood Group",Height Cm,Weight Kg,Medicines\n"Karim, Md.","+880 1711-998877",O+,172,75,"Napa 500;Seclo 20"`;
    const rows = parseCsvToRows(csv);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].patient_name, "Karim, Md.");
    assert.equal(rows[0].mobile, "+880 1711-998877");
    assert.equal(rows[0].blood_group, "O+");
    assert.equal(rows[0].height_cm, "172");
    assert.equal(rows[0].weight_kg, "75");
  });

  await test("RBAC Public Route: /embed widget route is publicly accessible across roles", () => {
    assert.ok(PUBLIC_ROUTES.includes("/embed"));
    assert.equal(isRouteAuthorizedForRole("/embed/book/city-care", "patient"), true);
    assert.equal(isRouteAuthorizedForRole("/embed/book/city-care", "hospital"), true);
  });

  console.log(`\nHub Integration Suite: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runHubIntegrationTests();
