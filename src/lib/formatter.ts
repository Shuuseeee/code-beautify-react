import { js as jsBeautify, html as htmlBeautify, css as cssBeautify } from "js-beautify";

export type DetectedLang = "html" | "css" | "scss" | "javascript" | "typescript" | "json" | "xml" | "plaintext";
export type Mode = "auto" | DetectedLang;

// ── highlight.js singleton — imported & registered once, then cached ──
let hljsPromise: Promise<import("highlight.js").HLJSApi> | null = null;

function getHljs() {
  if (!hljsPromise) {
    hljsPromise = (async () => {
      const { default: hljs } = await import("highlight.js/lib/core");
      const [xml, css, scss, js, ts, json] = await Promise.all([
        import("highlight.js/lib/languages/xml"),
        import("highlight.js/lib/languages/css"),
        import("highlight.js/lib/languages/scss"),
        import("highlight.js/lib/languages/javascript"),
        import("highlight.js/lib/languages/typescript"),
        import("highlight.js/lib/languages/json"),
      ]);
      hljs.registerLanguage("html", xml.default);
      hljs.registerLanguage("xml", xml.default);
      hljs.registerLanguage("css", css.default);
      hljs.registerLanguage("scss", scss.default);
      hljs.registerLanguage("javascript", js.default);
      hljs.registerLanguage("typescript", ts.default);
      hljs.registerLanguage("json", json.default);
      return hljs;
    })();
  }
  return hljsPromise;
}

export async function detectLanguage(code: string): Promise<DetectedLang> {
  if (/^\s*<\?xml\b/.test(code)) return "xml";
  const hljs = await getHljs();
  // Limit to first 2000 chars so detection stays fast on large files
  const sample = code.length > 2000 ? code.slice(0, 2000) : code;
  const result = hljs.highlightAuto(sample, ["javascript", "typescript", "css", "html", "json"]);
  return (result.language as DetectedLang) ?? "plaintext";
}

export function formatCode(code: string, type: DetectedLang): string {
  switch (type) {
    case "html":
    case "xml":         return htmlBeautify(code, { indent_size: 2 });
    case "css":
    case "scss":        return cssBeautify(code,  { indent_size: 2 });
    case "javascript":
    case "typescript":  return jsBeautify(code,   { indent_size: 2 });
    case "json":        return JSON.stringify(JSON.parse(code), null, 2);
    default:            return code;
  }
}

export function removeHtmlComments(code: string): string {
  const normalized = code.replace(/\r\n/g, "\n");
  return normalized.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*\n/gm, "");
}

export function removeJsComments(code: string): string {
  const normalized = code.replace(/\r\n/g, "\n");
  return normalized
    .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/^\s*\n/gm, "");
}
