"use client";

import { useEffect } from "react";
import ModeSelector from "@/components/ModeSelector";
import CodePanel from "@/components/CodePanel";
import ActionPanel from "@/components/ActionPanel";
import DiffModal from "@/components/DiffModal";
import ErrorModal from "@/components/ErrorModal";
import { useThemeContext } from "@/hooks/ThemeContext";
import { useBeautifier } from "@/hooks/useBeautifier";
import { useI18n } from "@/i18n/context";
import { useShakeAnimation } from "@/hooks/useShakeAnimation";
import { useMonaco } from "@monaco-editor/react";
import { isServiceNowCode } from "@/lib/monacoServiceNow";

export default function HomePage() {
  const { theme } = useThemeContext();
  const { t } = useI18n();
  const { elementRef: shakeRef, triggerShake } = useShakeAnimation();

  const {
    input, output, mode, detectedLang, isFormatting, formatSuccess,
    shakeInput, diffOpen, error, errorLine, shareCopied, history,
    handleInputChange, clearInput,
    handleModeChange, handleFormat,
    handleRemoveComments, handleCompare, handleClearAll,
    handleShare, handleRestoreHistory, removeHistoryEntry, clearHistory,
    setOutput, setDiffOpen, closeError,
  } = useBeautifier();

  useEffect(() => {
    if (shakeInput) triggerShake();
  }, [shakeInput, triggerShake]);

  const monacoInstance = useMonaco();
  const isSnow = isServiceNowCode(input) || isServiceNowCode(output);
  useEffect(() => {
    if (!monacoInstance) return;
    const themeName = isSnow
      ? (theme === "dark" ? "pierre-snow-dark" : "pierre-snow-light")
      : (theme === "dark" ? "pierre-dark" : "pierre-light");
    monacoInstance.editor.setTheme(themeName);
  }, [monacoInstance, theme, isSnow]);

  return (
    <>
      <div className="flex-1 flex flex-col max-w-[1500px] mx-auto w-full px-3 md:px-4 py-3 md:py-4 gap-3">
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
        <div className="flex flex-col md:flex-row gap-3 md:flex-1 md:min-h-0">
          {/* Left panel — DOM first, visual first */}
          <div ref={shakeRef} className="h-[38vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col md:order-1">
            <CodePanel
              label={t("input")}
              value={input}
              onChange={handleInputChange}
              onClear={clearInput}
              placeholder={t("inputPlaceholder")}
              errorLine={errorLine}
              language={detectedLang ?? "plaintext"}
            />
          </div>

          {/* Right panel — DOM second (tab order), visual right on desktop (order-3) */}
          <div className="h-[38vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col md:order-3">
            <CodePanel
              label={t("output")}
              value={output}
              onChange={setOutput}
              onClear={() => setOutput("")}
              placeholder={t("outputPlaceholder")}
              scrollTopOnChange
              language={detectedLang ?? "plaintext"}
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
