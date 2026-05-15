#!/usr/bin/env node
/**
 * audit-coverage.mjs
 * ------------------
 * Cross-checks `src/lib/syllabus.ts` against the synced and authored content,
 * printing any gaps. Run before exam day with:
 *
 *   npm run audit
 */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const NOTES = path.join(ROOT, 'src/content/notes');
const CHEATSHEETS = path.join(ROOT, 'src/content/cheatsheets');
const QUIZZES = path.join(ROOT, 'src/content/quizzes');
const FLASHCARDS = path.join(ROOT, 'src/content/flashcards');
const SUPPLEMENTS = path.join(ROOT, 'src/content/supplements');
const SYLLABUS = path.join(ROOT, 'src/lib/syllabus.ts');

function extractFromSyllabusSource(src) {
  const Q = `(?:'([^'\\n]*)'|"([^"\\n]*)")`;
  const moduleRe = new RegExp(
    `${Q}\\s*:\\s*\\{[^}]*?slug:\\s*${Q}[^}]*?vaultName:\\s*${Q}[^}]*?paper:\\s*${Q}[\\s\\S]*?topics:\\s*\\[(?<topicsBody>[\\s\\S]*?)\\][\\s\\S]*?\\}\\s*,`,
    'g',
  );
  const topicRe = new RegExp(
    `T\\(\\s*(?<order>\\d+)\\s*,\\s*${Q}\\s*,\\s*${Q}(?:\\s*,\\s*${Q})?\\s*\\)`,
    'g',
  );
  const supplementsRe = /supplements:\s*\[([^\]]*)\]/;
  const stringInArrayRe = /'([^']+)'|"([^"]+)"/g;

  const modules = [];
  for (const m of src.matchAll(moduleRe)) {
    const slug = m[1] ?? m[2];
    const topicsBody = m.groups.topicsBody;
    const topics = [];
    for (const t of topicsBody.matchAll(topicRe)) {
      const order = Number(t.groups.order);
      const tslug = (t[6] ?? t[7]) ?? slugify(t[4] ?? t[5]);
      topics.push({ order, slug: tslug });
    }
    // Look for supplements array near this module
    const block = m[0];
    const supMatch = block.match(supplementsRe);
    const supplements = [];
    if (supMatch) {
      for (const s of supMatch[1].matchAll(stringInArrayRe)) {
        supplements.push(s[1] ?? s[2]);
      }
    }
    modules.push({ slug, topics, supplements });
  }
  return modules;
}

function slugify(s) {
  return s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function exists(p) { return fs.pathExists(p); }
const COLOR = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function main() {
  const src = await fs.readFile(SYLLABUS, 'utf8');
  const modules = extractFromSyllabusSource(src);

  let missingTopicNotes = 0;
  let missingSupplements = 0;
  let modulesWithoutCheatsheet = 0;
  let modulesWithoutQuiz = 0;
  let modulesWithoutFlashcards = 0;

  console.log(COLOR.bold('Module coverage audit\n'));
  console.log('Slug                                       | Topics | Notes | Suppl. | C | Q | F | Flashcards#');
  console.log('-------------------------------------------+--------+-------+--------+---+---+---+------------');

  for (const m of modules) {
    let notes = 0;
    for (const t of m.topics) {
      if (await exists(path.join(NOTES, m.slug, `${t.slug}.md`))) notes++;
      else missingTopicNotes++;
    }
    let suppl = 0;
    const expectedSuppl = m.supplements ?? [];
    for (const s of expectedSuppl) {
      if (await exists(path.join(SUPPLEMENTS, m.slug, `${s}.md`))) suppl++;
      else missingSupplements++;
    }
    const hasCheat = (await exists(path.join(CHEATSHEETS, `${m.slug}.mdx`))) || (await exists(path.join(CHEATSHEETS, `${m.slug}.md`)));
    const hasQuiz = await exists(path.join(QUIZZES, `${m.slug}.json`));
    const hasFlash = await exists(path.join(FLASHCARDS, `${m.slug}.json`));
    let flashCount = 0;
    if (hasFlash) {
      try {
        const raw = await fs.readJSON(path.join(FLASHCARDS, `${m.slug}.json`));
        flashCount = (raw.cards ?? []).length;
      } catch {}
    }
    if (!hasCheat) modulesWithoutCheatsheet++;
    if (!hasQuiz) modulesWithoutQuiz++;
    if (!hasFlash) modulesWithoutFlashcards++;

    const line = [
      m.slug.padEnd(42),
      String(m.topics.length).padStart(6),
      `${notes}/${m.topics.length}`.padStart(5),
      `${suppl}/${expectedSuppl.length}`.padStart(6),
      hasCheat ? COLOR.green('✓') : COLOR.red('✗'),
      hasQuiz ? COLOR.green('✓') : COLOR.red('✗'),
      hasFlash ? COLOR.green('✓') : COLOR.red('✗'),
      String(flashCount).padStart(11),
    ];
    console.log(line.join(' | '));
  }

  console.log('');
  if (missingTopicNotes === 0) console.log(COLOR.green('✓ All syllabus topics have synced notes.'));
  else console.log(COLOR.yellow(`! ${missingTopicNotes} topics missing notes — run \`npm run sync\` or check the vault.`));

  if (missingSupplements === 0) console.log(COLOR.green('✓ All declared supplements are present.'));
  else console.log(COLOR.yellow(`! ${missingSupplements} supplements missing.`));

  if (modulesWithoutCheatsheet === 0) console.log(COLOR.green('✓ Every module has a cheat sheet.'));
  else console.log(COLOR.yellow(`! ${modulesWithoutCheatsheet} modules without cheat sheet.`));

  if (modulesWithoutQuiz === 0) console.log(COLOR.green('✓ Every module has a quiz.'));
  else console.log(COLOR.yellow(`! ${modulesWithoutQuiz} modules without quiz.`));

  if (modulesWithoutFlashcards === 0) console.log(COLOR.green('✓ Every module has a flashcard deck.'));
  else console.log(COLOR.yellow(`! ${modulesWithoutFlashcards} modules without flashcards.`));

  console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
