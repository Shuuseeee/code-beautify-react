"use client";

import { useState, useCallback } from "react";
import { diffLines, diffChars, type Change } from "diff";
import { GitCompare, Eraser } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface DiffLine {
  type: "equal" | "removed" | "added";
  text: string;
  charChanges?: Change[]; // for intra-line char diff
}

function computeDiff(left: string, right: string): DiffLine[] {
  const changes = diffLines(left, right);
  const result: DiffLine[] = [];

  for (let i = 0; i < changes.length; i++) {
    const c = changes[i];

    if (!c.added && !c.removed) {
      // Unchanged — split into lines preserving blank lines
      const lines = c.value.replace(/\n$/, "").split("\n");
      for (const line of lines) {
        result.push({ type: "equal", text: line });
      }
    } else if (c.removed) {
      const next = changes[i + 1];
      if (next?.added) {
        // Paired removed/added → character-level diff
        const charChanges = diffChars(c.value, next.value);
        const removedLines = c.value.replace(/\n$/, "").split("\n");
        const addedLines = next.value.replace(/\n$/, "").split("\n");
        for (const line of removedLines) {
          result.push({ type: "removed", text: line, charChanges });
        }
        for (const line of addedLines) {
          result.push({ type: "added", text: line, charChanges });
        }
        i++; // consumed next
      } else {
        const lines = c.value.replace(/\n$/, "").split("\n");
        for (const line of lines) {
          result.push({ type: "removed", text: line });
        }
      }
    } else if (c.added) {
      const lines = c.value.replace(/\n$/, "").split("\n");
      for (const line of lines) {
        result.push({ type: "added", text: line });
      }
    }
  }

  return result;
}

function IntraLineDiff({ text, changes, side }: { text: string; changes: Change[]; side: "removed" | "added" }) {
  // Reconstruct this line's characters from charChanges
  // We highlight only the chars that changed
  return (
    <span>
      {changes.map((c, i) => {
        if (c.removed && side === "removed") {
          return (
            <mark key={i} className="bg-red-300 dark:bg-red-700/70 text-red-900 dark:text-red-100 rounded-sm">
              {c.value}
            </mark>
          );
        }
        if (c.added && side === "added") {
          return (
            <mark key={i} className="bg-green-300 dark:bg-green-700/70 text-green-900 dark:text-green-100 rounded-sm">
              {c.value}
            </mark>
          );
        }
        if (!c.added && !c.removed) {
          return <span key={i}>{c.value}</span>;
        }
        return null;
      })}
    </span>
  );
}

export default function StringCompare() {
  const { t } = useI18n();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null);

  const handleCompare = useCallback(() => {
    if (!left && !right) return;
    setDiffLines(computeDiff(left, right));
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeft("");
    setRight("");
    setDiffLines(null);
  }, []);

  const removedCount = diffLines?.filter((l) => l.type === "removed").length ?? 0;
  const addedCount = diffLines?.filter((l) => l.type === "added").length ?? 0;

  return (
    <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
      {/* Two input panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-[35vh] md:h-[40vh]">
        {/* Left */}
        <div className="flex flex-col bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
            <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
              {t("compareLeft")}
            </span>
            {left && (
              <span className="text-[10px] font-mono text-anthro-mid/50">
                {left.split("\n").length}L · {left.length}C
              </span>
            )}
          </div>
          <textarea
            value={left}
            onChange={(e) => { setLeft(e.target.value); setDiffLines(null); }}
            placeholder={t("comparePlaceholderLeft")}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 w-full p-4 resize-none text-sm bg-transparent text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed font-mono"
          />
        </div>

        {/* Right */}
        <div className="flex flex-col bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
            <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
              {t("compareRight")}
            </span>
            {right && (
              <span className="text-[10px] font-mono text-anthro-mid/50">
                {right.split("\n").length}L · {right.length}C
              </span>
            )}
          </div>
          <textarea
            value={right}
            onChange={(e) => { setRight(e.target.value); setDiffLines(null); }}
            placeholder={t("comparePlaceholderRight")}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 w-full p-4 resize-none text-sm bg-transparent text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCompare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066CC] text-white text-sm font-semibold font-heading transition-colors shadow-sm"
        >
          <GitCompare size={15} />
          <span>{t("compareCode")}</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-anthro-border dark:border-anthro-dark-border bg-white dark:bg-anthro-surface text-anthro-mid hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium font-heading transition-colors"
        >
          <Eraser size={15} />
          <span>{t("clearAll")}</span>
        </button>

        {/* Stats */}
        {diffLines && (
          <div className="flex items-center gap-3 ml-2 text-xs font-mono">
            {removedCount > 0 && (
              <span className="text-red-500">−{removedCount} {t("compareLines")}</span>
            )}
            {addedCount > 0 && (
              <span className="text-green-600 dark:text-green-400">+{addedCount} {t("compareLines")}</span>
            )}
            {removedCount === 0 && addedCount === 0 && (
              <span className="text-anthro-mid">{t("compareIdentical")}</span>
            )}
          </div>
        )}
      </div>

      {/* Diff output */}
      {diffLines && (
        <div className="flex-1 min-h-0 bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <tbody>
              {diffLines.map((line, i) => {
                const isRemoved = line.type === "removed";
                const isAdded = line.type === "added";
                return (
                  <tr
                    key={i}
                    className={
                      isRemoved
                        ? "bg-red-50 dark:bg-red-950/30"
                        : isAdded
                        ? "bg-green-50 dark:bg-green-950/30"
                        : ""
                    }
                  >
                    {/* Gutter */}
                    <td className={`select-none w-6 text-center text-[11px] font-semibold border-r py-0.5 shrink-0 ${
                      isRemoved
                        ? "text-red-400 border-red-200 dark:border-red-800/50 bg-red-100/60 dark:bg-red-900/20"
                        : isAdded
                        ? "text-green-500 border-green-200 dark:border-green-800/50 bg-green-100/60 dark:bg-green-900/20"
                        : "text-anthro-mid/30 border-anthro-border dark:border-anthro-dark-border"
                    }`}>
                      {isRemoved ? "−" : isAdded ? "+" : " "}
                    </td>
                    {/* Content */}
                    <td className={`px-4 py-0.5 whitespace-pre-wrap break-all leading-5 ${
                      isRemoved
                        ? "text-red-800 dark:text-red-200"
                        : isAdded
                        ? "text-green-800 dark:text-green-200"
                        : "text-anthro-dark dark:text-anthro-light"
                    }`}>
                      {line.charChanges ? (
                        <IntraLineDiff text={line.text} changes={line.charChanges} side={line.type as "removed" | "added"} />
                      ) : (
                        line.text || "\u00a0"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!diffLines && (
        <div className="flex-1 min-h-[120px] flex items-center justify-center text-anthro-mid/50 text-sm font-heading">
          {t("compareEmptyHint")}
        </div>
      )}
    </div>
  );
}
