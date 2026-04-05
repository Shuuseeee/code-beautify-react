"use client";

import Header from "@/components/Header";
import ModeSelector from "@/components/ModeSelector";
import CodePanel from "@/components/CodePanel";
import ActionPanel from "@/components/ActionPanel";
import DiffModal from "@/components/DiffModal";
import ErrorModal from "@/components/ErrorModal";
import OfflineBanner from "@/components/OfflineBanner";
import OnboardingModal from "@/components/OnboardingModal";
import { useTheme } from "@/hooks/useTheme";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useBeautifier } from "@/hooks/useBeautifier";
import { useI18n } from "@/i18n/context";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  const {
    input, output, mode, detectedLang, isFormatting,
    diffOpen, error,
    handleInputChange, clearInput,
    handleModeChange, handleFormat,
    handleRemoveComments, handleCompare, handleClearAll,
    setOutput, setDiffOpen, closeError,
  } = useBeautifier();

  return (
    <>
      <OfflineBanner visible={!isOnline} />
      <OnboardingModal />

      <div className="min-h-screen flex flex-col">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-3 md:px-4 py-4 md:py-6 gap-3 md:gap-4">
          <ModeSelector
            mode={mode}
            detectedLang={detectedLang}
            onChange={handleModeChange}
            theme={theme}
          />

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:flex-1 md:min-h-0">
            <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col">
              <CodePanel
                label={t("input")}
                value={input}
                onChange={handleInputChange}
                onClear={clearInput}
                placeholder={t("inputPlaceholder")}
              />
            </div>

            <ActionPanel
              onFormat={handleFormat}
              onCompare={handleCompare}
              onClearAll={handleClearAll}
              onRemoveComments={handleRemoveComments}
              isFormatting={isFormatting}
            />

            <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col">
              <CodePanel
                label={t("output")}
                value={output}
                onChange={setOutput}
                onClear={() => setOutput("")}
                placeholder={t("outputPlaceholder")}
              />
            </div>
          </div>
        </div>

        <footer className="py-5 text-center text-xs text-anthro-mid font-heading tracking-wide">
          Made with ♥ by Xingrui Zhou
        </footer>
      </div>

      <DiffModal
        open={diffOpen}
        original={input}
        modified={output}
        language={detectedLang ?? "javascript"}
        theme={theme}
        onClose={() => setDiffOpen(false)}
      />

      <ErrorModal
        open={error.open}
        message={error.message}
        onClose={closeError}
      />
    </>
  );
}
