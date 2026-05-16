/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from 'preact/hooks';
import { questionId, type PastQuestion } from '../lib/past-papers';
import { getAllQuestionStatus, setQuestionStatus, type QuestionStatus } from '../lib/progress-store';

interface ModuleEntry { title: string; short: string; paper: string; }

interface Props {
  questions: PastQuestion[];
  modules: Record<string, ModuleEntry>;
  papers: Record<string, { number: string; date: string; title: string }>;
}

type StatusFilter = 'all' | 'not-yet' | 'tried' | 'nailed';

export default function PastPapersBrowser({ questions, modules, papers }: Props) {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [paperFilter, setPaperFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState<string>('');
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});

  useEffect(() => {
    setStatuses(getAllQuestionStatus());
  }, []);

  const years = useMemo(() => {
    const s = new Set<number>();
    for (const q of questions) s.add(q.year);
    return Array.from(s).sort((a, b) => b - a);
  }, [questions]);

  const globalStats = useMemo(() => {
    let tried = 0, nailed = 0;
    for (const q of questions) {
      const s = statuses[questionId(q)];
      if (s === 'tried') tried++;
      else if (s === 'nailed') nailed++;
    }
    return { tried, nailed, total: questions.length };
  }, [questions, statuses]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return questions.filter((q) => {
      if (yearFilter !== 'all' && String(q.year) !== yearFilter) return false;
      if (moduleFilter !== 'all' && q.module !== moduleFilter) return false;
      if (paperFilter !== 'all' && String(q.paper) !== paperFilter) return false;
      if (statusFilter !== 'all') {
        const qStatus = statuses[questionId(q)] ?? null;
        if (statusFilter === 'not-yet' && qStatus !== null) return false;
        if (statusFilter === 'tried' && qStatus !== 'tried') return false;
        if (statusFilter === 'nailed' && qStatus !== 'nailed') return false;
      }
      if (s) {
        const blob = `${q.summary} ${q.module} ${q.topics.join(' ')}`.toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.paper !== b.paper) return a.paper - b.paper;
      return a.number - b.number;
    });
  }, [questions, yearFilter, moduleFilter, paperFilter, statusFilter, search, statuses]);

  function toggle(q: PastQuestion, s: QuestionStatus) {
    const qId = questionId(q);
    const next = statuses[qId] === s ? null : s;
    const updated = { ...statuses };
    if (next === null) delete updated[qId]; else updated[qId] = next;
    setStatuses(updated);
    setQuestionStatus(qId, next);
  }

  const { tried, nailed, total } = globalStats;
  const remaining = total - tried - nailed;

  return (
    <div>
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">Year</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.currentTarget.value)}
            class="mt-1 rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
          >
            <option value="all">All years</option>
            {years.map((y) => <option value={String(y)}>{y}</option>)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">Paper</label>
          <select
            value={paperFilter}
            onChange={(e) => setPaperFilter(e.currentTarget.value)}
            class="mt-1 rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
          >
            <option value="all">All papers</option>
            <option value="1">Paper 1</option>
            <option value="2">Paper 2</option>
            <option value="3">Paper 3</option>
          </select>
        </div>
        <div class="flex-1 min-w-48">
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">Module</label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.currentTarget.value)}
            class="mt-1 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
          >
            <option value="all">All modules</option>
            {Object.entries(modules).map(([slug, m]) => (
              <option value={slug}>{m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.currentTarget.value as StatusFilter)}
            class="mt-1 rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="not-yet">Not yet</option>
            <option value="tried">Tried</option>
            <option value="nailed">Nailed</option>
          </select>
        </div>
        <div class="flex-1 min-w-48">
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">Search</label>
          <input
            type="search"
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
            placeholder="e.g. Bayes, Dijkstra, paging…"
            class="mt-1 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
          />
        </div>
        <div class="text-sm text-ink-500 dark:text-ink-400 self-end pb-1.5">
          {filtered.length} / {questions.length}
        </div>
      </div>

      <div class="flex items-center gap-4 mb-4 text-sm">
        <span class="font-medium text-amber-600 dark:text-amber-400">{tried} tried</span>
        <span class="font-medium text-emerald-600 dark:text-emerald-400">{nailed} nailed</span>
        <span class="text-ink-500 dark:text-ink-400">{remaining} remaining</span>
        <div class="flex-1 h-1.5 rounded-full bg-ink-200 dark:bg-ink-800 overflow-hidden">
          <div class="h-full flex">
            <div class="bg-emerald-500 transition-all" style={`width: ${(nailed / total) * 100}%`} />
            <div class="bg-amber-400 transition-all" style={`width: ${(tried / total) * 100}%`} />
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden">
        {filtered.length === 0 ? (
          <p class="p-8 text-center text-ink-500 dark:text-ink-400">No questions match the current filters.</p>
        ) : (
          <ul class="divide-y divide-ink-200 dark:divide-ink-800">
            {filtered.map((q) => {
              const m = modules[q.module];
              const qId = questionId(q);
              const status = statuses[qId] ?? null;
              return (
                <li class="flex items-start gap-3 px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800 transition">
                  <span class="font-mono text-xs text-ink-500 dark:text-ink-400 mt-1 w-24 shrink-0">
                    {q.year} P{q.paper} Q{q.number}
                  </span>
                  <span class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-800 dark:text-accent-200">{m?.short ?? q.module}</span>
                      {q.topics.map((t) => (
                        <span class="text-xs text-ink-500 dark:text-ink-400">{t}</span>
                      ))}
                    </div>
                    <div class="text-ink-900 dark:text-white mt-1">{q.summary}</div>
                  </span>
                  <div class="flex items-center gap-1 shrink-0 mt-1">
                    <button
                      type="button"
                      onClick={() => toggle(q, 'tried')}
                      class={`text-xs px-2 py-0.5 rounded-full border transition ${
                        status === 'tried'
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      Tried
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(q, 'nailed')}
                      class={`text-xs px-2 py-0.5 rounded-full border transition ${
                        status === 'nailed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      Nailed
                    </button>
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener"
                      class="ml-1 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition"
                      title="Open question PDF"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3h7v7M14 21H3V10M21 3l-9 9"/></svg>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
