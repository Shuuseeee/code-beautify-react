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
import { useHistory, type HistoryEntry } from "./useHistory";

const AUTOSAVE_KEY = "beautify_autosave";

function encodeShare(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

function decodeShare(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function useBeautifier() {
  const { t } = useI18n();
  const { history, addEntry, clearHistory } = useHistory();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [detectedLang, setDetectedLang] = useState<DetectedLang | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Restore from URL hash or auto-save on mount ──
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#share=(.+)/);
    if (match) {
      try {
        const decoded = decodeShare(match[1]);
        setInput(decoded);
        window.history.replaceState(null, "", window.location.pathname);
      } catch {
        // ignore malformed hash
      }
    } else {
      try {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) setInput(saved);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  // ── Auto-save input (debounced 800ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (input.trim()) {
          localStorage.setItem(AUTOSAVE_KEY, input);
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } catch {
        // ignore quota errors
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [input]);

  const triggerShake = useCallback(() => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
  }, []);

  const showError = useCallback(
    (msg: string) => {
      setError({ open: true, message: msg });
      triggerShake();
    },
    [triggerShake]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      setErrorLine(null);
      if (detectTimer.current) clearTimeout(detectTimer.current);
      if (mode === "auto" && value.trim()) {
        detectTimer.current = setTimeout(async () => {
          const lang = await detectLanguage(value);
          setDetectedLang(lang === "plaintext" ? null : lang);
        }, 400);
      } else if (!value.trim()) {
        setDetectedLang(null);
      }
    },
    [mode]
  );

  const clearInput = useCallback(() => {
    setInput("");
    setDetectedLang(null);
    setErrorLine(null);
    if (detectTimer.current) clearTimeout(detectTimer.current);
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
    setErrorLine(null);
    try {
      const lang = await getEffectiveLang();
      if (!lang) {
        showError(t("langNotDetectedError"));
        return;
      }
      const result = formatCode(input, lang);
      setOutput(result);
      addEntry(input, result, lang);
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 1500);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : t("invalidCodeError");
      // Extract error line from parse errors (primarily JSON)
      let line: number | null = null;
      if (e instanceof Error) {
        const posMatch = e.message.match(/at position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1], 10);
          line = input.slice(0, pos).split("\n").length;
        } else {
          const lineMatch = e.message.match(/\bline\s+(\d+)/i);
          if (lineMatch) line = parseInt(lineMatch[1], 10);
        }
      }
      setErrorLine(line);
      showError(errMsg);
    } finally {
      setIsFormatting(false);
    }
  }, [input, getEffectiveLang, showError, t, addEntry]);

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
    const lang = mode !== "auto" ? mode : (detectedLang ?? "javascript");
    addEntry(input, output, lang);
    setDiffOpen(true);
  }, [input, output, mode, detectedLang, addEntry]);

  const handleClearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setDetectedLang(null);
    setMode("auto");
    setErrorLine(null);
    if (detectTimer.current) clearTimeout(detectTimer.current);
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleShare = useCallback(() => {
    if (!input.trim()) return;
    try {
      const encoded = encodeShare(input);
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    } catch {
      // ignore clipboard errors
    }
  }, [input]);

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setInput(entry.input);
    setOutput(entry.output);
    setErrorLine(null);
  }, []);

  // ── Keyboard shortcuts (stable via refs to avoid listener churn) ──
  const formatRef   = useRef(handleFormat);
  const compareRef  = useRef(handleCompare);
  const clearAllRef = useRef(handleClearAll);
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
    formatSuccess,
    shakeInput,
    diffOpen,
    error,
    errorLine,
    shareCopied,
    history,
    handleInputChange,
    clearInput,
    handleModeChange,
    handleFormat,
    handleRemoveComments,
    handleCompare,
    handleClearAll,
    handleShare,
    handleRestoreHistory,
    clearHistory,
    setOutput,
    setDiffOpen,
    closeError: () => setError({ open: false, message: "" }),
  };
}
