"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PrescriptionEditorLayout } from "@/components/prescription/PrescriptionEditorLayout";
import { PatientContextSidebar } from "@/components/prescription/PatientContextSidebar";
import { SmartEditorArea } from "@/components/prescription/SmartEditorArea";
import { PrescriptionTopbar } from "@/components/prescription/PrescriptionTopbar";
import { AIAssistancePanel } from "@/components/prescription/AIAssistancePanel";
import { PrescriptionProvider } from "@/context/PrescriptionContext";
import { PrescriptionFinalizeModal } from "@/components/prescription/PrescriptionFinalizeModal";
import { PrescriptionPreviewModal } from "@/components/prescription/PrescriptionPreviewModal";
import { TestReportViewer } from "@/components/prescription/TestReportViewer";

export default function NewPrescriptionPage() {
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prescription" | "report">("prescription");

  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams?.get('preview') === 'true') {
      setIsPreviewModalOpen(true);
    }
  }, [searchParams]);

  return (
    <PrescriptionProvider>
      <PrescriptionEditorLayout
        topbar={
          <PrescriptionTopbar 
            onFinalize={() => setIsFinalizeModalOpen(true)} 
            onPreview={() => setIsPreviewModalOpen(true)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        }
        editor={
          <div key={activeTab} className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {activeTab === "prescription" ? (
              <SmartEditorArea onFinalize={() => setIsFinalizeModalOpen(true)} />
            ) : (
              <TestReportViewer />
            )}
          </div>
        }
        aiPanel={<AIAssistancePanel />}
      />

      <PrescriptionFinalizeModal 
        isOpen={isFinalizeModalOpen} 
        onClose={() => setIsFinalizeModalOpen(false)} 
      />

      <PrescriptionPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </PrescriptionProvider>
  );
}
