# 12. SaaS Operations, SLA & B2B Onboarding — Oxpecker AI

---

## 1. Multi-Tenant Hospital / Clinic Onboarding SOP

1. **Tenant Provisioning:** Create an `Organization` record (`slug`, `name`, `type`: `hospital` | `clinic` | `chamber`) in PostgreSQL.
2. **Admin & Staff Provisioning:** Create `User` accounts bound to the tenant's `organizationId` with appropriate roles (`hospital`, `doctor`, `assistant`).
3. **Physician BMDC Verification:**
   - Doctors submit their BMDC registration number via `/doctor/settings/education` (`POST /api/doctor/verify-bmdc`).
   - Status updates (`verified` / `pending`) and writes an immutable `BMDC_VERIFY` entry to `AuditLog`.
4. **Catalog & Bed Setup:** Seed `Doctor`, `Hospital`, and `HmsAdmission` ward/bed configurations under the tenant's `organizationId`.
5. **Emergency Readiness Test:** Generate a sample HealthPass `YUNET1:` QR and verify zero-internet decoding at `/emergency-reader`.

---

## 2. Support Tiers & Escalation Matrix

| Severity | Definition | Initial Response Target | Escalation Path |
| :--- | :--- | :---: | :--- |
| **SEV-1 (Critical)** | Complete portal outage, auth bypass, or clinical safety alert failure | `15 mins` | On-Call SRE -> Staff Architect & Clinical Lead |
| **SEV-2 (High)** | FastAPI AI / OCR degradation or DB timeout triggering fallback mode | `1 hour` | Backend / Infra Engineer |
| **SEV-3 (Medium)** | Single-tenant HMS workflow bug or BMDC verification sync issue | `4 business hours` | Support Engineer -> Full-Stack Team |
| **SEV-4 (Low)** | Directory metadata update or non-blocking UI/copy request | `1 business day` | Customer Success |

---

## 3. Target Service Level Objectives (SLOs)

> *Note: Formal contractual SLAs for enterprise hospital contracts are finalized during commercial onboarding (`[PLANNED / ROADMAP]`). Below are architectural targets.*

| Metric | Architectural Target | Mechanism |
| :--- | :--- | :--- |
| **Platform Availability** | `99.9%` | Stateless Next.js `standalone` + DB-offline fallback resilience |
| **Offline QR Decode Latency** | `< 50 ms` | Zero-network client-side SHA-256 + HMAC-SHA256 verification |
| **Recovery Point Objective (RPO)** | `<= 24 hours` (daily automated Postgres snapshots) | Managed PostgreSQL PITR / backups |
| **Recovery Time Objective (RTO)** | `<= 2 hours` | Containerized FastAPI + Next.js standalone redeploy |

---

## 4. Tenant Offboarding & Data Portability
- **Export Format:** Patient medication histories and demographics can be exported as **HL7 FHIR R4 Bundles** (`dghs-fhir.ts`) with WHO ATC coding (`http://www.whocc.no/atc`).
- **Audit Retention:** `AuditLog` entries (`EMERGENCY_LOOKUP`, `QR_SCAN`, `BMDC_VERIFY`) are retained for regulatory traceability even after tenant deactivation (`Organization.isActive = false`).
