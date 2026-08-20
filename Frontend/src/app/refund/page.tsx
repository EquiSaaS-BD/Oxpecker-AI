import { PageLayout } from "@/components/layout/PageLayout";

export default function RefundPage() {
  return (
    <PageLayout title="Refund Policy" breadcrumb="Refund" lastUpdated="July 15, 2026">
      <h2>General Policy</h2>
      <p>
        Our core platform features, including the AI health assistant and doctor directory, are completely free to use. Refund policies apply only to paid consultations or premium services facilitated through our platform.
      </p>

      <h2>Consultation Refunds</h2>
      <p>
        If a doctor cancels a paid consultation, or if you cancel at least 24 hours before the scheduled time, you are eligible for a full refund. Refunds will be processed to the original method of payment within 5-7 business days.
      </p>

      <h2>Non-Refundable Services</h2>
      <p>
        Consultation fees for appointments that you fail to attend without prior notice (no-shows) are strictly non-refundable.
      </p>
    </PageLayout>
  );
}
