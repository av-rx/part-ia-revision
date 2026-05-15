/** @jsxImportSource preact */
import { useState, useEffect } from 'preact/hooks';

export interface Exercise {
  id: string;
  topic: string;
  title: string;
  kind: 'trace' | 'code' | 'mcq';
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  answer?: string;
  hints: string[];
  explanation: string;
  solutionCode?: string;
}

interface Props {
  module: string;
  title: string;
  language: string;
  exercises: Exercise[];
}

export default function CodingExercises({ module, title, language, exercises }: Props) {
  const storageKey = `piarev:coding:${module}`;
  const [pos, setPos] = useState(0);
  const [response, setResponse] = useState('');
  const [phase, setPhase] = useState<'idle' | 'checked' | 'revealed'>('idle');
  const [hintIdx, setHintIdx] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  function markDone(id: string) {
    const next = new Set([...done, id]);
    setDone(next);
    try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch {}
  }

  function goTo(idx: number) {
    setPos(idx);
    setResponse('');
    setPhase('idle');
    setHintIdx(0);
  }

  const ex = exercises[pos];
  const total = exercises.length;

  function isCorrect(): boolean {
    if (!ex.answer || !response) return false;
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    return norm(response) === norm(ex.answer);
  }

  function check() {
    setPhase('checked');
    markDone(ex.id);
  }

  function reveal() {
    setPhase('revealed');
    markDone(ex.id);
  }

  return (
    <div class="flex gap-6 items-start">
      {/* Sidebar */}
      <aside class="hidden lg:block w-52 shrink-0 sticky top-20">
        <p class="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
          {done.size}/{total} done
        </p>
        <ol class="space-y-0.5">
          {exercises.map((e, i) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                class={`w-full text-left px-2 py-1.5 rounded text-sm flex items-start gap-1.5 transition ${
                  i === pos
                    ? 'bg-accent-600 text-white'
                    : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <span class="shrink-0 font-mono text-xs mt-0.5 w-5">
                  {done.has(e.id) ? '✓' : `${i + 1}.`}
                </span>
                <span class="leading-snug line-clamp-2 text-xs">{e.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* Main panel */}
      <div class="flex-1 min-w-0">
        <div class="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
          <div class="flex items-start justify-between gap-4 mb-1">
            <p class="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">{ex.topic}</p>
            <span class="text-xs text-ink-400 shrink-0">{pos + 1} / {total}</span>
          </div>
          <h2 class="text-xl font-bold mb-4">{ex.title}</h2>

          <p class="text-ink-800 dark:text-ink-100 mb-4 leading-relaxed">{ex.prompt}</p>

          {ex.codeSnippet && (
            <pre class="bg-ink-950 dark:bg-black text-emerald-300 rounded-lg p-4 overflow-x-auto text-sm font-mono mb-5 leading-relaxed whitespace-pre"><code>{ex.codeSnippet}</code></pre>
          )}

          {/* Hints */}
          {hintIdx > 0 && (
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-md p-3 mb-4 space-y-1">
              {ex.hints.slice(0, hintIdx).map((h, i) => (
                <p key={i} class="text-sm text-amber-800 dark:text-amber-200">💡 {h}</p>
              ))}
            </div>
          )}

          {/* Input area */}
          {phase === 'idle' && ex.kind === 'trace' && (
            <input
              type="text"
              value={response}
              onInput={(e) => setResponse(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && response) check(); }}
              class="w-full px-3 py-2 rounded-md border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-950 focus:border-accent-500 focus:outline-none font-mono text-sm mb-4"
              placeholder="Type the output / result…"
            />
          )}
          {phase === 'idle' && ex.kind === 'mcq' && ex.options && (
            <div class="space-y-2 mb-4">
              {ex.options.map((opt, i) => (
                <label
                  key={i}
                  class={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                    response === String(i)
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-950/30'
                      : 'border-ink-200 dark:border-ink-700 hover:border-ink-400'
                  }`}
                >
                  <input
                    type="radio"
                    name={ex.id}
                    value={i}
                    checked={response === String(i)}
                    onChange={() => setResponse(String(i))}
                    class="mt-0.5 shrink-0"
                  />
                  <span class="font-mono text-sm">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Result: checked */}
          {phase === 'checked' && (
            <div class={`rounded-lg p-4 mb-4 border ${
              isCorrect()
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
            }`}>
              <p class={`font-semibold ${isCorrect() ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                {isCorrect() ? '✓ Correct!' : `✗ Not quite. Answer: ${ex.answer}`}
              </p>
              {ex.explanation && (
                <p class="text-sm mt-2 text-ink-700 dark:text-ink-200 leading-relaxed">{ex.explanation}</p>
              )}
            </div>
          )}

          {/* Result: solution revealed */}
          {phase === 'revealed' && (
            <div class="rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
              {ex.solutionCode && (
                <pre class="bg-ink-950 dark:bg-black text-emerald-300 rounded-md p-4 text-sm font-mono overflow-x-auto whitespace-pre mb-3 leading-relaxed"><code>{ex.solutionCode}</code></pre>
              )}
              {ex.explanation && (
                <p class="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">{ex.explanation}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div class="flex items-center gap-2 mt-4 flex-wrap">
          {phase === 'idle' && hintIdx < ex.hints.length && (
            <button
              type="button"
              onClick={() => setHintIdx((h) => h + 1)}
              class="px-3 py-2 rounded-md text-sm border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              {hintIdx === 0 ? 'Hint' : `Hint ${hintIdx + 1}/${ex.hints.length}`}
            </button>
          )}
          {phase === 'idle' && ex.kind === 'code' && (
            <button
              type="button"
              onClick={reveal}
              class="px-3 py-2 rounded-md text-sm border border-accent-400 text-accent-700 dark:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-950/30"
            >
              Show solution
            </button>
          )}
          {phase === 'idle' && (ex.kind === 'trace' || ex.kind === 'mcq') && (
            <button
              type="button"
              onClick={check}
              disabled={!response}
              class="px-4 py-2 rounded-md text-sm bg-accent-600 text-white disabled:opacity-40"
            >
              Check
            </button>
          )}
          <div class="flex-1" />
          {/* Mobile exercise picker */}
          <select
            class="lg:hidden px-2 py-1.5 rounded-md text-sm border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900"
            value={pos}
            onChange={(e) => goTo(Number(e.currentTarget.value))}
          >
            {exercises.map((e, i) => (
              <option key={e.id} value={i}>{done.has(e.id) ? '✓ ' : ''}{i + 1}. {e.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => goTo(Math.max(0, pos - 1))}
            disabled={pos === 0}
            class="px-3 py-2 rounded-md text-sm border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(total - 1, pos + 1))}
            disabled={pos === total - 1}
            class="px-4 py-2 rounded-md text-sm bg-accent-600 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
