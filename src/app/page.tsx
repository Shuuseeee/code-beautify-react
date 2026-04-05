"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ModeSelector from "@/components/ModeSelector";
import CodePanel from "@/components/CodePanel";
import ActionPanel from "@/components/ActionPanel";
import DiffModal from "@/components/DiffModal";
import ErrorModal from "@/components/ErrorModal";
import OfflineBanner from "@/components/OfflineBanner";
import { useTheme } from "@/hooks/useTheme";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useI18n } from "@/i18n/context";
import {
  detectLanguage,
  formatCode,
  removeHtmlComments,
  removeJsComments,
  type DetectedLang,
} from "@/lib/formatter";

type Mode = "auto" | DetectedLang;

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [detectedLang, setDetectedLang] = useState<DetectedLang | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const showError = useCallback((msg: string) => {
    setError({ open: true, message: msg });
  }, []);

  const handleInputChange = useCallback(
    async (value: string) => {
      setInput(value);
      if (mode === "auto" && value.trim()) {
        const lang = await detectLanguage(value);
        setDetectedLang(lang === "plaintext" ? null : lang);
      } else if (!value.trim()) {
        setDetectedLang(null);
      }
    },
    [mode]
  );

  const handleModeChange = useCallback(
    async (newMode: Mode) => {
      setMode(newMode);
      if (newMode === "auto" && input.trim()) {
        const lang = await detectLanguage(input);
        setDetectedLang(lang === "plaintext" ? null : lang);
      }
    },
    [input]
  );

  const getEffectiveLang = useCallback(async (): Promise<DetectedLang | null> => {
    if (mode !== "auto") return mode as DetectedLang;
    if (detectedLang) return detectedLang;
    if (input.trim()) {
      const lang = await detectLanguage(input);
      return lang === "plaintext" ? null : lang;
    }
    return null;
  }, [mode, detectedLang, input]);

  const handleFormat = useCallback(async () => {
    if (!input.trim()) return;
    const lang = await getEffectiveLang();
    if (!lang) {
      showError(t("invalidCodeError"));
      return;
    }
    try {
      setOutput(formatCode(input, lang));
    } catch (e) {
      showError(e instanceof Error ? e.message : t("invalidCodeError"));
    }
  }, [input, getEffectiveLang, showError, t]);

  const handleRemoveComments = useCallback(
    (type: "html" | "js") => {
      if (!input.trim()) return;
      try {
        setOutput(type === "html" ? removeHtmlComments(input) : removeJsComments(input));
      } catch (e) {
        showError(e instanceof Error ? e.message : t("invalidCodeError"));
      }
    },
    [input, showError, t]
  );

  const handleCompare = useCallback(() => {
    if (!input.trim() || !output.trim()) return;
    setDiffOpen(true);
  }, [input, output]);

  const handleClearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setDetectedLang(null);
    setMode("auto");
  }, []);

  return (
    <>
      <OfflineBanner visible={!isOnline} />
      <div className="min-h-screen flex flex-col">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-3 md:px-4 py-4 md:py-6 gap-3 md:gap-4">
          <ModeSelector mode={mode} detectedLang={detectedLang} onChange={handleModeChange} />

          {/* Mobile: column stack / Desktop: three-column row */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:flex-1 md:min-h-0">
            {/* Input panel — fixed height on mobile, flex-1 on desktop */}
            <div className="h-[40vh] md:h-auto md:flex-1 md:min-h-0 flex flex-col">
              <CodePanel
                label={t("input")}
                value={input}
                onChange={handleInputChange}
                onClear={() => {
                  setInput("");
                  setDetectedLang(null);
                }}
                placeholder={t("inputPlaceholder")}
              />
            </div>

            <ActionPanel
              onFormat={handleFormat}
              onCompare={handleCompare}
              onClearAll={handleClearAll}
              onRemoveComments={handleRemoveComments}
            />

            {/* Output panel */}
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
        onClose={() => setError({ open: false, message: "" })}
      />
    </>
  );
}
