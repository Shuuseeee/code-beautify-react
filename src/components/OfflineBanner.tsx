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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-anthro-light dark:bg-anthro-dark">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-anthro-border dark:bg-anthro-dark-border flex items-center justify-center">
          <WifiOff size={28} className="text-anthro-mid" />
        </div>
        <div>
          <h2 className="text-lg font-semibold font-heading text-anthro-dark dark:text-anthro-light">
            {t("noInternet")}
          </h2>
          <p className="mt-1.5 text-anthro-mid text-sm">{t("noInternetDesc")}</p>
        </div>
      </div>
    </div>
  );
}
