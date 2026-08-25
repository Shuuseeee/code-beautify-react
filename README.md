# Code Beautify

A code beautifier SPA built with Next.js 15, TypeScript, and Tailwind CSS. Formats HTML, CSS, JavaScript, and JSON code with auto-detection, comment removal, and Monaco Editor diff view.

## Features

- Format HTML, CSS, JavaScript, and JSON
- Auto-detect language with highlight.js
- Remove HTML and JS comments
- Compare input/output with Monaco Editor diff view
- Dark mode (persisted in localStorage)
- Multilingual: English, Chinese (zh-CN), Japanese (ja) — auto-detected from browser

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v3**
- **js-beautify** for code formatting
- **highlight.js** for language detection
- **@monaco-editor/react** for diff view
- **lucide-react** for icons

## Design system

The UI follows the visual language of [@pierre/diffs](https://diffs.com): hairline
borders, small radii, neutral chrome, and diff colors as the only saturated thing
on screen. Two files own all of it.

**`src/app/globals.css`** declares every color, radius and shadow as a CSS
variable, once per color mode. Changing `--accent` reskins the entire app,
including the Monaco editor. The diff surface lives here too — `.diff-grid`,
`.diff-row--*` and `.diff-tok--*` implement Pierre's three ideas:

| Idea | Implementation |
| --- | --- |
| Changed rows are marked, not washed | 2px edge bar via `.diff-sign::before`; row tint stays under 9% alpha |
| Saturation belongs to the token | `.diff-tok--add` / `.diff-tok--del` at ~26% alpha on the characters that moved |
| Fewer DOM nodes | CSS Grid with `display: contents` rows instead of a `<table>` |

**`src/lib/ui.ts`** exports the class recipes every control composes from —
`btnPrimary`, `btnSecondary`, `panel`, `popover`, `eyebrow`, `kbd`. Components
never write their own button styling. If a component needs a class that isn't in
a recipe, the recipe is missing something.

`tailwind.config.ts` only maps the CSS variables to semantic Tailwind names
(`bg-surface`, `text-fg-muted`, `border-line`). No component references a raw hex.

Ligatures are disabled in all monospace text so `=>` and `!==` occupy the same
column count on both sides of a diff.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

### Format code

```bash
npm run format
```

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com). Push to your repository and import the project in the Vercel dashboard, or use the Vercel CLI:

```bash
npx vercel
```
