"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, Trash2, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/context";

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
}: CodePanelProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollTopOnChange && textareaRef.current) {
      textareaRef.current.scrollTop = 0;
    }
  }, [value, scrollTopOnChange]);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const handleErrorBadgeClick = useCallback(() => {
    if (!errorLine || !textareaRef.current) return;
    const ta = textareaRef.current;
    const lines = ta.value.split("\n");
    const targetLine = Math.min(errorLine, lines.length) - 1;
    let pos = 0;
    for (let i = 0; i < targetLine; i++) {
      pos += lines[i].length + 1;
    }
    const lineEnd = pos + (lines[targetLine]?.length ?? 0);
    ta.focus();
    ta.setSelectionRange(pos, lineEnd);
    ta.scrollTop = Math.max(0, targetLine * 20 - 60);
  }, [errorLine]);

  const lineCount = value ? value.split("\n").length : 0;
  const charCount = value.length;

  return (
    // `relative` allows the utility buttons to be placed after the textarea in DOM
    // (better tab order: textarea first) while visually floating them in the header area.
    <div className={`relative flex-1 flex flex-col min-w-0 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden ${className}`}>

      {/* Panel header — only non-interactive content + contextual error badge */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
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

      {/* Textarea — comes before utility buttons in DOM for correct tab order */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`flex-1 w-full p-4 resize-none text-sm text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed ${
          readOnly
            ? "bg-anthro-light/60 dark:bg-anthro-dark/40 cursor-default"
            : "bg-transparent"
        }`}
      />

      {/* Utility buttons — DOM after textarea (tabbed last), visually in the header via absolute */}
      <div className="absolute top-0 right-0 h-10 flex items-center gap-0.5 pr-1.5 z-10">
        <button
          onClick={handleCopy}
          title={t("copy")}
          className="p-1.5 rounded-lg text-anthro-mid hover:text-[#007AFF] hover:bg-[#007AFF]/8 dark:hover:bg-[#007AFF]/12 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
        <button
          onClick={onClear}
          title={t("clear")}
          className="p-1.5 rounded-lg text-anthro-mid hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
