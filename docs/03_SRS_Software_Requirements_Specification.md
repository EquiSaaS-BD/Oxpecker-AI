# 03. Software Requirements Specification (SRS — IEEE 830)

| Metadata | Value |
| :--- | :--- |
| **Standard** | IEEE Std 830-1998 Adapted |
| **System** | Oxpecker AI Web Platform (`Frontend/`) & Clinical/HealthPass Engine (`Backend/`) |

---

## 1. Functional Requirements (FR)

### 1.1 Authentication, Session & RBAC
| Req ID | Requirement Description | Priority | Codebase Traceability |
| :--- | :--- | :---: | :--- |
| **FR-001** | System shall authenticate users via `POST /api/auth/session` using timing-safe SHA-256 verification (demo accounts), Prisma `User` lookup, or Supabase Auth, issuing an `HttpOnly` HMAC-SHA256 `oxpecker_session` cookie. | **P0** | `Frontend/src/app/api/auth/session/route.ts`, `Frontend/src/lib/server-auth.ts` |
| **FR-002** | Edge middleware shall intercept all role-exclusive routes (`/admin/*`, `/doctor/*`, `/hospital/*`, `/assistant/*`, `/chat/*`, `/dashboard/*`, `/health-card/*`, `/patient/*`, `/reports/*`, `/saved/*`), redirect unauthenticated requests to `/login`, and redirect unauthorized roles to their canonical home. | **P0** | `Frontend/src/middleware.ts`, `Frontend/src/lib/rbac.ts` |
| **FR-003** | Public discovery routes (`/doctors/*`, `/hospitals/*`, `/medicines/*`, `/scan/*`, `/emergency-reader`) shall remain accessible without breaking portal isolation for `/doctor/*` and `/hospital/*`. | **P0** | `Frontend/src/lib/rbac.ts` |

### 1.2 Multi-Tenancy & Clinical Persistence
| Req ID | Requirement Description | Priority | Codebase Traceability |
| :--- | :--- | :---: | :--- |
| **FR-004** | All tenant-owned APIs (`/api/patients`, `/api/prescriptions`, `/api/appointments`, `/api/hospital/hms`, `/api/automation`) shall require a valid session and scope queries/writes by `session.organizationId` (unless `admin`). | **P0** | `Frontend/src/app/api/{patients,prescriptions,appointments,hospital/hms,automation}/route.ts` |
| **FR-005** | Finalizing a prescription in `PrescriptionFinalizeModal` shall persist the record to PostgreSQL via `POST /api/prescriptions` with `savingsBdt` and `ddiAlertsCount` before triggering automation events. | **P1** | `Frontend/src/components/prescription/PrescriptionFinalizeModal.tsx` |
| **FR-006** | Doctor BMDC registration verification shall persist `bmdcRegNo` and `bmdcStatus` via `POST /api/doctor/verify-bmdc` and record an `AuditLog` (`BMDC_VERIFY`). | **P1** | `Frontend/src/app/api/doctor/verify-bmdc/route.ts` |

### 1.3 Medical Document Vault & Prescription Intelligence
| Req ID | Requirement Description | Priority | Codebase Traceability |
| :--- | :--- | :---: | :--- |
| **FR-007** | Uploaded medical files (`<= 15 MB`) shall undergo magic-byte signature validation (`JPEG`, `PNG`, `WEBP`, `PDF`) and be encrypted using **AES-256-GCM** before database storage. | **P0** | `Frontend/src/lib/medical-document-server.ts` |
| **FR-008** | Document access shall enforce authenticated `ownerId` matching (`getSessionUser`); unauthenticated or spoofed header/query IDs shall be rejected (`401`). | **P0** | `Frontend/src/lib/medical-document-server.ts`, `Frontend/src/app/api/medical-documents/route.ts` |
| **FR-009** | Prescription intelligence shall match extracted medicines against the DGDA medicine catalog using integer paisa pricing and return `NOT_FOUND` / `PRICE_UNAVAILABLE` rather than fabricating data. | **P1** | `Frontend/src/lib/prescription-intelligence.ts` |

### 1.4 HealthPass Cryptographic QR & Emergency Lookup
| Req ID | Requirement Description | Priority | Codebase Traceability |
| :--- | :--- | :---: | :--- |
| **FR-010** | Offline HealthPass QR payloads shall be encoded as `YUNET1:<base64>.<hmac32>` using synchronous FIPS 180-4 SHA-256 + RFC 2104 HMAC-SHA256. | **P0** | `Frontend/src/lib/healthpass-offline-qr.ts` |
| **FR-011** | `decodeOfflineQRPayload` shall verify the HMAC signature offline and return `null` on any payload or signature tampering. | **P0** | `Frontend/src/lib/healthpass-offline-qr.ts`, `Frontend/src/app/emergency-reader/page.tsx` |
| **FR-012** | Emergency patient lookup (`/api/emergency/patient`) shall sanitize query input against PostgREST operator injection, enforce rate limits, and write `EMERGENCY_LOOKUP` to `AuditLog`. | **P0** | `Frontend/src/app/api/emergency/patient/route.ts` |

### 1.5 Clinical Safety, AI Triage & Interoperability
| Req ID | Requirement Description | Priority | Codebase Traceability |
| :--- | :--- | :---: | :--- |
| **FR-013** | `checkPrescriptionSafety` shall detect duplicate generics, DDI pairs, allergy cross-reactivity, and pregnancy/pediatric/renal/hepatic contraindications. | **P0** | `Frontend/src/lib/clinical-safety.ts` |
| **FR-014** | AI chat & diagnosis routes shall enforce rate limiting (`30 req/min/IP`), non-medical boundary refusal, controlled-substance prescribing refusal, and `999`/`16263` emergency escalation. | **P0** | `Frontend/src/app/api/ai/chat/route.ts`, `Frontend/src/app/api/ai/diagnose/route.ts` |
| **FR-015** | System shall generate HL7 FHIR R4 `Bundle` (`Patient` + `MedicationStatement` with WHO ATC codes) aligned with DGHS SHR profiles. | **P1** | `Frontend/src/lib/dghs-fhir.ts` |

---

## 2. Non-Functional Requirements (NFR)

| Req ID | Category | Requirement | Verification |
| :--- | :--- | :--- | :--- |
| **NFR-001** | **Security** | Production builds shall fail-closed if `MEDICAL_DOCUMENT_ENCRYPTION_KEY`, `AUTH_SESSION_SECRET`, or FastAPI `SECRET_KEY` (outside dev/test) are missing. | `server-auth.ts`, `medical-document-server.ts`, `Backend/app/core/config.py` |
| **NFR-002** | **Security Headers** | All Next.js responses shall include `HSTS`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Content-Security-Policy`. | `Frontend/next.config.ts` |
| **NFR-003** | **3G Performance** | All public images in `public/images/` and `public/placeholders/` shall be compressed below `500 KB`, with `Cache-Control` headers on static assets and `/api/medicines/*`. | `Frontend/next.config.ts`, `public/` asset audit |
| **NFR-004** | **Resilience** | Database timeouts (`withDbTimeout`) shall gracefully fall back to seeded demo datasets (`INITIAL_HEALTH_CARDS`, static catalogs) so live clinical demos never crash. | `Frontend/src/lib/prisma.ts`, API routes |
| **NFR-005** | **Localization** | Clinical triage, safety alerts, and medicine guidance shall support both Bangla (`bn`) and English (`en`). | `clinical-safety.ts`, `clinical-engine.ts`, `ai/chat/route.ts` |
| **NFR-006** | **Abuse Prevention** | AI, emergency lookup, and biometric endpoints shall enforce per-IP sliding-window rate limits returning `429` + `Retry-After`. | `Frontend/src/lib/rate-limit.ts` |

---

## 3. External Interface Requirements
- **PostgreSQL / Supabase:** Primary relational & auth store via Prisma Client `v5.22.0` and `@supabase/supabase-js`.
- **FastAPI Clinical & Biometric Backend:** HTTP/JSON interface (`NEXT_PUBLIC_API_URL`, default `https://oxpecker-api.azurewebsites.net`) for `/api/v1/clinical-ai/diagnose` and `/api/v1/healthpass/face-match`.
- **AI / Multimodal Providers:** OpenAI, Google Gemini, Anthropic, DeepSeek, Azure OpenAI, and AssemblyAI (configured via environment variables / `AiProvider` table).
- **DGHS SHR / HL7 FHIR R4:** JSON `Bundle` export (`https://shr.dghs.gov.bd/fhir/StructureDefinition/*`, `http://www.whocc.no/atc`).
