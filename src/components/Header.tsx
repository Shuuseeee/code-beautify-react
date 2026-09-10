"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, Moon, ChevronDown, CircleHelp, Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { popover, popoverItem, press } from "@/lib/ui";
import { useChevronAnimation } from "@/hooks/useChevronAnimation";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

export type { Theme };

const NAV_LINKS = [
  { href: "/" as const, labelKey: "navBeautify" as const },
  { href: "/compare" as const, labelKey: "navCompare" as const },
];

const LOCALES = [
  { code: "zh-CN" as const, label: "中文",   short: "中"  },
  { code: "ja"    as const, label: "日本語", short: "日"  },
  { code: "en"    as const, label: "English", short: "EN" },
];

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onHelp: () => void;
}

export default function Header({ theme, onToggleTheme, onHelp }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const [localeOpen, setLocaleOpen] = useState(false);
  const localeDropdownRef = useRef<HTMLDivElement>(null);
  const localePopoverRef = useRef<HTMLUListElement>(null);
  const chevronRef = useChevronAnimation(localeOpen);
  const pathname = usePathname();

  const [hovered, setHovered] = useState<string | null>(null);

  // ── Locale popover animation ───────────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    if (localeOpen && localePopoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          localePopoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [localeOpen]);

  // ── Close locale dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!localeDropdownRef.current?.contains(e.target as Node)) {
        setLocaleOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[2];

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#0c1a24] text-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-stretch px-6">

        {/* Wordmark */}
        <span className="mr-8 flex shrink-0 items-center select-none text-[15px] font-semibold tracking-tight text-sn-ondark">
          Code Beautify for S-NOW Dev
        </span>

        {/* Nav — each link owns its bar, grows from center (exact GlobalNav pattern) */}
        <nav
          className="hidden items-center gap-1 self-stretch lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map(({ href, labelKey }) => {
            const isActivePage = pathname === href;
            const show = isActivePage || hovered === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActivePage ? "page" : undefined}
                onMouseEnter={() => setHovered(href)}
                className="relative flex items-center self-stretch gap-1 px-3 text-[15px] font-normal text-white/90 transition-colors hover:text-white"
              >
                {t(labelKey)}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-[4px] origin-center transition-transform duration-300 ease-in-out ${
                    show ? "scale-x-100" : "scale-x-0"
                  } ${isActivePage ? "bg-[#63df4e]" : "bg-white/40"}`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-5 self-center">

          <button
            onClick={onHelp}
            aria-label="Help"
            className={`flex items-center justify-center text-white/70 hover:opacity-80 transition-opacity ${press}`}
          >
            <CircleHelp size={20} strokeWidth={1.75} />
          </button>

          <button
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={`flex items-center justify-center text-white/70 hover:opacity-80 transition-opacity ${press}`}
          >
            {theme === "dark"
              ? <Sun  size={20} strokeWidth={1.75} />
              : <Moon size={20} strokeWidth={1.75} />}
          </button>

          {/* Locale dropdown */}
          <div ref={localeDropdownRef} className="relative">
            <button
              onClick={() => setLocaleOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={localeOpen}
              className={`flex items-center gap-1 text-[15px] text-white/70 hover:opacity-80 transition-opacity ${press}`}
            >
              <span className="hidden sm:inline">{currentLocale.label}</span>
              <span className="sm:hidden">{currentLocale.short}</span>
              <ChevronDown ref={chevronRef} size={14} strokeWidth={2} className="opacity-80" />
            </button>

            {localeOpen && (
              <ul ref={localePopoverRef} className={`absolute right-0 mt-1.5 w-36 ${popover}`}>
                {LOCALES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => { setLocale(l.code); setLocaleOpen(false); }}
                      className={`${popoverItem} justify-between`}
                    >
                      {l.label}
                      {locale === l.code && (
                        <Check size={13} strokeWidth={2.25} className="text-accent" />
                      )}
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
