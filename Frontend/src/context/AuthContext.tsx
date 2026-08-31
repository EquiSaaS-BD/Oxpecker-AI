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

  // Initialize from localStorage and check 30-day session expiry
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("oxpecker_mock_user");
      const lastActivity = localStorage.getItem("oxpecker_last_activity");

      if (savedUser && lastActivity) {
        const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);

        if (timeSinceLastActivity > THIRTY_DAYS_IN_MS) {
          // Session expired due to 30 days of inactivity
          console.log("Session expired. Auto-logging out.");
          localStorage.removeItem("oxpecker_mock_user");
          localStorage.removeItem("oxpecker_last_activity");
          setUser(null);
        } else {
          // Session valid, refresh the activity timer
          setUser(JSON.parse(savedUser));
          localStorage.setItem("oxpecker_last_activity", Date.now().toString());
        }
      }
    } catch (e) {
      console.error("Auth init error:", e);
    } finally {
      setIsLoading(false);
    }
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

  const logout = () => {
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
