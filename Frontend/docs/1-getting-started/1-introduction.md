---
title: "Introduction"
description: "Welcome to the Shustota AI Documentation Center."
order: 1
---

# Shustota AI

Welcome to **Shustota AI**, an enterprise-grade medical assistant platform designed to revolutionize healthcare delivery in Bangladesh and beyond. This platform connects patients, doctors, and hospital administrators through a seamlessly integrated ecosystem powered by Artificial Intelligence.

## Overview

Shustota AI is built on a modern stack comprising a **Next.js (App Router)** frontend for blazing-fast performance and a highly concurrent **FastAPI (Python)** backend. It integrates advanced machine learning models for disease prediction and an Optical Character Recognition (OCR) pipeline for digitizing handwritten medical records.

### Key Features
- **Smart Patient Dashboard:** Patients can book appointments, view digital prescriptions, and order medicines.
- **AI-Powered Diagnostics:** Users can upload lab reports or prescriptions for instant AI analysis, converting unstructured images into structured medical data.
- **WebRTC Video Consultations:** Secure, peer-to-peer live video calls between doctors and patients directly within the browser.
- **Enterprise Security:** JWT-based authentication, strict Role-Based Access Control (RBAC), and AES encryption for sensitive health data.

## Getting Started

To explore the documentation, use the sidebar navigation or press `⌘K` to search for specific components, API routes, or architectural diagrams.

> [!TIP]
> **Developers:** Start by reading the [System Overview](/docs/2-architecture/1-system-overview) to understand the full data flow before diving into the API references.

## Core Technologies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, Tailwind CSS, Framer Motion | User Interface, SSR, Routing |
| **Backend** | FastAPI, Pydantic, SQLAlchemy | Core API, Business Logic |
| **Database** | PostgreSQL | Relational Data Storage |
| **Caching/Queue** | Redis, Celery | Async Tasks, Rate Limiting |
| **AI Engine** | Tesseract OCR, Google Gemini | Image Processing, NLP |
