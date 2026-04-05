"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import OnboardingModal from "@/components/OnboardingModal";
import { useTheme } from "@/hooks/useTheme";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const ONBOARDING_KEY = "cb_onboarded_v1";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
        {children}
      </div>
    </>
  );
}
