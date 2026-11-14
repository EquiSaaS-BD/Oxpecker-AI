# 02. Product Requirements Document (PRD) — Oxpecker AI

| Metadata | Value |
| :--- | :--- |
| **Product** | Oxpecker AI — Multi-Tenant Healthcare SaaS |
| **Target Users** | Patients, Physicians (BMDC), Hospitals/Clinics, Doctor Assistants, Platform Admins, ER Responders |
| **Languages** | Bangla (`bn`), Banglish (transliterated), English (`en`) |

---

## 1. User Personas & Portal Mapping

| Persona | Role Key | Canonical Home Route | Primary Goals |
| :--- | :--- | :--- | :--- |
| **Patient / Citizen** | `patient` | `/dashboard` | Check symptoms in Bangla/English, scan prescriptions for generic savings, store encrypted lab reports, carry HealthPass QR |
| **Physician (Doctor)** | `doctor` | `/doctor/dashboard` | Write prescriptions rapidly with Smart Pad, catch DDIs/contraindications in real time, verify BMDC status, export DGHS FHIR |
| **Hospital / Clinic** | `hospital` | `/hospital/dashboard` | Manage OPD bookings, IPD bed/ward admissions, billing, doctor roster, and emergency HealthPass check-ins |
| **Doctor Assistant** | `assistant` | `/assistant` | Manage chamber queue, patient intake, vitals pre-fill, and TV monitor display |
| **System Admin** | `admin` | `/admin/dashboard` | Monitor national telemetry, AI provider health/logs, audit logs, users, and medicine catalogs |
| **Emergency Responder** | Public / Auth | `/emergency-reader`, `/scan/[cardId]` | Decode offline `YUNET1:` QR cards instantaneously without internet; perform audited emergency patient lookup |

---

## 2. Core Feature Specifications

### 2.1 Multilingual AI Clinical Triage (`/chat`, `/api/ai/chat`, `/api/ai/diagnose`)
- **Capability:** Accepts Bangla, Banglish, and English symptom queries, food/nutrition queries, prescription questions, and hospital/doctor discovery requests.
- **Grounding:** Combines local deterministic clinical analysis (`clinical-engine.ts`), hybrid medical RAG (`medical-rag.ts`), and optional FastAPI diagnosis (`/api/v1/clinical-ai/diagnose`).
- **Safety:** Enforces medical-only domain boundaries, forbids autonomous prescribing of controlled narcotics/sedatives/steroids/restricted antibiotics, and escalates red-flag symptoms immediately to **999** / **16263**.

### 2.2 Doctor Smart Pad & Clinical Safety Engine (`/doctor/dashboard/prescription/new`, `clinical-safety.ts`)
- **Capability:** Enables doctors to compose prescriptions, search DGDA medicine brands/generics, calculate generic price savings (`savingsBdt`), and finalize directly to PostgreSQL via `POST /api/prescriptions`.
- **Real-Time Guardrails (`checkPrescriptionSafety`):**
  - **Duplicate Therapy:** Flags multiple brands of the same generic.
  - **Drug-Drug Interactions (DDI):** Pairwise clinical rules (`CONTRAINDICATED`, `MAJOR`, `MODERATE`).
  - **Allergy Cross-Reactivity:** Matches patient allergies against drug classes.
  - **Special Population & Organ Contraindications:** Pregnancy/Lactation, Pediatric (`< 16 yrs`), Renal/CKD (`eGFR < 45`), and Hepatic impairment.

### 2.3 HealthPass Offline Cryptographic QR (`/health-card`, `/emergency-reader`, `/scan/[cardId]`)
- **Capability:** Encodes patient emergency profile (Health ID, name, blood group, DOB, emergency guardian, allergies, chronic diseases, current meds, organ donor flag) into a `YUNET1:<base64>.<hmac32>` URL fragment.
- **Offline Integrity:** Paramedics scan and decode the QR in `/emergency-reader` with **zero internet**. Any tampering with payload or signature causes `decodeOfflineQRPayload` to return `null` and display a tamper warning.
- **Auditability:** Scans and emergency lookups record `QR_SCAN` / `EMERGENCY_LOOKUP` events in `AuditLog`.

### 2.4 Prescription OCR & Encrypted Medical Vault (`/reports`, `/api/medical-documents`, `/api/prescriptions/intelligence`)
- **Capability:** Uploads JPEG, PNG, WEBP, or PDF prescriptions/lab reports (up to 15 MB), validates magic bytes, runs multimodal OCR + medicine matching, compares DGDA generic prices, and stores files encrypted at rest with **AES-256-GCM**.

### 2.5 Hospital Management System (HMS) (`/hospital/dashboard/*`, `/api/hospital/hms`)
- **Capability:** Manages OPD bookings (`HmsBooking`), IPD ward/bed admissions (`HmsAdmission`), and patient billing (`HmsBill`), scoped by `organizationId`.

### 2.6 BMDC Verification & Biometric Onboarding (`/doctor/settings/education`, `/api/doctor/verify-bmdc`, `/api/biometrics/*`)
- **Capability:** Physicians submit BMDC registration numbers persisted server-side with `BMDC_VERIFY` audit logging. HealthPass onboarding supports deterministic face-match similarity (proxied to FastAPI `/api/v1/healthpass/face-match` with local cosine fallback) and NID OCR extraction (`callMultimodalVision`).

---

## 3. User Stories & Acceptance Criteria (Summary)

| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **US-01** | As a **Patient**, I want to ask health questions in Bangla so I understand symptoms and when to seek urgent care. | AI responds in Bangla; red-flag cardiac/stroke/anaphylaxis queries surface `999` / `16263` escalation; non-medical prompts are refused. |
| **US-02** | As a **Doctor**, I want automatic alerts if I prescribe an NSAID to a CKD patient or a Statin to a pregnant patient. | `checkPrescriptionSafety` returns `CRITICAL` (`CONTRAINDICATED`) alert in English and Bangla before finalization. |
| **US-03** | As an **ER Responder**, I want to scan a patient's HealthPass QR during an internet outage and know it wasn't forged. | `/emergency-reader` decodes `YUNET1:` offline and verifies the 32-char HMAC-SHA256 signature; tampered payloads are rejected. |
| **US-04** | As a **Hospital Admin**, I want my hospital's patients, bookings, and prescriptions isolated from other clinics. | All authenticated API queries filter by `session.organizationId`; cross-role portal access is blocked with `403` / redirect. |
| **US-05** | As a **Platform Admin**, I want live telemetry on users, DDI hazards prevented, and emergency lookups. | `GET /api/admin/telemetry` (admin-only) returns live Prisma counts and recent `AuditLog` entries. |

---

## 4. Explicit Non-Goals (Current Release)
- **No Payment Processing:** Billing/checkout UI stubs remain non-transactional (`[PLANNED / ROADMAP]`).
- **No OTP Gates:** Login, registration, and HealthPass flows do not enforce SMS or Email OTP verification.
- **No Visual Redesign:** Existing Tailwind UI/UX layouts remain frozen across all portals.
