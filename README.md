# Cursor Web Tester

A React + Vite + TypeScript application that recreates Cursor’s split-view interface for rapid website testing. Load any URL on the left, chat with a mock QA assistant on the right, and capture actionable insights across performance, accessibility, design, and responsiveness.

## ✨ Features

- **Split workspace** – Responsive 60/40 layout with a full-height website preview alongside a conversational assistant.
- **Live preview** – Secure iframe sandbox with URL validation, loading states, timeout fallback messaging, and default `example.com` preview.
- **Cursor-inspired chat** – Rounded bubbles, auto-scrolling history, timestamps, typing indicator, quick starter prompts, session persistence, and rich Markdown rendering for bold text, lists, and code snippets.
- **Smart mock responses** – Predefined assistant replies that adapt to common QA themes (performance, accessibility, conversion, responsive design).
- **Theme system** – Light/dark palettes powered by CSS custom properties, smooth transitions, and localStorage persistence.
- **Polished UI** – Modern typography, subtle glassmorphism, hover effects, and accessible color contrast throughout.
- **Built-in sample site** – A locally hosted demo page (`/preview-demo.html`) ensures the preview pane always has embeddable content for quick validation.

## 🚀 Getting Started

Requirements:

- Node.js 18+ (or the version supported by your environment)
- npm 9+

Install dependencies (already installed during scaffolding, rerun if needed):

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Visit the printed local URL (defaults to `http://localhost:5173`). The dev server supports hot module replacement, so UI tweaks apply instantly.

## 🧪 Scripts

- `npm run dev` – Start the Vite development server.
- `npm run build` – Type-check and bundle the app for production.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint with the project’s TypeScript-aware configuration.

## 🗂️ Project Structure

```
src/
├── App.tsx                 # Application shell and orchestration logic
├── App.css                 # Layout, theme, and component styles
├── index.css               # Global resets and CSS variables for theming
├── main.tsx                # React entry point
├── types.ts                # Shared TypeScript interfaces
└── components/
    ├── AppHeader.tsx       # Header with theme toggle
    ├── WebsitePreview.tsx  # URL loader and iframe preview panel
    └── ChatPanel.tsx       # Chat surface, history, and composer
```

## 🧭 Usage Tips

- Switch between light and dark mode via the header toggle; your preference is stored in `localStorage`.
- Use the URL field to load any site. Invalid URLs are flagged early, and pages that refuse embedding surface a helpful error state. Many production domains send `X-Frame-Options` or CSP headers that block iframes; when that happens, try a staging URL or the bundled `/preview-demo.html` sample.
- Kick off analysis using the conversation starter chips or send your own prompts. The assistant simulates realistic QA commentary with typing delays.
- Clear the chat history anytime to restart the conversation without losing your current preview.

## 📦 Deployment

Run `npm run build` to produce the optimized output in `dist/`. Serve that directory with any modern static host (Vercel, Netlify, GitHub Pages, etc.).

---

Happy testing! Use this workspace as a foundation for deeper integrations, real AI backends, or automated QA pipelines.
