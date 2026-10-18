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
  hospital_name?: string;
  specialty?: string;
  bmdc?: string;
  status?: "active" | "pending" | "banned";
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

  // Initialize from localStorage for instant hydration, then verify with server session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const savedUser = localStorage.getItem("oxpecker_user") || localStorage.getItem("oxpecker_mock_user");
        if (savedUser && mounted) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
        }

        // Verify active server session token from HTTP cookie
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user && mounted) {
            setUser(data.user);
            localStorage.setItem("oxpecker_user", JSON.stringify(data.user));
            localStorage.setItem("oxpecker_mock_user", JSON.stringify(data.user));
          }
        } else if (res.status === 401 && mounted) {
          // Server says cookie is missing or invalid
          // Clear stale local storage
          localStorage.removeItem("oxpecker_user");
          localStorage.removeItem("oxpecker_mock_user");
          localStorage.removeItem("oxpecker_last_activity");
          setUser(null);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();
    return () => { mounted = false; };
  }, []);
  const router = useRouter();

  const login = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem("oxpecker_mock_user", JSON.stringify(userData));
    localStorage.setItem("oxpecker_user", JSON.stringify(userData));
    localStorage.setItem("oxpecker_last_activity", Date.now().toString());

    const redirectUrl = typeof window !== "undefined" ? sessionStorage.getItem("redirect_after_login") : null;
    if (redirectUrl) {
      sessionStorage.removeItem("redirect_after_login");
      router.push(redirectUrl);
      return;
    }

    if (userData.role === "doctor") {
      router.push("/doctor/dashboard");
    } else if (userData.role === "hospital") {
      router.push("/hospital/dashboard");
    } else if (userData.role === "assistant") {
      router.push("/assistant");
    } else if (userData.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/chat");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    localStorage.removeItem("oxpecker_mock_user");
    localStorage.removeItem("oxpecker_user");
    localStorage.removeItem("oxpecker_last_activity");
    router.push("/login");
  };

  const updateUser = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem("oxpecker_mock_user", JSON.stringify(userData));
    localStorage.setItem("oxpecker_user", JSON.stringify(userData));
    localStorage.setItem("oxpecker_last_activity", Date.now().toString());
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
