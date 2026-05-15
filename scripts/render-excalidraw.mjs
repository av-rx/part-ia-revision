#!/usr/bin/env node
/**
 * render-excalidraw.mjs
 * ---------------------
 * Convert each *.excalidraw.md file recorded by sync-vault.mjs into a static
 * SVG under public/diagrams/<module>/<slug>.svg.
 *
 * The Obsidian Excalidraw plugin stores drawings as base64-encoded LZString-
 * compressed JSON in a fenced ```compressed-json block, sometimes split across
 * multiple lines. We:
 *   1. Strip the fence
 *   2. Strip whitespace
 *   3. Decompress with lz-string's decompressFromBase64
 *   4. Parse the resulting JSON, extract `elements` and `appState`
 *   5. Hand-roll an SVG from those primitives.
 *
 * We do not depend on @excalidraw/excalidraw (which needs a DOM). Hand-rolling
 * supports the subset Avaneesh actually uses: rectangles, ellipses, diamonds,
 * arrows/lines, freedraw paths, and text. Anything fancier falls back to a
 * placeholder SVG that links to the source file.
 */

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import LZString from 'lz-string';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GENERATED = path.join(ROOT, 'src/content/_generated');
const DIAGRAMS_OUT = path.join(ROOT, 'public/diagrams');

async function main() {
  await fs.remove(DIAGRAMS_OUT);
  await fs.ensureDir(DIAGRAMS_OUT);

  const lists = await fs.readdir(GENERATED);
  let total = 0, ok = 0, fallback = 0, fail = 0;

  for (const f of lists) {
    if (!f.startsWith('excalidraw-') || !f.endsWith('.json')) continue;
    const items = await fs.readJSON(path.join(GENERATED, f));
    for (const it of items) {
      total++;
      try {
        const raw = await fs.readFile(it.vaultPath, 'utf8');
        const scene = decodeExcalidraw(raw);
        const svg = renderSceneToSVG(scene, it.basename);
        const out = path.join(DIAGRAMS_OUT, it.module, it.outName);
        await fs.ensureDir(path.dirname(out));
        await fs.writeFile(out, svg, 'utf8');
        ok++;
      } catch (e) {
        // Write a placeholder so embeds don't 404.
        const out = path.join(DIAGRAMS_OUT, it.module, it.outName);
        await fs.ensureDir(path.dirname(out));
        await fs.writeFile(out, placeholderSVG(it.basename, e.message), 'utf8');
        fallback++;
      }
    }
  }
  console.log(`✓ Excalidraw render: ${ok} ok, ${fallback} placeholder, ${fail} fail (of ${total})`);
}

function decodeExcalidraw(markdown) {
  // The compressed-json fence may be split across lines for editor wrapping.
  const m = markdown.match(/```compressed-json\s*([\s\S]*?)```/);
  if (!m) throw new Error('no compressed-json block');
  const compressed = m[1].replace(/\s+/g, '');
  const json = LZString.decompressFromBase64(compressed);
  if (!json) throw new Error('lzstring decompression failed');
  return JSON.parse(json);
}

function renderSceneToSVG(scene, label) {
  const elements = scene.elements ?? [];
  if (elements.length === 0) return placeholderSVG(label, 'empty scene');

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    if (el.isDeleted) continue;
    const x = el.x ?? 0, y = el.y ?? 0, w = el.width ?? 0, h = el.height ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }
  if (!isFinite(minX)) return placeholderSVG(label, 'no visible elements');
  const pad = 20;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${Math.round(width)}" height="${Math.round(height)}" font-family="Virgil, Inter, sans-serif" stroke-linecap="round" stroke-linejoin="round">`,
  );
  parts.push('<style>text{dominant-baseline:hanging;}</style>');
  // Background optional — skip; pages decide bg

  // First, a "marker" defs section for arrows
  parts.push(
    `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/></marker></defs>`,
  );

  for (const el of elements) {
    if (el.isDeleted) continue;
    parts.push(renderElement(el));
  }
  parts.push('</svg>');
  return parts.join('');
}

function escapeText(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function colorOrNone(c) {
  if (!c || c === 'transparent') return 'none';
  return c;
}

function fillStyleAttr(el) {
  // Excalidraw fillStyle: solid, hachure, cross-hatch, dots, dashed
  // We approximate everything as solid; transparent for "hachure" with no fill.
  const fill = colorOrNone(el.backgroundColor);
  return fill;
}

function strokeStyleAttr(el) {
  const stroke = el.strokeColor ?? '#000';
  const w = el.strokeWidth ?? 1;
  let dash = '';
  if (el.strokeStyle === 'dashed') dash = ` stroke-dasharray="${w * 4} ${w * 2}"`;
  else if (el.strokeStyle === 'dotted') dash = ` stroke-dasharray="${w} ${w * 2}"`;
  return `stroke="${stroke}" stroke-width="${w}"${dash}`;
}

function renderElement(el) {
  const opacity = (el.opacity ?? 100) / 100;
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  const angle = el.angle ?? 0;
  const tx = (el.x ?? 0) + (el.width ?? 0) / 2;
  const ty = (el.y ?? 0) + (el.height ?? 0) / 2;
  const rot = angle ? ` transform="rotate(${(angle * 180) / Math.PI} ${tx} ${ty})"` : '';

  switch (el.type) {
    case 'rectangle': {
      const r = el.roundness ? Math.min(el.width ?? 0, el.height ?? 0) * 0.1 : 0;
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${r}" ry="${r}" fill="${fillStyleAttr(el)}" ${strokeStyleAttr(el)}${op}${rot}/>`;
    }
    case 'ellipse': {
      const cx = (el.x ?? 0) + (el.width ?? 0) / 2;
      const cy = (el.y ?? 0) + (el.height ?? 0) / 2;
      const rx = (el.width ?? 0) / 2;
      const ry = (el.height ?? 0) / 2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fillStyleAttr(el)}" ${strokeStyleAttr(el)}${op}${rot}/>`;
    }
    case 'diamond': {
      const x = el.x ?? 0, y = el.y ?? 0, w = el.width ?? 0, h = el.height ?? 0;
      const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
      return `<polygon points="${pts}" fill="${fillStyleAttr(el)}" ${strokeStyleAttr(el)}${op}${rot}/>`;
    }
    case 'line':
    case 'arrow': {
      const pts = (el.points ?? []).map(([dx, dy]) => `${(el.x ?? 0) + dx},${(el.y ?? 0) + dy}`).join(' ');
      const arrows = el.type === 'arrow' ? ' marker-end="url(#arrow)"' : '';
      const startArrow = el.startArrowhead ? ' marker-start="url(#arrow)"' : '';
      return `<polyline points="${pts}" fill="none" ${strokeStyleAttr(el)}${arrows}${startArrow}${op}${rot}/>`;
    }
    case 'freedraw': {
      const pts = (el.points ?? []).map(([dx, dy]) => `${(el.x ?? 0) + dx},${(el.y ?? 0) + dy}`).join(' ');
      return `<polyline points="${pts}" fill="none" ${strokeStyleAttr(el)}${op}${rot}/>`;
    }
    case 'text': {
      const fs = el.fontSize ?? 16;
      const family = el.fontFamily === 1 ? 'Virgil, sans-serif' : el.fontFamily === 2 ? 'Helvetica, sans-serif' : 'Cascadia, monospace';
      const color = el.strokeColor ?? '#000';
      const lines = String(el.text ?? '').split('\n');
      const tspans = lines
        .map((ln, i) => `<tspan x="${el.x}" dy="${i === 0 ? 0 : fs * 1.2}">${escapeText(ln)}</tspan>`)
        .join('');
      return `<text x="${el.x}" y="${el.y}" fill="${color}" font-size="${fs}" font-family="${family}" text-anchor="${el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'}"${op}${rot}>${tspans}</text>`;
    }
    case 'image': {
      // We don't have image data; leave a stub so the SVG renders.
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="6 4"/>` +
        `<text x="${(el.x ?? 0) + 8}" y="${(el.y ?? 0) + 16}" font-size="12" fill="#475569">[image]</text>`;
    }
    default:
      return ''; // ignore unsupported (frame, embeddable, …)
  }
}

function placeholderSVG(label, reason) {
  const text = escapeText(`${label} — render skipped (${reason})`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" width="480" height="80"><rect width="100%" height="100%" fill="#fef9c3" stroke="#facc15"/><text x="12" y="38" font-family="Inter,sans-serif" font-size="14" fill="#854d0e">${text}</text></svg>`;
}

main().catch((e) => { console.error(e); process.exit(1); });
