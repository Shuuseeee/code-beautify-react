"use client";

import ModeSelector from "@/components/ModeSelector";
import CodePanel from "@/components/CodePanel";
import ActionPanel from "@/components/ActionPanel";
import DiffModal from "@/components/DiffModal";
import ErrorModal from "@/components/ErrorModal";
import { useThemeContext } from "@/hooks/ThemeContext";
import { useBeautifier } from "@/hooks/useBeautifier";
import { useI18n } from "@/i18n/context";

export default function HomePage() {
  const { theme } = useThemeContext();
  const { t } = useI18n();

  const {
    input, output, mode, detectedLang, isFormatting, formatSuccess,
    shakeInput, diffOpen, error, errorLine, shareCopied, history,
    handleInputChange, clearInput,
    handleModeChange, handleFormat,
    handleRemoveComments, handleCompare, handleClearAll,
    handleShare, handleRestoreHistory, removeHistoryEntry, clearHistory,
    setOutput, setDiffOpen, closeError,
  } = useBeautifier();

  return (
    <>
      <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-3 md:px-4 py-4 md:py-6 gap-3 md:gap-4">
        <ModeSelector
          mode={mode}
          detectedLang={detectedLang}
          onChange={handleModeChange}
          theme={theme}
        />

        {/*
          DOM order: Left → Right → ActionPanel
          Desktop visual order (via CSS order): Left(1) → ActionPanel(2) → Right(3)
          This gives the tab sequence: left textarea → right textarea → action buttons
        */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:flex-1 md:min-h-0">
          {/* Left panel — DOM first, visual first */}
          <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col md:order-1">
            <CodePanel
              label={t("input")}
              value={input}
              onChange={handleInputChange}
              onClear={clearInput}
              placeholder={t("inputPlaceholder")}
              className={shakeInput ? "shake" : ""}
              errorLine={errorLine}
              language={detectedLang ?? "plaintext"}
              theme={theme}
            />
          </div>

          {/* Right panel — DOM second (tab order), visual right on desktop (order-3) */}
          <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col md:order-3">
            <CodePanel
              label={t("output")}
              value={output}
              onChange={setOutput}
              onClear={() => setOutput("")}
              placeholder={t("outputPlaceholder")}
              scrollTopOnChange
              language={detectedLang ?? "plaintext"}
              theme={theme}
            />
          </div>

          {/* ActionPanel — DOM third, visual middle on desktop (order-2) */}
          <div className="md:order-2">
            <ActionPanel
              onFormat={handleFormat}
              onCompare={handleCompare}
              onClearAll={handleClearAll}
              onRemoveComments={handleRemoveComments}
              onShare={handleShare}
              isFormatting={isFormatting}
              formatSuccess={formatSuccess}
              shareCopied={shareCopied}
              history={history}
              onRestoreHistory={handleRestoreHistory}
              onRemoveHistory={removeHistoryEntry}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </div>

      <footer className="py-5 text-center text-xs text-anthro-mid font-heading tracking-wide">
        Made with ♥ by Xingrui Zhou
      </footer>

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
