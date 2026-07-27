import { PageLayout } from "@/components/layout/PageLayout";

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy" breadcrumb="Privacy" lastUpdated="July 15, 2026">
      <h2>1. Information We Collect</h2>
      <p>
        We collect information that you provide directly to us, such as when you create an account, update your profile, use the AI health assistant, or communicate with us. This may include personal identifiers and health-related data necessary for the AI to function.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and to train our AI models for better accuracy (all personal identifiers are stripped during this process).
      </p>

      <h2>3. Data Security</h2>
      <p>
        We use industry-standard encryption to protect your personal and medical data. However, no security system is impenetrable, and we cannot guarantee the complete security of our systems.
      </p>
    </PageLayout>
  );
}
