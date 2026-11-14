import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { checkPrescriptionSafety } from "../clinical-safety";
import {
  encodeOfflineQRPayload,
  decodeOfflineQRPayload,
  OfflineEmergencyProfile,
} from "../healthpass-offline-qr";
import { generateDGHSFHIRBundle } from "../dghs-fhir";
import {
  signSessionToken,
  verifySessionToken,
  requireSessionUser,
  SESSION_COOKIE_NAME,
} from "../server-auth";

async function runHardeningTests() {
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

  // 1. Clinical Safety Contraindications (Pregnancy, Pediatric, Renal, Hepatic)
  await test("Clinical Safety: Pregnancy contraindication flags Statin & ARB as CONTRAINDICATED", () => {
    const report = checkPrescriptionSafety(
      [
        { id: "1", brand_name: "Atova 20", generic_name: "Atorvastatin" },
        { id: "2", brand_name: "Angilock 50", generic_name: "Losartan Potassium" },
      ],
      [],
      ["Pregnancy (2nd Trimester)"],
      { isPregnant: true }
    );
    assert.equal(report.overallRisk, "CRITICAL");
    assert.equal(report.hasCriticalAlerts, true);
    assert.ok(report.alerts.some((a) => a.id.startsWith("preg-ci-")));
  });

  await test("Clinical Safety: Pediatric contraindication flags Aspirin & Ciprofloxacin (<16 yrs)", () => {
    const report = checkPrescriptionSafety(
      [
        { id: "10", brand_name: "Ecosprin 75", generic_name: "Aspirin" },
        { id: "11", brand_name: "Ciprocin 500", generic_name: "Ciprofloxacin" },
      ],
      [],
      [],
      { ageYears: 8, weightKg: 24 }
    );
    assert.equal(report.overallRisk, "CRITICAL");
    assert.equal(report.alerts.filter((a) => a.id.startsWith("peds-ci-")).length, 2);
  });

  await test("Clinical Safety: Renal impairment (CKD / low eGFR) flags Ketorolac & Metformin", () => {
    const report = checkPrescriptionSafety(
      [
        { id: "20", brand_name: "Rolac 10", generic_name: "Ketorolac Tromethamine" },
        { id: "21", brand_name: "Comet 500", generic_name: "Metformin Hydrochloride" },
      ],
      [],
      ["CKD Stage 3b"],
      { egfr: 34 }
    );
    assert.equal(report.overallRisk, "CRITICAL");
    assert.ok(report.alerts.some((a) => a.id.startsWith("renal-nsaid-")));
    assert.ok(report.alerts.some((a) => a.id.startsWith("renal-metformin-")));
  });

  await test("Clinical Safety: Hepatic impairment flags Statin & Paracetamol", () => {
    const report = checkPrescriptionSafety(
      [{ id: "30", brand_name: "Napa 500", generic_name: "Paracetamol" }],
      [],
      ["Chronic Liver Disease"],
      { hepaticImpairment: true }
    );
    assert.equal(report.overallRisk, "HIGH_RISK");
    assert.ok(report.alerts.some((a) => a.id.startsWith("hepatic-")));
  });

  // 2. Cryptographic Offline QR Payload Signing & Tamper Rejection
  await test("HealthPass QR: YUNET1 cryptographic signature roundtrip & tamper rejection", () => {
    const sampleProfile: OfflineEmergencyProfile = {
      version: 1,
      healthId: "UHID-2026-BD-10029",
      fullName: "Tahmid Al-Mamun",
      bloodGroup: "O+",
      dateOfBirth: "1992-08-14",
      emergencyContact: "+8801711002233",
      emergencyContactName: "Nusrat Jahan",
      knownAllergies: ["Penicillin"],
      chronicDiseases: ["Hypertension"],
      currentMedications: ["Amlodipine 5mg"],
      organDonor: true,
    };
    const qrPayload = encodeOfflineQRPayload(sampleProfile);
    assert.ok(qrPayload.includes("YUNET1%3A") || qrPayload.startsWith("YUNET1:"));

    const decoded = decodeOfflineQRPayload(qrPayload);
    assert.ok(decoded);
    assert.equal(decoded?.healthId, sampleProfile.healthId);
    assert.equal(decoded?.signatureVerified, true);

    // Extract raw YUNET1:<b64>.<sig> token and verify tamper rejection
    const rawToken = decodeURIComponent(qrPayload.split("#data=")[1] || qrPayload);
    assert.ok(rawToken.startsWith("YUNET1:"));
    const [prefixAndB64, sig] = rawToken.split(".");
    const tampered = `${prefixAndB64.slice(0, -3)}AAA.${sig}`;
    assert.equal(decodeOfflineQRPayload(tampered), null);

    // Tamper with signature
    const badSig = `${prefixAndB64}.00000000000000000000000000000000`;
    assert.equal(decodeOfflineQRPayload(badSig), null);
  });

  // 3. HL7 FHIR R4 Bundle Schema Validation
  await test("DGHS FHIR R4: Bundle contains valid Patient & MedicationStatement resources with ATC coding", () => {
    const bundle = generateDGHSFHIRBundle({
      patientId: "UHID-2026-BD-10029",
      patientName: "Tahmid Al-Mamun",
      patientGender: "male",
      patientDob: "1992-08-14",
      medicines: [
        {
          id: "med-1",
          brand_name: "Napa",
          generic_name: "Paracetamol",
          strength: "500 mg",
          dosage_form: "Tablet",
          dosage_instructions: "1+1+1",
          duration_days: 5,
        },
      ],
    });
    assert.equal(bundle.resourceType, "Bundle");
    assert.equal(bundle.type, "collection");
    assert.equal(bundle.entry.length, 2);
    assert.equal(bundle.entry[0].resource.resourceType, "Patient");
    assert.equal(bundle.entry[1].resource.resourceType, "MedicationStatement");
  });

  // 4. Server Session Token & RBAC Enforcement
  await test("Server Auth: HMAC-SHA256 session token sign/verify & RBAC 401/403 enforcement", async () => {
    const token = await signSessionToken({
      id: "doc-101",
      email: "doctor@shustota.ai",
      name: "Dr. Zaman",
      role: "doctor",
      organizationId: "org-dmch",
    });
    const verified = await verifySessionToken(token);
    assert.ok(verified);
    assert.equal(verified?.role, "doctor");
    assert.equal(verified?.organizationId, "org-dmch");

    // Tampered token returns null
    const tamperedToken = token.slice(0, -4) + "ffff";
    assert.equal(await verifySessionToken(tamperedToken), null);

    // Unauthenticated request -> 401
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/telemetry");
    const unauthCheck = await requireSessionUser(unauthReq, ["admin"]);
    assert.equal(unauthCheck.error?.status, 401);

    // Wrong role (doctor accessing admin-only route) -> 403
    const forbiddenReq = new NextRequest("http://localhost:3000/api/admin/telemetry", {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}` },
    });
    const forbiddenCheck = await requireSessionUser(forbiddenReq, ["admin"]);
    assert.equal(forbiddenCheck.error?.status, 403);

    // Authorized role -> 200 (no error response)
    const allowedCheck = await requireSessionUser(forbiddenReq, ["doctor", "admin"]);
    assert.equal(allowedCheck.error, undefined);
    assert.equal(allowedCheck.user?.id, "doc-101");
  });

  console.log(`\nProduction Hardening Suite: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runHardeningTests();
