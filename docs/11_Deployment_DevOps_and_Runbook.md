# 11. Deployment, DevOps & Runbook — Oxpecker AI

---

## 1. Local Development Setup

### Frontend (`Frontend/`)
```powershell
cd Frontend
npm install
npx prisma generate
npm run dev
```

### Backend (`Backend/`)
```powershell
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 2. Production Build & Database Migration Workflow

1. **Generate Prisma Client & Apply Schema:**
   ```powershell
   cd Frontend
   npx prisma generate
   npx prisma migrate deploy
   ```
2. **Verify Required Production Environment Variables:**
   - `DATABASE_URL`
   - `AUTH_SESSION_SECRET` (32+ random bytes)
   - `MEDICAL_DOCUMENT_ENCRYPTION_KEY` (64-hex or 32-byte base64)
   - `SECRET_KEY` and `ENVIRONMENT=production` (Backend)
3. **Build Standalone Next.js Bundle:**
   - `Frontend/next.config.ts` uses `output: 'standalone'` and single-process static generation (`cpus: 1`, `staticGenerationMaxConcurrency: 1`) for reliable builds on Windows and constrained CI runners.
   - Run `npm run build` and verify exit code `0`.

---

## 3. Health Checks & Monitoring

| Target | Endpoint | Expected Response |
| :--- | :--- | :--- |
| **Backend Root Probe** | `GET /` | `200 OK` `{ "status": "online", "api_v1": "/api/v1" }` |
| **Backend Health** | `GET /api/v1/health` | `200 OK` |
| **Admin Telemetry** | `GET /api/admin/telemetry` (`admin` cookie) | `200 OK` `{ "source": "database" \| "baseline-fallback", "telemetry": ... }` |

---

## 4. Incident Response Runbooks

### Runbook A: PostgreSQL Outage / Connection Timeout
- **Symptom:** Prisma queries exceed `withDbTimeout` threshold.
- **Built-In Resilience:** `/api/patients`, `/api/prescriptions`, `/api/hospital/hms`, `/api/automation`, `/api/doctors/search`, `/api/hospitals/search`, and `/api/admin/telemetry` automatically fall back to seeded demo/baseline payloads so clinical demos and emergency readers remain online.
- **Remediation:** Verify `DATABASE_URL` connectivity, PgBouncer pool limits, and Supabase/Azure Postgres health; once restored, Prisma queries resume transparently.

### Runbook B: FastAPI Clinical AI / Biometric Timeout
- **Symptom:** `NEXT_PUBLIC_API_URL` unreachable or slow (`> 3.5s` in `/api/ai/chat`, `> 10s` in `/api/ai/diagnose`).
- **Built-In Resilience:** `/api/ai/chat` and `/api/ai/diagnose` fall back to `analyzeClinicalCase` (`clinical-engine.ts`) + local RAG; `/api/biometrics/face-match` falls back to deterministic 64-dim byte-histogram cosine similarity.
- **Remediation:** Inspect Azure App Service / `uvicorn` logs, verify `ENVIRONMENT` & `SECRET_KEY`, and restart the worker.

### Runbook C: Suspected Secret / Session Key Compromise
- **Action:** Rotate `AUTH_SESSION_SECRET` (invalidates all active `oxpecker_session` cookies immediately), rotate `HEALTHPASS_QR_SECRET` for new `YUNET1:` cards, and audit `AuditLog` for anomalous `EMERGENCY_LOOKUP` or `QR_SCAN` spikes.
- **Note:** Rotating `MEDICAL_DOCUMENT_ENCRYPTION_KEY` requires re-encrypting existing `MedicalDocument.image` rows with the new key before retiring the old key.
