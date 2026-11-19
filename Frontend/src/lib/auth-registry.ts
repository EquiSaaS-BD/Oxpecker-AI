import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { derive12DigitAssistantCode } from "@/lib/doctor-assistant-link";
import type { UserRole } from "@/context/AuthContext";

export interface SeedDemoAccount {
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

export interface RegisteredServerUser {
  id: string;
  name: string;
  email: string;
  role: NonNullable<UserRole>;
  organizationId: string;
  passwordHash?: string;
  phone?: string;
  address?: string;
  specialty?: string;
  hospital_name?: string;
  doctorId?: string;
  assistantId?: string;
  bmdcRegNo?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  image?: string;
  status: "active" | "pending" | "banned";
  createdAt?: string;
}

export const SEEDED_DEMO_ACCOUNTS: Record<string, SeedDemoAccount> = {
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
    assistantId: "880000101101",
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

const g = globalThis as typeof globalThis & {
  __oxpeckerRegisteredUsers?: Map<string, RegisteredServerUser>;
};

function getRegisteredUserMap(): Map<string, RegisteredServerUser> {
  if (!g.__oxpeckerRegisteredUsers) {
    g.__oxpeckerRegisteredUsers = new Map();
  }
  return g.__oxpeckerRegisteredUsers;
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function safeCompareHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function hashPasswordScrypt(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hex] = parts;
    if (!salt || !hex) return false;
    try {
      const derived = scryptSync(password, salt, 64);
      const storedBuf = Buffer.from(hex, "hex");
      if (derived.length !== storedBuf.length) return false;
      return timingSafeEqual(derived, storedBuf);
    } catch {
      return false;
    }
  }
  if (storedHash.length === 64 && /^[a-f0-9]+$/i.test(storedHash)) {
    return safeCompareHex(sha256Hex(password), storedHash);
  }
  return storedHash === password;
}

export function normalizeEmail(rawEmail: string): string {
  return String(rawEmail || "").trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function slugifyOrg(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || `org-${Date.now()}`
  );
}

async function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function findAccountByEmail(rawEmail: string): Promise<{
  exists: boolean;
  source?: "seeded" | "memory" | "prisma" | "supabase";
  user?: RegisteredServerUser;
}> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { exists: false };

  // 1. Seeded demo accounts
  const seeded = SEEDED_DEMO_ACCOUNTS[email];
  if (seeded) {
    return {
      exists: true,
      source: "seeded",
      user: {
        id: seeded.id,
        name: seeded.name,
        email: seeded.email,
        role: seeded.role,
        organizationId: seeded.organizationId,
        passwordHash: seeded.passwordSha256,
        phone: seeded.phone,
        doctorId: seeded.doctorId,
        assistantId: seeded.assistantId,
        specialty: seeded.specialty,
        hospital_name: seeded.hospital_name,
        status: "active",
      },
    };
  }

  // 2. Server fallback registry (instant in-process check)
  const mem = getRegisteredUserMap().get(email);
  if (mem) {
    return { exists: true, source: "memory", user: mem };
  }

  // 3. Prisma User table
  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await withDbTimeout(
        prisma.user.findUnique({ where: { email } }),
        1200
      );
      if (dbUser) {
        return {
          exists: true,
          source: "prisma",
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: (dbUser.role as NonNullable<UserRole>) || "patient",
            organizationId: dbUser.organizationId || "org-default",
            passwordHash: dbUser.passwordHash || undefined,
            phone: dbUser.phone || undefined,
            specialty: dbUser.specialty || undefined,
            hospital_name: dbUser.hospitalName || undefined,
            bmdcRegNo: dbUser.bmdcRegNo || undefined,
            assistantId:
              dbUser.role === "assistant"
                ? derive12DigitAssistantCode(dbUser.id || dbUser.email)
                : undefined,
            status: (dbUser.status as "active" | "pending" | "banned") || "active",
          },
        };
      }
    } catch {
      // Non-fatal fallback
    }
  }

  // 4. Supabase profiles check (bounded by strict 1200ms timeout so it never hangs)
  if (isSupabaseConfigured) {
    try {
      const sbResult = await raceTimeout(
        (async () =>
          await supabase
            .from("profiles")
            .select("*")
            .ilike("email", email)
            .maybeSingle())(),
        1200
      );
      const profile = (sbResult as any)?.data;
      if (profile && profile.email) {
        return {
          exists: true,
          source: "supabase",
          user: {
            id: String(profile.id || `sb-${Date.now()}`),
            name: String(profile.name || email.split("@")[0]),
            email: normalizeEmail(profile.email),
            role: (profile.role as NonNullable<UserRole>) || "patient",
            organizationId: String(profile.organization_id || "org-default"),
            passwordHash: profile.password || undefined,
            phone: profile.phone || undefined,
            specialty: profile.specialty || undefined,
            hospital_name: profile.hospital_name || undefined,
            assistantId:
              profile.assistant_id ||
              (profile.role === "assistant"
                ? derive12DigitAssistantCode(profile.id || email)
                : undefined),
            status: (profile.status as "active" | "pending" | "banned") || "active",
          },
        };
      }
    } catch {
      // Timeout or network issue ignored
    }
  }

  return { exists: false };
}

export interface RegisterAccountInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
  address?: string;
  specialty?: string;
  hospitalName?: string;
  bmdcRegNo?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  image?: string;
  isOAuth?: boolean;
}

const ALLOWED_SIGNUP_ROLES = new Set(["patient", "doctor", "assistant", "hospital"]);

export async function registerNewAccount(input: RegisterAccountInput): Promise<{
  success: boolean;
  status: number;
  code?: string;
  error?: string;
  user?: Omit<RegisteredServerUser, "passwordHash">;
}> {
  const email = normalizeEmail(input.email);
  const name = String(input.name || "").trim();
  const role = String(input.role || "patient").trim().toLowerCase();

  if (!name) {
    return { success: false, status: 400, code: "VALIDATION_ERROR", error: "Full name is required." };
  }
  if (!email || !isValidEmailFormat(email)) {
    return { success: false, status: 400, code: "INVALID_EMAIL", error: "Please provide a valid email address." };
  }
  if (!ALLOWED_SIGNUP_ROLES.has(role)) {
    return { success: false, status: 403, code: "FORBIDDEN_ROLE", error: "Invalid or restricted role selected." };
  }
  if (!input.isOAuth) {
    const pwd = String(input.password || "");
    if (pwd.length < 8) {
      return {
        success: false,
        status: 400,
        code: "WEAK_PASSWORD",
        error: "Password must be at least 8 characters.",
      };
    }
  }

  // Strict 1-email-1-account check across ALL backing stores
  const existing = await findAccountByEmail(email);
  if (existing.exists) {
    return {
      success: false,
      status: 409,
      code: "EMAIL_ALREADY_EXISTS",
      error:
        "An account with this email already exists. Please sign in instead. (এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।)",
    };
  }

  const userId = `usr-${Date.now()}-${randomBytes(3).toString("hex")}`;
  const typedRole = role as NonNullable<UserRole>;
  const passwordHash = input.password ? hashPasswordScrypt(input.password) : undefined;
  const organizationId =
    typedRole === "hospital" ? `org-${slugifyOrg(input.hospitalName || name)}` : "org-default";
  const assistantId = typedRole === "assistant" ? derive12DigitAssistantCode(userId || email) : undefined;
  const doctorId = typedRole === "doctor" ? `dr-${slugifyOrg(name).slice(0, 18)}` : undefined;

  const newUser: RegisteredServerUser = {
    id: userId,
    name,
    email,
    role: typedRole,
    organizationId,
    passwordHash,
    phone: input.phone || undefined,
    address: input.address || undefined,
    specialty: input.specialty || undefined,
    hospital_name: input.hospitalName || (typedRole === "hospital" ? name : undefined),
    bmdcRegNo: input.bmdcRegNo || undefined,
    assistantId,
    doctorId,
    date_of_birth: input.dateOfBirth || undefined,
    gender: input.gender || undefined,
    blood_group: input.bloodGroup || undefined,
    image: input.image || undefined,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // Persist to PostgreSQL first (bounded timeout)
  if (process.env.DATABASE_URL) {
    try {
      if (typedRole === "hospital") {
        await withDbTimeout(
          prisma.organization.upsert({
            where: { slug: organizationId },
            update: { name: newUser.hospital_name || name, phone: newUser.phone || null, address: newUser.address || null },
            create: {
              id: organizationId,
              slug: organizationId,
              name: newUser.hospital_name || name,
              type: "hospital",
              phone: newUser.phone || null,
              address: newUser.address || null,
            },
          }),
          1200
        );
      }

      await withDbTimeout(
        prisma.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            passwordHash: newUser.passwordHash || null,
            role: newUser.role,
            status: "active",
            phone: newUser.phone || null,
            organizationId: newUser.organizationId,
            bmdcRegNo: newUser.bmdcRegNo || null,
            bmdcStatus: typedRole === "doctor" && newUser.bmdcRegNo ? "pending" : "none",
            specialty: newUser.specialty || null,
            hospitalName: newUser.hospital_name || null,
          },
        }),
        1500
      );
    } catch (err: any) {
      // Unique constraint catch (P2002)
      if (err?.code === "P2002") {
        return {
          success: false,
          status: 409,
          code: "EMAIL_ALREADY_EXISTS",
          error:
            "An account with this email already exists. Please sign in instead. (এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।)",
        };
      }
    }
  }

  // Always store in server in-memory registry so offline / fallback sessions stay consistent
  getRegisteredUserMap().set(email, newUser);

  // Strip passwordHash before returning
  const safeUser = { ...newUser };
  delete safeUser.passwordHash;
  return {
    success: true,
    status: 201,
    user: safeUser,
  };
}
