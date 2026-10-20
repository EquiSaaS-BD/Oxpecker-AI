# Oxpecker AI - Workflow Automation Architecture

Oxpecker AI integrates four specialized automation engines to handle mission-critical clinical workflows across the patient care lifecycle.

---

## 1. n8n (Self-Hosted Workflow Automation)
* **File:** [`workflows/n8n/clinical_triage_workflow.json`](file:///E:/Oxpecker-AI-main/Oxpecker-AI-main/workflows/n8n/clinical_triage_workflow.json)
* **Use Case:** Real-time emergency escalation & SMS/Email alerting.
* **Architecture:**
  - Webhook endpoint receives patient triage state from the Oxpecker AI diagnostic engine.
  - An evaluation node checks if condition severity is `critical` (e.g., suspected stroke, cardiac arrest).
  - Automatically dispatches immediate emergency SMS to local ambulance/hospital and sends follow-up clinical reports to registered physicians.
* **How to run:** Import `clinical_triage_workflow.json` directly into your self-hosted n8n instance.

---

## 2. Apache Airflow (Clinical Data ETL DAG)
* **File:** [`workflows/airflow/dags/oxpecker_clinical_sync_dag.py`](file:///E:/Oxpecker-AI-main/Oxpecker-AI-main/workflows/airflow/dags/oxpecker_clinical_sync_dag.py)
* **Use Case:** Scheduled ingestion of DGHS (Bangladesh) and WHO treatment protocols.
* **Tasks:**
  1. `fetch_dghs_updates`: Connects to regional pharmaceutical and disease registries.
  2. `validate_clinical_schema`: Validates incoming data against ICD-11 standard schema.
  3. `sync_medicine_database`: Updates PostgreSQL/Supabase and invalidates Redis cache.
* **Schedule:** Runs weekly (`@weekly`).

---

## 3. LangGraph (Stateful Clinical Diagnostic Graph)
* **File:** [`Backend/app/ai/langgraph_triage.py`](file:///E:/Oxpecker-AI-main/Oxpecker-AI-main/Backend/app/ai/langgraph_triage.py)
* **Use Case:** State-machine agent orchestration for multi-step patient diagnosis.
* **Graph Flow:**
  - **Node 1 (Intake):** Normalizes user symptom inputs.
  - **Node 2 (Emergency Detector):** Scans for life-threatening red flags.
  - **Router (Conditional Edge):** If emergency, routes to critical care protocol; otherwise passes to WHO/DGHS disease matching.
  - **Node 3 (Specialist Referral):** Directs the patient to the precise certified medical specialty.

---

## 4. Temporal (Durable Medical Appointment Workflow)
* **File:** [`workflows/temporal/appointment_workflow.py`](file:///E:/Oxpecker-AI-main/Oxpecker-AI-main/workflows/temporal/appointment_workflow.py)
* **Use Case:** Fault-tolerant, durable execution for long-running patient appointment lifecycles.
* **Steps:**
  1. Dispatches immediate appointment confirmation.
  2. Executes durable sleep until 24 hours prior to consultation to send automated SMS reminders.
  3. Schedules 7-day post-consultation health recovery follow-up.
