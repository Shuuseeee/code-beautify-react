"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, Trash2, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/context";
import dynamic from "next/dynamic";
import type * as Monaco from "monaco-editor";
import { useMonaco } from "@monaco-editor/react";
import {
  registerGlassThemes,
  registerJsonColorProvider,
  isServiceNowCode,
} from "@/lib/monacoServiceNow";
import { registerServiceNowTypes } from "@/lib/servicenowTypes";
import { useThemeContext } from "@/hooks/ThemeContext";
import {
  panel, panelHeader, eyebrow, meta, btnIcon, btnIconDanger, press,
  EDITOR_FONT_FAMILY, EDITOR_FONT_SIZE, EDITOR_LINE_HEIGHT,
} from "@/lib/ui";
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
  const { theme } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  // Set once the user picks a language from the right-click menu; from then on
  // auto-detection stops overriding their choice.
  const manualLangRef = useRef<string | null>(null);

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
  // ServiceNow code renders as plain javascript, colored by injected type defs
  // (semantic highlighting). Auto-detection is skipped once the user manually
  // picks a language from the context menu.
  const monacoLang = isSnow ? "javascript" : (language ?? "plaintext");

  const monacoInstance = useMonaco();

  const handleBeforeMount = useCallback((monaco: typeof Monaco) => {
    registerServiceNowTypes(monaco);
    registerJsonColorProvider(monaco);
    registerGlassThemes(monaco);
  }, []);

  const handleMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;

      // Right-click: search selection on Google.
      editor.addAction({
        id: "search-google",
        label: "Search Google",
        contextMenuGroupId: "9_cutcopypaste",
        contextMenuOrder: 10,
        precondition: "editorHasSelection",
        run: (ed) => {
          const sel = ed.getSelection();
          const text = sel ? ed.getModel()?.getValueInRange(sel) : "";
          if (text) {
            window.open("https://www.google.com/search?q=" + encodeURIComponent(text));
          }
        },
      });

      // Right-click: manually set the editor language (locks out auto-detect).
      const languages: { id: string; label: string; lang: string }[] = [
        { id: "lang-javascript", label: "Set to JavaScript", lang: "javascript" },
        { id: "lang-json", label: "Set to JSON", lang: "json" },
        { id: "lang-html", label: "Set to HTML", lang: "html" },
        { id: "lang-xml", label: "Set to XML", lang: "xml" },
        { id: "lang-css", label: "Set to CSS", lang: "css" },
        { id: "lang-graphql", label: "Set to GraphQL", lang: "graphql" },
        { id: "lang-powershell", label: "Set to PowerShell", lang: "powershell" },
        { id: "lang-plain", label: "Set to Plain text", lang: "plaintext" },
      ];
      languages.forEach(({ id, label, lang }, i) => {
        editor.addAction({
          id,
          label,
          contextMenuGroupId: "z_lang",
          contextMenuOrder: i,
          run: (ed) => {
            const model = ed.getModel();
            if (!model) return;
            manualLangRef.current = lang;
            monaco.editor.setModelLanguage(model, lang);
          },
        });
      });
    },
    []
  );

  // Sync language on the model whenever it changes after mount.
  // setModelLanguage targets only this panel's model, so two panels don't interfere.
  useEffect(() => {
    if (!monacoInstance) return;
    if (manualLangRef.current) return; // user locked the language via the menu
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
          theme={theme === "dark" ? "pierre-dark" : "pierre-light"}
          onChange={(val) => onChange?.(val ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: EDITOR_FONT_SIZE,
            lineHeight: EDITOR_LINE_HEIGHT,
            fontFamily: EDITOR_FONT_FAMILY,
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
            contextmenu: true,
            colorDecorators: true,
            "semanticHighlighting.enabled": true,
            bracketPairColorization: { enabled: true },
            formatOnType: true,
            formatOnPaste: true,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: "off",
            tabCompletion: "off",
            wordBasedSuggestions: "off",
            renderWhitespace: "none",
            folding: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
          height="100%"
        />

        {!value && placeholder && (
          <div
            className="absolute top-[10px] left-[52px] right-4 pointer-events-none select-none text-fg-faint"
            style={{
              fontFamily: EDITOR_FONT_FAMILY,
              fontSize: EDITOR_FONT_SIZE,
              lineHeight: `${EDITOR_LINE_HEIGHT}px`,
            }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
