# 08. Security, Compliance & DGHS FHIR — Oxpecker AI

---

## 1. Threat Model & Implemented Defenses

| Threat Vector | Mitigation in Codebase | Verified File(s) |
| :--- | :--- | :--- |
| **Client-Side Role Spoofing** | Removed email-substring role detection on login; all portals enforced server-side via `oxpecker_session` HMAC-SHA256 cookie in Edge Middleware | `Frontend/src/middleware.ts`, `Frontend/src/app/(auth)/login/page.tsx`, `Frontend/src/lib/server-auth.ts` |
| **IDOR on Medical Documents** | Replaced header/query/fallback user ID trust with `getSessionUser(request)`; owner-scoped Prisma queries | `Frontend/src/lib/medical-document-server.ts`, `Frontend/src/app/api/medical-documents/route.ts` |
| **Cross-Tenant Data Leakage** | `organizationId` embedded in signed session token and enforced on `patients`, `prescriptions`, `appointments`, `hospital/hms`, `automation` | `Frontend/prisma/schema.prisma`, `Frontend/src/app/api/*` |
| **PostgREST Filter Injection** | Strict regex allowlist sanitization (`[^a-zA-Z0-9\s\-+]`) on emergency lookup query before `.or()` | `Frontend/src/app/api/emergency/patient/route.ts` |
| **Forged Emergency QR Codes** | `YUNET1:<base64>.<hmac32>` verified via constant-time comparison; tampered tokens return `null` | `Frontend/src/lib/healthpass-offline-qr.ts` |
| **Malicious File Upload** | 15 MB cap + magic-byte signature validation (`JPEG`, `PNG`, `WEBP`, `PDF`) before OCR/storage | `Frontend/src/lib/medical-document-server.ts` |
| **AI / Biometric / ER Abuse** | Sliding-window per-IP rate limiter (`429` + `Retry-After`) | `Frontend/src/lib/rate-limit.ts` |
| **Weak Production Secrets** | Production fail-closed checks on `AUTH_SESSION_SECRET`, `MEDICAL_DOCUMENT_ENCRYPTION_KEY`, and FastAPI `SECRET_KEY`; `.db` & key files untracked in `.gitignore` | `server-auth.ts`, `medical-document-server.ts`, `Backend/app/core/config.py`, `.gitignore` |

---

## 2. Cryptographic Architecture

### 2.1 Medical Document Vault (AES-256-GCM)
- **Key Derivation:** 32-byte key from `MEDICAL_DOCUMENT_ENCRYPTION_KEY` (hex, base64, or SHA-256 digest; required in production).
- **Ciphertext Layout:** `iv (12 bytes) || authTag (16 bytes) || ciphertext (N bytes)`.
- **Integrity:** GCM authentication tag prevents silent ciphertext tampering.

### 2.2 Session Tokens (WebCrypto HMAC-SHA256)
- **Format:** `<base64url(SessionUser JSON)>.<base64url(HMAC-SHA256)>`
- **Cookie Flags:** `HttpOnly`, `SameSite=Lax`, `Secure` in production, 30-day TTL.
- **Edge Parity:** Uses standard `crypto.subtle` so Edge Middleware and Node API routes share identical verification logic.

### 2.3 Offline HealthPass QR (`YUNET1:`)
- **Algorithm:** Pure-TypeScript FIPS 180-4 SHA-256 + RFC 2104 HMAC-SHA256 (`128-bit` / `32-hex` truncated MAC) for offline browser/Node parity.
- **Verification:** Constant-time XOR comparison inside `verifyYunetSignature`.

---

## 3. HTTP Security Headers (`Frontend/next.config.ts`)
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `origin-when-cross-origin`
- `Permissions-Policy`: `camera=(self), microphone=(self), geolocation=(self)`
- `Content-Security-Policy`: Restricts `default-src 'self'`, allows controlled `script-src`/`style-src`/`img-src`/`connect-src`, and whitelists YouTube & Google Calendar frames.

---

## 4. HIPAA-Grade Privacy & DGHS SHR / WHO ATC Alignment

| Standard / Requirement | Implementation Status | Details |
| :--- | :---: | :--- |
| **Access Control & Audit Trail** | **Implemented** | `AuditLog` tracks `EMERGENCY_LOOKUP`, `QR_SCAN`, `BMDC_VERIFY` with `actorId`, `actorRole`, `organizationId`, `targetId`, `createdAt` |
| **Encryption at Rest (PHI)** | **Implemented** | AES-256-GCM on uploaded prescriptions/reports (`MedicalDocument.image`) |
| **DGHS SHR HL7 FHIR R4** | **Implemented** | `generateDGHSFHIRBundle()` emits `Patient` (`https://shr.dghs.gov.bd/fhir/StructureDefinition/dghs-patient`) and `MedicationStatement` with `http://www.whocc.no/atc` coding |
| **Direct National SHR Push** | `[PLANNED / ROADMAP]` | Requires official DGHS HIE/SHR institutional credentials & mutual TLS onboarding |
