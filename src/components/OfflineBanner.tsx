"use client";

import { WifiOff } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const { t } = useI18n();
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 flex items-center gap-2 px-4 py-2 bg-[#f5e9c4] dark:bg-[#3a2e0e] border-b border-[#e0c96a] dark:border-[#6b5520] text-sm text-[#5a4200] dark:text-[#f0d87a]"
    >
      <WifiOff size={14} strokeWidth={1.75} className="shrink-0" />
      <span>{t("noInternet")} — {t("noInternetDesc")}</span>
    </div>
  );
}
