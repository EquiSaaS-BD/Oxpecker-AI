import { PageLayout } from "@/components/layout/PageLayout";

export default function DisclaimerPage() {
  return (
    <PageLayout title="Medical & Technical Disclaimer" breadcrumb="Disclaimer" lastUpdated="August 25, 2026">
      <h2>1. Emergency Response Limitations</h2>
      <p>
        The Oxpecker Centralized Network provides live telemetry for hospital ICU beds and emergency records. However, during nationwide internet outages or severe infrastructure failure, real-time data may experience latency. Always contact local emergency services (999) directly for immediate ambulance dispatch.
      </p>

      <h2>2. AI Triage & Clinical Intelligence</h2>
      <p>
        Our AI symptom checker and optical prescription decoding algorithms are trained on vast clinical datasets to assist in preliminary triage. They do not replace the judgment of a BMDC-registered medical professional.
      </p>
    </PageLayout>
  );
}
