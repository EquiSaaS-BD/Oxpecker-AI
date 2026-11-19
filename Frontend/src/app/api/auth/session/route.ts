import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  SESSION_COOKIE_NAME,
  attachSessionCookie,
  getSessionUser,
  signSessionToken,
  type SessionUser,
} from "@/lib/server-auth";
import {
  SEEDED_DEMO_ACCOUNTS,
  findAccountByEmail,
  normalizeEmail,
  verifyPasswordHash,
} from "@/lib/auth-registry";
import type { UserRole } from "@/context/AuthContext";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // Direct session synchronization after verified registration or OAuth
    if (body.sessionSync && body.user && typeof body.user.email === "string") {
      const existing = await getSessionUser(request);
      const targetEmail = normalizeEmail(body.user.email);
      const targetRole: UserRole =
        existing && existing.email.toLowerCase() === targetEmail
          ? existing.role
          : (body.user.role as UserRole) || "patient";

      // Prevent unauthenticated privilege escalation to admin via sessionSync
      if (targetRole === "admin" && existing?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden role assignment." }, { status: 403 });
      }

      const sessionUser: SessionUser = {
        id: String(body.user.id || existing?.id || `usr-${Date.now()}`),
        email: targetEmail,
        name: String(body.user.name || existing?.name || "Oxpecker User"),
        role: targetRole,
        organizationId: String(body.user.organizationId || existing?.organizationId || "org-default"),
        doctorId: body.user.doctorId || existing?.doctorId,
        assistantId: body.user.assistantId || existing?.assistantId,
      };
      const token = await signSessionToken(sessionUser);
      const res = NextResponse.json({ success: true, user: sessionUser, token });
      return attachSessionCookie(res, token);
    }

    const lowerEmail = normalizeEmail(body.email || "");
    const password = String(body.password || "");

    if (!lowerEmail || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 1. Check seeded demo accounts first (instantaneous cryptographic verification)
    const demoAccount = SEEDED_DEMO_ACCOUNTS[lowerEmail];
    if (demoAccount) {
      if (!verifyPasswordHash(password, demoAccount.passwordSha256)) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }
      const userPayload = {
        id: demoAccount.id,
        name: demoAccount.name,
        email: demoAccount.email,
        role: demoAccount.role,
        organizationId: demoAccount.organizationId,
        phone: demoAccount.phone,
        doctorId: demoAccount.doctorId,
        assistantId: demoAccount.assistantId,
        specialty: demoAccount.specialty,
        hospital_name: demoAccount.hospital_name,
        status: "active" as const,
      };
      const token = await signSessionToken(userPayload);
      return attachSessionCookie(
        NextResponse.json({ success: true, user: userPayload, token }),
        token
      );
    }

    // 2. Unified lookup across server fallback registry, Prisma User table, and Supabase profiles
    const found = await findAccountByEmail(lowerEmail);
    if (found.exists && found.user && found.user.passwordHash) {
      if (!verifyPasswordHash(password, found.user.passwordHash)) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
      return attachSessionCookie(
        NextResponse.json({ success: true, user: safeUser, token }),
        token
      );
    }

    // 3. Supabase Auth password sign-in fallback if user exists in Supabase Auth without profile password column
    if (isSupabaseConfigured) {
      try {
        const authResult = await Promise.race([
          supabase.auth.signInWithPassword({ email: lowerEmail, password }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
        ]);
        const authData = (authResult as any)?.data;
        const authErr = (authResult as any)?.error;
        if (!authErr && authData?.user) {
          const role: UserRole =
            found.user?.role ||
            (authData.user.user_metadata?.role as UserRole) ||
            "patient";
          const userPayload = {
            id: found.user?.id || authData.user.id,
            name: found.user?.name || authData.user.user_metadata?.name || lowerEmail.split("@")[0],
            email: lowerEmail,
            role,
            organizationId: found.user?.organizationId || "org-default",
            phone: found.user?.phone,
            doctorId: found.user?.doctorId,
            assistantId: found.user?.assistantId,
            status: "active" as const,
          };
          const token = await signSessionToken(userPayload);
          return attachSessionCookie(
            NextResponse.json({ success: true, user: userPayload, token }),
            token
          );
        }
      } catch {}
    }

    // 4. Backward-compatible localProfile fallback ONLY if local profile explicitly carries matching password
    if (body.localProfile && typeof body.localProfile === "object") {
      const lp = body.localProfile;
      if (
        lp.email &&
        normalizeEmail(lp.email) === lowerEmail &&
        lp.password &&
        verifyPasswordHash(password, String(lp.password))
      ) {
        const safeRole: UserRole =
          lp.role === "doctor" || lp.role === "hospital" || lp.role === "assistant"
            ? lp.role
            : "patient";
        const userPayload = {
          id: String(lp.id || `usr-${Date.now()}`),
          name: String(lp.name || lp.full_name || lowerEmail.split("@")[0]),
          email: lowerEmail,
          role: safeRole,
          organizationId: String(lp.organizationId || "org-default"),
          phone: lp.phone || undefined,
          status: "active" as const,
        };
        const token = await signSessionToken(userPayload);
        return attachSessionCookie(
          NextResponse.json({ success: true, user: userPayload, token }),
          token
        );
      }
    }

    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
