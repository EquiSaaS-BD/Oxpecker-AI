# Implementation Plan: DGHS Compliance, Drug-Drug Safety (DDI), Prescription Cost Savings & Printable HealthPass

**Status:** In Execution  
**Created:** 2026-11-07  
**Design Reference:** [docs/plans/2026-11-07-dghs-ddi-healthpass-savings-design.md](file:///E:/Oxpecker-AI-main/Oxpecker-AI-main/docs/plans/2026-11-07-dghs-ddi-healthpass-savings-design.md)  

---

## Task Checklist

### Phase 1: DGHS Standards & Clinical DDI Engine
- [ ] 1.1 Create `Frontend/src/lib/dghs-atc-data.ts` (WHO ATC code catalog, DGHS concept IDs for top Bangladeshi generics)
- [ ] 1.2 Create `Frontend/src/lib/clinical-safety.ts` (DDI rules, duplicate therapy detection, allergy checking)
- [ ] 1.3 Create `Frontend/src/lib/dghs-fhir.ts` (HL7 FHIR MedicationStatement JSON exporter for DGHS SHR)
- [ ] 1.4 Add unit verification tests in `Frontend/src/lib/__tests__/clinical-safety.test.ts` (or standalone runner)

### Phase 2: Prescription Cost-Savings & Generic Substitution Engine
- [ ] 2.1 Create `Frontend/src/lib/prescription-savings.ts` (Regimen costing, generic alternative resolver, BDT savings calculator)
- [ ] 2.2 Create `Frontend/src/components/prescription/PrescriptionSavingsCard.tsx` (Interactive savings UI with 1-click substitution)
- [ ] 2.3 Create `Frontend/src/components/prescription/ClinicalSafetyAlerts.tsx` (Red/Orange/Yellow interaction warning banner)

### Phase 3: Printable Smart HealthPass (CR80 Standard & Offline QR)
- [ ] 3.1 Create `Frontend/src/lib/healthpass-offline-qr.ts` (Compressed URL-safe offline triage payload generator and parser)
- [ ] 3.2 Create `Frontend/src/components/health-card/PrintableHealthPassCard.tsx` (CR80 dual-sided front/back card with print CSS)
- [ ] 3.3 Create `Frontend/src/app/emergency-reader/page.tsx` (Zero-internet instant emergency triage scanner & display)
- [ ] 3.4 Integrate printable card into `/health-card` and doctor `/doctor/dashboard/health-pass`

### Phase 4: Prescription Flow Integration & Verification
- [ ] 4.1 Wire DDI and Savings into Doctor Prescription Builder (`doctor/dashboard/prescription/new`)
- [ ] 4.2 Wire DDI and Savings into Patient Prescription Summary (`medicines/prescription-summary`)
- [ ] 4.3 Run production build (`npm run build`) and verify 0 errors
- [ ] 4.4 Final verification report and documentation walkthrough
