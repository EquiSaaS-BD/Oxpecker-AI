import { ReportsDashboard } from "@/components/reports/ReportsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Diagnostics - Shustota AI",
  description: "View and review patient reports and diagnostics.",
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}
