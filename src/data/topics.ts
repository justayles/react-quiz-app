import type { Difficulty, Kind, QuizFilters, Tech } from './types';

export interface TopicMeta {
  id: string;
  label: string;
}

export const TECHS: { id: Tech; label: string; short: string }[] = [
  { id: 'javascript', label: 'JavaScript', short: 'JS' },
  { id: 'typescript', label: 'TypeScript', short: 'TS' },
  { id: 'react19', label: 'React 19', short: 'React 19' },
  { id: 'next15', label: 'Next.js 15', short: 'Next 15' },
  { id: 'next16', label: 'Next.js 16', short: 'Next 16' },
  { id: 'node', label: 'Node.js', short: 'Node' },
  { id: 'playwright', label: 'Playwright', short: 'Playwright' },
  { id: 'jest', label: 'Jest', short: 'Jest' },
  { id: 'vitest', label: 'Vitest', short: 'Vitest' },
  { id: 'rtl', label: 'Testing Library', short: 'RTL' },
  { id: 'prisma', label: 'Prisma', short: 'Prisma' },
  { id: 'sql', label: 'SQL', short: 'SQL' },
];

export const KINDS: { id: Kind; label: string }[] = [
  { id: 'concept', label: 'Concept' },
  { id: 'code-output', label: 'Code output' },
  { id: 'spot-the-bug', label: 'Spot the bug' },
  { id: 'scenario', label: 'Scenario' },
];

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' },
];

export const TOPICS: Record<Tech, TopicMeta[]> = {
  javascript: [
    { id: 'closures', label: 'Closures' },
    { id: 'event-loop', label: 'Event loop' },
    { id: 'this-binding', label: 'this' },
    { id: 'prototypes', label: 'Prototypes' },
    { id: 'async', label: 'Async' },
    { id: 'equality', label: 'Equality' },
    { id: 'collections', label: 'Collections' },
    { id: 'modules', label: 'Modules' },
    { id: 'syntax', label: 'Modern syntax' },
    { id: 'scope', label: 'Scope' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'browser', label: 'Browser' },
    { id: 'network', label: 'Network' },
    { id: 'security', label: 'Security' },
    { id: 'performance', label: 'Performance' },
    { id: 'runtime', label: 'Runtime' },
    { id: 'architecture', label: 'Architecture' },
  ],
  typescript: [
    { id: 'conditionals', label: 'Conditional types' },
    { id: 'mapped', label: 'Mapped types' },
    { id: 'narrowing', label: 'Narrowing' },
    { id: 'generics', label: 'Generics' },
    { id: 'variance', label: 'Variance' },
    { id: 'modules', label: 'Modules' },
    { id: 'config', label: 'Strictness' },
  ],
  react19: [
    { id: 'rsc', label: 'RSC' },
    { id: 'server-actions', label: 'Server Actions' },
    { id: 'use-hook', label: 'use()' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'hooks-rendering', label: 'Hooks & render' },
    { id: 'compiler-memo', label: 'Compiler' },
    { id: 'react19-api', label: 'React 19 APIs' },
  ],
  next15: [
    { id: 'caching', label: 'Caching' },
    { id: 'isr', label: 'ISR' },
    { id: 'rendering', label: 'SSR / rendering' },
    { id: 'ppr', label: 'PPR' },
    { id: 'async-apis', label: 'Async APIs' },
    { id: 'routing-other', label: 'Routing & more' },
  ],
  next16: [
    { id: 'caching', label: 'Caching' },
    { id: 'isr', label: 'ISR' },
    { id: 'rendering', label: 'SSR / rendering' },
    { id: 'ppr', label: 'PPR' },
    { id: 'async-apis', label: 'Async APIs' },
    { id: 'routing-other', label: 'Routing & more' },
  ],
  node: [
    { id: 'event-loop', label: 'Event loop' },
    { id: 'modules', label: 'Modules' },
    { id: 'streams', label: 'Streams' },
    { id: 'runtime', label: 'Runtime' },
    { id: 'workers', label: 'Workers' },
  ],
  playwright: [
    { id: 'locators', label: 'Locators' },
    { id: 'assertions', label: 'Assertions' },
    { id: 'network', label: 'Network' },
    { id: 'isolation', label: 'Isolation' },
  ],
  jest: [
    { id: 'mocks', label: 'Mocks' },
    { id: 'matchers', label: 'Matchers' },
    { id: 'timers-async', label: 'Timers & async' },
    { id: 'jest-config', label: 'Config' },
  ],
  vitest: [
    { id: 'mocks', label: 'Mocks' },
    { id: 'timers-async', label: 'Timers & async' },
    { id: 'environment', label: 'Environment' },
    { id: 'vitest-vs-jest', label: 'Vitest vs Jest' },
  ],
  rtl: [
    { id: 'queries', label: 'Queries' },
    { id: 'user-events', label: 'User events' },
    { id: 'async-ui', label: 'Async UI' },
    { id: 'patterns', label: 'Patterns' },
  ],
  prisma: [
    { id: 'schema', label: 'Schema' },
    { id: 'queries', label: 'Queries' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'migrations', label: 'Migrations' },
    { id: 'prisma7', label: 'Prisma 7' },
  ],
  sql: [
    { id: 'joins', label: 'Joins' },
    { id: 'nulls', label: 'NULLs & filters' },
    { id: 'indexes', label: 'Indexes' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'modeling', label: 'Modeling' },
  ],
};

export const DEFAULT_FILTERS: QuizFilters = {
  techs: TECHS.map((tech) => tech.id),
  kinds: KINDS.map((kind) => kind.id),
  topics: [],
  difficulties: DIFFICULTIES.map((difficulty) => difficulty.id),
};

export function techLabel(tech: Tech): string {
  return TECHS.find((item) => item.id === tech)?.label ?? tech;
}

export function topicLabel(tech: Tech, topic: string): string {
  return TOPICS[tech].find((item) => item.id === topic)?.label ?? topic;
}

export function kindLabel(kind: Kind): string {
  return KINDS.find((item) => item.id === kind)?.label ?? kind;
}
