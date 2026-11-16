import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_FILTERS } from '../data/topics';
import type { QuizFilters } from '../data/types';

const SEEN_KEY = 'quizzy.seen.v1';
const MISSED_KEY = 'quizzy.missed.v1';
const FILTERS_KEY = 'quizzy.filters.v1';
const SEEN_CAP = 500;

export interface Progress {
  seenIds: string[];
  missedIds: string[];
}

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readIds(key: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export async function loadProgress(): Promise<Progress> {
  const [seenIds, missedIds] = await Promise.all([readIds(SEEN_KEY), readIds(MISSED_KEY)]);
  return { seenIds, missedIds };
}

export function markSeen(ids: readonly string[]): Promise<void> {
  return enqueue(async () => {
    const current = await readIds(SEEN_KEY);
    const merged = [...current.filter((id) => !ids.includes(id)), ...ids];
    const capped = merged.slice(Math.max(0, merged.length - SEEN_CAP));
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(capped));
  });
}

export function recordAnswer(id: string, correct: boolean): Promise<void> {
  return enqueue(async () => {
    const missed = await readIds(MISSED_KEY);
    const next = correct ? missed.filter((item) => item !== id) : [...new Set([...missed, id])];
    await AsyncStorage.setItem(MISSED_KEY, JSON.stringify(next));
  });
}

export async function loadFilters(): Promise<QuizFilters> {
  const raw = await AsyncStorage.getItem(FILTERS_KEY);
  if (!raw) return DEFAULT_FILTERS;
  try {
    const parsed = JSON.parse(raw) as Partial<QuizFilters>;
    if (!parsed || !Array.isArray(parsed.techs)) return DEFAULT_FILTERS;
    return {
      techs: parsed.techs.length ? parsed.techs : DEFAULT_FILTERS.techs,
      kinds: Array.isArray(parsed.kinds) && parsed.kinds.length ? parsed.kinds : DEFAULT_FILTERS.kinds,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      difficulties:
        Array.isArray(parsed.difficulties) && parsed.difficulties.length
          ? parsed.difficulties
          : DEFAULT_FILTERS.difficulties,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveFilters(filters: QuizFilters): Promise<void> {
  return AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}
