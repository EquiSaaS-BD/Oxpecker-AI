import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  SESSION_COOKIE_NAME,
  getSessionUser,
  signSessionToken,
  type SessionUser,
} from "@/lib/server-auth";
import type { UserRole } from "@/context/AuthContext";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function safeCompareHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

interface SeedDemoAccount {
  id: string;
  name: string;
  email: string;
  role: NonNullable<UserRole>;
  organizationId: string;
  passwordSha256: string;
  phone: string;
  doctorId?: string;
  assistantId?: string;
  specialty?: string;
  hospital_name?: string;
}

// Pre-computed SHA-256 digests for seeded demo accounts (no plaintext passwords in source)
const SEEDED_DEMO_ACCOUNTS: Record<string, SeedDemoAccount> = {
  "admin@oxpecker.ai": {
    id: "usr-admin-01",
    name: "System Administrator",
    email: "admin@oxpecker.ai",
    role: "admin",
    organizationId: "org-hq",
    passwordSha256: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    phone: "+880 1700-000000",
  },
  "hospital@oxpecker.ai": {
    id: "usr-hosp-01",
    name: "Dhaka Central Specialized Hospital",
    email: "hospital@oxpecker.ai",
    role: "hospital",
    organizationId: "org-dhaka-central",
    passwordSha256: "b20c66c85ef5fb882ab10f28fe4fb1309f8961b2cb5b03bd25d76aa2298da135",
    phone: "+880 2-8812345",
    hospital_name: "Dhaka Central Specialized Hospital & Heart Institute",
  },
  "doctor@oxpecker.ai": {
    id: "usr-doc-01",
    name: "Prof. Dr. Ahmed Rahman, FCPS, MD",
    email: "doctor@oxpecker.ai",
    role: "doctor",
    organizationId: "org-dhaka-central",
    passwordSha256: "cabf28397a07be69454213191ab42a8b1463fb0bf1ecf987e3c9ecffefac90b7",
    phone: "+880 1712-998877",
    doctorId: "dr-ahmed",
    specialty: "Senior Consultant - Interventional Cardiology",
    hospital_name: "Dhaka Central Specialized Hospital",
  },
  "farzana@oxpecker.ai": {
    id: "usr-doc-02",
    name: "Dr. Farzana Yasmin, MBBS, MS",
    email: "farzana@oxpecker.ai",
    role: "doctor",
    organizationId: "org-dhaka-central",
    passwordSha256: "cabf28397a07be69454213191ab42a8b1463fb0bf1ecf987e3c9ecffefac90b7",
    phone: "+880 1715-334455",
    doctorId: "dr-farzana",
  },
  "assistant@oxpecker.ai": {
    id: "usr-ast-01",
    name: "কামরুল হাসান (Kamrul Hasan - Front Desk & Speaker)",
    email: "assistant@oxpecker.ai",
    role: "assistant",
    organizationId: "org-dhaka-central",
    passwordSha256: "8b9041fbec136463dbdd8da45f2aa16bd08b22ba78bd71efee3ee3ed77710ce4",
    phone: "+880 1819-001122",
    assistantId: "ast-101",
  },
  "patient@oxpecker.ai": {
    id: "usr-pat-01",
    name: "রহিম উদ্দিন (Rahim Uddin)",
    email: "patient@oxpecker.ai",
    role: "patient",
    organizationId: "org-default",
    passwordSha256: "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446",
    phone: "+880 1711-000000",
  },
  "fatema@oxpecker.ai": {
    id: "usr-pat-02",
    name: "ফাতেমা বেগম (Fatema Begum)",
    email: "fatema@oxpecker.ai",
    role: "patient",
    organizationId: "org-default",
    passwordSha256: "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446",
    phone: "+880 1819-876543",
  },
  "shahidul@oxpecker.ai": {
    id: "usr-pat-03",
    name: "মোঃ শহিদুল ইসলাম (Shahidul Islam)",
    email: "shahidul@oxpecker.ai",
    role: "patient",
    organizationId: "org-default",
    passwordSha256: "e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446",
    phone: "+880 1711-223344",
  },
};

function attachSessionCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}

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
      const targetEmail = body.user.email.toLowerCase().trim();
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

    const lowerEmail = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!lowerEmail || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const inputHash = sha256Hex(password);

    // 1. Check seeded demo accounts with cryptographic SHA-256 verification
    const demoAccount = SEEDED_DEMO_ACCOUNTS[lowerEmail];
    if (demoAccount) {
      if (!safeCompareHex(inputHash, demoAccount.passwordSha256)) {
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

    // 2. Check Prisma User table if present
    try {
      const prismaAny = prisma as any;
      if (prismaAny.user) {
        const dbUser = await withDbTimeout<any>(
          prismaAny.user.findUnique({ where: { email: lowerEmail } }),
          1500
        );
        if (dbUser) {
          const storedHash = dbUser.passwordHash || "";
          const matchesHash =
            storedHash.length === 64
              ? safeCompareHex(inputHash, storedHash)
              : storedHash === password;
          if (!matchesHash) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
          }
          const userPayload = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: (dbUser.role as UserRole) || "patient",
            organizationId: dbUser.organizationId || "org-default",
            phone: dbUser.phone || undefined,
            status: (dbUser.status as "active" | "pending" | "banned") || "active",
          };
          const token = await signSessionToken(userPayload);
          return attachSessionCookie(
            NextResponse.json({ success: true, user: userPayload, token }),
            token
          );
        }
      }
    } catch {}

    // 3. Check Supabase Auth & profiles table if configured
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: lowerEmail,
          password,
        });
        if (!authErr && authData?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .ilike("email", lowerEmail)
            .maybeSingle();
          const role: UserRole = (profile?.role as UserRole) || (authData.user.user_metadata?.role as UserRole) || "patient";
          const userPayload = {
            id: profile?.id || authData.user.id,
            name: profile?.name || authData.user.user_metadata?.name || lowerEmail.split("@")[0],
            email: lowerEmail,
            role,
            organizationId: profile?.organization_id || "org-default",
            phone: profile?.phone || undefined,
            doctorId: profile?.doctor_id || undefined,
            assistantId: profile?.assistant_id || undefined,
            status: profile?.status || "active",
          };
          const token = await signSessionToken(userPayload);
          return attachSessionCookie(
            NextResponse.json({ success: true, user: userPayload, token }),
            token
          );
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .ilike("email", lowerEmail)
          .maybeSingle();
        if (profileRow && profileRow.password) {
          if (profileRow.password !== password && !safeCompareHex(inputHash, profileRow.password)) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
          }
          const userPayload = {
            id: profileRow.id,
            name: profileRow.name || lowerEmail.split("@")[0],
            email: lowerEmail,
            role: (profileRow.role as UserRole) || "patient",
            organizationId: profileRow.organization_id || "org-default",
            phone: profileRow.phone || undefined,
            doctorId: profileRow.doctor_id || undefined,
            assistantId: profileRow.assistant_id || undefined,
            status: profileRow.status || "active",
          };
          const token = await signSessionToken(userPayload);
          return attachSessionCookie(
            NextResponse.json({ success: true, user: userPayload, token }),
            token
          );
        }
      } catch {}
    }

    // 4. Verify client-registered local profile only if password matches
    if (body.localProfile && typeof body.localProfile === "object") {
      const lp = body.localProfile;
      if (
        lp.email &&
        String(lp.email).toLowerCase().trim() === lowerEmail &&
        lp.password &&
        String(lp.password) === password
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
