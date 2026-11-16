import type { Question, QuizFilters } from '../data/types';
import { shuffle } from './shuffle';

export const ROUND_SIZE = 25;

export function matchesFilters(question: Question, filters: QuizFilters): boolean {
  if (!filters.techs.includes(question.tech)) return false;
  if (filters.kinds.length > 0 && !filters.kinds.includes(question.kind)) return false;
  if (filters.difficulties.length > 0 && !filters.difficulties.includes(question.difficulty)) {
    return false;
  }
  if (filters.topics.length > 0 && !filters.topics.includes(question.topic)) return false;
  return true;
}

export function filterQuestions(bank: readonly Question[], filters: QuizFilters): Question[] {
  return bank.filter((question) => matchesFilters(question, filters));
}

function withShuffledOptions(question: Question): Question {
  const order = shuffle(question.options.map((_, index) => index));
  const options = order.map((index) => question.options[index]) as Question['options'];
  const correctIndex = order.indexOf(question.correctIndex) as Question['correctIndex'];
  return { ...question, options, correctIndex };
}

export function pickQuiz(
  bank: readonly Question[],
  filters: QuizFilters,
  options: { seenIds?: readonly string[]; onlyIds?: readonly string[]; count?: number } = {},
): Question[] {
  let pool = filterQuestions(bank, filters);
  if (options.onlyIds) {
    const allowed = new Set(options.onlyIds);
    pool = pool.filter((question) => allowed.has(question.id));
  }

  const seen = new Set(options.seenIds ?? []);
  const fresh = shuffle(pool.filter((question) => !seen.has(question.id)));
  const stale = shuffle(pool.filter((question) => seen.has(question.id)));
  const count = options.count ?? ROUND_SIZE;
  return [...fresh, ...stale].slice(0, count).map(withShuffledOptions);
}
