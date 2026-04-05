"use client";

import { useState, useCallback } from "react";
import { diffLines, diffChars, type Change } from "diff";
import { GitCompare, Eraser } from "lucide-react";
import { useI18n } from "@/i18n/context";

// ── Types ───────────────────────────────────────────────────────────────────

interface Row {
  left:  CellData | null;
  right: CellData | null;
  type:  "equal" | "changed" | "removed" | "added";
}

interface CellData {
  text:  string;
  chars?: Change[]; // only for "changed" rows
}

// ── Diff builder ─────────────────────────────────────────────────────────────

function buildRows(leftText: string, rightText: string): Row[] {
  const changes = diffLines(leftText, rightText);
  const rows: Row[] = [];
  let i = 0;

  while (i < changes.length) {
    const c = changes[i];

    if (!c.added && !c.removed) {
      for (const line of splitLines(c.value))
        rows.push({ left: { text: line }, right: { text: line }, type: "equal" });
      i++;
      continue;
    }

    if (c.removed) {
      const next = changes[i + 1];
      if (next?.added) {
        // Pair them — char-level diff per aligned row
        const removedLines = splitLines(c.value);
        const addedLines   = splitLines(next.value);
        const len = Math.max(removedLines.length, addedLines.length);
        for (let j = 0; j < len; j++) {
          const l = removedLines[j];
          const r = addedLines[j];
          if (l !== undefined && r !== undefined) {
            const chars = diffChars(l, r);
            rows.push({ left: { text: l, chars }, right: { text: r, chars }, type: "changed" });
          } else if (l !== undefined) {
            rows.push({ left: { text: l }, right: null, type: "removed" });
          } else {
            rows.push({ left: null, right: { text: r }, type: "added" });
          }
        }
        i += 2;
        continue;
      }
      for (const line of splitLines(c.value))
        rows.push({ left: { text: line }, right: null, type: "removed" });
      i++;
      continue;
    }

    if (c.added) {
      for (const line of splitLines(c.value))
        rows.push({ left: null, right: { text: line }, type: "added" });
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

// ── Cell rendering ────────────────────────────────────────────────────────────
// Mirrors difff.jp: only the changed spans get <em>-style highlights,
// rows themselves have no background.
//
// Colors (light):  deletion #FFDDEE + border #FF8090 / addition #DDFFDD
// Colors (dark):   deletion rgba(220,80,80,.28) / addition rgba(80,200,80,.22)

const delCls =
  "bg-[#FFDDEE] dark:bg-red-900/30 border border-[#FF8090] dark:border-red-500/40 font-bold";
const addCls =
  "bg-[#DDFFDD] dark:bg-green-900/30 font-bold";

function CellContent({
  cell,
  side,
  rowType,
}: {
  cell: CellData;
  side: "left" | "right";
  rowType: Row["type"];
}) {
  const { text, chars } = cell;

  // Pure removal / addition — wrap entire text
  if (rowType === "removed" && side === "left") {
    return <mark className={delCls}>{text.replace(/ /g, "\u00b7") || "\u00a0"}</mark>;
  }
  if (rowType === "added" && side === "right") {
    return <mark className={addCls}>{text.replace(/ /g, "\u00b7") || "\u00a0"}</mark>;
  }

  // Changed pair — char-level marks
  if (chars) {
    return (
      <>
        {chars.map((c, i) => {
          if (!c.added && !c.removed) return <span key={i}>{c.value}</span>;
          if (c.removed && side === "left")
            return <mark key={i} className={delCls}>{c.value.replace(/ /g, "\u00b7")}</mark>;
          if (c.added && side === "right")
            return <mark key={i} className={addCls}>{c.value.replace(/ /g, "\u00b7")}</mark>;
          return null;
        })}
      </>
    );
  }

  return <>{text || "\u00a0"}</>;
}

// ── Main component ────────────────────────────────────────────────────────────

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

      {/* Input textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-[35vh] md:h-[38vh]">
        {[
          { label: t("compareLeft"),  value: left,  set: setLeft,  ph: t("comparePlaceholderLeft")  },
          { label: t("compareRight"), value: right, set: setRight, ph: t("comparePlaceholderRight") },
        ].map(({ label, value, set, ph }) => (
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
              onChange={(e) => { set(e.target.value); setRows(null); }}
              placeholder={ph}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="flex-1 w-full p-4 resize-none text-sm bg-transparent text-anthro-dark dark:text-anthro-light placeholder:text-anthro-mid/50 focus:outline-none leading-relaxed font-mono"
            />
          </div>
        ))}
      </div>

      {/* Action bar */}
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

      {/* Diff result — difff.jp style */}
      {rows ? (
        <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-anthro-surface border border-anthro-border dark:border-anthro-dark-border rounded-xl">
          <table className="w-full text-xs font-mono border-collapse min-w-[500px]" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "50%" }} />
            </colgroup>
            {/* Column headers */}
            <thead>
              <tr className="border-b border-anthro-border dark:border-anthro-dark-border bg-anthro-light/60 dark:bg-anthro-dark/40 select-none">
                <th className="text-left px-4 py-1.5 text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid border-r border-anthro-border dark:border-anthro-dark-border">
                  {t("compareLeft")}
                </th>
                <th className="text-left px-4 py-1.5 text-[10px] font-semibold font-heading uppercase tracking-widest text-anthro-mid">
                  {t("compareRight")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-anthro-border/30 dark:border-anthro-dark-border/30 last:border-0"
                >
                  {/* Left cell */}
                  <td className={`px-4 py-0.5 leading-5 whitespace-pre-wrap break-all align-top border-r border-anthro-border dark:border-anthro-dark-border ${
                    row.type === "equal" || row.type === "changed"
                      ? "text-anthro-dark dark:text-anthro-light"
                      : row.type === "removed"
                      ? "text-anthro-dark dark:text-anthro-light"
                      : "text-anthro-mid/30"
                  }`}>
                    {row.left
                      ? <CellContent cell={row.left} side="left" rowType={row.type} />
                      : <span className="text-anthro-mid/20 select-none">·</span>
                    }
                  </td>
                  {/* Right cell */}
                  <td className={`px-4 py-0.5 leading-5 whitespace-pre-wrap break-all align-top ${
                    row.type === "equal" || row.type === "changed"
                      ? "text-anthro-dark dark:text-anthro-light"
                      : row.type === "added"
                      ? "text-anthro-dark dark:text-anthro-light"
                      : "text-anthro-mid/30"
                  }`}>
                    {row.right
                      ? <CellContent cell={row.right} side="right" rowType={row.type} />
                      : <span className="text-anthro-mid/20 select-none">·</span>
                    }
                  </td>
                </tr>
              ))}
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
