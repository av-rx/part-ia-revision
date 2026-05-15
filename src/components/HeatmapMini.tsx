/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { MODULE_ORDER, MODULES } from '../lib/syllabus';
import { getAllConfidence, type Confidence } from '../lib/progress-store';

const COLORS: Record<Confidence, string> = {
  unset: 'bg-ink-200 dark:bg-ink-800',
  weak: 'bg-rose-400',
  shaky: 'bg-amber-400',
  confident: 'bg-emerald-500',
};

export default function HeatmapMini() {
  const [conf, setConf] = useState<Record<string, Confidence>>({});
  useEffect(() => { setConf(getAllConfidence()); }, []);

  return (
    <div class="space-y-2">
      {MODULE_ORDER.map((slug) => {
        const m = MODULES[slug];
        return (
          <div class="flex items-center gap-3">
            <a href={`/modules/${slug}`} class="text-sm w-44 truncate text-ink-700 dark:text-ink-200 hover:text-accent-700">{m.short}</a>
            <div class="flex flex-1 gap-0.5">
              {m.topics.map((t) => {
                const c = conf[`${slug}/${t.slug}`] ?? 'unset';
                return (
                  <a
                    href={`/modules/${slug}/${t.slug}`}
                    class={`h-3 flex-1 rounded-sm ${COLORS[c]}`}
                    title={`${t.title} — ${c}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div class="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400 mt-3">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-emerald-500"></span>confident</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-amber-400"></span>shaky</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-rose-400"></span>not yet</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-ink-300 dark:bg-ink-700"></span>unset</span>
      </div>
    </div>
  );
}
