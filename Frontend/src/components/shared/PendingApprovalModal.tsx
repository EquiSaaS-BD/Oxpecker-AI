"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Clock } from "lucide-react";

export function PendingApprovalModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20rem] -right-[10rem] w-[50rem] h-[50rem] bg-orange-500/5 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-[90%] max-w-[480px] bg-white backdrop-blur-xl border border-slate-200 shadow-xl rounded-[32px] overflow-hidden relative z-10"
      >
        <div className="p-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.2 }}
            className="w-[100px] h-[100px] bg-orange-50 rounded-[28px] flex items-center justify-center mb-6 relative border border-orange-100"
          >
            <Clock size={48} className="text-orange-500" strokeWidth={1.5} />
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200"
            >
              <ShieldAlert size={22} className="text-orange-500" />
            </motion.div>
          </motion.div>

          <h2 className="text-[28px] font-extrabold text-slate-800 mb-3 tracking-tight">Pending Approval</h2>
          
          <p className="text-[15px] text-slate-500 leading-relaxed mb-10 px-2 font-medium">
            Your account is currently under review by the Super Admin. You will be notified once your identity and credentials have been verified.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full h-[56px] bg-slate-900 text-white text-[16px] font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            Return to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
