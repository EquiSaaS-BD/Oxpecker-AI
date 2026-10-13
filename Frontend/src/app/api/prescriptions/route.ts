import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { patientId: mrn, patientName, ...prescriptionData } = data;

    if (!mrn) {
      return NextResponse.json({ error: "Patient ID (MRN) is required" }, { status: 400 });
    }

    const newRx = {
      doctor_name: prescriptionData.doctorName || "Dr. Assigned",
      doctor_id: prescriptionData.doctorId || null,
      patient_id: mrn,
      patient_name: patientName || "Patient",
      diagnosis: prescriptionData.diagnosis || null,
      medicines: prescriptionData.medicines || [],
      test_recommendations: prescriptionData.investigationsList || [],
      advice: prescriptionData.advice || null,
      follow_up_date: prescriptionData.followUp || null,
    };

    const { data: inserted, error } = await supabase
      .from('prescriptions')
      .insert(newRx)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert prescription error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error("Failed to save prescription:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    let query = supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}
