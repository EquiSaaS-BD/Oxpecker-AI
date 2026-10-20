"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import DoctorTopNav from "@/components/dashboard/doctor/DoctorTopNav";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { AccessDeniedModal } from "@/components/doctor/AccessDeniedModal";
import { PendingApprovalModal } from "@/components/shared/PendingApprovalModal";
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
      <div className="flex h-screen bg-white">
        <div className="w-[240px] bg-white hidden lg:block" />
        <div className="flex-1 flex flex-col h-full bg-white">
          <div className="h-16 bg-white" />
          <div className="flex-1 bg-slate-50/80 rounded-none lg:rounded-tl-[32px] border-t border-slate-200/80 lg:border-l p-6">
            <DoctorDashboardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Access control
  if (!isAuthenticated || role !== "doctor") {
    return <AccessDeniedModal />;
  }
  
  if (user && user.status === "pending") {
    return <PendingApprovalModal />;
  }

  const isFullScreenPage = pathname.includes('/prescription/new') || pathname.includes('/messages');

  return (
    <DoctorProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        <Toaster position="top-right" richColors closeButton />

        {/* Sidebar (Desktop lg:block) */}
        <DoctorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
          
          {/* Top Mega Menu Navbar (Desktop lg:flex) */}
          <DoctorTopNav onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content with Smooth Transition */}
          <main className={`flex-1 overflow-y-auto rounded-none lg:rounded-tl-[32px] border-t border-slate-200/80 lg:border-l bg-slate-50/80 relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] ${isFullScreenPage ? 'p-0 pb-0 overflow-hidden' : 'pb-20 md:pb-6 p-4 sm:p-6 lg:p-8'}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* Rx Floating Bottom Navigation Pill System (Mobile & Tablet) */}
          <MobileBottomNav />
        </div>
      </div>
    </DoctorProvider>
  );
}
