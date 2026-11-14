# 09. AI Clinical Safety & Guardrails — Oxpecker AI

---

## 1. Clinical Decision Support (CDS) Architecture

All prescription safety checks run deterministically in `Frontend/src/lib/clinical-safety.ts` via `checkPrescriptionSafety(medicines, knownAllergies, chronicConditions, patientProfile)` and return bilingual (`En` / `Bn`) alerts classified into `SAFE`, `CAUTION`, `HIGH_RISK`, or `CRITICAL`.

### 1.1 Five-Layer Deterministic Safety Pipeline
1. **Duplicate Therapy Detection (`DUPLICATE_THERAPY`):** Groups prescribed brands by `generic_name` to prevent accidental cumulative overdosing (e.g., two Paracetamol brands).
2. **Pairwise Drug-Drug Interactions (`CLINICAL_DDI_RULES`):** Checks active generics against high-severity interaction pairs (`CONTRAINDICATED`, `MAJOR`, `MODERATE`).
3. **Allergy Cross-Reactivity (`ALLERGY_CROSS_REACTIVITY` -> `ALLERGY_WARNING`):** Cross-checks documented patient allergies (e.g., Penicillin, Sulfa, NSAIDs) against structural drug triggers.
4. **Special Population & Organ Contraindications (`PatientSafetyProfile` + `chronicConditions`):**
   - **Pregnancy / Lactation (`isPregnant` / `isLactating`):** Flags Statins (`atorvastatin`, `rosuvastatin`, `simvastatin`, `pitavastatin`), ARBs/ACEi (`losartan`, `valsartan`, `enalapril`, `ramipril`, etc.), `valproate`, `isotretinoin`, `warfarin`, `methotrexate`, fluoroquinolones, and tetracyclines as `CONTRAINDICATED`.
   - **Pediatric (`ageYears < 16`):** Flags `aspirin` (Reye's syndrome hazard) and fluoroquinolones/tetracyclines (cartilage/dental hazard) as `CONTRAINDICATED`.
   - **Renal Impairment / CKD (`egfr < 45`):** Flags systemic NSAIDs (`ketorolac`, `diclofenac`, `ibuprofen`, `naproxen`, `aceclofenac`, `indomethacin`, `etoricoxib`) as `CONTRAINDICATED` and `metformin` as `MAJOR` (lactic acidosis hazard).
   - **Hepatic Impairment (`hepaticImpairment`):** Flags hepatotoxic statins/antifungals/valproate and high-dose `paracetamol` as `MAJOR` with `<= 2g/day` ceiling guidance.
5. **Verified Medicine Matching (`prescription-intelligence.ts`):** Uses strict brand/strength/dosage-form matching and returns `NOT_FOUND` or `PRICE_UNAVAILABLE` instead of fabricating medicines or prices.

---

## 2. Conversational AI Guardrails (`Frontend/src/app/api/ai/chat/route.ts`)

| Guardrail | Enforcement Mechanism |
| :--- | :--- |
| **Strict Medical Boundary** | System prompt Rule 6 restricts answers strictly to health, medicine, pharmacology, symptoms, lab reports, nutrition, first-aid, doctors, and hospitals; refuses coding/politics/general off-topic prompts. |
| **Controlled-Substance & Autonomous Prescribing Ban** | System prompt Rule 7 forbids autonomous prescribing of narcotics/opioids (`morphine`, `pethidine`, `fentanyl`, `tramadol`), benzodiazepines (`clonazepam`, `diazepam`, `alprazolam`), systemic corticosteroids, or restricted antibiotics without stating that a registered BMDC physician's in-person prescription is mandatory under DGDA rules. |
| **Red-Flag Emergency Escalation** | Both `clinical-engine.ts` and System Prompt Rule 7 instruct immediate escalation to **National Emergency 999** or **Shastho Batayon 16263** at the top of the response for chest pain, stroke signs, severe dyspnea, anaphylaxis, hemorrhage, or suicidal crisis. |
| **RAG Grounding** | Grounded against 21,714+ local DGDA medicines, 1,711 monographs, clinical corpus, and FastAPI clinical engine (`/api/v1/clinical-ai/diagnose`). |
| **Rate Limiting** | `30 requests/minute/IP` enforced on both `/api/ai/chat` and `/api/ai/diagnose`. |
