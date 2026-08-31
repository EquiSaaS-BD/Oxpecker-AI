---
title: "Patient Journey"
description: "Step-by-step patient lifecycle from symptom check to chamber consultation and digital prescription."
order: 6
---

# Patient Journey Workflow

```mermaid
stateDiagram-v2
    [*] --> SymptomSearch
    SymptomSearch --> AITriage
    AITriage --> SpecialistMatching
    SpecialistMatching --> BookAppointment
    BookAppointment --> DigitalPassIssued
    DigitalPassIssued --> ChamberArrival
    ChamberArrival --> QueueCalling
    QueueCalling --> DoctorConsultation
    DoctorConsultation --> DigitalPrescription
    DigitalPrescription --> [*]
```

## Key Touchpoints
- **Initial Discovery:** Patient searches symptoms or doctors on the homepage.
- **Smart Booking:** Patient selects a chamber slot and confirms appointment.
- **Live Queue Pass:** Patient monitors real-time queue position on mobile.
- **Consultation & Rx:** Doctor generates digital prescription synced to patient profile.
