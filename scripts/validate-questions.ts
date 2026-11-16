import { allQuestions } from '../src/data';
import { TOPICS } from '../src/data/topics';
import type { Question, Tech } from '../src/data/types';

const CLIENT_HOOKS =
  /\b(useState|useEffect|useLayoutEffect|useRef|useReducer|useMemo|useCallback|useImperativeHandle|useSyncExternalStore|useId|useOptimistic|useActionState|useFormStatus|useTransition|useDeferredValue|useEffectEvent|useInsertionEffect)\b/;
const CLIENT_EVENTS =
  /\bon(Click|Change|Submit|Blur|Focus|KeyDown|KeyUp|Input|PointerDown|PointerUp|MouseDown|MouseUp|MouseEnter|MouseLeave|Scroll|TouchStart)\b/;
const BROWSER_API = /\b(window\.|document\.|localStorage|sessionStorage|navigator\.)/;
const CLIENT_BOOTSTRAP = /\b(createRoot|hydrateRoot|ReactDOM\.render|ReactDOM\.hydrate)\b/;

function hasUseClient(source: string): boolean {
  return /^\s*['"]use client['"]/.test(source);
}

function looksLikeClientComponent(source: string): boolean {
  return CLIENT_HOOKS.test(source) || CLIENT_EVENTS.test(source) || BROWSER_API.test(source);
}

function isIntentionalMissingUseClient(question: Question): boolean {
  const text = `${question.prompt}\n${question.options.join('\n')}\n${question.explanation.answer}`;
  return /no directive|no ['"]use client['"]/i.test(text);
}

function assertUseClient(where: string, field: string, source: string | undefined, skip: boolean): void {
  if (!source || skip || CLIENT_BOOTSTRAP.test(source)) return;
  if (looksLikeClientComponent(source) && !hasUseClient(source)) {
    errors.push(`${where}: ${field} looks like a Client Component but is missing 'use client'`);
  }
}

const MIN_BY_TECH: Record<Tech, number> = {
  javascript: 50,
  typescript: 50,
  react19: 100,
  next15: 70,
  next16: 70,
  node: 40,
  playwright: 36,
  jest: 32,
  vitest: 32,
  rtl: 36,
  prisma: 36,
  sql: 36,
};

const MIN_BY_TOPIC: Array<[Tech, string, number]> = [
  ['react19', 'rsc', 18],
  ['react19', 'server-actions', 16],
  ['react19', 'use-hook', 14],
  ['react19', 'transitions', 16],
  ['react19', 'hooks-rendering', 16],
  ['react19', 'compiler-memo', 8],
  ['react19', 'react19-api', 12],
  ['next15', 'caching', 14],
  ['next15', 'isr', 8],
  ['next15', 'rendering', 12],
  ['next15', 'ppr', 6],
  ['next15', 'async-apis', 8],
  ['next15', 'routing-other', 22],
  ['next16', 'caching', 14],
  ['next16', 'isr', 8],
  ['next16', 'rendering', 12],
  ['next16', 'ppr', 10],
  ['next16', 'async-apis', 6],
  ['next16', 'routing-other', 20],
  ['node', 'event-loop', 8],
  ['node', 'modules', 8],
  ['node', 'streams', 8],
  ['node', 'runtime', 8],
  ['node', 'workers', 6],
  ['playwright', 'locators', 10],
  ['playwright', 'assertions', 8],
  ['playwright', 'network', 8],
  ['playwright', 'isolation', 10],
  ['jest', 'mocks', 10],
  ['jest', 'matchers', 8],
  ['jest', 'timers-async', 8],
  ['jest', 'jest-config', 6],
  ['vitest', 'mocks', 10],
  ['vitest', 'timers-async', 8],
  ['vitest', 'environment', 8],
  ['vitest', 'vitest-vs-jest', 6],
  ['rtl', 'queries', 12],
  ['rtl', 'user-events', 10],
  ['rtl', 'async-ui', 8],
  ['rtl', 'patterns', 6],
  ['prisma', 'schema', 8],
  ['prisma', 'queries', 10],
  ['prisma', 'transactions', 6],
  ['prisma', 'migrations', 6],
  ['prisma', 'prisma7', 6],
  ['sql', 'joins', 8],
  ['sql', 'nulls', 7],
  ['sql', 'indexes', 7],
  ['sql', 'transactions', 8],
  ['sql', 'modeling', 6],
];

const errors: string[] = [];
const ids = new Set<string>();

for (const question of allQuestions) {
  const where = question.id || '(missing id)';
  if (!question.id || ids.has(question.id)) errors.push(`${where}: duplicate or missing id`);
  ids.add(question.id);

  const allowed = TOPICS[question.tech]?.some((topic) => topic.id === question.topic);
  if (!allowed) errors.push(`${where}: unknown topic "${question.topic}" for ${question.tech}`);

  if (question.options.length !== 4) errors.push(`${where}: expected 4 options`);
  if (new Set(question.options).size !== 4) errors.push(`${where}: options must be unique`);
  if (question.correctIndex < 0 || question.correctIndex > 3) {
    errors.push(`${where}: correctIndex out of range`);
  }

  const explanation = question.explanation;
  if (!explanation?.answer?.trim()) errors.push(`${where}: missing explanation.answer`);
  if (!explanation?.why?.trim() || explanation.why.trim().length < 80) {
    errors.push(`${where}: explanation.why is missing or too short`);
  }
  if (!explanation?.remember?.trim()) errors.push(`${where}: missing remember line`);
  if (!explanation?.example?.source?.trim() || explanation.example.source.trim().length < 20) {
    errors.push(`${where}: missing explanation.example`);
  }
  if (explanation?.example && !['js', 'ts', 'tsx'].includes(explanation.example.lang)) {
    errors.push(`${where}: example.lang must be js, ts, or tsx`);
  }

  const wrongOptions = question.options.filter((_, index) => index !== question.correctIndex);
  for (const option of wrongOptions) {
    const matches = explanation?.wrong?.filter((entry) => entry.option === option) ?? [];
    if (matches.length !== 1 || !matches[0].reason.trim()) {
      errors.push(`${where}: missing wrong-option reason for "${option}"`);
    }
  }

  if (
    (question.kind === 'spot-the-bug' || question.kind === 'code-output') &&
    !question.code?.source?.trim()
  ) {
    errors.push(`${where}: ${question.kind} question needs a code snippet`);
  }

  if ((question.tech === 'next15' || question.tech === 'next16') && !question.versionNote?.trim()) {
    errors.push(`${where}: Next.js questions need a versionNote`);
  }

  if (question.tech === 'react19' || question.tech === 'next15' || question.tech === 'next16') {
    const skipQuestionCode = isIntentionalMissingUseClient(question);
    assertUseClient(where, 'code', question.code?.source, skipQuestionCode);
    assertUseClient(where, 'example', explanation?.example?.source, false);
    assertUseClient(where, 'fixedCode', explanation?.fixedCode?.source, false);
  }
}

for (const [tech, minimum] of Object.entries(MIN_BY_TECH) as Array<[Tech, number]>) {
  const count = allQuestions.filter((question) => question.tech === tech).length;
  if (count < minimum) errors.push(`${tech}: have ${count}, need at least ${minimum}`);
}

for (const [tech, topic, minimum] of MIN_BY_TOPIC) {
  const count = allQuestions.filter((question) => question.tech === tech && question.topic === topic).length;
  if (count < minimum) errors.push(`${tech}/${topic}: have ${count}, need at least ${minimum}`);
}

const codeHeavy = allQuestions.filter(
  (question) => question.kind === 'spot-the-bug' || question.kind === 'code-output',
).length;
const codeRatio = allQuestions.length === 0 ? 0 : codeHeavy / allQuestions.length;
if (codeRatio < 0.4) {
  errors.push(`code-output + spot-the-bug are ${(codeRatio * 100).toFixed(0)}%, need at least 40%`);
}

if (allQuestions.length < 340) {
  errors.push(`bank has ${allQuestions.length} questions, need at least 340`);
}

if (errors.length) {
  console.error(`Question bank failed validation (${errors.length} problems):`);
  errors.slice(0, 80).forEach((error) => console.error(`- ${error}`));
  if (errors.length > 80) console.error(`… and ${errors.length - 80} more`);
  process.exit(1);
}

console.log(
  `OK ${allQuestions.length} questions, ${codeHeavy} with code (${Math.round(codeRatio * 100)}%).`,
);
