"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, Building2, Stethoscope, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AccessDeniedModalProps {
  requiredRole?: "hospital" | "doctor" | "admin" | "assistant" | "patient";
  portalName?: string;
}

export function AccessDeniedModal({
  requiredRole = "hospital",
  portalName,
}: AccessDeniedModalProps) {
  const router = useRouter();
  const { user, role, isAuthenticated, login, logout } = useAuth();

  const isHospital = requiredRole === "hospital";
  const displayName = portalName || (isHospital ? "Hospital Dashboard" : "Doctor Dashboard");

  const handleInstantDemoLogin = () => {
    if (isHospital) {
      login({
        id: "demo-hospital-001",
        name: "Dhaka Central Medical Hospital",
        email: "hospital@oxpecker.ai",
        role: "hospital",
        phone: "+880 1711-223344",
        status: "active",
      } as any);
      router.push("/hospital/dashboard");
    } else {
      login({
        id: "demo-doctor-001",
        name: "Dr. Sarah Rahman",
        email: "doctor@oxpecker.ai",
        role: "doctor",
        phone: "+880 1811-223344",
        status: "active",
      } as any);
      router.push("/doctor/dashboard");
    }
  };

  const handleSignOutAndLogin = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative z-10"
      >
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Animated Icon */}
          <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 relative border ${
            isHospital ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-sky-50 border-sky-200 text-sky-600"
          }`}>
            {isHospital ? <Building2 size={38} strokeWidth={1.8} /> : <Stethoscope size={38} strokeWidth={1.8} />}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200">
              <ShieldAlert size={16} className="text-amber-500" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
            {displayName} Access
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
            {isAuthenticated ? (
              <>
                You are currently signed in as a <span className="font-bold text-slate-700 capitalize">{role}</span>
                {user?.name ? ` (${user.name})` : ""}. Accessing this portal requires <span className="font-bold text-slate-700 capitalize">{requiredRole}</span> permissions.
              </>
            ) : (
              <>
                To view the {displayName} and manage operations, please sign in with a {requiredRole} account.
              </>
            )}
          </p>

          {/* Quick 1-Click Demo Access Button */}
          <button
            onClick={handleInstantDemoLogin}
            className={`w-full h-12 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 text-sm mb-3 ${
              isHospital ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            <Sparkles size={16} />
            <span>Enter as Demo {isHospital ? "Hospital" : "Doctor"}</span>
          </button>

          {/* Regular Login or Switch Account */}
          <button
            onClick={handleSignOutAndLogin}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm mb-2"
          >
            {isAuthenticated ? (
              <>
                <LogOut size={16} /> Switch Account / Sign Out
              </>
            ) : (
              <>
                <span>Go to Login Page</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-3 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
