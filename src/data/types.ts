export type Tech =
  | 'javascript'
  | 'typescript'
  | 'react19'
  | 'next15'
  | 'next16'
  | 'node'
  | 'playwright'
  | 'jest'
  | 'vitest'
  | 'rtl'
  | 'prisma'
  | 'sql';

export type Kind = 'concept' | 'code-output' | 'spot-the-bug' | 'scenario';

export type Difficulty = 'advanced' | 'expert';

export type Lang = 'js' | 'ts' | 'tsx';

export interface Snippet {
  lang: Lang;
  source: string;
}

export interface WrongOption {
  /** Must match the option string exactly, so it still lines up after options are shuffled. */
  option: string;
  reason: string;
}

export interface Explanation {
  /** One or two plain sentences: what is correct. */
  answer: string;
  /** Why, in simple words. Walk through code in order when there is code. */
  why: string;
  wrong: WrongOption[];
  /** Short snippet that demonstrates the correct idea. Shown in every explanation. */
  example: Snippet;
  /** Corrected snippet when it differs from example. */
  fixedCode?: Snippet;
  /** One-line rule of thumb. */
  remember: string;
  docs?: string;
}

export interface Question {
  id: string;
  tech: Tech;
  topic: string;
  /** Shown for Next.js questions when 15 and 16 disagree, or when a version detail matters. */
  versionNote?: string;
  kind: Kind;
  difficulty: Difficulty;
  prompt: string;
  code?: Snippet;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: Explanation;
}

export interface QuizFilters {
  techs: Tech[];
  kinds: Kind[];
  /** Empty means every topic. */
  topics: string[];
  difficulties: Difficulty[];
}
