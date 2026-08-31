---
title: "AI Clinical Engine"
description: "Multi-model clinical intelligence architecture with safety triage and medication verification."
order: 5
---

# AI Clinical Intelligence Engine

The Oxpecker AI engine processes patient symptoms, images, and prescriptions while enforcing rigorous safety protocols.

## Clinical Pipeline

```mermaid
flowchart LR
    Input[Patient Symptom Input] --> Guard[Emergency Safety Filter]
    Guard -->|Acute Danger| EmergencyAlert[Emergency Hotline Alert]
    Guard -->|Standard Case| LLMGateway[Multi-Model AI Gateway]
    LLMGateway --> ModelRouter{Provider}
    ModelRouter --> Gemini[Google Gemini]
    ModelRouter --> OpenAI[OpenAI GPT-4o]
    ModelRouter --> DeepSeek[DeepSeek Clinical]
    ModelRouter --> MedMatcher[DGDA Medicine Index Matcher]
    MedMatcher --> Output[Interactive Medical Action Cards]
```

## Safety Triage Protocols
1. **Red Flag Detection:** Critical symptoms (e.g., chest pain, stroke symptoms, acute bleeding) trigger immediate emergency card routing with emergency hotline buttons.
2. **Generic Drug Mapping:** AI recommendations are verified against the registered medicine index to prevent hallucinations.
3. **Doctor Verification:** AI outputs explicitly note they do not replace formal medical consultations and recommend verified local specialists.
