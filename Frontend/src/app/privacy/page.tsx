import { PageLayout } from "@/components/layout/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy & Security Policy" breadcrumb="Privacy" lastUpdated="August 25, 2026">
      <h2>1. National Health Data Safeguards</h2>
      <p>
        Your electronic health records (EHR) and Health ID data are stored in a centralized, highly secure database. We employ military-grade encryption to protect your sensitive clinical history, prescriptions, and demographic data.
      </p>

      <h2>2. Emergency Emergency Profile Auditing</h2>
      <p>
        During a medical emergency, ER doctors can access your life-saving medical history (blood type, severe allergies, chronic conditions) via the Emergency Profile protocol. Every single access event is cryptographically logged in the <code>emergency_access_logs</code> and you will receive an immediate notification of who accessed your records.
      </p>

      <h2>3. Data Sharing & Interoperability</h2>
      <p>
        Your medical data is solely shared with authorized healthcare providers (hospitals, verified doctors, and diagnostic centers) within the National Healthcare Network for the direct purpose of your treatment and continuity of care.
      </p>
    </PageLayout>
  );
}
