"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getRoleHomePath, getAuthorizedRedirectUrl } from "@/lib/rbac";
import { derive12DigitAssistantCode, isValid12DigitCode } from "@/lib/doctor-assistant-link";
import {
  PROFILE_AVATAR_EVENT,
  getPersistedUserAvatar,
  saveUserAvatarEverywhere,
} from "@/lib/profile-media";

export type UserRole = "patient" | "doctor" | "hospital" | "admin" | "assistant" | null;

function isSameAppUser(a?: AppUser | null, b?: AppUser | null): boolean {
  if (!a || !b) return false;
  if (a.id && b.id && a.id === b.id) return true;
  const emailA = (a.email || "").trim().toLowerCase();
  const emailB = (b.email || "").trim().toLowerCase();
  return Boolean(emailA && emailB && emailA === emailB);
}

function mergePersistedProfile(serverUser: AppUser, localFallback?: AppUser | null): AppUser {
  const normalized = normalizeAppUser(serverUser);
  const sameUser = isSameAppUser(normalized, localFallback);
  const persistedImage =
    normalized.image ||
    getPersistedUserAvatar(normalized.id, normalized.email) ||
    (sameUser ? localFallback?.image : undefined) ||
    undefined;

  if (!sameUser || !localFallback) {
    return persistedImage ? { ...normalized, image: persistedImage } : normalized;
  }

  return {
    ...normalized,
    image: persistedImage,
    phone: normalized.phone || localFallback.phone,
    date_of_birth: normalized.date_of_birth || localFallback.date_of_birth,
    gender: normalized.gender || localFallback.gender,
    blood_group: normalized.blood_group || localFallback.blood_group,
    address: normalized.address || localFallback.address,
    hospital_name: normalized.hospital_name || localFallback.hospital_name,
  };
}

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
  clearStaleSession: () => void;
  updateUser: (userData: AppUser) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isValidCachedUser(value: unknown): value is AppUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.trim().length > 0 &&
    typeof candidate.email === "string" &&
    candidate.email.trim().length > 0 &&
    typeof candidate.role === "string" &&
    ["patient", "doctor", "hospital", "admin", "assistant"].includes(candidate.role)
  );
}

function clearCachedSessionKeys() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("oxpecker_mock_user");
  localStorage.removeItem("oxpecker_user");
  localStorage.removeItem("oxpecker_last_activity");
  localStorage.removeItem("oxpecker_session_expiry");
  localStorage.removeItem("oxpecker_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authoritative server-cookie-first hydration: NEVER set isLoading=false with a non-null user
  // until /api/auth/session confirms or sets the HttpOnly oxpecker_session cookie.
  useEffect(() => {
    let active = true;
    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

    async function verifyServerSession() {
      let cachedParsed: AppUser | null = null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      try {
        // 1. Inspect and validate any localStorage expiry timestamps first
        if (typeof localStorage !== "undefined") {
          const savedUser = localStorage.getItem("oxpecker_mock_user");
          const lastActivity = localStorage.getItem("oxpecker_last_activity");
          const sessionExpiry = localStorage.getItem("oxpecker_session_expiry");

          const isExpiredByActivity =
            !!lastActivity && Number.isFinite(parseInt(lastActivity, 10)) &&
            Date.now() - parseInt(lastActivity, 10) > THIRTY_DAYS_IN_MS;
          const isExpiredByTimestamp =
            !!sessionExpiry && Number.isFinite(parseInt(sessionExpiry, 10)) &&
            Date.now() > parseInt(sessionExpiry, 10);

          if (isExpiredByActivity || isExpiredByTimestamp) {
            clearCachedSessionKeys();
          } else if (savedUser) {
            try {
              const raw = JSON.parse(savedUser);
              if (isValidCachedUser(raw)) {
                cachedParsed = normalizeAppUser(raw);
              } else {
                clearCachedSessionKeys();
              }
            } catch {
              clearCachedSessionKeys();
            }
          }
        }

        // Instant optimistic hydration on non-auth routes (middleware already verified HttpOnly cookie)
        const pathname = typeof window !== "undefined" ? window.location.pathname : "";
        const isAuthPage = pathname === "/login" || pathname.startsWith("/register");
        if (cachedParsed && !isAuthPage && active) {
          setUser(cachedParsed);
          setIsLoading(false);
        }

        // 2. Check authoritative HttpOnly session cookie on server
        const res = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (active && data?.authenticated && isValidCachedUser(data?.user)) {
            const hydratedUser = mergePersistedProfile(data.user, cachedParsed);
            setUser(hydratedUser);
            if (typeof localStorage !== "undefined") {
              localStorage.setItem("oxpecker_mock_user", JSON.stringify(hydratedUser));
              localStorage.setItem("oxpecker_user", JSON.stringify(hydratedUser));
              localStorage.setItem("oxpecker_last_activity", Date.now().toString());
            }
            return;
          }
        }

        // 3. No active server cookie yet — handle cached user strictly without cookie desync
        if (cachedParsed) {
          if (cachedParsed.role === "admin") {
            // /api/auth/session rejects unauthenticated admin sessionSync with 403; never keep stale client admin state
            clearCachedSessionKeys();
            if (active) setUser(null);
            return;
          }

          const syncRes = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal: controller.signal,
            body: JSON.stringify({ sessionSync: true, user: cachedParsed }),
          });

          if (syncRes.ok) {
            if (active) setUser(cachedParsed);
            if (typeof localStorage !== "undefined") {
              localStorage.setItem("oxpecker_mock_user", JSON.stringify(cachedParsed));
              localStorage.setItem("oxpecker_user", JSON.stringify(cachedParsed));
              localStorage.setItem("oxpecker_last_activity", Date.now().toString());
            }
          } else {
            clearCachedSessionKeys();
            if (active) setUser(null);
          }
          return;
        }

        if (active) setUser(null);
      } catch {
        // Offline fallback only when genuinely offline and non-admin
        if (
          active &&
          typeof navigator !== "undefined" &&
          navigator.onLine === false &&
          cachedParsed &&
          cachedParsed.role !== "admin"
        ) {
          setUser(cachedParsed);
        } else if (active) {
          setUser(null);
        }
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
    const handleAvatarUpdated = (ev: Event) => {
      const detail = (ev as CustomEvent<{ id?: string | null; email?: string | null; image?: string }>).detail;
      if (!detail?.image) return;
      setUser((prev) => {
        if (!prev) return prev;
        const emailMatch =
          detail.email && prev.email && prev.email.trim().toLowerCase() === detail.email.trim().toLowerCase();
        const idMatch = detail.id && prev.id === detail.id;
        if (idMatch || emailMatch) {
          return { ...prev, image: detail.image };
        }
        return prev;
      });
    };
    window.addEventListener(PROFILE_AVATAR_EVENT, handleAvatarUpdated);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(PROFILE_AVATAR_EVENT, handleAvatarUpdated);
    };
  }, [user]);

  const router = useRouter();

  const login = async (userData: AppUser, options?: { cookieAlreadySet?: boolean }) => {
    const normalized = mergePersistedProfile(userData, user);
    if (normalized.image) {
      saveUserAvatarEverywhere({ id: normalized.id, email: normalized.email, image: normalized.image });
    }
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

  const clearAllClientAuthStorage = () => {
    clearCachedSessionKeys();
    if (typeof localStorage === "undefined") return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") || key.includes("token") || key.includes("oxpecker_auth"))) {
        localStorage.removeItem(key);
      }
    }
  };

  const clearStaleSession = () => {
    try {
      fetch("/api/auth/session", { method: "DELETE", credentials: "include", keepalive: true }).catch(() => {});
      supabase.auth.signOut().catch(() => {});
    } catch {}
    setUser(null);
    clearAllClientAuthStorage();
  };

  const logout = async () => {
    setUser(null);
    clearAllClientAuthStorage();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
    try {
      await Promise.allSettled([
        fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "include",
          keepalive: true,
          signal: AbortSignal.timeout(1200),
        }).catch(() => {}),
        supabase.auth.signOut().catch(() => {}),
      ]);
    } catch {}
    // Hard refresh/redirect to /login to completely eradicate lingering client caches
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const updateUser = (userData: AppUser) => {
    const normalized = mergePersistedProfile(userData, user);
    if (normalized.image) {
      saveUserAvatarEverywhere({
        id: normalized.id,
        email: normalized.email,
        image: normalized.image,
      });
    }
    setUser(normalized);
    localStorage.setItem("oxpecker_mock_user", JSON.stringify(normalized));
    localStorage.setItem("oxpecker_user", JSON.stringify(normalized));
    localStorage.setItem("oxpecker_last_activity", Date.now().toString());
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isAuthenticated: !!user, login, logout, clearStaleSession, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
