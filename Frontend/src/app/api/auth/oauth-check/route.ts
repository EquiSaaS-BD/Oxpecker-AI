import { NextRequest, NextResponse } from "next/server";
import { findAccountByEmail, isValidEmailFormat, normalizeEmail } from "@/lib/auth-registry";
import { attachSessionCookie, signSessionToken } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email || "");
    const mode = String(body?.mode || "login");
    const requestedRole = body?.requestedRole ? String(body.requestedRole).toLowerCase() : null;

    if (!email || !isValidEmailFormat(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const found = await findAccountByEmail(email);
    if (!found.exists || !found.user) {
      return NextResponse.json({ exists: false, authenticated: false });
    }

    // Prevent role overwrite or duplicate registration when email already belongs to another role
    if (mode === "register" && requestedRole && requestedRole !== found.user.role) {
      return NextResponse.json(
        {
          exists: true,
          authenticated: false,
          code: "EMAIL_ALREADY_EXISTS",
          existingRole: found.user.role,
          error: `This email is already registered as a ${found.user.role} account. Please sign in instead.`,
        },
        { status: 409 }
      );
    }

    const safeUser = { ...found.user };
    delete safeUser.passwordHash;

    const token = await signSessionToken({
      id: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      organizationId: safeUser.organizationId,
      doctorId: safeUser.doctorId,
      assistantId: safeUser.assistantId,
    });

    const response = NextResponse.json({
      exists: true,
      authenticated: true,
      user: safeUser,
      token,
    });

    return attachSessionCookie(response, token);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "OAuth lookup failed." },
      { status: 500 }
    );
  }
}
