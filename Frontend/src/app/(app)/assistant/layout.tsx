"use client";

import React from "react";
import AssistantSidebar from "@/components/dashboard/assistant/AssistantSidebar";
import AssistantTopNav from "@/components/dashboard/assistant/AssistantTopNav";
import AssistantBottomNav from "@/components/dashboard/assistant/AssistantBottomNav";
import { useAuth } from "@/context/AuthContext";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { PendingApprovalModal } from "@/components/shared/PendingApprovalModal";

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full bg-slate-50"></div>;
  }
  
  if (!isAuthenticated || role !== "assistant") {
    return <AccessDeniedModal />;
  }
  
  if (user && user.status === "pending") {
    return <PendingApprovalModal />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7FAFC] font-sans">
      <AssistantSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AssistantTopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 lg:p-10 relative pb-[80px] lg:pb-10">
          <div className="max-w-[1600px] mx-auto w-full h-full">
            {children}
          </div>
        </main>
        <AssistantBottomNav />
      </div>
    </div>
  );
}
