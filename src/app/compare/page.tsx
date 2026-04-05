"use client";

import Header from "@/components/Header";
import StringCompare from "@/components/StringCompare";
import OfflineBanner from "@/components/OfflineBanner";
import { useTheme } from "@/hooks/useTheme";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useState, useEffect } from "react";
import OnboardingModal from "@/components/OnboardingModal";

const ONBOARDING_KEY = "cb_onboarded_v1";

export default function ComparePage() {
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      const id = setTimeout(() => setHelpOpen(true), 400);
      return () => clearTimeout(id);
    }
  }, []);

  function closeHelp() {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setHelpOpen(false);
  }

  return (
    <>
      <OfflineBanner visible={!isOnline} />
      <OnboardingModal open={helpOpen} onClose={closeHelp} />

      <div className="min-h-screen flex flex-col">
        <Header theme={theme} onToggleTheme={toggleTheme} onHelp={() => setHelpOpen(true)} />

        <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-3 md:px-4 py-4 md:py-6 gap-3 md:gap-4 min-h-0">
          <StringCompare />
        </div>

        <footer className="py-5 text-center text-xs text-anthro-mid font-heading tracking-wide">
          Made with ♥ by Xingrui Zhou
        </footer>
      </div>
    </>
  );
}
