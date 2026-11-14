# 07. API Contract Specification — Oxpecker AI

---

## 1. Standard Error & Auth Conventions
- **`401 Unauthorized`:** Missing, expired, or invalid HMAC signature on `oxpecker_session` cookie.
- **`403 Forbidden`:** Authenticated user's `role` is not permitted for the target endpoint.
- **`429 Too Many Requests`:** Sliding-window rate limit exceeded (includes `Retry-After` header).
- **`400 Bad Request` / `500 Internal Server Error`:** Validation failure or unhandled server error (`{ error: string }`).

---

## 2. Next.js Route Handlers (`Frontend/src/app/api/*`)

### 2.1 Auth, Admin & Doctor Verification
| Method | Endpoint | Auth / Role | Rate Limit | Summary |
| :--- | :--- | :--- | :---: | :--- |
| `GET/POST/DELETE` | `/api/auth/session` | Public (`POST`), Session (`GET`) | — | Issues, reads, or clears `HttpOnly` HMAC-SHA256 `oxpecker_session` cookie |
| `GET` | `/api/admin/telemetry` | `admin` | — | Returns live Prisma counts (`usersByRole`, `totalSavingsBdt`, `ddiHazardsPrevented`, `recentAuditLogs`) |
| `GET/POST` | `/api/doctor/verify-bmdc` | `doctor`, `admin` | — | Persists & retrieves BMDC registration number and logs `BMDC_VERIFY` audit |

### 2.2 Clinical, HMS & Multi-Tenant Operations
| Method | Endpoint | Auth / Role | Summary |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/patients` | Authenticated (`organizationId` scoped) | Lists or creates patients; falls back to `INITIAL_HEALTH_CARDS` if DB offline |
| `GET/POST` | `/api/prescriptions` | Authenticated (`doctor`/`admin` on write) | Lists or saves digital prescriptions with `savingsBdt` and `ddiAlertsCount` |
| `GET/POST/PATCH` | `/api/appointments` | Authenticated (`organizationId` scoped) | Creates, lists, and updates patient-doctor appointments |
| `GET/POST/PATCH` | `/api/hospital/hms` | Authenticated (`organizationId` scoped) | Manages `HmsBooking`, `HmsAdmission`, and `HmsBill` records |
| `GET/POST` | `/api/automation` | Authenticated (`organizationId` scoped) | Lists or records `AutomationEvent` dispatches |
| `GET/POST/DELETE` | `/api/medical-documents` | Authenticated (`ownerId` scoped) | Uploads (AES-256-GCM encrypted), lists, or deletes patient medical documents |

### 2.3 Emergency, HealthPass QR & Biometrics
| Method | Endpoint | Auth / Role | Rate Limit | Summary |
| :--- | :--- | :--- | :---: | :--- |
| `GET/POST` | `/api/emergency/patient` | Authenticated | Yes | Sanitizes query against PostgREST injection; logs `EMERGENCY_LOOKUP` in `AuditLog` |
| `POST` | `/api/healthpass/sign` | Authenticated / Public verify | — | Signs `YUNET1:` payloads server-side, verifies signatures, and logs `QR_SCAN` |
| `POST` | `/api/biometrics/face-match` | Public / Onboarding | Yes | Proxies to FastAPI `/api/v1/healthpass/face-match` with 64-dim cosine similarity fallback |
| `POST` | `/api/biometrics/nid-extract` | Public / Onboarding | Yes | Extracts NID fields via multimodal OCR (`callMultimodalVision`) with demo registry fallback |
| `GET/POST` | `/api/emergency/search`, `/api/emergency/visual-search` | Public | — | Emergency facility & visual triage lookup |

### 2.4 AI Clinical Triage & Intelligence
| Method | Endpoint | Auth / Role | Rate Limit | Summary |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/ai/chat` | Public / Patient | `30 / min` | Streaming SSE bilingual clinical RAG chat with controlled-substance & `999` guardrails |
| `POST` | `/api/ai/diagnose` | Public / Patient | `30 / min` | Edge runtime symptom diagnosis combining `clinical-engine.ts` + FastAPI backend |
| `POST` | `/api/ai/analyze-prescription`, `/api/ai/analyze-report`, `/api/ai/analyze-food`, `/api/ai/analyze-image` | Public / Auth | — | Multimodal document, lab report, nutrition, and clinical image analysis |
| `POST` | `/api/ai/transcribe`, `/api/ai/assemblyai-token`, `/api/ai/generate-title`, `/api/chat` | Public / Auth | — | Voice transcription, AssemblyAI token, thread title generation, and chat persistence |
| `POST` | `/api/prescriptions/intelligence` | Public / Auth | — | Structured prescription medicine matching & DGDA paisa price comparison |

### 2.5 Public Discovery & Geo Search
- `GET /api/doctors/search` (Prisma `Doctor` + static merge)
- `GET /api/hospitals/search`, `GET /api/hospitals/all` (Prisma `Hospital` + static merge)
- `GET /api/medicines/search`, `GET /api/medicines/all`, `GET /api/medicines/[id]`, `POST /api/medicines/translate`
- `GET /api/diagnostics/search`, `GET /api/location/autocomplete`, `GET /api/location/reverse`

---

## 3. FastAPI Backend Endpoints (`Backend/app/api/*`)

| Prefix | Module | Key Capabilities |
| :--- | :--- | :--- |
| `/` | `Backend/main.py` | Root Azure App Service health probe (`service`, `version`, `status: "online"`) |
| `/api/v1/health` | `Backend/app/api/v1/health.py` | Liveness & readiness diagnostics |
| `/api/v1/auth` | `Backend/app/api/v1/auth.py` | JWT login/refresh with environment-aware `Secure` cookies |
| `/api/v1/profile` | `Backend/app/api/v1/profile.py` | User clinical profile management |
| `/api/v1/healthpass` | `Backend/app/api/v1/healthpass.py` | Biometric `face-match` vector similarity & HealthPass endpoints |
| `/api/v1/clinical-ai` | `Backend/app/api/v1/clinical_ai.py` | Symptom-to-disease matching engine (150 diseases, 9,600 clinical cases) |
| `/api/chat` | `Backend/app/api/chat.py` | Backend chat assistant router |

---

## 4. HL7 FHIR R4 Bundle Contract (`Frontend/src/lib/dghs-fhir.ts`)
```json
{
  "resourceType": "Bundle",
  "id": "oxpecker-dghs-bundle-<timestamp>",
  "meta": {
    "lastUpdated": "2026-11-13T12:00:00.000Z",
    "profile": ["https://shr.dghs.gov.bd/fhir/StructureDefinition/dghs-medication-bundle"]
  },
  "type": "collection",
  "entry": [
    { "fullUrl": "urn:uuid:patient-<id>", "resource": { "resourceType": "Patient" } },
    { "fullUrl": "urn:uuid:med-statement-<id>-0", "resource": { "resourceType": "MedicationStatement", "status": "active" } }
  ]
}
```
