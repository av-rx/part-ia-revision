/** @jsxImportSource preact */
import { useEffect, useState } from 'preact/hooks';
import {
  getConfidence,
  setConfidence,
  pushRecentTopic,
  type Confidence,
} from '../lib/progress-store';

interface Props {
  topicId: string;
  topicTitle?: string;
  nonExaminable?: boolean;
}

const STATES: Confidence[] = ['weak', 'shaky', 'confident'];
const LABELS: Record<Confidence, string> = {
  unset: 'Mark confidence',
  weak: 'Not yet',
  shaky: 'Shaky',
  confident: 'Confident',
};
const TIPS: Record<Confidence, string> = {
  unset: '',
  weak: "Haven't revised this yet",
  shaky: 'Know it but unsure',
  confident: 'Could write this on Q-day',
};

export default function ConfidenceButtons({ topicId, topicTitle, nonExaminable = false }: Props) {
  const [c, setC] = useState<Confidence>('unset');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setC(getConfidence(topicId));
    setHydrated(true);
    if (typeof window !== 'undefined') {
      pushRecentTopic(topicId, topicTitle ?? topicId, window.location.pathname);
    }
  }, [topicId, topicTitle]);

  function pick(next: Confidence) {
    const final = c === next ? 'unset' : next;
    setC(final);
    setConfidence(topicId, final);
  }

  if (!hydrated) return <div class="h-9" />;

  if (nonExaminable) {
    return (
      <div class="flex items-center gap-2 no-print opacity-40 select-none" title="Non-examinable topic — confidence not tracked">
        <span class="text-sm text-ink-500 dark:text-ink-400 mr-1">How well do you know this?</span>
        {STATES.map((s) => (
          <button type="button" class="confidence-btn" disabled>{LABELS[s]}</button>
        ))}
        <span class="text-xs text-ink-400 dark:text-ink-500 ml-1 italic">Non-examinable</span>
      </div>
    );
  }

  return (
    <div class="flex items-center gap-2 no-print">
      <span class="text-sm text-ink-500 dark:text-ink-400 mr-1">How well do you know this?</span>
      {STATES.map((s) => (
        <button
          type="button"
          class={`confidence-btn ${c === s ? `active ${s}` : ''}`}
          title={TIPS[s]}
          onClick={() => pick(s)}
        >
          {LABELS[s]}
        </button>
      ))}
      {c !== 'unset' && (
        <span class="text-xs text-ink-500 dark:text-ink-400 ml-1">Saved.</span>
      )}
    </div>
  );
}
