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

---

## Quick Reference

### Module slugs by paper

**Paper 1:** `foundations-of-computer-science` (11 topics), `object-oriented-programming` (12 topics), `introduction-to-probability` (12 topics), `algorithms-1` (3 topics), `algorithms-2` (4 topics)

**Paper 2:** `digital-electronics` (13 topics), `operating-systems` (12 topics), `software-security-engineering` (6 topics + 5 supplements), `discrete-maths` (4 topics)

**Paper 3:** `databases` (8 topics), `introduction-to-graphics` (6 topics), `interaction-design` (6 topics + 5 supplements), `machine-learning-real-world-data` (3 topics)

**Maths:** `nst-mathematics-a` (13 topics)

### Content collections (src/content/config.ts)

| Collection | Type | File pattern | Key fields |
|---|---|---|---|
| `notes` | content | `notes/<module>/<topic>.md` | module, topicSlug, order, isSupplement |
| `supplements` | content | `supplements/<module>/<slug>.md` | module, title, summary, order |
| `cheatsheets` | content | `cheatsheets/<module>.mdx` | module, title, paper |
| `flashcards` | data | `flashcards/<module>.json` | module, cards[]{id,front,back,topic,tags} |
| `quizzes` | data | `quizzes/<module>.json` | module, questions[]{id,topic,kind,prompt,options,answer,explanation} |
| `code-exercises` | data | `code-exercises/<module>.json` | module, language, exercises[]{id,topic,title,kind,prompt,codeSnippet,answer,hints,explanation,solutionCode} |
| `practice-questions` | data | `practice-questions/<module>.json` | module, questions[]{id,topic,topicTitle,difficulty(1-5),title,totalMarks,prompt,hint,markscheme[],parts[]} |

### Component inventory (src/components/)

All interactive components are Preact (`/** @jsxImportSource preact */`), rendered with `client:load`.

| Component | Purpose | Used on |
|---|---|---|
| `Quiz.tsx` | MCQ/short/truefalse quiz with post-submit review | `/quiz/[module]` |
| `Flashcards.tsx` | SM-2 SRS flashcard deck | `/flashcards/[module]` |
| `CodingExercises.tsx` | OCaml/Java trace+code exercises with hints and solution reveal | `/coding/[module]` |
| `PracticeQuestions.tsx` | Practice questions with markschemes, topic+difficulty filter | `/practice/[module]` |
| `PracticePanel.tsx` | Compact 3-question panel with markscheme toggle | Topic pages |
| `PastQuestionsPanel.tsx` | Linked past Tripos questions with tried/nailed status | Topic pages |
| `PastPapersBrowser.tsx` | Full archive browser with year/paper/module/status filters | `/past-papers` |
| `ConfidenceButtons.tsx` | Per-topic weak/shaky/confident self-rating | Topic pages |
| `ProgressMap.tsx` | Dashboard: confidence distribution + quiz history | `/progress` |

### localStorage keys (src/lib/progress-store.ts)

All under `piarev:` namespace.

| Key | Type | Purpose |
|---|---|---|
| `piarev:confidence` | `Record<"module/topic", Confidence>` | Per-topic self-rating |
| `piarev:srs` | `Record<cardId, SrsCardState>` | SM-2 flashcard intervals |
| `piarev:quiz` | `QuizResult[]` | Quiz score history (capped 200) |
| `piarev:recent-topics` | `{id,title,href,ts}[]` | Last 12 visited topics |
| `piarev:questions` | `Record<"YYYY-P#-Q#", QuestionStatus>` | Past paper tried/nailed |
| `piarev:practice` | `Record<questionId, PracticeStatus>` | Practice question attempted/got-it |
