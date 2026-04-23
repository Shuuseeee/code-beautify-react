"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, Trash2, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type * as Monaco from "monaco-editor";
import {
  registerServiceNowLanguage,
  registerGlassThemes,
  isServiceNowCode,
} from "@/lib/monacoServiceNow";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <div className="flex-1" /> }
);

interface CodePanelProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onClear: () => void;
  readOnly?: boolean;
  placeholder?: string;
  scrollTopOnChange?: boolean;
  className?: string;
  errorLine?: number | null;
  language?: string;
  theme?: "light" | "dark";
}

export default function CodePanel({
  label,
  value,
  onChange,
  onClear,
  readOnly = false,
  placeholder,
  scrollTopOnChange = false,
  className = "",
  errorLine = null,
  language,
  theme = "light",
}: CodePanelProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (scrollTopOnChange && editorRef.current) {
      editorRef.current.revealLine(1);
    }
  }, [value, scrollTopOnChange]);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handleErrorBadgeClick = useCallback(() => {
    if (!errorLine || !editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;
    const target = Math.min(errorLine, model.getLineCount());
    editor.revealLineInCenter(target);
    editor.setSelection({
      startLineNumber: target,
      startColumn: 1,
      endLineNumber: target,
      endColumn: model.getLineLength(target) + 1,
    });
    editor.focus();
  }, [errorLine]);

  const lineCount = value ? value.split("\n").length : 0;
  const charCount = value.length;

  const isSnow = isServiceNowCode(value);
  const monacoLang = isSnow ? "servicenow" : (language ?? "plaintext");
  const monacoTheme = isSnow
    ? (theme === "dark" ? "glass-snow-dark" : "glass-snow-light")
    : (theme === "dark" ? "glass-dark" : "glass-light");

  const handleBeforeMount = useCallback((monaco: typeof Monaco) => {
    registerServiceNowLanguage(monaco);
    registerGlassThemes(monaco);
  }, []);

  const handleMount = useCallback((editor: Monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  return (
    <div
      className={`relative flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--panel-border)",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-black/[0.04] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.03] select-none shrink-0">
        <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
          {label}
        </span>
        {value && (
          <span className="text-[10px] font-mono text-anthro-mid/50">
            {lineCount}L · {charCount}C
          </span>
        )}
        {errorLine && (
          <button
            onClick={handleErrorBadgeClick}
            title="Click to jump to error line"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/25 transition-colors"
          >
            <TriangleAlert size={10} />
            L{errorLine}
          </button>
        )}
      </div>

      {/* Editor area */}
      <div className="relative flex-1 min-h-0">
        <MonacoEditor
          value={value}
          language={monacoLang}
          theme={monacoTheme}
          onChange={(val) => onChange?.(val ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 10, bottom: 10 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              alwaysConsumeMouseWheel: false,
            },
            renderLineHighlight: "line",
            contextmenu: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: "off",
            tabCompletion: "off",
            wordBasedSuggestions: "off",
            renderWhitespace: "none",
            folding: false,
          }}
          height="100%"
        />
        {/* Placeholder overlay — shown only when empty */}
        {!value && placeholder && (
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none select-none pt-[10px] pl-[52px] text-sm text-anthro-mid/40"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Utility buttons — only shown when panel has content */}
      {value && (
        <div className="absolute top-0 right-0 h-10 flex items-center gap-0.5 pr-1.5 z-10">
          <button
            onClick={handleCopy}
            title={t("copy")}
            tabIndex={-1}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-[#007AFF] hover:bg-[#007AFF]/8 dark:hover:bg-[#007AFF]/12 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={onClear}
            title={t("clear")}
            tabIndex={-1}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
