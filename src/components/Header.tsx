"use client";

import { Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";

export type { Theme };

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const LOCALES = [
  { code: "zh-CN" as const, label: "中文" },
  { code: "ja" as const, label: "日本語" },
  { code: "en" as const, label: "English" },
];

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLabel = LOCALES.find((l) => l.code === locale)?.label ?? "English";

  return (
    <header className="sticky top-0 z-40 bg-anthro-light/90 dark:bg-anthro-dark/90 backdrop-blur-md border-b border-anthro-border dark:border-anthro-dark-border">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <span className="font-semibold text-anthro-dark dark:text-anthro-light text-sm font-heading tracking-wide">
            Code Beautify
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-anthro-mid hover:text-anthro-dark hover:bg-anthro-border dark:hover:text-anthro-light dark:hover:bg-anthro-dark-border transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Language selector */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-anthro-dark dark:text-anthro-light hover:bg-anthro-border dark:hover:bg-anthro-dark-border transition-colors font-heading"
            >
              <span>{currentLabel}</span>
              <ChevronDown
                size={13}
                className={`text-anthro-mid transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <ul className="absolute right-0 mt-1.5 w-32 py-1 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl shadow-lg overflow-hidden">
                {LOCALES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => {
                        setLocale(l.code);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-heading transition-colors ${
                        locale === l.code
                          ? "bg-anthro-orange-subtle text-anthro-orange dark:bg-anthro-orange/10 dark:text-anthro-orange"
                          : "text-anthro-dark dark:text-anthro-light hover:bg-anthro-border dark:hover:bg-anthro-dark-border"
                      }`}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
