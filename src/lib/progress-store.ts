// Tiny localStorage wrapper for confidence + flashcard SRS state.
// Designed to fail silently if localStorage is unavailable (private mode etc).

export type Confidence = 'unset' | 'weak' | 'shaky' | 'confident';

const KEYS = {
  confidence: 'piarev:confidence',
  srs: 'piarev:srs',
  quiz: 'piarev:quiz',
  recent: 'piarev:recent-topics',
  meta: 'piarev:meta',
  questions: 'piarev:questions',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Confidence ─────────────────────────────────────────────────────────────

export function getAllConfidence(): Record<string, Confidence> {
  return safeGet<Record<string, Confidence>>(KEYS.confidence, {});
}
export function getConfidence(topicId: string): Confidence {
  return getAllConfidence()[topicId] ?? 'unset';
}
export function setConfidence(topicId: string, c: Confidence) {
  const all = getAllConfidence();
  if (c === 'unset') delete all[topicId]; else all[topicId] = c;
  safeSet(KEYS.confidence, all);
}

// ── Recent topics ──────────────────────────────────────────────────────────

export function pushRecentTopic(topicId: string, title: string, href: string) {
  const list = safeGet<Array<{ id: string; title: string; href: string; ts: number }>>(KEYS.recent, []);
  const filtered = list.filter((r) => r.id !== topicId);
  filtered.unshift({ id: topicId, title, href, ts: Date.now() });
  safeSet(KEYS.recent, filtered.slice(0, 12));
}
export function getRecentTopics() {
  return safeGet<Array<{ id: string; title: string; href: string; ts: number }>>(KEYS.recent, []);
}

// ── SRS (SM-2 lite) ────────────────────────────────────────────────────────
//
// Each card tracks: easeFactor, interval (days), repetitions, dueDate (ms).
// Quality input is one of: again | hard | good | easy.
// We use a simplified SM-2:
//   again  → reset reps, interval = 0.0001 day (~10s), ease -= 0.20
//   hard   → interval ×= 1.2, ease -= 0.15
//   good   → interval ×= ease (or 1 then 6 for the first two reps)
//   easy   → interval ×= ease × 1.3, ease += 0.15
// Floor ease at 1.3.

export type Quality = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCardState {
  ef: number;           // ease factor
  reps: number;         // consecutive successful reps
  interval: number;     // days
  due: number;          // ms timestamp
  lastReview: number;   // ms timestamp
}

const DEFAULT_CARD: SrsCardState = { ef: 2.5, reps: 0, interval: 0, due: 0, lastReview: 0 };

export function getSrsState(): Record<string, SrsCardState> {
  return safeGet<Record<string, SrsCardState>>(KEYS.srs, {});
}
export function setSrsState(state: Record<string, SrsCardState>) {
  safeSet(KEYS.srs, state);
}
export function getCardState(cardId: string): SrsCardState {
  const all = getSrsState();
  return all[cardId] ?? { ...DEFAULT_CARD };
}
export function reviewCard(cardId: string, q: Quality, now = Date.now()): SrsCardState {
  const all = getSrsState();
  const prev = all[cardId] ?? { ...DEFAULT_CARD };
  let { ef, reps, interval } = prev;

  if (q === 'again') {
    reps = 0;
    interval = 0.007; // ~10 minutes
    ef = Math.max(1.3, ef - 0.2);
  } else if (q === 'hard') {
    reps += 1;
    interval = Math.max(1, Math.round(interval * 1.2));
    ef = Math.max(1.3, ef - 0.15);
  } else if (q === 'good') {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
  } else if (q === 'easy') {
    reps += 1;
    if (reps === 1) interval = 4;
    else interval = Math.round(interval * ef * 1.3);
    ef += 0.15;
  }

  const next: SrsCardState = {
    ef,
    reps,
    interval,
    due: now + interval * 86400_000,
    lastReview: now,
  };
  all[cardId] = next;
  setSrsState(all);
  return next;
}

export function dueCardIds(allCardIds: string[], now = Date.now()): string[] {
  const state = getSrsState();
  return allCardIds.filter((id) => {
    const s = state[id];
    return !s || s.due <= now;
  });
}

// ── Quiz scores ────────────────────────────────────────────────────────────

export interface QuizResult {
  module: string;
  score: number;
  total: number;
  ts: number;
}
export function recordQuizResult(r: QuizResult) {
  const list = safeGet<QuizResult[]>(KEYS.quiz, []);
  list.unshift(r);
  safeSet(KEYS.quiz, list.slice(0, 200));
}
export function getQuizResults(): QuizResult[] {
  return safeGet<QuizResult[]>(KEYS.quiz, []);
}

// ── Past paper question tracking ───────────────────────────────────────────

export type QuestionStatus = 'tried' | 'nailed';

export function getAllQuestionStatus(): Record<string, QuestionStatus> {
  return safeGet<Record<string, QuestionStatus>>(KEYS.questions, {});
}
export function getQuestionStatus(qId: string): QuestionStatus | null {
  return getAllQuestionStatus()[qId] ?? null;
}
export function setQuestionStatus(qId: string, s: QuestionStatus | null) {
  const all = getAllQuestionStatus();
  if (s === null) delete all[qId]; else all[qId] = s;
  safeSet(KEYS.questions, all);
}
