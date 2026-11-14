import { prisma, withDbTimeout } from "@/lib/prisma";
import { INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import { generateDGHSFHIRBundle } from "@/lib/dghs-fhir";

export interface VitalsSnapshot {
  bloodPressure?: string;
  heartRate?: string;
  spo2?: string;
  bloodGlucose?: string;
  temperature?: string;
  respiratoryRate?: string;
  updatedAt?: string;
}

export interface UnifiedPatientInput {
  mrn?: string;
  externalId?: string;
  organizationSlug?: string;
  name: string;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  nidNumber?: string | null;
  bloodGroup?: string | null;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies?: string[];
  chronicConditions?: string[];
  vitalsSnapshot?: VitalsSnapshot;
}

export interface UnifiedAppointmentInput {
  id?: string;
  doctorId?: string;
  doctorName: string;
  specialty?: string;
  hospitalName?: string;
  dateTime?: string;
  date?: string;
  time?: string;
  type?: "in_person" | "video" | string;
  status?: string;
  source?: "oxpecker" | "clinic_website" | "widget" | "hms_walkin" | "csv_import" | string;
  externalBookingId?: string;
  notes?: string;
  fee?: number;
}

export interface UnifiedPrescriptionInput {
  id?: string;
  doctorId?: string;
  doctorName?: string;
  hospitalName?: string;
  externalRefId?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  advice?: string;
  followUp?: string;
  date?: string;
  medicines?: Array<{
    id?: string | number;
    brand_name: string;
    generic_name?: string;
    strength?: string;
    dosage_form?: string;
    dosage?: string;
    duration?: string;
    duration_days?: number;
  }>;
  savingsBdt?: number;
  ddiAlertsCount?: number;
}

export interface UnifiedLabReportInput {
  id?: string;
  name: string;
  type?: string;
  facilityName?: string;
  doctorName?: string;
  reportDate?: string;
  status?: string;
  summary?: string;
  findings?: any;
  fileUrl?: string;
  externalRefId?: string;
}

export interface UnifiedClinicalSyncPayload {
  patient: UnifiedPatientInput;
  appointment?: UnifiedAppointmentInput | null;
  prescription?: UnifiedPrescriptionInput | null;
  labReport?: UnifiedLabReportInput | null;
  vitals?: VitalsSnapshot | null;
}

export interface MemoryPatientRecord {
  id: string;
  mrn: string;
  organizationId: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  nidNumber: string | null;
  bloodGroup: string | null;
  dateOfBirth: string | null;
  photoUrl: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  allergies: string[];
  chronicConditions: string[];
  vitalsSnapshot: VitalsSnapshot;
  externalIds: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface MemorySyncLog {
  id: string;
  organizationId: string;
  direction: "inbound" | "outbound";
  channel: string;
  entityType: string;
  externalRefId?: string | null;
  idempotencyKey?: string | null;
  status: "success" | "failed" | "deduplicated";
  recordsProcessed: number;
  errorMessage?: string | null;
  payload?: any;
  createdAt: string;
}

export interface HubMemoryStore {
  patients: MemoryPatientRecord[];
  appointments: Array<UnifiedAppointmentInput & { id: string; patientId: string; organizationId: string; createdAt: string }>;
  prescriptions: Array<UnifiedPrescriptionInput & { id: string; patientId: string; organizationId: string; createdAt: string }>;
  labReports: Array<UnifiedLabReportInput & { id: string; patientId: string; organizationId: string; createdAt: string }>;
  apiKeys: Array<{
    id: string;
    organizationId: string;
    label: string;
    keyPrefix: string;
    keyHash: string;
    scopes: string[];
    lastUsedAt?: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  syncLogs: MemorySyncLog[];
  orgConfigs: Record<
    string,
    {
      organizationId: string;
      slug: string;
      name: string;
      licenseTier: string;
      licenseKey: string;
      dghsFacilityCode: string;
      webhookUrl: string;
      webhookSecret: string;
      syncStatus: string;
    }
  >;
}

export function normalizeBdPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+8801")) return "0" + digits.slice(4);
  if (digits.startsWith("8801") && digits.length >= 13) return "0" + digits.slice(3);
  if (digits.startsWith("1") && digits.length === 10) return "0" + digits;
  return digits.replace(/^\+/, "");
}

export function normalizeNid(nid?: string | null): string {
  if (!nid) return "";
  return nid.replace(/\D/g, "");
}

export function computeBmiAndCategory(
  heightCm?: number | null,
  weightKg?: number | null
): {
  bmi: number | null;
  category: "Underweight" | "Normal" | "Overweight" | "Obese" | null;
  color: string;
} {
  if (!heightCm || !weightKg || heightCm <= 30 || weightKg <= 2) {
    return { bmi: null, category: null, color: "slate" };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  if (bmi < 18.5) return { bmi, category: "Underweight", color: "sky" };
  if (bmi < 25) return { bmi, category: "Normal", color: "emerald" };
  if (bmi < 30) return { bmi, category: "Overweight", color: "amber" };
  return { bmi, category: "Obese", color: "rose" };
}

function buildInitialHubMemoryStore(): HubMemoryStore {
  const patients: MemoryPatientRecord[] = INITIAL_HEALTH_CARDS.slice(0, 4).map((card, idx) => {
    const heightCm = idx === 0 ? 170 : 165;
    const weightKg = idx === 0 ? 70 : 64;
    const { bmi } = computeBmiAndCategory(heightCm, weightKg);
    return {
      id: card.patient_id || `pat-seed-${idx + 1}`,
      mrn: card.card_number || `HP-2026-900${idx + 1}`,
      organizationId: "org-default",
      name: idx === 0 ? "Rahim Uddin" : card.english_name || card.patient_name,
      age: card.date_of_birth ? Math.max(1, 2026 - parseInt(card.date_of_birth.slice(0, 4), 10)) : 38,
      gender: card.gender || "Male",
      phone: card.personal_phone || "+880 1711-000000",
      email: idx === 0 ? "patient@shustota.ai" : `citizen${idx + 1}@oxpecker.ai`,
      nidNumber: card.nid_number || null,
      bloodGroup: card.blood_group || "A+",
      dateOfBirth: card.date_of_birth || "1988-04-12",
      photoUrl: card.patient_image || "/images/user-avatar.jpg",
      heightCm,
      weightKg,
      bmi,
      allergies: Array.isArray(card.allergies) ? card.allergies : [],
      chronicConditions: Array.isArray(card.chronic_conditions)
        ? card.chronic_conditions.map((c: any) => (typeof c === "string" ? c : c.name)).filter(Boolean)
        : [],
      vitalsSnapshot: {
        bloodPressure: card.vitals?.blood_pressure || "126/82 mmHg",
        heartRate: card.vitals?.heart_rate || "76 bpm",
        spo2: card.vitals?.spo2 || "98%",
        bloodGlucose: card.vitals?.blood_glucose || "112 mg/dL",
        temperature: card.vitals?.temperature || "98.6°F",
        updatedAt: new Date().toISOString(),
      },
      externalIds: {},
      createdAt: new Date(Date.now() - 86400_000 * 30).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const primary = patients[0];
  const card0 = INITIAL_HEALTH_CARDS[0];

  const prescriptions: HubMemoryStore["prescriptions"] = [
    {
      id: "rx-seed-001",
      patientId: primary.id,
      organizationId: "org-default",
      doctorId: "doc-1",
      doctorName: "Prof. Dr. Aminul Rahman",
      hospitalName: "BIRDEM General Hospital",
      diagnosis: "Type-2 Diabetes Mellitus & Essential Hypertension (Follow-Up)",
      chiefComplaint: "Routine glycemic & blood pressure review",
      advice: "Low-salt diabetic diet, brisk walk 30 mins daily, check fasting sugar biweekly.",
      date: "2026-10-18",
      medicines: (card0?.current_medications || []).map((m: any, i: number) => ({
        id: `m-${i}`,
        brand_name: m.name,
        generic_name: m.name,
        strength: m.dosage,
        dosage: m.frequency,
        duration: m.duration,
      })),
      savingsBdt: 340,
      ddiAlertsCount: 0,
      createdAt: "2026-10-18T10:30:00.000Z",
    },
  ];

  const labReports: HubMemoryStore["labReports"] = (card0?.diagnostic_reports || []).slice(0, 3).map((r: any, idx: number) => ({
    id: r.id || `rep-seed-${idx + 1}`,
    patientId: primary.id,
    organizationId: "org-default",
    name: r.title,
    type: r.category || "Pathology",
    facilityName: r.hospital,
    doctorName: r.verified_by,
    reportDate: r.date,
    status: r.status || "Normal",
    summary: r.summary,
    findings: r.parameters || [],
    externalRefId: r.lab_ref,
    createdAt: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
  }));

  const appointments: HubMemoryStore["appointments"] = [
    {
      id: "apt-seed-001",
      patientId: primary.id,
      organizationId: "org-default",
      doctorId: "doc-1",
      doctorName: "Prof. Dr. Ahmed Rahman, FCPS, MD",
      specialty: "Interventional Cardiology",
      hospitalName: "National Heart Foundation & Research Institute",
      dateTime: "2026-11-20T10:30:00.000Z",
      date: "2026-11-20",
      time: "10:30 AM",
      type: "in_person",
      status: "confirmed",
      source: "oxpecker",
      notes: "Quarterly lipid & ECG review",
      fee: 1200,
      createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
    },
  ];

  return {
    patients,
    appointments,
    prescriptions,
    labReports,
    apiKeys: [],
    syncLogs: [
      {
        id: "sync-seed-001",
        organizationId: "org-default",
        direction: "inbound",
        channel: "rest_api",
        entityType: "Patient+LabReport",
        externalRefId: "LAB-SQ-2026-8812",
        status: "success",
        recordsProcessed: 1,
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
      },
    ],
    orgConfigs: {
      "org-default": {
        organizationId: "org-default",
        slug: "oxpecker-flagship-hospital",
        name: "Dhaka Central Specialized Hospital",
        licenseTier: "hospital_pro",
        licenseKey: "OXP-ENT-2026-BD-9941",
        dghsFacilityCode: "HFR-BD-10004821",
        webhookUrl: "",
        webhookSecret: "whsec_oxpecker_clinic_demo_2026",
        syncStatus: "active",
      },
    },
  };
}

const globalHub = globalThis as unknown as { __oxpeckerHubStore?: HubMemoryStore };

export function getHubMemoryStore(): HubMemoryStore {
  if (!globalHub.__oxpeckerHubStore) {
    globalHub.__oxpeckerHubStore = buildInitialHubMemoryStore();
  }
  return globalHub.__oxpeckerHubStore;
}

export async function resolveOrUpsertUnifiedPatient(
  input: UnifiedPatientInput,
  organizationId = "org-default"
): Promise<{
  patient: MemoryPatientRecord;
  matchedExisting: boolean;
  matchStrategy: "nid" | "phone" | "email" | "mrn" | "externalId" | "created_new";
}> {
  const store = getHubMemoryStore();
  const normPhone = normalizeBdPhone(input.phone);
  const normNid = normalizeNid(input.nidNumber);
  const normEmail = (input.email || "").trim().toLowerCase();
  const orgKey = input.organizationSlug || organizationId;

  let matchIdx = -1;
  let matchStrategy: "nid" | "phone" | "email" | "mrn" | "externalId" | "created_new" = "created_new";

  if (normNid) {
    matchIdx = store.patients.findIndex((p) => normalizeNid(p.nidNumber) === normNid);
    if (matchIdx >= 0) matchStrategy = "nid";
  }
  if (matchIdx < 0 && normPhone) {
    matchIdx = store.patients.findIndex((p) => normalizeBdPhone(p.phone) === normPhone);
    if (matchIdx >= 0) matchStrategy = "phone";
  }
  if (matchIdx < 0 && normEmail) {
    matchIdx = store.patients.findIndex((p) => (p.email || "").trim().toLowerCase() === normEmail);
    if (matchIdx >= 0) matchStrategy = "email";
  }
  if (matchIdx < 0 && input.mrn) {
    matchIdx = store.patients.findIndex((p) => p.mrn.toLowerCase() === input.mrn!.trim().toLowerCase());
    if (matchIdx >= 0) matchStrategy = "mrn";
  }
  if (matchIdx < 0 && input.externalId) {
    matchIdx = store.patients.findIndex((p) => p.externalIds?.[orgKey] === input.externalId);
    if (matchIdx >= 0) matchStrategy = "externalId";
  }

  const existing = matchIdx >= 0 ? store.patients[matchIdx] : null;
  const heightCm = input.heightCm ?? existing?.heightCm ?? null;
  const weightKg = input.weightKg ?? existing?.weightKg ?? null;
  const { bmi } = computeBmiAndCategory(heightCm, weightKg);

  const mergedAllergies = Array.from(
    new Set([...(existing?.allergies || []), ...(input.allergies || [])].map((s) => String(s).trim()).filter(Boolean))
  );
  const mergedConditions = Array.from(
    new Set(
      [...(existing?.chronicConditions || []), ...(input.chronicConditions || [])]
        .map((s) => String(s).trim())
        .filter(Boolean)
    )
  );
  const mergedVitals: VitalsSnapshot = {
    ...(existing?.vitalsSnapshot || {}),
    ...(input.vitalsSnapshot || {}),
    updatedAt: new Date().toISOString(),
  };
  const mergedExternalIds = {
    ...(existing?.externalIds || {}),
    ...(input.externalId ? { [orgKey]: input.externalId } : {}),
  };

  let resolvedMrn = existing?.mrn || input.mrn || `OX-${Math.floor(100000 + Math.random() * 900000)}`;
  let resolvedId = existing?.id || `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const dbMatch = await withDbTimeout(
      (async () => {
        const orClauses: any[] = [{ mrn: resolvedMrn }];
        if (normPhone) {
          orClauses.push({ phone: input.phone || normPhone }, { phone: normPhone });
        }
        if (normEmail) orClauses.push({ email: normEmail });
        if (input.nidNumber) orClauses.push({ nidNumber: input.nidNumber.trim() });

        const found = await prisma.patient.findFirst({ where: { OR: orClauses } });
        if (found) {
          if (matchStrategy === "created_new") matchStrategy = found.nidNumber ? "nid" : found.phone ? "phone" : "mrn";
          return await prisma.patient.update({
            where: { id: found.id },
            data: {
              name: input.name || found.name,
              age: input.age ?? found.age,
              gender: input.gender || found.gender,
              phone: input.phone || found.phone,
              email: normEmail || found.email,
              nidNumber: input.nidNumber || found.nidNumber,
              bloodGroup: input.bloodGroup || found.bloodGroup,
              dateOfBirth: input.dateOfBirth || found.dateOfBirth,
              photoUrl: input.photoUrl || found.photoUrl,
              heightCm: heightCm ?? found.heightCm,
              weightKg: weightKg ?? found.weightKg,
              bmi: bmi ?? found.bmi,
              allergies: mergedAllergies as any,
              chronicConditions: mergedConditions as any,
              vitalsSnapshot: mergedVitals as any,
              externalIds: mergedExternalIds as any,
            },
          });
        }

        return await prisma.patient.create({
          data: {
            mrn: resolvedMrn,
            organizationId,
            name: input.name || "Registered Patient",
            age: input.age ?? null,
            gender: input.gender || null,
            phone: input.phone || null,
            email: normEmail || null,
            nidNumber: input.nidNumber || null,
            bloodGroup: input.bloodGroup || null,
            dateOfBirth: input.dateOfBirth || null,
            photoUrl: input.photoUrl || null,
            heightCm,
            weightKg,
            bmi,
            allergies: mergedAllergies as any,
            chronicConditions: mergedConditions as any,
            vitalsSnapshot: mergedVitals as any,
            externalIds: mergedExternalIds as any,
          },
        });
      })(),
      1800
    );

    if (dbMatch) {
      resolvedId = dbMatch.id;
      resolvedMrn = dbMatch.mrn;
    }
  } catch {
    // DB offline fallback handled smoothly via hubMemoryStore below
  }

  const record: MemoryPatientRecord = {
    id: resolvedId,
    mrn: resolvedMrn,
    organizationId: existing?.organizationId || organizationId,
    name: input.name || existing?.name || "Registered Patient",
    age: input.age ?? existing?.age ?? null,
    gender: input.gender || existing?.gender || null,
    phone: input.phone || existing?.phone || null,
    email: normEmail || existing?.email || null,
    nidNumber: input.nidNumber || existing?.nidNumber || null,
    bloodGroup: input.bloodGroup || existing?.bloodGroup || null,
    dateOfBirth: input.dateOfBirth || existing?.dateOfBirth || null,
    photoUrl: input.photoUrl || existing?.photoUrl || "/images/user-avatar.jpg",
    heightCm,
    weightKg,
    bmi,
    allergies: mergedAllergies,
    chronicConditions: mergedConditions,
    vitalsSnapshot: mergedVitals,
    externalIds: mergedExternalIds,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (matchIdx >= 0) {
    store.patients[matchIdx] = record;
  } else {
    store.patients.unshift(record);
  }

  return {
    patient: record,
    matchedExisting: matchStrategy !== "created_new",
    matchStrategy,
  };
}

export async function recordUnifiedClinicalPayload(
  payload: UnifiedClinicalSyncPayload,
  options: {
    organizationId?: string;
    organizationSlug?: string;
    channel?: string;
    defaultHospitalName?: string;
  } = {}
) {
  const organizationId = options.organizationId || "org-default";
  const channel = options.channel || "rest_api";
  const store = getHubMemoryStore();

  const patientInput: UnifiedPatientInput = {
    ...payload.patient,
    organizationSlug: options.organizationSlug || organizationId,
    vitalsSnapshot: payload.vitals || payload.patient.vitalsSnapshot,
  };

  const mpiResult = await resolveOrUpsertUnifiedPatient(patientInput, organizationId);
  const patient = mpiResult.patient;
  const nowIso = new Date().toISOString();

  let appointmentId: string | null = null;
  let prescriptionId: string | null = null;
  let labReportId: string | null = null;

  if (payload.appointment) {
    const apt = payload.appointment;
    appointmentId = apt.id || `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hospitalName = apt.hospitalName || options.defaultHospitalName || "Oxpecker Partner Clinic";
    const dateTimeIso = apt.dateTime || (apt.date ? new Date(apt.date).toISOString() : nowIso);

    store.appointments.unshift({
      ...apt,
      id: appointmentId,
      patientId: patient.id,
      organizationId,
      hospitalName,
      source: apt.source || (channel === "widget" ? "widget" : channel === "csv_import" ? "csv_import" : "clinic_website"),
      status: apt.status || "confirmed",
      createdAt: nowIso,
    });

    try {
      await withDbTimeout(
        (async () => {
          // Ensure a doctor exists for FK or find first active doctor
          const docId = apt.doctorId;
          let doctorRecord = docId ? await prisma.doctor.findUnique({ where: { id: docId } }) : null;
          if (!doctorRecord) {
            doctorRecord = await prisma.doctor.findFirst({ where: { name: { contains: apt.doctorName, mode: "insensitive" } } });
          }
          if (!doctorRecord) {
            doctorRecord = await prisma.doctor.create({
              data: {
                organizationId,
                name: apt.doctorName || "On-Call Specialist",
                degree: "MBBS",
                speciality: apt.specialty || "General Medicine",
                experience: 5,
                hospital: hospitalName,
                consultationFee: Number(apt.fee || 800),
                languages: ["Bangla", "English"],
                location: hospitalName,
              },
            });
          }

          await prisma.appointment.create({
            data: {
              id: appointmentId!,
              organizationId,
              patientId: patient.id,
              doctorId: doctorRecord.id,
              hospitalName,
              specialty: apt.specialty || doctorRecord.speciality,
              source: apt.source || channel,
              externalBookingId: apt.externalBookingId || null,
              dateTime: new Date(dateTimeIso),
              type: apt.type || "in_person",
              status: apt.status || "confirmed",
              notes: apt.notes || null,
            },
          });

          await prisma.hmsBooking.create({
            data: {
              organizationId,
              patientName: patient.name,
              patientPhone: patient.phone,
              patientAge: patient.age,
              patientGender: patient.gender,
              doctorName: apt.doctorName,
              department: apt.specialty || "Outpatient",
              bookingStatus: "Confirmed",
              paymentStatus: "Unpaid",
              paidAmount: 0,
              payload: {
                id: appointmentId,
                source: apt.source || channel,
                hospitalName,
                date: apt.date || dateTimeIso.slice(0, 10),
                time: apt.time || "10:00 AM",
              } as any,
            },
          });
        })(),
        1800
      );
    } catch {}
  }

  if (payload.prescription) {
    const rx = payload.prescription;
    prescriptionId = rx.id || `rx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hospitalName = rx.hospitalName || options.defaultHospitalName || "Oxpecker Partner Clinic";

    store.prescriptions.unshift({
      ...rx,
      id: prescriptionId,
      patientId: patient.id,
      organizationId,
      hospitalName,
      date: rx.date || nowIso.slice(0, 10),
      createdAt: rx.date ? new Date(rx.date).toISOString() : nowIso,
    });

    try {
      await withDbTimeout(
        prisma.prescription.create({
          data: {
            id: prescriptionId,
            patientId: patient.id,
            organizationId,
            doctorId: rx.doctorId || null,
            doctorName: rx.doctorName || "Attending Physician",
            hospitalName,
            externalRefId: rx.externalRefId || null,
            chiefComplaint: rx.chiefComplaint || null,
            diagnosis: rx.diagnosis || null,
            advice: rx.advice || null,
            followUp: rx.followUp || null,
            medicines: (rx.medicines || []) as any,
            savingsBdt: Number(rx.savingsBdt || 0),
            ddiAlertsCount: Number(rx.ddiAlertsCount || 0),
          },
        }),
        1800
      );
    } catch {}
  }

  if (payload.labReport) {
    const rep = payload.labReport;
    labReportId = rep.id || `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const facilityName = rep.facilityName || options.defaultHospitalName || "Diagnostic Partner Lab";

    store.labReports.unshift({
      ...rep,
      id: labReportId,
      patientId: patient.id,
      organizationId,
      facilityName,
      reportDate: rep.reportDate || nowIso.slice(0, 10),
      status: rep.status || "Verified",
      createdAt: rep.reportDate ? new Date(rep.reportDate).toISOString() : nowIso,
    });

    try {
      await withDbTimeout(
        prisma.labReport.create({
          data: {
            id: labReportId,
            patientId: patient.id,
            organizationId,
            facilityName,
            doctorName: rep.doctorName || null,
            findings: (rep.findings || (rep.summary ? { summary: rep.summary } : null)) as any,
            reportDate: rep.reportDate || nowIso.slice(0, 10),
            externalRefId: rep.externalRefId || null,
            name: rep.name,
            type: rep.type || "Lab Result",
            date: rep.reportDate ? new Date(rep.reportDate) : new Date(),
            status: rep.status || "Verified",
            fileUrl: rep.fileUrl || null,
          },
        }),
        1800
      );
    } catch {}
  }

  return {
    patientId: patient.id,
    mrn: patient.mrn,
    matchedExisting: mpiResult.matchedExisting,
    matchStrategy: mpiResult.matchStrategy,
    appointmentId,
    prescriptionId,
    labReportId,
  };
}

export async function getPatient360Timeline(query: {
  patientId?: string | null;
  mrn?: string | null;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
}) {
  const store = getHubMemoryStore();
  const normPhone = normalizeBdPhone(query.phone);
  const normEmail = (query.email || "").trim().toLowerCase();

  let patient: MemoryPatientRecord | undefined = store.patients.find((p) => {
    if (query.patientId && p.id === query.patientId) return true;
    if (query.mrn && p.mrn.toLowerCase() === query.mrn.toLowerCase()) return true;
    if (normPhone && normalizeBdPhone(p.phone) === normPhone) return true;
    if (normEmail && (p.email || "").toLowerCase() === normEmail) return true;
    if (query.name && p.name.toLowerCase() === query.name.trim().toLowerCase()) return true;
    return false;
  });

  if (!patient) {
    patient = store.patients[0];
  }

  let dbAppointments: any[] = [];
  let dbPrescriptions: any[] = [];
  let dbLabReports: any[] = [];
  let dbDocs: any[] = [];

  try {
    const dbData = await withDbTimeout(
      (async () => {
        const orClauses: any[] = [{ id: patient!.id }, { mrn: patient!.mrn }];
        if (normPhone) orClauses.push({ phone: { contains: normPhone.slice(-8) } });
        if (normEmail) orClauses.push({ email: normEmail });

        const dbPatient = await prisma.patient.findFirst({
          where: { OR: orClauses },
          include: {
            appointments: { include: { doctor: true }, orderBy: { dateTime: "desc" } },
            prescriptions: { orderBy: { createdAt: "desc" } },
            labReports: { orderBy: { createdAt: "desc" } },
          },
        });
        if (!dbPatient) return null;
        const docs = query.email || query.patientId
          ? await prisma.medicalDocument.findMany({
              where: { ownerId: query.patientId || dbPatient.id },
              orderBy: { createdAt: "desc" },
              take: 25,
            })
          : [];
        return { dbPatient, docs };
      })(),
      1800
    );

    if (dbData?.dbPatient) {
      const p = dbData.dbPatient;
      const { bmi } = computeBmiAndCategory(p.heightCm ?? patient.heightCm, p.weightKg ?? patient.weightKg);
      patient = {
        ...patient,
        id: p.id,
        mrn: p.mrn,
        name: p.name,
        age: p.age ?? patient.age,
        gender: p.gender ?? patient.gender,
        phone: p.phone ?? patient.phone,
        email: p.email ?? patient.email,
        nidNumber: p.nidNumber ?? patient.nidNumber,
        bloodGroup: p.bloodGroup ?? patient.bloodGroup,
        dateOfBirth: p.dateOfBirth ?? patient.dateOfBirth,
        photoUrl: p.photoUrl ?? patient.photoUrl,
        heightCm: p.heightCm ?? patient.heightCm,
        weightKg: p.weightKg ?? patient.weightKg,
        bmi: p.bmi ?? bmi,
        allergies: Array.isArray(p.allergies) ? (p.allergies as string[]) : patient.allergies,
        chronicConditions: Array.isArray(p.chronicConditions) ? (p.chronicConditions as string[]) : patient.chronicConditions,
        vitalsSnapshot: (p.vitalsSnapshot as VitalsSnapshot) || patient.vitalsSnapshot,
      };
      dbAppointments = p.appointments || [];
      dbPrescriptions = p.prescriptions || [];
      dbLabReports = p.labReports || [];
      dbDocs = dbData.docs || [];
    }
  } catch {
    // Graceful fallback to memory store
  }

  const memAppointments = store.appointments.filter((a) => a.patientId === patient!.id);
  const memPrescriptions = store.prescriptions.filter((r) => r.patientId === patient!.id);
  const memReports = store.labReports.filter((l) => l.patientId === patient!.id);

  const mergedAppointmentsMap = new Map<string, any>();
  [...dbAppointments, ...memAppointments].forEach((a) => {
    const id = String(a.id);
    if (!mergedAppointmentsMap.has(id)) {
      mergedAppointmentsMap.set(id, {
        id,
        doctorName: a.doctorName || a.doctor?.name || "Attending Specialist",
        specialty: a.specialty || a.doctor?.speciality || "Specialist",
        hospitalName: a.hospitalName || a.doctor?.hospital || "Oxpecker Partner Hospital",
        dateTime: a.dateTime ? new Date(a.dateTime).toISOString() : a.createdAt,
        date: a.date || (a.dateTime ? new Date(a.dateTime).toISOString().slice(0, 10) : a.createdAt?.slice(0, 10)),
        time: a.time || "Scheduled",
        type: a.type || "in_person",
        status: a.status || "confirmed",
        source: a.source || "oxpecker",
        notes: a.notes || "",
        fee: a.fee || a.doctor?.consultationFee || 1000,
      });
    }
  });

  const mergedRxMap = new Map<string, any>();
  [...dbPrescriptions, ...memPrescriptions].forEach((rx) => {
    const id = String(rx.id);
    if (!mergedRxMap.has(id)) {
      mergedRxMap.set(id, {
        id,
        doctorName: rx.doctorName || "Attending Physician",
        hospitalName: rx.hospitalName || "Oxpecker Smart Chamber",
        diagnosis: rx.diagnosis || "Clinical Consultation",
        chiefComplaint: rx.chiefComplaint || "",
        advice: rx.advice || "",
        medicines: Array.isArray(rx.medicines) ? rx.medicines : [],
        savingsBdt: Number(rx.savingsBdt || 0),
        date: rx.date || (rx.createdAt ? new Date(rx.createdAt).toISOString().slice(0, 10) : ""),
        createdAt: rx.createdAt ? new Date(rx.createdAt).toISOString() : new Date().toISOString(),
      });
    }
  });

  const mergedReportsMap = new Map<string, any>();
  [...dbLabReports, ...memReports].forEach((rep) => {
    const id = String(rep.id);
    if (!mergedReportsMap.has(id)) {
      mergedReportsMap.set(id, {
        id,
        name: rep.name,
        type: rep.type || "Lab Result",
        facilityName: rep.facilityName || "Diagnostic Laboratory",
        doctorName: rep.doctorName || "Pathology Review",
        status: rep.status || "Verified",
        summary: rep.summary || rep.findings?.summary || "",
        findings: rep.findings || [],
        date: rep.reportDate || (rep.date ? new Date(rep.date).toISOString().slice(0, 10) : ""),
        createdAt: rep.createdAt ? new Date(rep.createdAt).toISOString() : new Date().toISOString(),
      });
    }
  });

  const appointments = Array.from(mergedAppointmentsMap.values());
  const prescriptions = Array.from(mergedRxMap.values());
  const labReports = Array.from(mergedReportsMap.values());

  const timeline: any[] = [
    ...appointments.map((a) => ({
      id: `tl-apt-${a.id}`,
      category: "appointment",
      date: a.date || a.dateTime?.slice(0, 10) || "",
      timestamp: new Date(a.dateTime || a.date || Date.now()).getTime(),
      title: `Appointment: ${a.doctorName}`,
      subtitle: `${a.specialty} • ${a.type === "video" ? "Video Telemedicine" : "Hospital Visit"}`,
      hospitalName: a.hospitalName,
      doctorName: a.doctorName,
      source: a.source,
      status: a.status,
      details: a.notes || `Scheduled at ${a.time}`,
    })),
    ...prescriptions.map((rx) => ({
      id: `tl-rx-${rx.id}`,
      category: "prescription",
      date: rx.date || rx.createdAt?.slice(0, 10) || "",
      timestamp: new Date(rx.createdAt || rx.date || Date.now()).getTime(),
      title: `Prescription: ${rx.diagnosis}`,
      subtitle: `${rx.medicines.length} medicine(s) prescribed${rx.savingsBdt ? ` • Saved ৳${rx.savingsBdt}` : ""}`,
      hospitalName: rx.hospitalName,
      doctorName: rx.doctorName,
      source: "doctor_pad",
      status: "Issued",
      medicines: rx.medicines,
      advice: rx.advice,
    })),
    ...labReports.map((rep) => ({
      id: `tl-rep-${rep.id}`,
      category: "lab_report",
      date: rep.date || rep.createdAt?.slice(0, 10) || "",
      timestamp: new Date(rep.createdAt || rep.date || Date.now()).getTime(),
      title: rep.name,
      subtitle: `${rep.type} • ${rep.status}`,
      hospitalName: rep.facilityName,
      doctorName: rep.doctorName,
      source: "diagnostic_lab",
      status: rep.status,
      details: rep.summary,
      findings: rep.findings,
    })),
    ...dbDocs.map((doc) => ({
      id: `tl-doc-${doc.id}`,
      category: "document",
      date: doc.createdAt ? new Date(doc.createdAt).toISOString().slice(0, 10) : "",
      timestamp: doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now(),
      title: `Encrypted Vault: ${doc.originalName}`,
      subtitle: doc.kind || "Medical Document",
      hospitalName: "Patient Vault (AES-256-GCM)",
      doctorName: doc.provider || "Oxpecker AI OCR",
      source: "vault_upload",
      status: "Encrypted",
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const participatingHospitals = Array.from(
    new Set(timeline.map((t) => t.hospitalName).filter(Boolean))
  );
  const doctorsMap = new Map<string, { name: string; specialty: string; hospital: string }>();
  for (const t of timeline) {
    if (t.doctorName && !doctorsMap.has(t.doctorName)) {
      doctorsMap.set(t.doctorName, {
        name: t.doctorName,
        specialty: t.subtitle?.split("•")[0]?.trim() || "Consultant",
        hospital: t.hospitalName || "Oxpecker Network",
      });
    }
  }

  const bmiMeta = computeBmiAndCategory(patient.heightCm, patient.weightKg);
  const allMedicinesForFhir = prescriptions.flatMap((rx) =>
    (rx.medicines || []).map((m: any, idx: number) => ({
      id: m.id || `${rx.id}-${idx}`,
      brand_name: m.brand_name || m.name || "Prescribed Medicine",
      generic_name: m.generic_name || m.name || "Generic",
      strength: m.strength || "",
      dosage_form: m.dosage_form || "Tablet",
      dosage_instructions: m.dosage || "As directed",
      duration_days: Number(m.duration_days || 7),
    }))
  );

  const fhirBundle = generateDGHSFHIRBundle({
    patientId: patient.mrn,
    patientName: patient.name,
    patientPhone: patient.phone || undefined,
    patientGender:
      patient.gender?.toLowerCase() === "female"
        ? "female"
        : patient.gender?.toLowerCase() === "male"
          ? "male"
          : "other",
    patientDob: patient.dateOfBirth || undefined,
    medicines: allMedicinesForFhir,
  });

  return {
    patient: {
      ...patient,
      bmi: patient.bmi ?? bmiMeta.bmi,
      bmiCategory: bmiMeta.category,
      bmiColor: bmiMeta.color,
    },
    appointments,
    prescriptions,
    labReports,
    medicalDocuments: dbDocs,
    timeline,
    participatingHospitals,
    consultingDoctors: Array.from(doctorsMap.values()),
    fhirBundle,
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Parse RFC-4180 style CSV text with normalized snake_case column headers. */
export function parseCsvToRows(csvText: string): Record<string, string>[] {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (cols[idx] !== undefined && cols[idx] !== "") obj[h] = cols[idx];
    });
    return obj;
  });
}
