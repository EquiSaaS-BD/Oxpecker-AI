# Shustota AI: Enterprise System Architecture Documentation

*This is a living architectural document for Shustota AI. It is being generated in phases.*

---

## 1. Complete High Level Architecture Diagram

The High-Level Architecture outlines the end-to-end ecosystem. Users interact via the Next.js frontend, which connects through an API Gateway to the FastAPI backend. The backend orchestrates tasks between PostgreSQL, Redis, Celery workers, and the AI/ML modules.

```mermaid
graph TD
    %% Styling
    classDef users fill:#3b82f6,stroke:#1e3a8a,stroke-width:2px,color:#fff,font-weight:bold
    classDef frontend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef gateway fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    classDef backend fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef database fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    classDef cache fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#fff
    classDef ai fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#fff
    classDef external fill:#64748b,stroke:#334155,stroke-width:2px,color:#fff

    %% Nodes
    subgraph Users
        U1(Patient) ::: users
        U2(Doctor) ::: users
        U3(Assistant) ::: users
        U4(Admin) ::: users
    end

    F[Next.js Frontend / Web App] ::: frontend
    AG[API Gateway / Nginx / Load Balancer] ::: gateway

    subgraph Backend Services
        B_CORE[FastAPI Core Backend] ::: backend
        B_AUTH[Auth Service] ::: backend
        B_PAY[Payment Service] ::: backend
        B_NOTIF[Notification Service] ::: backend
    end

    subgraph Data Layer
        DB[(PostgreSQL Database)] ::: database
        REDIS[(Redis Cache / Broker)] ::: cache
        S3[(Cloud Storage / AWS S3)] ::: database
    end

    subgraph Asynchronous Processing
        CELERY[Celery Worker Queue] ::: cache
    end

    subgraph AI & ML Engine
        AI_GATE[AI Gateway] ::: ai
        LLM[Google Gemini / LLM] ::: ai
        OCR[Medical OCR Engine] ::: ai
        ML[Disease Prediction ML] ::: ai
    end

    subgraph External Services
        EXT_PAY[SSLCommerz / Stripe] ::: external
        EXT_SMS[SMS Gateway / Twilio] ::: external
        EXT_RTC[WebRTC / Video Call] ::: external
    end

    %% Connections
    Users -->|HTTPS| F
    F -->|REST API / WSS| AG
    AG --> B_CORE
    AG --> B_AUTH
    
    B_CORE <--> B_PAY
    B_CORE <--> B_NOTIF
    
    B_CORE -->|Read/Write| DB
    B_AUTH -->|Read/Write| DB
    
    B_CORE -->|Cache/Session| REDIS
    B_CORE -->|Enqueue Job| CELERY
    CELERY -->|Pop Job| REDIS
    CELERY -->|Write Result| DB
    
    B_CORE -->|Upload/Download| S3
    
    B_CORE -->|Analyze Data| AI_GATE
    CELERY -->|Background Processing| AI_GATE
    
    AI_GATE --> LLM
    AI_GATE --> OCR
    AI_GATE --> ML
    
    B_PAY -->|Process| EXT_PAY
    B_NOTIF -->|Send| EXT_SMS
    F -->|P2P Video| EXT_RTC
```

---

## 2. Complete Data Flow Diagram (DFD)

This diagram tracks the exact movement of data during a critical operation. Here we illustrate the **Patient Registration & Onboarding** flow.

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Frontend as Next.js Form
    participant API as API Gateway
    participant Auth as Auth Controller
    participant Validator as Pydantic Validation
    participant DB as PostgreSQL
    participant Worker as Celery Worker
    participant Email as Email/SMS Gateway

    Patient->>Frontend: Enter Details & Submit
    Frontend->>Frontend: Client-side Validation
    Frontend->>API: POST /api/v1/auth/register (JSON)
    API->>Auth: Route Request
    Auth->>Validator: Validate Schema (Email, Password Strength)
    
    alt Validation Failed
        Validator-->>Auth: Error (422 Unprocessable Entity)
        Auth-->>Frontend: Error Response
        Frontend-->>Patient: Show Error Messages
    else Validation Passed
        Validator->>Auth: Validated Data
        Auth->>Auth: Hash Password (Argon2/Bcrypt)
        Auth->>DB: INSERT INTO shustota_users
        DB-->>Auth: Return User ID
        Auth->>Worker: Enqueue Welcome Email Job
        Auth-->>Frontend: 201 Created (Success)
        Frontend-->>Patient: Redirect to Login
        
        %% Background Process
        Worker->>Email: Send Welcome Notification
        Email-->>Worker: Delivery Status
    end
```

---

## 3. Complete User Flow Diagram

Visualizing the path different user roles take through the application.

```mermaid
stateDiagram-v2
    %% Patient Flow
    state "Patient Flow" as PatientFlow {
        [*] --> Signup
        Signup --> Login
        Login --> Dashboard
        Dashboard --> SearchDoctor
        SearchDoctor --> BookAppointment
        BookAppointment --> Payment
        Payment --> DoctorConsultation
        DoctorConsultation --> ViewPrescription
        ViewPrescription --> OrderMedicine
        ViewPrescription --> DownloadReport
        OrderMedicine --> [*]
        DownloadReport --> [*]
    }

    %% Doctor Flow
    state "Doctor Flow" as DoctorFlow {
        [*] --> DocLogin
        DocLogin --> LiveQueue
        LiveQueue --> CallNextPatient
        CallNextPatient --> VideoCall
        VideoCall --> GeneratePrescription
        GeneratePrescription --> SendToAssistant
        SendToAssistant --> [*]
    }

    %% Admin Flow
    state "Admin Flow" as AdminFlow {
        [*] --> AdminLogin
        AdminLogin --> AdminDashboard
        AdminDashboard --> ManageUsers
        AdminDashboard --> VerifyDoctors
        AdminDashboard --> SystemAnalytics
        SystemAnalytics --> [*]
    }
```

---

## 4. Database Relationship Diagram (ER Diagram)

The underlying schema architecture for Shustota AI. 

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : books
    USER ||--o{ PRESCRIPTION : receives
    USER ||--o{ MEDICAL_RECORD : owns
    USER ||--o{ PAYMENT : makes
    
    DOCTOR ||--o{ APPOINTMENT : conducts
    DOCTOR ||--o{ PRESCRIPTION : issues
    DOCTOR }|--|| HOSPITAL : belongs_to
    
    ASSISTANT }|--|| DOCTOR : assigned_to
    
    APPOINTMENT ||--|| PRESCRIPTION : results_in
    APPOINTMENT ||--|| PAYMENT : requires
    
    PRESCRIPTION ||--o{ MEDICINE : contains
    
    USER {
        uuid id PK
        string role "Patient, Admin"
        string email
        string password_hash
        string phone
        datetime created_at
    }
    
    DOCTOR {
        uuid id PK
        uuid user_id FK
        string specialty
        float consultation_fee
        string bmdc_reg_no
        boolean is_verified
    }
    
    ASSISTANT {
        uuid id PK
        uuid user_id FK
        uuid doctor_id FK
        string permissions
    }
    
    HOSPITAL {
        uuid id PK
        string name
        string address
        boolean has_emergency
    }
    
    APPOINTMENT {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        datetime schedule_time
        string status "Pending, Active, Completed"
    }
    
    PRESCRIPTION {
        uuid id PK
        uuid appointment_id FK
        uuid doctor_id FK
        uuid patient_id FK
        text diagnosis
        string pdf_url
    }
    
    PAYMENT {
        uuid id PK
        uuid appointment_id FK
        uuid user_id FK
        float amount
        string status "Success, Failed"
        string transaction_id
    }
    
    MEDICAL_RECORD {
        uuid id PK
        uuid patient_id FK
        string record_type "Lab Report, X-Ray"
        string file_url
        json ai_analysis_summary
    }
```

---

## 5. Authentication & Authorization Flow

Demonstrating the robust JWT-based security layer.

```mermaid
sequenceDiagram
    actor Client
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Cache as Redis (Blacklist)

    Client->>API: POST /login (email, password)
    API->>DB: Query User by Email
    DB-->>API: Return User & Hash
    API->>API: Verify Password Hash
    
    alt Invalid Credentials
        API-->>Client: 401 Unauthorized
    else Valid Credentials
        API->>API: Generate Access Token (15m)
        API->>API: Generate Refresh Token (7d)
        API->>DB: Store Refresh Token Hashed
        API-->>Client: Return JWT Tokens
    end

    Note over Client, API: Subsequent Protected Request
    
    Client->>API: GET /api/v1/patient/records (Bearer Token)
    API->>Cache: Check if Token is Blacklisted
    
    alt Token Blacklisted
        Cache-->>API: True
        API-->>Client: 401 Unauthorized
    else Token Valid
        Cache-->>API: False
        API->>API: Decode JWT & Verify Signature
        API->>API: Extract Role (e.g., "patient")
        
        alt Role Authorized
            API->>DB: Fetch Data
            DB-->>API: Data
            API-->>Client: 200 OK (Data)
        else Role Unauthorized
            API-->>Client: 403 Forbidden
        end
    end
```

---

## 6. AI Workflow Diagram

Shustota AI integrates advanced machine learning and OCR modules. This diagram illustrates the medical image processing flow, where a patient uploads a lab report.

```mermaid
stateDiagram-v2
    [*] --> UploadMedicalImage
    UploadMedicalImage --> ImageValidation
    
    state "AI Processing Pipeline" as AIPipeline {
        ImageValidation --> Preprocessing
        Preprocessing --> OCREngine
        OCREngine --> TextExtraction
        TextExtraction --> MedicalEntityParsing
        MedicalEntityParsing --> DiseaseDetectionModel
        DiseaseDetectionModel --> ConfidenceScoreGeneration
    }
    
    AIPipeline --> DoctorRecommendation
    DoctorRecommendation --> ReportGeneration
    ReportGeneration --> SaveToDatabase
    SaveToDatabase --> [*]
```

---

## 7. OCR Processing Flow

Detailed breakdown of how the Optical Character Recognition (OCR) engine extracts structured medical data from raw prescriptions and reports.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend API
    participant Celery as Async Worker
    participant Tesseract as OCR Engine
    participant NLP as Medical NLP Model
    participant DB as PostgreSQL

    FE->>API: Upload Image (Multipart/form-data)
    API->>DB: Save File Record (Status: Processing)
    API->>Celery: Enqueue OCR Job
    API-->>FE: 202 Accepted (Job ID)
    
    Celery->>Tesseract: Preprocess (Grayscale, Binarize)
    Tesseract->>Tesseract: Extract Raw Text
    Tesseract-->>Celery: Raw Text Output
    
    Celery->>NLP: Parse Medical Entities (Rx, Dosage)
    NLP-->>Celery: Structured JSON Data
    
    Celery->>DB: Update Record (Status: Complete, Data: JSON)
    
    Note over FE, API: Frontend polls or receives WebSocket event
    FE->>API: GET /record/{id}
    API-->>FE: Return Parsed Structured Data
```

---

## 8. Doctor Appointment Workflow

The end-to-end process of booking and conducting an appointment.

```mermaid
flowchart TD
    A[Patient Searches Doctor] --> B{Filter by Specialty?}
    B -->|Yes| C[View Filtered List]
    B -->|No| D[View All Doctors]
    C --> E[Select Doctor]
    D --> E
    E --> F[Check Availability Slots]
    F --> G[Book Slot]
    G --> H[Process Payment]
    
    H -->|Success| I[Confirm Appointment]
    H -->|Fail| J[Payment Failed Error]
    
    I --> K[Notify Doctor]
    K --> L[Doctor Dashboard Live Queue]
    L --> M[Start Video Consultation]
    M --> N[Write Prescription]
    N --> O[Schedule Follow-up]
```
---

## 9. Prescription Workflow

How a prescription moves from the doctor's desk to the patient's records.

```mermaid
sequenceDiagram
    actor Doctor
    participant UI as Doctor Dashboard
    participant API as Backend
    participant PDF as PDF Generator (WeasyPrint)
    participant DB as Database
    actor Patient

    Doctor->>UI: Select Medicines & Add Notes
    UI->>API: POST /prescription (JSON)
    API->>DB: Save Prescription Data
    API->>PDF: Generate Digital PDF
    PDF-->>API: PDF Buffer
    API->>DB: Save PDF URL
    API-->>UI: Success
    
    API->>Patient: Push Notification "New Prescription"
    Patient->>UI: Open App
    UI->>API: GET /prescription/{id}/pdf
    API-->>Patient: Download/View PDF
```

---

## 10. Notification Workflow

Handling system-wide real-time alerts and scheduled messages.

```mermaid
graph LR
    classDef trigger fill:#ef4444,color:#fff
    classDef worker fill:#f59e0b,color:#fff
    classDef delivery fill:#10b981,color:#fff

    T1(Appointment Booked) ::: trigger
    T2(Payment Received) ::: trigger
    T3(Prescription Ready) ::: trigger

    B[FastAPI Backend] 
    Q[(Redis Queue)] 
    W[Celery Notification Worker] ::: worker

    T1 --> B
    T2 --> B
    T3 --> B

    B -->|Enqueue| Q
    Q -->|Pop| W

    W -->|Push| PUSH[FCM / APNS] ::: delivery
    W -->|Email| EMAIL[SendGrid / SMTP] ::: delivery
    W -->|SMS| SMS[Twilio / Local SMS] ::: delivery
```

---

## 11. Payment Workflow

Integrating third-party payment gateways safely.

```mermaid
sequenceDiagram
    actor User
    participant App as Frontend
    participant API as Backend
    participant PG as Payment Gateway (SSLCommerz)
    participant DB as Database

    User->>App: Click "Pay Now"
    App->>API: Initialize Payment (Amount, OrderID)
    API->>PG: Create Session
    PG-->>API: Session URL
    API-->>App: Redirect to PG URL
    
    App->>PG: User enters card details
    PG->>PG: Process Payment
    
    PG-->>API: Webhook (Payment Success/Fail)
    API->>DB: Update Invoice Status
    API->>API: Trigger Notifications
    
    PG-->>App: Redirect back to App
    App->>API: Verify Status
    API-->>App: Success Screen
```

---

## 12. File Upload Workflow

Securely handling medical reports and patient avatars.

```mermaid
flowchart TD
    U[User Uploads File] --> F[Frontend Validation size/type]
    F -->|Valid| A[API /upload endpoint]
    A --> V[Backend Validation & MIME Check]
    V --> S{Scan for Viruses?}
    
    S -->|Clean| C[Image Compression/Optimization]
    S -->|Infected| R[Reject Upload]
    
    C --> B[Upload to AWS S3 / R2]
    B --> D[Save URL in Database]
    D --> E[Return URL to Frontend]
```

---

## 13. API Communication Diagram

Standard REST API controller and service layer pattern used across all endpoints.

```mermaid
sequenceDiagram
    participant C as Client (Next.js)
    participant AG as API Gateway
    participant R as Router / Controller
    participant S as Service Layer
    participant Rep as Repository Layer
    participant DB as PostgreSQL

    C->>AG: GET /api/v1/patients/{id} (JWT)
    AG->>AG: Rate Limiting & Auth Check
    AG->>R: Route to PatientController
    
    R->>R: Validate Path & Query Params (Pydantic)
    R->>S: get_patient(id)
    
    S->>S: Apply Business Logic
    S->>Rep: find_by_id(id)
    
    Rep->>DB: SELECT * FROM patients WHERE id=?
    DB-->>Rep: Record Set
    
    Rep-->>S: ORM Model
    S->>S: Convert to Response Schema
    S-->>R: PatientSchema
    R-->>AG: JSON Response
    AG-->>C: HTTP 200 OK
```

---

## 14. Admin Workflow

How system administrators govern the platform.

```mermaid
flowchart TD
    A[Admin Log in] --> B[Admin Dashboard]
    
    B --> C[Manage Users]
    B --> D[Verify Doctors]
    B --> E[Monitor Transactions]
    B --> F[System Analytics]
    
    C --> C1[Block/Unblock User]
    D --> D1[Approve BMDC License]
    E --> E1[Refund / Void]
    F --> F1[View Revenue & Traffic]
```

---

## 15. Backend Module Dependency Diagram

Showing the internal structure of the FastAPI backend.

```mermaid
graph TD
    API[api/routes] --> CORE[core/config]
    API --> AUTH[core/auth]
    API --> SERVICES[services/]
    
    SERVICES --> MODELS[models/]
    SERVICES --> SCHEMAS[schemas/]
    SERVICES --> CRUD[crud/]
    SERVICES --> EXTERNAL[utils/external]
    
    CRUD --> DB[db/session]
    CRUD --> MODELS
    
    EXTERNAL --> AWS[utils/s3]
    EXTERNAL --> REDIS[utils/redis]
    EXTERNAL --> AI[utils/gemini]
```

---

## 16. Frontend Component Tree

High-level React component hierarchy for the application.

```mermaid
graph TD
    ROOT[app/layout.tsx] --> PROVIDERS[Auth/Theme Providers]
    PROVIDERS --> NAV[Navbar]
    PROVIDERS --> MAIN[Page Content]
    PROVIDERS --> FOOTER[Footer]
    
    MAIN --> APP[(app)]
    MAIN --> AUTH[(auth)]
    
    APP --> PATIENT[Patient Dashboard]
    APP --> DOCTOR[Doctor Dashboard]
    APP --> ASSISTANT[Assistant Dashboard]
    
    DOCTOR --> QUEUE[Live Queue List]
    DOCTOR --> RX[Prescription Editor]
    DOCTOR --> VIDEO[WebRTC Video Modal]
    
    ASSISTANT --> WALK[Walk-in Form]
    ASSISTANT --> BILL[Billing Modal]
    ASSISTANT --> PRINT[Rx Print View]
```

---

## 17. Folder Structure Diagram

The monorepo-style folder architecture for Shustota AI.

```mermaid
graph LR
    Root[Shustota.ai/]
    Root --> FE[Frontend/]
    Root --> BE[Backend/]
    
    FE --> F_SRC[src/]
    F_SRC --> F_APP[app/]
    F_SRC --> F_COMP[components/]
    F_SRC --> F_CTX[context/]
    F_SRC --> F_LIB[lib/]
    
    BE --> B_APP[app/]
    B_APP --> B_API[api/]
    B_APP --> B_MOD[models/]
    B_APP --> B_SCH[schemas/]
    B_APP --> B_SRV[services/]
    B_APP --> B_COR[core/]
    
    BE --> AL[alembic/]
```

---

## 18. Deployment Architecture

Cloud architecture for enterprise scale and high availability.

```mermaid
graph TD
    User((Users)) -->|HTTPS| CF[Cloudflare CDN & WAF]
    CF --> LB[Load Balancer]
    
    LB -->|Port 3000| FE1[Next.js Pod 1]
    LB -->|Port 3000| FE2[Next.js Pod 2]
    
    FE1 -->|REST API| AG[API Gateway / Nginx]
    FE2 -->|REST API| AG
    
    AG --> BE1[FastAPI Worker 1]
    AG --> BE2[FastAPI Worker 2]
    
    BE1 --> RDS[(AWS RDS PostgreSQL)]
    BE2 --> RDS
    
    BE1 --> REDIS[(AWS ElastiCache Redis)]
    BE2 --> REDIS
    
    REDIS --> CELERY[Celery Async Workers]
    CELERY --> RDS
    
    BE1 --> S3[(AWS S3 Storage)]
    CELERY --> S3
```

---

## 19. Security Architecture

Multi-layered security protocols ensuring HIPAA/Data compliance.

```mermaid
flowchart TD
    WAF[Cloudflare WAF / DDoS Protection] --> TLS[TLS 1.3 Encryption]
    TLS --> NGINX[Nginx Rate Limiting]
    NGINX --> JWT[JWT Token Validation]
    JWT --> RBAC[Role-Based Access Control]
    RBAC --> SANITIZATION[Input Sanitization / Pydantic]
    SANITIZATION --> ORM[SQLAlchemy ORM - Prevents SQLi]
    ORM --> DB[(Encrypted Database At Rest)]
    
    subgraph Logging
        AUDIT[Audit Logs for Medical Records]
    end
    
    RBAC -.-> AUDIT
```
---

## 20. Complete End-to-End System Flow

The grand overview of a user's entire lifecycle through Shustota AI, connecting all major services.

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant AG as API Gateway
    participant BE as Core Backend
    participant Q as Redis Queue
    participant W as Celery Workers
    participant AI as AI/OCR Modules
    participant D as Doctor
    
    P->>F: Upload Previous Lab Report
    F->>AG: POST /upload
    AG->>BE: Auth & Store File
    BE->>Q: Enqueue OCR Task
    Q->>W: Pop Task
    W->>AI: Extract Text & Analyze
    AI-->>W: Structured JSON + Disease Prediction
    W->>BE: Save to Database
    BE-->>F: Update UI via WebSocket
    
    P->>F: Book Appointment based on AI Suggestion
    F->>AG: Process Payment
    AG->>BE: Verify SSLCommerz Webhook
    BE->>Q: Enqueue Notifications
    
    Q->>W: Send SMS/Email
    W->>P: "Appointment Confirmed"
    W->>D: "New Patient Scheduled"
    
    D->>F: Start Consultation
    F<-->>F: WebRTC P2P Video Call
    
    D->>F: Generate E-Prescription
    F->>AG: Save & Generate PDF
    AG->>BE: Store & Sign PDF
    BE-->>F: PDF Download Link
    F-->>P: View Prescription
```

---

# Phase 4: System Gap Analysis & Improvement Roadmap

After analyzing the current state of the Shustota AI repository (Next.js Frontend & FastAPI Backend), several critical gaps between the current prototype and an enterprise-scale production environment were identified.

## 1. Identified Architecture Gaps & Missing Modules

### 🔴 Missing Core Infrastructure
- **Redis & Celery Missing:** The architecture diagrams rely on async queues for OCR, Emails, and AI processing, but there is no `docker-compose` configuration or setup for Redis/Celery. Operations currently block the main thread.
- **OCR Engine Not Integrated:** The medical OCR processing flow is mocked. Tesseract/Cloud Vision API integration code is absent.
- **ML Models Missing:** The disease prediction ML module is missing from the Python backend.
- **Cloud Storage (AWS S3):** Files are currently stored locally or in memory. S3 buckets and boto3 integrations are missing.

### 🔴 Security Vulnerabilities
- **RBAC (Role Based Access Control) Weakness:** The FastAPI routes do not systematically enforce `@requires_role(["doctor", "admin"])` decorators.
- **Rate Limiting:** Nginx/Cloudflare and internal FastAPI rate limiting (`slowapi`) are missing, leaving the API vulnerable to DDoS or brute force on the `/login` endpoint.
- **Audit Logs:** There is no centralized audit logging for when doctors view or modify patient medical records (Critical for HIPAA compliance).

### 🟡 Database & Performance Issues
- **Database Migrations (Alembic):** While `alembic` is present, the schema lacks necessary indexing on frequently queried columns (e.g., `user_id` in appointments).
- **Caching:** Expensive AI endpoints and doctor search queries are not cached in Redis.
- **Connection Pooling:** SQLAlchemy `asyncio` is used, but connection pool limits (`pool_size`, `max_overflow`) are not tuned for high concurrency.

### 🟡 UX Flow & Frontend Bottlenecks
- **LocalStorage Reliance:** The frontend currently relies heavily on `localStorage` for mocking state. This needs to be replaced entirely with React Query/SWR fetching from the backend API.
- **WebRTC Implementation:** Video consultation UI exists, but the signaling server (Socket.io/WebSockets) connecting the WebRTC peers is missing.

---

## 2. Architecture Improvement Roadmap

This roadmap prioritizes the tasks required to bring Shustota AI to a production-ready, enterprise scale.

| Priority | Category | Task Description | Impact |
|:---|:---|:---|:---|
| **CRITICAL** | **State Management** | Strip `localStorage` mock data from Next.js and integrate RTK Query or React Query to fetch real data from FastAPI. | System cannot function with real users otherwise. |
| **CRITICAL** | **Authentication** | Enforce JWT validation and RBAC across all FastAPI routes. Implement refresh token rotation. | Prevents unauthorized data access (Data Leak). |
| **CRITICAL** | **Asynchronous Tasks** | Spin up Redis & Celery via Docker. Offload all Email, SMS, and AI processing to Celery workers. | Prevents API timeouts during heavy AI tasks. |
| **HIGH** | **Storage** | Integrate AWS S3 (via `boto3`) for storing prescriptions, user avatars, and lab reports. | Prevents local server disk from filling up. |
| **HIGH** | **AI & OCR** | Implement Tesseract or Google Cloud Vision for real OCR extraction. Create the pipeline to parse medical JSON. | Enables the core USP of Shustota AI. |
| **HIGH** | **Database** | Add compound indexes to PostgreSQL (via Alembic) for optimized search. Implement soft deletes for records. | Massive performance gain at scale. |
| **MEDIUM** | **Security** | Implement FastAPI Rate Limiting, Helmet headers, and CORS restrictions. | Mitigates basic cyber attacks. |
| **MEDIUM** | **Observability** | Integrate Sentry for Error Tracking, and Prometheus/Grafana for monitoring backend health. | Crucial for DevOps maintenance. |
| **LOW** | **Disaster Recovery** | Set up automated daily cron jobs for PostgreSQL database backups (pg_dump) to cold storage. | Ensures business continuity. |

---
**End of Document**
