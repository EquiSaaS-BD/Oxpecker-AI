import { NextResponse } from "next/server";
import { INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import { matchPatientPhoto } from "@/lib/biometrics";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, targetPatientId, doctorName, hospitalName } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Image data (imageBase64) is required for biometric face scan" },
        { status: 400 }
      );
    }

    // Combine registry cards with any database cards
    let allCards = [...INITIAL_HEALTH_CARDS];

    if (isSupabaseConfigured) {
      try {
        const { data: dbRecords } = await supabase
          .from("patient_health_records")
          .select("*")
          .limit(50);

        if (dbRecords && dbRecords.length > 0) {
          const dbCards = dbRecords
            .filter((r: any) => r.photo_url || r.patient_image)
            .map((r: any) => ({
              id: r.id || `hp-${r.uhid}`,
              patient_id: r.id || r.uhid,
              card_number: r.uhid,
              smart_card_uid: r.nid || r.uhid,
              patient_name: r.full_name,
              english_name: r.english_name || r.full_name,
              patient_image: r.photo_url || r.patient_image,
              date_of_birth: r.date_of_birth,
              gender: r.gender,
              blood_group: r.blood_group,
              nid_number: r.nid,
              birth_cert_number: r.birth_cert_no,
              verification_status: "verified" as const,
              verified_at: r.created_at,
              is_activated: true,
              division: r.division,
              zila: r.zila,
              upazila: r.upazila,
              address: r.address,
              emergency_contact_name: r.emergency_contact_name,
              emergency_contact_phone: r.emergency_contact_phone,
              emergency_contact_relation: r.emergency_contact_relation,
              allergies: Array.isArray(r.severe_allergies) ? r.severe_allergies : [],
              chronic_conditions: Array.isArray(r.chronic_conditions) ? r.chronic_conditions : [],
              current_medications: Array.isArray(r.active_medications) ? r.active_medications : [],
              face_verified: true,
              fingerprint_registered: true,
              issued_at: r.created_at,
              expires_at: null,
              is_active: true,
            }));

          allCards = [...allCards, ...dbCards.filter((c) => !allCards.some((a) => a.id === c.id))];
        }
      } catch (dbErr) {
        console.warn("Visual search Supabase warning:", dbErr);
      }
    }

    // Perform genuine biometric visual feature matching
    // Strict threshold: only matches >= 70% are returned. No fake/dummy data.
    const candidates = await matchPatientPhoto(imageBase64, allCards, targetPatientId);
    const matchFound = candidates.length > 0;
    const topMatch = matchFound ? candidates[0] : null;

    // Audit log biometric face scan in emergency access logs
    if (isSupabaseConfigured && topMatch) {
      try {
        await supabase.from("emergency_access_logs").insert([
          {
            patient_uhid: topMatch.card.card_number || "BIOMETRIC_SCAN",
            doctor_name: doctorName || "Emergency Attending Doctor",
            hospital_name: hospitalName || "Emergency Trauma Dept",
            access_reason: `Visual AI Biometric Match (${topMatch.similarity}% Confidence)`,
          },
        ]);
      } catch (logErr) {
        console.warn("Audit log warning:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      matchFound,
      count: candidates.length,
      topMatch,
      candidates,
    });
  } catch (err: any) {
    console.error("Visual search API exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Visual search failed" },
      { status: 500 }
    );
  }
}
