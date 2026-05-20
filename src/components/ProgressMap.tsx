/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { MODULE_ORDER, MODULES, PAPERS } from '../lib/syllabus';
import { getAllConfidence, getQuizResults, getAllQuestionStatus, getAllPracticeStatus, type Confidence, type QuestionStatus } from '../lib/progress-store';
import { PAST_QUESTIONS, questionId } from '../lib/past-papers';

const COLORS: Record<Confidence, string> = {
  unset: 'bg-ink-200 dark:bg-ink-800',
  weak: 'bg-rose-500',
  shaky: 'bg-amber-400',
  confident: 'bg-emerald-500',
};

export default function ProgressMap({ practiceModules }: { practiceModules: Record<string, string[]> }) {
  const [conf, setConf] = useState<Record<string, Confidence>>({});
  const [results, setResults] = useState<ReturnType<typeof getQuizResults>>([]);
  const [qStatuses, setQStatuses] = useState<Record<string, QuestionStatus>>({});
  const [practiceStatuses, setPracticeStatuses] = useState<Record<string, string>>({});
  useEffect(() => {
    setConf(getAllConfidence());
    setResults(getQuizResults());
    setQStatuses(getAllQuestionStatus());
    setPracticeStatuses(getAllPracticeStatus());
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
            {totals.map(({ slug, m }) => (
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

      <PracticeSection practiceModules={practiceModules} practiceStatuses={practiceStatuses} />
      <PastPapersSection qStatuses={qStatuses} />
    </div>
  );
}

function PracticeSection({ practiceModules, practiceStatuses }: { practiceModules: Record<string, string[]>; practiceStatuses: Record<string, string> }) {
  const modules = MODULE_ORDER.filter((slug) => practiceModules[slug]?.length > 0);
  if (modules.length === 0) return null;

  let grandGotIt = 0, grandAttempted = 0, grandTotal = 0;
  const byModule = modules.map((slug) => {
    const ids = practiceModules[slug];
    const total = ids.length;
    let gotIt = 0, attempted = 0;
    for (const id of ids) {
      const s = practiceStatuses[id];
      if (s === 'got-it') gotIt++;
      else if (s === 'attempted') attempted++;
    }
    grandGotIt += gotIt;
    grandAttempted += attempted;
    grandTotal += total;
    return { slug, total, gotIt, attempted };
  });

  const grandRemaining = grandTotal - grandGotIt - grandAttempted;

  return (
    <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
      <h2 class="font-bold text-lg mb-3">Practice questions</h2>
      <div class="flex h-3 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800 mb-3">
        <div class="bg-emerald-500 transition-all" style={`width: ${(grandGotIt / grandTotal) * 100}%`} />
        <div class="bg-amber-400 transition-all" style={`width: ${(grandAttempted / grandTotal) * 100}%`} />
      </div>
      <div class="grid grid-cols-4 gap-2 text-sm mb-5">
        <div><span class="font-bold text-emerald-600">{grandGotIt}</span> got it</div>
        <div><span class="font-bold text-amber-500">{grandAttempted}</span> attempted</div>
        <div><span class="font-bold text-ink-500">{grandRemaining}</span> remaining</div>
        <div><span class="font-bold text-ink-400">{grandTotal}</span> total</div>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-ink-200 dark:border-ink-800">
            <th class="text-left pb-2">Module</th>
            <th class="text-right pb-2 w-16">Total</th>
            <th class="text-right pb-2 w-16 text-amber-600">Tried</th>
            <th class="text-right pb-2 w-16 text-emerald-600">Got it</th>
            <th class="pb-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {byModule.map(({ slug, total, gotIt, attempted }) => (
            <tr class="border-b border-ink-100 dark:border-ink-800/50">
              <td class="py-1.5">
                <a href={`/practice/${slug}`} class="font-medium text-ink-900 dark:text-white hover:text-accent-700">{MODULES[slug].short}</a>
              </td>
              <td class="text-right text-ink-500 dark:text-ink-400">{total}</td>
              <td class="text-right text-amber-600">{attempted || '—'}</td>
              <td class="text-right text-emerald-600">{gotIt || '—'}</td>
              <td class="pl-3">
                <div class="h-2 rounded-full bg-ink-200 dark:bg-ink-800 overflow-hidden">
                  <div class="h-full flex">
                    <div class="bg-emerald-500" style={`width: ${(gotIt / total) * 100}%`} />
                    <div class="bg-amber-400" style={`width: ${(attempted / total) * 100}%`} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PastPapersSection({ qStatuses }: { qStatuses: Record<string, QuestionStatus> }) {
  const byModule = new Map<string, { tried: number; nailed: number; total: number }>();
  let grandTried = 0, grandNailed = 0, grandTotal = 0;

  for (const q of PAST_QUESTIONS) {
    const s = qStatuses[questionId(q)] ?? null;
    const entry = byModule.get(q.module) ?? { tried: 0, nailed: 0, total: 0 };
    entry.total++;
    if (s === 'tried') { entry.tried++; grandTried++; }
    else if (s === 'nailed') { entry.nailed++; grandNailed++; }
    byModule.set(q.module, entry);
    grandTotal++;
  }

  const grandRemaining = grandTotal - grandTried - grandNailed;

  return (
    <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
      <h2 class="font-bold text-lg mb-3">Past papers</h2>
      <div class="flex h-3 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800 mb-3">
        <div class="bg-emerald-500 transition-all" style={`width: ${(grandNailed / grandTotal) * 100}%`} />
        <div class="bg-amber-400 transition-all" style={`width: ${(grandTried / grandTotal) * 100}%`} />
      </div>
      <div class="grid grid-cols-4 gap-2 text-sm mb-5">
        <div><span class="font-bold text-emerald-600">{grandNailed}</span> nailed</div>
        <div><span class="font-bold text-amber-500">{grandTried}</span> tried</div>
        <div><span class="font-bold text-ink-500">{grandRemaining}</span> remaining</div>
        <div><span class="font-bold text-ink-400">{grandTotal}</span> total</div>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-ink-200 dark:border-ink-800">
            <th class="text-left pb-2">Module</th>
            <th class="text-right pb-2 w-16">Total</th>
            <th class="text-right pb-2 w-16 text-amber-600">Tried</th>
            <th class="text-right pb-2 w-16 text-emerald-600">Nailed</th>
            <th class="pb-2 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {MODULE_ORDER.filter((slug) => byModule.has(slug)).map((slug) => {
            const { tried, nailed, total } = byModule.get(slug)!;
            return (
              <tr class="border-b border-ink-100 dark:border-ink-800/50">
                <td class="py-1.5">
                  <a href={`/modules/${slug}`} class="font-medium text-ink-900 dark:text-white hover:text-accent-700">{MODULES[slug].short}</a>
                </td>
                <td class="text-right text-ink-500 dark:text-ink-400">{total}</td>
                <td class="text-right text-amber-600">{tried || '—'}</td>
                <td class="text-right text-emerald-600">{nailed || '—'}</td>
                <td class="pl-3">
                  <div class="h-2 rounded-full bg-ink-200 dark:bg-ink-800 overflow-hidden">
                    <div class="h-full flex">
                      <div class="bg-emerald-500" style={`width: ${(nailed / total) * 100}%`} />
                      <div class="bg-amber-400" style={`width: ${(tried / total) * 100}%`} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
