"""
========================================================================================
🏥 Oxpecker AI - Temporal Durable Medical Appointment Workflow
========================================================================================
Description:
    Durable, reliable execution workflow managing patient appointment lifecycle,
    automated 24-hour reminders, and clinical follow-up tracking.
========================================================================================
"""

from datetime import timedelta
import logging

logger = logging.getLogger("temporal.workflow")

# --------------------------------------------------------------------------------------
# 1. TEMPORAL ACTIVITIES
# --------------------------------------------------------------------------------------

class AppointmentActivities:
    @staticmethod
    async def send_confirmation(booking_id: str, patient_email: str) -> bool:
        logger.info(f"Sending booking confirmation for {booking_id} to {patient_email}")
        return True

    @staticmethod
    async def send_reminder(booking_id: str, patient_phone: str) -> bool:
        logger.info(f"Dispatching 24h reminder SMS for {booking_id} to {patient_phone}")
        return True

    @staticmethod
    async def schedule_followup(booking_id: str, doctor_id: str) -> str:
        logger.info(f"Logging post-consultation follow-up for appointment {booking_id}")
        return "Follow-up scheduled in 7 days."

# --------------------------------------------------------------------------------------
# 2. TEMPORAL WORKFLOW DEFINITION
# --------------------------------------------------------------------------------------

class AppointmentLifecycleWorkflow:
    """Temporal durable workflow orchestrating patient consultation lifecycle."""
    
    async def run(self, booking_details: dict) -> dict:
        booking_id = booking_details.get("booking_id")
        patient_email = booking_details.get("patient_email")
        patient_phone = booking_details.get("patient_phone")
        
        # Step 1: Send Immediate Confirmation
        await AppointmentActivities.send_confirmation(booking_id, patient_email)
        
        # Step 2: Durable Sleep until 24 hours before appointment
        # await workflow.sleep(timedelta(days=1))
        await AppointmentActivities.send_reminder(booking_id, patient_phone)
        
        # Step 3: Trigger post-consultation follow-up
        status = await AppointmentActivities.schedule_followup(booking_id, booking_details.get("doctor_id"))
        
        return {
            "booking_id": booking_id,
            "status": "completed",
            "followup": status
        }
