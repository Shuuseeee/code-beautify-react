"use client";

import { Sun, Moon, ChevronDown, CircleHelp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";

export type { Theme };

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onHelp: () => void;
}

const LOCALES = [
  { code: "zh-CN" as const, label: "中文",    short: "中文" },
  { code: "ja"    as const, label: "日本語",  short: "日本語" },
  { code: "en"    as const, label: "English", short: "EN"    },
];

export default function Header({ theme, onToggleTheme, onHelp }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[2];

  return (
    <header className="sticky top-0 z-40 bg-anthro-light/90 dark:bg-anthro-dark/90 backdrop-blur-md border-b border-anthro-border dark:border-anthro-dark-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-3 md:gap-5 select-none">
          <span className="hidden sm:inline font-semibold text-anthro-dark dark:text-anthro-light text-sm font-heading tracking-wide">
            Code Beautify
          </span>
          <nav className="flex items-center gap-0.5 md:gap-1">
            {[
              { href: "/",        label: t("navBeautify") },
              { href: "/compare", label: t("navCompare")  },
            ].map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-heading transition-colors ${
                    active
                      ? "bg-[#007AFF]/10 text-[#007AFF] font-semibold"
                      : "text-anthro-mid hover:text-anthro-dark dark:hover:text-anthro-light hover:bg-anthro-border dark:hover:bg-anthro-dark-border"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Help */}
          <button
            onClick={onHelp}
            className="p-2 rounded-lg text-anthro-mid hover:text-anthro-dark hover:bg-anthro-border dark:hover:text-anthro-light dark:hover:bg-anthro-dark-border transition-colors"
            aria-label="Help"
          >
            <CircleHelp size={17} />
          </button>

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
              <span className="hidden sm:inline">{currentLocale.label}</span>
              <span className="sm:hidden">{currentLocale.short}</span>
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
                          ? "bg-[#007AFF]/10 text-[#007AFF]"
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
