# 10. QA Test Strategy & Verification — Oxpecker AI

---

## 1. Automated Test Pyramid

| Layer | Suite File | Scope & Assertions | Verified Count |
| :--- | :--- | :--- | :---: |
| **RBAC Matrix** | `Frontend/src/lib/__tests__/rbac.test.ts` | Role-route authorization (`patient`, `doctor`, `hospital`, `assistant`, `admin`, `null`) + redirect sanitizer | **60 / 60** |
| **Prescription Intelligence** | `Frontend/src/lib/__tests__/prescription-intelligence.test.ts` | Printed/handwritten/Bangla/mixed OCR, magic-byte upload checks, DGDA exact paisa pricing, AES-256-GCM vault roundtrip, multi-page PDF parsing | **22 / 22** |
| **Production Hardening** | `Frontend/src/lib/__tests__/production-hardening.test.ts` | Pregnancy/pediatric/renal/hepatic contraindications, `YUNET1:` QR sign/verify/tamper rejection, DGHS FHIR R4 bundle schema, HMAC-SHA256 session & `401`/`403` RBAC | **7 / 7** |
| **Backend Clinical & Biometrics** | `Backend/tests/test_clinical_ai_engine.py`, `test_healthpass_engine.py`, `Backend/test_passwords.py` | 9,600-case clinical AI engine (Bn/En), cosine similarity face match, Pydantic v2 schemas, Postgres probe | **13 / 13** |

---

## 2. Standard Verification Gate Commands

Run all commands before merging or deploying to production:

### Frontend (`Frontend/`)
```powershell
npx prisma generate
npx tsc --noEmit
npm test
npm run build
```

### Backend (`Backend/`)
```powershell
python -m pytest -v
```

---

## 3. UAT & Pre-Release Sign-Off Checklist

| Check | Expected Outcome | Verification Method |
| :--- | :--- | :--- |
| Unauthenticated `/admin/dashboard` or `/doctor/dashboard` | Redirects to `/login?redirect=...` | `middleware.ts` |
| Patient attempting `/doctor/dashboard` | Redirects to `/dashboard`; API returns `403` | `rbac.ts` + `requireSessionUser` |
| Tampered `YUNET1:` QR scanned in `/emergency-reader` | Rejected (`null` decode) with tamper warning | `production-hardening.test.ts` |
| Prescribing Ketorolac to CKD (`eGFR < 45`) or Statin in pregnancy | `CRITICAL` (`CONTRAINDICATED`) bilingual alert | `clinical-safety.ts` |
| Oversized/spoofed `.exe` renamed to `.jpg` uploaded to vault | Rejected (`hasValidFileSignature === false`) | `medical-document-server.ts` |
| Production build & static generation | `0` TypeScript errors, all `134` routes compiled | `npm run build` |
