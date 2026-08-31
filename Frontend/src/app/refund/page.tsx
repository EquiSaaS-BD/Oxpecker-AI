import { PageLayout } from "@/components/layout/PageLayout";

export default function RefundPage() {
  return (
    <PageLayout title="Refund Policy" breadcrumb="Refund" lastUpdated="August 25, 2026">
      <h2>1. Centralized Appointment & Consultation Refunds</h2>
      <p>
        If a doctor or hospital cancels an appointment booked through the National Healthcare Network, a full refund will be automatically processed to your original payment method within 3-5 business days.
      </p>

      <h2>2. Patient Cancellations</h2>
      <p>
        If you cancel your appointment at least 24 hours prior to the scheduled time, a full refund is issued. Cancellations made within 24 hours of the appointment time are non-refundable to prevent grid scheduling blockages.
      </p>

      <h2>3. Health ID Premium Services</h2>
      <p>
        Any subscriptions for premium Universal Health ID features (e.g., automated family telemetry alerts) can be canceled at any time, but prior payments are non-refundable.
      </p>
    </PageLayout>
  );
}
