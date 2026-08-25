/**
 * ServiceNow language definition for Monaco Editor.
 * Registers the "servicenow" language (JS superset) with:
 *  - All standard JavaScript syntax
 *  - Glide* server-side classes highlighted as `snow-class`
 *  - Global objects (gs, current, g_form …) highlighted as `snow-global`
 *  - Custom light/dark themes: "servicenow-light" / "servicenow-dark"
 *
 * Call registerServiceNowLanguage(monaco) once before the editor mounts.
 *
 * Theme note: the color ramps below mirror the app's design tokens so that
 * the editor never reads as a foreign object dropped into the page. Only the
 * `colors` and `rules` blocks are presentational — the tokenizer above is
 * untouched.
 */

import type * as Monaco from "monaco-editor";

// ─── API lists ────────────────────────────────────────────────────────────────

/** Glide* server-side classes + HTTP/XML/REST/utility classes */
const SNOW_CLASSES = [
  // Core database
  "GlideRecord", "GlideElement", "GlideAggregate", "GlideQuery",
  "GlideRecordUtil", "GlideQueryCondition", "GlideFilter",
  // Date / time
  "GlideDateTime", "GlideDate", "GlideTime", "GlideDuration", "GlideSchedule",
  // System / session / user
  "GlideSystem", "GlideSession", "GlideUser",
  // Security
  "GlideSecurityManager", "GlideImpersonate", "GlideSecureRandomUtil",
  "GlideEncrypter", "GlideCertificateEncryption",
  // Strings / numbers / util
  "GlideStringUtil", "GlideNumberUtil",
  // Email
  "GlideEmailOutbound",
  // HTTP
  "GlideHTTPRequest", "GlideHTTPResponse",
  // Plugins / modules / locale
  "GlidePluginManager", "GlideModule", "GlideLocale", "GlideURI",
  // Metadata
  "GlideSysDictionary", "GlideSysChoice",
  // Scoped eval / table hierarchy
  "GlideScopedEvaluator", "GlideTableHierarchy", "GlideDBObjectManager",
  // XML / JSON
  "GlideXMLDocument", "GlideXMLNode", "GlideJsonPath",
  "XMLDocument2", "XMLNode", "XMLUtil", "XMLUtilJS",
  // Attachments
  "GlideSysAttachment",
  // REST / SOAP
  "RESTMessageV2", "RESTResponseV2", "SOAPMessageV2",
  // Utility
  "ArrayUtil", "JSUtil", "TableUtils", "RichTextUtil", "Sanitizer",
  "GlideNumberUtil", "Encoder",
  // CMDB
  "CMDBUtil", "CMDBQueryBuilderAPI", "CIUtils", "CIData",
  "IdentificationEngineScriptableAPI",
  // ML
  "MLSolution", "MLSolutionFactory",
  "ClassificationSolution", "ClusteringSolution", "RegressionSolution",
  // Workflow
  "WorkflowModelManager", "WorkflowScheduler", "WalkWorkflow", "WorkflowEvaluator",
  // Notify
  "NotifyUtil", "NotifySMS",
  // Client-side Ajax
  "GlideAjax",
  // Flow / Integration Hub
  "FlowAPI", "GlideFlow",
];

/** Global variables / objects available in various script contexts */
const SNOW_GLOBALS = [
  // Ubiquitous server globals
  "gs", "current", "previous", "answer",
  // Mail scripts
  "email", "template",
  // Workflow / approvals
  "workflow", "approval", "action", "producer", "task",
  // Client-side g_* objects
  "g_form", "g_user", "g_list", "g_dialog", "g_nav", "g_navigation",
  "g_request", "g_response", "g_processor",
  // Notify
  "Notify",
  // Misc
  "RP", "RenderProperties",
  // sn_ws namespace (client REST)
  "sn_ws",
];

// ─── Language registration ─────────────────────────────────────────────────

export function registerServiceNowLanguage(monaco: typeof Monaco): void {
  // Avoid double-registration
  if (monaco.languages.getLanguages().some((l) => l.id === "servicenow")) return;

  monaco.languages.register({ id: "servicenow", extensions: [".sn.js"], aliases: ["ServiceNow", "servicenow"] });

  // ── Monarch tokenizer ──────────────────────────────────────────────────────
  monaco.languages.setMonarchTokensProvider("servicenow", {
    keywords: [
      "break", "case", "catch", "class", "const", "continue", "debugger",
      "default", "delete", "do", "else", "export", "extends", "finally",
      "for", "function", "if", "import", "in", "instanceof", "let", "new",
      "of", "return", "static", "super", "switch", "this", "throw", "try",
      "typeof", "var", "void", "while", "with", "yield",
      "async", "await",
      "true", "false", "null", "undefined", "NaN", "Infinity",
    ],

    snowClasses: SNOW_CLASSES,
    snowGlobals: SNOW_GLOBALS,

    operators: [
      "<=", ">=", "==", "!=", "===", "!==", "=>", "+", "-", "**",
      "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&", "|", "^",
      "!", "~", "&&", "||", "??", "?", ":", "=", "+=", "-=", "*=",
      "**=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=",
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // identifiers — checked against keyword/class/global lists
        [
          /[a-zA-Z_$][\w$]*/,
          {
            cases: {
              "@keywords":    "keyword",
              "@snowClasses": "snow-class",
              "@snowGlobals": "snow-global",
              "@default":     "identifier",
            },
          },
        ],

        { include: "@whitespace" },

        // JSDoc / decorators
        [/@[a-zA-Z_$][\w$]*/, "annotation"],

        // brackets
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],

        // operators
        [/@symbols/, { cases: { "@operators": "delimiter", "@default": "" } }],

        // numbers
        [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, "number.float"],
        [/0[xX][0-9a-fA-F_]*[0-9a-fA-F][0-9a-fA-F_]*/, "number.hex"],
        [/0[0-7_]*[0-7][0-7_]*/, "number.octal"],
        [/0[bB][0-1_]*[0-1][0-1_]*/, "number.binary"],
        [/\d[\d_]*/, "number"],

        // delimiter
        [/[;,.]/, "delimiter"],

        // strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string_double"],
        [/'/, "string", "@string_single"],
        [/`/, "string", "@string_backtick"],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],

      jsdoc: [
        [/[^\/*]+/, "comment.doc"],
        [/\/\*/, "comment.doc", "@push"],
        [/\*\//, "comment.doc", "@pop"],
        [/[\/*]/, "comment.doc"],
      ],

      string_double: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/'/, "string", "@pop"],
      ],

      string_backtick: [
        [/\$\{/, { token: "delimiter.bracket", next: "@bracketCounting" }],
        [/[^\\`$]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/`/, "string", "@pop"],
      ],

      bracketCounting: [
        [/\{/, "delimiter.bracket", "@push"],
        [/\}/, "delimiter.bracket", "@pop"],
        { include: "root" },
      ],
    },
  });

  // ── Language configuration ─────────────────────────────────────────────────
  monaco.languages.setLanguageConfiguration("servicenow", {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
      { open: "`", close: "`", notIn: ["string"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: "`", close: "`" },
    ],
    indentationRules: {
      increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/,
      decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\])].*$/,
    },
  });

  // ── Custom themes ─────────────────────────────────────────────────────────
  // snow-class  → amber   (Glide* / REST* / XML* classes)
  // snow-global → violet  (gs, current, g_form …)

  monaco.editor.defineTheme("servicenow-light", {
    base: "vs",
    inherit: true,
    rules: SNOW_LIGHT,
    colors: {},
  });

  monaco.editor.defineTheme("servicenow-dark", {
    base: "vs-dark",
    inherit: true,
    rules: SNOW_DARK,
    colors: {},
  });
}

// ─── ServiceNow-only token rules ───────────────────────────────────────────
// All standard syntax tokens use Monaco's built-in vs / vs-dark colours
// (inherit: true, no overrides). Only the SN-specific tokens are defined here.

const SNOW_LIGHT = [
  { token: "snow-class",  foreground: "953800", fontStyle: "bold" },
  { token: "snow-global", foreground: "6639BA", fontStyle: "bold" },
];

const SNOW_DARK = [
  { token: "snow-class",  foreground: "FFA657", fontStyle: "bold" },
  { token: "snow-global", foreground: "D2A8FF", fontStyle: "bold" },
];

// ─── Editor themes ─────────────────────────────────────────────────────────
// Transparent backgrounds: the panel behind the editor owns the surface color,
// so switching a design token reskins the editor with no theme edit.

export function registerEditorThemes(monaco: typeof Monaco): void {
  const lightColors: Record<string, string> = {
    "editor.background":                  "#00000000",
    "editorGutter.background":            "#00000000",
    "editor.lineHighlightBackground":     "#10171A07",
    "editor.lineHighlightBorder":         "#00000000",
    "editorLineNumber.foreground":        "#10171A42",
    "editorLineNumber.activeForeground":  "#10171A99",
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
  };

  const darkColors: Record<string, string> = {
    "editor.background":                  "#00000000",
    "editorGutter.background":            "#00000000",
    "editor.lineHighlightBackground":     "#FFFFFF09",
    "editor.lineHighlightBorder":         "#00000000",
    "editorLineNumber.foreground":        "#FFFFFF38",
    "editorLineNumber.activeForeground":  "#FFFFFF8C",
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
  monaco.editor.defineTheme("pierre-snow-light", {
    base: "vs", inherit: true,
    rules: SNOW_LIGHT,
    colors: { ...lightColors, ...lightDiff },
  });
  monaco.editor.defineTheme("pierre-snow-dark", {
    base: "vs-dark", inherit: true,
    rules: SNOW_DARK,
    colors: { ...darkColors, ...darkDiff },
  });
}

/** @deprecated Kept so existing call sites keep compiling. */
export const registerGlassThemes = registerEditorThemes;

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
