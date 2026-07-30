"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { AIIntelligenceSuite } from "@/components/landing/AIIntelligenceSuite";
import { FeaturesOverview } from "@/components/landing/FeaturesOverview";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { SystemArchitectureDiagram } from "@/components/landing/SystemArchitectureDiagram";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { MedicineMarqueeSection } from "@/components/landing/MedicineMarqueeSection";

export default function LandingPage() {
  return (
    <>
      
      <div className="min-h-screen bg-white flex flex-col overflow-x-hidden w-full selection:bg-primary/20 selection:text-primary">
        <Navbar />

        <main className="flex-1">
          <HeroSection />
          <TrustedBySection />
          
          {/* AI Features */}
          <FeaturesOverview />
          <AIIntelligenceSuite />
          <DashboardPreview />
          <MedicineMarqueeSection />
          
          <SystemArchitectureDiagram />
          <TestimonialsSection />
          <FinalCTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
