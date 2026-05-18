// Remark plugin: rewrites Obsidian-flavoured links inside synced notes.
//
//   [[Topic Name]]                 → <a href="/modules/<module>/<topic-slug>">Topic Name</a>
//   [[Topic|Display]]              → <a href=...>Display</a>
//   ![[Image.png]]                 → <img src="/images/<module>/Image.png" />
//   ![[Some.excalidraw]]           → <img src="/diagrams/<module>/Some.svg" />
//   ![[Snippet]]                   → blockquote transclusion (resolved at sync time
//                                    as raw <details>… or simple link if unresolvable)
//
// Resolution uses two manifests written by `scripts/sync-vault.mjs`:
//   src/content/_generated/wiki-links.json
//   src/content/_generated/embed-links.json
//
// If a link target isn't found we leave the original text in place and add a
// "broken-wikilink" class so it's visible during dev.

import { visit } from 'unist-util-visit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = path.resolve(__dirname, '..', 'content', '_generated');
const WIKI_PATH = path.join(MANIFEST_DIR, 'wiki-links.json');
const EMBED_PATH = path.join(MANIFEST_DIR, 'embed-links.json');

function loadManifest(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

let _wiki = null;
let _embed = null;

function manifests() {
  if (_wiki === null) _wiki = loadManifest(WIKI_PATH);
  if (_embed === null) _embed = loadManifest(EMBED_PATH);
  return { wiki: _wiki, embed: _embed };
}

const WIKI_RE = /\[\[([^\[\]\n]+?)\]\]/g;
const EMBED_RE = /!\[\[([^\[\]\n]+?)\]\]/g;

function resolveWiki(target, wikiManifest) {
  // strip trailing #anchor and |display
  let display = null;
  let key = target;
  if (key.includes('|')) {
    const parts = key.split('|');
    key = parts[0].trim();
    display = parts.slice(1).join('|').trim();
  }
  let anchor = '';
  if (key.includes('#')) {
    const i = key.indexOf('#');
    anchor = '#' + slugify(key.slice(i + 1));
    key = key.slice(0, i).trim();
  }
  const lookup = key.toLowerCase();
  const hit = wikiManifest[lookup];
  if (!hit) return { href: null, display: display ?? key };
  return { href: hit + anchor, display: display ?? key };
}

function resolveEmbed(target, embedManifest) {
  // foo.png | foo.excalidraw | "Note Name" — strip optional |size modifier
  let key = target.trim();
  let width = null;
  if (key.includes('|')) {
    const [name, ...rest] = key.split('|');
    key = name.trim();
    const w = rest.join('|').trim();
    if (/^\d+$/.test(w)) width = Number(w);
  }
  const hit = embedManifest[key.toLowerCase()] ?? null;
  return hit ? { ...hit, width } : null;
}

function slugify(s) {
  return s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function remarkObsidianLinks() {
  return (tree) => {
    const { wiki, embed } = manifests();

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null) return;
      const value = node.value;
      if (!value.includes('[[')) return;

      // Split text into nodes: text | link/image
      const newNodes = [];
      let last = 0;
      const matches = [];

      // Collect ![[…]] first (so they take priority over [[…]] inside)
      for (const m of value.matchAll(EMBED_RE)) {
        matches.push({ kind: 'embed', start: m.index, end: m.index + m[0].length, raw: m[1] });
      }
      // Then [[…]] but only those that don't overlap an embed.
      for (const m of value.matchAll(WIKI_RE)) {
        const overlaps = matches.some(
          (e) => e.kind === 'embed' && m.index >= e.start - 1 && m.index < e.end,
        );
        if (overlaps) continue;
        matches.push({ kind: 'wiki', start: m.index, end: m.index + m[0].length, raw: m[1] });
      }
      matches.sort((a, b) => a.start - b.start);
      if (matches.length === 0) return;

      for (const match of matches) {
        if (match.start > last) {
          newNodes.push({ type: 'text', value: value.slice(last, match.start) });
        }
        if (match.kind === 'wiki') {
          // [[file.excalidraw]] — Obsidian sometimes omits the ! for diagram embeds
          const wikiKey = match.raw.split('|')[0].trim();
          if (wikiKey.toLowerCase().endsWith('.excalidraw')) {
            const resolved = resolveEmbed(wikiKey, embed);
            if (resolved?.kind === 'image') {
              newNodes.push({ type: 'image', url: resolved.url, alt: resolved.alt ?? wikiKey, data: { hProperties: { loading: 'lazy', class: 'embed-image' } } });
            } else {
              newNodes.push({ type: 'html', value: `<span class="embed-broken" title="Unresolved embed: ${escapeHtml(wikiKey)}">⟦${escapeHtml(wikiKey)}⟧</span>` });
            }
          } else {
          const { href, display } = resolveWiki(match.raw, wiki);
          if (href) {
            newNodes.push({
              type: 'link',
              url: href,
              data: { hProperties: { class: 'wikilink' } },
              children: [{ type: 'text', value: display }],
            });
          } else {
            newNodes.push({
              type: 'html',
              value: `<span class="wikilink wikilink-broken" title="Unresolved link: ${escapeHtml(match.raw)}">${escapeHtml(display)}</span>`,
            });
          }
          }
        } else {
          const resolved = resolveEmbed(match.raw, embed);
          if (resolved?.kind === 'image') {
            newNodes.push({
              type: 'image',
              url: resolved.url,
              alt: resolved.alt ?? match.raw,
              data: { hProperties: { loading: 'lazy', class: 'embed-image', ...(resolved.width && { width: resolved.width }) } },
            });
          } else if (resolved?.kind === 'transclude') {
            newNodes.push({
              type: 'html',
              value:
                `<aside class="transclusion" data-source="${escapeHtml(resolved.title ?? match.raw)}">` +
                `<header>↳ <a href="${resolved.url}">${escapeHtml(resolved.title ?? match.raw)}</a></header>` +
                `<div class="transclusion-body">${resolved.html ?? ''}</div></aside>`,
            });
          } else {
            newNodes.push({
              type: 'html',
              value: `<span class="embed-broken" title="Unresolved embed: ${escapeHtml(match.raw)}">⟦${escapeHtml(match.raw)}⟧</span>`,
            });
          }
        }
        last = match.end;
      }
      if (last < value.length) {
        newNodes.push({ type: 'text', value: value.slice(last) });
      }
      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
