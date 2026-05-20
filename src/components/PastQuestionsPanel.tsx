/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { questionsForTopic, questionsForModule, questionId, type PastQuestion } from '../lib/past-papers';
import type { ModuleSlug } from '../lib/syllabus';
import {
  getAllQuestionStatus, setQuestionStatus, type QuestionStatus,
  getAllQuestionNotes, setQuestionNote,
} from '../lib/progress-store';

interface Props {
  module: ModuleSlug;
  topicSlug?: string;
  limit?: number;
}

export default function PastQuestionsPanel({ module, topicSlug, limit }: Props) {
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openNote, setOpenNote] = useState<string | null>(null);

  useEffect(() => {
    setStatuses(getAllQuestionStatus());
    setNotes(getAllQuestionNotes());
  }, []);

  const all = topicSlug ? questionsForTopic(module, topicSlug) : questionsForModule(module);
  const sorted = [...all].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.paper !== b.paper) return a.paper - b.paper;
    return a.number - b.number;
  });
  const shown = limit ? sorted.slice(0, limit) : sorted;
  const truncated = limit ? sorted.length - shown.length : 0;

  function toggle(q: PastQuestion, s: QuestionStatus) {
    const qId = questionId(q);
    const next = statuses[qId] === s ? null : s;
    const updated = { ...statuses };
    if (next === null) delete updated[qId]; else updated[qId] = next;
    setStatuses(updated);
    setQuestionStatus(qId, next);
  }

  function handleNoteChange(qId: string, text: string) {
    const updated = { ...notes };
    if (!text) delete updated[qId]; else updated[qId] = text;
    setNotes(updated);
    setQuestionNote(qId, text);
  }

  if (shown.length === 0) {
    return (
      <p class="text-sm text-ink-500 dark:text-ink-400">
        No past Tripos questions tagged for this {topicSlug ? 'topic' : 'module'} yet — see the{' '}
        <a href="/past-papers" class="text-accent-700 hover:underline">past papers archive</a>.
      </p>
    );
  }

  return (
    <ul class="divide-y divide-ink-200 dark:divide-ink-800 rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden">
      {shown.map((q) => {
        const qId = questionId(q);
        const status = statuses[qId] ?? null;
        const note = notes[qId] ?? '';
        const noteOpen = openNote === qId;
        return (
          <li key={qId} class="px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-800 transition">
            <div class="flex items-start gap-3">
              <span class="font-mono text-xs text-ink-500 dark:text-ink-400 mt-1 w-24 shrink-0">
                {q.year} P{q.paper} Q{q.number}
              </span>
              <span class="flex-1 min-w-0">
                <span class="text-ink-900 dark:text-white">{q.summary}</span>
                {q.topics.length > 0 && (
                  <span class="block text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                    {q.topics.join(' · ')}
                  </span>
                )}
              </span>
              <div class="flex items-center gap-1 shrink-0 mt-0.5">
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
                <button
                  type="button"
                  onClick={() => setOpenNote(noteOpen ? null : qId)}
                  title={note ? 'Edit note' : 'Add note'}
                  class={`ml-1 transition ${
                    note
                      ? 'text-accent-600 dark:text-accent-400'
                      : noteOpen
                        ? 'text-ink-600 dark:text-ink-200'
                        : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-200'
                  }`}
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener"
                  class="ml-1 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition"
                  title="Open question PDF"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 3h7v7M14 21H3V10M21 3l-9 9" />
                  </svg>
                </a>
              </div>
            </div>
            {noteOpen && (
              <div class="flex gap-3 mt-2">
                <span class="w-24 shrink-0" />
                <textarea
                  class="flex-1 text-sm rounded-md border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 px-3 py-2 text-ink-900 dark:text-white placeholder-ink-400 dark:placeholder-ink-500 resize-none focus:outline-none focus:ring-1 focus:ring-accent-500"
                  rows={3}
                  placeholder="e.g. Retry part (b), struggled with the inductive step…"
                  value={note}
                  onInput={(e) => handleNoteChange(qId, e.currentTarget.value)}
                />
              </div>
            )}
          </li>
        );
      })}
      {truncated > 0 && (
        <li class="px-4 py-2 text-xs text-ink-500 dark:text-ink-400 bg-ink-50 dark:bg-ink-950/30">
          + {truncated} more — see the <a href="/past-papers" class="text-accent-700 hover:underline">archive</a>
        </li>
      )}
    </ul>
  );
}
