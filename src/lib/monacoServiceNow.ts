/**
 * ServiceNow language definition for Monaco Editor.
 * Registers the "servicenow" language (JS superset) with:
 *  - All standard JavaScript syntax
 *  - Glide* server-side classes highlighted as `snow-class`
 *  - Global objects (gs, current, g_form …) highlighted as `snow-global`
 *  - Custom light/dark themes: "servicenow-light" / "servicenow-dark"
 *
 * Call registerServiceNowLanguage(monaco) once before the editor mounts.
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

  // ── Custom themes ──────────────────────────────────────────────────────────
  // snow-class  → warm orange  (Glide* / REST* / XML* classes)
  // snow-global → violet/purple (gs, current, g_form …)

  monaco.editor.defineTheme("servicenow-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "snow-class",  foreground: "C25D00", fontStyle: "bold" },
      { token: "snow-global", foreground: "6B21A8", fontStyle: "bold" },
      { token: "comment.doc", foreground: "5C8A5C", fontStyle: "italic" },
      { token: "annotation",  foreground: "888800" },
    ],
    colors: {},
  });

  monaco.editor.defineTheme("servicenow-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "snow-class",  foreground: "FF9D4D", fontStyle: "bold" },
      { token: "snow-global", foreground: "C084FC", fontStyle: "bold" },
      { token: "comment.doc", foreground: "6A9955", fontStyle: "italic" },
      { token: "annotation",  foreground: "DCDCAA" },
    ],
    colors: {},
  });
}

// ─── Glass themes (transparent background for glassmorphism panels) ────────

export function registerGlassThemes(monaco: typeof Monaco): void {
  const lightColors: Record<string, string> = {
    "editor.background":                 "#00000000",
    "editorGutter.background":           "#00000000",
    "editor.lineHighlightBackground":    "#00000008",
    "editorLineNumber.foreground":       "#8E8E9370",
    "editorLineNumber.activeForeground": "#8E8E93",
    "editor.selectionBackground":        "#007AFF2A",
    "editor.inactiveSelectionBackground":"#007AFF16",
  };
  const darkColors: Record<string, string> = {
    "editor.background":                 "#00000000",
    "editorGutter.background":           "#00000000",
    "editor.lineHighlightBackground":    "#ffffff09",
    "editorLineNumber.foreground":       "#ffffff28",
    "editorLineNumber.activeForeground": "#ffffff55",
    "editor.selectionBackground":        "#007AFF40",
    "editor.inactiveSelectionBackground":"#007AFF22",
  };

  monaco.editor.defineTheme("glass-light", {
    base: "vs", inherit: true, rules: [], colors: lightColors,
  });
  monaco.editor.defineTheme("glass-dark", {
    base: "vs-dark", inherit: true, rules: [], colors: darkColors,
  });
  monaco.editor.defineTheme("glass-snow-light", {
    base: "vs", inherit: true,
    rules: [
      { token: "snow-class",  foreground: "C25D00", fontStyle: "bold" },
      { token: "snow-global", foreground: "6B21A8", fontStyle: "bold" },
      { token: "comment.doc", foreground: "5C8A5C", fontStyle: "italic" },
      { token: "annotation",  foreground: "888800" },
    ],
    colors: lightColors,
  });
  monaco.editor.defineTheme("glass-snow-dark", {
    base: "vs-dark", inherit: true,
    rules: [
      { token: "snow-class",  foreground: "FF9D4D", fontStyle: "bold" },
      { token: "snow-global", foreground: "C084FC", fontStyle: "bold" },
      { token: "comment.doc", foreground: "6A9955", fontStyle: "italic" },
      { token: "annotation",  foreground: "DCDCAA" },
    ],
    colors: darkColors,
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
