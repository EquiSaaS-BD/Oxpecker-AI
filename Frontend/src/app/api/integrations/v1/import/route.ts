import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordSyncLog, verifyIntegrationRequest } from "@/lib/integration-auth";
import {
  parseCsvToRows,
  recordUnifiedClinicalPayload,
  type UnifiedClinicalSyncPayload,
} from "@/lib/patient-hub";

export const dynamic = "force-dynamic";

function pickField(row: Record<string, any>, aliases: string[]): string | undefined {
  for (const key of aliases) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return undefined;
}

function mapFlexibleRowToPayload(
  row: Record<string, any>,
  defaultHospitalName?: string
): UnifiedClinicalSyncPayload | null {
  const name = pickField(row, ["name", "full_name", "patient_name", "patient"]);
  const phone = pickField(row, ["phone", "mobile", "contact", "phone_number", "patient_phone"]);
  const nidNumber = pickField(row, ["nid", "nid_number", "national_id"]);
  const mrn = pickField(row, ["mrn", "uhid", "patient_id", "card_number"]);
  if (!name && !phone && !nidNumber && !mrn) return null;

  const heightRaw = pickField(row, ["height_cm", "height"]);
  const weightRaw = pickField(row, ["weight_kg", "weight"]);
  const ageRaw = pickField(row, ["age", "patient_age"]);

  const allergiesRaw = pickField(row, ["allergies", "known_allergies"]);
  const conditionsRaw = pickField(row, ["chronic_conditions", "conditions", "chronic_diseases"]);
  const diagnosis = pickField(row, ["diagnosis", "disease", "assessment", "chief_complaint"]);
  const doctorName = pickField(row, ["doctor_name", "doctor", "physician", "consultant"]);
  const specialty = pickField(row, ["specialty", "department", "dept"]);
  const hospitalName = pickField(row, ["hospital_name", "clinic", "facility", "hospital"]) || defaultHospitalName;
  const visitDate = pickField(row, ["visit_date", "date", "appointment_date"]);
  const medicinesRaw = pickField(row, ["medicines", "rx", "medications"]);
  const labTest = pickField(row, ["lab_test", "report_name", "test_name"]);
  const labResult = pickField(row, ["lab_result", "findings", "report_summary"]);

  const bp = pickField(row, ["bp", "blood_pressure"]);
  const spo2 = pickField(row, ["spo2", "oxygen"]);
  const glucose = pickField(row, ["blood_glucose", "glucose", "rbs", "fbs"]);

  const parsedMedicines = Array.isArray(row.medicines)
    ? row.medicines
    : medicinesRaw
      ? medicinesRaw.split(/[;|]/).map((m) => ({
          brand_name: m.trim(),
          generic_name: m.trim(),
          dosage: "As directed",
          duration: "5 days",
        }))
      : [];

  return {
    patient: {
      name: name || "Clinic Patient",
      phone,
      email: pickField(row, ["email", "patient_email"]),
      nidNumber,
      mrn,
      age: ageRaw ? parseInt(ageRaw, 10) || null : null,
      gender: pickField(row, ["gender", "sex"]),
      bloodGroup: pickField(row, ["blood_group", "blood"]),
      dateOfBirth: pickField(row, ["dob", "date_of_birth"]),
      heightCm: heightRaw ? parseFloat(heightRaw) || null : null,
      weightKg: weightRaw ? parseFloat(weightRaw) || null : null,
      allergies: allergiesRaw ? allergiesRaw.split(/[;|]/).map((s) => s.trim()).filter(Boolean) : [],
      chronicConditions: conditionsRaw ? conditionsRaw.split(/[;|]/).map((s) => s.trim()).filter(Boolean) : [],
      vitalsSnapshot:
        bp || spo2 || glucose
          ? { bloodPressure: bp, spo2, bloodGlucose: glucose }
          : undefined,
    },
    appointment: visitDate || doctorName
      ? {
          doctorName: doctorName || "Consultant Physician",
          specialty: specialty || "General Medicine",
          hospitalName: hospitalName || "Partner Clinic",
          date: visitDate || new Date().toISOString().slice(0, 10),
          time: pickField(row, ["visit_time", "time"]) || "10:30 AM",
          source: "csv_import",
          status: "completed",
          notes: diagnosis || "Imported clinic consultation",
        }
      : null,
    prescription:
      diagnosis || parsedMedicines.length > 0
        ? {
            doctorName: doctorName || "Attending Physician",
            hospitalName: hospitalName || "Partner Clinic",
            diagnosis: diagnosis || "Clinical Follow-Up",
            date: visitDate || new Date().toISOString().slice(0, 10),
            medicines: parsedMedicines,
          }
        : null,
    labReport: labTest
      ? {
          name: labTest,
          type: "Lab Result",
          facilityName: hospitalName || "Diagnostic Lab",
          doctorName: doctorName || "Pathologist",
          reportDate: visitDate || new Date().toISOString().slice(0, 10),
          summary: labResult || "Verified lab report",
          status: "Verified",
        }
      : null,
  };
}

function mapFhirBundleToPayloads(bundle: any, defaultHospitalName?: string): UnifiedClinicalSyncPayload[] {
  const entries = Array.isArray(bundle?.entry) ? bundle.entry : [];
  const patientRes = entries.find((e: any) => e?.resource?.resourceType === "Patient")?.resource;
  if (!patientRes) return [];

  const meds = entries
    .filter((e: any) => e?.resource?.resourceType === "MedicationStatement")
    .map((e: any) => ({
      brand_name: e.resource?.medicationCodeableConcept?.text || "Prescribed Medicine",
      generic_name: e.resource?.medicationCodeableConcept?.coding?.[0]?.display || "Generic",
      dosage: e.resource?.dosage?.[0]?.text || "As directed",
    }));

  return [
    {
      patient: {
        mrn: patientRes.identifier?.[0]?.value || patientRes.id,
        name: patientRes.name?.[0]?.text || "FHIR Citizen",
        gender: patientRes.gender || undefined,
        dateOfBirth: patientRes.birthDate || undefined,
        phone: patientRes.telecom?.find((t: any) => t.system === "phone")?.value,
      },
      prescription:
        meds.length > 0
          ? {
              doctorName: "FHIR Imported Physician",
              hospitalName: defaultHospitalName || "DGHS SHR Network",
              diagnosis: "HL7 FHIR R4 Imported Regimen",
              medicines: meds,
            }
          : null,
    },
  ];
}

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, "integrations-import", 60, 60_000);
  if (rateLimited) return rateLimited;

  const auth = await verifyIntegrationRequest(request);
  if (!auth.valid) return auth.errorResponse!;

  try {
    const body = await request.json();
    const format = String(body.format || (body.csvText ? "csv" : body.fhirBundle ? "fhir" : "json")).toLowerCase();
    const defaultHospitalName = body.defaultHospitalName ? String(body.defaultHospitalName) : undefined;

    let payloads: UnifiedClinicalSyncPayload[] = [];
    if (format === "csv" && typeof body.csvText === "string") {
      const parsedRows = parseCsvToRows(body.csvText);
      payloads = parsedRows
        .map((r) => mapFlexibleRowToPayload(r, defaultHospitalName))
        .filter((p): p is UnifiedClinicalSyncPayload => p !== null);
    } else if (format === "fhir" && body.fhirBundle) {
      payloads = mapFhirBundleToPayloads(body.fhirBundle, defaultHospitalName);
    } else if (Array.isArray(body.rows)) {
      payloads = body.rows
        .map((r: any) => (r.patient ? (r as UnifiedClinicalSyncPayload) : mapFlexibleRowToPayload(r, defaultHospitalName)))
        .filter((p: UnifiedClinicalSyncPayload | null): p is UnifiedClinicalSyncPayload => p !== null);
    }

    if (payloads.length === 0) {
      return NextResponse.json(
        { error: "No valid patient records found in import payload." },
        { status: 400 }
      );
    }

    let mergedExistingCount = 0;
    let newlyCreatedCount = 0;
    let prescriptionsCreated = 0;
    let reportsCreated = 0;
    let appointmentsCreated = 0;
    const samplePatients: any[] = [];

    for (const item of payloads.slice(0, 500)) {
      const res = await recordUnifiedClinicalPayload(item, {
        organizationId: auth.organizationId,
        organizationSlug: auth.organizationSlug,
        channel: format === "fhir" ? "fhir_import" : "csv_import",
        defaultHospitalName,
      });
      if (res.matchedExisting) mergedExistingCount++;
      else newlyCreatedCount++;
      if (res.prescriptionId) prescriptionsCreated++;
      if (res.labReportId) reportsCreated++;
      if (res.appointmentId) appointmentsCreated++;
      if (samplePatients.length < 10) {
        samplePatients.push({
          name: item.patient.name,
          mrn: res.mrn,
          phone: item.patient.phone,
          heightCm: item.patient.heightCm,
          weightKg: item.patient.weightKg,
          matchStrategy: res.matchStrategy,
        });
      }
    }

    await recordSyncLog({
      organizationId: auth.organizationId,
      direction: "inbound",
      channel: format === "fhir" ? "fhir_import" : "csv_import",
      entityType: "BulkImport",
      externalRefId: `${format.toUpperCase()}-${payloads.length}`,
      status: "success",
      recordsProcessed: payloads.length,
      payload: { mergedExistingCount, newlyCreatedCount, prescriptionsCreated, reportsCreated },
    });

    return NextResponse.json({
      success: true,
      organizationId: auth.organizationId,
      importedCount: payloads.length,
      mergedExistingCount,
      newlyCreatedCount,
      prescriptionsCreated,
      reportsCreated,
      appointmentsCreated,
      samplePatients,
    });
  } catch (error: any) {
    console.error("[Integrations Import API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to import clinic dataset." },
      { status: 500 }
    );
  }
}
