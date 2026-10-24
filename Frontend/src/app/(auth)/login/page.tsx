"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  LogIn 
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { initiateGoogleSignIn } from "@/lib/googleAuth";
import { getAuthorizedRedirectUrl } from "@/lib/rbac";

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

function LoginForm() {
  const { login, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Sanitize any stored redirect against the user's actual role
      const storedUrl = sessionStorage.getItem("redirect_after_login");
      if (storedUrl) sessionStorage.removeItem("redirect_after_login");
      
      const safeTarget = getAuthorizedRedirectUrl(storedUrl, role);
      router.replace(safeTarget);
    }
  }, [isLoading, isAuthenticated, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const lowerEmail = email.toLowerCase().trim();

      // 1. Authoritative lookup from Supabase profiles table
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

      // 2. Check hospitals table if not found in profiles
      if (!dbProfile) {
        try {
          const { data: hosp } = await supabase
            .from("hospitals")
            .select("*")
            .ilike("email", lowerEmail)
            .maybeSingle();
          if (hosp) {
            dbProfile = {
              id: hosp.profile_id || hosp.id,
              name: hosp.name,
              email: hosp.email,
              role: "hospital",
              phone: hosp.phone,
              address: hosp.address,
              status: "active",
            };
          }
        } catch (hospErr) {
          console.warn("Hospital table check error:", hospErr);
        }
      }

      // 3. Check doctors table if not found in profiles
      if (!dbProfile) {
        try {
          const { data: doc } = await supabase
            .from("doctors")
            .select("*")
            .ilike("email", lowerEmail)
            .maybeSingle();
          if (doc) {
            dbProfile = {
              id: doc.profile_id || doc.id,
              name: doc.name,
              email: doc.email,
              role: "doctor",
              specialty: doc.specialty,
              status: "active",
            };
          }
        } catch (docErr) {
          console.warn("Doctor table check error:", docErr);
        }
      }

      let userId = dbProfile?.id;
      const userName = dbProfile?.name || email.split("@")[0] || "User";
      let userRole: UserRole = (dbProfile?.role as UserRole) || "patient";

      // 4. Auto-provision profile if completely new/unregistered (e.g. testing)
      if (!dbProfile) {
        if (lowerEmail.includes("hospital")) userRole = "hospital";
        else if (lowerEmail.includes("doctor") || lowerEmail.includes("dr.")) userRole = "doctor";
        else if (lowerEmail.includes("assistant")) userRole = "assistant";
        else if (lowerEmail.includes("admin")) userRole = "admin";
        else userRole = "patient";

        try {
          const { data: inserted } = await supabase
            .from("profiles")
            .insert({
              name: userName,
              email: lowerEmail,
              role: userRole,
              status: "active",
            })
            .select()
            .maybeSingle();
          if (inserted?.id) {
            userId = inserted.id;
            userRole = (inserted.role as UserRole) || userRole;
          }
        } catch (insertErr) {
          console.error("Auto-provision profile error:", insertErr);
        }
      }

      toast.success(`Welcome back, ${userName}!`);
      
      login({
        id: userId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now()),
        name: userName,
        email: dbProfile?.email || lowerEmail,
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
      toast.error("Login failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const gUser = await initiateGoogleSignIn();
      const lowerEmail = gUser.email.toLowerCase().trim();

      // 1. Authoritative lookup from Supabase profiles table
      let { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", lowerEmail)
        .maybeSingle();

      // 2. Check hospitals table if profile is missing
      if (!dbProfile) {
        const { data: hosp } = await supabase
          .from("hospitals")
          .select("*")
          .ilike("email", lowerEmail)
          .maybeSingle();
        if (hosp) {
          dbProfile = {
            id: hosp.profile_id || hosp.id,
            name: hosp.name,
            email: lowerEmail,
            role: "hospital",
            phone: hosp.phone,
            address: hosp.address,
            status: "active",
          };
        }
      }

      // 3. Check doctors table if profile is missing
      if (!dbProfile) {
        const { data: doc } = await supabase
          .from("doctors")
          .select("*")
          .ilike("email", lowerEmail)
          .maybeSingle();
        if (doc) {
          dbProfile = {
            id: doc.profile_id || doc.id,
            name: doc.name,
            email: lowerEmail,
            role: "doctor",
            specialty: doc.specialty,
            status: "active",
          };
        }
      }

      // 4. If account exists in database, login directly with their authoritative registered role!
      if (dbProfile) {
        const userRole: UserRole = (dbProfile.role as UserRole) || "patient";
        toast.success(`Welcome back, ${dbProfile.name || gUser.name}!`);
        login({
          ...dbProfile,
          id: dbProfile.id,
          name: dbProfile.name || gUser.name,
          email: lowerEmail,
          role: userRole,
          image: dbProfile.image || gUser.picture || null,
          status: dbProfile.status || "active",
        } as any);
        return;
      }

      // 5. If NO account exists in the database:
      // Store Google credentials and redirect to registration so the user can select their role
      sessionStorage.setItem("oxpecker_google_user", JSON.stringify({
        name: gUser.name,
        email: lowerEmail,
        picture: gUser.picture,
      }));

      toast.info("No registered account found with this Google email. Please select your role to complete sign-up.");
      router.push("/register");

    } catch (err: any) {
      const isCancellation = 
        err?.code === "popup_closed" || 
        err?.message?.toLowerCase().includes("closed") || 
        err?.message?.toLowerCase().includes("cancel");

      if (isCancellation) {
        toast.info("Google sign-in was cancelled.");
      } else {
        console.error("Google login error:", err);
        toast.error(err.message || "Google sign in failed.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Clean Ambient Background (Unified across all auth pages) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-slate-50 via-white to-sky-50/25">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-50/30 rounded-full blur-3xl" />
      </div>
      <Toaster position="top-center" richColors />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white p-7 sm:p-9 relative z-20 ring-1 ring-black/5">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex mb-5">
              <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker AI" width={160} height={45} className="h-9 sm:h-10 w-auto object-contain" priority />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Sign in with your email to access your account</p>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-[50px] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-3 text-[14px] active:scale-[0.99] cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
                <span className="text-slate-600 font-medium">Connecting Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon size={18} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or email login</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 tracking-tight">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-[50px] pl-10 pr-4 rounded-2xl bg-black/[0.03] border border-transparent text-[14px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 tracking-tight">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[50px] pl-10 pr-12 rounded-2xl bg-black/[0.03] border border-transparent text-[14px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end text-xs pt-0.5">
              <Link href="/reset-password" className="text-slate-500 hover:text-slate-900 font-bold">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[50px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-1"
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

          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
