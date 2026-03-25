"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ptBR, enUS } from "./dictionaries";

export type Language = "pt" | "en";

interface I18nContextType {
  t: (key: string) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  t: (k) => k,
  lang: "pt",
  setLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved) {
      setLang(saved);
      document.cookie = `app_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      const browserLang = typeof navigator !== "undefined" && navigator.language ? navigator.language.toLowerCase() : "";
      if (browserLang.startsWith("en")) {
        setLang("en");
        document.cookie = `app_lang=en; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        setLang("pt");
        document.cookie = `app_lang=pt; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
    setMounted(true);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
    document.cookie = `app_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: string): string => {
    const dict = lang === "en" ? enUS : ptBR;
    const keys = key.split(".");
    let value: any = dict;
    
    for (const k of keys) {
      if (value[k as keyof typeof value] === undefined) {
        return key;
      }
      value = value[k as keyof typeof value];
    }
    
    return value as string;
  };

  if (!mounted) {
    return <div className="min-h-screen bg-muted/20" />; // prevent hydration mismatch
  }

  return (
    <I18nContext.Provider value={{ t, lang, setLang: handleSetLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
