"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  detectLanguage,
  formatCode,
  removeHtmlComments,
  removeJsComments,
  type DetectedLang,
  type Mode,
} from "@/lib/formatter";
import { useI18n } from "@/i18n/context";

export function useBeautifier() {
  const { t } = useI18n();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [detectedLang, setDetectedLang] = useState<DetectedLang | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const showError = useCallback((msg: string) => setError({ open: true, message: msg }), []);

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

  const clearInput = useCallback(() => {
    setInput("");
    setDetectedLang(null);
  }, []);

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
    setIsFormatting(true);
    try {
      const lang = await getEffectiveLang();
      if (!lang) { showError(t("invalidCodeError")); return; }
      setOutput(formatCode(input, lang));
    } catch (e) {
      showError(e instanceof Error ? e.message : t("invalidCodeError"));
    } finally {
      setIsFormatting(false);
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

  // ── Keyboard shortcuts (stable via refs to avoid listener churn) ──
  const formatRef     = useRef(handleFormat);
  const compareRef    = useRef(handleCompare);
  const clearAllRef   = useRef(handleClearAll);
  useEffect(() => { formatRef.current   = handleFormat;   }, [handleFormat]);
  useEffect(() => { compareRef.current  = handleCompare;  }, [handleCompare]);
  useEffect(() => { clearAllRef.current = handleClearAll; }, [handleClearAll]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "Enter") {
        e.preventDefault();
        formatRef.current();
      } else if (e.shiftKey && e.key === "D") {
        e.preventDefault();
        compareRef.current();
      } else if (e.shiftKey && e.key === "K") {
        e.preventDefault();
        clearAllRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    input,
    output,
    mode,
    detectedLang,
    isFormatting,
    diffOpen,
    error,
    handleInputChange,
    clearInput,
    handleModeChange,
    handleFormat,
    handleRemoveComments,
    handleCompare,
    handleClearAll,
    setOutput,
    setDiffOpen,
    closeError: () => setError({ open: false, message: "" }),
  };
}
