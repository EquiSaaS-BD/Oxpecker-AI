# 05. Architecture (HLD & LLD) — Oxpecker AI

---

## 1. High-Level Architecture (HLD)

```mermaid
flowchart TD
    U["Users (Patient, Doctor, Hospital, Assistant, Admin, ER)"] --> CDN["Next.js 15 Edge & App Router"]
    CDN --> MW["Edge Middleware (middleware.ts + server-auth.ts)"]
    MW -->|Authorized| Pages["App Portals & UI Components"]
    MW -->|API Calls| API["Next.js Route Handlers (/api/*)"]
    MW -->|Unauth / Wrong Role| Bounce["Redirect to /login or Role Home"]

    API --> RL["Sliding-Window Rate Limiter (rate-limit.ts)"]
    API --> Safety["Clinical Safety & FHIR (clinical-safety.ts, dghs-fhir.ts)"]
    API --> Vault["AES-256-GCM Document Vault (medical-document-server.ts)"]
    API --> QR["YUNET1 HMAC-SHA256 QR (healthpass-offline-qr.ts)"]
    API --> DB["PostgreSQL via Prisma (schema.prisma)"]
    API --> Supa["Supabase Auth & Profiles"]
    API --> FastAPI["FastAPI Backend (/api/v1/clinical-ai, /healthpass)"]
    API --> AI["Multimodal LLMs & Hybrid Medical RAG"]
```

---

## 2. Low-Level Module Breakdown

| Layer | Module Path | Responsibility |
| :--- | :--- | :--- |
| **Edge Security** | `Frontend/src/middleware.ts`, `Frontend/src/lib/rbac.ts` | Intercepts protected portal routes, verifies `oxpecker_session`, enforces `ROLE_EXCLUSIVE_ROUTES` |
| **Session Auth** | `Frontend/src/lib/server-auth.ts`, `Frontend/src/app/api/auth/session/route.ts` | WebCrypto HMAC-SHA256 token signing/verification, `requireSessionUser(req, roles)` |
| **Clinical Safety** | `Frontend/src/lib/clinical-safety.ts` | Duplicate therapy, DDI rules, allergy cross-reactivity, pregnancy/pediatric/renal/hepatic contraindications |
| **Rx Intelligence** | `Frontend/src/lib/prescription-intelligence.ts`, `Frontend/src/lib/prescription-ocr.ts` | OCR normalization, fuzzy brand/strength/form matching, exact paisa pricing |
| **Offline QR** | `Frontend/src/lib/healthpass-offline-qr.ts`, `Frontend/src/app/api/healthpass/sign/route.ts` | Synchronous SHA-256 + HMAC-SHA256 `YUNET1:` QR encoding, decoding, and `QR_SCAN` audit logging |
| **FHIR Export** | `Frontend/src/lib/dghs-fhir.ts`, `Frontend/src/lib/dghs-atc-data.ts` | HL7 FHIR R4 `Bundle` (`Patient` + `MedicationStatement`) with WHO ATC codes |
| **Vault** | `Frontend/src/lib/medical-document-server.ts` | Magic-byte validation + AES-256-GCM encrypt/decrypt + owner-scoped access |
| **FastAPI Engine** | `Backend/app/api/v1/clinical_ai.py`, `Backend/app/api/v1/healthpass.py` | Clinical AI diagnosis (150 diseases / 9,600 cases) & biometric face-match similarity |

---

## 3. Critical Sequence Diagrams

### 3.1 HMAC-SHA256 Session Login & Edge RBAC
```mermaid
sequenceDiagram
    participant U as User Browser
    participant L as Login Page
    participant S as POST /api/auth/session
    participant MW as Edge Middleware
    participant P as Protected Portal

    U->>L: Submit email & password
    L->>S: POST credentials
    S->>S: Verify demo/Prisma/Supabase + sign HMAC-SHA256 token
    S-->>L: 200 OK + Set-Cookie oxpecker_session (HttpOnly)
    L->>MW: Navigate to portal route
    MW->>MW: verifySessionToken(cookie) & isRouteAuthorizedForRole()
    alt Valid & Authorized
        MW-->>P: Allow request
    else Missing or Unauthorized Role
        MW-->>U: Redirect to /login or role home
    end
```

### 3.2 AI Multimodal Clinical RAG Pipeline
```mermaid
sequenceDiagram
    participant C as Patient Chat UI
    participant R as POST /api/ai/chat
    participant RL as rate-limit.ts
    participant CE as clinical-engine.ts
    participant RAG as medical-rag.ts
    participant FA as FastAPI /clinical-ai/diagnose
    participant LLM as LLM Provider

    C->>R: User symptom query (Bn/Banglish/En)
    R->>RL: checkRateLimit(30/min)
    R->>CE: analyzeClinicalCase() (red-flag 999 check)
    R->>RAG: executeMedicalRAGWithLiveResearch()
    opt Symptoms or Emergency Detected
        R->>FA: POST /api/v1/clinical-ai/diagnose (3.5s timeout)
    end
    R->>LLM: Stream response with medical & controlled-drug guardrails
    LLM-->>C: SSE clinical guidance + verified medicine links
```

### 3.3 Doctor Prescription Finalize → Safety → Persistence → Automation
```mermaid
sequenceDiagram
    participant D as Doctor Smart Pad
    participant CS as clinical-safety.ts
    participant API as POST /api/prescriptions
    participant DB as PostgreSQL (Prisma)
    participant AU as POST /api/automation

    D->>CS: checkPrescriptionSafety(meds, allergies, conditions, profile)
    CS-->>D: ClinicalSafetyReport (overallRisk, alerts)
    D->>API: Finalize Rx (savingsBdt, ddiAlertsCount)
    API->>API: requireSessionUser(doctor/admin) + orgId scope
    API->>DB: Upsert Patient + Create Prescription
    DB-->>API: Saved Prescription ID
    D->>AU: Trigger patient notification / SMS preview
    AU->>DB: Create AutomationEvent
```

### 3.4 Air-Gapped `YUNET1:` Offline QR Sign & Decode
```mermaid
sequenceDiagram
    participant P as HealthPass Card Generator
    participant QR as healthpass-offline-qr.ts
    participant ER as ER Responder (/emergency-reader)
    participant AUD as POST /api/healthpass/sign

    P->>QR: encodeOfflineQRPayload(profile)
    QR->>QR: Base64(compact JSON) + HMAC-SHA256 (32-hex sig)
    QR-->>P: "https://oxpecker.ai/emergency-reader#data=YUNET1:..."
    Note over ER: Zero internet required for decode
    ER->>QR: decodeOfflineQRPayload(scannedText)
    QR->>QR: Recompute HMAC-SHA256 & constant-time compare
    alt Signature Valid
        QR-->>ER: OfflineEmergencyProfile (signatureVerified: true)
        opt Online Audit Available
            ER->>AUD: Log QR_SCAN in AuditLog
        end
    else Tampered Payload or Signature
        QR-->>ER: null (Reject & warn ER responder)
    end
```
