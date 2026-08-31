import { PageLayout } from "@/components/layout/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Service" breadcrumb="Terms" lastUpdated="August 25, 2026">
      <h2>1. Acceptance of Centralized Network Terms</h2>
      <p>
        By accessing and using the Oxpecker National Healthcare Network (including the Universal Health ID and Emergency Emergency Profile systems), you agree to be bound by these Terms of Service. This infrastructure connects hospitals, doctors, and patients nationwide.
      </p>

      <h2>2. Nature of Medical Services</h2>
      <p>
        While our platform provides real-time integration with hospital telemetry, BMDC-verified doctors, and AI-driven clinical triage, the AI is not a substitute for direct professional medical diagnosis. Emergency emergency profile data access is heavily audited and restricted to authorized medical personnel only.
      </p>

      <h2>3. User and Institutional Responsibilities</h2>
      <p>
        Hospitals are responsible for maintaining accurate live bed telemetry. Patients must ensure their Health ID demographic and baseline clinical data (e.g., blood group, allergies) are accurate. Any unauthorized access to the emergency grid will be logged and prosecuted under national cybersecurity laws.
      </p>
    </PageLayout>
  );
}
