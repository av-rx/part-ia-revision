/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  reviewCard,
  getCardState,
  type Quality,
} from '../lib/progress-store';

export interface Card {
  id: string;
  front: string;
  back: string;
  topic?: string;
  tags?: string[];
}

interface Props {
  module: string;
  title: string;
  cards: Card[];
}

type Mode = 'due' | 'cram' | 'all';

function isDue(cardId: string, now: number): boolean {
  const s = getCardState(cardId);
  return s.due === 0 || s.due <= now;
}


export default function Flashcards({ title, cards }: Props) {
  const [mode, setMode] = useState<Mode>('due');
  const [topic, setTopic] = useState<string | 'all'>('all');
  const [hydrated, setHydrated] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [pos, setPos] = useState(0);
  const [, setBump] = useState(0); // re-render trigger
  const force = () => setBump((b) => b + 1);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const topics = useMemo(() => {
    const s = new Set<string>();
    for (const c of cards) if (c.topic) s.add(c.topic);
    return Array.from(s).sort();
  }, [cards]);

  const queue = useMemo(() => {
    const now = Date.now();
    let pool = cards;
    if (topic !== 'all') pool = pool.filter((c) => c.topic === topic);
    if (mode === 'due') pool = pool.filter((c) => isDue(c.id, now));
    if (mode === 'cram') {
      // shuffle copy
      pool = [...pool].sort(() => Math.random() - 0.5);
    }
    return pool;
  }, [cards, mode, topic, hydrated]);

  useEffect(() => { setPos(0); setShowBack(false); }, [mode, topic]);

  if (!hydrated) {
    return <div class="p-8 text-center text-ink-400">Loading…</div>;
  }

  const current = queue[pos];
  const dueCount = cards.filter((c) => isDue(c.id, Date.now())).length;

  function review(q: Quality) {
    if (!current) return;
    reviewCard(current.id, q);
    setShowBack(false);
    if (pos + 1 >= queue.length) {
      // Reload due-pool
      force();
      setPos(0);
    } else {
      setPos((p) => p + 1);
    }
  }

  return (
    <div>
      <header class="flex flex-wrap items-end gap-3 mb-6">
        <div class="flex-1">
          <h1 class="text-2xl font-bold tracking-tight">{title} — Flashcards</h1>
          <p class="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {cards.length} cards · {dueCount} due now
          </p>
        </div>
        <div class="flex items-center gap-1 rounded-lg border border-ink-200 dark:border-ink-800 p-1 bg-white dark:bg-ink-900">
          {(['due', 'cram', 'all'] as Mode[]).map((m) => (
            <button
              type="button"
              onClick={() => setMode(m)}
              class={`px-3 py-1 rounded text-sm transition ${mode === m ? 'bg-accent-600 text-white' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800'}`}
            >{m}</button>
          ))}
        </div>
        <select
          value={topic}
          onChange={(e) => setTopic((e.currentTarget.value || 'all') as string)}
          class="rounded-md border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-sm"
        >
          <option value="all">All topics ({cards.length})</option>
          {topics.map((t) => {
            const count = cards.filter((c) => c.topic === t).length;
            return <option value={t}>{t} ({count})</option>;
          })}
        </select>
      </header>

      {!current ? (
        <div class="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 p-10 text-center">
          <h2 class="text-xl font-bold text-emerald-800 dark:text-emerald-200">All done for now.</h2>
          <p class="text-emerald-700 dark:text-emerald-300 mt-2">
            {mode === 'due' ? 'Nothing else due. Switch to Cram or All to keep drilling.' : 'No cards in this filter.'}
          </p>
        </div>
      ) : (
        <div class="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-sm">
          <div class="flex items-center justify-between px-5 py-3 border-b border-ink-200 dark:border-ink-800 text-sm">
            <span class="text-ink-500 dark:text-ink-400">{current.topic}</span>
            <span class="text-ink-500 dark:text-ink-400">{pos + 1} / {queue.length}</span>
          </div>
          <div class="p-8 min-h-[14rem]">
            <div class="text-sm uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Question</div>
            <div class="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: current.front }} />
            {showBack && (
              <>
                <hr class="my-6 border-ink-200 dark:border-ink-700" />
                <div class="text-sm uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Answer</div>
                <div class="text-lg leading-relaxed text-ink-900 dark:text-white" dangerouslySetInnerHTML={{ __html: current.back }} />
              </>
            )}
          </div>
          <div class="px-5 py-4 border-t border-ink-200 dark:border-ink-800 flex flex-wrap items-center gap-2">
            {!showBack ? (
              <button
                type="button"
                onClick={() => setShowBack(true)}
                class="ml-auto px-5 py-2 rounded-md bg-accent-600 text-white font-medium hover:bg-accent-700"
              >Show answer (Space)</button>
            ) : (
              <>
                <button onClick={() => review('again')} class="px-4 py-2 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">
                  Again <span class="opacity-75 ml-1">(1)</span>
                </button>
                <button onClick={() => review('hard')} class="px-4 py-2 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">
                  Hard <span class="opacity-75 ml-1">(2)</span>
                </button>
                <button onClick={() => review('good')} class="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                  Good <span class="opacity-75 ml-1">(3)</span>
                </button>
                <button onClick={() => review('easy')} class="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">
                  Easy <span class="opacity-75 ml-1">(4)</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {current && (
        <KeyHandler
          onShow={() => setShowBack(true)}
          onAnswer={(q) => showBack && review(q)}
        />
      )}
    </div>
  );
}

function KeyHandler({ onShow, onAnswer }: { onShow: () => void; onAnswer: (q: Quality) => void }) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === ' ') { e.preventDefault(); onShow(); }
      else if (e.key === '1') onAnswer('again');
      else if (e.key === '2') onAnswer('hard');
      else if (e.key === '3') onAnswer('good');
      else if (e.key === '4') onAnswer('easy');
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onShow, onAnswer]);
  return null;
}
