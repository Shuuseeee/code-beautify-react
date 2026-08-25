/**
 * Class recipes — the single source of truth for control styling.
 *
 * Every button, panel and popover in the app composes from these strings.
 * If a component needs a one-off Tailwind class that isn't here, that's the
 * signal the recipe is missing something, not that the component is special.
 */

/* ── Motion ───────────────────────────────────────────────────────────────── */
export const press = "transition-[background-color,color,border-color,opacity] duration-100 active:translate-y-px";

/* ── Buttons ──────────────────────────────────────────────────────────────── */
const btnBase =
  "inline-flex items-center gap-2 rounded-md text-base font-medium select-none " +
  "disabled:opacity-45 disabled:pointer-events-none " + press;

/** Filled accent. Exactly one of these is visible per screen. */
export const btnPrimary =
  `${btnBase} px-3 h-8 bg-accent text-accent-fg hover:bg-accent-hover`;

/** Hairline-bordered. The workhorse. */
export const btnSecondary =
  `${btnBase} px-3 h-8 border border-line bg-surface text-fg hover:bg-hover`;

/** Touch-sized variants. Mobile taps need a 36px target; desktop rows are 32px. */
export const btnPrimaryTouch =
  `${btnBase} px-3 h-9 justify-center bg-accent text-accent-fg hover:bg-accent-hover`;

export const btnSecondaryTouch =
  `${btnBase} px-3 h-9 justify-center border border-line bg-surface text-fg hover:bg-hover`;

/** Square icon-only. */
export const btnIcon =
  `inline-flex items-center justify-center h-7 w-7 rounded-sm text-fg-muted hover:text-fg hover:bg-hover ${press}`;

export const btnIconDanger =
  `inline-flex items-center justify-center h-7 w-7 rounded-sm text-fg-muted hover:text-danger hover:bg-[var(--danger-wash)] ${press}`;

/* ── Containers ───────────────────────────────────────────────────────────── */
export const panel =
  "flex flex-col min-w-0 rounded-lg border border-line bg-surface overflow-hidden";

/** Panel title strip. Sunk one step so the content reads as the foreground. */
export const panelHeader =
  "flex items-center gap-2 h-9 px-3 border-b border-line bg-surface-sunk select-none shrink-0";

export const popover =
  "rounded-md border border-line bg-surface-raise shadow-pop overflow-hidden pop-in";

export const popoverItem =
  `w-full flex items-center gap-2.5 px-3 h-9 text-base text-fg text-left hover:bg-hover ${press}`;

/* ── Typography ───────────────────────────────────────────────────────────── */
/** Small-caps section label. Used for panel titles and modal group headings. */
export const eyebrow =
  "text-2xs font-semibold uppercase tracking-[0.09em] text-fg-faint";

export const meta = "text-2xs font-mono text-fg-faint tabular-nums";

export const kbd =
  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] " +
  "border border-line bg-surface-sunk text-2xs font-mono text-fg-muted";

/* ── Tab bar (Coral Navigation Tabs style) ────────────────────────────────── */
export const segment =
  "inline-flex items-center gap-0.5";

export const segmentItem = (active: boolean) =>
  `relative px-3 h-9 text-sm font-semibold ${press} ` +
  (active
    ? "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-accent after:rounded-full"
    : "text-fg-faint hover:text-fg-muted hover:bg-hover rounded-md");
