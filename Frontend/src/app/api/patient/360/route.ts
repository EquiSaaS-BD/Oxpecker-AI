import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireSessionUser } from "@/lib/server-auth";
import {
  computeBmiAndCategory,
  getPatient360Timeline,
  resolveOrUpsertUnifiedPatient,
} from "@/lib/patient-hub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSessionUser(request);
  const { searchParams } = new URL(request.url);

  const requestedPatientId = searchParams.get("patientId");
  const requestedMrn = searchParams.get("mrn");
  const requestedPhone = searchParams.get("phone");

  const isPrivileged = session && ["doctor", "hospital", "assistant", "admin"].includes(String(session.role));

  const timeline = await getPatient360Timeline({
    patientId: isPrivileged && requestedPatientId ? requestedPatientId : session?.role === "patient" ? session.id : requestedPatientId,
    mrn: isPrivileged || !session ? requestedMrn : undefined,
    phone: isPrivileged || !session ? requestedPhone : undefined,
    email: session?.email || undefined,
    name: session?.name || undefined,
  });

  return NextResponse.json({
    success: true,
    authenticated: Boolean(session),
    ...timeline,
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSessionUser(request);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();
    const heightCm = body.heightCm !== undefined && body.heightCm !== "" ? Number(body.heightCm) : undefined;
    const weightKg = body.weightKg !== undefined && body.weightKg !== "" ? Number(body.weightKg) : undefined;
    const { bmi, category } = computeBmiAndCategory(heightCm, weightKg);

    const updated = await resolveOrUpsertUnifiedPatient(
      {
        mrn: body.mrn || undefined,
        name: body.name || user.name || "Patient",
        email: body.email || user.email,
        phone: body.phone || undefined,
        nidNumber: body.nidNumber || undefined,
        age: body.age ? Number(body.age) : undefined,
        gender: body.gender || undefined,
        bloodGroup: body.bloodGroup || undefined,
        dateOfBirth: body.dateOfBirth || undefined,
        photoUrl: body.photoUrl || undefined,
        heightCm,
        weightKg,
        allergies: Array.isArray(body.allergies) ? body.allergies : undefined,
        chronicConditions: Array.isArray(body.chronicConditions) ? body.chronicConditions : undefined,
        vitalsSnapshot: body.vitalsSnapshot || undefined,
      },
      user.organizationId || "org-default"
    );

    const timeline = await getPatient360Timeline({
      patientId: updated.patient.id,
      mrn: updated.patient.mrn,
      email: updated.patient.email,
      phone: updated.patient.phone,
    });

    return NextResponse.json({
      success: true,
      bmi,
      bmiCategory: category,
      ...timeline,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update patient 360 profile." },
      { status: 500 }
    );
  }
}
