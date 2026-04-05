"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import zhCN from "./locales/zh-CN.json";
import ja from "./locales/ja.json";
import en from "./locales/en.json";

type Locale = "zh-CN" | "ja" | "en";
type Messages = typeof en;

const locales: Record<Locale, Messages> = { "zh-CN": zhCN, ja, en };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Messages) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language;
  if (lang.startsWith("zh")) return "zh-CN";
  if (lang.startsWith("ja")) return "ja";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    setLocaleState(saved && locales[saved] ? saved : detectLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const t = useCallback((key: keyof Messages) => locales[locale][key] ?? key, [locale]);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
