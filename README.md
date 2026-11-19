# 🏥 Oxpecker AI (Oxpecker AI)
> A centralized, intelligent healthcare platform connecting patients, doctors, and hospitals.

Oxpecker AI is built to solve fragmented medical records, inefficient serial management, and lack of critical data availability during hospital emergencies. By providing a **Universal Health ID**, patients can carry their entire medical history digitally, while hospitals can access life-saving data instantly during critical admissions.

---


## ⚡ High-Performance AI Inference: Nebius Token Factory & NVIDIA Nemotron

Oxpecker AI utilizes **Nebius Token Factory** high-performance inference cloud paired with **NVIDIA's Llama-3.1-Nemotron-70B-Instruct** model to achieve ultra-fast, hallucination-resistant clinical reasoning and emergency triage:
- **Inference Cloud:** Nebius Token Factory (`https://api.tokenfactory.nebius.com/v1`)
- **Foundational Model:** `nvidia/Llama-3.1-Nemotron-70B-Instruct-HF`
- **Clinical Alignment:** Grounded with Contextual RAG on 9,600+ validated cases and Directorate General of Health Services (DGHS) Bangladesh clinical guidelines.
- **Latency & Streaming:** Sub-second serverless token generation delivered through Next.js edge stream adapters.

## 🏗️ System Architecture

```mermaid
graph TD
    A[Client Web App] -->|Next.js App Router| B(Vercel Edge Network)
    B --> C{Next.js API Routes}
    
    C -->|Prisma ORM| D[(Supabase PostgreSQL)]
    C -->|Fetch| E[Gemini AI API]
    C -->|File API| F[Supabase Storage]
    
    subgraph Data Layer
        D
        F
    end
    
    subgraph Services
        E
    end
```

## 🔄 User Registration & RBAC Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant A as Auth Guard
    participant DB as Supabase DB
    participant SA as Super Admin

    U->>F: Submits Registration Form
    F->>DB: Creates Profile Record
    
    alt is Patient
        DB-->>F: status: 'active'
        F->>A: Redirect to /chat
        A-->>U: Grants Access
    else is Doctor/Hospital/Assistant
        DB-->>F: status: 'pending'
        F->>A: Redirect to Dashboard
        A-->>U: Shows 'Pending Approval Modal'
        
        SA->>DB: Reviews & Updates status to 'active'
        U->>F: Refreshes Page
        A-->>U: Grants Access to Dashboard
    end
```

## 🚨 Emergency Lookup Flow (Hospital Only)

```mermaid
sequenceDiagram
    actor H as Hospital Admin
    participant M as Emergency Modal
    participant API as Next.js API
    participant DB as Supabase DB

    H->>M: Clicks "Emergency Lookup"
    M->>H: Prompts for Patient NID/Health ID
    H->>M: Enters ID (e.g. 1234567890)
    M->>API: POST /api/emergency/patient
    
    API->>API: Validates Requestor Role (Must be Hospital)
    
    alt Unauthorized
        API-->>M: 403 Forbidden
        M-->>H: Access Denied Error
    else Authorized
        API->>DB: Fetch Patient Vitals, Blood Group, Allergies
        DB-->>API: Returns Critical Data
        API-->>M: 200 OK + Patient Data
        M-->>H: Displays Emergency Profile
    end
```

## 🗄️ Entity Relationship Diagram (Core)

```mermaid
erDiagram
    PROFILE ||--o{ PRESCRIPTION : writes
    PROFILE ||--o{ APPOINTMENT : manages
    PROFILE ||--o{ HOSPITAL_BED : owns
    
    PATIENT ||--o{ PRESCRIPTION : receives
    PATIENT ||--o{ APPOINTMENT : books
    PATIENT ||--o| HOSPITAL_BED : occupies
    
    PROFILE {
        uuid id PK
        string role "patient | doctor | hospital | admin"
        string status "active | pending"
        string email
    }
    
    PATIENT {
        uuid id PK
        string mrn "Health ID"
        string blood_group
        jsonb allergies
    }
    
    PRESCRIPTION {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        jsonb medicines
    }
    
    HOSPITAL_BED {
        uuid id PK
        uuid hospital_id FK
        uuid patient_id FK
        string status "available | occupied"
    }
```

## 🧑‍🤝‍🧑 Use Case Flow

```mermaid
graph LR
    P((Patient))
    D((Doctor))
    H((Hospital))
    SA((Super Admin))

    P --> B(Book Appointment)
    P --> V(View Medical History)
    P --> C(Chat with AI Assistant)

    D --> Q(View Patient Queue)
    D --> W(Write Digital Prescription)
    D --> VH(View Patient History)

    H --> M(Manage Live Beds)
    H --> E(Emergency NID Lookup)

    SA --> A(Approve Doctor/Hospital Accounts)
    SA --> VS(View System Analytics)
```

---

## 🔬 Lab Report Analyzer (Bengali-First) & Multi-Tenant B2B Healthcare SaaS

Oxpecker AI combines a deterministic Bengali diagnostic report explainer ("রিপোর্ট বুঝিয়ে দেওয়া + সঠিক ডাক্তারের কাছে পৌঁছে দেওয়া") with a multi-tenant B2B SaaS platform for clinics, diagnostic labs, and hospitals:

- **Deterministic Reference-Range Engine:** Code assigns flags (`স্বাভাবিক` / `কম` / `বেশি`) across CBC, HbA1c, FBS/RBS (`mg/dL` & `mmol/L`), Lipid Profile, Creatinine + CKD-EPI eGFR, LFT, TSH, Vitamin D, and Urine R/E—never delegated to LLMs. Lab-printed reference ranges take precedence when available.
- **Hard AI Safety Guardrails:** Critical values/symptoms trigger an emergency `999` override banner first; definitive diagnosis phrases or unmeasured accuracy percentages are rejected/sanitized and logged.
- **Longitudinal Trends & Doctor Review Loop:** Compare repeated tests (e.g., `HbA1c` across dates), generate 24-hour expiring share links, and let registered doctors verify summaries with `"ডাক্তার যাচাই করেছেন"` badges while keeping full edit history.
- **Multi-Tenant B2B SaaS & Directory Routing:** Workspace quotas (`free`, `clinic_starter`, `clinic_pro`, `lab_enterprise`), bKash/Nagad/SSLCommerz sandbox checkout, consent-gated specialist leads (`/doctors?specialty=...`), clinic-branded PDFs, OpenAPI 3.1 (`/api/saas/workspace?openapi=1`), and webhooks.

### 🧪 Run Tests Locally
```bash
cd Frontend
npx prisma generate
npm test
npm run lint
npm run build
```

### ⚡ 60-Second Judge Demo Route
Open **`/demo`** (publicly accessible without login gates) or navigate from `/reports`:
1. Inspect the seeded Health ID **`HP-2026-8841`** and click **"১-ক্লিক ডেমো ল্যাব রিপোর্ট বিশ্লেষণ"**.
2. Review deterministic green/amber/red flags, **"কেন এই ফলাফল"**, Bengali explanations, and multi-visit HbA1c trend charts.
3. Toggle **"ডাক্তার যাচাই করুন"** to stamp `"ডাক্তার যাচাই করেছেন"` with preserved AI edit history.
4. Click **"কোন ডাক্তার দেখাবেন"** to open filtered Bangladesh specialists (`/doctors?specialty=Endocrinology`) and submit a consent-gated consultation request.

---
*Built securely for the citizens of Bangladesh.*
