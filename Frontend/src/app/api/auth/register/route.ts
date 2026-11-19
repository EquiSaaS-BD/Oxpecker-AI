import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerNewAccount } from "@/lib/auth-registry";
import { attachSessionCookie, signSessionToken } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth-register", 25, 60_000);
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
    }

    const result = await registerNewAccount({
      name: String(body.name || ""),
      email: String(body.email || ""),
      password: body.password ? String(body.password) : undefined,
      role: String(body.role || "patient"),
      phone: body.phone ? String(body.phone) : undefined,
      address: body.address ? String(body.address) : undefined,
      specialty: body.specialty ? String(body.specialty) : undefined,
      hospitalName: body.hospitalName ? String(body.hospitalName) : undefined,
      bmdcRegNo: body.bmdcRegNo ? String(body.bmdcRegNo) : undefined,
      dateOfBirth: body.dateOfBirth ? String(body.dateOfBirth) : undefined,
      gender: body.gender ? String(body.gender) : undefined,
      bloodGroup: body.bloodGroup ? String(body.bloodGroup) : undefined,
      image: body.image ? String(body.image) : undefined,
      isOAuth: Boolean(body.isOAuth),
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Registration failed.", code: result.code },
        { status: result.status }
      );
    }

    const token = await signSessionToken({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      organizationId: result.user.organizationId,
      doctorId: result.user.doctorId,
      assistantId: result.user.assistantId,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        token,
      },
      { status: 201 }
    );

    return attachSessionCookie(response, token);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error during registration." },
      { status: 500 }
    );
  }
}
