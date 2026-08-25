"use client";

import { useState, useCallback, useEffect } from "react";
import { diffLines, diffChars, type Change } from "diff";
import { GitCompare, Eraser, Link2, Check } from "lucide-react";
import { useI18n } from "@/i18n/context";
import {
  panel, panelHeader, eyebrow, meta,
  btnPrimary, btnSecondary,
} from "@/lib/ui";

// ── URL share helpers ─────────────────────────────────────────────────────────

function encodeShare(left: string, right: string): string {
  const json = JSON.stringify({ l: left, r: right });
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

function decodeShare(encoded: string): { l: string; r: string } | null {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (typeof parsed.l === "string" && typeof parsed.r === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

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
// Saturation lives at the token level. A changed row gets a quiet wash and a
// 2px edge bar; only the characters that actually moved get a colored mark.

const SPACE_DOT = "\u00b7";

function Spaced({ value }: { value: string }) {
  // Render literal spaces as faint middots so a whitespace-only change is still
  // visible, without letting the dots compete with the code itself.
  const parts = value.split(/( +)/);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith(" ") ? (
          <span key={i} className="opacity-30">{SPACE_DOT.repeat(p.length)}</span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

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

  if (rowType === "removed" && side === "left") {
    return <span className="diff-tok diff-tok--del"><Spaced value={text || " "} /></span>;
  }
  if (rowType === "added" && side === "right") {
    return <span className="diff-tok diff-tok--add"><Spaced value={text || " "} /></span>;
  }

  if (chars) {
    return (
      <>
        {chars.map((c, i) => {
          if (!c.added && !c.removed) return <span key={i}>{c.value}</span>;
          if (c.removed && side === "left")
            return <span key={i} className="diff-tok diff-tok--del"><Spaced value={c.value} /></span>;
          if (c.added && side === "right")
            return <span key={i} className="diff-tok diff-tok--add"><Spaced value={c.value} /></span>;
          return null;
        })}
      </>
    );
  }

  return <>{text || "\u00a0"}</>;
}

// ── Default demo content ──────────────────────────────────────────────────────

const DEFAULT_LEFT = `下記の文章を比較してください。
   Betty Botter bought some butter,
But, she said, this butter's bitter;
If I put it in my batter,
It will make my batter bitter,
But a bit of better butter
Will make my batter better.
So she bought a bit of butter
Better than her bitter butter,
And she put it in her batter,
And it made her batter better,
So 'twas better Betty Botter
Bought a bit of better butter.`;

const DEFAULT_RIGHT = `下記の文章を，ﾋﾋ較してくだちい．
Betty Botter bought some butter,
But, she said, the butter's bitter;
If I put it in my batter,
That will make my batter bitter.
But a bit of better butter,
That will make my batter better.
So she bought a bit of butter
Better than her bitter butter.
And she put it in her batter,
And it made her batter better.
So it was better Betty Botter
Bought a bit of better butter.`;

// ── Main component ────────────────────────────────────────────────────────────

const SS_LEFT  = "compare-left";
const SS_RIGHT = "compare-right";


export default function StringCompare() {
  const { t } = useI18n();
  const [left, setLeft]   = useState(DEFAULT_LEFT);
  const [right, setRight] = useState(DEFAULT_RIGHT);
  const [rows, setRows]   = useState<Row[] | null>(() => buildRows(DEFAULT_LEFT, DEFAULT_RIGHT));
  const [shareCopied, setShareCopied] = useState(false);

  const setLeftPersist  = useCallback((v: string) => { setLeft(v);  sessionStorage.setItem(SS_LEFT,  v); }, []);
  const setRightPersist = useCallback((v: string) => { setRight(v); sessionStorage.setItem(SS_RIGHT, v); }, []);

  // On mount: restore from sessionStorage or URL hash (client-only)
  useEffect(() => {
    const match = window.location.hash.match(/^#compare=(.+)/);
    if (match) {
      const data = decodeShare(match[1]);
      if (data) {
        setLeftPersist(data.l);
        setRightPersist(data.r);
        setRows(buildRows(data.l, data.r));
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    }
    const l = sessionStorage.getItem(SS_LEFT);
    const r = sessionStorage.getItem(SS_RIGHT);
    if (l !== null || r !== null) {
      const lv = l ?? DEFAULT_LEFT;
      const rv = r ?? DEFAULT_RIGHT;
      setLeft(lv);
      setRight(rv);
      setRows(buildRows(lv, rv));
    }
  }, [setLeftPersist, setRightPersist]);

  const handleCompare = useCallback(() => {
    setRows(buildRows(left, right));
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeftPersist(""); setRightPersist(""); setRows(null);
  }, [setLeftPersist, setRightPersist]);

  const handleShare = useCallback(() => {
    if (!left.trim() && !right.trim()) return;
    const encoded = encodeShare(left, right);
    const url = `${window.location.origin}${window.location.pathname}#compare=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [left, right]);

  const removedCount = rows?.filter((r) => r.type === "removed" || r.type === "changed").length ?? 0;
  const addedCount   = rows?.filter((r) => r.type === "added"   || r.type === "changed").length ?? 0;

  // Line numbers are derived at render time — each side counts only the lines
  // that actually exist on that side.
  let lnL = 0, lnR = 0;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[32vh] md:h-[34vh]">
        {[
          { label: t("compareLeft"),  value: left,  set: setLeftPersist,  ph: t("comparePlaceholderLeft")  },
          { label: t("compareRight"), value: right, set: setRightPersist, ph: t("comparePlaceholderRight") },
        ].map(({ label, value, set, ph }) => (
          <div key={label} className={panel}>
            <div className={`${panelHeader} justify-between`}>
              <span className={eyebrow}>{label}</span>
              {value && (
                <span className={meta}>
                  {value.split("\n").length} ln · {value.length} ch
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
              className="flex-1 w-full px-3.5 py-3 resize-none text-sm leading-6 bg-transparent text-fg placeholder:text-fg-faint focus:outline-none scrollbar-thin"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleCompare} className={btnPrimary}>
          <GitCompare size={14} strokeWidth={2} />
          {t("compareCode")}
        </button>

        <button onClick={handleClear} className={`${btnSecondary} hover:text-danger`}>
          <Eraser size={14} strokeWidth={1.75} />
          {t("clearAll")}
        </button>

        <button onClick={handleShare} className={btnSecondary}>
          {shareCopied
            ? <Check size={14} strokeWidth={2.25} className="text-success" />
            : <Link2 size={14} strokeWidth={1.75} />}
          <span className={shareCopied ? "text-success" : ""}>
            {shareCopied ? t("shareLinkCopied") : t("shareCode")}
          </span>
        </button>

        {rows && (
          <div className="flex items-center gap-2 ml-auto text-sm font-mono tabular-nums">
            {removedCount === 0 && addedCount === 0 ? (
              <span className="text-fg-faint">{t("compareIdentical")}</span>
            ) : (
              <>
                {removedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-diff-del-fg">
                    <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-del" />
                    −{removedCount}
                  </span>
                )}
                {addedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-diff-add-fg">
                    <span aria-hidden className="h-[7px] w-[7px] rounded-[2px] bg-diff-add" />
                    +{addedCount}
                  </span>
                )}
                <span className="text-fg-faint">{t("compareLines")}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Diff surface ──────────────────────────────────────────────────────
          CSS Grid, six columns: number / sign / code, twice. Changed rows are
          marked by a 2px edge bar rather than a full-bleed wash. */}
      {rows ? (
        <div className={`flex-1 min-h-0 ${panel}`}>
          <div className="grid grid-cols-2 h-9 border-b border-line bg-surface-sunk select-none shrink-0">
            <span className={`${eyebrow} flex items-center pl-3 border-r border-line`}>
              {t("compareLeft")}
            </span>
            <span className={`${eyebrow} flex items-center pl-3`}>
              {t("compareRight")}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
            <div className="diff-grid diff-grid--split font-mono min-w-[640px]">
              {rows.map((row, i) => {
                if (row.left)  lnL++;
                if (row.right) lnR++;

                const leftKind  =
                  row.type === "removed" || row.type === "changed" ? "del"
                  : row.left ? "eq" : "void";
                const rightKind =
                  row.type === "added" || row.type === "changed" ? "add"
                  : row.right ? "eq" : "void";

                const leftCls =
                  leftKind === "del" ? "diff-row--del"
                  : leftKind === "void" ? "diff-row--void" : "";
                const rightCls =
                  rightKind === "add" ? "diff-row--add"
                  : rightKind === "void" ? "diff-row--void" : "";

                return (
                  <div key={i} className="contents">
                    {/* Left side */}
                    <div className={`${leftCls} contents`}>
                      <div className="diff-num">{row.left ? lnL : ""}</div>
                      <div className="diff-sign">{leftKind === "del" ? "−" : ""}</div>
                      <div className="diff-code border-r border-line-soft">
                        {row.left
                          ? <CellContent cell={row.left} side="left" rowType={row.type} />
                          : "\u00a0"}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className={`${rightCls} contents`}>
                      <div className="diff-num">{row.right ? lnR : ""}</div>
                      <div className="diff-sign">{rightKind === "add" ? "+" : ""}</div>
                      <div className="diff-code">
                        {row.right
                          ? <CellContent cell={row.right} side="right" rowType={row.type} />
                          : "\u00a0"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 min-h-[120px] ${panel} items-center justify-center`}>
          <p className="text-base text-fg-faint">{t("compareEmptyHint")}</p>
        </div>
      )}
    </div>
  );
}
