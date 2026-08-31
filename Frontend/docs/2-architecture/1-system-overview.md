---
title: "System Overview"
description: "Modern Jamstack and Serverless architecture engineered for scale, zero-maintenance, and low-latency healthcare delivery."
order: 2
---

# Architecture Overview

Oxpecker AI operates on a modern Serverless & Cloud-native architecture designed for high availability and zero infrastructure cost.

## End-to-End System Architecture

```mermaid
graph TD
    classDef client fill:#0284c7,stroke:#0369a1,color:#fff,font-weight:bold
    classDef edge fill:#059669,stroke:#047857,color:#fff
    classDef ai fill:#7c3aed,stroke:#6d28d9,color:#fff
    classDef db fill:#ea580c,stroke:#c2410c,color:#fff

    User[Web & Mobile Browser / Chamber TV Display] ::: client
    Vercel[Vercel Edge Network & Serverless Runtime] ::: edge
    AI[AI Intelligence Gateway - Gemini / OpenAI / DeepSeek] ::: ai
    Supabase[(Supabase Managed PostgreSQL & Auth)] ::: db
    Cron[GitHub Actions Keep-Alive Heartbeat] ::: edge

    User -->|HTTPS| Vercel
    Vercel -->|Serverless Functions / API Routes| AI
    Vercel -->|PostgreSQL Query / RLS / Auth| Supabase
    Cron -->|REST Keep-Alive Ping Every 3 Days| Supabase
```

### 1. The Application Layer (Next.js 15)
The application leverages Next.js 15 App Router for Server-Side Rendering (SSR), React Server Components, and Serverless API Routes. The UI is built using Tailwind CSS v4, Framer Motion, and Lucide icons, ensuring an ultra-fast, accessible, and responsive user experience.

### 2. The Cloud Database & Auth (Supabase PostgreSQL)
Supabase provides an enterprise-grade PostgreSQL relational database with:
- Row-Level Security (RLS) policies isolating user records.
- JSONB columns for flexible medical history and chat logs.
- Supabase Auth for cryptographically secure session handling.

### 3. The AI Intelligence Layer
The platform connects to Google Gemini, OpenAI GPT-4o, and DeepSeek through a unified internal gateway `/api/ai/chat` that incorporates a rule-based clinical emergency pre-filter to detect critical symptoms.

### 4. Background Reliability (GitHub Actions)
A scheduled cron workflow runs every 3 days to ping the database REST API, preventing inactivity pauses and maintaining 24/7 uptime.
