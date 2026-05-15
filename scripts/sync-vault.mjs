#!/usr/bin/env node
/**
 * sync-vault.mjs
 * --------------
 * Read-only sync from the user's Obsidian vault into this Astro project.
 * The vault is NEVER written to. Run repeatedly with `npm run sync`.
 *
 * What it does, per module in src/lib/syllabus.ts:
 *   1. Copies every numbered topic markdown into src/content/notes/<module>/<topic>.md
 *      with frontmatter (module, topic, paper, order, title) injected.
 *   2. Copies images from <Module>/Assets/*.png and <Module>/Images/*.png
 *      into public/images/<module>/.
 *   3. Copies Asset callout markdown (e.g. "1 - Half_Adder.md") into
 *      src/content/notes/<module>/_assets/ for transclusion.
 *   4. Records Excalidraw files for the renderer to pick up later.
 *   5. Writes wiki-link and embed manifests so the remark plugin can resolve
 *      [[Note]] and ![[Image.png]] references.
 *
 * Idempotent: existing notes/images are overwritten cleanly.
 */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import fg from 'fast-glob';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const VAULT = process.env.VAULT_PATH || (() => { throw new Error('Set VAULT_PATH env var to your Obsidian vault path'); })();
const NOTES_OUT = path.join(ROOT, 'src/content/notes');
const IMAGES_OUT = path.join(ROOT, 'public/images');
const DIAGRAMS_OUT = path.join(ROOT, 'public/diagrams');
const GENERATED = path.join(ROOT, 'src/content/_generated');

// Re-imported lazily so we don't choke if syllabus.ts changes shape.
const SYLLABUS_TS = path.join(ROOT, 'src/lib/syllabus.ts');

async function loadSyllabus() {
  // Pure import — but syllabus.ts uses TS. We can't import TS from Node directly,
  // so we read the file and extract module metadata via a tiny eval-free parser
  // OR use tsx. Simplest: parse the MODULES record by regex (we control the file).
  // Cleaner: write a small JSON mirror at sync time — but we can also do a dynamic
  // import via the .ts extension if we use a loader. Easiest is to mirror to
  // a JSON file that scripts can consume.
  //
  // Approach: read syllabus.ts, extract the shape we need with a tiny reflection.
  // We re-read the same file each run. To avoid the maintenance burden of two
  // sources of truth, we use the TypeScript compiler API isn't available here;
  // instead we keep this script's "what counts as a topic" list inline below.
  //
  // To stay aligned, we read the syllabus and parse the obvious patterns.
  const src = await fs.readFile(SYLLABUS_TS, 'utf8');
  return extractFromSyllabusSource(src);
}

/**
 * Tiny tolerant parser for src/lib/syllabus.ts. We rely on the structure being
 * stable: each module is a literal object inside MODULES, with `slug`, `vaultName`,
 * `paper`, `topics: [ T(order, vaultBasename, title, slug?), ... ]`.
 */
function extractFromSyllabusSource(src) {
  // Accepts strings in single or double quotes. Quotes can't appear inside
  // (we don't author them that way).
  const Q = `(?:'([^'\\n]*)'|"([^"\\n]*)")`;
  const moduleRe = new RegExp(
    `${Q}\\s*:\\s*\\{[^}]*?slug:\\s*${Q}[^}]*?vaultName:\\s*${Q}[^}]*?paper:\\s*${Q}[\\s\\S]*?topics:\\s*\\[(?<topicsBody>[\\s\\S]*?)\\][\\s\\S]*?\\}\\s*,`,
    'g',
  );
  const topicRe = new RegExp(
    `T\\(\\s*(?<order>\\d+)\\s*,\\s*${Q}\\s*,\\s*${Q}(?:\\s*,\\s*${Q})?\\s*\\)`,
    'g',
  );
  const modules = [];
  for (const m of src.matchAll(moduleRe)) {
    const slug = m[1] ?? m[2];
    const vaultName = m[5] ?? m[6];
    const paper = m[7] ?? m[8];
    const topicsBody = m.groups.topicsBody;
    const topics = [];
    for (const t of topicsBody.matchAll(topicRe)) {
      const order = Number(t.groups.order);
      const vaultBasename = t[2] ?? t[3];
      const title = t[4] ?? t[5];
      const slugFromSrc = t[6] ?? t[7];
      const tslug = slugFromSrc ?? slugify(title);
      topics.push({ order, vaultBasename, title, slug: tslug });
    }
    modules.push({ slug, vaultName, paper, topics });
  }
  return modules;
}

function slugify(s) {
  return s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeFm(s) {
  return s.replace(/"/g, '\\"');
}

const wikiManifest = {};
const embedManifest = {};

function registerWikiTarget(displayName, url) {
  // Allow lookup by basename (no .md), case-insensitive.
  wikiManifest[displayName.toLowerCase()] = url;
}
function registerEmbedTarget(name, payload) {
  embedManifest[name.toLowerCase()] = payload;
}

async function moduleFolderExists(mod) {
  return fs.pathExists(path.join(VAULT, mod.vaultName));
}

async function copyImages(mod) {
  // Search the whole module subtree for image files inside any Assets/ or
  // Images/ folder — Digital Electronics, NST Maths, etc. nest these per topic.
  const moduleRoot = path.join(VAULT, mod.vaultName);
  const dest = path.join(IMAGES_OUT, mod.slug);
  const matches = await fg(
    ['**/Assets/**/*.{png,jpg,jpeg,gif,svg,webp}', '**/Images/**/*.{png,jpg,jpeg,gif,svg,webp}'],
    { cwd: moduleRoot, dot: false },
  );
  let copied = 0;
  const seen = new Set();
  for (const rel of matches) {
    const base = path.basename(rel);
    if (seen.has(base.toLowerCase())) continue;          // avoid same-name collisions
    seen.add(base.toLowerCase());
    const from = path.join(moduleRoot, rel);
    const to = path.join(dest, base);
    await fs.ensureDir(path.dirname(to));
    await fs.copy(from, to, { overwrite: true });
    registerEmbedTarget(base, {
      kind: 'image',
      url: `/images/${mod.slug}/${encodeURIComponent(base)}`,
      alt: path.basename(base, path.extname(base)).replace(/_/g, ' '),
    });
    copied++;
  }
  return copied;
}

async function copyAssetSnippets(mod) {
  const src = path.join(VAULT, mod.vaultName, 'Assets');
  if (!(await fs.pathExists(src))) return 0;
  const mds = await fg(['*.md'], { cwd: src });
  if (mds.length === 0) return 0;
  const destDir = path.join(NOTES_OUT, mod.slug, '_assets');
  await fs.ensureDir(destDir);
  for (const rel of mds) {
    const from = path.join(src, rel);
    const to = path.join(destDir, rel);
    const body = await fs.readFile(from, 'utf8');
    await fs.writeFile(to, body, 'utf8');
    const basenameNoExt = path.basename(rel, '.md');
    registerEmbedTarget(basenameNoExt, {
      kind: 'transclude',
      title: basenameNoExt,
      // We fall back to a link; full HTML transclusion needs the renderer.
      url: '#',
      html: '',
    });
  }
  return mds.length;
}

async function recordExcalidrawFiles(mod) {
  const allMd = await fg(['**/*.excalidraw.md'], { cwd: path.join(VAULT, mod.vaultName) });
  const list = [];
  for (const rel of allMd) {
    const fullPath = path.join(VAULT, mod.vaultName, rel);
    const basenameNoExt = path.basename(rel, '.excalidraw.md');
    const slug = slugify(basenameNoExt);
    const url = `/diagrams/${mod.slug}/${slug}.svg`;
    list.push({ vaultPath: fullPath, basename: basenameNoExt, outName: `${slug}.svg`, url, module: mod.slug });
    registerEmbedTarget(basenameNoExt, {
      kind: 'image',
      url,
      alt: basenameNoExt,
    });
    // Excalidraw files can also be referenced as ![[Foo.excalidraw]]
    registerEmbedTarget(`${basenameNoExt}.excalidraw`, {
      kind: 'image',
      url,
      alt: basenameNoExt,
    });
  }
  return list;
}

async function syncModule(mod) {
  if (!(await moduleFolderExists(mod))) {
    console.warn(`! Missing vault folder for module: ${mod.vaultName}`);
    return { topics: 0, images: 0, assets: 0, diagrams: 0 };
  }

  const moduleOut = path.join(NOTES_OUT, mod.slug);
  await fs.ensureDir(moduleOut);

  // Sync topic markdown
  let topicCount = 0;
  for (const topic of mod.topics) {
    const candidates = [
      path.join(VAULT, mod.vaultName, `${topic.vaultBasename}.md`),
      path.join(VAULT, mod.vaultName, topic.vaultBasename, `${topic.vaultBasename}.md`),
      path.join(VAULT, mod.vaultName, topic.vaultBasename, `${path.basename(topic.vaultBasename)}.md`),
    ];
    let resolvedPath = null;
    for (const c of candidates) {
      if (await fs.pathExists(c)) { resolvedPath = c; break; }
    }

    // For folders without a topic-named md (Discrete Maths, Probability, ML),
    // we synthesise an index from all md files inside the folder.
    if (!resolvedPath) {
      const folder = path.join(VAULT, mod.vaultName, topic.vaultBasename);
      if (await fs.pathExists(folder)) {
        const childMd = await fg(['**/*.md'], { cwd: folder, ignore: ['**/Excalidraw/**', '**/excalidraw/**'] });
        if (childMd.length > 0) {
          const body = await synthesiseTopicFromFolder(folder, childMd, topic, mod);
          const out = path.join(moduleOut, `${topic.slug}.md`);
          await fs.writeFile(out, body, 'utf8');
          registerWikiTarget(topic.title, `/modules/${mod.slug}/${topic.slug}`);
          registerWikiTarget(topic.vaultBasename, `/modules/${mod.slug}/${topic.slug}`);
          registerWikiTarget(path.basename(topic.vaultBasename), `/modules/${mod.slug}/${topic.slug}`);
          topicCount++;
          continue;
        }
      }
      console.warn(`  ! No source for ${mod.slug} / ${topic.vaultBasename}`);
      continue;
    }

    let body = await fs.readFile(resolvedPath, 'utf8');
    // Strip any existing frontmatter (the vault doesn't use it, but be safe).
    if (body.startsWith('---')) {
      body = body.replace(/^---[\s\S]*?---\s*\n/, '');
    }
    // Inject our frontmatter
    const fm = [
      '---',
      `module: "${mod.slug}"`,
      `moduleTitle: "${escapeFm(mod.vaultName)}"`,
      `paper: "${mod.paper}"`,
      `topic: "${escapeFm(topic.title)}"`,
      `topicSlug: "${topic.slug}"`,
      `title: "${escapeFm(topic.title)}"`,
      `order: ${topic.order}`,
      `sourcePath: "${escapeFm(path.relative(VAULT, resolvedPath).replace(/\\/g, '/'))}"`,
      `isSupplement: false`,
      '---',
      '',
    ].join('\n');

    const out = path.join(moduleOut, `${topic.slug}.md`);
    await fs.writeFile(out, fm + body, 'utf8');

    // Register wiki targets:
    //  - by topic title          (our chosen display name)
    //  - by vault basename        (e.g. "1 - Sorting")
    //  - by display title         (without leading "N - ")
    registerWikiTarget(topic.title, `/modules/${mod.slug}/${topic.slug}`);
    registerWikiTarget(topic.vaultBasename, `/modules/${mod.slug}/${topic.slug}`);
    const displayOnly = topic.vaultBasename.replace(/^\d+\s*-\s*/, '').trim();
    registerWikiTarget(displayOnly, `/modules/${mod.slug}/${topic.slug}`);
    topicCount++;
  }

  const images = await copyImages(mod);
  const assets = await copyAssetSnippets(mod);
  const diagrams = await recordExcalidrawFiles(mod);

  // Save diagram-list to be read by render-excalidraw.mjs
  const diagListFile = path.join(GENERATED, `excalidraw-${mod.slug}.json`);
  await fs.ensureDir(path.dirname(diagListFile));
  await fs.writeJSON(diagListFile, diagrams, { spaces: 2 });

  return { topics: topicCount, images, assets, diagrams: diagrams.length };
}

async function synthesiseTopicFromFolder(folder, childMd, topic, mod) {
  // For modules where each "topic" is a folder rather than a file
  // (Discrete Maths, Probability, ML & RWD, NST Maths), we synthesise a
  // topic page that lists/links the per-lecture notes inside.
  const lines = [];
  lines.push('---');
  lines.push(`module: "${mod.slug}"`);
  lines.push(`moduleTitle: "${escapeFm(mod.vaultName)}"`);
  lines.push(`paper: "${mod.paper}"`);
  lines.push(`topic: "${escapeFm(topic.title)}"`);
  lines.push(`topicSlug: "${topic.slug}"`);
  lines.push(`title: "${escapeFm(topic.title)}"`);
  lines.push(`order: ${topic.order}`);
  lines.push(`sourcePath: "${escapeFm(path.relative(VAULT, folder).replace(/\\/g, '/'))}"`);
  lines.push(`isSupplement: false`);
  lines.push('---');
  lines.push('');
  lines.push(`## ${topic.title}`);
  lines.push('');

  // sort by leading number if present
  const sorted = [...childMd].sort((a, b) => {
    const na = parseInt(path.basename(a)) || 999;
    const nb = parseInt(path.basename(b)) || 999;
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
  for (const rel of sorted) {
    if (rel.endsWith('.excalidraw.md')) continue;
    const fullPath = path.join(folder, rel);
    let body = await fs.readFile(fullPath, 'utf8');
    if (body.startsWith('---')) body = body.replace(/^---[\s\S]*?---\s*\n/, '');
    const lectureTitle = path.basename(rel, '.md');
    lines.push(`### ${lectureTitle}`);
    lines.push('');
    lines.push(body.trim());
    lines.push('');
  }

  // List Excalidraw files explicitly so the user sees them rendered.
  const excaliRel = await fg(['**/*.excalidraw.md'], { cwd: folder });
  if (excaliRel.length > 0) {
    lines.push('---');
    lines.push('### Diagrams');
    lines.push('');
    for (const rel of excaliRel) {
      const basenameNoExt = path.basename(rel, '.excalidraw.md');
      lines.push(`![[${basenameNoExt}]]`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

async function main() {
  console.log('• Reading syllabus…');
  const modules = await loadSyllabus();
  console.log(`  ${modules.length} modules loaded.`);

  // Wipe synced output but keep _generated and _assets re-created cleanly
  await fs.remove(NOTES_OUT);
  await fs.ensureDir(NOTES_OUT);
  await fs.remove(IMAGES_OUT);
  await fs.ensureDir(IMAGES_OUT);
  await fs.ensureDir(GENERATED);

  let totals = { topics: 0, images: 0, assets: 0, diagrams: 0 };
  for (const mod of modules) {
    process.stdout.write(`  · ${mod.slug.padEnd(38)} `);
    const r = await syncModule(mod);
    console.log(`topics=${r.topics}  imgs=${r.images}  assets=${r.assets}  diagrams=${r.diagrams}`);
    totals.topics += r.topics; totals.images += r.images; totals.assets += r.assets; totals.diagrams += r.diagrams;
  }

  await fs.writeJSON(path.join(GENERATED, 'wiki-links.json'), wikiManifest, { spaces: 2 });
  await fs.writeJSON(path.join(GENERATED, 'embed-links.json'), embedManifest, { spaces: 2 });

  console.log('');
  console.log(`✓ Synced ${totals.topics} topic pages, ${totals.images} images, ${totals.assets} asset snippets, ${totals.diagrams} Excalidraw diagrams.`);
  console.log(`  Manifests written to src/content/_generated/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
