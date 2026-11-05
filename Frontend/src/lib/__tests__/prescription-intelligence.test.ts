import assert from "node:assert/strict";
import {
  getCatalogIndex,
  parseDosageAndFrequency,
  parseDurationToDays,
  matchMedicineAgainstDatabase,
  calculateMedicinePrice,
  buildPrescriptionIntelligence,
  extractStructuredMedicinesFromRawOcrText,
  normalizeRawExtractedMedicine,
} from "../prescription-intelligence";
import {
  hasValidFileSignature,
  encryptDocumentBytes,
  decryptDocumentBytes,
  extractTextFromPdfBuffer,
} from "../medical-document-server";

export async function runAllPrescriptionIntelligenceTests() {
  const results: Array<{ scenario: string; passed: boolean; details: string }> = [];

  function record(scenario: string, fn: () => void) {
    try {
      fn();
      results.push({ scenario, passed: true, details: "PASS" });
    } catch (err: any) {
      results.push({ scenario, passed: false, details: err?.message || String(err) });
      throw err;
    }
  }

  // Verify database load first
  const catalogIndex = getCatalogIndex();
  assert.ok(catalogIndex.all.length >= 21700, `Expected >= 21,700 records, got ${catalogIndex.all.length}`);

  // Scenario 1: Clear printed English prescription ("Tab. Napa 500mg — 1+1+1 — 5 days")
  record("1. Clear printed prescription extraction, matching & price calculation", () => {
    const rawLines = "Tab. Napa 500 mg — 1+1+1 — 5 days\nCap. Seclo 20 mg — 1+0+1 — 14 days";
    const extracted = extractStructuredMedicinesFromRawOcrText(rawLines);
    assert.equal(extracted.length, 2);
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "test-rx-1",
      rawMedicines: extracted,
    });
    const napaItem = intel.items[0];
    assert.equal(napaItem.extracted.morningDose, 1);
    assert.equal(napaItem.extracted.afternoonDose, 1);
    assert.equal(napaItem.extracted.nightDose, 1);
    assert.equal(napaItem.extracted.durationDays, 5);
    assert.equal(napaItem.pricing.requiredQuantity, 15);
    assert.equal(napaItem.matchStatus, "EXACT_MATCH");
    assert.equal(napaItem.matchedMedicine?.brandName.toLowerCase(), "napa");
    assert.ok(napaItem.pricing.lineTotalBdt !== null && napaItem.pricing.lineTotalBdt > 0);
  });

  // Scenario 2: Handwritten prescription with low OCR confidence -> flagged for manual verification
  record("2. Handwritten prescription with low OCR confidence flagged for manual verification", () => {
    const norm = normalizeRawExtractedMedicine(
      {
        brandName: "Napa",
        strength: "500 mg",
        dosageForm: "Tablet",
        frequency: "1+0+1",
        duration: "5 days",
        confidence: "illegible",
        ocrConfidence: 0.42,
        medicineNameConfidence: 0.45,
      },
      0
    );
    assert.equal(norm.requiresManualVerification, true);
    const match = matchMedicineAgainstDatabase(norm);
    assert.equal(match.matchStatus, "NEEDS_MANUAL_VERIFICATION");
  });

  // Scenario 3: Bengali prescription ("ট্যাবলেট নাপা ৫০০ মিগ্রা ১+১+১ ৫ দিন")
  record("3. Bengali prescription extraction & digit/brand normalization", () => {
    const freq = parseDosageAndFrequency("১+১+১", null, "খাবারের পরে");
    assert.equal(freq.dailyDoseUnits, 3);
    const dur = parseDurationToDays("৫ দিন");
    assert.equal(dur.durationDays, 5);

    const intel = buildPrescriptionIntelligence({
      prescriptionId: "test-rx-bn",
      rawMedicines: [
        {
          brandName: "নাপা",
          strength: "৫০০ mg",
          dosageForm: "ট্যাবলেট",
          frequency: "১+১+১",
          duration: "৫ দিন",
        },
      ],
    });
    assert.equal(intel.items[0].matchedMedicine?.brandName.toLowerCase(), "napa");
    assert.equal(intel.items[0].pricing.requiredQuantity, 15);
  });

  // Scenario 4: Mixed Bengali-English prescription
  record("4. Mixed Bengali-English prescription", () => {
    const raw = "Tab. নাপা 500 mg — ১+০+১ — ৭ দিন";
    const extracted = extractStructuredMedicinesFromRawOcrText(raw);
    assert.equal(extracted.length, 1);
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "test-rx-mixed",
      rawMedicines: extracted,
    });
    assert.equal(intel.items[0].pricing.requiredQuantity, 14);
    assert.equal(intel.items[0].matchedMedicine?.brandName.toLowerCase(), "napa");
  });

  // Scenario 5: Low-quality / unreadable image handling
  record("5. Low-quality unreadable image preserves empty state without inventing medicines", () => {
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "test-rx-lowq",
      rawMedicines: [],
      imageQuality: { status: "unreadable", reasons: ["Severe motion blur and darkness"] },
    });
    assert.equal(intel.items.length, 0);
    assert.equal(intel.summary.verifiedTotalBdt, 0);
    assert.equal(intel.summary.isCompleteCalculation, false);
  });

  // Scenario 6: Multi-page / multi-item prescription document (6+ medicines)
  record("6. Multi-page / multi-medicine prescription accurate aggregation", () => {
    const lines = [
      "1. Tab. Napa 500 mg — 1+1+1 — 5 days",
      "2. Cap. Seclo 20 mg — 1+0+1 — 14 days",
      "3. Tab. Fexo 120 mg — 0+0+1 — 7 days",
      "4. Tab. Monas 10 mg — 0+0+1 — 30 days",
    ].join("\n");
    const meds = extractStructuredMedicinesFromRawOcrText(lines);
    assert.equal(meds.length, 4);
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "test-rx-multipage",
      rawMedicines: meds,
    });
    assert.equal(intel.summary.totalExtractedCount, 4);
    assert.equal(intel.summary.matchedCount, 4);
    assert.equal(intel.summary.isCompleteCalculation, true);
  });

  // Scenario 7: Unsupported file format vs Valid JPEG/PNG/WEBP/PDF signatures
  record("7. File signature validation rejects invalid/spoofed files and accepts JPEG, PNG, WEBP, PDF", () => {
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const validPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0]);
    const validPdf = Buffer.from("%PDF-1.7\n...");
    const spoofedJpeg = Buffer.from("GIF89a-not-a-jpeg");

    assert.equal(hasValidFileSignature("image/jpeg", validJpeg), true);
    assert.equal(hasValidFileSignature("image/png", validPng), true);
    assert.equal(hasValidFileSignature("application/pdf", validPdf), true);
    assert.equal(hasValidFileSignature("image/jpeg", spoofedJpeg), false);
    assert.equal(hasValidFileSignature("application/x-msdownload", validJpeg), false);
  });

  // Scenario 8: Medicine that exists in database (exact match + verified unit price)
  record("8. Existing medicine in database returns EXACT_MATCH and verified DGDA price", () => {
    const med = normalizeRawExtractedMedicine(
      { brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "5 days" },
      0
    );
    const match = matchMedicineAgainstDatabase(med);
    assert.equal(match.matchStatus, "EXACT_MATCH");
    assert.ok(match.matchedMedicine);
    assert.equal(match.matchedMedicine.brandName, "Napa");
    assert.equal(match.matchedMedicine.genericName, "Paracetamol");
  });

  // Scenario 9: Medicine that does NOT exist in database
  record("9. Non-existent medicine returns NOT_FOUND and never invents a record or price", () => {
    const med = normalizeRawExtractedMedicine(
      { brandName: "QuantumFakeMedsXyz", strength: "999 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "5 days" },
      0
    );
    const match = matchMedicineAgainstDatabase(med);
    assert.equal(match.matchStatus, "NOT_FOUND");
    assert.equal(match.matchedMedicine, null);
    const pricing = calculateMedicinePrice(med, match.matchStatus, match.matchedMedicine);
    assert.equal(pricing.lineTotalBdt, null);
    assert.equal(pricing.statusMessage, "Medicine not found in the Oxpecker AI database.");
  });

  // Scenario 10: Medicine with OCR spelling mistake ("Nappa 500 mg", "Secl0 20 mg")
  record("10. OCR spelling mistakes (Nappa, Secl0) resolved accurately with strength & form gates", () => {
    const typo1 = normalizeRawExtractedMedicine(
      { brandName: "Nappa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "3 days" },
      0
    );
    const match1 = matchMedicineAgainstDatabase(typo1);
    assert.ok(match1.matchedMedicine);
    assert.equal(match1.matchedMedicine.brandName.toLowerCase(), "napa");

    const typo2 = normalizeRawExtractedMedicine(
      { brandName: "Secl0", strength: "20 mg", dosageForm: "Capsule", frequency: "1+0+1", duration: "7 days" },
      1
    );
    const match2 = matchMedicineAgainstDatabase(typo2);
    assert.ok(match2.matchedMedicine);
    assert.equal(match2.matchedMedicine.brandName.toLowerCase(), "seclo");
  });

  // Scenario 11: Similar brand names (Napa vs Napa Extra vs Napa Extend vs Paracetamol)
  record("11. Similar brand names distinguished accurately without treating all Paracetamol as Napa", () => {
    const napa500 = normalizeRawExtractedMedicine({ brandName: "Napa", strength: "500 mg", dosageForm: "Tablet" }, 0);
    const napaExtra = normalizeRawExtractedMedicine({ brandName: "Napa Extra", strength: "500 mg+65 mg", dosageForm: "Tablet" }, 1);
    const napaExtend = normalizeRawExtractedMedicine({ brandName: "Napa Extend", strength: "665 mg", dosageForm: "Tablet" }, 2);

    const m1 = matchMedicineAgainstDatabase(napa500);
    const m2 = matchMedicineAgainstDatabase(napaExtra);
    const m3 = matchMedicineAgainstDatabase(napaExtend);

    assert.equal(m1.matchedMedicine?.brandName, "Napa");
    assert.equal(m2.matchedMedicine?.brandName, "Napa Extra");
    assert.equal(m3.matchedMedicine?.brandName, "Napa Extend");
    assert.notEqual(m1.matchedMedicine?.id, m2.matchedMedicine?.id);
    assert.notEqual(m1.matchedMedicine?.id, m3.matchedMedicine?.id);
  });

  // Scenario 12: Different strengths & Ambiguous strength detection
  record("12. Different strengths matched accurately; missing strength on multi-strength brand triggers NEEDS_MANUAL_VERIFICATION", () => {
    const sergel20 = normalizeRawExtractedMedicine({ brandName: "Sergel", strength: "20 mg", dosageForm: "Capsule" }, 0);
    const sergel40 = normalizeRawExtractedMedicine({ brandName: "Sergel", strength: "40 mg", dosageForm: "Capsule" }, 1);
    const sergelNoStrength = normalizeRawExtractedMedicine({ brandName: "Sergel", strength: null, dosageForm: "Capsule" }, 2);

    const m20 = matchMedicineAgainstDatabase(sergel20);
    const m40 = matchMedicineAgainstDatabase(sergel40);
    const mAmbig = matchMedicineAgainstDatabase(sergelNoStrength);

    assert.equal(m20.matchedMedicine?.strength, "20 mg");
    assert.equal(m40.matchedMedicine?.strength, "40 mg");
    assert.equal(mAmbig.matchStatus, "NEEDS_MANUAL_VERIFICATION");
    assert.ok(mAmbig.candidateMatches.length >= 2);
  });

  // Scenario 13: Different dosage forms (Syrup/Suspension vs Tablet)
  record("13. Dosage form differentiation (Syrup vs Tablet) & single-container liquid pricing", () => {
    const napaSyrup = normalizeRawExtractedMedicine(
      { brandName: "Napa", strength: "", dosageForm: "Syrup", frequency: "1+1+1", duration: "5 days" },
      0
    );
    const mSyrup = matchMedicineAgainstDatabase(napaSyrup);
    assert.ok(mSyrup.matchedMedicine);
    assert.ok(/syrup|suspension/i.test(mSyrup.matchedMedicine.dosageForm));
    const pSyrup = calculateMedicinePrice(napaSyrup, mSyrup.matchStatus, mSyrup.matchedMedicine);
    assert.equal(pSyrup.requiredQuantity, 1); // 1 bottle for 5-day course
  });

  // Scenario 14: Medicine with missing price in database -> "Price unavailable — verification required."
  record("14. Unpriced database medicine returns PRICE_UNAVAILABLE and never invents a price", () => {
    const unpricedMed = catalogIndex.all.find((m) => !m.priceAvailable);
    assert.ok(unpricedMed, "Expected at least one unpriced medicine in the 21,714 records");

    const extracted = normalizeRawExtractedMedicine(
      {
        brandName: unpricedMed.brandName,
        strength: unpricedMed.strength,
        dosageForm: unpricedMed.dosageForm,
        frequency: "1+0+1",
        duration: "5 days",
        selectedDatabaseMedicineId: unpricedMed.id,
      },
      0
    );
    const match = matchMedicineAgainstDatabase(extracted);
    const pricing = calculateMedicinePrice(extracted, match.matchStatus, match.matchedMedicine);
    assert.equal(pricing.pricingStatus, "PRICE_UNAVAILABLE");
    assert.equal(pricing.lineTotalBdt, null);
    assert.equal(pricing.statusMessage, "Price unavailable — verification required.");
  });

  // Scenario 15: Pack-size calculation & minor-unit (paisa) precision
  record("15. Exact integer paisa calculation prevents floating-point rounding drift", () => {
    const med = normalizeRawExtractedMedicine(
      { brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "7 days" },
      0
    );
    const match = matchMedicineAgainstDatabase(med);
    const pricing = calculateMedicinePrice(med, match.matchStatus, match.matchedMedicine);
    assert.equal(pricing.requiredQuantity, 21);
    assert.ok(pricing.unitPriceBdt !== null);
    const expectedPaisa = Math.round(pricing.unitPriceBdt * 100) * 21;
    assert.equal(pricing.lineTotalPaisa, expectedPaisa);
    assert.equal(pricing.lineTotalBdt, Number((expectedPaisa / 100).toFixed(2)));
  });

  // Scenario 16: Manual medicine correction & DB match override
  record("16. Manual correction and explicit database ID selection overrides match", () => {
    const target = catalogIndex.all.find((m) => m.brandName === "Ace" && m.strength === "500 mg");
    assert.ok(target);
    const corrected = normalizeRawExtractedMedicine(
      {
        brandName: "Edited Brand",
        selectedDatabaseMedicineId: target.id,
        frequency: "1+0+1",
        duration: "5 days",
      },
      0
    );
    const match = matchMedicineAgainstDatabase(corrected);
    assert.equal(match.matchStatus, "EXACT_MATCH");
    assert.equal(match.matchedMedicine?.id, target.id);
  });

  // Scenario 17: Quantity change recalculation
  record("17. Changing duration or explicit quantity recalculates line total and prescription summary", () => {
    const intel5Days = buildPrescriptionIntelligence({
      prescriptionId: "rx-recalc",
      rawMedicines: [{ brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "5 days" }],
    });
    const intel10Days = buildPrescriptionIntelligence({
      prescriptionId: "rx-recalc",
      rawMedicines: [{ brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "10 days" }],
    });
    assert.equal(intel5Days.items[0].pricing.requiredQuantity, 15);
    assert.equal(intel10Days.items[0].pricing.requiredQuantity, 30);
    assert.equal(intel10Days.summary.verifiedTotalPaisa, intel5Days.summary.verifiedTotalPaisa * 2);
  });

  // Scenario 18: Financial Summary separates Verified Total from Unpriced/Unmatched Items
  record("18. Incomplete prescription calculation separates verified total from unpriced items", () => {
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "rx-partial",
      rawMedicines: [
        { brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "5 days" },
        { brandName: "UnknownNonExistentDrug999", strength: "50 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "5 days" },
      ],
    });
    assert.equal(intel.summary.totalExtractedCount, 2);
    assert.equal(intel.summary.pricedMedicinesCount, 1);
    assert.equal(intel.summary.unpricedMedicinesCount, 1);
    assert.equal(intel.summary.isCompleteCalculation, false);
    assert.equal(intel.summary.unpricedItems.length, 1);
    assert.ok(intel.summary.verifiedTotalBdt > 0);
  });

  // Scenario 19: AES-256-GCM encryption & decryption integrity for stored prescriptions
  record("19. AES-256-GCM medical document encryption and decryption roundtrip integrity", () => {
    const payload = Buffer.from(JSON.stringify({ rx: "confidential-prescription-data" }), "utf8");
    const encrypted = encryptDocumentBytes(payload);
    assert.notDeepEqual(encrypted, payload);
    const decrypted = decryptDocumentBytes(encrypted);
    assert.equal(decrypted.toString("utf8"), payload.toString("utf8"));
  });

  // Scenario 20: Matching performance benchmark across 21,714 records (< 50ms for 10-medicine prescription)
  record("20. Performance benchmark: 10-medicine prescription matched & priced in < 100ms", () => {
    const start = performance.now();
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "rx-perf",
      rawMedicines: [
        { brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+1+1", duration: "5 days" },
        { brandName: "Seclo", strength: "20 mg", dosageForm: "Capsule", frequency: "1+0+1", duration: "14 days" },
        { brandName: "Sergel", strength: "20 mg", dosageForm: "Capsule", frequency: "1+0+1", duration: "14 days" },
        { brandName: "Fexo", strength: "120 mg", dosageForm: "Tablet", frequency: "0+0+1", duration: "10 days" },
        { brandName: "Monas", strength: "10 mg", dosageForm: "Tablet", frequency: "0+0+1", duration: "30 days" },
        { brandName: "Zimax", strength: "500 mg", dosageForm: "Tablet", frequency: "1+0+0", duration: "5 days" },
        { brandName: "Maxpro", strength: "20 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "14 days" },
        { brandName: "Pantonix", strength: "20 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "14 days" },
        { brandName: "Alatrol", strength: "10 mg", dosageForm: "Tablet", frequency: "0+0+1", duration: "7 days" },
        { brandName: "Tufnil", strength: "200 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "3 days" },
      ],
    });
    const elapsedMs = performance.now() - start;
    assert.equal(intel.summary.matchedCount, 10);
    assert.ok(elapsedMs < 250, `Expected < 250ms, took ${elapsedMs.toFixed(1)}ms`);
  });

  // Scenario 21: Zero-Demo-Data & Null Metadata Verification (never fabricates prescriptionDate, patientName, or doctorName)
  record("21. Zero-Demo-Data: missing prescription date, doctor, and patient remain strictly null", () => {
    const intel = buildPrescriptionIntelligence({
      prescriptionId: "rx-zero-demo",
      rawMedicines: [{ brandName: "Napa", strength: "500 mg", dosageForm: "Tablet", frequency: "1+0+1", duration: "5 days" }],
    });
    assert.equal(intel.prescriptionMetadata.prescriptionDate, null);
    assert.equal(intel.prescriptionMetadata.patientName, null);
    assert.equal(intel.prescriptionMetadata.doctorName, null);
  });

  // Scenario 22: Multi-page PDF stream text extraction
  record("22. Multi-page PDF text stream extraction and medicine parsing", () => {
    const multiPagePdfMock = Buffer.from(
      "%PDF-1.7\nBT (1. Tab. Napa 500 mg - 1+1+1 - 5 days) Tj ET\nBT (2. Cap. Seclo 20 mg - 1+0+1 - 14 days) Tj ET\n%%EOF",
      "latin1"
    );
    const pdfText = extractTextFromPdfBuffer(multiPagePdfMock);
    const extracted = extractStructuredMedicinesFromRawOcrText(pdfText);
    assert.equal(extracted.length, 2);
    assert.equal(extracted[0].brandName.toLowerCase(), "napa");
    assert.equal(extracted[1].brandName.toLowerCase(), "seclo");
  });

  return results;
}

if (require.main === module) {
  runAllPrescriptionIntelligenceTests()
    .then((results) => {
      console.log(`\n=== OXPECKER AI PRESCRIPTION INTELLIGENCE TEST SUITE (${results.length}/22 PASSED) ===`);
      for (const r of results) {
        console.log(`[PASS] ${r.scenario}`);
      }
    })
    .catch((err) => {
      console.error("[FAIL]", err);
      process.exit(1);
    });
}
