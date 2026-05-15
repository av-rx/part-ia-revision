# Part IA Revision

Local revision website for Cambridge Computer Science Part IA exams (June 2026).

## Getting started

```sh
npm install
npm run prepare-content   # syncs Obsidian vault + renders Excalidraw
npm run dev               # http://localhost:4321
```

## Scripts

| Script | What it does |
| ------ | ------------ |
| `npm run sync` | Copies notes from the Obsidian vault into `src/content/notes/` and rewrites Obsidian-style links. The vault is **never written to**. |
| `npm run render-diagrams` | Converts `.excalidraw.md` files into SVGs under `public/diagrams/`. |
| `npm run extract-anki` | One-shot: parses the existing Anki `.colpkg` into per-module flashcard decks under `src/content/flashcards/`. |
| `npm run audit` | Reports any topic in `src/lib/syllabus.ts` that has no notes/supplements. |
| `npm run dev` | Starts the local dev server. |
| `npm run build` | Production build + Pagefind search index. |

## Architecture

- **Astro 5** static site
- **Tailwind** + **Preact** islands for interactivity
- **KaTeX** for LaTeX, **Shiki** for code, **Pagefind** for search
- All progress/SRS state in `localStorage` (no backend)

The Obsidian vault (local path, not committed) is the source of truth for module notes. Supplementary content (gap-fills, cheat sheets, quizzes, flashcards) is authored in `src/content/` and committed.
