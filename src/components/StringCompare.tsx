"use client";

import { useState, useCallback } from "react";
import { diffLines, diffChars, type Change } from "diff";
import { GitCompare, Eraser } from "lucide-react";
import { useI18n } from "@/i18n/context";

// ── Row in the side-by-side table ──────────────────────────────────────────
interface Row {
  left:  { text: string; chars?: Change[] } | null;
  right: { text: string; chars?: Change[] } | null;
  type:  "equal" | "changed" | "removed" | "added";
  lineL?: number;
  lineR?: number;
}

// ── Build aligned side-by-side rows ────────────────────────────────────────
function buildRows(leftText: string, rightText: string): Row[] {
  const changes = diffLines(leftText, rightText);
  const rows: Row[] = [];
  let lineL = 1, lineR = 1;

  let i = 0;
  while (i < changes.length) {
    const c = changes[i];

    if (!c.added && !c.removed) {
      const lines = splitLines(c.value);
      for (const line of lines) {
        rows.push({ left: { text: line }, right: { text: line }, type: "equal", lineL: lineL++, lineR: lineR++ });
      }
      i++;
      continue;
    }

    if (c.removed) {
      const next = changes[i + 1];
      if (next?.added) {
        // Pair removed + added → character-level diff per aligned row
        const removedLines = splitLines(c.value);
        const addedLines   = splitLines(next.value);
        const maxLen = Math.max(removedLines.length, addedLines.length);
        for (let j = 0; j < maxLen; j++) {
          const lText = removedLines[j];
          const rText = addedLines[j];
          if (lText !== undefined && rText !== undefined) {
            const chars = diffChars(lText, rText);
            rows.push({ left: { text: lText, chars }, right: { text: rText, chars }, type: "changed", lineL: lineL++, lineR: lineR++ });
          } else if (lText !== undefined) {
            rows.push({ left: { text: lText }, right: null, type: "removed", lineL: lineL++ });
          } else {
            rows.push({ left: null, right: { text: rText }, type: "added", lineR: lineR++ });
          }
        }
        i += 2;
        continue;
      }
      // Standalone removed block
      for (const line of splitLines(c.value)) {
        rows.push({ left: { text: line }, right: null, type: "removed", lineL: lineL++ });
      }
      i++;
      continue;
    }

    if (c.added) {
      for (const line of splitLines(c.value)) {
        rows.push({ left: null, right: { text: line }, type: "added", lineR: lineR++ });
      }
      i++;
      continue;
    }

    i++;
  }

  return rows;
}

function splitLines(s: string): string[] {
  return s.replace(/\n$/, "").split("\n");
}

// ── Render one cell's content with intra-line char highlights ───────────────
function CellContent({ text, chars, side }: { text: string; chars?: Change[]; side: "left" | "right" }) {
  if (!chars) return <>{text || "\u00a0"}</>;
  return (
    <>
      {chars.map((c, i) => {
        if (!c.added && !c.removed) return <span key={i}>{c.value}</span>;
        if (c.removed && side === "left") {
          return (
            <mark key={i} className="rounded-sm bg-red-300/80 dark:bg-red-600/60 text-red-900 dark:text-red-100">
              {c.value.replace(/ /g, "\u00b7")}
            </mark>
          );
        }
        if (c.added && side === "right") {
          return (
            <mark key={i} className="rounded-sm bg-green-300/80 dark:bg-green-600/60 text-green-900 dark:text-green-100">
              {c.value.replace(/ /g, "\u00b7")}
            </mark>
          );
        }
        return null; // skip the other side
      })}
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function StringCompare() {
  const { t } = useI18n();
  const [left, setLeft]   = useState("");
  const [right, setRight] = useState("");
  const [rows, setRows]   = useState<Row[] | null>(null);

  const handleCompare = useCallback(() => {
    setRows(buildRows(left, right));
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeft(""); setRight(""); setRows(null);
  }, []);

  const removedCount = rows?.filter((r) => r.type === "removed" || r.type === "changed").length ?? 0;
  const addedCount   = rows?.filter((r) => r.type === "added"   || r.type === "changed").length ?? 0;

  return (
    <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">

      {/* ── Two input textareas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-[35vh] md:h-[38vh]">
        {[
          { label: t("compareLeft"),  value: left,  onChange: setLeft,  placeholder: t("comparePlaceholderLeft")  },
          { label: t("compareRight"), value: right, onChange: setRight, placeholder: t("comparePlaceholderRight") },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label} className="flex flex-col bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-anthro-border dark:border-anthro-dark-border select-none">
              <span className="text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">{label}</span>
              {value && (
                <span className="text-[10px] font-mono text-anthro-mid/50">
                  {value.split("\n").length}L · {value.length}C
                </span>
              )}
            </div>
            <textarea
              value={value}
              onChange={(e) => { onChange(e.target.value); setRows(null); }}
              placeholder={placeholder}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 w-full p-4 resize-none text-sm bg-transparent text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed font-mono"
            />
          </div>
        ))}
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
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

        {rows && (
          <div className="flex items-center gap-3 ml-1 text-xs font-mono">
            {removedCount > 0 && <span className="text-red-500">−{removedCount} {t("compareLines")}</span>}
            {addedCount   > 0 && <span className="text-green-600 dark:text-green-400">+{addedCount} {t("compareLines")}</span>}
            {removedCount === 0 && addedCount === 0 && <span className="text-anthro-mid">{t("compareIdentical")}</span>}
          </div>
        )}
      </div>

      {/* ── Side-by-side diff table ── */}
      {rows ? (
        <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl">
          <table className="w-full text-xs font-mono border-collapse min-w-[600px]">
            <colgroup>
              <col className="w-10" />{/* line no L */}
              <col className="w-[calc(50%-2.5rem)]" />
              <col className="w-10" />{/* line no R */}
              <col className="w-[calc(50%-2.5rem)]" />
            </colgroup>
            <tbody>
              {rows.map((row, i) => {
                const isRemoved = row.type === "removed";
                const isAdded   = row.type === "added";
                const isChanged = row.type === "changed";
                const leftBg  = (isRemoved || isChanged) ? "bg-red-50 dark:bg-red-950/25"   : "";
                const rightBg = (isAdded   || isChanged) ? "bg-green-50 dark:bg-green-950/25" : "";
                return (
                  <tr key={i} className="border-b border-anthro-border/40 dark:border-anthro-dark-border/40 last:border-0">
                    {/* Left line number */}
                    <td className={`select-none text-right pr-3 pl-2 py-0.5 text-[10px] text-anthro-mid/40 border-r border-anthro-border dark:border-anthro-dark-border ${leftBg}`}>
                      {row.lineL ?? ""}
                    </td>
                    {/* Left content */}
                    <td className={`px-3 py-0.5 leading-5 whitespace-pre-wrap break-all border-r-2 border-anthro-border dark:border-anthro-dark-border ${leftBg} ${isRemoved || isChanged ? "text-red-900 dark:text-red-200" : "text-anthro-dark dark:text-anthro-light"}`}>
                      {row.left
                        ? <CellContent text={row.left.text} chars={row.left.chars} side="left" />
                        : <span className="text-anthro-mid/20">·</span>
                      }
                    </td>
                    {/* Right line number */}
                    <td className={`select-none text-right pr-3 pl-2 py-0.5 text-[10px] text-anthro-mid/40 border-r border-anthro-border dark:border-anthro-dark-border ${rightBg}`}>
                      {row.lineR ?? ""}
                    </td>
                    {/* Right content */}
                    <td className={`px-3 py-0.5 leading-5 whitespace-pre-wrap break-all ${rightBg} ${isAdded || isChanged ? "text-green-900 dark:text-green-200" : "text-anthro-dark dark:text-anthro-light"}`}>
                      {row.right
                        ? <CellContent text={row.right.text} chars={row.right.chars} side="right" />
                        : <span className="text-anthro-mid/20">·</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 min-h-[100px] flex items-center justify-center text-anthro-mid/50 text-sm font-heading">
          {t("compareEmptyHint")}
        </div>
      )}
    </div>
  );
}
