"use client";

import { Sun, Moon, ChevronDown, CircleHelp } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { LANG_COLOR } from "@/lib/langColors";

const NAV_BLUE = LANG_COLOR.html;

const NAV_LINKS = [
  { href: "/" as const, labelKey: "navBeautify" as const },
  { href: "/compare" as const, labelKey: "navCompare" as const },
];

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
  const navLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [navPill, setNavPill] = useState<{ left: number; width: number } | null>(null);
  const navPillInitialized = useRef(false);
  const [navHovering, setNavHovering] = useState<number | null>(null);
  const [navPressing, setNavPressing] = useState<number | null>(null);

  const activeNavIndex = NAV_LINKS.findIndex(({ href }) => pathname === href);

  useLayoutEffect(() => {
    const idx = activeNavIndex >= 0 ? activeNavIndex : 0;
    const el = navLinkRefs.current[idx];
    if (!el) return;
    setNavPill({ left: el.offsetLeft, width: el.offsetWidth });
    navPillInitialized.current = true;
  }, [pathname, locale, activeNavIndex]);

  useEffect(() => {
    function onResize() {
      const idx = activeNavIndex >= 0 ? activeNavIndex : 0;
      const el = navLinkRefs.current[idx];
      if (!el) return;
      setNavPill({ left: el.offsetLeft, width: el.offsetWidth });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeNavIndex, locale]);

  const navPillTransition = navPillInitialized.current
    ? "left 340ms cubic-bezier(0.34, 1.56, 0.64, 1), width 340ms cubic-bezier(0.34, 1.56, 0.64, 1)"
    : "none";

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
          <nav
            className="relative inline-flex items-center p-1 rounded-2xl select-none shrink-0"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-1 top-0 h-[1.5px] rounded-full z-[1]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 70%, transparent 100%)",
              }}
            />
            {/* Active pill */}
            {navPill && (
              <div
                className="absolute top-1 bottom-1 rounded-xl z-[1]"
                style={{
                  left: navPill.left,
                  width: navPill.width,
                  background: NAV_BLUE.tint,
                  boxShadow: `var(--glass-pill-shadow), inset 0 0 0 0.5px ${NAV_BLUE.tint}`,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  transition: navPillTransition,
                }}
              />
            )}
            {/* Hover ghost pill */}
            {navHovering !== null && navHovering !== activeNavIndex && (() => {
              const el = navLinkRefs.current[navHovering];
              if (!el) return null;
              return (
                <div
                  className="absolute top-1 bottom-1 rounded-xl pointer-events-none z-[1]"
                  style={{ left: el.offsetLeft, width: el.offsetWidth, background: "var(--glass-hover-bg)" }}
                />
              );
            })()}
            {NAV_LINKS.map(({ href, labelKey }, i) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  ref={(el) => { navLinkRefs.current[i] = el; }}
                  href={href}
                  onMouseEnter={() => setNavHovering(i)}
                  onMouseLeave={() => setNavHovering(null)}
                  onMouseDown={() => setNavPressing(i)}
                  onMouseUp={() => setNavPressing(null)}
                  onTouchStart={() => setNavPressing(i)}
                  onTouchEnd={() => setNavPressing(null)}
                  className="relative z-10 px-3 py-1.5 rounded-xl text-sm font-heading"
                  style={{
                    color: active ? NAV_BLUE.text : "var(--glass-text-inactive)",
                    fontWeight: active ? 600 : 400,
                    transform: navPressing === i ? "scale(0.93)" : "scale(1)",
                    transition: "color 200ms ease, transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {t(labelKey)}
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
