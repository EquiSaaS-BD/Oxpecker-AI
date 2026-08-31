# 🏥 Oxpecker AI (Oxpecker AI)
> A centralized, intelligent healthcare platform connecting patients, doctors, and hospitals.

Oxpecker AI is built to solve fragmented medical records, inefficient serial management, and lack of critical data availability during hospital emergencies. By providing a **Universal Health ID**, patients can carry their entire medical history digitally, while hospitals can access life-saving data instantly during critical admissions.

---

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
*Built securely for the citizens of Bangladesh.*
