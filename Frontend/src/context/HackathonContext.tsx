"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface HackathonContextType {
  isYunet: boolean;
  clearRef: () => void;
}

const HackathonContext = createContext<HackathonContextType>({
  isYunet: false,
  clearRef: () => {},
});

export function HackathonProvider({ children }: { children: React.ReactNode }) {
  const [isYunet, setIsYunet] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function checkYunet() {
      try {
        const href = window.location.href.toLowerCase();
        const search = window.location.search.toLowerCase();
        const pathname = window.location.pathname.toLowerCase();

        // 1. If URL has ref=yunet anywhere (case-insensitive, with/without slash/hash/params)
        const hasYunetInUrl =
          search.includes("ref=yunet") ||
          href.includes("ref=yunet") ||
          search.includes("event=yunet") ||
          search.includes("hackathon=yunet") ||
          pathname === "/yunet" ||
          pathname.startsWith("/yunet/");

        if (hasYunetInUrl) {
          sessionStorage.setItem("oxpecker_session_yunet", "true");
          setIsYunet(true);
          return;
        }

        // 2. If visiting clean root domain (e.g. https://oxpecker.equisaas-bd.com or /) without ref=yunet
        // MUST NEVER show any pop up, sticker, or watermark under any circumstances!
        if (pathname === "/" && !search.includes("ref=yunet") && !href.includes("ref=yunet")) {
          sessionStorage.removeItem("oxpecker_session_yunet");
          localStorage.removeItem("oxpecker_hackathon_ref");
          setIsYunet(false);
          return;
        }

        // 3. Sub-pages inside an active YUNet judge tab session
        const isSessionActive = sessionStorage.getItem("oxpecker_session_yunet") === "true";
        if (isSessionActive) {
          setIsYunet(true);
        } else {
          setIsYunet(false);
        }
      } catch {
        setIsYunet(false);
      }
    }

    // Run on initial mount
    checkYunet();

    // Listen to history / navigation events
    window.addEventListener("popstate", checkYunet);
    return () => window.removeEventListener("popstate", checkYunet);
  }, []);

  const clearRef = () => {
    try {
      localStorage.removeItem("oxpecker_hackathon_ref");
      sessionStorage.removeItem("oxpecker_session_yunet");
      setIsYunet(false);
    } catch {}
  };

  return (
    <HackathonContext.Provider value={{ isYunet, clearRef }}>
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  return useContext(HackathonContext);
}
