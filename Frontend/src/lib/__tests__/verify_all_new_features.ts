/**
 * End-to-End Verification Test for Oxpecker AI New Competition Features
 */

import { getDGHSWHOATC, DGHS_WHO_ATC_MAPPING } from "../dghs-atc-data";
import { checkPrescriptionSafety } from "../clinical-safety";
import { generateDGHSFHIRBundle } from "../dghs-fhir";
import { calculatePrescriptionSavings } from "../prescription-savings";
import { encodeOfflineQRPayload, decodeOfflineQRPayload, OfflineEmergencyProfile } from "../healthpass-offline-qr";

export function runAllVerificationTests() {
  console.log("=================================================");
  console.log("   OXPECKER AI: COMPETITION FEATURES VERIFICATION ");
  console.log("=================================================\n");

  // TEST 1: WHO ATC & DGHS SHR MAPPING
  console.log("TEST 1: WHO ATC & DGHS Concept Mapping");
  const omeprazoleATC = getDGHSWHOATC("omeprazole");
  const paracetamolATC = getDGHSWHOATC("paracetamol");
  const ciproATC = getDGHSWHOATC("ciprofloxacin");

  console.log(" - Omeprazole ATC:", omeprazoleATC?.atcCode, "| Concept:", omeprazoleATC?.dghsConceptId);
  console.log(" - Paracetamol ATC:", paracetamolATC?.atcCode, "| Concept:", paracetamolATC?.dghsConceptId);
  console.log(" - Ciprofloxacin ATC:", ciproATC?.atcCode, "| Concept:", ciproATC?.dghsConceptId);

  if (omeprazoleATC?.atcCode !== "A02BC01" || paracetamolATC?.atcCode !== "N02BE01" || ciproATC?.atcCode !== "J01MA02") {
    throw new Error("ATC code lookup failed!");
  }
  console.log(" ✔ TEST 1 PASSED: WHO ATC mapping verified.\n");

  // TEST 2: CLINICAL DRUG-DRUG INTERACTION & DUPLICATE THERAPY
  console.log("TEST 2: Clinical DDI & Duplicate Therapy Safety");
  const sampleMeds = [
    { id: "1", generic_name: "ciprofloxacin", brand_name: "Ciprocin 500" },
    { id: "2", generic_name: "antacid", brand_name: "Entacyd Plus" },
    { id: "3", generic_name: "paracetamol", brand_name: "Napa 500" },
    { id: "4", generic_name: "paracetamol", brand_name: "Ace 500" } // Duplicate therapy!
  ];
  const safetyReport = checkPrescriptionSafety(sampleMeds, ["penicillin"]);
  console.log(" - Overall Risk:", safetyReport.overallRisk);
  console.log(" - Alerts count:", safetyReport.alerts.length);
  console.log(" - Duplicate count:", safetyReport.duplicateCount);
  safetyReport.alerts.forEach((a, i) => {
    console.log(`   ${i + 1}. [${a.severity}] ${a.headlineBn} (${a.headlineEn})`);
  });

  if (safetyReport.duplicateCount !== 1 || safetyReport.alerts.length < 2) {
    throw new Error("DDI / Duplicate therapy detection failed!");
  }
  console.log(" ✔ TEST 2 PASSED: DDI and Duplicate therapy alerts verified.\n");

  // TEST 3: DGHS HL7 FHIR EXPORT
  console.log("TEST 3: DGHS HL7 FHIR Bundle Exporter");
  const fhirBundle = generateDGHSFHIRBundle({
    patientId: "PAT-0091",
    patientName: "Md. Rafiqul Islam",
    patientPhone: "+8801712345678",
    patientGender: "male",
    patientDob: "1985-04-10",
    medicines: [
      { id: "101", brand_name: "Napa 500mg", generic_name: "paracetamol", dosage_instructions: "1+0+1 after food" },
      { id: "102", brand_name: "Seclo 20mg", generic_name: "omeprazole", dosage_instructions: "1+0+0 before food" }
    ]
  });
  console.log(" - FHIR Resource Type:", fhirBundle.resourceType);
  console.log(" - Bundle Entries:", fhirBundle.entry.length);
  console.log(" - First resource:", fhirBundle.entry[0].resource.resourceType);
  console.log(" - Medication 1 code:", fhirBundle.entry[1].resource.medicationCodeableConcept.coding[0].code);

  if (fhirBundle.entry.length !== 3 || fhirBundle.entry[1].resource.resourceType !== "MedicationStatement") {
    throw new Error("FHIR Bundle generation failed!");
  }
  console.log(" ✔ TEST 3 PASSED: DGHS HL7 FHIR Bundle verified.\n");

  // TEST 4: PRESCRIPTION SAVINGS & GENERIC SUBSTITUTION
  console.log("TEST 4: Prescription Cost Savings & Generic Substitution");
  const prescribedMeds = [
    { id: "1", brand_name: "Napa Extra", generic_name: "paracetamol", strength: "500 mg", unit_price_bdt: 3.50, quantity: 20 },
    { id: "2", brand_name: "Seclo 20", generic_name: "omeprazole", strength: "20 mg", unit_price_bdt: 7.00, quantity: 30 }
  ];
  const catalogCandidates = [
    { id: "10", brand_name: "Ace Extra", generic_name: "paracetamol", strength: "500 mg", unit_price_bdt: 2.50, manufacturer: "Square Pharmaceuticals PLC" },
    { id: "20", brand_name: "Proceptin 20", generic_name: "omeprazole", strength: "20 mg", unit_price_bdt: 5.00, manufacturer: "Beximco Pharmaceuticals Ltd." }
  ];
  const savingsReport = calculatePrescriptionSavings(prescribedMeds, catalogCandidates);
  console.log(" - Current Total:", savingsReport.currentTotalCostBdt, "BDT");
  console.log(" - Optimized Total:", savingsReport.optimizedTotalCostBdt, "BDT");
  console.log(" - Total Savings:", savingsReport.totalSavingsBdt, "BDT (", savingsReport.savingsPercentage, "% )");

  if (savingsReport.totalSavingsBdt <= 0 || savingsReport.items.length !== 2) {
    throw new Error("Savings engine calculation failed!");
  }
  console.log(" ✔ TEST 4 PASSED: Prescription savings engine verified.\n");

  // TEST 5: ZERO-INTERNET EMERGENCY QR ENCODING & DECODING
  console.log("TEST 5: Offline Emergency QR Protocol");
  const testProfile: OfflineEmergencyProfile = {
    version: 1,
    healthId: "HP-880-99887",
    fullName: "Kamal Hossain",
    bloodGroup: "AB+",
    emergencyContact: "+8801811223344",
    emergencyContactName: "Father",
    knownAllergies: ["Penicillin", "Aspirin"],
    chronicDiseases: ["Asthma", "Diabetes"],
    currentMedications: ["Salbutamol Inhaler", "Metformin 500mg"],
    organDonor: true
  };
  const qrUrl = encodeOfflineQRPayload(testProfile, "https://oxpecker.ai");
  console.log(" - Encoded QR URL:", qrUrl.substring(0, 85) + "...");
  const decodedProfile = decodeOfflineQRPayload(qrUrl);
  console.log(" - Decoded Name:", decodedProfile?.fullName);
  console.log(" - Decoded Blood Group:", decodedProfile?.bloodGroup);
  console.log(" - Decoded Allergies:", decodedProfile?.knownAllergies.join(", "));

  if (
    decodedProfile?.fullName !== testProfile.fullName ||
    decodedProfile?.bloodGroup !== testProfile.bloodGroup ||
    decodedProfile?.knownAllergies.length !== 2
  ) {
    throw new Error("Offline QR encode/decode mismatch!");
  }
  console.log(" ✔ TEST 5 PASSED: Offline QR protocol verified.\n");

  console.log("=================================================");
  console.log("   ALL 5 TESTS PASSED WITH 100% SUCCESS!         ");
  console.log("=================================================");
  return true;
}

// Self-run when executed directly
if (typeof require !== "undefined" && require.main === module) {
  runAllVerificationTests();
}
