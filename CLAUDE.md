# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev               # Start Astro dev server (localhost:4321)
npm run build             # Full production build: sync vault → render diagrams → astro build → pagefind index
npm run preview           # Preview built site

# Content pipeline (requires VAULT_PATH env var pointing to Obsidian vault)
npm run sync              # Sync markdown and images from Obsidian vault into src/content/notes/
npm run render-diagrams   # Render Excalidraw .excalidraw.md files to SVG in public/diagrams/
npm run prepare-content   # Runs sync then render-diagrams

# Utilities
npm run extract-anki      # Extract flashcards from Anki collection in scripts/.cache/
npm run audit             # Audit topic coverage against the syllabus
```

`npm run sync` requires `VAULT_PATH` set to the local Obsidian vault root. The vault is read-only; this script never writes to it.

There is no test suite. Type-check with:
```bash
npx astro check
```

## Architecture

### Content pipeline

Content does not live in the repo — it is synced from an external Obsidian vault:

1. `scripts/sync-vault.mjs` reads `src/lib/syllabus.ts` (via regex parsing, not a TS loader), walks the vault, injects frontmatter, and writes topic MDX files into `src/content/notes/<module-slug>/<topic-slug>.md`. It also copies images to `public/images/<module-slug>/` and writes two manifests to `src/content/_generated/`: `wiki-links.json` and `embed-links.json`.
2. `scripts/render-excalidraw.mjs` reads the per-module `excalidraw-<slug>.json` files written by sync, renders each `.excalidraw.md` to SVG, and places them in `public/diagrams/<module-slug>/`.
3. `src/lib/remark-obsidian-links.mjs` is a remark plugin that resolves Obsidian `[[wiki links]]` and `![[embeds]]` at build time using those JSON manifests.

Synced content is gitignored; `src/content/notes/` and `public/images/` are ephemeral.

### Single source of truth: `src/lib/syllabus.ts`

All structural data lives here: every module (slug, vault folder name, paper, lecturer, topics) and every exam paper (date, venue, sections, rubric). Any new module or topic must be added here first — the sync script parses this file with a regex extractor and will only process modules declared in `MODULES`.

Topic slugs in `syllabus.ts` must match the Obsidian vault folder/file naming conventions used by `sync-vault.mjs`.

### Astro content collections (`src/content/config.ts`)

Five collections are defined:
- **notes** — synced topic pages (MDX, one per topic per module)
- **supplements** — hand-authored gap-fill MDX not in the vault (e.g. `software-security-engineering/testing-strategies.md`)
- **cheatsheets** — per-module cheat-sheet MDX
- **flashcards** — per-module JSON (card front/back/topic/tags)
- **quizzes** — per-module JSON (MCQ/short/truefalse questions)
- **code-exercises** — per-module JSON (OCaml/Java trace/code/mcq exercises)

### Routing

Pages follow the pattern:
- `/modules/[module]/[topic]` — topic page; renders a `notes` or `supplements` entry
- `/modules/[module]` — module index
- `/papers/[paper]` — paper overview with exam timetable and past-question links
- `/flashcards/[module]`, `/quiz/[module]`, `/cheatsheets/[module]`, `/coding/[module]` — study tools per module

### Client-side state (`src/lib/progress-store.ts`)

All user progress is stored in `localStorage` under the `piarev:` namespace. No server-side state. Keys: `confidence` (per-topic rating), `srs` (SM-2 flashcard state), `quiz` (score history), `recent-topics`. The SRS algorithm is a simplified SM-2 variant implemented directly in this file.

### Past questions (`src/lib/past-papers.ts`)

Manually curated index of past exam questions (2019–2025, Papers 1–3), each tagged with a `ModuleSlug` and an array of topic slugs from `syllabus.ts`. Used to surface relevant past questions on topic pages. Topic slug tags must be kept in sync with `syllabus.ts`.

### Styling

Tailwind CSS with the `@tailwindcss/typography` plugin. Custom colour scales: `ink-*` (neutral grays) and `accent-*` (blue). Dark mode is class-based (`dark` on `<html>`), toggled via `localStorage`. Base styles in `src/styles/base.css`. Astro's base styles are disabled (`applyBaseStyles: false`).

### Markdown rendering

- Math: `remark-math` + `rehype-katex` (non-strict mode)
- Code blocks: Shiki with `github-dark-dimmed` theme
- Obsidian links/embeds: custom `remark-obsidian-links.mjs` plugin
- MDX for all content to allow component imports in notes
