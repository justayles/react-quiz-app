import type { Question } from './types';
import { javascriptQuestions } from './questions/javascript';
import { next15aQuestions } from './questions/next15a';
import { next15bQuestions } from './questions/next15b';
import { next16aQuestions } from './questions/next16a';
import { next16bQuestions } from './questions/next16b';
import { react19aQuestions } from './questions/react19a';
import { react19bQuestions } from './questions/react19b';
import { typescriptQuestions } from './questions/typescript';
import { nodeQuestions } from './questions/node';
import { playwrightQuestions } from './questions/playwright';
import { jestQuestions } from './questions/jest';
import { vitestQuestions } from './questions/vitest';
import { rtlQuestions } from './questions/rtl';
import { prismaQuestions } from './questions/prisma';
import { sqlQuestions } from './questions/sql';

export const allQuestions: Question[] = [
  ...javascriptQuestions,
  ...typescriptQuestions,
  ...react19aQuestions,
  ...react19bQuestions,
  ...next15aQuestions,
  ...next15bQuestions,
  ...next16aQuestions,
  ...next16bQuestions,
  ...nodeQuestions,
  ...playwrightQuestions,
  ...jestQuestions,
  ...vitestQuestions,
  ...rtlQuestions,
  ...prismaQuestions,
  ...sqlQuestions,
];

export type { Question } from './types';
