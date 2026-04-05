import { js as jsBeautify, html as htmlBeautify, css as cssBeautify } from "js-beautify";

export type CodeMode = "auto" | "html" | "css" | "javascript" | "json";
export type DetectedLang = "html" | "css" | "javascript" | "json" | "plaintext";

export async function detectLanguage(code: string): Promise<DetectedLang> {
  const { default: hljs } = await import("highlight.js/lib/core");
  const html = (await import("highlight.js/lib/languages/xml")).default;
  const css = (await import("highlight.js/lib/languages/css")).default;
  const javascript = (await import("highlight.js/lib/languages/javascript")).default;
  const json = (await import("highlight.js/lib/languages/json")).default;
  hljs.registerLanguage("html", html);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("json", json);
  const result = hljs.highlightAuto(code, ["javascript", "css", "html", "json"]);
  return (result.language as DetectedLang) ?? "plaintext";
}

export function formatCode(code: string, type: DetectedLang): string {
  switch (type) {
    case "html":
      return htmlBeautify(code, { indent_size: 2 });
    case "css":
      return cssBeautify(code, { indent_size: 2 });
    case "javascript":
      return jsBeautify(code, { indent_size: 2 });
    case "json":
      return JSON.stringify(JSON.parse(code), null, 2);
    default:
      return code;
  }
}

export function validateCode(code: string, type: DetectedLang): void {
  switch (type) {
    case "html":
      new DOMParser().parseFromString(code, "text/html");
      break;
    case "css":
      cssBeautify(code);
      break;
    case "javascript":
      // Basic validation using Function constructor
      new Function(code);
      break;
    case "json":
      JSON.parse(code);
      break;
  }
}

export function removeHtmlComments(code: string): string {
  return code.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*[\r\n]/gm, "");
}

export function removeJsComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*(?=\n|$)/g, "").replace(/^\s*[\r\n]/gm, "");
}
