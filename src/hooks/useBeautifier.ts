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
import LZString from "lz-string";

const AUTOSAVE_KEY = "beautify_autosave";

function encodeShare(text: string): string {
  return LZString.compressToEncodedURIComponent(text);
}

function decodeShare(encoded: string): string {
  return LZString.decompressFromEncodedURIComponent(encoded) ?? "";
}

export function useBeautifier() {
  const { t } = useI18n();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();

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
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef<{ input: string; output: string } | null>(null);

  // ── Restore from URL hash or auto-save on mount ──
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#share=(.+)/);
    if (match) {
      try {
        const decoded = decodeShare(match[1]);
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed.input === "string" && typeof parsed.output === "string") {
          setInput(parsed.input);
          setOutput(parsed.output);
          window.history.replaceState(null, "", window.location.pathname);
        }
      } catch {
        // ignore malformed hash
      }
    } else {
      try {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { input: string; output: string };
          if (parsed.input?.trim()) {
            draftRef.current = parsed;
            setHasDraft(true);
          }
        }
      } catch {
        // ignore storage errors or malformed JSON
      }
    }
  }, []);

  // ── Auto-save input (debounced 800ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (input.trim()) {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ input, output }));
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      } catch {
        // ignore quota errors
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [input, output]);

  const triggerShake = useCallback(() => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    setShakeInput(true);
    shakeTimer.current = setTimeout(() => setShakeInput(false), 500);
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
    (newMode: Mode) => {
      setMode(newMode);
      if (newMode === "auto" && input.trim()) {
        if (detectTimer.current) clearTimeout(detectTimer.current);
        detectTimer.current = setTimeout(async () => {
          const lang = await detectLanguage(input);
          setDetectedLang(lang === "plaintext" ? null : lang);
        }, 0);
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
    // Capture input at the moment the user triggered format to avoid
    // the value shifting under us during the async lang-detection await.
    const capturedInput = input;
    setIsFormatting(true);
    setErrorLine(null);
    try {
      const lang = await getEffectiveLang();
      if (!lang) {
        showError(t("langNotDetectedError"));
        return;
      }
      const result = formatCode(capturedInput, lang);
      setOutput(result);
      addEntry(capturedInput, result, lang);
      if (successTimer.current) clearTimeout(successTimer.current);
      setFormatSuccess(true);
      successTimer.current = setTimeout(() => setFormatSuccess(false), 1500);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : t("invalidCodeError");
      // Extract error line from parse errors (primarily JSON)
      let line: number | null = null;
      if (e instanceof Error) {
        const posMatch = e.message.match(/at position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1], 10);
          line = capturedInput.slice(0, pos).split("\n").length;
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
      const encoded = encodeShare(JSON.stringify({ input, output }));
      const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        if (shareTimer.current) clearTimeout(shareTimer.current);
        setShareCopied(true);
        shareTimer.current = setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => {
        showError(t("shareFailed"));
      });
    } catch {
      showError(t("shareFailed"));
    }
  }, [input, output, showError, t]);

  const handleRestoreDraft = useCallback(() => {
    const draft = draftRef.current;
    draftRef.current = null;
    setHasDraft(false);
    if (!draft) return;
    // Remove from localStorage so the banner doesn't reappear on the next page load
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
    setInput(draft.input);
    setOutput(draft.output);
    if (detectTimer.current) clearTimeout(detectTimer.current);
    detectTimer.current = setTimeout(async () => {
      const lang = await detectLanguage(draft.input);
      setDetectedLang(lang === "plaintext" ? null : lang);
    }, 0);
  }, []);

  const handleDismissDraft = useCallback(() => {
    draftRef.current = null;
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      // ignore
    }
    setHasDraft(false);
  }, []);

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setInput(entry.input);
    setOutput(entry.output);
    setErrorLine(null);
    if (detectTimer.current) clearTimeout(detectTimer.current);
    detectTimer.current = setTimeout(async () => {
      const lang = await detectLanguage(entry.input);
      setDetectedLang(lang === "plaintext" ? null : lang);
    }, 0);
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
    hasDraft,
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
    removeHistoryEntry: removeEntry,
    clearHistory,
    handleRestoreDraft,
    handleDismissDraft,
    setOutput,
    setDiffOpen,
    closeError: () => setError({ open: false, message: "" }),
  };
}
