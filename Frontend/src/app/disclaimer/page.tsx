import { PageLayout } from "@/components/layout/PageLayout";

export default function DisclaimerPage() {
  return (
    <PageLayout title="Medical Disclaimer" breadcrumb="Disclaimer" lastUpdated="July 15, 2026">
      <h2>Not Medical Advice</h2>
      <p>
        The content provided by Shustota, including the AI symptom analysis, is for informational purposes only and does not constitute professional medical advice, diagnosis, treatment, or recommendations of any kind.
      </p>

      <h2>Always Consult a Professional</h2>
      <p>
        You should always seek the advice of your qualified healthcare professionals with any questions or concerns you may have regarding your individual needs and any medical conditions. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.
      </p>

      <h2>Emergencies</h2>
      <p>
        If you think you may have a medical emergency, call your doctor or emergency services immediately. Shustota does not recommend or endorse any specific tests, physicians, products, procedures, or opinions.
      </p>
    </PageLayout>
  );
}
