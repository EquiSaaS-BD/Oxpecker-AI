"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Login3DBackground } from "@/components/shared/Login3DBackground";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = sessionStorage.getItem("redirect_after_login");
      if (redirectUrl) {
        sessionStorage.removeItem("redirect_after_login");
        router.replace(redirectUrl);
        return;
      }
      if (role === "patient") router.replace("/chat");
      else if (role === "doctor") router.replace("/doctor/dashboard");
      else if (role === "hospital") router.replace("/hospital/dashboard");
      else if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "assistant") router.replace("/assistant");
      else router.replace("/");
    }
  }, [isLoading, isAuthenticated, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const lowerEmail = email.toLowerCase().trim();
      let determinedRole: "patient" | "doctor" | "hospital" | "admin" | "assistant" = "patient";
      if (lowerEmail.includes("doctor") || lowerEmail.includes("dr")) {
        determinedRole = "doctor";
      } else if (lowerEmail.includes("hospital") || lowerEmail.includes("clinic")) {
        determinedRole = "hospital";
      } else if (lowerEmail.includes("admin")) {
        determinedRole = "admin";
      } else if (lowerEmail.includes("assistant")) {
        determinedRole = "assistant";
      }

      // Check if profile exists in Supabase
      let dbProfile: any = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .ilike("email", lowerEmail)
          .maybeSingle();
        dbProfile = data;
      } catch (err) {
        console.error("Supabase profile lookup error:", err);
      }

      let userId = dbProfile?.id;
      let userName = dbProfile?.name || email.split("@")[0] || "User";
      let userRole = (dbProfile?.role as any) || determinedRole;

      if (!dbProfile) {
        try {
          const { data: inserted } = await supabase
            .from("profiles")
            .insert({
              name: userName,
              email: lowerEmail,
              role: determinedRole,
              status: "active"
            })
            .select()
            .maybeSingle();
          if (inserted?.id) {
            userId = inserted.id;
          }
        } catch (insertErr) {
          console.error("Auto-provision profile error:", insertErr);
        }
      }

      toast.success("Login successful!");
      
      login({
        id: userId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "00000000-0000-0000-0000-000000000001"),
        name: userName,
        email: dbProfile?.email || lowerEmail || "user@oxpecker.ai",
        role: userRole,
        phone: dbProfile?.phone || undefined,
        date_of_birth: dbProfile?.date_of_birth || undefined,
        gender: dbProfile?.gender || undefined,
        blood_group: dbProfile?.blood_group || undefined,
        address: dbProfile?.address || undefined,
        image: dbProfile?.image || undefined,
        status: dbProfile?.status || "active",
      } as any);

    } catch (err: any) {
      console.error("Login error:", err);
      toast.error("Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <Login3DBackground />
      <Toaster position="top-center" richColors />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-8 sm:p-10 relative z-20 ring-1 ring-black/5">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex mb-6">
              <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker AI" width={160} height={45} className="h-10 w-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your healthcare account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 tracking-tight">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-[52px] pl-10 pr-4 rounded-2xl bg-black/[0.03] border border-transparent text-[15px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 tracking-tight">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[52px] pl-10 pr-12 rounded-2xl bg-black/[0.03] border border-transparent text-[15px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link href="/reset-password" className="text-slate-500 hover:text-slate-900 font-bold">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-slate-900 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
