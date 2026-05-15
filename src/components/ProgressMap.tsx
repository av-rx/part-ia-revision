/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { MODULE_ORDER, MODULES, PAPERS } from '../lib/syllabus';
import { getAllConfidence, getQuizResults, type Confidence } from '../lib/progress-store';

const COLORS: Record<Confidence, string> = {
  unset: 'bg-ink-200 dark:bg-ink-800',
  weak: 'bg-rose-500',
  shaky: 'bg-amber-400',
  confident: 'bg-emerald-500',
};

export default function ProgressMap() {
  const [conf, setConf] = useState<Record<string, Confidence>>({});
  const [results, setResults] = useState<ReturnType<typeof getQuizResults>>([]);
  useEffect(() => {
    setConf(getAllConfidence());
    setResults(getQuizResults());
  }, []);

  const totals = MODULE_ORDER.map((slug) => {
    const m = MODULES[slug];
    const counts = { confident: 0, shaky: 0, weak: 0, unset: 0 };
    for (const t of m.topics) {
      const c = conf[`${slug}/${t.slug}`] ?? 'unset';
      counts[c]++;
    }
    return { slug, m, counts };
  });

  const overall = { confident: 0, shaky: 0, weak: 0, unset: 0, total: 0 };
  totals.forEach(({ counts }) => {
    overall.confident += counts.confident;
    overall.shaky += counts.shaky;
    overall.weak += counts.weak;
    overall.unset += counts.unset;
    overall.total += counts.confident + counts.shaky + counts.weak + counts.unset;
  });

  return (
    <div class="space-y-6">
      <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
        <h2 class="font-bold text-lg mb-3">Overall</h2>
        <div class="flex h-3 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
          <div class="bg-emerald-500" style={`width: ${(overall.confident / overall.total) * 100}%`}></div>
          <div class="bg-amber-400" style={`width: ${(overall.shaky / overall.total) * 100}%`}></div>
          <div class="bg-rose-500" style={`width: ${(overall.weak / overall.total) * 100}%`}></div>
        </div>
        <div class="grid grid-cols-4 gap-2 mt-3 text-sm">
          <div><span class="font-bold text-emerald-600">{overall.confident}</span> confident</div>
          <div><span class="font-bold text-amber-500">{overall.shaky}</span> shaky</div>
          <div><span class="font-bold text-rose-500">{overall.weak}</span> not yet</div>
          <div><span class="font-bold text-ink-500">{overall.unset}</span> unset</div>
        </div>
      </div>

      <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-200 dark:border-ink-800">
              <th class="text-left px-4 py-2">Module</th>
              <th class="text-left px-4 py-2">Paper</th>
              <th class="text-left px-4 py-2">Topics</th>
              <th class="text-left px-4 py-2 w-1/2">Heatmap</th>
            </tr>
          </thead>
          <tbody>
            {totals.map(({ slug, m, counts }) => (
              <tr class="border-b border-ink-100 dark:border-ink-800/50">
                <td class="px-4 py-2">
                  <a href={`/modules/${slug}`} class="font-medium text-ink-900 dark:text-white hover:text-accent-700">{m.title}</a>
                </td>
                <td class="px-4 py-2 text-ink-500 dark:text-ink-400">{PAPERS[m.paper].number}</td>
                <td class="px-4 py-2 text-ink-500 dark:text-ink-400">{m.topics.length}</td>
                <td class="px-4 py-2">
                  <div class="flex gap-0.5">
                    {m.topics.map((t) => {
                      const c = conf[`${slug}/${t.slug}`] ?? 'unset';
                      return (
                        <a
                          href={`/modules/${slug}/${t.slug}`}
                          class={`h-5 flex-1 rounded-sm ${COLORS[c]}`}
                          title={`${t.title} — ${c}`}
                        ></a>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.length > 0 && (
        <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
          <h2 class="font-bold text-lg mb-3">Recent quiz results</h2>
          <ol class="space-y-1 text-sm">
            {results.slice(0, 12).map((r) => (
              <li class="flex items-center gap-2">
                <span class="font-mono text-xs text-ink-500 dark:text-ink-400 w-32">{new Date(r.ts).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <a href={`/modules/${r.module}`} class="flex-1 hover:underline">{MODULES[r.module]?.title ?? r.module}</a>
                <span class="font-medium">{r.score} / {r.total}</span>
                <span class="text-ink-500 dark:text-ink-400">({Math.round((r.score / r.total) * 100)}%)</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
