"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { HospitalSidebar } from "@/components/hospital/HospitalSidebar";
import { HospitalHeader } from "@/components/hospital/HospitalHeader";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { DoctorDashboardSkeleton } from "@/components/doctor/DoctorDashboardSkeleton"; // We can reuse this skeleton for now
import { Toaster } from "sonner";

export default function HospitalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-[280px] bg-white border-r border-slate-200/80 hidden lg:block" />
        <div className="flex-1">
          <div className="h-16 bg-white border-b border-slate-200/80" />
          <DoctorDashboardSkeleton />
        </div>
      </div>
    );
  }

  // Access control
  if (!isAuthenticated || role !== "hospital") {
    // We can reuse the AccessDeniedModal, it just redirects or shows a message
    return <AccessDeniedModal />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <HospitalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <HospitalHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
