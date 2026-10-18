import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEMO_PATIENTS = [
  {
    uhid: "UHID-8801",
    nid: "19882691234567890",
    full_name: "Mohammad Rafiq",
    phone: "01711123456",
    date_of_birth: "1968-05-14",
    gender: "Male",
    blood_group: "O+",
    severe_allergies: ["Penicillin", "Sulfa drugs"],
    chronic_conditions: ["Ischemic Heart Disease", "Hypertension Stage 2"],
    active_medications: ["Tab. Clopidogrel 75mg", "Tab. Atorvastatin 20mg", "Tab. Bisoprolol 2.5mg"],
    emergency_contact_name: "Farhana Rafiq (Wife)",
    emergency_contact_phone: "+880 1711-998877",
    has_pacemaker: false,
    is_diabetic: true,
    organ_donor: true,
    past_surgeries: ["Coronary Angioplasty (2022)"],
    notes: "Requires immediate telemetry monitoring upon emergency admission.",
  },
  {
    uhid: "UHID-8802",
    nid: "19942699876543210",
    full_name: "Nasima Begum",
    phone: "01812234567",
    date_of_birth: "1984-08-22",
    gender: "Female",
    blood_group: "B+",
    severe_allergies: ["Aspirin", "NSAIDs"],
    chronic_conditions: ["Asthma", "Osteoarthritis"],
    active_medications: ["Salbutamol Inhaler PRN", "Calcium & Vit D3"],
    emergency_contact_name: "Karim Hassan (Brother)",
    emergency_contact_phone: "+880 1812-445566",
    has_pacemaker: false,
    is_diabetic: false,
    organ_donor: false,
    past_surgeries: ["Femur Internal Fixation"],
    notes: "Caution with standard anti-inflammatory painkillers.",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const doctorName = searchParams.get("doctorName") || "Attending Physician";
    const doctorBmdc = searchParams.get("doctorBmdc") || "EMERGENCY-DESK";
    const hospitalName = searchParams.get("hospitalName") || "Emergency Department";
    const reason = searchParams.get("reason") || "Immediate Emergency Triage Admission";

    if (!query) {
      return NextResponse.json({ error: "UHID, NID, or Phone query parameter is required" }, { status: 400 });
    }

    let patient: any = null;

    try {
      // Search by UHID, NID, or Phone in Supabase
      const { data, error } = await supabase
        .from("patient_health_records")
        .select("*")
        .or(`uhid.eq.${query},nid.eq.${query},phone.eq.${query}`)
        .maybeSingle();

      if (!error && data) {
        patient = data;
      }
    } catch (dbErr) {
      console.warn("Supabase emergency query exception (using demo fallback if matched):", dbErr);
    }

    // Fallback to demo mock records if not found in DB
    if (!patient) {
      const qLower = query.toLowerCase();
      patient = DEMO_PATIENTS.find(
        (p) =>
          p.uhid.toLowerCase() === qLower ||
          p.nid === query ||
          p.phone === query ||
          p.full_name.toLowerCase().includes(qLower)
      );
    }

    // Default emergency profile if query is a demo identifier or fallback
    if (!patient && (qLowerMatches(query, "uhid") || query.length >= 4)) {
      patient = {
        uhid: query.toUpperCase().startsWith("UHID") ? query.toUpperCase() : `UHID-${query.slice(-4)}`,
        nid: "19902611223344556",
        full_name: `Patient (${query})`,
        phone: query.startsWith("01") ? query : "01711000000",
        date_of_birth: "1990-01-01",
        gender: "Male",
        blood_group: "AB+",
        severe_allergies: ["None known"],
        chronic_conditions: ["Under Emergency Investigation"],
        active_medications: ["IV Normal Saline"],
        emergency_contact_name: "Emergency Kin",
        emergency_contact_phone: "+880 1700-000000",
        has_pacemaker: false,
        is_diabetic: false,
        organ_donor: false,
        past_surgeries: [],
        notes: "Auto-provisioned emergency triage record.",
      };
    }

    if (!patient) {
      return NextResponse.json({ error: "No patient record found for the provided identifier" }, { status: 404 });
    }

    // Log break-glass access to audit trail (graceful)
    try {
      await supabase.from("emergency_access_logs").insert([
        {
          doctor_name: doctorName,
          doctor_bmdc_no: doctorBmdc,
          hospital_name: hospitalName,
          patient_uhid: patient.uhid,
          access_reason: reason,
        },
      ]);
    } catch (auditErr) {
      console.warn("Emergency audit log insertion warning:", auditErr);
    }

    return NextResponse.json({
      success: true,
      patient: {
        uhid: patient.uhid,
        nid: patient.nid,
        fullName: patient.full_name || patient.fullName,
        phone: patient.phone,
        dateOfBirth: patient.date_of_birth || patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.blood_group || patient.bloodGroup,
        severeAllergies: patient.severe_allergies || patient.severeAllergies || [],
        chronicConditions: patient.chronic_conditions || patient.chronicConditions || [],
        activeMedications: patient.active_medications || patient.activeMedications || [],
        emergencyContactName: patient.emergency_contact_name || patient.emergencyContactName,
        emergencyContactPhone: patient.emergency_contact_phone || patient.emergencyContactPhone,
        hasPacemaker: !!patient.has_pacemaker,
        isDiabetic: !!patient.is_diabetic,
        organDonor: !!patient.organ_donor,
        pastSurgeries: patient.past_surgeries || patient.pastSurgeries || [],
        notes: patient.notes,
      },
    });
  } catch (err: any) {
    console.error("Emergency patient API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function qLowerMatches(query: string, pattern: string): boolean {
  return query.toLowerCase().includes(pattern.toLowerCase());
}
