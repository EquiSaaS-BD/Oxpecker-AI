---
title: "API Reference"
description: "Serverless API route specifications, request payloads, and response structures."
order: 4
---

# API Reference

All API routes are served via Vercel Serverless Functions under `/api/*`.

## 1. AI Clinical Chat & Triage
`POST /api/ai/chat`

Processes natural language symptom descriptions and returns structured medical insights.

### Request Body:
```json
{
  "message": "I have severe headache and blurred vision since morning",
  "history": []
}
```

### Response (Streaming or JSON):
```json
{
  "response": "Based on your symptoms...",
  "suggestedSpecialty": "Neurologist",
  "severity": "Moderate",
  "isEmergency": false
}
```

## 2. Doctor Search API
`GET /api/doctors/search?q=cardiology&location=dhaka`

Returns filtered doctors matching specialty, name, or hospital.

## 3. Medicine Index API
`GET /api/medicines/search?q=sergel`

Returns verified medicine brands, generics, manufacturers, and indicative prices.

## 4. Hospital Directory API
`GET /api/hospitals/search?location=dhaka`

Returns hospitals with live bed counts, ICU facilities, and contact details.
