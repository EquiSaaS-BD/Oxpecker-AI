import { PageLayout } from "@/components/layout/PageLayout";

export default function AboutPage() {
  return (
    <PageLayout title="About Us" breadcrumb="About Us">
      <h2>Our Mission</h2>
      <p>
        At Shustota, our mission is to revolutionize healthcare accessibility in Bangladesh and beyond. 
        We believe that everyone deserves instant access to reliable medical guidance, irrespective of their location or socioeconomic status.
      </p>
      
      <h2>What We Do</h2>
      <p>
        We combine advanced Artificial Intelligence with a comprehensive network of healthcare professionals to provide:
      </p>
      <ul>
        <li>Instant symptom analysis and preliminary guidance.</li>
        <li>Direct connections to verified, specialist doctors.</li>
        <li>Accurate, up-to-date information on medicines and treatments.</li>
      </ul>

      <h2>Our Vision</h2>
      <p>
        To build a future where healthcare is proactive, personalized, and universally accessible.
      </p>
    </PageLayout>
  );
}
