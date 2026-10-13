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
import { initiateGoogleSignIn } from "@/lib/googleAuth";

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed. Please check your credentials.");
        return;
      }

      toast.success("Login successful!");
      login(data.user);
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const gUser = await initiateGoogleSignIn();
      const lowerEmail = gUser.email.toLowerCase().trim();

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", lowerEmail)
        .maybeSingle();

      if (!dbProfile) {
        toast.info("No existing account found with this Google email. Redirecting you to Create Account...");
        sessionStorage.setItem(
          "oxpecker_google_user",
          JSON.stringify({
            name: gUser.name,
            email: gUser.email,
            picture: gUser.picture,
          })
        );
        setTimeout(() => {
          router.push("/register");
        }, 1200);
        return;
      }

      toast.success(`Welcome back, ${dbProfile.name}!`);
      login(dbProfile as any);
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error(err.message || "Google sign in cancelled.");
    } finally {
      setIsGoogleLoading(false);
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

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-[52px] bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-300 hover:border-slate-400 transition-all shadow-sm flex items-center justify-center gap-3 text-sm active:scale-[0.98] cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
                <span className="text-slate-600">Connecting Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

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
