import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { data: records, error } = await supabase
      .from('patient_health_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase patient_health_records error:", error);
    }

    const { data: rxList } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });

    const formatted = (records || []).map(p => {
      const pRx = (rxList || []).filter(rx => rx.patient_id === p.uhid || rx.patient_name === p.full_name);
      return {
        id: p.uhid,
        name: p.full_name,
        age: p.date_of_birth ? (new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()) : 30,
        gender: p.gender || "Unknown",
        type: "Registered",
        date: p.created_at,
        status: "Completed",
        diagnosis: pRx[0]?.diagnosis || "Regular checkup",
        assistant: "System",
        paymentStatus: "Paid",
        avatar: p.full_name.charAt(0).toUpperCase(),
        dbId: p.id,
        prescriptions: pRx.map(rx => ({
          id: rx.id,
          date: rx.created_at,
          diagnosis: rx.diagnosis,
          medicines: rx.medicines || []
        }))
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
