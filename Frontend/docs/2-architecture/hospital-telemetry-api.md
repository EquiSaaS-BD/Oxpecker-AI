---
title: Hospital Live Telemetry API
description: Proposed contract for connecting hospital systems to the shared health platform.
order: 2
---

# Hospital Live Telemetry API

> Status: Proposed API contract. The versioned routes in this document are not implemented in the current application.

The proposed Hospital Telemetry API lets authorized hospitals share current ICU, CCU, NICU, and general bed capacity with the central platform.

A hospital can connect its Hospital Information System (HIS) to help patients, ambulances, and emergency teams check availability before choosing a facility.

## Authentication

Each approved facility will receive its own bearer token from a network administrator. Clients must send the token with every request.

```http
Authorization: Bearer <YOUR_FACILITY_TOKEN>
```

## Update bed status

Send the hospital's latest bed availability.

### Endpoint

```http
POST /api/v1/telemetry/beds/update
```

### Payload

```json
{
  "hospital_id": "HOSP-DHAKA-102",
  "timestamp": "2026-09-01T10:00:00Z",
  "metrics": {
    "icu_total": 40,
    "icu_available": 3,
    "ccu_total": 15,
    "ccu_available": 0,
    "nicu_total": 10,
    "nicu_available": 2,
    "general_total": 300,
    "general_available": 45
  }
}
```

### Rate limit

The proposed limit is one update every 30 seconds for each hospital.

## Query an emergency profile

Authorized emergency staff can query a patient's health ID when urgent treatment requires key medical information.

### Endpoint

```http
GET /api/v1/emergency/patients/:healthId
```

### Response

```json
{
  "health_id": "BD-H-10928374",
  "status": "AUTHORIZED_EMERGENCY",
  "critical_data": {
    "blood_group": "O+",
    "severe_allergies": ["Penicillin"],
    "chronic_conditions": ["Type 2 Diabetes"],
    "implants": ["Pacemaker (2023)"]
  },
  "access_log": {
    "accessed_by": "Dr. Rafiqul Islam (BMDC: 48392)",
    "location": "Square Hospital ER",
    "timestamp": "2026-09-01T10:15:22Z"
  }
}
```

Emergency profile access must create an audit record. The implementation must authenticate the care provider, validate the reason for access, and support later review of every request.
