import { useEffect, useState } from 'react';
import type { Question, QuizFilters } from '../data/types';

export type QuizMode = 'standard' | 'replay-round' | 'replay-all';

export interface GivenAnswer {
  selected: number;
  correct: boolean;
}

export interface Session {
  filters: QuizFilters;
  questions: Question[];
  answers: Array<GivenAnswer | null>;
  index: number;
  mode: QuizMode;
}

let session: Session | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getSession(): Session | null {
  return session;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startSession(questions: Question[], filters: QuizFilters, mode: QuizMode): void {
  session = {
    filters,
    questions,
    answers: questions.map(() => null),
    index: 0,
    mode,
  };
  emit();
}

export function answerCurrent(selected: number): { id: string; correct: boolean } | null {
  if (!session) return null;
  const current = session.questions[session.index];
  if (!current || session.answers[session.index]) return null;
  const correct = selected === current.correctIndex;
  const answers = session.answers.slice();
  answers[session.index] = { selected, correct };
  session = { ...session, answers };
  emit();
  return { id: current.id, correct };
}

export function advance(): 'next' | 'done' {
  if (!session) return 'done';
  if (session.index >= session.questions.length - 1) return 'done';
  session = { ...session, index: session.index + 1 };
  emit();
  return 'next';
}

export function useSession(): Session | null {
  const [snapshot, setSnapshot] = useState(getSession());
  useEffect(() => subscribe(() => setSnapshot(getSession())), []);
  return snapshot;
}
