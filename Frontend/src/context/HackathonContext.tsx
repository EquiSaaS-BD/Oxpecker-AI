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

    try {
      // 1. Immediately wipe any old localStorage to guarantee https://oxpecker.equisaas-bd.com is never polluted
      localStorage.removeItem("oxpecker_hackathon_ref");

      const params = new URLSearchParams(window.location.search);
      const refParam = params.get("ref")?.toLowerCase();

      // 2. Strict check: If visiting https://oxpecker.equisaas-bd.com/?ref=yunet
      if (refParam === "yunet") {
        sessionStorage.setItem("oxpecker_session_yunet", "true");
        setIsYunet(true);
        return;
      }

      // 3. Strict check: If visiting root https://oxpecker.equisaas-bd.com without ?ref=yunet
      // MUST NEVER show any pop up or sticker under any circumstances!
      if (window.location.pathname === "/" && refParam !== "yunet") {
        sessionStorage.removeItem("oxpecker_session_yunet");
        setIsYunet(false);
        return;
      }

      // 4. For sub-pages within the same active tab session if and only if started via ?ref=yunet
      const isSessionActive = sessionStorage.getItem("oxpecker_session_yunet") === "true";
      if (isSessionActive) {
        setIsYunet(true);
      } else {
        setIsYunet(false);
      }
    } catch {
      setIsYunet(false);
    }
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
