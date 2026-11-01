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
      const params = new URLSearchParams(window.location.search);
      
      // Explicit reset trigger if user wants to test non-branded view
      if (params.get("clear_ref") === "1" || params.get("reset_event") === "1") {
        localStorage.removeItem("oxpecker_hackathon_ref");
        sessionStorage.removeItem("oxpecker_hackathon_ref");
        setIsYunet(false);
        return;
      }

      const refParam = params.get("ref")?.toLowerCase();
      const eventParam = params.get("event")?.toLowerCase();
      const hackathonParam = params.get("hackathon")?.toLowerCase();

      const isTriggered =
        refParam === "yunet" ||
        eventParam === "yunet" ||
        hackathonParam === "yunet" ||
        window.location.pathname.startsWith("/yunet") ||
        window.location.hostname.includes("yunet");

      if (isTriggered) {
        localStorage.setItem("oxpecker_hackathon_ref", "yunet");
        sessionStorage.setItem("oxpecker_hackathon_ref", "yunet");
        setIsYunet(true);
      } else {
        const stored =
          localStorage.getItem("oxpecker_hackathon_ref") ||
          sessionStorage.getItem("oxpecker_hackathon_ref");
        if (stored === "yunet") {
          setIsYunet(true);
        }
      }
    } catch {}
  }, []);

  const clearRef = () => {
    try {
      localStorage.removeItem("oxpecker_hackathon_ref");
      sessionStorage.removeItem("oxpecker_hackathon_ref");
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
