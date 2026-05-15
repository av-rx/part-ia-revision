/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import { getRecentTopics } from '../lib/progress-store';

export default function RecentTopics() {
  const [items, setItems] = useState<ReturnType<typeof getRecentTopics>>([]);
  useEffect(() => { setItems(getRecentTopics()); }, []);

  if (items.length === 0) {
    return (
      <p class="text-sm text-ink-500 dark:text-ink-400">
        Topics you visit will appear here. Open any module to start.
      </p>
    );
  }

  return (
    <ul class="divide-y divide-ink-200 dark:divide-ink-800 rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden">
      {items.map((it) => (
        <li>
          <a href={it.href} class="block px-4 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 transition">
            <div class="font-medium text-ink-900 dark:text-white">{it.title}</div>
            <div class="text-xs text-ink-500 dark:text-ink-400">{new Date(it.ts).toLocaleString('en-GB')}</div>
          </a>
        </li>
      ))}
    </ul>
  );
}
