"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import DoctorTopNav from "@/components/dashboard/doctor/DoctorTopNav";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
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

        {/* Sidebar (Desktop lg:block) */}
        <DoctorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Mega Menu Navbar (Desktop lg:flex) */}
          <DoctorTopNav onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pb-[90px] lg:pb-6 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          
          {/* Rx Floating Bottom Navigation Pill System (Mobile & Tablet) */}
          <MobileBottomNav />
        </div>
      </div>
    </DoctorProvider>
  );
}
