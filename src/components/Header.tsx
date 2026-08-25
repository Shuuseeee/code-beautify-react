"use client";

import gsap from "gsap";
import { Sun, Moon, ChevronDown, CircleHelp, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { btnIcon, popover, popoverItem, press } from "@/lib/ui";
import { useChevronAnimation } from "@/hooks/useChevronAnimation";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

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
  { code: "zh-CN" as const, label: "中文",    short: "中"  },
  { code: "ja"    as const, label: "日本語",  short: "日"  },
  { code: "en"    as const, label: "English", short: "EN" },
];

export default function Header({ theme, onToggleTheme, onHelp }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const chevronRef = useChevronAnimation(open);

  useIsomorphicLayoutEffect(() => {
    if (open && popoverRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(popoverRef.current,
          { opacity: 0, y: -4, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }
        );
      });
      return () => ctx.revert();
    }
  }, [open]);

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
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Wordmark + nav. The nav underline sits on the header's own bottom
            border, so the active tab reads as a notch cut into the rule. */}
        <div className="flex items-stretch gap-5 select-none min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base font-semibold tracking-[-0.01em] text-fg">
              Code Beautify
            </span>
          </div>

          <nav className="flex items-stretch gap-1 -mb-px">
            {NAV_LINKS.map(({ href, labelKey }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center px-2 text-base ${press} ${
                    active
                      ? "text-fg font-medium"
                      : "text-fg-faint hover:text-fg-muted"
                  }`}
                >
                  {t(labelKey)}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 -bottom-px h-[2px] ${
  active ? "bg-fg" : "bg-transparent"
}`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onHelp} className={btnIcon} aria-label={t("navBeautify") ? "Help" : "Help"}>
            <CircleHelp size={15} strokeWidth={1.75} />
          </button>

          <button
            onClick={onToggleTheme}
            className={btnIcon}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark"
              ? <Sun size={15} strokeWidth={1.75} />
              : <Moon size={15} strokeWidth={1.75} />}
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className={`inline-flex items-center gap-1 h-7 px-2 rounded-sm text-base text-fg-muted hover:text-fg hover:bg-hover ${press}`}
            >
              <span className="hidden sm:inline">{currentLocale.label}</span>
              <span className="sm:hidden">{currentLocale.short}</span>
              <ChevronDown
                ref={chevronRef}
                size={12}
                strokeWidth={2}
                className="text-fg-faint"
              />
            </button>

            {open && (
              <ul ref={popoverRef} className={`absolute right-0 mt-1.5 w-36 ${popover}`}>
                {LOCALES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => { setLocale(l.code); setOpen(false); }}
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
