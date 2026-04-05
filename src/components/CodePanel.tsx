"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
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
}: CodePanelProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to top when value changes (for output panel after format)
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

  // Stats for header
  const lineCount = value ? value.split("\n").length : 0;
  const charCount = value.length;

  return (
    <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden ${className}`}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
            {label}
          </span>
          {value && (
            <span className="text-[10px] font-mono text-anthro-mid/50">
              {lineCount}L · {charCount}C
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCopy}
            title={t("copy")}
            className="p-1.5 rounded-lg text-anthro-mid hover:text-[#007AFF] hover:bg-[#007AFF]/8 dark:hover:bg-[#007AFF]/12 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
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

      {/* Textarea */}
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
    </div>
  );
}
