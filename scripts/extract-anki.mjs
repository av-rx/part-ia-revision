#!/usr/bin/env node
/**
 * extract-anki.mjs
 * ----------------
 * Reads the user's existing Anki .colpkg deck and writes per-module flashcard
 * JSON into src/content/flashcards/.
 *
 * The .colpkg is a zip; inside it, `collection.anki21b` is zstd-compressed
 * SQLite. Extraction needs `unzip` and `zstd` — these aren't always on PATH on
 * Windows, so this script:
 *   1. Re-uses a cached extract at scripts/.cache/collection.anki21 if present.
 *   2. Otherwise prints a one-line bash command the user can run to extract.
 *
 * Maps Anki deck names to our module slugs from src/lib/syllabus.ts.
 */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DB = path.join(ROOT, 'scripts/.cache/collection.anki21');
const PKG = process.env.ANKI_PKG || (() => { throw new Error('Set ANKI_PKG env var to your .colpkg path'); })();
const OUT = path.join(ROOT, 'src/content/flashcards');

const SQLITE = process.env.SQLITE_PATH || resolveSqlite();

function resolveSqlite() {
  const candidates = [
    'sqlite3',
  ];
  for (const c of candidates) {
    try {
      execFileSync(c, ['-version'], { stdio: 'ignore' });
      return c;
    } catch {}
  }
  return 'sqlite3';
}

const DECK_TO_MODULE = {
  'Databases': 'databases',
  'Operating Systems': 'operating-systems',
  'Discrete Mathematics': 'discrete-maths',
  'OOP': 'object-oriented-programming',
  'Intoduction to Graphics': 'introduction-to-graphics', // sic in deck name
  'Introduction to Graphics': 'introduction-to-graphics',
};

const MODULE_TITLES = {
  'databases': 'Databases',
  'operating-systems': 'Operating Systems',
  'discrete-maths': 'Discrete Mathematics',
  'object-oriented-programming': 'Object-Oriented Programming',
  'introduction-to-graphics': 'Introduction to Graphics',
};

function sqliteQuery(db, sql) {
  return execFileSync(SQLITE, [db, sql], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

// sqlite3 CLI converts control chars (e.g. char(30)=0x1E) to printable form (^^),
// so we use a multi-byte separator unlikely to appear in card text.
const ROW_SEP = '';
function sqliteQueryRows(db, sql) {
  // We embed our separator literally in the SQL projection.
  return sqliteQuery(db, sql).split(/\r?\n/).filter((s) => s.length > 0);
}

async function ensureExtractedDb() {
  if (await fs.pathExists(CACHE_DB)) return CACHE_DB;
  console.error(`Cached Anki DB not found at ${CACHE_DB}.`);
  console.error('To create it (one-time), run this in Git Bash:');
  console.error('  mkdir -p scripts/.cache && \\');
  console.error('  TMP=$(mktemp -d) && cp ' + JSON.stringify(PKG) + ' "$TMP/pkg.zip" && \\');
  console.error('  (cd "$TMP" && unzip -o pkg.zip > /dev/null && zstd -d collection.anki21b -o collection.anki21 -f) && \\');
  console.error('  cp "$TMP/collection.anki21" scripts/.cache/collection.anki21');
  process.exit(1);
}

async function main() {
  const dbPath = await ensureExtractedDb();

  console.log('• Reading decks…');
  const SEP = '~~~~';
  const decksOut = sqliteQuery(dbPath, `SELECT id || '${SEP}' || name FROM decks;`).trim();
  const deckById = new Map();
  for (const line of decksOut.split(/\r?\n/)) {
    const i = line.indexOf(SEP);
    if (i < 0) continue;
    deckById.set(line.slice(0, i), line.slice(i + SEP.length));
  }

  console.log(`  ${deckById.size} decks loaded`);

  console.log('• Reading notes…');
  // Anki's note.flds field separator is \x1f. We project rows with our own row
  // separator and use a literal "~~ROW~~" between major fields.
  const FSEP = '~~F~~';
  const notesOut = sqliteQuery(
    dbPath,
    `SELECT n.id || '${FSEP}' || c.did || '${FSEP}' || n.flds
       FROM notes n
       JOIN cards c ON c.nid = n.id
       GROUP BY n.id;`,
  );

  const byModule = new Map();
  let kept = 0, dropped = 0;

  // Note rows can contain newlines inside flds. We rely on FSEP to join rows.
  // sqlite3 puts a literal \n between rows, so we re-glue any continuation lines
  // that don't begin with a row that has FSEP appearing twice.
  const rawLines = notesOut.split(/\r?\n/);
  const stitched = [];
  for (const line of rawLines) {
    if (line.indexOf(FSEP) >= 0 && line.indexOf(FSEP, line.indexOf(FSEP) + 1) >= 0) {
      stitched.push(line);
    } else if (stitched.length > 0) {
      stitched[stitched.length - 1] += '\n' + line;
    }
  }
  for (const row of stitched) {
    const i1 = row.indexOf(FSEP);
    const i2 = row.indexOf(FSEP, i1 + FSEP.length);
    if (i1 < 0 || i2 < 0) continue;
    const noteId = row.slice(0, i1);
    const did = row.slice(i1 + FSEP.length, i2);
    const flds = row.slice(i2 + FSEP.length);
    const deckName = deckById.get(did) ?? '';
    const segs = deckName.split(/\x1f|\^_/);
    const moduleName = segs[2] ?? null;
    const topicName = segs.slice(3).join(' / ') || null;
    const moduleSlug = DECK_TO_MODULE[moduleName ?? ''];
    if (!moduleSlug) { dropped++; continue; }

    const fieldParts = flds.split('\x1f');
    const front = fieldParts[0] ?? '';
    const back = fieldParts.slice(1).join('\n\n---\n\n');
    if (!front.trim()) { dropped++; continue; }

    if (!byModule.has(moduleSlug)) byModule.set(moduleSlug, []);
    byModule.get(moduleSlug).push({
      id: `anki-${noteId}`,
      front: cleanHtml(front),
      back: cleanHtml(back),
      topic: topicName ?? '',
      sourceDeck: deckName,
      tags: ['anki'],
    });
    kept++;
  }

  console.log(`  kept=${kept} dropped=${dropped}`);

  await fs.ensureDir(OUT);
  for (const [slug, cards] of byModule) {
    cards.sort((a, b) => (a.topic ?? '').localeCompare(b.topic ?? ''));
    const file = path.join(OUT, `${slug}.json`);
    await fs.writeJSON(file, {
      module: slug,
      title: MODULE_TITLES[slug] ?? slug,
      cards,
    }, { spaces: 2 });
    console.log(`  · ${slug.padEnd(38)} ${cards.length} cards → src/content/flashcards/${slug}.json`);
  }

  console.log(`✓ Anki extraction complete: ${byModule.size} modules, ${kept} cards.`);
}

function cleanHtml(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/<div\s*>/gi, '<br>')
    .replace(/<\/div>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .replace(/&amp;/g, '&')
    .trim();
}

main().catch((e) => { console.error(e); process.exit(1); });
