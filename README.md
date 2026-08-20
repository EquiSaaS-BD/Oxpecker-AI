# Oxpecker AI - Next-Generation Intelligent Healthcare Ecosystem

Oxpecker AI is an enterprise-grade healthcare orchestration and clinical intelligence platform built for Bangladesh and emerging healthcare ecosystems. It unites Patients, Doctors, Diagnostic Centers, Hospitals, Clinic Assistants, and System Administrators into a single interconnected network powered by multi-model AI triage, real-time EHR management, and automated chamber queue processing.

Developed by **Team Oxpecker AI** under [EquiSaaS BD](https://equisaas-bd.com).

Live Web Application: [https://oxpecker.equisaas-bd.com](https://oxpecker.equisaas-bd.com)

---

## System Architecture

```mermaid
graph TB
    subgraph ClientLayer [Client Applications & Access Points]
        WebClient[Desktop & Laptop Browsers]
        MobileClient[Mobile & Tablet Browsers - Responsive PWA]
        TVMonitor[Chamber TV Display Monitor]
    end

    subgraph CDNAndEdge [Edge Network & CDN]
        VercelEdge[Vercel Edge Network / Global Anycast CDN]
    end

    subgraph ApplicationLayer [Next.js Application Layer]
        AppRouter[Next.js App Router]
        ServerlessFuncs[Serverless API Route Handlers]
        AuthGuardModule[Role-Based Access Control Guard]
        StateContext[Client State Contexts - Auth, Doctor, Prescription, Chat]
    end

    subgraph IntelligenceLayer [AI Intelligence Gateway]
        GeminiEngine[Google Gemini Flash / Pro]
        OpenAIEngine[OpenAI GPT-4o Architecture]
        DeepSeekEngine[DeepSeek Clinical Intelligence]
        EmergencyEngine[Rule-Based Emergency Safety Filter]
    end

    subgraph DataLayer [Cloud Database & Storage]
        SupabasePostgres[(Supabase Managed PostgreSQL)]
        SupabaseAuth[Supabase Auth Service]
        MedicineJSON[(Indexed Medicine Knowledgebase)]
    end

    subgraph AutomationLayer [Background Automation]
        GitHubAction[GitHub Actions Keep-Alive Cron]
    end

    WebClient --> VercelEdge
    MobileClient --> VercelEdge
    TVMonitor --> VercelEdge

    VercelEdge --> AppRouter
    AppRouter --> StateContext
    AppRouter --> ServerlessFuncs
    ServerlessFuncs --> AuthGuardModule

    ServerlessFuncs --> EmergencyEngine
    EmergencyEngine --> GeminiEngine
    EmergencyEngine --> OpenAIEngine
    EmergencyEngine --> DeepSeekEngine

    ServerlessFuncs --> SupabasePostgres
    ServerlessFuncs --> MedicineJSON
    StateContext --> SupabaseAuth

    GitHubAction -->|HTTP Keep-Alive Ping Every 3 Days| SupabasePostgres
```

---

## Role-Based Access Architecture

Oxpecker AI implements strict multi-tenant role-based access control with distinct workflow engines for each medical actor:

```mermaid
flowchart TD
    User([User Enters Oxpecker Platform]) --> AuthCheck{Authenticated?}

    AuthCheck -- No --> PublicPortal[Landing Page / Doctor Search / Medicine Index / Hospital Directory]
    PublicPortal --> LoginRoute[Sign In / Register]
    LoginRoute --> RoleDetector{Assigned Role}

    AuthCheck -- Yes --> RoleDetector

    RoleDetector -- patient --> PatientDashboard[Patient AI Assistant & Health Portal]
    RoleDetector -- doctor --> DoctorDashboard[Doctor Clinical Workstation & Rx Studio]
    RoleDetector -- assistant --> AssistantDashboard[Assistant Queue & Chamber Console]
    RoleDetector -- hospital --> HospitalDashboard[Hospital Bed & Facility Management]
    RoleDetector -- admin --> AdminConsole[Supreme Administrative & Database Control Center]

    PatientDashboard --> ChatAI[AI Symptom Checker & Triage]
    PatientDashboard --> BookAppt[Doctor & Chamber Booking]
    PatientDashboard --> PatientPass[Live Queue Pass & E-Prescriptions]

    DoctorDashboard --> RxBuilder[Smart E-Prescription Builder]
    DoctorDashboard --> PatientRecords[EHR & Patient History]
    DoctorDashboard --> ChamberSchedule[Chamber Schedule & Fee Management]

    AssistantDashboard --> QueueOps[Live Patient Queue & Call System]
    AssistantDashboard --> WalkInEntry[Walk-In Patient Registration]
    AssistantDashboard --> TVBroadcast[Chamber TV Display Stream]

    HospitalDashboard --> BedManagement[Live Bed Availability Telemetry]
    HospitalDashboard --> AdmissionOps[Admission & Facility Bookings]

    AdminConsole --> UserCrud[User Database Inspection & Password Management]
    AdminConsole --> BookingControl[Global Appointment Modification]
    AdminConsole --> SystemSettings[System Settings & API Gateway Controls]
```

---

## AI Clinical Diagnostic & Triage Pipeline

The AI diagnostic engine processes natural language patient inputs, images, and clinical documents while enforcing rigorous safety guardrails:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    participant UI as Chat UI (Next.js)
    participant Guard as Emergency Filter
    participant Gateway as AI Intelligence Gateway
    participant LLM as Clinical LLM (Gemini / OpenAI / DeepSeek)
    participant MedDB as Medicine Database
    participant Storage as Supabase Cloud

    Patient->>UI: Input symptoms or upload prescription photo
    UI->>Guard: Pre-scan input for critical emergency keywords
    alt Emergency Condition Detected
        Guard-->>UI: Return Immediate Emergency Alert & Hotline Coordinates
    else Standard Consultation
        Guard->>Gateway: Forward sanitized prompt with patient context
        Gateway->>LLM: Stream structured medical reasoning request
        LLM-->>Gateway: Return differential diagnosis, recommendations & generic names
        Gateway->>MedDB: Match generics against Bangladesh registered medicine index
        MedDB-->>Gateway: Return verified brand names, manufacturers & dosages
        Gateway->>Storage: Persist consultation session & messages
        Gateway-->>UI: Deliver structured diagnostic cards to patient
        UI-->>Patient: Render interactive doctor recommendations & medication cards
    end
```

---

## Smart Prescription & Clinical EMR Studio

Doctors utilize a modular, real-time prescription creation environment with integrated pharmacology intelligence:

```mermaid
flowchart LR
    subgraph DoctorStudio [Doctor Rx Studio]
        ChiefComplaint[Chief Complaints & Vitals]
        InvestigationInput[Diagnostic Tests]
        MedicineSearch[Search Medicine Index]
        AdviceTemplate[Clinical Advice & Diet Directives]
    end

    subgraph AutoSuggest [Clinical Engine]
        DrugInteractionCheck[Drug-Drug Interaction Verification]
        DosageRules[Dosage Duration & Timing Calculator]
    end

    subgraph OutputEngine [Prescription Finalization]
        PreviewModal[Real-time Print & PDF Preview]
        DigitalSign[Digital Doctor Seal & QR Code]
        EHRStorage[(Supabase EHR Database)]
        PatientAppPass[Sync to Patient Active Pass]
    end

    ChiefComplaint --> PreviewModal
    InvestigationInput --> PreviewModal
    MedicineSearch --> DrugInteractionCheck
    DrugInteractionCheck --> DosageRules
    DosageRules --> PreviewModal
    AdviceTemplate --> PreviewModal

    PreviewModal --> DigitalSign
    DigitalSign --> EHRStorage
    DigitalSign --> PatientAppPass
```

---

## Chamber Queue & Live Patient Management Flow

The synchronized triangle between Doctor, Assistant, and Patient for seamless chamber throughput:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient
    actor Assistant as Chamber Assistant
    actor Doctor as Doctor
    participant System as Real-time Queue Engine
    participant TV as Waiting Room TV Screen

    Patient->>Assistant: Arrives at chamber or books online
    Assistant->>System: Register patient into live queue
    System->>TV: Update waiting list display
    System->>Patient: Issue digital queue pass with live estimated wait time

    Doctor->>System: Click 'Call Next Patient'
    System->>TV: Announce Serial Number & Patient Name
    System->>Assistant: Notify next patient is entering chamber
    System->>Doctor: Load patient medical history into workstation

    Doctor->>System: Complete consultation & send prescription
    System->>Assistant: Mark patient as completed & update billing
    System->>TV: Advance queue sequence
```

---

## Database Schema & Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        string name
        string email
        string role
        string status
        string phone
        string doctor_id
        string assistant_id
        date join_date
        timestamp created_at
        timestamp updated_at
    }

    DOCTORS {
        uuid id PK
        uuid profile_id FK
        string name
        string specialty
        string[] qualifications
        integer experience_years
        numeric consultation_fee
        numeric platform_fee
        string[] languages
        string location
        string hospital
        numeric rating
        integer review_count
        string[] available_days
        string available_time
        boolean is_verified
        timestamp created_at
    }

    HOSPITALS {
        uuid id PK
        uuid profile_id FK
        string name
        string type
        string address
        string city
        string phone
        string email
        numeric rating
        integer bed_count
        integer available_beds
        string[] departments
        numeric latitude
        numeric longitude
        boolean is_verified
        timestamp created_at
    }

    BOOKINGS {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        string patient_name
        string patient_email
        string patient_phone
        string doctor_name
        date booking_date
        string booking_time
        string status
        numeric consultation_fee
        numeric platform_fee
        numeric total_fee
        text notes
        timestamp created_at
    }

    SAVED_ITEMS {
        uuid id PK
        uuid user_id FK
        string item_type
        string item_id
        string item_name
        jsonb item_meta
        timestamp saved_at
    }

    CHAT_THREADS {
        uuid id PK
        uuid user_id FK
        string title
        jsonb messages
        timestamp created_at
        timestamp updated_at
    }

    PROFILES ||--o| DOCTORS : "extends"
    PROFILES ||--o| HOSPITALS : "extends"
    PROFILES ||--o{ BOOKINGS : "creates"
    DOCTORS ||--o{ BOOKINGS : "receives"
    PROFILES ||--o{ SAVED_ITEMS : "saves"
    PROFILES ||--o{ CHAT_THREADS : "owns"
```

---

## Supabase Keep-Alive Automation

Supabase free tier projects pause after inactivity. Oxpecker AI incorporates a zero-cost automated GitHub Action workflow that executes on a schedule to ping the REST endpoint, ensuring uninterrupted production availability:

```mermaid
graph LR
    CronScheduler[GitHub Actions Cron Scheduler] -->|Triggers Every 3 Days| ActionRunner[Ubuntu Runner]
    ActionRunner -->|Authorized REST HTTP GET Ping| SupabaseEndpoint[Supabase Cloud API Endpoint]
    SupabaseEndpoint -->|HTTP 200 OK Response| ActivityLogger[Maintain Active Database State]
```

---

## Core Features & Modules

### Patient Portal
* **Intelligent AI Consultation:** Multimodal symptoms assessment with real-time markdown streaming and dynamic medical action cards.
* **Emergency Response Unit:** Instant triage detection routing acute cases to emergency hospital lines.
* **Doctor Directory & Booking:** Search verified doctors by specialty, division, chamber location, and fees.
* **Interactive Leaflet Maps:** Embedded mapping with geolocation coordinates across Bangladesh hospitals and clinics.
* **Smart Medicine Lookup:** Comprehensive generic, dosage form, manufacturer, and pricing database.
* **Live Appointment Passes:** Real-time queue progress indicators and digital consultation slips.

### Doctor Workstation
* **Clinical Dashboard:** Daily appointment schedule, revenue stats, and patient rosters.
* **Rx Studio Pro:** Rapid prescription generator with generic search, dosage timing, and printable PDF layouts.
* **Patient EMR Viewer:** Longitudinal medical history, past prescriptions, and diagnostic reports.
* **Chamber & Schedule Configurator:** Custom slots, consultation fees, and assistant delegation.

### Assistant Console
* **Chamber Queue Master:** Live patient queue management, calling, and real-time status toggles.
* **Walk-in Registrar:** Rapid intake for non-registered offline patients.
* **Chamber TV Broadcaster:** Dedicated fullscreen display mode for clinic waiting room monitors.

### Hospital Command Center
* **Live Bed & ICU Telemetry:** Track available, occupied, and maintenance beds in real-time.
* **Admission Manager:** Coordinate patient admissions and departmental transfers.

### Supreme Admin Console
* **Global User Governance:** View, create, update credentials, change roles, ban, or delete accounts.
* **Appointment Control:** Full oversight on all platform bookings and fee settlements.
* **Database Direct Sync:** Synchronize client states with Supabase managed PostgreSQL instances.

---

## Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | React Server Components, Serverless Endpoints, Turbopack |
| **UI & Styling** | Tailwind CSS v4, Framer Motion, Lucide | Responsive design system, Spring animations, Light Theme |
| **Database** | PostgreSQL (Supabase) | Row Level Security (RLS), ACID Compliance, Relational Schema |
| **Authentication** | Supabase Auth | Secure JWT session management, RBAC enforcement |
| **Mapping Engine** | Leaflet.js, OpenStreetMap | Lightweight, interactive hospital and clinic mapping |
| **AI Providers** | Google Gemini, OpenAI, DeepSeek | Multi-provider intelligence gateway |
| **Automation** | GitHub Actions | Recurring CI/CD workflows and database keep-alive heartbeat |
| **Hosting** | Vercel | Global CDN deployment and Serverless Edge execution |

---

## Local Development Setup

### Prerequisites
* Node.js v20 or higher
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/EquiSaaS-BD/Oxpecker-AI.git
cd Oxpecker-AI

# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables Configuration

Create a `.env.local` file inside the `Frontend` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Gateway API Keys
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
```

---

## License & Attribution

This project is licensed under the MIT License.

Built with dedication by **Team Oxpecker AI** for [EquiSaaS BD](https://equisaas-bd.com).
