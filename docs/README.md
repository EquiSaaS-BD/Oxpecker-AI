# Oxpecker AI — Enterprise SaaS Documentation Suite

Welcome to the central technical, product, security, and operational documentation repository for **Oxpecker AI** (`Oxpecker AI Healthcare Ecosystem`). All specifications below are strictly grounded in the live `Frontend/` (Next.js 15 App Router, TypeScript, Prisma, Supabase) and `Backend/` (FastAPI, Python 3.13, Clinical AI & HealthPass engines) codebases.

---

## Core SaaS Documentation Index

| # | Document | Audience | Summary |
| :--- | :--- | :--- | :--- |
| **01** | [Project Initiation Document (PID)](./01_PID_Project_Initiation_Document.md) | Founders, Investors, Grant Evaluators, PMs | Executive summary, Bangladesh/emerging-market problem statement, B2B/B2C/B2G scope, RACI matrix, risk register, KPIs |
| **02** | [Product Requirements Document (PRD)](./02_PRD_Product_Requirements_Document.md) | Product, Design, Engineering, QA | User personas (`Patient`, `Doctor`, `Hospital`, `Assistant`, `Admin`, `Emergency Reader`), feature specs, acceptance criteria, non-goals |
| **03** | [Software Requirements Specification (SRS)](./03_SRS_Software_Requirements_Specification.md) | Engineering, QA, Compliance Auditors | IEEE-830 Functional (`FR-001`..`FR-024`) & Non-Functional Requirements (`NFR-001`..`NFR-010`) with route/API traceability |
| **04** | [Technical Requirements Document (TRD)](./04_TRD_Technical_Requirements_Document.md) | Staff Engineers, DevOps, Security | Tech stack, runtime topology, multi-tenancy (`organizationId`), 3G bandwidth optimization, env/secret configuration matrix |
| **05** | [Architecture (HLD & LLD)](./05_Architecture_HLD_LLD.md) | Architects, Senior Engineers | Mermaid system architecture, low-level module map, sequence diagrams (Auth/RBAC, Clinical RAG, Rx Finalize, `YUNET1:` QR) |
| **06** | [Database Schema & Data Dictionary](./06_Database_Schema_and_Data_Dictionary.md) | Backend, DBA, Data Engineers | Full Mermaid `erDiagram` from `Frontend/prisma/schema.prisma`, 18-table data dictionary, multi-tenant indexes, retention |
| **07** | [API Contract Specification](./07_API_Contract_Specification.md) | Frontend, Backend, Integrators | Complete Next.js `/api/*` (35 routes) & FastAPI `/api/v1/*` contract, auth/role guards, rate limits, HL7 FHIR R4 bundle schema |
| **08** | [Security, Compliance & DGHS FHIR](./08_Security_Compliance_and_DGHS_FHIR.md) | Security Auditors, DGHS/WHO, CTO | Threat model, Zero-IDOR, Edge RBAC, AES-256-GCM vault, `YUNET1:` HMAC-SHA256 QR, CSP headers, HIPAA/DGHS SHR alignment |
| **09** | [AI Clinical Safety & Guardrails](./09_AI_Clinical_Safety_and_Guardrails.md) | Clinical Advisory, AI Engineers, Regulators | CDS DDI engine, allergy cross-reactivity, pregnancy/pediatric/renal/hepatic contraindications, `999`/`16263` escalation |
| **10** | [QA Test Strategy & Verification](./10_QA_Test_Strategy_and_Verification.md) | QA Engineers, CI/CD, Release Managers | Test pyramid (89 Frontend tests + 13 Backend pytest tests), exact verification commands, CI quality gates, UAT matrix |
| **11** | [Deployment, DevOps & Runbook](./11_Deployment_DevOps_and_Runbook.md) | SRE, DevOps, On-Call Engineers | Local/Docker/Cloud setup, `prisma generate`/migrate workflow, health probes, DB-offline fallback & incident response runbooks |
| **12** | [SaaS Operations, SLA & B2B Onboarding](./12_SaaS_Operations_SLA_and_B2B_Onboarding.md) | Customer Success, Hospital Ops, B2B Sales | Hospital/clinic onboarding SOP, BMDC verification workflow, support tiers, target SLAs, tenant offboarding & FHIR export |
| **13** | [Architecture Decision Records (ADR)](./13_ADR_Architecture_Decision_Records.md) | Architects, New Engineers | ADR-001 through ADR-004 documenting key security, cryptography, hybrid runtime, and multi-tenancy decisions |

---

## Existing Reference Documentation (Preserved)

- **Design & Implementation Plans:**
  - [DGHS, DDI, HealthPass & Savings Design](./plans/2026-11-07-dghs-ddi-healthpass-savings-design.md)
  - [DGHS, DDI, HealthPass & Savings Implementation Plan](./plans/2026-11-07-dghs-ddi-healthpass-savings-plan.md)
- **Root Architecture Overview:**
  - [System Architecture Documentation](../System_Architecture_Documentation.md)
- **Frontend Developer Guides (`Frontend/docs/`):**
  - [1.1 Introduction](../Frontend/docs/1-getting-started/1-introduction.md)
  - [2.1 System Overview](../Frontend/docs/2-architecture/1-system-overview.md)
  - [2.2 System Diagram](../Frontend/docs/2-architecture/2-system-diagram.md)
  - [2.3 Hospital Telemetry API](../Frontend/docs/2-architecture/hospital-telemetry-api.md)
  - [4.1 API Reference](../Frontend/docs/4-backend/1-api-reference.md)
  - [5.1 OCR Pipeline](../Frontend/docs/5-ai-engine/1-ocr-pipeline.md)
  - [5.2 Medical Document Processing](../Frontend/docs/5-ai-engine/2-medical-document-processing.md)
  - [6.1 Patient Journey](../Frontend/docs/6-workflows/1-patient-journey.md)
