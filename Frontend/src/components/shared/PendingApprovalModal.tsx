"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function PendingApprovalModal() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const handleDemoApprove = () => {
    if (user) {
      updateUser({
        ...user,
        status: "active",
      });
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-[24px] flex items-center justify-center mb-6 relative border border-amber-200">
            <Clock size={40} className="text-amber-500" strokeWidth={1.75} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
              <ShieldAlert size={16} className="text-amber-500" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Pending Approval</h2>
          
          <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
            Your account is currently under review by the Super Admin. In production, hospitals and doctors are verified before granting access to patient records.
          </p>

          <button
            onClick={handleDemoApprove}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm mb-3"
          >
            <CheckCircle2 size={16} />
            <span>Instant Verify & Enter (Demo Mode)</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Return to Homepage</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
