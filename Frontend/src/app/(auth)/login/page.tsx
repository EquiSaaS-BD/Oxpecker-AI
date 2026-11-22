"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { useAuth, type UserRole } from "@/context/AuthContext";
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
  const { login, clearStaleSession, isAuthenticated, isLoading, role, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role / Email query params if linked from specific context (e.g. ?role=doctor or duplicate ?email=)
  const queryRole = searchParams?.get("role") as UserRole | null;
  const queryEmail = searchParams?.get("email") || "";

  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [queryEmail, email]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user || hasRedirectedRef.current || isSubmitting) return;
    let active = true;

    async function verifyAndRedirect() {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        });
        if (!active) return;
        if (!res.ok) {
          // Server cookie missing/invalid — clear stale client state in place instead of looping
          clearStaleSession();
          return;
        }
        hasRedirectedRef.current = true;
        const storedUrl = sessionStorage.getItem("redirect_after_login");
        if (storedUrl) sessionStorage.removeItem("redirect_after_login");
        const queryRedirect = searchParams?.get("redirect");
        const safeTarget = getAuthorizedRedirectUrl(storedUrl || queryRedirect, role);
        router.replace(safeTarget);
      } catch {
        // Keep user safely on /login if session verification fails
      }
    }

    verifyAndRedirect();
    return () => {
      active = false;
    };
  }, [isLoading, isAuthenticated, user, role, router, clearStaleSession, isSubmitting, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoginError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const lowerEmail = email.toLowerCase().trim();
      let localProfile: any = null;

      if (typeof window !== "undefined") {
        try {
          const localProfiles = JSON.parse(localStorage.getItem("oxpecker_registered_profiles") || "[]");
          localProfile =
            localProfiles.find(
              (p: any) => p.email && p.email.toLowerCase().trim() === lowerEmail
            ) || null;
        } catch {}
      }

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          email: lowerEmail,
          password,
          localProfile,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.user) {
        const msg = data?.error || "Invalid email or password.";
        setLoginError(msg);
        toast.error(msg);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      hasRedirectedRef.current = true;
      await login(data.user, { cookieAlreadySet: true });
    } catch (err: any) {
      const msg =
        err?.name === "AbortError"
          ? "Sign-in request timed out. Please try again."
          : "Login failed. Please verify credentials.";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setLoginError(null);

    try {
      const gUser = await initiateGoogleSignIn();
      const lowerEmail = gUser.email.toLowerCase().trim();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/auth/oauth-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({ email: lowerEmail, mode: "login" }),
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.exists && data?.user) {
        toast.success(`Welcome back, ${data.user.name || gUser.name}!`);
        await login(
          {
            ...data.user,
            image: data.user.image || gUser.picture || undefined,
          },
          { cookieAlreadySet: true }
        );
        return;
      }

      // If NO account exists: store Google credentials and redirect to register
      const defaultRole: UserRole = queryRole || "patient";
      sessionStorage.setItem(
        "oxpecker_google_user",
        JSON.stringify({
          name: gUser.name,
          email: lowerEmail,
          picture: gUser.picture,
          role: defaultRole,
        })
      );

      toast.info("Please complete your account registration.");
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
      {/* Clean Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-slate-50 via-white to-sky-50/25">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-50/30 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group w-fit">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_-12px_rgba(15,23,42,0.08)] border border-slate-200/80 p-7 sm:p-9 relative z-20 ring-1 ring-slate-900/[0.03]">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex mb-4">
              <Image src="/images/Oxpecker_full_size.png" alt="Oxpecker AI" width={160} height={45} className="h-9 sm:h-10 w-auto object-contain" priority />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">Sign In</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-[50px] bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-3 text-[14px] active:scale-[0.99] cursor-pointer"
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
          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or email login</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 tracking-tight">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-[50px] pl-10 pr-4 rounded-xl bg-black/[0.03] border border-transparent text-[14px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 tracking-tight">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[50px] pl-10 pr-12 rounded-xl bg-black/[0.03] border border-transparent text-[14px] outline-none hover:bg-black/[0.05] focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
              className="w-full h-[50px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-1 cursor-pointer"
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
