import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/context/AuthContext";

export const SESSION_COOKIE_NAME = "oxpecker_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  doctorId?: string;
  assistantId?: string;
  exp?: number;
}

function getSessionSecret(): string {
  const secret =
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.MEDICAL_DOCUMENT_ENCRYPTION_KEY?.trim() ||
    process.env.SECRET_KEY?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET or MEDICAL_DOCUMENT_ENCRYPTION_KEY must be set in production.");
  }
  return "oxpecker-dev-hmac-session-secret-v1";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(user: Omit<SessionUser, "exp"> & { exp?: number }): Promise<string> {
  const payload: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId || "org-default",
    doctorId: user.doctorId,
    assistantId: user.assistantId,
    exp: user.exp || Date.now() + SESSION_TTL_MS,
  };
  const enc = new TextEncoder();
  const payloadB64 = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await getHmacKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sigBuf));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionUser | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const enc = new TextEncoder();
    const key = await getHmacKey();
    const sigBytes = fromBase64Url(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer.slice(sigBytes.byteOffset, sigBytes.byteOffset + sigBytes.byteLength) as ArrayBuffer,
      enc.encode(payloadB64)
    );
    if (!valid) return null;
    const json = new TextDecoder().decode(fromBase64Url(payloadB64));
    const parsed = JSON.parse(json) as SessionUser;
    if (!parsed?.id || !parsed?.role) return null;
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return {
      ...parsed,
      organizationId: parsed.organizationId || "org-default",
    };
  } catch {
    return null;
  }
}

export function extractCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  // 1. Check HTTP-only signed session cookie
  const cookieToken = extractCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (cookieToken) {
    const verified = await verifySessionToken(cookieToken);
    if (verified) return verified;
  }

  // 2. Check Authorization Bearer header (either signed session token or Supabase JWT)
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (bearer) {
    const verifiedSession = await verifySessionToken(bearer);
    if (verifiedSession) return verifiedSession;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey && !anonKey.includes("dummy")) {
      try {
        const authClient = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await authClient.auth.getUser(bearer);
        if (!error && data.user?.id) {
          const meta = data.user.user_metadata || {};
          return {
            id: data.user.id,
            email: data.user.email || "",
            name: meta.name || meta.full_name || data.user.email || "Authenticated User",
            role: (meta.role as UserRole) || "patient",
            organizationId: meta.organizationId || "org-default",
          };
        }
      } catch {}
    }
  }

  return null;
}

export async function requireSessionUser(
  request: Request,
  allowedRoles?: NonNullable<UserRole>[]
): Promise<{ user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const user = await getSessionUser(request);
  if (!user || !user.role) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: valid authenticated session is required." },
        { status: 401 }
      ),
    };
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: `Forbidden: role '${user.role}' is not permitted for this resource.` },
        { status: 403 }
      ),
    };
  }
  return { user };
}

export function attachSessionCookie(res: NextResponse, token: string): NextResponse {
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
