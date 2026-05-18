/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { getAllPracticeStatus, setPracticeStatus, type PracticeStatus } from '../lib/progress-store';
import type { PracticeQuestion } from './PracticeQuestions';

interface Props {
  module: string;
  topicSlug: string;
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

export default function PracticePanel({ module, topicSlug, questions }: Props) {
  const [practiceState, setPracticeState] = useState<Record<string, PracticeStatus>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPracticeState(getAllPracticeStatus());
  }, []);

  const shown = [...questions].sort((a, b) => a.difficulty - b.difficulty).slice(0, 3);
  const remaining = questions.length - shown.length;

  function toggleStatus(id: string, s: PracticeStatus) {
    const current = practiceState[id] ?? null;
    const next = current === s ? null : s;
    const updated = { ...practiceState };
    if (next === null) delete updated[id]; else updated[id] = next;
    setPracticeState(updated);
    setPracticeStatus(id, next);
  }

  if (shown.length === 0) return null;

  return (
    <ul class="divide-y divide-ink-200 dark:divide-ink-800 rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden">
      {shown.map((q) => {
        const status = practiceState[q.id] ?? null;
        const isExpanded = expanded[q.id] ?? false;

        return (
          <li key={q.id} class="px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800 transition">
            <div class="flex items-start gap-3">
              <span class={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 mt-0.5 ${DIFF_CLASSES[q.difficulty]}`}>
                {DIFF_LABELS[q.difficulty]}
              </span>
              <span class="flex-1 min-w-0 text-sm text-ink-900 dark:text-white">{q.title}</span>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleStatus(q.id, 'attempted')}
                  class={`text-xs px-2 py-0.5 rounded-full border transition ${
                    status === 'attempted'
                      ? 'bg-amber-400 border-amber-400 text-white'
                      : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-amber-400 hover:text-amber-600'
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
                      : 'border-ink-300 dark:border-ink-600 text-ink-500 dark:text-ink-400 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  Got it
                </button>
              </div>
            </div>
            <div class="mt-2 ml-[calc(3rem+0.75rem)]">
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                class="text-xs text-accent-700 dark:text-accent-400 hover:underline"
              >
                {isExpanded ? 'Hide markscheme' : 'Show markscheme'}
              </button>
              {isExpanded && (
                <div class="mt-2">
                  <div class="prose dark:prose-invert max-w-none text-sm mb-2" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                  {q.parts ? (
                    q.parts.map((part) => (
                      <div key={part.label} class="mb-2">
                        <div class="text-xs font-semibold text-ink-600 dark:text-ink-400 mb-1">({part.label}) [{part.marks}m]</div>
                        <ul class="space-y-1 pl-3 border-l-2 border-emerald-400 dark:border-emerald-600">
                          {part.markscheme.map((step, i) => (
                            <li key={i} class="flex gap-2 text-xs">
                              <span class="shrink-0 font-mono text-emerald-600 dark:text-emerald-400">[{step.marks}]</span>
                              <span class="text-ink-700 dark:text-ink-300" dangerouslySetInnerHTML={{ __html: step.text }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : q.markscheme ? (
                    <ul class="space-y-1 pl-3 border-l-2 border-emerald-400 dark:border-emerald-600">
                      {q.markscheme.map((step, i) => (
                        <li key={i} class="flex gap-2 text-xs">
                          <span class="shrink-0 font-mono text-emerald-600 dark:text-emerald-400">[{step.marks}]</span>
                          <span class="text-ink-700 dark:text-ink-300" dangerouslySetInnerHTML={{ __html: step.text }} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
          </li>
        );
      })}
      {(remaining > 0 || questions.length > 0) && (
        <li class="px-4 py-2 text-xs text-ink-500 dark:text-ink-400 bg-ink-50 dark:bg-ink-950/30">
          {remaining > 0 && <span>+{remaining} more · </span>}
          <a href={`/practice/${module}?topic=${topicSlug}`} class="text-accent-700 dark:text-accent-400 hover:underline">
            See all practice questions →
          </a>
        </li>
      )}
    </ul>
  );
}
