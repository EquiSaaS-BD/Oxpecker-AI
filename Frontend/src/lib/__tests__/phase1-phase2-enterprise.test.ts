import assert from "node:assert/strict";
import {
  findAccountByEmail,
  registerNewAccount,
  verifyPasswordHash,
} from "../auth-registry";
import {
  createAssistantInvite,
  derive12DigitAssistantCode,
  getAssistantPairingState,
  hydratePairingStore,
  isValid12DigitCode,
} from "../doctor-assistant-link";
import {
  addClinicalCareNote,
  addOrRestockInventoryItem,
  createDiagnosticOrder,
  getClinicalCareNotes,
  getDiagnosticCatalog,
  getHospitalInventoryItems,
  runHospitalAiReportScan,
  saveDiagnosticReport,
  updateDiagnosticOrderStatus,
  verifyAndSignDiagnosticReport,
} from "../hospital-diagnostics";
import { DEFAULT_HOSPITAL_THEME, getHospitalThemeConfig } from "../hospital-hms";
import { MANDATORY_BENGALI_DISCLAIMER } from "../ai-safety-guard";

async function runPhase1And2Tests() {
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

  await test("Auth Registry: fast registration hashes password with scrypt & verifies cleanly", async () => {
    const email = `enterprise.doc.${Date.now()}@oxpecker.test`;
    const res = await registerNewAccount({
      name: "Dr. Tariqul Islam",
      email,
      password: "StrongPassword#2026",
      role: "doctor",
      phone: "+8801711223344",
      specialty: "Cardiology",
      bmdcRegNo: "BMDC-A-99102",
    });

    assert.equal(res.success, true);
    assert.equal(res.status, 201);
    assert.equal(res.user?.email, email.toLowerCase());
    assert.equal((res.user as any)?.passwordHash, undefined);

    const lookup = await findAccountByEmail(email.toUpperCase());
    assert.equal(lookup.exists, true);
    assert.ok(lookup.user?.passwordHash?.startsWith("scrypt:"));
    assert.equal(verifyPasswordHash("StrongPassword#2026", lookup.user!.passwordHash!), true);
    assert.equal(verifyPasswordHash("WrongPassword", lookup.user!.passwordHash!), false);
  });

  await test("Auth Registry: strict 1-email-1-account blocks duplicates across case & roles (409 Conflict)", async () => {
    const uniqueEmail = `SingleAccount.${Date.now()}@Clinic.BD`;
    const first = await registerNewAccount({
      name: "Clinic Owner",
      email: uniqueEmail,
      password: "ClinicPassword#2026",
      role: "hospital",
      hospitalName: "Dhaka Diagnostic & Medical",
    });
    assert.equal(first.success, true);
    assert.equal(first.status, 201);
    assert.ok(first.user?.organizationId.startsWith("org-"));

    // Attempt second signup with different casing & different role
    const duplicate = await registerNewAccount({
      name: "Duplicate Patient",
      email: uniqueEmail.toLowerCase(),
      password: "AnotherPassword#2026",
      role: "patient",
    });
    assert.equal(duplicate.success, false);
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.code, "EMAIL_ALREADY_EXISTS");

    // Attempt signup using seeded demo account email
    const seededDup = await registerNewAccount({
      name: "Fake Doctor",
      email: "DOCTOR@OXPECKER.AI",
      password: "SomePassword#2026",
      role: "doctor",
    });
    assert.equal(seededDup.success, false);
    assert.equal(seededDup.status, 409);
    assert.equal(seededDup.code, "EMAIL_ALREADY_EXISTS");
  });

  await test("Auth Registry: assistant signup auto-provisions deterministic 12-digit code", async () => {
    const email = `ast.auto.${Date.now()}@oxpecker.test`;
    const res = await registerNewAccount({
      name: "Front Desk Assistant",
      email,
      password: "AssistantPass#2026",
      role: "assistant",
    });
    assert.equal(res.success, true);
    assert.equal(isValid12DigitCode(res.user?.assistantId), true);
  });

  await test("Doctor-Assistant Pairing: hydratePairingStore restores persistent links & queues", () => {
    const astCode = derive12DigitAssistantCode("hydrated.assistant@oxpecker.ai");
    const created = createAssistantInvite({
      doctorId: "doc-hydrate-01",
      doctorName: "Prof. Dr. Hydration Test",
      doctorEmail: "hydrate@oxpecker.ai",
      assistantId: astCode,
      assistantEmail: "hydrated.assistant@oxpecker.ai",
    });
    assert.equal(created.success, true);

    hydratePairingStore([
      {
        ...created.invite!,
        status: "accepted",
        updatedAt: new Date(Date.now() + 5000).toISOString(),
      },
    ]);

    const state = getAssistantPairingState({ assistantId: astCode });
    assert.equal(state.connectedDoctor?.doctorId, "doc-hydrate-01");
  });

  await test("Diagnostic Center LIS: order creation, barcode accession, specimen lifecycle", () => {
    const catalog = getDiagnosticCatalog();
    assert.ok(catalog.length >= 15);

    const order = createDiagnosticOrder({
      patientName: "Karim Hossain",
      patientAge: 48,
      patientGender: "Male",
      patientPhone: "+8801712345678",
      smartCardUid: "HP-2026-8841",
      priority: "STAT",
      source: "Emergency",
      tests: [
        { code: "TST-CBC", name: "Complete Blood Count", department: "Hematology", specimen: "EDTA", price: 450 },
        { code: "TST-TROP", name: "Cardiac Troponin I", department: "Cardiology", specimen: "Serum", price: 1800 },
      ],
      discountAmount: 250,
      paidAmount: 2000,
      paymentMethod: "bKash",
    });

    assert.ok(order.accessionId.startsWith("ACC-"));
    assert.equal(order.totalAmount, 2250);
    assert.equal(order.paymentStatus, "Paid");
    assert.equal(order.status, "Ordered");

    const collected = updateDiagnosticOrderStatus(order.id, "Sample Collected", { collectorName: "Phlebotomist Rafiq" });
    assert.equal(collected?.status, "Sample Collected");
    assert.ok(collected?.collectedAt);

    const verified = updateDiagnosticOrderStatus(order.id, "Verified & Published");
    assert.equal(verified?.status, "Verified & Published");
  });

  await test("Hospital AI Report Scanner & Digital Sign-Off: critical detection, Bengali safety & print theme", () => {
    const scan = runHospitalAiReportScan({
      patientName: "Al Amin Sheikh",
      patientAge: 54,
      patientGender: "Male",
      smartCardUid: "HP-2026-4419",
      testTitle: "Cardiac Troponin I + Metabolic Check",
      department: "Cardiology",
      structuredParameters: [
        { name: "Cardiac Troponin I", value: 185, unit: "ng/L", refRange: "< 14" },
        { name: "HbA1c", value: 8.4, unit: "%", refRange: "4.0 - 5.6" },
      ],
    });

    assert.equal(scan.isCritical, true);
    assert.equal(scan.report.status, "Critical Alert");
    assert.ok(scan.report.bengaliSummary?.includes(MANDATORY_BENGALI_DISCLAIMER));

    saveDiagnosticReport(scan.report);

    const signed = verifyAndSignDiagnosticReport(
      scan.report.id,
      { name: "Prof. Dr. Selina Akter", degrees: "MBBS, FCPS", bmdc: "BMDC-A-21904" },
      true
    );
    assert.equal(signed?.publishedToHealthPass, true);
    assert.ok(signed?.qrHash?.startsWith("OX-SHA256-"));

    // Verify theme & inventory & clinical care notes helpers
    const theme = getHospitalThemeConfig();
    assert.equal(theme.hospital_name, DEFAULT_HOSPITAL_THEME.hospital_name);
    assert.ok(theme.signatory_bmdc);

    const invAfter = addOrRestockInventoryItem({
      name: "Troponin I Rapid Cartridge",
      category: "Lab Reagent & Kit",
      stockCount: 80,
      capacityCount: 100,
    });
    assert.ok(invAfter.some((i) => i.name === "Troponin I Rapid Cartridge"));
    assert.ok(getHospitalInventoryItems().length >= 6);

    addClinicalCareNote({
      admissionId: "ADM-1031",
      patientName: "Shahidul Islam",
      noteType: "Vitals",
      priority: "Routine",
      summary: "BP 130/80, SpO2 98% on room air",
      recordedBy: "RN Tania",
    });
    assert.ok(getClinicalCareNotes("ADM-1031").length >= 1);
  });

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runPhase1And2Tests();
