import WhyUsBento from "@/components/landing/WhyUsBento";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import dynamic from "next/dynamic";
import { HomeRedirector } from "@/components/auth/HomeRedirector";

const Footer = dynamic(() => import("@/components/layout/Footer").then(m => m.Footer), { ssr: true });
const TrustedBySection = dynamic(() => import("@/components/landing/TrustedBySection").then(m => m.TrustedBySection), { ssr: true });
const AIIntelligenceSuite = dynamic(() => import("@/components/landing/AIIntelligenceSuite").then(m => m.AIIntelligenceSuite), { ssr: true });
const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection").then(m => m.HowItWorksSection), { ssr: true });
const MedicalDirectory = dynamic(() => import("@/components/landing/MedicalDirectory").then(m => m.MedicalDirectory), { ssr: true });
const MedicineMarqueeSection = dynamic(() => import("@/components/landing/MedicineMarqueeSection").then(m => m.MedicineMarqueeSection), { ssr: true });
const SecurityAndFAQ = dynamic(() => import("@/components/landing/SecurityAndFAQ").then(m => m.SecurityAndFAQ), { ssr: true });
const FinalCTASection = dynamic(() => import("@/components/landing/FinalCTASection").then(m => m.FinalCTASection), { ssr: true });

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden w-full selection:bg-white selection:text-slate-900">
      <HomeRedirector />
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {/* 1. Hero & Instant Search Bar */}
        <HeroSection />

        {/* 2. Live Platform Metrics & Real Hospital Network */}
        <TrustedBySection />

        {/* 3. Core Value Bento Grid: Why Oxpecker AI Leads Digital Health */}
        <WhyUsBento />

        {/* 4. AI Clinical Intelligence Suite (Symptom Checker, Prescription Scanner, Lab Reader) */}
        <AIIntelligenceSuite />

        {/* 6. Instant Medical Directory Search */}
        <MedicalDirectory />

        {/* 7. DGDA Index Ticker */}
        <MedicineMarqueeSection />

        {/* 8. Simple 4-Step Patient Process */}
        <HowItWorksSection />

        {/* 9. Security Commitments, FAQ & Call to Action */}
        <SecurityAndFAQ />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
