/**
 * Editor themes + ServiceNow helpers for Monaco.
 *
 * ServiceNow syntax highlighting is NOT done here via a Monarch tokenizer.
 * It is driven by TypeScript semantic highlighting: the code renders as plain
 * `javascript` and `registerServiceNowTypes` (see ./servicenowTypes) injects
 * Glide* type definitions so the JS language service colors GlideRecord as a
 * class, `gs`/`current`/`g_form` as variables, and method calls as methods —
 * all from the built-in vs-dark / vs-light semantic token palette.
 *
 * The `pierre-*` themes below inherit vs / vs-dark (so they carry those
 * semantic token colors) and only override background/gutter/diff colors so
 * the editor sits transparently on the panel surface.
 */

import type * as Monaco from "monaco-editor";

// ─── Editor themes ─────────────────────────────────────────────────────────
// Transparent backgrounds: the panel behind the editor owns the surface color,
// so switching a design token reskins the editor with no theme edit.

export function registerEditorThemes(monaco: typeof Monaco): void {
  const lightColors: Record<string, string> = {
    "editor.background":                  "#00000000",
    "editorGutter.background":            "#00000000",
    "editor.lineHighlightBackground":     "#10171A07",
    "editor.lineHighlightBorder":         "#00000000",
    "editorLineNumber.foreground":        "#10171A80",
    "editorLineNumber.activeForeground":  "#10171ACC",
    "editor.selectionBackground":         "#00809B2E",
    "editor.inactiveSelectionBackground": "#00809B17",
    "editor.selectionHighlightBackground":"#00809B1F",
    "editorIndentGuide.background1":      "#10171A14",
    "editorIndentGuide.activeBackground1":"#10171A2B",
    "editorCursor.foreground":            "#00809B",
    "editorWhitespace.foreground":        "#10171A26",
    "scrollbarSlider.background":         "#10171A1F",
    "scrollbarSlider.hoverBackground":    "#10171A33",
    "scrollbarSlider.activeBackground":   "#10171A47",
    "editorBracketMatch.background":      "#00809B1F",
    "editorBracketMatch.border":          "#00000000",
    "editor.foldBackground":              "#FFFFFF",
    "editorStickyScroll.background":      "#FFFFFF",
    "editorStickyScrollHover.background": "#F2F4F4",
  };

  const darkColors: Record<string, string> = {
    "editor.background":                  "#00000000",
    "editorGutter.background":            "#00000000",
    "editor.lineHighlightBackground":     "#FFFFFF09",
    "editor.lineHighlightBorder":         "#00000000",
    "editorLineNumber.foreground":        "#FFFFFF70",
    "editorLineNumber.activeForeground":  "#FFFFFFB0",
    "editor.selectionBackground":         "#3AB4CC44",
    "editor.inactiveSelectionBackground": "#3AB4CC22",
    "editor.selectionHighlightBackground":"#3AB4CC2B",
    "editorIndentGuide.background1":      "#FFFFFF12",
    "editorIndentGuide.activeBackground1":"#FFFFFF2E",
    "editorCursor.foreground":            "#3AB4CC",
    "editorWhitespace.foreground":        "#FFFFFF24",
    "scrollbarSlider.background":         "#FFFFFF1A",
    "scrollbarSlider.hoverBackground":    "#FFFFFF2E",
    "scrollbarSlider.activeBackground":   "#FFFFFF42",
    "editorBracketMatch.background":      "#3AB4CC29",
    "editorBracketMatch.border":          "#00000000",
    "editor.foldBackground":              "#111618",
    "editorStickyScroll.background":      "#111618",
    "editorStickyScrollHover.background": "#182022",
  };

  // Diff-editor specific colors: the same restraint as the CSS diff surface —
  // quiet row washes, saturated word-level marks.
  const lightDiff: Record<string, string> = {
    "diffEditor.insertedTextBackground":       "#248A132B",
    "diffEditor.removedTextBackground":        "#C0000026",
    "diffEditor.insertedLineBackground":       "#248A1312",
    "diffEditor.removedLineBackground":        "#C0000010",
    "diffEditor.border":                       "#10171A1A",
    "diffEditorGutter.insertedLineBackground": "#248A131F",
    "diffEditorGutter.removedLineBackground":  "#C000001C",
    "diffEditorOverview.insertedForeground":   "#248A1380",
    "diffEditorOverview.removedForeground":    "#C0000080",
  };

  const darkDiff: Record<string, string> = {
    "diffEditor.insertedTextBackground":       "#86B4812E",
    "diffEditor.removedTextBackground":        "#E870702B",
    "diffEditor.insertedLineBackground":       "#86B48116",
    "diffEditor.removedLineBackground":        "#E8707014",
    "diffEditor.border":                       "#FFFFFF18",
    "diffEditorGutter.insertedLineBackground": "#86B48124",
    "diffEditorGutter.removedLineBackground":  "#E8707022",
    "diffEditorOverview.insertedForeground":   "#86B48180",
    "diffEditorOverview.removedForeground":    "#E8707080",
  };

  monaco.editor.defineTheme("pierre-light", {
    base: "vs", inherit: true,
    rules: [],
    colors: { ...lightColors, ...lightDiff },
  });
  monaco.editor.defineTheme("pierre-dark", {
    base: "vs-dark", inherit: true,
    rules: [],
    colors: { ...darkColors, ...darkDiff },
  });
}

/** @deprecated Kept so existing call sites keep compiling. */
export const registerGlassThemes = registerEditorThemes;

// ─── JSON color decorators ─────────────────────────────────────────────────
// SNUtils renders `255,0,0`-style triplets in JSON as color swatches with a
// picker. Register once (per-language provider is global). Requires the editor
// option `colorDecorators: true`.

let colorProviderRegistered = false;

export function registerJsonColorProvider(monaco: typeof Monaco): void {
  if (colorProviderRegistered) return;
  colorProviderRegistered = true;

  monaco.languages.registerColorProvider("json", {
    provideColorPresentations: (_model, colorInfo) => {
      const c = colorInfo.color;
      const r = Math.round(c.red * 255);
      const g = Math.round(c.green * 255);
      const b = Math.round(c.blue * 255);
      return [{ label: [r, g, b].join(",") }];
    },
    provideDocumentColors: (model) => {
      const matches = model.findMatches(
        /( *\d{1,3} *),( *\d{1,3} *),( *\d{1,3} *)/.source,
        true, true, false, null, true
      );
      return matches.map(({ range, matches: groups }) => ({
        range,
        color: {
          red: parseInt(groups![1], 10) / 255,
          green: parseInt(groups![2], 10) / 255,
          blue: parseInt(groups![3], 10) / 255,
          alpha: 1,
        },
      }));
    },
  });
}

// ─── Auto-detection ────────────────────────────────────────────────────────

const SNOW_DETECTION_PATTERNS = [
  /\bGlideRecord\b/,
  /\bGlideDateTime\b/,
  /\bGlideAggregate\b/,
  /\bGlideQuery\b/,
  /\bGlideAjax\b/,
  /\bRESTMessageV2\b/,
  /\bSOAPMessageV2\b/,
  /\bgs\.(log|info|warn|error|debug|addInfoMessage|addErrorMessage|getProperty|setProperty|eventQueue|getUser|getUserName|getSession|now|beginningOfDay|endOfDay)\b/,
  /\bg_form\.(getValue|setValue|setMandatory|setReadOnly|setVisible|addOption|showFieldMsg|save|submit)\b/,
  /\bg_user\.(hasRole|getName|getID)\b/,
  /\bcurrent\.(getValue|setValue|setAbortAction|update|insert)\b/,
  /\bworkflow\.(scratchpad|getVariable|setVariable)\b/,
  /\bXMLDocument2\b/,
];

/** Returns true if the code looks like ServiceNow JavaScript. */
export function isServiceNowCode(code: string): boolean {
  return SNOW_DETECTION_PATTERNS.some((p) => p.test(code));
}
