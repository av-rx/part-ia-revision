/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { getAllPracticeStatus, setPracticeStatus, type PracticeStatus } from '../lib/progress-store';

interface MarkschemeStep {
  text: string;
  marks: number;
}

interface Part {
  label: string;
  marks: number;
  prompt: string;
  markscheme: MarkschemeStep[];
}

export interface PracticeQuestion {
  id: string;
  topic: string;
  topicTitle: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  title: string;
  totalMarks: number;
  prompt: string;
  hint?: string;
  markscheme?: MarkschemeStep[];
  parts?: Part[];
}

interface Props {
  module: string;
  title: string;
  questions: PracticeQuestion[];
}

const DIFF_LABELS: Record<number, string> = { 1: 'Recall', 2: 'Explain', 3: 'Apply', 4: 'Analyse', 5: 'Tripos' };
const DIFF_CLASSES: Record<number, string> = {
  1: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  2: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  5: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function PracticeQuestions({ questions }: Props) {
  const [topicFilter, setTopicFilter] = useState('');
  const [maxDifficulty, setMaxDifficulty] = useState(5);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hintShown, setHintShown] = useState<Record<string, boolean>>({});
  const [practiceState, setPracticeState] = useState<Record<string, PracticeStatus>>({});

  useEffect(() => {
    setPracticeState(getAllPracticeStatus());
    const params = new URLSearchParams(window.location.search);
    const t = params.get('topic');
    if (t) setTopicFilter(t);
  }, []);

  const topics = Array.from(new Map(questions.map((q) => [q.topic, q.topicTitle])).entries());

  const filtered = questions.filter(
    (q) =>
      (!topicFilter || q.topic === topicFilter) &&
      q.difficulty <= maxDifficulty,
  );

  const grouped = topics.flatMap(([slug, title]) => {
    const qs = filtered.filter((q) => q.topic === slug);
    return qs.length > 0 ? [{ slug, title, questions: qs }] : [];
  });

  function toggleStatus(id: string, s: PracticeStatus) {
    const current = practiceState[id] ?? null;
    const next = current === s ? null : s;
    const updated = { ...practiceState };
    if (next === null) delete updated[id]; else updated[id] = next;
    setPracticeState(updated);
    setPracticeStatus(id, next);
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleHint(id: string) {
    setHintShown((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const diffCounts = [1, 2, 3, 4, 5].map((d) => ({
    d,
    count: questions.filter((q) => (!topicFilter || q.topic === topicFilter) && q.difficulty === d).length,
  }));

  const attempted = Object.values(practiceState).filter((v) => v === 'attempted').length;
  const gotIt = Object.values(practiceState).filter((v) => v === 'got-it').length;
  const total = questions.length;

  return (
    <div>
      {/* Stats bar */}
      <div class="flex items-center gap-4 mb-6 text-sm text-ink-500 dark:text-ink-400">
        <span>{total} questions</span>
        {gotIt > 0 && <span class="text-emerald-600 dark:text-emerald-400">{gotIt} got it</span>}
        {attempted > 0 && <span class="text-amber-600 dark:text-amber-400">{attempted} attempted</span>}
        <span>{total - attempted - gotIt} remaining</span>
      </div>

      {/* Filters */}
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Topic pills */}
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTopicFilter('')}
            class={`px-3 py-1 rounded-full text-sm border transition ${!topicFilter ? 'bg-accent-600 text-white border-accent-600' : 'border-ink-300 dark:border-ink-600 text-ink-700 dark:text-ink-300 hover:border-accent-500'}`}
          >
            All topics
          </button>
          {topics.map(([slug, title]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setTopicFilter(topicFilter === slug ? '' : slug)}
              class={`px-3 py-1 rounded-full text-sm border transition ${topicFilter === slug ? 'bg-accent-600 text-white border-accent-600' : 'border-ink-300 dark:border-ink-600 text-ink-700 dark:text-ink-300 hover:border-accent-500'}`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div class="flex items-center gap-1 shrink-0">
          <span class="text-xs text-ink-500 dark:text-ink-400 mr-1">Up to:</span>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setMaxDifficulty(d)}
              title={`${DIFF_LABELS[d]} (${diffCounts[d - 1].count})`}
              class={`w-8 h-8 rounded text-xs font-semibold border transition ${
                maxDifficulty >= d
                  ? DIFF_CLASSES[d] + ' border-transparent'
                  : 'border-ink-300 dark:border-ink-600 text-ink-400 dark:text-ink-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p class="text-ink-500 dark:text-ink-400 text-sm">No questions match the current filters.</p>
      )}

      {/* Questions grouped by topic */}
      <div class="space-y-10">
        {grouped.map(({ slug, title, questions: qs }) => (
          <section key={slug}>
            <h2 class="text-lg font-bold tracking-tight text-ink-900 dark:text-white mb-4 pb-2 border-b border-ink-200 dark:border-ink-800">
              {title}
            </h2>
            <div class="space-y-4">
              {qs.map((q) => {
                const status = practiceState[q.id] ?? null;
                const isExpanded = expanded[q.id] ?? false;
                const isHintShown = hintShown[q.id] ?? false;

                return (
                  <div
                    key={q.id}
                    class={`rounded-lg border transition ${
                      status === 'got-it'
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : status === 'attempted'
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900'
                    }`}
                  >
                    {/* Card header */}
                    <div class="flex items-start gap-3 p-4">
                      <span class={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5 ${DIFF_CLASSES[q.difficulty]}`}>
                        {DIFF_LABELS[q.difficulty]}
                      </span>
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-ink-900 dark:text-white">{q.title}</div>
                        <div class="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{q.totalMarks} mark{q.totalMarks !== 1 ? 's' : ''}</div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleStatus(q.id, 'attempted')}
                          class={`text-xs px-2 py-0.5 rounded-full border transition ${
                            status === 'attempted'
                              ? 'bg-amber-400 border-amber-400 text-white'
                              : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
                          }`}
                        >
                          Tried
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(q.id, 'got-it')}
                          class={`text-xs px-2 py-0.5 rounded-full border transition ${
                            status === 'got-it'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                        >
                          Got it
                        </button>
                      </div>
                    </div>

                    {/* Question prompt */}
                    <div class="px-4 pb-3">
                      {q.parts ? (
                        <div class="space-y-3">
                          <div class="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                          {q.parts.map((part) => (
                            <div key={part.label} class="pl-4 border-l-2 border-ink-200 dark:border-ink-700">
                              <div class="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1">
                                ({part.label}) <span class="font-normal text-ink-500 dark:text-ink-400">[{part.marks} mark{part.marks !== 1 ? 's' : ''}]</span>
                              </div>
                              <div class="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: part.prompt }} />
                              {isExpanded && (
                                <div class="mt-2 pl-3 border-l-2 border-emerald-400 dark:border-emerald-600">
                                  <div class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Markscheme</div>
                                  <ul class="space-y-1">
                                    {part.markscheme.map((step, i) => (
                                      <li key={i} class="flex gap-2 text-sm">
                                        <span class="shrink-0 text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">[{step.marks}]</span>
                                        <span class="text-ink-700 dark:text-ink-300" dangerouslySetInnerHTML={{ __html: step.text }} />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div class="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                      )}

                      {/* Hint */}
                      {q.hint && !isExpanded && (
                        <div class="mt-3">
                          {!isHintShown ? (
                            <button
                              type="button"
                              onClick={() => toggleHint(q.id)}
                              class="text-xs text-ink-500 dark:text-ink-400 hover:text-accent-600 dark:hover:text-accent-400 underline"
                            >
                              Show hint
                            </button>
                          ) : (
                            <div class="text-sm text-ink-600 dark:text-ink-400 bg-ink-50 dark:bg-ink-800 rounded px-3 py-2">
                              <span class="font-semibold">Hint: </span>
                              <span dangerouslySetInnerHTML={{ __html: q.hint }} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Single-part markscheme */}
                      {!q.parts && q.markscheme && isExpanded && (
                        <div class="mt-3 pl-3 border-l-2 border-emerald-400 dark:border-emerald-600">
                          <div class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Markscheme</div>
                          <ul class="space-y-1">
                            {q.markscheme.map((step, i) => (
                              <li key={i} class="flex gap-2 text-sm">
                                <span class="shrink-0 text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">[{step.marks}]</span>
                                <span class="text-ink-700 dark:text-ink-300" dangerouslySetInnerHTML={{ __html: step.text }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Toggle markscheme button */}
                      <div class="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(q.id)}
                          class="text-xs font-semibold text-accent-700 dark:text-accent-400 hover:underline"
                        >
                          {isExpanded ? 'Hide markscheme' : 'Show markscheme'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
