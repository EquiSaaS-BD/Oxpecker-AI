# Changelog

## [2.0.0] - 2026-11-17

### Added
- **Deterministic Lab Report Analyzer Engine (`Frontend/src/lib/lab-report-engine.ts`)**:
  - Evaluates CBC (Hb, WBC, Platelets, ESR), HbA1c, Fasting/Random Blood Glucose (`mg/dL` & `mmol/L`), Lipid Profile, Serum Creatinine + CKD-EPI eGFR estimate, LFT (SGPT, SGOT, Bilirubin), TSH, Vitamin D, and Urine R/E.
  - Supports adult male/female/pediatric ranges and strictly prefers lab-printed reference ranges when extracted.
  - Deterministic flags (`স্বাভাবিক` / `কম` / `বেশি`), whole-report urgency (`স্বাভাবিক` / `ডাক্তার দেখান` / `দ্রুত ডাক্তার দেখান`), Bengali explanations using safe probabilistic phrasing, `"কেন এই ফলাফল"` trigger breakdown, longitudinal multi-report Trend Charts, and 24-hour expiring share links.
- **Shared AI Safety & Red-Flag Guardrails (`Frontend/src/lib/ai-safety-guard.ts`)**:
  - Critical lab & emergency symptom override (`999` emergency banner FIRST), output sanitizer blocking definitive diagnostic claims and unmeasured accuracy percentages, mandatory Bengali disclaimer footer, and `AI_SAFETY_FLAGGED` audit logging.
- **Radiology Report-Text Explainer, Skin Photo Guidance & Assistant Routing**:
  - Added non-image radiology text explainer, skin guidance confidence wrapper, and seamless `"কোন ডাক্তার দেখাবেন"` routing into the ~166-doctor directory (`/doctors?specialty=...`) plus Chat Health ID sync.
- **Doctor Review Loop**:
  - Clinicians can review, add notes, and verify AI summaries (`"ডাক্তার যাচাই করেছেন"` badge) while preserving original AI output and full edit history.
- **Multi-Tenant B2B SaaS Layer (`Frontend/src/lib/saas-platform.ts`, `/api/saas/workspace`)**:
  - Plans (`free`, `clinic_starter`, `clinic_pro`, `lab_enterprise`), quota enforcement (`429`), bKash/Nagad/SSLCommerz sandbox checkout provider interface, clinic report upload on behalf of patient (consent/OTP), branded clinic PDF settings, consent-gated specialist lead pipeline, org analytics, OpenAPI 3.1 docs (`?openapi=1`), webhooks (`report.analyzed`, `lead.created`), and Super-Admin governance panel.
- **60-Second Judge Demo Route (`/demo`)**:
  - End-to-end guided walkthrough with seeded Health ID `HP-2026-8841`, 1-click sample lab report, trends, doctor review toggle, and directory routing.
