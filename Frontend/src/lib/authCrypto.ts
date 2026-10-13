import crypto from "crypto";
import { SessionPayload, parseSessionPayload } from "./sessionPayload";

export type { SessionPayload };
export { parseSessionPayload };

const SESSION_SECRET = process.env.SESSION_SECRET || "oxpecker-super-secure-auth-secret-key-2026";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Hashes a plaintext password with a random 16-byte salt using PBKDF2 (SHA-512).
 * Result format: "<salt>:<derivedKeyHex>"
 */
export function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, usedSalt, 10000, 64, "sha512").toString("hex");
  return `${usedSalt}:${hash}`;
}

/**
 * Verifies a password against the stored string.
 * Handles both new PBKDF2 hashes and legacy plain-text entries for smooth migration.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  
  // Legacy plain-text fallback
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }

  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return testHash === originalHash;
}

/**
 * Creates an HMAC-SHA256 signed session token for the user.
 */
export function createSessionToken(user: { id: string; email: string; role: string; name: string }): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email.toLowerCase().trim(),
    role: user.role,
    name: user.name,
    exp: Date.now() + THIRTY_DAYS_MS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and parses an HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadBase64).digest("base64url");

  if (signature !== expectedSig) {
    return null; // Invalid signature
  }

  try {
    const jsonStr = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}


