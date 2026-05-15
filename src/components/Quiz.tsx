/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { recordQuizResult } from '../lib/progress-store';

export interface Question {
  id: string;
  topic?: string;
  kind: 'mcq' | 'short' | 'truefalse';
  prompt: string;
  options?: string[];
  answer: string | number | string[];
  explanation?: string;
}

interface Props {
  module: string;
  title: string;
  questions: Question[];
}

type Phase = 'answering' | 'review';

export default function Quiz({ module, title, questions }: Props) {
  const [phase, setPhase] = useState<Phase>('answering');
  const [pos, setPos] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const total = questions.length;
  const q = questions[pos];

  function setResp(qid: string, value: string) {
    setResponses((r) => ({ ...r, [qid]: value }));
  }
  function reveal(qid: string) {
    setRevealed((v) => ({ ...v, [qid]: true }));
  }

  function isCorrect(qq: Question, value: string | undefined): boolean {
    if (value == null) return false;
    if (qq.kind === 'mcq') {
      const idx = Number(value);
      if (typeof qq.answer === 'number') return idx === qq.answer;
      return false;
    }
    if (qq.kind === 'truefalse') {
      const v = String(value).toLowerCase();
      const a = String(qq.answer).toLowerCase();
      return v === a;
    }
    // short answer
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const target = Array.isArray(qq.answer) ? qq.answer.map(String) : [String(qq.answer)];
    return target.some((t) => norm(value) === norm(t));
  }

  function finish() {
    let score = 0;
    for (const qq of questions) {
      if (isCorrect(qq, responses[qq.id])) score++;
    }
    recordQuizResult({ module, score, total: questions.length, ts: Date.now() });
    setPhase('review');
  }

  if (questions.length === 0) {
    return <div class="text-center text-ink-500 dark:text-ink-400 py-12">No questions yet for this module.</div>;
  }

  if (phase === 'review') {
    let score = 0;
    for (const qq of questions) if (isCorrect(qq, responses[qq.id])) score++;
    return (
      <div>
        <div class="rounded-2xl bg-gradient-to-br from-accent-700 to-accent-500 text-white p-6 mb-6">
          <h2 class="text-2xl font-bold">{score} / {total}</h2>
          <p class="text-accent-50 mt-1">{Math.round((score / total) * 100)}% on {title}</p>
        </div>
        <ol class="space-y-4">
          {questions.map((qq, i) => {
            const ok = isCorrect(qq, responses[qq.id]);
            return (
              <li class={`rounded-lg border p-5 ${ok ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800' : 'border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800'}`}>
                <div class="font-semibold">
                  Q{i + 1}. <span dangerouslySetInnerHTML={{ __html: qq.prompt }} />
                </div>
                <div class="mt-2 text-sm">
                  Your answer: <span class={ok ? 'text-emerald-800 dark:text-emerald-200 font-medium' : 'text-rose-800 dark:text-rose-200 font-medium'}>{responses[qq.id] ?? '—'}</span>
                </div>
                {!ok && (
                  <div class="mt-1 text-sm">
                    Correct: <span class="font-medium">{
                      qq.kind === 'mcq' && typeof qq.answer === 'number'
                        ? qq.options?.[qq.answer] ?? String(qq.answer)
                        : Array.isArray(qq.answer) ? qq.answer[0] : String(qq.answer)
                    }</span>
                  </div>
                )}
                {qq.explanation && (
                  <p class="mt-2 text-sm text-ink-600 dark:text-ink-300" dangerouslySetInnerHTML={{ __html: qq.explanation }} />
                )}
              </li>
            );
          })}
        </ol>
        <button
          onClick={() => { setPhase('answering'); setPos(0); setResponses({}); setRevealed({}); }}
          class="mt-6 px-5 py-2 rounded-md bg-accent-600 text-white"
        >Restart</button>
      </div>
    );
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold">{title}</h2>
        <span class="text-sm text-ink-500 dark:text-ink-400">{pos + 1} / {total}</span>
      </div>

      <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
        {q.topic && <p class="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">{q.topic}</p>}
        <p class="text-lg font-medium" dangerouslySetInnerHTML={{ __html: q.prompt }} />

        <div class="mt-5 space-y-2">
          {q.kind === 'mcq' && q.options && q.options.map((opt, i) => (
            <label class={`flex items-start gap-2 p-3 rounded-md border cursor-pointer transition ${responses[q.id] === String(i) ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'}`}>
              <input
                type="radio"
                name={q.id}
                value={i}
                checked={responses[q.id] === String(i)}
                onChange={() => setResp(q.id, String(i))}
                class="mt-1"
              />
              <span dangerouslySetInnerHTML={{ __html: opt }} />
            </label>
          ))}
          {q.kind === 'truefalse' && (
            <div class="flex gap-2">
              {['True', 'False'].map((opt) => (
                <button
                  type="button"
                  onClick={() => setResp(q.id, opt.toLowerCase())}
                  class={`flex-1 px-4 py-2 rounded-md border transition ${responses[q.id] === opt.toLowerCase() ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30' : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'}`}
                >{opt}</button>
              ))}
            </div>
          )}
          {q.kind === 'short' && (
            <input
              type="text"
              value={responses[q.id] ?? ''}
              onInput={(e) => setResp(q.id, e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-md border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 focus:border-accent-500 focus:outline-none"
              placeholder="Type your answer…"
            />
          )}
        </div>

        {revealed[q.id] && q.explanation && (
          <div class="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm" dangerouslySetInnerHTML={{ __html: q.explanation }} />
        )}
      </div>

      <div class="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={() => reveal(q.id)}
          class="px-3 py-2 rounded-md text-sm border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800"
        >Hint / explanation</button>
        <div class="flex-1" />
        <button
          type="button"
          onClick={() => setPos((p) => Math.max(0, p - 1))}
          disabled={pos === 0}
          class="px-3 py-2 rounded-md text-sm border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-50"
        >Previous</button>
        {pos + 1 < total ? (
          <button
            type="button"
            onClick={() => setPos((p) => p + 1)}
            class="px-4 py-2 rounded-md bg-accent-600 text-white"
          >Next</button>
        ) : (
          <button
            type="button"
            onClick={finish}
            class="px-4 py-2 rounded-md bg-emerald-600 text-white"
          >Finish</button>
        )}
      </div>
    </div>
  );
}
