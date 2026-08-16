"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, UserCircle2 } from "lucide-react";

export function AccessDeniedModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20rem] -right-[10rem] w-[50rem] h-[50rem] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20rem] -left-[10rem] w-[40rem] h-[40rem] bg-gradient-to-tr from-[#2F80ED]/10 to-transparent rounded-full blur-[80px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-[90%] max-w-[480px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden relative z-10"
      >
        <div className="p-10 flex flex-col items-center text-center">
          {/* Animated Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.2 }}
            className="w-[100px] h-[100px] bg-primary/5 rounded-[28px] flex items-center justify-center mb-6 relative border border-primary/10 shadow-inner"
          >
            <ShieldAlert size={48} className="text-primary" strokeWidth={1.5} />
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100"
            >
              <UserCircle2 size={22} className="text-[#2F80ED]" />
            </motion.div>
          </motion.div>

          <h2 className="text-[28px] font-extrabold text-slate-800 mb-3 tracking-tight">Login Required</h2>
          
          <p className="text-[15px] text-slate-500 leading-relaxed mb-10 px-2 font-medium">
            To view the doctor dashboard and access patient data, please log in to your account first. We prioritize security and privacy.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="w-full h-[56px] bg-primary text-white text-[16px] font-bold rounded-2xl hover:bg-primary/90 hover:shadow-[0_15px_30px_-5px_rgba(15,118,110,0.4)] transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-3">
              Go to Login Page
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-6 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
