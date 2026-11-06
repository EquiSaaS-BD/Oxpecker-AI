# Design Document: DGHS Compliance, Drug-Drug Safety (DDI), Prescription Cost Savings & Printable HealthPass

**Status:** Proposed  
**Date:** 2026-11-07  
**Author:** Antigravity (Google DeepMind pair programming assistant)  
**Target Competitions:**  
1. *National eHealth Hackathon (Bangladesh)* — DGHS, MOHFW & WHO Digital Health Interoperability  
2. *YuNet / Social Business Youth Summit* — Universal Healthcare Access & Prescription Cost Reduction  

---

## 1. Intent & The "Why"
Oxpecker AI currently hosts 28,151 registered medicines and 2,029 generics in Bangladesh with clean packaging imagery. However, to win national innovation hackathons and address critical social problems in Bangladesh, three key gaps must be addressed:
1. **Clinical Safety & Interoperability:** Doctors and clinics in Bangladesh face drug interaction risks (e.g., duplicate paracetamol brands, antibiotic chelation with antacids). Aligning with the DGHS Shared Health Record (SHR) and WHO ATC standards provides clinical credibility and national interoperability.
2. **Citizen Cost Burden:** Over 67% of healthcare expenses in Bangladesh are out-of-pocket, with medicines accounting for the largest share. Providing transparent generic substitution calculations saves patients 30-40% on prescriptions.
3. **Emergency Accessibility:** In road accidents and rural emergency clinics, doctors cannot access patient medical history without internet connectivity. A physical, printable laminated smart card with an offline-readable QR code solves this universally.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **G1 (DGHS/ATC Mapping):** Equip generics with WHO ATC (Anatomical Therapeutic Chemical) codes and FHIR-compliant MedicationStatement exports matching DGHS SHR specs.
- **G2 (Clinical DDI Safety Engine):** Detect major, moderate, and duplicate-therapy drug interactions in real time on any prescription or selected medicines, providing actionable clinical warnings in Bengali and English.
- **G3 (Prescription Savings Engine):** Calculate total regimen costs and compare against DGDA-approved generic alternatives, displaying a clear savings ledger ("You save ৳ X").
- **G4 (Printable HealthPass ID Card):** Generate a print-ready, CR80 standard dual-sided ID card (PDF/High-Res canvas) with offline emergency data encoded in a dynamic QR code.

### Non-Goals
- Full integration with external live hospital billing payment gateways (out of scope for hackathon demo).
- Writing new proprietary ML models for optical physics (we leverage existing vision and normalized catalog).

### Anti-Goals
- **No medical liability risk:** All interaction and generic replacement notices must clearly state DGDA approval status and require registered physician review (BMDC compliance).
- **No internet-dependent emergency card:** The emergency QR code MUST NOT require an active internet connection to reveal life-saving triage info (Blood Group, Allergies, Emergency Contacts).

---

## 3. Architecture & Approaches

### Approaches Considered

- **Approach 1: Core Logic & Clinical Safety first, then Visual Card (Selected)**
  - *Details:* Build the DGHS/WHO ATC data layer and DDI engine first. Next, build the prescription savings calculator. Finally, render the printable HealthPass ID card embedding this verified data.
  - *Trade-offs:* Solid foundation; every visual badge on the card and UI reflects real verified database fields.
- **Approach 2: Visual Card first, then Background Engines**
  - *Trade-offs:* Rapid frontend gratification, but requires multiple refactorings once the underlying DDI and ATC models land.
- **Approach 3: Monolithic Implementation**
  - *Trade-offs:* High risk of breaking builds, large diffs, harder to verify intermediate states.

*Decision:* Proceed with **Approach 1** as agreed with the user.

---

## 4. Detailed Component Design

### 4.1 DGHS & WHO ATC Mapping
- **Database:**
  - Add `atc_code` (VARCHAR 10) and `dghs_concept_id` to `generics` table.
  - Populate top 200 high-frequency generic classes in Bangladesh (Omeprazole: `A02BC01`, Paracetamol: `N02BE01`, Ciprofloxacin: `J01MA02`, Metformin: `A10BA02`, Losartan: `C09CA01`, etc.).
- **FHIR Export Utility (`Frontend/src/lib/dghs-fhir.ts`):**
  - Translates patient medication profiles into DGHS-compliant HL7 FHIR `MedicationStatement` resources containing ATC coding and dosage instructions.

### 4.2 Real-time Drug-Drug Interaction (DDI) & Duplicate Therapy Engine
- **Module:** `Frontend/src/lib/clinical-safety.ts`
- **Rules Covered:**
  1. *Duplicate Therapy:* Combining multiple brand names of the same generic (e.g., Napa + Ace Plus = dangerous double Paracetamol dosing).
  2. *Antibiotic Chelation:* Fluoroquinolones (Ciprofloxacin/Levofloxacin) + Antacids / Multivitamins / Iron (reduces absorption by up to 70%).
  3. *Bleeding Risk:* NSAIDs (Ketorolac, Naproxen, Diclofenac) + Antiplatelets/Anticoagulants (Aspirin, Clopidogrel).
  4. *Severe Hyperkalemia:* ACE Inhibitors/ARBs (Losartan, Ramipril) + Potassium-sparing Diuretics (Spironolactone).
  5. *Metformin + Contrast Warning:* Lactic acidosis precautions.
- **UI:** Interactive clinical alert badges in `PrescriptionBuilder` and `MedicineDetailsModal` with severity indicators (Red = Contraindicated, Orange = Major Interaction, Yellow = Caution/Timing adjustment).

### 4.3 Prescription Cost-Savings & Generic Substitution Engine
- **Module:** `Frontend/src/lib/prescription-savings.ts`
- **Logic:**
  - Given prescribed items `[{ brand_id, dosage, days }]`:
  - Calculate `current_total_bdt`.
  - For each item, query identical generic formulation from other manufacturers with lower unit prices.
  - Select optimal quality-approved DGDA alternative (e.g., replacing a ৳ 12 tablet with a ৳ 4 tablet of equal strength and dosage form).
  - Compute `optimized_total_bdt` and `net_savings_bdt` (`percentage_saved`).
- **UI Component:** `PrescriptionSavingsBanner.tsx` displaying:
  - Total Estimated Cost: `৳ 1,420`
  - With Affordable Generic Alternatives: `৳ 880`
  - Patient Net Savings: `৳ 540 (38% Save)`
  - Direct 1-click alternative substitution.

### 4.4 Printable Smart HealthPass (CR80 Standard ID Card & Offline QR)
- **Component:** `Frontend/src/components/health-card/PrintableHealthPassCard.tsx`
- **Card Specifications:**
  - Standard PVC Card Ratio (CR80 / 3.375" × 2.125").
  - Front:
    - Official Oxpecker AI / Government-styled header with National Emergency banner (`999` & `16263`).
    - Patient Photo / Avatar, Name, Emergency Health ID (UUID-based).
    - Prominent Blood Group pill badge (e.g., `O+` in high-contrast red).
    - Vital alerts: Chronic diseases (Diabetes, Hypertension, Asthma), Known Allergies (e.g., Penicillin, Sulfa).
  - Back:
    - High-density offline QR Code.
    - Offline QR Payload (Base64 URL-safe compressed JSON):
      ```json
      {
        "v": 1,
        "id": "HP-880-91234",
        "n": "Rafiqul Islam",
        "bg": "B+",
        "dob": "1984-05-12",
        "al": ["Penicillin"],
        "cd": ["Type-2 Diabetes", "Hypertension"],
        "ec": "017XXXXXXXX",
        "em": ["Metformin 500mg", "Losartan 50mg"]
      }
      ```
    - Emergency instructions: "যেকোনো স্মার্টফোন বা অফলাইন স্ক্যানারে তাৎক্ষণিক ট্রায়াজ তথ্য দেখতে স্ক্যান করুন।"
- **Print / Export Actions:**
  - One-click "Print Official ID Card" opens clean browser print stylesheet with cut/fold crop-marks.
  - "Download PDF" generating a sharp 300 DPI vector graphic.

---

## 5. User Decisions & Assistant Calls

### Decisions Made by User:
- Include all three proposed feature pillars for maximum competition impact.
- Adopted **Approach 1** (Clinical safety and data integrity first, followed by visual artifacts).

### Assistant Calls (Marked):
- *YAGNI on Database Over-engineering:* Rather than creating separate microservices, implement DDI and Savings directly within TypeScript client/server modules with fallback data, ensuring high performance and zero external API failure during live hackathon demos.
- *Dual-mode Emergency QR:* The QR code contains both a fallback web URL (for online viewers) AND embedded compressed raw triage payload (for zero-internet offline emergency rooms).

---

## 6. Verification & Testing Plan
1. **DDI Engine Unit Tests:** Verify all 5 critical interaction rules trigger expected severities.
2. **Savings Calculation Tests:** Verify math across varied pack sizes, unit prices, and multi-medicine prescriptions.
3. **QR Payload & Decoder Test:** Verify offline JSON payload decodes properly without network access.
4. **Print Layout Verification:** Verify CSS media print renders exact CR80 aspect ratio on standard A4 page.
5. **Next.js Production Build:** Ensure `npm run build` succeeds cleanly with 0 TypeScript/ESLint errors.
