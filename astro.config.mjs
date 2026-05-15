import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidianLinks } from './src/lib/remark-obsidian-links.mjs';

export default defineConfig({
  site: 'http://localhost:4321',
  trailingSlash: 'never',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    preact({ compat: true }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkObsidianLinks],
    rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]],
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  vite: {
    server: { fs: { strict: false } },
  },
});
