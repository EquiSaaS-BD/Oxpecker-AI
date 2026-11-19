"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getRoleHomePath, getAuthorizedRedirectUrl } from "@/lib/rbac";
import { derive12DigitAssistantCode, isValid12DigitCode } from "@/lib/doctor-assistant-link";

export type UserRole = "patient" | "doctor" | "hospital" | "admin" | "assistant" | null;

function normalizeAppUser(u: AppUser): AppUser {
  if (u.role === "assistant" && !isValid12DigitCode(u.assistantId)) {
    return {
      ...u,
      assistantId: derive12DigitAssistantCode(u.id || u.email || u.name || "assistant"),
    };
  }
  return u;
}

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
  hospital_name?: string;
  image?: string;
  assistantId?: string;
  doctorId?: string;
  organizationId?: string;
  status?: "active" | "pending" | "banned";
}

interface AuthContextType {
  user: AppUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userData: AppUser, options?: { cookieAlreadySet?: boolean }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: AppUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Instant optimistic hydration from localStorage, then authoritative background server session check
  useEffect(() => {
    let active = true;
    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

    // 1. Instant local cache hydration (<1ms) to eliminate blank loading skeletons
    let cachedParsed: AppUser | null = null;
    try {
      const savedUser = localStorage.getItem("oxpecker_mock_user");
      const lastActivity = localStorage.getItem("oxpecker_last_activity");
      if (savedUser && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceLastActivity > THIRTY_DAYS_IN_MS) {
          localStorage.removeItem("oxpecker_mock_user");
          localStorage.removeItem("oxpecker_last_activity");
        } else {
          cachedParsed = normalizeAppUser(JSON.parse(savedUser));
          if (active) {
            setUser(cachedParsed);
            setIsLoading(false);
          }
          localStorage.setItem("oxpecker_last_activity", Date.now().toString());
        }
      }
    } catch {}

    // 2. Authoritative background server verification (bounded by 2.5s timeout)
    async function verifyServerSession() {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (active && data?.authenticated && data?.user) {
            const hydratedUser = normalizeAppUser(data.user);
            setUser(hydratedUser);
            localStorage.setItem("oxpecker_mock_user", JSON.stringify(hydratedUser));
            localStorage.setItem("oxpecker_user", JSON.stringify(hydratedUser));
            localStorage.setItem("oxpecker_last_activity", Date.now().toString());
            return;
          }
        }
        // If no server cookie yet but valid local cache exists, quietly sync cookie
        if (cachedParsed) {
          fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ sessionSync: true, user: cachedParsed }),
          }).catch(() => {});
        }
      } catch {
        // Non-blocking fallback
      } finally {
        clearTimeout(timer);
        if (active) setIsLoading(false);
      }
    }

    verifyServerSession();
    return () => {
      active = false;
    };
  }, []);

  // ── Cross-Tab Session Synchronization ─────────────────────────
  // If the user logs out or switches role in another tab, this tab
  // immediately reflects the change — preventing cross-role confusion.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "oxpecker_mock_user") {
        if (e.newValue === null) {
          // Logged out in another tab
          setUser(null);
        } else {
          try {
            const updated = JSON.parse(e.newValue) as AppUser;
            // If the role changed, force a reload to reset all guards
            if (user && updated.role !== user.role) {
              window.location.href = getRoleHomePath(updated.role);
              return;
            }
            setUser(updated);
          } catch {
            // Corrupted value — log out
            setUser(null);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  const router = useRouter();

  const login = async (userData: AppUser, options?: { cookieAlreadySet?: boolean }) => {
    const normalized = normalizeAppUser(userData);
    setUser(normalized);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("oxpecker_mock_user", JSON.stringify(normalized));
      localStorage.setItem("oxpecker_user", JSON.stringify(normalized));
      localStorage.setItem("oxpecker_last_activity", Date.now().toString());
    }

    if (!options?.cookieAlreadySet) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({ sessionSync: true, user: normalized }),
        });
      } catch {
        // Proceed with client state if session sync timed out
      } finally {
        clearTimeout(timer);
      }
    }

    // ── RBAC-Validated Redirect ─────────────────────────────────
    // Ensure HttpOnly cookie is written before navigating so middleware does not bounce to /login
    const storedRedirect =
      typeof window !== "undefined" ? sessionStorage.getItem("redirect_after_login") : null;

    if (storedRedirect) {
      sessionStorage.removeItem("redirect_after_login");
    }

    const safeTarget = getAuthorizedRedirectUrl(storedRedirect, normalized.role);
    router.replace(safeTarget);
    router.refresh();
  };

  const logout = () => {
    try {
      fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      supabase.auth.signOut().catch(() => {});
    } catch {}
    setUser(null);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("oxpecker_mock_user");
      localStorage.removeItem("oxpecker_user");
      localStorage.removeItem("oxpecker_last_activity");
      // Clean any other cached role tokens
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("token") || key.includes("oxpecker_auth"))) {
          localStorage.removeItem(key);
        }
      }
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
    // Hard refresh/redirect to /login to completely eradicate lingering client caches
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const updateUser = (userData: AppUser) => {
    const normalized = normalizeAppUser(userData);
    setUser(normalized);
    localStorage.setItem("oxpecker_mock_user", JSON.stringify(normalized));
    localStorage.setItem("oxpecker_user", JSON.stringify(normalized));
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
