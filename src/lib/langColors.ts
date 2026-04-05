/** iOS system colors per language — shared by ModeSelector & action buttons */
export const LANG_COLOR = {
  // HTML / JSON: blue ↔ red swapped vs default iOS pairing (HTML = blue, JSON = red)
  html: { tint: "rgba(0,   122, 255, 0.13)", text: "#007AFF", textDark: "#409CFF" },
  css: { tint: "rgba(255, 204, 0,   0.15)", text: "#997A00", textDark: "#FFD426" },
  javascript: { tint: "rgba(52,  199, 89,  0.13)", text: "#25A244", textDark: "#3DD869" },
  json: { tint: "rgba(255, 59,  48,  0.13)", text: "#E0352B", textDark: "#FF6B63" },
} as const;

export type LangColorKey = keyof typeof LANG_COLOR;

export function langColorEntry(key: string | null | undefined) {
  if (!key || !(key in LANG_COLOR)) return null;
  return LANG_COLOR[key as LangColorKey];
}
