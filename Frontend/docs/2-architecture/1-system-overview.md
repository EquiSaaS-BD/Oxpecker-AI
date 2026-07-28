---
title: "System Overview"
description: "A resilient, microservices-inspired system engineered for scale, concurrency, and real-time medical AI."
order: 1
---

# Architecture Overview

Oxpecker AI operates on a modern microservices-inspired architecture, neatly divided between a fast frontend client and a robust backend API. 

## End-to-End System Flow

The data flow from a User Input down to the AI Engine and back to the UI is designed for high concurrency.

```mermaid
graph TD
    classDef frontend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef gateway fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:#fff
    classDef backend fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff
    classDef database fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    classDef ai fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#fff

    F[Next.js Frontend] ::: frontend
    AG[API Gateway / Nginx] ::: gateway
    B[FastAPI Backend] ::: backend
    DB[(PostgreSQL)] ::: database
    Q[(Redis + Celery)] ::: database
    AI[OCR & ML Engine] ::: ai

    F -->|HTTPS / WSS| AG
    AG --> B
    B -->|Read/Write| DB
    B -->|Enqueue Jobs| Q
    Q -->|Process Background Tasks| AI
    AI -->|Save Results| DB
```

### The Frontend (Next.js)
We utilize **Next.js App Router** for Server-Side Rendering (SSR) and seamless client-side hydration. The UI is built using **Tailwind CSS** and **shadcn/ui**, ensuring a clean, accessible, and responsive design system.
- State is managed locally (context/hooks) and synchronized with the backend via REST API calls.

### The Backend (FastAPI)
The backend is written in Python using **FastAPI**. It handles authentication, authorization (JWT/RBAC), database connections via **SQLAlchemy**, and validation using **Pydantic**.
- Endpoints are grouped logically under `src/api/routes`.
- Heavy computational tasks (like OCR) are not run on the main event loop. They are offloaded to **Celery Workers**.

### Database & Caching
- **PostgreSQL** is the primary source of truth, storing Users, Appointments, Prescriptions, and Payments.
- **Redis** is used as the message broker for Celery, and for caching expensive AI API responses or doctor search queries.

## Folder Structure

```text
Oxpecker.ai/
├── Frontend/             # Next.js Application
│   ├── src/
│   │   ├── app/          # App Router Pages & API Routes
│   │   ├── components/   # Reusable UI Components
│   │   ├── context/      # React Context Providers
│   │   └── lib/          # Utilities (Docs parser, etc)
│   └── docs/             # Markdown Documentation Files
└── Backend/              # FastAPI Application
    ├── app/
    │   ├── api/          # Route Handlers
    │   ├── core/         # Security & Config
    │   ├── models/       # SQLAlchemy DB Models
    │   ├── schemas/      # Pydantic Validation Schemas
    │   └── services/     # Business Logic
    └── alembic/          # Database Migrations
```
