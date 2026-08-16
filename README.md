# Shustota AI: Decentralized Clinical Intelligence Platform

An enterprise-grade, zero-overhead AI healthcare ecosystem designed for low-bandwidth, high-volume patient-doctor-hospital management. Engineered for instant clinical symptom analysis, prescription OCR scanning, and intelligent medical directory mapping. 

Fully optimized to run at zero operating cost on free tier cloud infrastructures. -- - - - - 

---

## The Problem

Healthcare delivery in developing countries suffers from structural bottlenecks:
1. **Clinical Inaccessibility:** Overburdened healthcare systems result in delayed primary checkups and self-medication.
2. **Prescription Illiteracy:** Hand-written prescriptions lead to critical dosing errors due to illegible writing and poor patient comprehension.
3. **Exploitative Pricing:** Lack of transparent alternative options leads to artificial inflation of medical expenses for the underprivileged.
4. **Infrastructure Costs:** Deploying clinical grade software typically requires expensive cloud resources, making free-of-cost service distribution unsustainable.

---

## The Solution

Shustota AI resolves these challenges through a unified, hyper-efficient clinical stack:
* **Medical-Grade AI Diagnostics:** Real-time symptom checks utilizing secure Gemini API configurations, optimized with bilingual (English and Bengali) prompting rules.
* **Psychology-Driven Engagement:** Incorporates the **Labor Illusion** effect during scanning, the **Goal Gradient** effect for registration, and the **Zeigarnik Effect** to drive profile completion.
* **Dynamic Generic Mapping:** Instantly parses prescriptions using AI-powered OCR, detects the active ingredients, and presents cost-effective alternative medicines sorted by price.
* **Serverless Cost-Efficiency:** Designed to leverage Vercel Serverless Edge, Aiven MySQL database pools, and Render automated sleep-management, running the entire app completely for free.

---

## Live Demo & Tech Stack

* **Live Frontend:** [shushthota.vercel.app](https://shushthota.vercel.app) (Deployed on Vercel)
* **Live Backend API:** [shustota-backend.onrender.com](https://shustota-backend.onrender.com) (FastAPI on Render)

### The Architecture Stack
* **Frontend:** Next.js (App Router), React 19, Tailwind CSS, Framer Motion, Lucide Icons, Sonner.
* **Backend:** FastAPI, Python 3.11, Pydantic v2, SQLAlchemy (ORM), Alembic (Migrations).
* **Database:** MySQL (Aiven Cloud Instance).
* **AI Engine:** Google Gemini Pro API.

---

## Local Setup & Run Instructions

Ensure Node.js v22+ and Python 3.11+ are installed locally.

### 1. Backend Setup
```bash
# Navigate to backend directory
cd Backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database setup and seed mock data
python setup_db.py

# Start local FastAPI server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Run build to verify types and assets
npm run build

# Start local development server
npm run dev
```

---

## System Documentation

### 1. System Architecture Diagram

```mermaid
graph TD
    User([User: Patient / Doctor / Hospital]) -->|HTTPS / WSS| FE[Next.js Frontend - Vercel Edge]
    FE -->|Serverless API Calls| BE[FastAPI Backend - Render]
    
    subgraph Core Cloud Infrastructure
        BE -->|SQLAlchemy ORM| DB[(Aiven MySQL Database)]
        BE -->|Secure JSON Payload| AI[Google Gemini API]
        FE -->|Client-Side SDK| FA[Firebase Analytics]
    end

    subgraph Static Data Services
        BE -->|Caching / Session| Redis[(Local Redis / Database Cache)]
    end
    
    style FE fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    style BE fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    style DB fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    style AI fill:#faf5ff,stroke:#9333ea,stroke-width:2px;
```

### 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string phone UK
        string full_name
        string hashed_password
        string role
        boolean is_active
        boolean is_verified
        string avatar_url
        datetime last_login_at
        datetime created_at
        datetime updated_at
    }
    PATIENT_PROFILES {
        uuid id PK
        uuid user_id FK
        date dob
        string gender
        string blood_group
        string emergency_contact
        text medical_history
    }
    DOCTOR_PROFILES {
        uuid id PK
        uuid user_id FK
        string registration_number
        string specialty
        integer experience_years
        string bio
        string fee_video
        string fee_in_person
    }
    HOSPITAL_PROFILES {
        uuid id PK
        uuid user_id FK
        string registration_number
        string address
        string bed_capacity
        boolean has_icu
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        boolean is_read
        datetime created_at
    }
    
    USERS ||--o| PATIENT_PROFILES : "has one"
    USERS ||--o| DOCTOR_PROFILES : "has one"
    USERS ||--o| HOSPITAL_PROFILES : "has one"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

### 3. Data Flow Diagram (DFD Level 0 and Level 1)

#### Level 0: Context Diagram

```mermaid
graph TD
    Patient([Patient Actor]) -->|Symptom Logs & Prescription Upload| System[Process 0: Shustota AI Platform]
    Doctor([Doctor Actor]) -->|Schedule & Consultation Settings| System
    
    System -->|Diagnosis & Alternative Medicines| Patient
    System -->|Appointment Booking Notifications| Doctor
    
    System -->|Raw Text & Query| GeminiAI[External: Gemini AI API]
    GeminiAI -->|Structured JSON Diagnostics| System
    
    System -->|Read/Write Operations| DB[(MySQL Database)]
```

#### Level 1: Process Diagram

```mermaid
graph TD
    Patient([Patient Actor]) -->|1. Input Symptoms| ChatProcess[Process 1.0: AI Symptom Checker]
    Doctor([Doctor Actor]) -->|2. Manage Schedule| ScheduleProcess[Process 2.0: Appointment Booking]
    
    ChatProcess -->|Request Insights| GeminiAI[External: Gemini AI API]
    GeminiAI -->|Return Diagnostics| ChatProcess
    ChatProcess -->|Write Logs| DB[(MySQL Database)]
    ChatProcess -->|Output Suggestions| Patient
    
    Patient -->|3. Select Slot| BookProcess[Process 3.0: Transaction & Booking]
    BookProcess -->|Read Available Chambers| DB
    BookProcess -->|Write Appointment| DB
    BookProcess -->|Send Alert| NotifyProcess[Process 4.0: Notification Manager]
    NotifyProcess -->|Deliver Message| Doctor
```

### 4. Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        Patient((Patient))
        Doctor((Doctor))
        Admin((Admin))
    end

    subgraph "Shustota Platform"
        UC1(Symptom Analysis)
        UC2(Prescription Scanner)
        UC3(Search Medicines)
        UC4(Manage Appointments)
        UC5(Validate Doctor Credentials)
        UC6(System Logs Monitor)
    end

    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4

    Doctor --> UC4

    Admin --> UC5
    Admin --> UC6
```

### 5. Sequence Diagram: Clinical Diagnostic Loop

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Frontend as Web App UI
    participant Backend as FastAPI Server
    participant DB as MySQL DB
    participant Gemini as Gemini AI Engine
    
    Patient->>Frontend: Enter symptoms & upload image
    Frontend->>Backend: POST /api/v1/chat/analyze (payload)
    activate Backend
    Backend->>DB: Query historical diagnostic context
    DB-->>Backend: Return historical logs
    Backend->>Gemini: Stream prompt (symptoms + context)
    activate Gemini
    Gemini-->>Backend: Stream formatted JSON diagnosis
    deactivate Gemini
    Backend->>DB: Log transaction details
    Backend-->>Frontend: Return diagnostic & alternative advice
    deactivate Backend
    Frontend-->>Patient: Render alternatives & step-by-step guidance
```
