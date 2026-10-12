"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast, Toaster } from "sonner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState("Verifying Google session...");

  useEffect(() => {
    async function handleAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          const { data: authData, error: authErr } = await supabase.auth.getUser();
          if (authErr || !authData.user) {
            toast.error("Google authentication could not be completed.");
            router.replace("/register");
            return;
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
          router.replace("/register");
          return;
        }

        // Check if user already exists in profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .ilike("email", user.email)
          .maybeSingle();

        const pendingRole = sessionStorage.getItem("oxpecker_pending_role") || searchParams.get("role") || "patient";

        if (profile && profile.phone) {
          toast.success("Welcome back!");
          login(profile as any);
        } else {
          sessionStorage.setItem("oxpecker_google_user", JSON.stringify({
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            email: user.email,
            picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
            role: pendingRole
          }));
          router.replace("/register?onboarding=google");
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        router.replace("/register");
      }
    }

    handleAuth();
  }, [router, searchParams, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <Toaster position="top-center" />
      <div className="w-12 h-12 border-3 border-sky-600/20 border-t-sky-600 rounded-full animate-spin mb-4" />
      <h2 className="text-lg font-bold text-slate-800">{status}</h2>
      <p className="text-sm text-slate-500 mt-1">Please wait while we complete your authentication.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="w-12 h-12 border-3 border-sky-600/20 border-t-sky-600 rounded-full animate-spin mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Loading...</h2>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
