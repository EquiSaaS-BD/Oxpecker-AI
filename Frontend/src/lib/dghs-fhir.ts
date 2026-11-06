/**
 * DGHS Shared Health Record (SHR) & HL7 FHIR Interoperability Module
 * Reference: https://en.info.shr.dghs.gov.bd/technical-support/medication-api/
 */

import { getDGHSWHOATC } from "./dghs-atc-data";

export interface FHIRMedicationStatementInput {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientGender?: "male" | "female" | "other";
  patientDob?: string;
  medicines: Array<{
    id: string | number;
    brand_name: string;
    generic_name: string;
    strength?: string;
    dosage_form?: string;
    dosage_instructions?: string; // e.g. "1+0+1" or "1 tablet daily after food"
    duration_days?: number;
  }>;
}

export interface FHIRBundle {
  resourceType: "Bundle";
  id: string;
  meta: {
    lastUpdated: string;
    profile: string[];
  };
  type: "collection";
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

/**
 * Generate a standard DGHS SHR HL7 FHIR Bundle containing Patient and MedicationStatement resources.
 */
export function generateDGHSFHIRBundle(input: FHIRMedicationStatementInput): FHIRBundle {
  const timestamp = new Date().toISOString();
  const bundleId = `oxpecker-dghs-bundle-${Date.now()}`;
  const patientFullUrl = `urn:uuid:patient-${input.patientId}`;

  const entries: FHIRBundle["entry"] = [];

  // 1. Patient Resource
  entries.push({
    fullUrl: patientFullUrl,
    resource: {
      resourceType: "Patient",
      id: input.patientId,
      meta: {
        profile: ["https://shr.dghs.gov.bd/fhir/StructureDefinition/dghs-patient"],
      },
      identifier: [
        {
          system: "https://shr.dghs.gov.bd/patients/health-id",
          value: input.patientId,
        },
      ],
      name: [
        {
          use: "official",
          text: input.patientName,
        },
      ],
      gender: input.patientGender || "other",
      birthDate: input.patientDob || "1990-01-01",
      telecom: input.patientPhone ? [
        {
          system: "phone",
          value: input.patientPhone,
          use: "mobile",
        },
      ] : undefined,
    },
  });

  // 2. MedicationStatement Resources
  for (let idx = 0; idx < input.medicines.length; idx++) {
    const med = input.medicines[idx];
    const atc = getDGHSWHOATC(med.generic_name);
    const medId = `med-statement-${med.id}-${idx}`;

    entries.push({
      fullUrl: `urn:uuid:${medId}`,
      resource: {
        resourceType: "MedicationStatement",
        id: medId,
        meta: {
          profile: ["https://shr.dghs.gov.bd/fhir/StructureDefinition/dghs-medication-statement"],
        },
        status: "active",
        medicationCodeableConcept: {
          coding: atc ? [
            {
              system: "http://www.whocc.no/atc",
              code: atc.atcCode,
              display: atc.atcDescription,
            },
            {
              system: "https://shr.dghs.gov.bd/concepts/medications",
              code: atc.dghsConceptId,
              display: `${med.brand_name} (${med.generic_name})`,
            }
          ] : [
            {
              system: "https://dgda.gov.bd/medicines",
              code: String(med.id),
              display: `${med.brand_name} (${med.generic_name})`,
            }
          ],
          text: `${med.brand_name} ${med.strength || ""} (${med.generic_name}) - ${med.dosage_form || "Tablet"}`,
        },
        subject: {
          reference: patientFullUrl,
          display: input.patientName,
        },
        effectiveDateTime: timestamp,
        dosage: [
          {
            text: med.dosage_instructions || "As directed by physician",
            route: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: (med.dosage_form || "").toLowerCase().includes("inject") ? "47625008" : "260548002",
                  display: (med.dosage_form || "").toLowerCase().includes("inject") ? "Intravenous" : "Oral route",
                },
              ],
            },
          },
        ],
      },
    });
  }

  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      lastUpdated: timestamp,
      profile: ["https://shr.dghs.gov.bd/fhir/StructureDefinition/dghs-ehr-bundle"],
    },
    type: "collection",
    entry: entries,
  };
}
