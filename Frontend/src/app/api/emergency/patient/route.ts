import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Search by UHID, NID, or Phone
    const { data: patient, error } = await supabase
      .from("patient_health_records")
      .select("*")
      .or(`uhid.eq.${query},nid.eq.${query},phone.eq.${query}`)
      .maybeSingle();

    if (error) {
      console.error("Emergency lookup error:", error);
      return NextResponse.json({ error: "Failed to query patient record" }, { status: 500 });
    }

    if (!patient) {
      return NextResponse.json({ error: "No patient record found for the provided identifier" }, { status: 404 });
    }

    // Log break-glass access to audit trail
    await supabase.from("emergency_access_logs").insert([
      {
        doctor_name: doctorName,
        doctor_bmdc_no: doctorBmdc,
        hospital_name: hospitalName,
        patient_uhid: patient.uhid,
        access_reason: reason,
      },
    ]);

    return NextResponse.json({
      success: true,
      patient: {
        uhid: patient.uhid,
        nid: patient.nid,
        fullName: patient.full_name,
        phone: patient.phone,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        bloodGroup: patient.blood_group,
        severeAllergies: patient.severe_allergies || [],
        chronicConditions: patient.chronic_conditions || [],
        activeMedications: patient.active_medications || [],
        emergencyContactName: patient.emergency_contact_name,
        emergencyContactPhone: patient.emergency_contact_phone,
        hasPacemaker: patient.has_pacemaker,
        isDiabetic: patient.is_diabetic,
        organDonor: patient.organ_donor,
        pastSurgeries: patient.past_surgeries || [],
        notes: patient.notes,
      },
    });
  } catch (err: any) {
    console.error("Emergency patient API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
