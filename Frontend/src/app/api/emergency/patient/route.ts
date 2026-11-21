import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { INITIAL_HEALTH_CARDS } from "@/lib/healthpass";
import { getSessionUser } from "@/lib/server-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateErr = checkRateLimit(request, "emergency-patient", 30, 60_000);
  if (rateErr) return rateErr;

  const sessionUser = await getSessionUser(request);
  if (sessionUser && sessionUser.role === "patient") {
    return NextResponse.json(
      { error: "Patients cannot query other emergency patient records." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (
      searchParams.get("query") ||
      searchParams.get("cardId") ||
      searchParams.get("uhid") ||
      searchParams.get("id")
    )?.trim();
    const doctorName = searchParams.get("doctorName") || sessionUser?.name || "Attending Physician";
    const doctorBmdc = searchParams.get("doctorBmdc") || "EMERGENCY-DESK";
    const hospitalName = searchParams.get("hospitalName") || "Emergency Department";
    const reason = searchParams.get("reason") || "Immediate Emergency Triage Admission";
    const user = sessionUser || {
      id: "er-break-glass",
      name: doctorName,
      role: "doctor" as const,
      organizationId: "org-default",
    };

    if (!rawQuery) {
      return NextResponse.json({ error: "UHID, NID, or Phone query parameter is required" }, { status: 400 });
    }

    // Strict input sanitization to prevent PostgREST .or() filter injection
    const query = rawQuery.replace(/[^a-zA-Z0-9\-\+\s@.]/g, "").trim().slice(0, 64);
    if (!query) {
      return NextResponse.json({ error: "Invalid emergency query format" }, { status: 400 });
    }

    const cleanQ = query.replace(/[- ]/g, "").toLowerCase();

    // Non-blocking immutable Break-Glass Audit Log in PostgreSQL
    withDbTimeout(
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorName: doctorName,
          actorRole: user.role,
          organizationId: user.organizationId || "org-default",
          action: "EMERGENCY_LOOKUP",
          targetType: "HealthPassCard",
          targetId: query,
          reason: `${reason} (BMDC: ${doctorBmdc}, Hospital: ${hospitalName})`,
        },
      }),
      1200
    ).catch(() => {});

    // 1. Try Supabase query if configured (bounded by 1200ms timeout)
    if (isSupabaseConfigured) {
      try {
        const sbRes = await Promise.race([
          supabase
            .from("patient_health_records")
            .select("*")
            .or(`uhid.eq."${query}",nid.eq."${query}",phone.eq."${query}"`)
            .maybeSingle(),
          new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 1200)
          ),
        ]);
        const patient = (sbRes as any)?.data;
        const error = (sbRes as any)?.error;

        if (!error && patient) {
          // Non-blocking break-glass audit log
          Promise.resolve(
            supabase.from("emergency_access_logs").insert([
              {
                doctor_name: doctorName,
                doctor_bmdc_no: doctorBmdc,
                hospital_name: hospitalName,
                patient_uhid: patient.uhid,
                access_reason: reason,
              },
            ])
          ).catch(() => {});

          return NextResponse.json({
            success: true,
            source: "supabase",
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
        }
      } catch (dbErr) {
        console.warn("Supabase lookup fallback to registry:", dbErr);
      }
    }

    // 2. Fallback to INITIAL_HEALTH_CARDS (including canonical demo alias HP-2026-8841 -> INITIAL_HEALTH_CARDS[0])
    const fallbackMatch =
      INITIAL_HEALTH_CARDS.find((card) => {
        const cNid = (card.nid_number || "").replace(/[- ]/g, "").toLowerCase();
        const cPhone = (card.personal_phone || card.emergency_contact_phone || "").replace(/[- ]/g, "").toLowerCase();
        const cCard = (card.card_number || "").replace(/[- ]/g, "").toLowerCase();
        const cName = (card.patient_name || "").toLowerCase();
        const cEng = (card.english_name || "").toLowerCase();
        return (
          cNid === cleanQ ||
          cPhone === cleanQ ||
          cCard === cleanQ ||
          cName.includes(query.toLowerCase()) ||
          cEng.includes(query.toLowerCase())
        );
      }) || (cleanQ === "hp20268841" ? INITIAL_HEALTH_CARDS[0] : undefined);

    if (fallbackMatch) {
      return NextResponse.json({
        success: true,
        source: "cache",
        patient: {
          uhid: fallbackMatch.card_number,
          nid: fallbackMatch.nid_number,
          fullName: fallbackMatch.patient_name,
          phone: fallbackMatch.personal_phone,
          dateOfBirth: fallbackMatch.date_of_birth,
          gender: fallbackMatch.gender,
          bloodGroup: fallbackMatch.blood_group,
          severeAllergies: fallbackMatch.allergies || [],
          chronicConditions: fallbackMatch.chronic_conditions || [],
          activeMedications: fallbackMatch.current_medications || [],
          emergencyContactName: fallbackMatch.emergency_contact_name,
          emergencyContactPhone: fallbackMatch.emergency_contact_phone,
          hasPacemaker: fallbackMatch.has_pacemaker,
          isDiabetic: fallbackMatch.diabetic_status !== "None",
          organDonor: fallbackMatch.organ_donor,
          pastSurgeries: [],
          notes: "Emergency accident profile loaded from verified registry.",
        },
      });
    }

    return NextResponse.json({ error: "No patient record found for the provided identifier" }, { status: 404 });
  } catch (err: any) {
    console.error("Emergency patient API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
