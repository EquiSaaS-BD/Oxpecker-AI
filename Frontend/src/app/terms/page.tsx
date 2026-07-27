import { PageLayout } from "@/components/layout/PageLayout";

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Use" breadcrumb="Terms" lastUpdated="July 15, 2026">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using Shustota, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our services.
      </p>

      <h2>2. Use of Services</h2>
      <p>
        Our AI health assistant provides general information and symptom analysis. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
      </p>

      <h2>3. User Responsibilities</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information when using our platform.
      </p>
    </PageLayout>
  );
}
