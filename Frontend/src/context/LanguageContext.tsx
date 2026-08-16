"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (en: string, bn: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  // Load language preference from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("shustota_lang") as Language;
    if (savedLang === "bn" || savedLang === "en") {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("shustota_lang", newLang);
    // Setting lang on HTML helps screen readers, but we already have translate="no" to prevent Google Translate issues
    document.documentElement.lang = newLang; 
  };

  // Helper function to easily pick the string based on current language
  const t = (en: string, bn: string) => {
    return lang === "en" ? en : bn;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
