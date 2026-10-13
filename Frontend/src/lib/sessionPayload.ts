export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  exp: number;
}

/**
 * Edge-safe lightweight session payload parser for Middleware.
 * Decodes base64url payload without Node.js crypto module.
 */
export function parseSessionPayload(token?: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const jsonStr = atob(b64 + pad);
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
