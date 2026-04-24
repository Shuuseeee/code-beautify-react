"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import OfflineBanner from "@/components/OfflineBanner";
import OnboardingModal from "@/components/OnboardingModal";
import { ThemeProvider, useThemeContext } from "@/hooks/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const ONBOARDING_KEY = "cb_onboarded_v1";

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useThemeContext();
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
        <footer className="flex justify-center items-center gap-2 py-4 select-none">
          {/* Anthropic / Claude asterisk logo */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#D97757" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-3 0v-4A1.5 1.5 0 0 1 12 2Zm0 13a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-3 0v-4A1.5 1.5 0 0 1 12 15Zm10-3a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1 0-3h4A1.5 1.5 0 0 1 22 12ZM9 12a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1 0-3h4A1.5 1.5 0 0 1 9 12Zm9.95-6.95a1.5 1.5 0 0 1 0 2.12l-2.83 2.83a1.5 1.5 0 0 1-2.12-2.12l2.83-2.83a1.5 1.5 0 0 1 2.12 0ZM9.9 15.05a1.5 1.5 0 0 1 0 2.12l-2.83 2.83a1.5 1.5 0 0 1-2.12-2.12l2.83-2.83a1.5 1.5 0 0 1 2.12 0Zm9.07 4.9a1.5 1.5 0 0 1-2.12 0l-2.83-2.83a1.5 1.5 0 0 1 2.12-2.12l2.83 2.83a1.5 1.5 0 0 1 0 2.12ZM9.9 8.95a1.5 1.5 0 0 1-2.12 0L4.95 6.12a1.5 1.5 0 0 1 2.12-2.12L9.9 6.83a1.5 1.5 0 0 1 0 2.12Z"/>
          </svg>
          <span className="text-[11px] text-anthro-mid/50 font-heading tracking-wide">
            Co-created with Claude Code
          </span>
        </footer>
      </div>
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </ThemeProvider>
  );
}
