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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs">
        <div className="h-11 w-11 rounded-lg border border-line bg-surface-sunk flex items-center justify-center">
          <WifiOff size={20} strokeWidth={1.5} className="text-fg-muted" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-fg">
            {t("noInternet")}
          </h2>
          <p className="mt-1 text-base text-fg-muted leading-relaxed">
            {t("noInternetDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
