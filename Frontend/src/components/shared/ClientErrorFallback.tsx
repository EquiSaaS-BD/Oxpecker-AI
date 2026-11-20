"use client";

import React, { useEffect, useState } from "react";

interface ClientErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  showHomeButton?: boolean;
}

const RECOVERABLE_ERROR_RE =
  /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|history\.replaceState/i;

export function sanitizeOxpeckerStorage(): void {
  if (typeof localStorage === "undefined") return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("oxpecker_")) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

export function ClientErrorFallback({
  error,
  reset,
  showHomeButton = false,
}: ClientErrorFallbackProps) {
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    console.error("[Oxpecker ErrorBoundary]", error);
    const msg = error?.message || "";
    if (RECOVERABLE_ERROR_RE.test(msg) && typeof window !== "undefined") {
      try {
        const lastReload = Number(
          window.sessionStorage.getItem("oxpecker_error_reload_ts") || "0"
        );
        if (!Number.isFinite(lastReload) || Date.now() - lastReload > 15000) {
          window.sessionStorage.setItem(
            "oxpecker_error_reload_ts",
            String(Date.now())
          );
          if (/history\.replaceState/i.test(msg)) {
            window.localStorage.removeItem("oxpecker_mock_user");
            window.localStorage.removeItem("oxpecker_user");
          }
          window.location.reload();
        }
      } catch {
        // Ignore storage quota / privacy mode errors
      }
    }
  }, [error]);

  const handleResetCacheAndReload = async () => {
    setIsResetting(true);
    sanitizeOxpeckerStorage();
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});
    } catch {
      // Ignore network errors during recovery
    }
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.clear();
      } catch {}
      window.location.href = "/";
    }
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            margin: "0 auto 16px",
            borderRadius: "14px",
            backgroundColor: "#eff6ff",
            color: "#0284c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          !
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 8px",
          }}
        >
          পৃষ্ঠাটি লোড করতে সাময়িক সমস্যা হয়েছে
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#475569",
            lineHeight: 1.6,
            margin: "0 0 22px",
          }}
        >
          নতুন আপডেট বা পুরনো ব্রাউজার ক্যাশের কারণে এই সমস্যাটি হতে পারে। নিচের বাটনে ক্লিক করে সহজেই ঠিক করুন।
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            আবার চেষ্টা করুন (Try Again)
          </button>

          {showHomeButton && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/";
              }}
              style={{
                width: "100%",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              হোম পেজে ফিরুন (Back to Home)
            </button>
          )}

          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetCacheAndReload}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              color: "#334155",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isResetting ? "wait" : "pointer",
            }}
          >
            {isResetting
              ? "রিসেট হচ্ছে..."
              : "সেশন ও ক্যাশ রিসেট করুন (Reset Session & Reload)"}
          </button>
        </div>
      </div>
    </div>
  );
}
