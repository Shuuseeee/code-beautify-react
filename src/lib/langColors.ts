/**
 * Per-language identity colors.
 *
 * Used only as a small dot next to a language name — the language never tints
 * a button, a pill or a panel. Chrome stays neutral so the diff colors are the
 * only saturated thing on screen.
 */
export const LANG_COLOR = {
  html:       { dot: "#E34F26", text: "#B03A1B", textDark: "#F0764F" },
  css:        { dot: "#2965F1", text: "#1E4BC4", textDark: "#6C9BFF" },
  javascript: { dot: "#F0DB4F", text: "#8A7A0A", textDark: "#F0DB4F" },
  json:       { dot: "#8B8A86", text: "#6E6C68", textDark: "#A5A49F" },
} as const;

export type LangColorKey = keyof typeof LANG_COLOR;

export function langColorEntry(key: string | null | undefined) {
  if (!key || !(key in LANG_COLOR)) return null;
  return LANG_COLOR[key as LangColorKey];
}

/** Dot color for a language, falling back to a neutral. */
export function langDot(key: string | null | undefined): string {
  return langColorEntry(key)?.dot ?? "var(--fg-faint)";
}
