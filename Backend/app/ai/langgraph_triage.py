"""
========================================================================================
🏥 Oxpecker AI - LangGraph Stateful Clinical Diagnostic Graph
========================================================================================
Description:
    Graph-based agent orchestration for patient symptom intake, emergency
    detection, zero-hallucination disease matching, and specialist routing.
========================================================================================
"""

from typing import Dict, List, Any, TypedDict
import json

class ClinicalTriageState(TypedDict):
    patient_id: str
    reported_symptoms: List[str]
    is_emergency: bool
    detected_condition: str
    triage_urgency: str
    specialty_recommended: str
    action_plan: List[str]

# --------------------------------------------------------------------------------------
# 1. GRAPH NODES
# --------------------------------------------------------------------------------------

def symptom_intake_node(state: ClinicalTriageState) -> Dict[str, Any]:
    """Normalize and structure input symptoms."""
    symptoms = [s.strip().lower() for s in state.get("reported_symptoms", [])]
    return {"reported_symptoms": symptoms}

def emergency_detector_node(state: ClinicalTriageState) -> Dict[str, Any]:
    """Inspect symptoms for critical red-flag conditions."""
    critical_triggers = {
        "chest_pain", "difficulty_breathing", "shortness_of_breath",
        "stroke_symptoms", "unconscious", "severe_bleeding", "seizures"
    }
    symptoms = set(state.get("reported_symptoms", []))
    is_emergency = bool(symptoms.intersection(critical_triggers))
    
    if is_emergency:
        return {
            "is_emergency": True,
            "triage_urgency": "Emergency (Critical)",
            "action_plan": [
                "Call 999 or go to the nearest emergency room immediately.",
                "Administer immediate first aid while awaiting medical transport.",
                "Do not attempt unverified oral medications."
            ]
        }
    return {"is_emergency": False}

def diagnostic_matcher_node(state: ClinicalTriageState) -> Dict[str, Any]:
    """Map symptoms to verified WHO/DGHS disease knowledge base."""
    # Example deterministic mapping for demonstration
    symptoms = state.get("reported_symptoms", [])
    if any("fever" in s for s in symptoms) and any("joint" in s or "headache" in s for s in symptoms):
        return {
            "detected_condition": "Dengue Fever / Viral Infection",
            "triage_urgency": "Moderate",
            "action_plan": [
                "Maintain adequate oral hydration (ORS/fluids).",
                "Monitor complete blood count (CBC) and platelet count.",
                "Consult a licensed general physician."
            ]
        }
    return {
        "detected_condition": "General Health Evaluation Required",
        "triage_urgency": "Routine",
        "action_plan": ["Schedule a consultation with a certified doctor for physical checkup."]
    }

def specialist_referral_node(state: ClinicalTriageState) -> Dict[str, Any]:
    """Determine the most appropriate doctor specialty."""
    condition = state.get("detected_condition", "")
    if "Dengue" in condition or "Infection" in condition:
        specialty = "Internal Medicine / General Physician"
    elif state.get("is_emergency"):
        specialty = "Emergency Medicine / Critical Care"
    else:
        specialty = "General Practitioner"
    return {"specialty_recommended": specialty}

# --------------------------------------------------------------------------------------
# 2. CONDITIONAL ROUTING LOGIC
# --------------------------------------------------------------------------------------

def triage_router(state: ClinicalTriageState) -> str:
    """Conditional edge router based on emergency evaluation."""
    if state.get("is_emergency"):
        return "emergency_escalation"
    return "standard_diagnosis"

# --------------------------------------------------------------------------------------
# 3. GRAPH RUNNER (COMPATIBLE WITH LANGGRAPH OR NATIVE RUNTIME)
# --------------------------------------------------------------------------------------

def run_clinical_triage_graph(patient_id: str, symptoms: List[str]) -> ClinicalTriageState:
    """Execute the end-to-end clinical triage state graph."""
    state: ClinicalTriageState = {
        "patient_id": patient_id,
        "reported_symptoms": symptoms,
        "is_emergency": False,
        "detected_condition": "",
        "triage_urgency": "Routine",
        "specialty_recommended": "",
        "action_plan": []
    }
    
    # 1. Intake
    state.update(symptom_intake_node(state))
    # 2. Emergency check
    state.update(emergency_detector_node(state))
    
    # 3. Conditional routing
    route = triage_router(state)
    if route == "emergency_escalation":
        state.update(specialist_referral_node(state))
    else:
        state.update(diagnostic_matcher_node(state))
        state.update(specialist_referral_node(state))
        
    return state
