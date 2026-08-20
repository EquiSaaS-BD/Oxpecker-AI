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

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    try {
      // 1. Check Supabase profiles table directly for email & password match
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (profile) {
        if (profile.password && profile.password !== cleanPassword) {
          toast.error("Incorrect password. Please verify your credentials.");
          setIsSubmitting(false);
          return;
        }

        if (profile.status === "banned") {
          toast.error("This account has been suspended by system administrator.");
          setIsSubmitting(false);
          return;
        }

        // Try Supabase auth sign-in silently in background if configured
        try {
          await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
        } catch {}

        login({
          id: profile.id,
          name: profile.name || "User",
          email: profile.email,
          role: profile.role || "patient",
          phone: profile.phone || undefined,
          date_of_birth: profile.date_of_birth || undefined,
          gender: profile.gender || undefined,
          blood_group: profile.blood_group || undefined,
          address: profile.address || undefined,
          image: profile.image || undefined,
          doctorId: profile.doctor_id || undefined,
          assistantId: profile.assistant_id || undefined
        });

        toast.success(`Welcome back, ${profile.name}!`);
        setIsSubmitting(false);
        return;
      }

      // 2. Try Supabase Auth as secondary check
      const { data: sbAuth, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (sbAuth?.user) {
        login({
          id: sbAuth.user.id,
          name: sbAuth.user.user_metadata?.name || cleanEmail.split("@")[0],
          email: sbAuth.user.email || cleanEmail,
          role: sbAuth.user.user_metadata?.role || "patient",
        });
        toast.success("Login successful!");
        setIsSubmitting(false);
        return;
      }

      toast.error("Account not found or password incorrect.");
    } catch (err: any) {
      console.error("Login verification error:", err);
      toast.error(err.message || "Authentication failed. Please check internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      <Toaster position="top-center" richColors />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex mb-6">
              <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker AI" width={160} height={45} className="h-10 w-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your healthcare account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-2"
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
