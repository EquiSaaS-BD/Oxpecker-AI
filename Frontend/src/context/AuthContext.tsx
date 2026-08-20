"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "patient" | "doctor" | "hospital" | "admin" | "assistant" | null;

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
  image?: string;
  assistantId?: string;
  doctorId?: string;
}

interface AuthContextType {
  user: AppUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userData: AppUser) => void;
  logout: () => void;
  updateUser: (userData: AppUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch full profile from Supabase by ID or Email
  const fetchProfile = async (supabaseUser: User): Promise<AppUser | null> => {
    try {
      const email = (supabaseUser.email || "").toLowerCase().trim();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`id.eq.${supabaseUser.id},email.ilike.${email}`)
        .limit(1)
        .maybeSingle();

      if (profile) {
        return {
          id: profile.id,
          name: profile.name || "User",
          email: profile.email,
          role: (profile.role as UserRole) || "patient",
          phone: profile.phone || undefined,
          date_of_birth: profile.date_of_birth || undefined,
          gender: profile.gender || undefined,
          blood_group: profile.blood_group || undefined,
          address: profile.address || undefined,
          image: profile.image || undefined,
          doctorId: profile.doctor_id || undefined,
          assistantId: profile.assistant_id || undefined,
        };
      }
    } catch (err) {
      console.warn("fetchProfile error:", err);
    }

    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email || "",
      role: (supabaseUser.user_metadata?.role as UserRole) || "patient",
    };
  };

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const appUser = await fetchProfile(session.user);
          if (appUser) {
            setUser(appUser);
            localStorage.setItem("oxpecker_user", JSON.stringify(appUser));
          }
        } else {
          const stored = localStorage.getItem("oxpecker_user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.email) setUser(parsed);
            } catch {}
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const appUser = await fetchProfile(session.user);
        if (appUser) {
          setUser(appUser);
          localStorage.setItem("oxpecker_user", JSON.stringify(appUser));
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("oxpecker_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectByRole = (targetRole: UserRole) => {
    const redirectUrl = sessionStorage.getItem("redirect_after_login");
    if (redirectUrl) {
      sessionStorage.removeItem("redirect_after_login");
      router.push(redirectUrl);
      return;
    }
    if (targetRole === "patient") router.push("/chat");
    else if (targetRole === "doctor") router.push("/doctor/dashboard");
    else if (targetRole === "hospital") router.push("/hospital/dashboard");
    else if (targetRole === "admin") router.push("/admin/dashboard");
    else if (targetRole === "assistant") router.push("/assistant");
    else router.push("/");
  };

  const login = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem("oxpecker_user", JSON.stringify(userData));
    redirectByRole(userData.role);
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
    localStorage.removeItem("oxpecker_user");
    router.push("/login");
  };

  const updateUser = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem("oxpecker_user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isAuthenticated: !!user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
