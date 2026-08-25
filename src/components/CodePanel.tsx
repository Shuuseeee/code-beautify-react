"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, Trash2, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type * as Monaco from "monaco-editor";
import { useMonaco } from "@monaco-editor/react";
import {
  registerServiceNowLanguage,
  registerGlassThemes,
  isServiceNowCode,
} from "@/lib/monacoServiceNow";
import { panel, panelHeader, eyebrow, meta, btnIcon, btnIconDanger, press } from "@/lib/ui";
import { langDot } from "@/lib/langColors";

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

  const monacoInstance = useMonaco();

  const handleBeforeMount = useCallback((monaco: typeof Monaco) => {
    registerServiceNowLanguage(monaco);
    registerGlassThemes(monaco);
  }, []);

  const handleMount = useCallback((editor: Monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  // Sync language on the model whenever it changes after mount.
  // setModelLanguage targets only this panel's model, so two panels don't interfere.
  useEffect(() => {
    if (!monacoInstance) return;
    const model = editorRef.current?.getModel();
    if (model) monacoInstance.editor.setModelLanguage(model, monacoLang);
  }, [monacoInstance, monacoLang]);

  return (
    <div className={`relative flex-1 ${panel} ${className}`}>
      {/* Header: name on the left, measurements and tools on the right. */}
      <div className={`${panelHeader} justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          {language && language !== "plaintext" && (
            <span
              aria-hidden
              className="h-[6px] w-[6px] rounded-full shrink-0"
              style={{ background: langDot(language) }}
            />
          )}
          <span className={eyebrow}>{label}</span>
          {isSnow && (
            <span className="px-1.5 h-[17px] inline-flex items-center rounded-[4px] border border-line text-2xs font-mono text-fg-muted">
              ServiceNow
            </span>
          )}
          {errorLine && (
            <button
              onClick={handleErrorBadgeClick}
              title="Jump to this line"
              className={`inline-flex items-center gap-1 px-1.5 h-[18px] rounded-[4px] text-2xs font-mono font-semibold text-danger bg-[var(--danger-wash)] hover:brightness-95 ${press}`}
            >
              <TriangleAlert size={9} strokeWidth={2.5} />
              L{errorLine}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <span className={meta}>
              {lineCount} ln · {charCount} ch
            </span>
          )}
          {value && (
            <div className="flex items-center gap-0.5 -mr-1">
              <button onClick={handleCopy} title={t("copy")} tabIndex={-1} className={btnIcon}>
                {copied
                  ? <Check size={13} strokeWidth={2.25} className="text-success" />
                  : <Copy size={13} strokeWidth={1.75} />}
              </button>
              <button onClick={onClear} title={t("clear")} tabIndex={-1} className={btnIconDanger}>
                <Trash2 size={13} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative flex-1 min-h-0">
        <MonacoEditor
          value={value}
          language={monacoLang}
          onChange={(val) => onChange?.(val ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
            fontLigatures: false,
            lineNumbers: "on",
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 8,
            automaticLayout: true,
            wordWrap: "on",
            padding: { top: 10, bottom: 12 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            guides: { indentation: true, highlightActiveIndentation: false },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
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
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
          height="100%"
        />

        {!value && placeholder && (
          <div className="absolute top-[10px] left-[52px] right-4 pointer-events-none select-none text-sm text-fg-faint font-mono">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
