# 13. Architecture Decision Records (ADR) — Oxpecker AI

---

## ADR-001: WebCrypto Edge HMAC-SHA256 Sessions vs. Client-Only Auth
- **Status:** Accepted & Implemented (`Frontend/src/lib/server-auth.ts`, `Frontend/src/middleware.ts`)
- **Context:** Earlier authentication relied on client-side `localStorage` and email-substring heuristics, allowing trivial role spoofing and unauthorized portal navigation.
- **Decision:** Issue `HttpOnly`, `SameSite=Lax` `oxpecker_session` cookies signed with HMAC-SHA256 via standard Web Crypto API (`crypto.subtle`).
- **Consequences:** Both Next.js Edge Middleware and Node.js API Route Handlers verify identical cryptographic signatures without external session database roundtrips on every page load.

---

## ADR-002: Synchronous Pure-TypeScript HMAC-SHA256 for `YUNET1:` Offline QR
- **Status:** Accepted & Implemented (`Frontend/src/lib/healthpass-offline-qr.ts`)
- **Context:** Emergency paramedics in rural Bangladesh or disaster zones frequently lack internet connectivity when scanning a patient's HealthPass QR, yet ER teams must trust that blood group, allergies, and medications were not forged.
- **Decision:** Implement synchronous FIPS 180-4 SHA-256 + RFC 2104 HMAC-SHA256 directly in TypeScript (`YUNET1:<base64>.<hmac32>`) rather than async `crypto.subtle` or server-only verification.
- **Consequences:** `encodeOfflineQRPayload` and `decodeOfflineQRPayload` run synchronously in `< 50 ms` across both browser and Node.js with zero external dependencies or network calls.

---

## ADR-003: Dual Next.js + FastAPI Hybrid Architecture with DB-Offline Demo Resilience
- **Status:** Accepted & Implemented (`Frontend/src/app/api/*`, `Backend/main.py`)
- **Context:** Oxpecker AI serves both real-time web/clinical workflows (Next.js + Prisma) and Python-native clinical ML/biometric workloads (FastAPI), while also needing 100% reliability during live hospital pilots and hackathon/investor demos.
- **Decision:** Keep Next.js Route Handlers as the primary authenticated API gateway with `withDbTimeout` guards and deterministic fallback stores (`INITIAL_HEALTH_CARDS`, static catalogs, local cosine similarity, `clinical-engine.ts`) when PostgreSQL or FastAPI is unreachable.
- **Consequences:** Zero single-point-of-failure crashes during network or DB blips, while persisting real multi-tenant records whenever PostgreSQL is online.

---

## ADR-004: Shared-Schema Multi-Tenancy via Indexed `organizationId`
- **Status:** Accepted & Implemented (`Frontend/prisma/schema.prisma`)
- **Context:** Hospitals and clinics require strict tenant data isolation without the operational overhead of provisioning separate PostgreSQL databases per clinic.
- **Decision:** Introduce an `Organization` model and add indexed `organizationId` columns across `User`, `HealthPassCard`, `AuditLog`, `AutomationEvent`, `HmsBooking`, `HmsAdmission`, `HmsBill`, `Patient`, `Prescription`, `MedicalDocument`, `Doctor`, `Hospital`, and `Appointment`, enforced from the signed `oxpecker_session` token.
- **Consequences:** Low infrastructure cost per tenant, fast cross-hospital admin telemetry (`GET /api/admin/telemetry`), and clean row-level isolation at the API layer.
