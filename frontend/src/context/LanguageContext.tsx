"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageInfo,
  UI_TRANSLATIONS,
  CATEGORY_TRANSLATIONS
} from "@/locales/translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageInfo[];
  t: (key: string, fallback?: string) => string;
  getCategoryName: (slug: string, defaultName?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "deallyhub_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
        setLanguageState(savedLang);
      } else if (typeof navigator !== "undefined" && navigator.language) {
        const browserCode = navigator.language.slice(0, 2).toLowerCase() as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.some((l) => l.code === browserCode)) {
          setLanguageState(browserCode);
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito/sandboxed)
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = UI_TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to English
      const enDict = UI_TRANSLATIONS.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  const getCategoryName = useCallback(
    (slug: string, defaultName?: string): string => {
      const langCats = CATEGORY_TRANSLATIONS[language];
      if (langCats && langCats[slug]) {
        return langCats[slug];
      }
      const enCats = CATEGORY_TRANSLATIONS.en;
      if (enCats && enCats[slug]) {
        return enCats[slug];
      }
      return defaultName || slug;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
        getCategoryName
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
