"use client";

import { Wand2, MessageSquareX, GitCompare, Diff, Globe, Moon, Info } from "lucide-react";
import { useI18n } from "@/i18n/context";

// Detect Mac at module level (client-only, safe in "use client")
const isMac =
  typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

const FEATURES = [
  { icon: Wand2,          label: "Format Code",     desc: "HTML · CSS · JS · JSON"          },
  { icon: MessageSquareX, label: "Remove Comments", desc: "HTML & JavaScript"                },
  { icon: GitCompare,     label: "Diff View",       desc: "Monaco · ServiceNow highlighting" },
  { icon: Diff,           label: "String Compare",  desc: "Char-level side-by-side diff"     },
  { icon: Globe,          label: "Multilingual",    desc: "中文 · 日本語 · English"           },
  { icon: Moon,           label: "Dark Mode",       desc: "Follows system pref"              },
] as const;

const SHORTCUTS = [
  { keys: [MOD, "↵"],        desc: "formatCode"  },
  { keys: [MOD, "⇧", "D"],  desc: "compareCode" },
  { keys: [MOD, "⇧", "K"],  desc: "clearAll"    },
] as const;

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-anthro-dark/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="modal-in bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-anthro-border dark:border-anthro-dark-border">
          <h2 className="text-base font-bold font-heading text-anthro-dark dark:text-anthro-light">
            {t("onboardingTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-anthro-mid">{t("onboardingSubtitle")}</p>
        </div>

        {/* Body: two columns on sm+, single column on mobile */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Features */}
          <div>
            <h3 className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid mb-3">
              {t("onboardingFeatures")}
            </h3>
            <ul className="space-y-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-anthro-border dark:bg-anthro-dark-border shrink-0">
                    <Icon size={12} className="text-anthro-mid" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold font-heading text-anthro-dark dark:text-anthro-light leading-tight">
                      {label}
                    </div>
                    <div className="text-xs text-anthro-mid">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Shortcuts */}
          <div>
            <h3 className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid mb-3">
              {t("onboardingShortcuts")}
            </h3>
            <ul className="space-y-2.5">
              {SHORTCUTS.map(({ keys, desc }) => (
                <li key={desc} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-heading text-anthro-dark dark:text-anthro-light">
                    {t(desc as "formatCode" | "compareCode" | "clearAll")}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 text-[11px] font-mono bg-anthro-border dark:bg-anthro-dark-border text-anthro-dark dark:text-anthro-light rounded-md border border-anthro-mid/20 shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {/* Tip box */}
            <div className="mt-5 p-3 bg-[#007AFF]/8 dark:bg-[#007AFF]/12 rounded-xl">
              <p className="flex items-start gap-1.5 text-xs text-anthro-dark dark:text-anthro-light leading-relaxed">
                <Info size={12} className="shrink-0 mt-0.5 text-[#007AFF]" />
                {t("onboardingTip")}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-anthro-border dark:border-anthro-dark-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0066CC] text-white text-sm font-semibold font-heading rounded-xl transition-colors"
          >
            {t("onboardingGotIt")}
          </button>
        </div>
      </div>
    </div>
  );
}
