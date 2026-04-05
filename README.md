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
