/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { PAPER_ORDER, PAPERS } from '../lib/syllabus';

function diff(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86400_000);
  const hours = Math.floor((ms % 86400_000) / 3600_000);
  const mins = Math.floor((ms % 3600_000) / 60_000);
  return { days, hours, mins };
}

export default function ExamCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {PAPER_ORDER.map((p) => {
        const meta = PAPERS[p];
        const target = new Date(`${meta.date}T${meta.startTime}:00+01:00`);
        const d = diff(target, now);
        const passed = !d;
        return (
          <a
            href={`/papers/${p}`}
            class={`rounded-xl p-4 border transition ${passed ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700' : 'border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-accent-500'}`}
          >
            <div class="text-xs uppercase tracking-wider text-ink-500 dark:text-ink-400">{meta.number}</div>
            {passed ? (
              <div class="font-bold mt-1 text-emerald-700 dark:text-emerald-300">Sat</div>
            ) : (
              <div class="font-bold mt-1 text-ink-900 dark:text-white">
                <span class="text-3xl">{d.days}</span>
                <span class="text-sm text-ink-500 dark:text-ink-400 ml-1">d</span>
                <span class="text-xl ml-2">{d.hours}h</span>
                <span class="text-base ml-1">{d.mins}m</span>
              </div>
            )}
            <div class="text-xs text-ink-500 dark:text-ink-400 mt-1">
              {new Date(meta.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, {meta.startTime}
            </div>
          </a>
        );
      })}
    </div>
  );
}
