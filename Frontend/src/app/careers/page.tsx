import { PageLayout } from "@/components/layout/PageLayout";

export default function CareersPage() {
  return (
    <PageLayout title="Careers" breadcrumb="Careers">
      <h2>Join the Healthcare Revolution</h2>
      <p>
        We are always looking for passionate individuals who want to make a tangible difference in people's lives through technology.
      </p>

      <h2>Current Openings</h2>
      <p>
        There are currently no open positions. Please check back later, or send your resume to <strong>careers@shustota.com</strong> to be considered for future opportunities.
      </p>

      <h2>Why Work With Us?</h2>
      <ul>
        <li>Impactful work that directly saves lives and improves health outcomes.</li>
        <li>Flexible, remote-friendly work environment.</li>
        <li>Competitive compensation and continuous learning opportunities.</li>
      </ul>
    </PageLayout>
  );
}
