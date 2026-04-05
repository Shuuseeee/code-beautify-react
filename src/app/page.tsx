"use client";

import ModeSelector from "@/components/ModeSelector";
import CodePanel from "@/components/CodePanel";
import ActionPanel from "@/components/ActionPanel";
import DiffModal from "@/components/DiffModal";
import ErrorModal from "@/components/ErrorModal";
import { useTheme } from "@/hooks/useTheme";
import { useBeautifier } from "@/hooks/useBeautifier";
import { useI18n } from "@/i18n/context";

export default function HomePage() {
  const { theme } = useTheme();
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

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:flex-1 md:min-h-0">
          <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col">
            <CodePanel
              label={t("input")}
              value={input}
              onChange={handleInputChange}
              onClear={clearInput}
              placeholder={t("inputPlaceholder")}
              className={shakeInput ? "shake" : ""}
              errorLine={errorLine}
            />
          </div>

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

          <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col">
            <CodePanel
              label={t("output")}
              value={output}
              onChange={setOutput}
              onClear={() => setOutput("")}
              placeholder={t("outputPlaceholder")}
              scrollTopOnChange
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
