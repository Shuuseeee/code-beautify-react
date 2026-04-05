import { js as jsBeautify, html as htmlBeautify, css as cssBeautify } from "js-beautify";

export type DetectedLang = "html" | "css" | "javascript" | "json" | "plaintext";
export type Mode = "auto" | DetectedLang;

// ── highlight.js singleton — imported & registered once, then cached ──
let hljsPromise: Promise<import("highlight.js").HLJSApi> | null = null;

function getHljs() {
  if (!hljsPromise) {
    hljsPromise = (async () => {
      const { default: hljs } = await import("highlight.js/lib/core");
      const [xml, css, js, json] = await Promise.all([
        import("highlight.js/lib/languages/xml"),
        import("highlight.js/lib/languages/css"),
        import("highlight.js/lib/languages/javascript"),
        import("highlight.js/lib/languages/json"),
      ]);
      hljs.registerLanguage("html", xml.default);
      hljs.registerLanguage("css", css.default);
      hljs.registerLanguage("javascript", js.default);
      hljs.registerLanguage("json", json.default);
      return hljs;
    })();
  }
  return hljsPromise;
}

export async function detectLanguage(code: string): Promise<DetectedLang> {
  const hljs = await getHljs();
  const result = hljs.highlightAuto(code, ["javascript", "css", "html", "json"]);
  return (result.language as DetectedLang) ?? "plaintext";
}

export function formatCode(code: string, type: DetectedLang): string {
  switch (type) {
    case "html":        return htmlBeautify(code, { indent_size: 2 });
    case "css":         return cssBeautify(code,  { indent_size: 2 });
    case "javascript":  return jsBeautify(code,   { indent_size: 2 });
    case "json":        return JSON.stringify(JSON.parse(code), null, 2);
    default:            return code;
  }
}

export function removeHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*[\r\n]/gm, "");
}

export function removeJsComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*(?=\n|$)/g, "").replace(/^\s*[\r\n]/gm, "");
}
