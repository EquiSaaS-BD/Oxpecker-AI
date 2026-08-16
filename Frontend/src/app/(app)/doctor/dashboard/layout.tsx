"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { DoctorHeader } from "@/components/doctor/DoctorHeader";
import { DoctorMobileBottomNav } from "@/components/doctor/DoctorMobileBottomNav";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { DoctorDashboardSkeleton } from "@/components/doctor/DoctorDashboardSkeleton";
import { DoctorProvider } from "@/context/DoctorContext";
import { Toaster } from "sonner";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const isPrescriptionEditor = pathname === "/doctor/dashboard/prescription/new";

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
  if (!isAuthenticated || role !== "doctor") {
    return <AccessDeniedModal />;
  }

  return (
    <DoctorProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Toaster position="top-right" richColors closeButton />

        {/* Sidebar */}
        <DoctorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Page Content (Scrolls behind header) */}
          <main className="flex-1 overflow-y-auto pb-[80px] lg:pb-0 pt-16">
            {children}
          </main>
          
          {/* Header (Absolute floating on top) */}
          <div className="absolute top-0 left-0 w-full z-30">
            <DoctorHeader onMenuClick={() => setSidebarOpen(true)} />
          </div>
          
          <DoctorMobileBottomNav />
        </div>
      </div>
    </DoctorProvider>
  );
}
