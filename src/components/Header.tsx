"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sun, Moon, ChevronDown, CircleHelp, Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Theme } from "@/hooks/useTheme";
import { popover, popoverItem, press } from "@/lib/ui";
import { useChevronAnimation } from "@/hooks/useChevronAnimation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

gsap.registerPlugin(useGSAP);

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

  // ── Sliding indicator (exact GlobalNav pattern from SN clone) ──────────────
  // target = hovered item if hovering, else the active page link.
  // Color: green (#62d84e) when target === active page, white when just hovering.
  const [hovered, setHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeHref = NAV_LINKS.find(({ href }) => href === pathname)?.href ?? null;
  const target = hovered ?? activeHref;

  useLayoutEffect(() => {
    const ind = indRef.current;
    const nav = navRef.current;
    if (!ind || !nav) return;

    const measure = () => {
      const el = target ? linkRefs.current[target] : null;
      if (!el) { ind.style.opacity = "0"; return; }
      const n = nav.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      ind.style.left  = `${b.left - n.left}px`;
      ind.style.width = `${b.width}px`;
      ind.style.opacity = "1";
      ind.style.backgroundColor = target === activeHref ? "#62d84e" : "#ffffff";
    };

    // On locale change tab labels re-render, fonts may shift width —
    // wait for the font stack to settle before measuring.
    document.fonts.ready.then(measure);
  }, [target, activeHref, locale]);

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
      <div className="mx-auto flex h-full max-w-[1440px] items-center px-6">

        {/* Wordmark */}
        <span className="mr-8 shrink-0 select-none text-[15px] font-semibold tracking-tight">
          Code Beautify
        </span>

        {/* Nav — exact GlobalNav structure */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-6 self-stretch lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              ref={(el) => { linkRefs.current[href] = el; }}
              aria-current={pathname === href ? "page" : undefined}
              onMouseEnter={() => setHovered(href)}
              className="flex h-16 items-center text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {t(labelKey)}
            </Link>
          ))}

          {/* Sliding indicator: white on hover, green on active page */}
          <span
            ref={indRef}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-0 opacity-0"
            style={{
              transition: "left 0.3s ease-in-out, width 0.3s ease-in-out, background-color 0.3s ease-in-out, opacity 0.2s",
            }}
          />
        </nav>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1">

          <button
            onClick={onHelp}
            aria-label="Help"
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white ${press}`}
          >
            <CircleHelp size={17} strokeWidth={1.75} />
          </button>

          <button
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white ${press}`}
          >
            {theme === "dark"
              ? <Sun  size={17} strokeWidth={1.75} />
              : <Moon size={17} strokeWidth={1.75} />}
          </button>

          {/* Locale dropdown */}
          <div ref={localeDropdownRef} className="relative">
            <button
              onClick={() => setLocaleOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={localeOpen}
              className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white ${press}`}
            >
              <span className="hidden sm:inline">{currentLocale.label}</span>
              <span className="sm:hidden">{currentLocale.short}</span>
              <ChevronDown ref={chevronRef} size={13} strokeWidth={2.5} />
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
