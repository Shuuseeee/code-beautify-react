"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Wand2, MessageSquareX, GitCompare, Diff, Globe, Moon, X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { btnPrimary, btnIcon, eyebrow, kbd as kbdCls } from "@/lib/ui";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useGsapReducedMotion } from "@/hooks/useGsapReducedMotion";

const isMac =
  typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

const FEATURES = [
  { icon: Wand2,          label: "Format code",     desc: "HTML · CSS · JS · JSON"        },
  { icon: MessageSquareX, label: "Strip comments",  desc: "HTML and JavaScript"           },
  { icon: GitCompare,     label: "Diff view",       desc: "ServiceNow syntax aware"       },
  { icon: Diff,           label: "String compare",  desc: "Character-level, side by side" },
  { icon: Globe,          label: "Three languages", desc: "中文 · 日本語 · English"        },
  { icon: Moon,           label: "Dark mode",       desc: "Follows your system"           },
] as const;

const SHORTCUTS = [
  { keys: [MOD, "↵"],       desc: "formatCode"  },
  { keys: [MOD, "⇧", "D"],  desc: "compareCode" },
  { keys: [MOD, "⇧", "K"],  desc: "clearAll"    },
] as const;

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(open);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useGsapReducedMotion();

  useEffect(() => {
    if (open) setIsVisible(true);
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!isVisible) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: reducedMotion ? 0 : 0.16, ease: "power2.out" }
        );
        mm.add("(max-width: 639px)", () => {
          gsap.fromTo(panelRef.current,
            { opacity: 0, y: reducedMotion ? 0 : 20 },
            { opacity: 1, y: 0, duration: reducedMotion ? 0 : 0.2, ease: "power2.out" }
          );
        });
        mm.add("(min-width: 640px)", () => {
          gsap.fromTo(panelRef.current,
            { opacity: 0, y: reducedMotion ? 0 : -4, scale: reducedMotion ? 1 : 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: reducedMotion ? 0 : 0.14, ease: "power2.out" }
          );
        });
      } else {
        gsap.to(overlayRef.current, { opacity: 0, duration: reducedMotion ? 0 : 0.12 });
        gsap.to(panelRef.current, {
          opacity: 0, y: reducedMotion ? 0 : -3, scale: reducedMotion ? 1 : 0.985,
          duration: reducedMotion ? 0 : 0.10,
          ease: "power2.in",
          onComplete: () => setIsVisible(false),
        });
      }
    });
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [open, isVisible, reducedMotion]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-lg rounded-lg border border-line bg-surface shadow-pop overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3.5 border-b border-line">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.01em] text-fg">
              {t("onboardingTitle")}
            </h2>
            <p className="mt-0.5 text-base text-fg-muted">{t("onboardingSubtitle")}</p>
          </div>
          <button onClick={onClose} className={`${btnIcon} -mr-1 -mt-0.5`} aria-label={t("close")}>
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <h3 className={`${eyebrow} mb-2.5`}>{t("onboardingFeatures")}</h3>
            <ul className="space-y-2.5">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon size={13} strokeWidth={1.75} className="mt-[3px] text-fg-faint shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base font-medium text-fg leading-tight">{label}</div>
                    <div className="text-sm text-fg-muted">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`${eyebrow} mb-2.5`}>{t("onboardingShortcuts")}</h3>
            <ul className="space-y-2">
              {SHORTCUTS.map(({ keys, desc }) => (
                <li key={desc} className="flex items-center justify-between gap-3">
                  <span className="text-base text-fg">
                    {t(desc as "formatCode" | "compareCode" | "clearAll")}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {keys.map((k) => (
                      <kbd key={k} className={kbdCls}>{k}</kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 px-3 py-2.5 rounded-md border border-line bg-surface-sunk">
              <p className="text-sm text-fg leading-relaxed">{t("onboardingTip")}</p>
            </div>
          </div>
        </div>

        <div className="px-4 h-12 flex items-center justify-end border-t border-line bg-surface-sunk">
          <button onClick={onClose} className={btnPrimary}>
            {t("onboardingGotIt")}
          </button>
        </div>
      </div>
    </div>
  );
}
