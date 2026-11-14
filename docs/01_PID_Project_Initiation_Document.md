# 01. Project Initiation Document (PID) — Oxpecker AI

| Metadata | Value |
| :--- | :--- |
| **Project Name** | Oxpecker AI (Multi-Tenant Healthcare SaaS & Clinical Intelligence Platform) |
| **Document Version** | `1.0.0` (Production-Hardened Baseline) |
| **Target Markets** | Bangladesh (Primary: DGDA/DGHS/BMDC ecosystem), Emerging Markets (South Asia) |
| **Business Model** | B2B (Hospitals, Clinics, Diagnostic Centers, Chambers) + B2C (Patients, Caregivers) + B2G (DGHS/NGO Interoperability) |

---

## 1. Executive Summary

**Oxpecker AI** is an integrated, multi-tenant digital healthcare SaaS platform uniting:
1. **Multilingual Clinical AI Triage (Bangla, Banglish, English):** Hybrid RAG grounded in DGDA medicine pricing, clinical monographs, and live research, paired with red-flag emergency escalation (`999` / `16263`).
2. **Doctor Smart Pad & Clinical Decision Support (CDS):** Fast digital prescribing with real-time Drug-Drug Interaction (DDI), duplicate-generic, allergy cross-reactivity, and pregnancy/pediatric/renal/hepatic contraindication checks.
3. **Smart HealthPass (`YUNET1:` Offline Cryptographic QR):** Zero-internet emergency medical summary readable by paramedics and ER teams even during network blackouts.
4. **Hospital Management System (HMS) & Assistant Queue:** Multi-tenant OPD bookings, IPD bed/ward admissions, billing, and live TV/queue monitoring.
5. **DGHS Shared Health Record (SHR) & HL7 FHIR R4 Export:** Standards-compliant patient and medication bundle generation with WHO ATC coding.

---

## 2. Problem Statement

Healthcare delivery in Bangladesh and comparable emerging markets suffers from five systemic bottlenecks:
- **Prescription Errors & Unchecked Polypharmacy:** Handwritten paper prescriptions and high OPD patient volume lead to avoidable DDIs, duplicate generics, and contraindicated prescriptions in pregnancy, pediatric, CKD, and liver disease patients.
- **Opaque Medicine Pricing:** Patients frequently overpay for branded generics when DGDA-approved bioequivalent alternatives exist at significantly lower cost.
- **Zero Emergency Continuity:** Unconscious or trauma patients arrive at ERs with no accessible allergy, blood group, chronic condition, or medication history—especially in rural areas with unstable 3G/4G connectivity.
- **Fragmented Hospital Workflows:** Clinics rely on disconnected paper registers for appointments, admissions, billing, and prescriptions.
- **Lack of Interoperable Health Records:** Patient data is locked in siloed PDFs or local desktops rather than structured HL7 FHIR R4 records aligned with DGHS SHR standards.

---

## 3. Business Case & Revenue Alignment

| Segment | Target Customer | Core Value Delivered | Codebase Support |
| :--- | :--- | :--- | :--- |
| **B2B SaaS** | Hospitals, Clinics, Group Practices | Multi-tenant HMS (bookings, admissions, billing), Doctor Smart Pad, BMDC-verified doctor directory, Assistant queue | `Organization` / `organizationId` isolation across `Prisma` models, `/hospital/*`, `/doctor/*`, `/assistant/*` |
| **B2C Platform** | Citizens, Patients, Chronic Care Families | Bilingual AI health assistant, prescription OCR & generic price comparator, encrypted medical document vault, HealthPass QR | `/chat`, `/dashboard`, `/health-card`, `/reports`, `/medicines` |
| **B2G / NGO** | DGHS, ICT Division, Public Hospitals, NGOs | HL7 FHIR R4 Bundle export (`WHO ATC`), offline `YUNET1:` emergency QR, national telemetry & audit logs | `dghs-fhir.ts`, `healthpass-offline-qr.ts`, `/api/admin/telemetry`, `AuditLog` |

> **Scope Note (`[PLANNED / ROADMAP]`):** Automated payment gateway checkouts (SSLCommerz, bKash, Nagad, Stripe) and SMS/Email OTP verification gates are intentionally excluded from the current release and tracked separately for commercial billing rollout.

---

## 4. Project Scope

### 4.1 In-Scope (Implemented & Verified)
- Server-enforced Edge RBAC (`patient`, `doctor`, `hospital`, `assistant`, `admin`) via `HttpOnly` HMAC-SHA256 `oxpecker_session` cookies.
- Multi-tenant data scoping (`organizationId`) across clinical, HMS, prescription, and audit models.
- Clinical Safety Engine (`checkPrescriptionSafety`) covering DDI, duplicate generics, allergy cross-reactivity, pregnancy/lactation, pediatric (`<16 yrs`), renal (`eGFR < 45` / CKD), and hepatic impairment.
- AES-256-GCM encrypted medical document vault (`/api/medical-documents`) with magic-byte validation.
- Cryptographically signed offline emergency QR (`YUNET1:`) with tamper rejection and ER lookup audit trail.
- Bilingual AI Triage (`/api/ai/chat`, `/api/ai/diagnose`) with rate limiting and controlled-substance / `999` emergency guardrails.
- Compressed 3G-friendly static assets (`< 400 KB` images) and `Cache-Control` / `CSP` headers.

### 4.2 Out-of-Scope (Current Release)
- Live payment gateway processing (SSLCommerz / bKash / Nagad / Stripe).
- SMS/Email OTP verification flows.
- Direct live write-back to external government DGHS SHR production servers (currently generates compliant FHIR R4 Bundles locally for export/integration).

---

## 5. Stakeholder & RACI Matrix

| Activity / Deliverable | Founder / Product | Principal Architect | Clinical Advisory | Engineering / QA | Security / Compliance |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Product Vision & B2B/B2G Scope | **A / R** | **C** | **C** | **I** | **I** |
| Multi-Tenant Architecture & RBAC | **I** | **A / R** | **I** | **R** | **C** |
| Clinical DDI & Contraindication Rules | **I** | **C** | **A / R** | **R** | **C** |
| HIPAA / DGHS FHIR & Encryption Audit | **I** | **C** | **C** | **R** | **A / R** |
| Release Gate (`tsc`, `npm test`, `pytest`, `build`) | **I** | **A** | **I** | **R** | **C** |

*(R = Responsible, A = Accountable, C = Consulted, I = Informed)*

---

## 6. Risk Register & Mitigations

| Risk ID | Risk Description | Impact | Likelihood | Mitigation Implemented in Codebase |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | Client-side role spoofing or IDOR on patient records | Critical | Medium | Edge `middleware.ts` + HMAC-SHA256 `server-auth.ts` + `requireSessionUser` + `organizationId` scoping |
| **RSK-02** | Forged or tampered emergency HealthPass QR data | High | Low | Synchronous FIPS 180-4 SHA-256 + RFC 2104 HMAC-SHA256 (`YUNET1:`) verification rejecting tampered payloads |
| **RSK-03** | AI hallucinating controlled narcotics or missing emergencies | Critical | Medium | System prompt controlled-substance guardrail + deterministic `clinical-engine.ts` `999`/`16263` escalation |
| **RSK-04** | Database downtime during live clinical/demo usage | High | Medium | `withDbTimeout` + graceful seeded demo fallback resilience (`INITIAL_HEALTH_CARDS`, static catalogs) |
| **RSK-05** | Slow rendering on rural 3G mobile connections | Medium | High | Compressed public PNG/JPG assets (`40–381 KB`), `compress: true`, and `Cache-Control` headers in `next.config.ts` |

---

## 7. Key Success KPIs

| KPI | Target | Verification Mechanism |
| :--- | :--- | :--- |
| **Automated Test Pass Rate** | `100%` across RBAC, Rx Intelligence, Crypto, Backend | `npm test` (`89/89` pass) & `pytest -v` (`13/13` pass) |
| **Type Safety & Production Build** | `0` TS errors, `134/134` routes compiled | `npx tsc --noEmit` & `npm run build` |
| **Zero-Internet QR Decode** | `< 50 ms` client-side decode + HMAC verify | `decodeOfflineQRPayload()` synchronous execution |
| **API Abuse Protection** | `429` enforcement on AI, Emergency, Biometrics | `rate-limit.ts` sliding-window limiter |
| **Clinical Safety Coverage** | DDI + Duplicate + Allergy + 4 Organ/Pop Contraindications | `clinical-safety.ts` + `production-hardening.test.ts` |
