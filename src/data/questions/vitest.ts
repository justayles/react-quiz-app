import type { Question } from '../types';

export const vitestQuestions = [
  {
    id: 'vitest-001',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The factory passes impl to the mock, but the file throws before the test body runs. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst impl = vi.fn(() => ({ id: 1 }));\n\nvi.mock('./api', () => ({\n  fetchUser: impl,\n}));\n\nit('loads a user', async () => {\n  await fetchUser();\n  expect(impl).toHaveBeenCalledTimes(1);\n});",
    },
    options: [
      'impl is read by the hoisted factory before that const is initialized',
      'A vi.mock factory must return a function, so returning an object throws',
      'A static import is bound to the real module and can never be mocked',
      'toHaveBeenCalledTimes is not a Vitest matcher, so the file fails to load',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The factory runs before impl is initialized, because vi.mock is hoisted above the const.',
      why: 'Vitest runs tests as ESM and still moves every vi.mock call above the imports it replaces. The factory moves with that call, but the const named impl does not. When the hoisted factory reads impl, the binding exists and is still in the temporal dead zone, so the file throws before the test starts. Returning an object of named exports is the normal factory shape, a static import can receive the mock, and toHaveBeenCalledTimes is a built-in matcher. Values the factory needs from the test file have to be created with vi.hoisted, which runs early enough for the factory to close over them.',
      wrong: [
        {
          option: 'A vi.mock factory must return a function, so returning an object throws',
          reason: 'The factory should return the module shape, which is an object of exports. That return is not what throws.',
        },
        {
          option: 'A static import is bound to the real module and can never be mocked',
          reason: 'A hoisted vi.mock replaces the module before the static import is evaluated, so the import can receive the mock.',
        },
        {
          option: 'toHaveBeenCalledTimes is not a Vitest matcher, so the file fails to load',
          reason: 'The matcher exists. The file fails earlier, while the hoisted factory is evaluating impl.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst { impl } = vi.hoisted(() => ({\n  impl: vi.fn(() => ({ id: 1 })),\n}));\n\nvi.mock('./api', () => ({\n  fetchUser: impl,\n}));\n\nit('loads a user', async () => {\n  await fetchUser();\n  expect(impl).toHaveBeenCalledTimes(1);\n});",
      },
      remember: 'A vi.mock factory can close over vi.hoisted values, not over a later const.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst { impl } = vi.hoisted(() => ({\n  impl: vi.fn(() => ({ id: 1 })),\n}));\n\nvi.mock('./api', () => ({\n  fetchUser: impl,\n}));\n\nit('loads a user', async () => {\n  await fetchUser();\n  expect(impl).toHaveBeenCalledTimes(1);\n});",
      },
    },
  },
  {
    id: 'vitest-002',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The real getToken returns the string real. The mock factory returns mocked. vi.mock is written below the import. What does getToken() return inside the test?',
    code: {
      lang: 'ts',
      source: "import { vi } from 'vitest';\nimport { getToken } from './auth';\n\nvi.mock('./auth', () => ({\n  getToken: () => 'mocked',\n}));\n\nit('reads the token', () => {\n  return getToken();\n});",
    },
    options: [
      'real, because the import already evaluated the original module',
      'mocked, because vi.mock is hoisted above the import',
      'undefined, because a factory cannot replace a named export',
      'The file throws, because vi.mock must be written before every import',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'getToken() returns mocked, because the mock call is moved above the import before the module loads.',
      why: 'Source order is not execution order for vi.mock. Vitest rewrites the file so the mock is registered before imports are evaluated, which is how an ESM test can still replace a static import. The factory then supplies getToken, so the imported binding is the mock and the call returns mocked. The file does not throw because the call sits below the import, and an object of named exports is the usual factory result. If the mock were vi.doMock instead, the static import would stay real, because that API is not hoisted.',
      wrong: [
        {
          option: 'real, because the import already evaluated the original module',
          reason: 'The import has not evaluated yet when the hoisted mock is registered. The binding is the mock.',
        },
        {
          option: 'undefined, because a factory cannot replace a named export',
          reason: 'A factory that returns getToken replaces that named export. The mock function returns mocked.',
        },
        {
          option: 'The file throws, because vi.mock must be written before every import',
          reason: 'The transform hoists the call, so writing it under the import is allowed and still mocks the module.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { getToken } from './auth';\n\nvi.mock('./auth', () => ({\n  getToken: () => 'mocked',\n}));\n\nit('reads the token', () => {\n  expect(getToken()).toBe('mocked');\n});",
      },
      remember: 'vi.mock is hoisted, so a static import below it still receives the mock.',
    },
  },
  {
    id: 'vitest-003',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'This partial mock should keep formatName real and replace only fetchUser. formatName is missing at runtime. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser, formatName } from './user';\n\nvi.mock('./user', () => ({\n  ...vi.importActual('./user'),\n  fetchUser: vi.fn(() => ({ id: 1 })),\n}));\n\nit('formats a name', () => {\n  expect(formatName('ada')).toBe('Ada');\n});",
    },
    options: [
      'formatName cannot be imported from a module that also exports a mock',
      'vi.fn() inside a factory is illegal unless it is wrapped in vi.hoisted',
      'vi.importActual returns a promise, so the spread copies the promise instead of the exports',
      'Partial mocks are unsupported, so every export must be written as vi.fn()',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The spread copies a promise, because vi.importActual is async and the factory never awaits it.',
      why: 'vi.importActual loads the real module and returns a promise. Spreading that promise does not copy formatName or the other exports, because a promise has no enumerable export fields. The factory object therefore only has the fetchUser override, and the imported formatName is undefined when the test calls it. The factory itself must be async, await the actual module, and then spread that object. vi.fn() is legal inside the factory because vi is already available there, and a partial mock is a supported pattern. A variable from the test scope would need vi.hoisted, but this factory does not close over one.',
      wrong: [
        {
          option: 'formatName cannot be imported from a module that also exports a mock',
          reason: 'Both names can be imported. formatName is missing because it was never copied onto the mock module.',
        },
        {
          option: 'vi.fn() inside a factory is illegal unless it is wrapped in vi.hoisted',
          reason: 'vi.fn() inside the factory is fine. vi.hoisted is for values declared in the test scope that the factory must close over.',
        },
        {
          option: 'Partial mocks are unsupported, so every export must be written as vi.fn()',
          reason: 'An async factory may await the real module and override only the exports the test needs to replace.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser, formatName } from './user';\n\nvi.mock('./user', async () => {\n  const actual = await vi.importActual<typeof import('./user')>('./user');\n  return {\n    ...actual,\n    fetchUser: vi.fn(() => ({ id: 1 })),\n  };\n});\n\nit('formats a name', () => {\n  expect(formatName('ada')).toBe('Ada');\n  expect(fetchUser()).toEqual({ id: 1 });\n});",
      },
      remember: 'Await vi.importActual inside an async factory before spreading the real exports.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser, formatName } from './user';\n\nvi.mock('./user', async () => {\n  const actual = await vi.importActual<typeof import('./user')>('./user');\n  return {\n    ...actual,\n    fetchUser: vi.fn(() => ({ id: 1 })),\n  };\n});\n\nit('formats a name', () => {\n  expect(formatName('ada')).toBe('Ada');\n  expect(fetchUser()).toEqual({ id: 1 });\n});",
      },
    },
  },
  {
    id: 'vitest-004',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'load is created as vi.fn(() => 7), then mockReturnValue(4) is added. The test calls load, then vi.resetAllMocks(), then load again. What does the second call return?',
    code: {
      lang: 'ts',
      source: "import { vi, it } from 'vitest';\n\nconst load = vi.fn(() => 7);\n\nit('resets the mock', () => {\n  load.mockReturnValue(4);\n  load();\n  vi.resetAllMocks();\n  return load();\n});",
    },
    options: [
      '4, because resetAllMocks only clears call history and keeps mockReturnValue',
      'undefined, because resetAllMocks always installs an empty function',
      'It throws, because resetAllMocks deletes the mock function',
      '7, because reset restores the implementation originally passed to vi.fn',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The second call returns 7. resetAllMocks puts back the implementation that was passed to vi.fn and drops the later mockReturnValue.',
      why: 'Walk the test in order. vi.fn(() => 7) stores that function as the original implementation. mockReturnValue(4) overrides it, so the first call returns 4 and records a call. vi.resetAllMocks runs mockReset on every mock: it clears the call history and restores each mock implementation. For a mock created as vi.fn(impl), Vitest restores impl, so the next call returns 7 again. vi.clearAllMocks would have cleared the history and left the override in place, so that call would still return 4. A vi.fn() with no implementation resets to an empty function that returns undefined. This is stricter than the slogan shared with Jest: Jest mockReset replaces even vi.fn(impl) with an empty function, while Vitest mockReset returns to impl. vi.restoreAllMocks is the third step, and it puts vi.spyOn methods back on their objects.',
      wrong: [
        {
          option: '4, because resetAllMocks only clears call history and keeps mockReturnValue',
          reason: 'Clearing history without touching the implementation is vi.clearAllMocks. Reset removes the mockReturnValue override.',
        },
        {
          option: 'undefined, because resetAllMocks always installs an empty function',
          reason: 'An empty function is the reset result only when vi.fn() was created with no implementation. This mock was created with () => 7.',
        },
        {
          option: 'It throws, because resetAllMocks deletes the mock function',
          reason: 'The function is still there. Reset changes its implementation and its recorded calls, then the call returns 7.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nconst load = vi.fn(() => 7);\n\nit('restores the original implementation', () => {\n  load.mockReturnValue(4);\n  expect(load()).toBe(4);\n  vi.resetAllMocks();\n  expect(load()).toBe(7);\n  expect(load.mock.calls).toHaveLength(1);\n});",
      },
      remember: 'vi.resetAllMocks clears history and restores the original vi.fn implementation.',
    },
  },
  {
    id: 'vitest-005',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The test replaces logger.write and later calls vi.restoreAllMocks(), expecting the original write to come back. The original stays gone. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, afterEach, expect, it } from 'vitest';\nimport { logger } from './logger';\n\nafterEach(() => {\n  vi.restoreAllMocks();\n});\n\nit('writes a line', () => {\n  logger.write = vi.fn();\n  logger.write('hi');\n  expect(logger.write).toHaveBeenCalledWith('hi');\n});",
    },
    options: [
      'write was overwritten with vi.fn(), and restoreAllMocks only restores vi.spyOn spies',
      'restoreAllMocks runs in afterEach before the test, so the original is saved too early',
      'vi.fn() returns the real write method, so the assignment does not replace it',
      'toHaveBeenCalledWith keeps the mock installed until the matcher is removed',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Assigning vi.fn() overwrites the property. vi.restoreAllMocks only restores spies created with vi.spyOn, so the original write is already gone.',
      why: 'logger.write = vi.fn() replaces the property with a new mock function. Vitest did not record the previous descriptor, so restoreAllMocks has nothing to put back and the property stays the mock. vi.spyOn(logger, "write") wraps the existing method and remembers the original. After that spy, mockReturnValue or mockImplementation can change the behavior, and vi.restoreAllMocks writes the original method back onto logger. A plain vi.fn() is not a spy, and restoreAllMocks does not walk ordinary assignments. afterEach runs after the test, which is the right time to restore, and the matcher is unrelated to cleanup.',
      wrong: [
        {
          option: 'restoreAllMocks runs in afterEach before the test, so the original is saved too early',
          reason: 'afterEach runs when the test finishes. The original was lost during the test, at the assignment.',
        },
        {
          option: 'vi.fn() returns the real write method, so the assignment does not replace it',
          reason: 'vi.fn() creates a new mock. Assigning it replaces write, which is why the original cannot be found later.',
        },
        {
          option: 'toHaveBeenCalledWith keeps the mock installed until the matcher is removed',
          reason: 'The matcher only reads call history. It does not control whether the original method is restored.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\nimport { logger } from './logger';\n\nafterEach(() => {\n  vi.restoreAllMocks();\n});\n\nit('writes a line', () => {\n  const spy = vi.spyOn(logger, 'write').mockImplementation(() => undefined);\n  logger.write('hi');\n  expect(spy).toHaveBeenCalledWith('hi');\n});",
      },
      remember: 'vi.restoreAllMocks puts back methods wrapped with vi.spyOn, not properties overwritten by assignment.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\nimport { logger } from './logger';\n\nafterEach(() => {\n  vi.restoreAllMocks();\n});\n\nit('writes a line', () => {\n  const spy = vi.spyOn(logger, 'write').mockImplementation(() => undefined);\n  logger.write('hi');\n  expect(spy).toHaveBeenCalledWith('hi');\n});",
      },
    },
  },
  {
    id: 'vitest-006',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A test must mock a module only after some setup, and only for a later dynamic import(). The static imports in the file must stay real. Which API matches that?',
    options: [
      'vi.mock, because its factory runs again on every dynamic import',
      'vi.doMock, because it is not hoisted and applies to a later dynamic import',
      'vi.importActual, because it reloads a module without using a factory',
      'vi.mocked, because it installs a mock the next time the function is called',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'vi.doMock is the non-hoisted mock. It can close over setup from the test and affects a dynamic import that happens after the call.',
      why: 'vi.mock is moved to the top of the file, so it cannot wait for setup and it replaces static imports as well. vi.doMock stays where you write it. The factory may use variables from the test, and the next import() of that module receives the mock. A static import that already ran stays on the real module, which is what this test wants. You still call import() after doMock. vi.importActual loads the real module and does not install a mock. vi.mocked only adjusts TypeScript types and returns the same value. When you are done, vi.doUnmock removes the registration so a later import can be real again.',
      wrong: [
        {
          option: 'vi.mock, because its factory runs again on every dynamic import',
          reason: 'vi.mock is hoisted once for the file. It does not wait for setup, and it mocks static imports too.',
        },
        {
          option: 'vi.importActual, because it reloads a module without using a factory',
          reason: 'importActual bypasses mocks and returns the real module as a promise. It does not install one.',
        },
        {
          option: 'vi.mocked, because it installs a mock the next time the function is called',
          reason: 'vi.mocked is a type helper. It returns the value you passed and does not register a module mock.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('mocks the next import', async () => {\n  let calls = 0;\n  vi.doMock('./flag', () => ({\n    enabled: () => {\n      calls += 1;\n      return true;\n    },\n  }));\n  const flag = await import('./flag');\n  expect(flag.enabled()).toBe(true);\n  expect(calls).toBe(1);\n  vi.doUnmock('./flag');\n});",
      },
      remember: 'Use vi.doMock when the mock must run after setup and only affect a later import().',
    },
  },
  {
    id: 'vitest-007',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The module path is stored in a variable so several mocks can share it. The file throws before the test runs. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { ping } from './net';\n\nconst target = './net';\n\nvi.mock(target, () => ({\n  ping: vi.fn(() => 'ok'),\n}));\n\nit('pings', () => {\n  expect(ping()).toBe('ok');\n});",
    },
    options: [
      'ping is a static import, so a factory mock cannot replace it',
      'vi.fn() inside the factory runs too late to become the export',
      'The hoisted call reads target before that const is initialized',
      'A const path is hoisted with the mock, so the factory receives an empty string',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'vi.mock is hoisted above the const, so reading target throws before the variable is initialized.',
      why: 'Vitest statically lifts vi.mock to the top of the file so the mock exists before imports. The argument moves with the call. target is a const in the test scope, so the lifted call reads it during the temporal dead zone and throws a ReferenceError. The transform also has to see the module specifier in the source, as a string literal or a direct import() expression, in order to connect the mock to that module. A variable is not that specifier. vi.fn() inside the factory is legal, and a string-literal vi.mock can replace the static ping import. Put the path in quotes at the call.',
      wrong: [
        {
          option: 'ping is a static import, so a factory mock cannot replace it',
          reason: 'A hoisted vi.mock with a literal path replaces the module the static import receives.',
        },
        {
          option: 'vi.fn() inside the factory runs too late to become the export',
          reason: 'The factory may call vi.fn(). The failure happens earlier, when the hoisted call evaluates target.',
        },
        {
          option: 'A const path is hoisted with the mock, so the factory receives an empty string',
          reason: 'The const is not hoisted with the call. The early read throws instead of passing an empty string.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { ping } from './net';\n\nvi.mock('./net', () => ({\n  ping: vi.fn(() => 'ok'),\n}));\n\nit('pings', () => {\n  expect(ping()).toBe('ok');\n});",
      },
      remember: 'Pass vi.mock a string literal or a direct import() expression, not a variable.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { ping } from './net';\n\nvi.mock('./net', () => ({\n  ping: vi.fn(() => 'ok'),\n}));\n\nit('pings', () => {\n  expect(ping()).toBe('ok');\n});",
      },
    },
  },
  {
    id: 'vitest-008',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'nextId is vi.fn(() => 1). Two mockReturnValueOnce calls queue 8 and then 9. The test calls nextId three times. What are the three results, in order?',
    code: {
      lang: 'ts',
      source: "import { vi, it } from 'vitest';\n\nconst nextId = vi.fn(() => 1);\nnextId.mockReturnValueOnce(8);\nnextId.mockReturnValueOnce(9);\n\nit('queues once values', () => {\n  return [nextId(), nextId(), nextId()];\n});",
    },
    options: [
      '1, 1, 1, because the original implementation wins over once values',
      '8, 8, 8, because the first once value replaces the implementation',
      '9, 8, 1, because once values are consumed from last to first',
      '8, 9, 1, because each once value is used once and then the original implementation returns',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The three calls return 8, then 9, then 1. Each mockReturnValueOnce is consumed once, in the order it was queued.',
      why: 'mockReturnValueOnce pushes a one-shot result onto a queue. The first call takes 8 and removes it. The second call takes 9 and removes it. The queue is then empty, so the third call uses the implementation originally passed to vi.fn, which returns 1. The queue is first in, first out, not a stack, so 9 is not used before 8. A one-shot value does not erase the implementation for later calls. mockReturnValue, without Once, would keep returning the same override until reset. vi.resetAllMocks would also clear any unused once values and restore () => 1 before the next call.',
      wrong: [
        {
          option: '1, 1, 1, because the original implementation wins over once values',
          reason: 'Once values are preferred until the queue is empty. The original implementation is the fallback after that.',
        },
        {
          option: '8, 8, 8, because the first once value replaces the implementation',
          reason: 'Once means a single call. The first override is not sticky, and the second queued value is still waiting.',
        },
        {
          option: '9, 8, 1, because once values are consumed from last to first',
          reason: 'The queue is consumed in the order the once calls were written, so 8 is used before 9.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nconst nextId = vi.fn(() => 1);\n\nit('queues once values', () => {\n  nextId.mockReturnValueOnce(8);\n  nextId.mockReturnValueOnce(9);\n  expect(nextId()).toBe(8);\n  expect(nextId()).toBe(9);\n  expect(nextId()).toBe(1);\n});",
      },
      remember: 'mockReturnValueOnce values are used in order, then the mock falls back to its implementation.',
    },
  },
  {
    id: 'vitest-009',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You want to mock createUser and keep hashPassword from the same module as the real function. The test file already has a static import of both names. Which setup does that?',
    options: [
      'An async vi.mock factory that awaits vi.importActual and overrides only createUser',
      'vi.doMock after the static import, with no factory, so hashPassword stays real on that binding',
      'vi.mocked(hashPassword), which keeps the real function and mocks createUser beside it',
      'vi.resetModules() by itself, which reloads the module with createUser already replaced',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Use a hoisted async vi.mock factory, await vi.importActual, spread the real module, and replace only createUser.',
      why: 'The static import receives whatever module is registered before it evaluates. vi.mock is hoisted, so it is the API that can change that binding. vi.importActual returns a promise of the real module, ignoring the mock that is currently being installed, which is why the factory must be async and must await before the spread. Overriding createUser on that object leaves hashPassword as the real function. vi.doMock does not rewrite a static import that is already part of the file. vi.mocked does not install a mock. vi.resetModules clears the module cache for a later dynamic import and does not by itself replace createUser.',
      wrong: [
        {
          option: 'vi.doMock after the static import, with no factory, so hashPassword stays real on that binding',
          reason: 'doMock is not hoisted and does not change the static binding. An empty factory is not how you keep one real export.',
        },
        {
          option: 'vi.mocked(hashPassword), which keeps the real function and mocks createUser beside it',
          reason: 'vi.mocked is a type helper. It does not mock a neighboring export.',
        },
        {
          option: 'vi.resetModules() by itself, which reloads the module with createUser already replaced',
          reason: 'resetModules drops cached modules. It does not register a mock, and it does not refresh a static import.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { createUser, hashPassword } from './account';\n\nvi.mock('./account', async () => {\n  const actual = await vi.importActual<typeof import('./account')>('./account');\n  return {\n    ...actual,\n    createUser: vi.fn(() => ({ id: 1 })),\n  };\n});\n\nit('keeps the real hasher', () => {\n  expect(hashPassword('secret')).toBeTypeOf('string');\n  expect(createUser()).toEqual({ id: 1 });\n});",
      },
      remember: 'Partial mocks await vi.importActual inside an async vi.mock factory.',
    },
  },
  {
    id: 'vitest-010',
    tech: 'vitest',
    topic: 'mocks',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'hash is the real function from the module. It was never passed to vi.fn or vi.spyOn. The test throws when it reaches mockReturnValue. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { hash } from './password';\n\nit('stubs hash', () => {\n  vi.mocked(hash).mockReturnValue('stub');\n  expect(hash('secret')).toBe('stub');\n});",
    },
    options: [
      'mockReturnValue is only legal on vi.spyOn, so a module export is rejected before the call',
      'vi.mocked does not install a mock, so the real function has no mockReturnValue',
      'hash cannot return a string, so Vitest removes mockReturnValue from the type at runtime',
      'vi.mocked resets the module graph, so hash is undefined inside the test',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'vi.mocked returns the same function you passed in. It is a TypeScript helper, so the real hash has no mockReturnValue and the call throws.',
      why: 'vi.mocked exists so TypeScript will treat an already mocked function as a mock, including options such as partial and deep for return types. At runtime it returns its argument unchanged. hash is still the real implementation, and a plain function does not have mockReturnValue, so the property access throws. The helper does not call vi.fn, does not spy, and does not reset the module graph. To stub this export, register it with vi.mock as a vi.fn, or spy a method on an object you own. After the function really is a mock, vi.mocked can type the mockReturnValue call. It still will not create the mock for you.',
      wrong: [
        {
          option: 'mockReturnValue is only legal on vi.spyOn, so a module export is rejected before the call',
          reason: 'mockReturnValue works on any vi.fn mock, including one installed by a factory. This hash was never made into a mock.',
        },
        {
          option: 'hash cannot return a string, so Vitest removes mockReturnValue from the type at runtime',
          reason: 'The failure is a missing method at runtime. vi.mocked does not delete methods based on the return type.',
        },
        {
          option: 'vi.mocked resets the module graph, so hash is undefined inside the test',
          reason: 'vi.mocked does not touch the module cache. hash is the real function, which is why the mock method is missing.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { hash } from './password';\n\nconst { hashMock } = vi.hoisted(() => ({\n  hashMock: vi.fn(() => 'stub'),\n}));\n\nvi.mock('./password', () => ({\n  hash: hashMock,\n}));\n\nit('stubs hash', () => {\n  expect(hash('secret')).toBe('stub');\n  expect(vi.mocked(hashMock)).toHaveBeenCalledWith('secret');\n});",
      },
      remember: 'vi.mocked only types a mock. vi.fn, vi.spyOn, or vi.mock creates one.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { hash } from './password';\n\nconst { hashMock } = vi.hoisted(() => ({\n  hashMock: vi.fn(() => 'stub'),\n}));\n\nvi.mock('./password', () => ({\n  hash: hashMock,\n}));\n\nit('stubs hash', () => {\n  expect(hash('secret')).toBe('stub');\n  expect(vi.mocked(hashMock)).toHaveBeenCalledWith('secret');\n});",
      },
    },
  },
  {
    id: 'vitest-011',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'Fake timers are on, and the test awaits a promise that resolves from setTimeout. The test times out. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\n\nit('waits a second', async () => {\n  vi.useFakeTimers();\n  const done = new Promise((resolve) => {\n    setTimeout(resolve, 1000);\n  });\n  await done;\n  expect(true).toBe(true);\n});",
    },
    options: [
      'setTimeout cannot be faked, so the promise rejects as soon as useFakeTimers returns',
      'expect(true) is illegal while fake timers are installed',
      'The promise is awaited before any timer is advanced, so the fake timer never fires',
      'useFakeTimers only fakes Date, so this setTimeout uses the real clock and is merely slow',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The await waits for a timer that will not fire. Fake timers stay still until the test advances them.',
      why: 'vi.useFakeTimers replaces setTimeout, setInterval, and Date with a clock the test controls. The promise executor schedules a timer, then await done suspends the test. Nothing in this file calls vi.advanceTimersByTime or vi.runAllTimers, so the fake clock never reaches 1000 ms and resolve is never called. The test sits until Vitest hits its timeout. Advance the clock before awaiting the promise: the timer callback runs, resolve happens, and the await can finish. useFakeTimers does fake setTimeout, not only Date. Turn the real clock back on with vi.useRealTimers when the test is done so later tests are not stuck the same way.',
      wrong: [
        {
          option: 'setTimeout cannot be faked, so the promise rejects as soon as useFakeTimers returns',
          reason: 'setTimeout is faked. The promise stays pending. It does not reject when fake timers are enabled.',
        },
        {
          option: 'expect(true) is illegal while fake timers are installed',
          reason: 'The assertion is never reached. The test is still suspended on the pending promise.',
        },
        {
          option: 'useFakeTimers only fakes Date, so this setTimeout uses the real clock and is merely slow',
          reason: 'useFakeTimers fakes setTimeout. The callback does not run on the real clock, so the test is stuck, not slow.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('waits a second', async () => {\n  vi.useFakeTimers();\n  let settled = false;\n  const done = new Promise((resolve) => {\n    setTimeout(() => {\n      settled = true;\n      resolve(true);\n    }, 1000);\n  });\n  vi.advanceTimersByTime(1000);\n  await done;\n  expect(settled).toBe(true);\n  vi.useRealTimers();\n});",
      },
      remember: 'Advance fake timers before you await a promise that only resolves from a timer.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('waits a second', async () => {\n  vi.useFakeTimers();\n  let settled = false;\n  const done = new Promise((resolve) => {\n    setTimeout(() => {\n      settled = true;\n      resolve(true);\n    }, 1000);\n  });\n  vi.advanceTimersByTime(1000);\n  await done;\n  expect(settled).toBe(true);\n  vi.useRealTimers();\n});",
      },
    },
  },
  {
    id: 'vitest-012',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Fake timers are on. One callback is due in 500 ms and another in 1500 ms. The test advances 500 ms. Which callbacks have run?',
    code: {
      lang: 'ts',
      source: "import { vi, it } from 'vitest';\n\nit('advances part of the clock', () => {\n  vi.useFakeTimers();\n  const ran: string[] = [];\n  setTimeout(() => ran.push('early'), 500);\n  setTimeout(() => ran.push('late'), 1500);\n  vi.advanceTimersByTime(500);\n  return ran;\n});",
    },
    options: [
      'Both, because advanceTimersByTime runs every pending timer',
      'Neither, because only runAllTimers executes callbacks',
      'Only late, because the clock jumps to the last scheduled delay',
      'Only early, because late is still 1000 ms in the future',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Only the early callback has run. Advancing 500 ms fires timers that are due at that moment and leaves the 1500 ms timer queued.',
      why: 'vi.advanceTimersByTime moves the fake clock by the amount you pass and runs timers that are due along the way. The early timer is due at 500 ms, so its callback pushes early. The late timer is due at 1500 ms, and the clock is only at 500, so it stays pending and ran is ["early"]. vi.runAllTimers would empty the queue and run both, which is a different call. The clock does not jump to the farthest timer unless you advance that far or run all timers. After a partial advance, another advanceTimersByTime(1000) would run the late callback. Call vi.useRealTimers when the test no longer wants the fake clock.',
      wrong: [
        {
          option: 'Both, because advanceTimersByTime runs every pending timer',
          reason: 'That is vi.runAllTimers. advanceTimersByTime stops at the duration you give it.',
        },
        {
          option: 'Neither, because only runAllTimers executes callbacks',
          reason: 'advanceTimersByTime does execute due callbacks. The early timer is due at the new time.',
        },
        {
          option: 'Only late, because the clock jumps to the last scheduled delay',
          reason: 'The clock moves by 500 ms, not to 1500. The later timer has not come due.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('advances part of the clock', () => {\n  vi.useFakeTimers();\n  const ran: string[] = [];\n  setTimeout(() => ran.push('early'), 500);\n  setTimeout(() => ran.push('late'), 1500);\n  vi.advanceTimersByTime(500);\n  expect(ran).toEqual(['early']);\n  vi.useRealTimers();\n});",
      },
      remember: 'vi.advanceTimersByTime runs timers due within that span and leaves later timers queued.',
    },
  },
  {
    id: 'vitest-013',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'This test fakes the clock. A later test in the file awaits a real setTimeout and times out. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\n\nit('freezes time', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));\n  expect(new Date().getUTCFullYear()).toBe(2020);\n});",
    },
    options: [
      'Fake timers were never turned off, so later tests still have the faked clock',
      'setSystemTime throws when fake timers are already enabled',
      'getUTCFullYear is missing on the Date object Vitest installs',
      'useFakeTimers clears timers for the whole process and cannot be limited to one test',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'vi.useFakeTimers stays in effect until vi.useRealTimers. The next test still has a fake setTimeout, so awaiting it never reaches the real clock.',
      why: 'useFakeTimers replaces timer functions and Date for the rest of the worker, not only for the current test body. This test checks the year and returns without calling vi.useRealTimers. The following test schedules a real-looking setTimeout and awaits it, but the callback is on the fake clock and nothing advances that clock, so the test times out. setSystemTime is valid while fake timers are on: it moves the mocked current time and does not by itself fire timers. getUTCFullYear still exists on the mocked Date. Put vi.useRealTimers in afterEach, or at the end of the test, so the real clock is restored even when the test fails.',
      wrong: [
        {
          option: 'setSystemTime throws when fake timers are already enabled',
          reason: 'setSystemTime is meant to be used with fake timers. It changes the mocked clock and does not throw for that reason.',
        },
        {
          option: 'getUTCFullYear is missing on the Date object Vitest installs',
          reason: 'The mocked Date still has the Date methods. This test can read the UTC year it just set.',
        },
        {
          option: 'useFakeTimers clears timers for the whole process and cannot be limited to one test',
          reason: 'It can be limited to the tests that need it. vi.useRealTimers turns the real timers back on.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.useRealTimers();\n});\n\nit('freezes time', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));\n  expect(new Date().getUTCFullYear()).toBe(2020);\n});",
      },
      remember: 'Call vi.useRealTimers after a test that enabled fake timers.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.useRealTimers();\n});\n\nit('freezes time', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));\n  expect(new Date().getUTCFullYear()).toBe(2020);\n});",
      },
    },
  },
  {
    id: 'vitest-014',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Fake timers are enabled and the system time is set to 1 January 2024 at 00:00 UTC. What does new Date().toISOString() return?',
    code: {
      lang: 'ts',
      source: "import { vi, it } from 'vitest';\n\nit('sets the clock', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));\n  return new Date().toISOString();\n});",
    },
    options: [
      'The real current time, because setSystemTime only affects Date.now()',
      '2024-01-01T00:00:00.000Z, because the faked Date reads the system time you set',
      '1970-01-01T00:00:00.000Z, because fake timers always start at the unix epoch',
      'It throws, because setSystemTime cannot be called while fake timers are on',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'new Date().toISOString() returns 2024-01-01T00:00:00.000Z. setSystemTime moves the clock that the faked Date reads.',
      why: 'vi.useFakeTimers mocks Date along with setTimeout and setInterval. vi.setSystemTime then sets that clock to the Date you pass. new Date() with no arguments reads the mocked current time, and toISOString formats it in UTC, so the result is exactly 2024-01-01T00:00:00.000Z. Date.now() returns the same instant as a number. setSystemTime does not flush queued timers. It only changes the current time. The fake clock does not reset to the unix epoch unless you set that time yourself. If fake timers were off, setSystemTime would still mock Date, but the usual pattern is to enable fake timers first and call vi.useRealTimers when the assertion is done.',
      wrong: [
        {
          option: 'The real current time, because setSystemTime only affects Date.now()',
          reason: 'setSystemTime also affects new Date() and other date APIs on the fake clock, not only Date.now().',
        },
        {
          option: '1970-01-01T00:00:00.000Z, because fake timers always start at the unix epoch',
          reason: 'The fake clock uses the time you pass to setSystemTime. Epoch is not forced.',
        },
        {
          option: 'It throws, because setSystemTime cannot be called while fake timers are on',
          reason: 'Calling setSystemTime while fake timers are enabled is the normal way to pin the clock.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('sets the clock', () => {\n  vi.useFakeTimers();\n  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));\n  expect(new Date().toISOString()).toBe('2024-01-01T00:00:00.000Z');\n  expect(Date.now()).toBe(Date.parse('2024-01-01T00:00:00.000Z'));\n  vi.useRealTimers();\n});",
      },
      remember: 'With fake timers, vi.setSystemTime is the current time that new Date() and Date.now() read.',
    },
  },
  {
    id: 'vitest-015',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The interval records a tick and is never cleared. The test calls vi.runAllTimers() and throws. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\n\nit('collects ticks', () => {\n  vi.useFakeTimers();\n  const ticks: number[] = [];\n  setInterval(() => {\n    ticks.push(ticks.length);\n  }, 10);\n  vi.runAllTimers();\n  expect(ticks.length).toBeGreaterThan(0);\n});",
    },
    options: [
      'setInterval is not faked, so runAllTimers has nothing to run and returns immediately',
      'The push throws, because ticks.length cannot be read inside the callback',
      'runAllTimers keeps firing the interval until Vitest hits its loop limit and throws',
      'useFakeTimers must be paired with setSystemTime or runAllTimers throws at once',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The interval schedules a new callback every time it runs. vi.runAllTimers tries to empty the queue, hits the loop limit, and throws.',
      why: 'vi.runAllTimers runs queued timers and also runs timers that those callbacks schedule, until the queue is empty. setInterval always queues another callback, so the queue never stays empty. Vitest stops that loop by throwing after too many repetitions instead of hanging the worker. The push itself is fine, and setInterval is faked by useFakeTimers, so this is not an empty queue. setSystemTime is unrelated. Advance a finite amount with vi.advanceTimersByTime, or clearInterval before runAllTimers, so the queue can empty. vi.useRealTimers belongs in cleanup so the interval does not leak into the next test.',
      wrong: [
        {
          option: 'setInterval is not faked, so runAllTimers has nothing to run and returns immediately',
          reason: 'useFakeTimers does fake setInterval. The throw comes from a queue that never empties, not from an empty one.',
        },
        {
          option: 'The push throws, because ticks.length cannot be read inside the callback',
          reason: 'Reading ticks.length inside the callback is valid. The failure is the endless interval.',
        },
        {
          option: 'useFakeTimers must be paired with setSystemTime or runAllTimers throws at once',
          reason: 'runAllTimers does not require setSystemTime. The interval is what makes the queue unbounded.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('collects one tick', () => {\n  vi.useFakeTimers();\n  const ticks: number[] = [];\n  const timer = setInterval(() => {\n    ticks.push(ticks.length);\n  }, 10);\n  vi.advanceTimersByTime(10);\n  clearInterval(timer);\n  expect(ticks).toEqual([0]);\n  vi.useRealTimers();\n});",
      },
      remember: 'Do not call vi.runAllTimers while a setInterval is still scheduling itself.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('collects one tick', () => {\n  vi.useFakeTimers();\n  const ticks: number[] = [];\n  const timer = setInterval(() => {\n    ticks.push(ticks.length);\n  }, 10);\n  vi.advanceTimersByTime(10);\n  clearInterval(timer);\n  expect(ticks).toEqual([0]);\n  vi.useRealTimers();\n});",
      },
    },
  },
  {
    id: 'vitest-016',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A value starts false and becomes true on a later turn, with no timer you control. You want the assertion retried until it passes or the timeout hits. Which API matches?',
    options: [
      'vi.runAllTimers, because a polling assertion is stored as a timer',
      'vi.waitFor, because a returned false makes it retry the callback',
      'vi.useFakeTimers, because polling does not run unless the fake clock advances',
      'expect.poll, because it retries until the matcher passes or the timeout is reached',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'expect.poll reruns the function and the matcher until the assertion passes or the timeout expires.',
      why: 'expect.poll(() => value) produces a value on each try, then runs the matcher you chain, such as toBe(true). A failing matcher schedules another try. A passing matcher stops. The whole expression is asynchronous, so the test must await it. vi.waitFor is the nearby tool, and it retries only when the callback throws or returns a rejected promise. Returning false from waitFor is a successful result, so it does not keep polling. vi.waitUntil is the one that retries while the callback returns a falsy value. vi.runAllTimers only flushes fake timers, and expect.poll does not require the fake clock. Use poll when the thing you want to retry is an assertion.',
      wrong: [
        {
          option: 'vi.runAllTimers, because a polling assertion is stored as a timer',
          reason: 'runAllTimers executes scheduled timers. It does not retry an assertion, and this case has no timer to flush.',
        },
        {
          option: 'vi.waitFor, because a returned false makes it retry the callback',
          reason: 'waitFor treats a returned false as success. It retries when the callback throws, which is a different contract.',
        },
        {
          option: 'vi.useFakeTimers, because polling does not run unless the fake clock advances',
          reason: 'expect.poll retries on its own interval. Enabling fake timers is not what starts the retries.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { expect, it } from 'vitest';\n\nit('polls until the value is ready', async () => {\n  let ready = false;\n  setTimeout(() => {\n    ready = true;\n  }, 20);\n  await expect.poll(() => ready).toBe(true);\n  expect(ready).toBe(true);\n});",
      },
      remember: 'await expect.poll when the retry should stop on a passing matcher.',
    },
  },
  {
    id: 'vitest-017',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Both tests are test.concurrent and both increment the same module-level counter, then await before expecting 1. What happens?',
    code: {
      lang: 'ts',
      source: "import { expect, test } from 'vitest';\n\nlet counter = 0;\n\ntest.concurrent('first', async () => {\n  counter += 1;\n  await Promise.resolve();\n  expect(counter).toBe(1);\n});\n\ntest.concurrent('second', async () => {\n  counter += 1;\n  await Promise.resolve();\n  expect(counter).toBe(1);\n});",
    },
    options: [
      'They fail, because the tests share counter and both increments happen before either assertion',
      'Both pass, because test.concurrent copies module variables into each test',
      'The file refuses to load, because test.concurrent is not a Vitest API',
      'They run one after another, so each assertion observes counter as 1',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The assertions fail. test.concurrent runs these tests at the same time in the file, and they share the one counter variable.',
      why: 'Each concurrent test starts and runs until its first await. The first test increments counter to 1 and awaits. The second test increments it to 2 and awaits. Only then do the assertions run, and both see 2, so toBe(1) fails. Vitest does not clone module bindings for test.concurrent, and it does not serialize those tests. The API is real: test.concurrent is how you mark tests in one file to run together. That is safe only when each test owns its data. A let inside the test, or a sequential test without concurrent, keeps the increments apart. Do not share a mutable counter, mock, or timer across tests that run at the same time.',
      wrong: [
        {
          option: 'Both pass, because test.concurrent copies module variables into each test',
          reason: 'There is one module scope. Both tests increment the same counter.',
        },
        {
          option: 'The file refuses to load, because test.concurrent is not a Vitest API',
          reason: 'test.concurrent is supported. The file runs, and the shared state makes the assertions fail.',
        },
        {
          option: 'They run one after another, so each assertion observes counter as 1',
          reason: 'concurrent means they overlap. The await points are where the two increments interleave.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { expect, test } from 'vitest';\n\ntest('first', async () => {\n  let counter = 0;\n  counter += 1;\n  await Promise.resolve();\n  expect(counter).toBe(1);\n});\n\ntest('second', async () => {\n  let counter = 0;\n  counter += 1;\n  await Promise.resolve();\n  expect(counter).toBe(1);\n});",
      },
      remember: 'test.concurrent tests in one file share mutable state, so each test must own its data.',
    },
  },
  {
    id: 'vitest-018',
    tech: 'vitest',
    topic: 'timers-async',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The callback returns false while node is missing and would return true later. vi.waitFor finishes on the first call, while node is still missing. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\n\nit('waits for a node', async () => {\n  let node: string | undefined;\n  setTimeout(() => {\n    node = 'ready';\n  }, 50);\n  await vi.waitFor(() => node === 'ready');\n  expect(node).toBe('ready');\n});",
    },
    options: [
      'waitFor only retries assertions that were written with expect.poll',
      'A returned false is a successful callback result, so waitFor does not retry',
      'The timeout is ignored unless vi.useFakeTimers is called before setTimeout',
      'waitFor clears timers, so node can never become ready',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'vi.waitFor stops because the callback returned false. A return value is success. Retries happen when the callback throws.',
      why: 'On the first check, node is still undefined, so node === "ready" is false. vi.waitFor treats that return as a finished callback and resolves immediately. The expect after it then fails because node is not ready yet. Throw inside the callback, usually with expect, when the condition is not met. waitFor catches that error and tries again until the callback completes or the timeout hits. The real setTimeout can still fire during those retries. vi.useFakeTimers is not required for this wait, and waitFor does not clear timers. If you want a boolean check instead of a thrown error, vi.waitUntil retries while the callback returns a falsy value. expect.poll is the form that retries a matcher.',
      wrong: [
        {
          option: 'waitFor only retries assertions that were written with expect.poll',
          reason: 'waitFor retries its own callback when that callback throws. expect.poll is a separate helper.',
        },
        {
          option: 'The timeout is ignored unless vi.useFakeTimers is called before setTimeout',
          reason: 'This setTimeout uses the real clock, and waitFor can observe it. The early return is what stops the wait.',
        },
        {
          option: 'waitFor clears timers, so node can never become ready',
          reason: 'The timer is still scheduled. waitFor ended because false counted as a successful return.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('waits for a node', async () => {\n  let node: string | undefined;\n  setTimeout(() => {\n    node = 'ready';\n  }, 50);\n  await vi.waitFor(() => {\n    expect(node).toBe('ready');\n  });\n});",
      },
      remember: 'vi.waitFor retries when the callback throws. A returned false does not count as a failure.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('waits for a node', async () => {\n  let node: string | undefined;\n  setTimeout(() => {\n    node = 'ready';\n  }, 50);\n  await vi.waitFor(() => {\n    expect(node).toBe('ready');\n  });\n});",
      },
    },
  },
  {
    id: 'vitest-019',
    tech: 'vitest',
    topic: 'environment',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The test reads document.body. The Vitest config does not set an environment, and the file has no environment docblock. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { expect, it } from 'vitest';\n\nit('reads the body', () => {\n  document.body.innerHTML = '<p>Hi</p>';\n  expect(document.body.textContent).toBe('Hi');\n});",
    },
    options: [
      'innerHTML is read-only in Vitest, so the assignment throws before the assertion',
      'The file must import document from vitest before a DOM exists',
      'The default environment is node, so document is missing until jsdom or happy-dom is selected',
      'textContent is always null in tests, so the assertion cannot pass',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Vitest defaults to the node environment, which has no document. This file never opts into jsdom or happy-dom.',
      why: 'With no environment in the config and no docblock, the test runs in node. document is not a node global, so reading document.body throws a ReferenceError before the assertion. Vitest does not export a document object to import. innerHTML and textContent work once a DOM environment is actually installed. Add a file comment @vitest-environment jsdom, or set the environment in config to jsdom or happy-dom. Those are simulated DOMs that still run inside node. Browser mode is a separate Vitest feature that runs tests in a real browser. It is not selected by leaving the environment unset, and it is not the same thing as jsdom.',
      wrong: [
        {
          option: 'innerHTML is read-only in Vitest, so the assignment throws before the assertion',
          reason: 'The throw is from missing document. In jsdom or happy-dom, assigning innerHTML is allowed.',
        },
        {
          option: 'The file must import document from vitest before a DOM exists',
          reason: 'document is not a vitest export. It appears when the environment provides a DOM.',
        },
        {
          option: 'textContent is always null in tests, so the assertion cannot pass',
          reason: 'textContent reflects the DOM you built. The test never gets that far in the node environment.',
        },
      ],
      example: {
        lang: 'ts',
        source: "// @vitest-environment jsdom\nimport { expect, it } from 'vitest';\n\nit('reads the body', () => {\n  document.body.innerHTML = '<p>Hi</p>';\n  expect(document.body.textContent).toBe('Hi');\n});",
      },
      remember: 'The default environment is node. jsdom and happy-dom are opt-in, and browser mode is separate.',
      fixedCode: {
        lang: 'ts',
        source: "// @vitest-environment jsdom\nimport { expect, it } from 'vitest';\n\nit('reads the body', () => {\n  document.body.innerHTML = '<p>Hi</p>';\n  expect(document.body.textContent).toBe('Hi');\n});",
      },
    },
  },
  {
    id: 'vitest-020',
    tech: 'vitest',
    topic: 'environment',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'globals is left at its default. The file calls describe, it, and expect without importing them. What happens when the file loads?',
    code: {
      lang: 'ts',
      source: "describe('suite', () => {\n  it('adds', () => {\n    expect(1 + 1).toBe(2);\n  });\n});",
    },
    options: [
      'The suite runs, because describe, it, expect, and vi are always global',
      'Only expect throws, because it and describe are injected while expect is not',
      'The suite is skipped, because a missing import marks the file as todo',
      'It throws a ReferenceError, because globals defaults to false and these names are not injected',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Loading the file throws a ReferenceError on describe. globals defaults to false, so those names are not injected.',
      why: 'Vitest does not put describe, it, expect, or vi on the global object unless config sets globals to true. The default is false, which keeps test files explicit and avoids clashing with other tools. This file calls describe immediately, and that binding does not exist, so the file fails before a test can run or be skipped. it and expect would throw for the same reason if describe were not first. The fix is to import them from vitest. Turning globals on is the other supported choice, and then the same file can omit the imports. globals still does not invent a jest object. The Vitest helper remains vi.',
      wrong: [
        {
          option: 'The suite runs, because describe, it, expect, and vi are always global',
          reason: 'They are global only when globals is true. The default leaves them undefined.',
        },
        {
          option: 'Only expect throws, because it and describe are injected while expect is not',
          reason: 'None of the three is injected by default. describe throws first because it is the first call.',
        },
        {
          option: 'The suite is skipped, because a missing import marks the file as todo',
          reason: 'A missing global is a ReferenceError, not a skipped or todo suite.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { describe, expect, it } from 'vitest';\n\ndescribe('suite', () => {\n  it('adds', () => {\n    expect(1 + 1).toBe(2);\n  });\n});",
      },
      remember: 'Import describe, it, expect, and vi from vitest unless globals is true.',
    },
  },
  {
    id: 'vitest-021',
    tech: 'vitest',
    topic: 'environment',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'mode copies process.env.MODE when the file loads. The test then calls vi.stubEnv and still sees the old string. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\n\nconst mode = process.env.MODE ?? 'development';\n\nit('reads production', () => {\n  vi.stubEnv('MODE', 'production');\n  expect(mode).toBe('production');\n});",
    },
    options: [
      'mode already copied the old env string, and stubEnv does not rewrite that variable',
      'stubEnv only writes import.meta.env, so process.env.MODE stays unchanged',
      'MODE is reserved, so stubEnv ignores that key',
      'stubEnv throws when the previous value was missing, so the assertion never runs',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'mode saved the env string at load time. vi.stubEnv updates later reads of process.env and import.meta.env, not a const that already holds the old value.',
      why: 'The const initializer runs when the file is evaluated, before the test body. It stores a string. vi.stubEnv("MODE", "production") then changes process.env.MODE and import.meta.env.MODE for code that reads them after the call. It does not search the module for variables that copied the old string, so expect(mode) still sees the loaded value. The key MODE is not special, and stubEnv does not throw just because you set it. Read process.env.MODE after the stub, inside the test or inside a function called after the stub. If another module captured the value at import time, call vi.resetModules and dynamically import that module after the stub. vi.unstubAllEnvs puts the stubbed keys back.',
      wrong: [
        {
          option: 'stubEnv only writes import.meta.env, so process.env.MODE stays unchanged',
          reason: 'stubEnv updates both process.env and import.meta.env. The stale value is the const, not process.env.',
        },
        {
          option: 'MODE is reserved, so stubEnv ignores that key',
          reason: 'MODE can be stubbed. A later read of process.env.MODE sees production.',
        },
        {
          option: 'stubEnv throws when the previous value was missing, so the assertion never runs',
          reason: 'stubEnv accepts the assignment. The assertion runs and compares the captured string.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.unstubAllEnvs();\n});\n\nit('reads production', () => {\n  vi.stubEnv('MODE', 'production');\n  expect(process.env.MODE).toBe('production');\n  expect(import.meta.env.MODE).toBe('production');\n});",
      },
      remember: 'vi.stubEnv changes later env reads. It does not update a string you already copied.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.unstubAllEnvs();\n});\n\nit('reads production', () => {\n  vi.stubEnv('MODE', 'production');\n  expect(process.env.MODE).toBe('production');\n  expect(import.meta.env.MODE).toBe('production');\n});",
      },
    },
  },
  {
    id: 'vitest-022',
    tech: 'vitest',
    topic: 'environment',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A test replaces the global fetch with a stub, and a later test must see the original fetch again. Which pair of calls matches Vitest?',
    options: [
      'vi.stubEnv("fetch", stub) to install it, and vi.resetModules() to restore the global',
      'vi.stubGlobal("fetch", stub) to install it, and vi.unstubAllGlobals() to restore it',
      'vi.mock("fetch") to install it, and vi.useRealTimers() to restore the global',
      'Assign globalThis.fetch = stub, which Vitest always reverts when the file ends',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'vi.stubGlobal replaces the global and records the previous value. vi.unstubAllGlobals writes those recorded values back.',
      why: 'stubGlobal sets the named property on the global object, so fetch and globalThis.fetch both see the stub. unstubAllGlobals restores every global that was changed through stubGlobal. vi.stubEnv is the matching pair for environment variables, together with vi.unstubAllEnvs, and it does not install fetch. vi.mock replaces a module in the import graph, not a global, and vi.useRealTimers only restores the fake clock. A hand-written assignment to globalThis.fetch is not tracked, so unstubAllGlobals will not undo it. Use the stub helper when the test needs a guaranteed restore, and call unstubAllGlobals in afterEach.',
      wrong: [
        {
          option: 'vi.stubEnv("fetch", stub) to install it, and vi.resetModules() to restore the global',
          reason: 'stubEnv changes process.env and import.meta.env. resetModules clears the module cache and does not restore globals.',
        },
        {
          option: 'vi.mock("fetch") to install it, and vi.useRealTimers() to restore the global',
          reason: 'vi.mock targets a module path. useRealTimers restores timers, not an arbitrary global.',
        },
        {
          option: 'Assign globalThis.fetch = stub, which Vitest always reverts when the file ends',
          reason: 'A raw assignment is not recorded. Only values set with vi.stubGlobal are restored by unstubAllGlobals.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.unstubAllGlobals();\n});\n\nit('stubs fetch', async () => {\n  const stub = vi.fn(() => Promise.resolve('ok'));\n  vi.stubGlobal('fetch', stub);\n  const result = await globalThis.fetch('https://example.test');\n  expect(result).toBe('ok');\n  expect(stub).toHaveBeenCalledTimes(1);\n});",
      },
      remember: 'vi.stubGlobal installs a global, and vi.unstubAllGlobals puts the previous values back.',
    },
  },
  {
    id: 'vitest-023',
    tech: 'vitest',
    topic: 'environment',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'One suite needs a real browser, including layout and APIs that a simulated DOM does not implement. The rest of the project should stay on the default environment. What should you use?',
    options: [
      'Set the project environment to jsdom so every file gains a browser',
      'Add a docblock of @vitest-environment browser at the top of the suite',
      'Use Vitest browser mode for that suite. It is separate from the jsdom and happy-dom environments',
      'Call vi.stubGlobal("window", {}) so the node environment becomes a browser',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Browser mode runs those tests in a real browser. jsdom and happy-dom are node environments that only simulate a DOM.',
      why: 'The default Vitest environment is node, which has no document. jsdom and happy-dom add a simulated DOM and still execute the test in node, so layout and many browser APIs are missing or fake. A docblock @vitest-environment jsdom or happy-dom selects one of those simulators for a file. The name browser is not an environment in that docblock. Browser mode is its own Vitest feature: the tests run in a real browser, which is what you want for layout and unimplemented APIs. Leave the other files on node, or on jsdom when a simulation is enough, and enable browser mode only for the suite that needs the real browser. An empty window stub does not implement a browser.',
      wrong: [
        {
          option: 'Set the project environment to jsdom so every file gains a browser',
          reason: 'jsdom is a simulation inside node, and it would also change files that should stay on the default.',
        },
        {
          option: 'Add a docblock of @vitest-environment browser at the top of the suite',
          reason: 'That docblock selects environments such as node, jsdom, and happy-dom. Browser mode is not that setting.',
        },
        {
          option: 'Call vi.stubGlobal("window", {}) so the node environment becomes a browser',
          reason: 'A stub object does not provide layout or browser APIs. It only replaces one global.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { expect, it } from 'vitest';\n\n// Run this file in Vitest browser mode, not under environment jsdom.\nit('uses a real browser document', () => {\n  const el = document.createElement('p');\n  el.textContent = 'Hi';\n  document.body.append(el);\n  expect(document.body.textContent).toContain('Hi');\n  expect(navigator.userAgent.length).toBeGreaterThan(0);\n});",
      },
      remember: 'jsdom and happy-dom simulate a DOM in node. Browser mode runs tests in a real browser.',
    },
  },
  {
    id: 'vitest-024',
    tech: 'vitest',
    topic: 'environment',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'increment adds one to a module-level counter that starts at 0, and count reads it. The test calls vi.resetModules() and still sees 1 through the static import. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { increment, count } from './counter';\n\nit('reloads the module', () => {\n  increment();\n  vi.resetModules();\n  expect(count).toBe(0);\n});",
    },
    options: [
      'resetModules deletes the counter export, so count is undefined rather than 1',
      'increment is mocked automatically, so it never changes module state',
      'A static import is re-evaluated whenever resetModules runs',
      'The static import stays bound to the first evaluation, so resetModules does not refresh it',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'count is still 1 because the static import keeps the first module instance. vi.resetModules only affects a later dynamic import().',
      why: 'The static import binds increment and count to the module that was evaluated when the file loaded. increment raises that module counter to 1. vi.resetModules clears the module registry so the next import() loads a fresh copy, but it does not rebind names that were already imported. The assertion reads the original count and sees 1. Vitest tests are ESM, so this is not the CommonJS require cache. Import the module with await import("./counter") after resetModules when you need the new counter. The first dynamic import can call increment, then resetModules, then a second import() starts again at 0.',
      wrong: [
        {
          option: 'resetModules deletes the counter export, so count is undefined rather than 1',
          reason: 'The static binding still points at the old module. count is the number 1, not a deleted export.',
        },
        {
          option: 'increment is mocked automatically, so it never changes module state',
          reason: 'Nothing mocked increment. The counter did change, and the static binding still sees that change.',
        },
        {
          option: 'A static import is re-evaluated whenever resetModules runs',
          reason: 'resetModules does not rerun a static import. A new import() is what loads the fresh module.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('reloads the module', async () => {\n  const first = await import('./counter');\n  first.increment();\n  expect(first.count).toBe(1);\n  vi.resetModules();\n  const next = await import('./counter');\n  expect(next.count).toBe(0);\n});",
      },
      remember: 'vi.resetModules plus a new import() loads a fresh module. A static import stays on the first one.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('reloads the module', async () => {\n  const first = await import('./counter');\n  first.increment();\n  expect(first.count).toBe(1);\n  vi.resetModules();\n  const next = await import('./counter');\n  expect(next.count).toBe(0);\n});",
      },
    },
  },
  {
    id: 'vitest-025',
    tech: 'vitest',
    topic: 'environment',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'One file needs happy-dom. The Vitest config leaves the environment at the default. How does that file opt in without changing the other files?',
    options: [
      'Put a @vitest-environment happy-dom docblock at the top of that file',
      'Import happy-dom from vitest so the default switches for that file only',
      'Use the forks pool, because a fork always provides a DOM',
      'Call vi.stubGlobal("document", null) to select the happy-dom environment',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A @vitest-environment happy-dom docblock selects happy-dom for that file and leaves the config default in place for the others.',
      why: 'The default environment is node. A comment at the top of a file, written as @vitest-environment happy-dom, tells Vitest to run that file in happy-dom instead. The same docblock accepts jsdom when you want the other simulator. Other files keep the config environment, which is node when environment was omitted. happy-dom is not an export you import from vitest to flip the environment. The forks pool runs tests in separate processes and isolates memory more strongly than threads. It does not install a DOM. vi.stubGlobal can replace document with a value you supply, and null is not a DOM and does not switch the environment.',
      wrong: [
        {
          option: 'Import happy-dom from vitest so the default switches for that file only',
          reason: 'The environment is chosen by config or the docblock. Importing a name from vitest does not select it.',
        },
        {
          option: 'Use the forks pool, because a fork always provides a DOM',
          reason: 'Forks are separate processes. They do not change the environment from node to a DOM.',
        },
        {
          option: 'Call vi.stubGlobal("document", null) to select the happy-dom environment',
          reason: 'stubGlobal replaces one global. It does not load happy-dom, and null is not a document.',
        },
      ],
      example: {
        lang: 'ts',
        source: "// @vitest-environment happy-dom\nimport { expect, it } from 'vitest';\n\nit('uses a simulated document', () => {\n  document.body.innerHTML = '<p>Hi</p>';\n  expect(document.body.textContent).toBe('Hi');\n  expect(typeof window).toBe('object');\n});",
      },
      remember: 'A @vitest-environment docblock overrides the environment for that file only.',
    },
  },
  {
    id: 'vitest-026',
    tech: 'vitest',
    topic: 'environment',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'One run uses the forks pool and another uses the threads pool. A test assigns a property on globalThis. Which statement is accurate?',
    options: [
      'Threads are separate processes, so a globalThis write in one thread is invisible to the others',
      'Forks are separate processes, so they isolate memory more strongly than threads, which share a process',
      'Both pools switch the environment to jsdom before each test file',
      'Vitest has no forks or threads pool, so every test shares one globalThis',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Forks are separate processes, so they do not share memory. Threads run in one process and isolate less strongly.',
      why: 'Vitest can run test files in a forks pool or a threads pool. A fork is its own process, with its own memory, so a globalThis property set in one fork is not the object another fork sees. Threads share a process, so isolation depends on the worker setup and is weaker than a process boundary. Neither pool name means the DOM environment. The default environment is still node unless you set jsdom, happy-dom, or browser mode. Do not rely on a global write leaking to another file in either pool. The safe pattern is to keep state inside the test and restore globals with vi.unstubAllGlobals when you changed them through vi.stubGlobal.',
      wrong: [
        {
          option: 'Threads are separate processes, so a globalThis write in one thread is invisible to the others',
          reason: 'That description is the forks pool. Threads are not separate processes.',
        },
        {
          option: 'Both pools switch the environment to jsdom before each test file',
          reason: 'The pool does not select the environment. jsdom is an environment setting, and the default is node.',
        },
        {
          option: 'Vitest has no forks or threads pool, so every test shares one globalThis',
          reason: 'Both pools exist. Forks give the stronger boundary because each one is a process.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, afterEach, expect, it } from 'vitest';\n\nafterEach(() => {\n  vi.unstubAllGlobals();\n});\n\nit('keeps a global inside the test', () => {\n  vi.stubGlobal('__quizFlag', 'local');\n  expect(globalThis.__quizFlag).toBe('local');\n});",
      },
      remember: 'Forks are separate processes and isolate memory more strongly than threads.',
    },
  },
  {
    id: 'vitest-027',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'This file was copied from Jest. The factory closes over mockFetch, which Jest allowed because of the mock prefix. Vitest throws before the test runs. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst mockFetch = vi.fn(() => ({ id: 1 }));\n\nvi.mock('./api', () => ({\n  fetchUser: mockFetch,\n}));\n\nit('fetches', async () => {\n  await fetchUser();\n  expect(mockFetch).toHaveBeenCalledTimes(1);\n});",
    },
    options: [
      'Vitest rejects every vi.fn that returns an object',
      'The Jest form works in Vitest when the variable name starts with mock',
      'Vitest does not hoist mock-prefixed variables. The factory must close over vi.hoisted',
      'A static ESM import cannot be mocked, so the variable prefix is unrelated',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The mock prefix does nothing in Vitest. The hoisted factory reads mockFetch before it is initialized. Create it with vi.hoisted.',
      why: 'Jest, through its hoisting transform, allows variables whose names start with mock to be used inside jest.mock factories. Vitest does not copy that rule. It still hoists vi.mock, and the factory still runs before the const line, so mockFetch is in the temporal dead zone and the file throws. The prefix is only a name. vi.hoisted runs in that early phase and returns values the factory can close over, which is the Vitest pattern. Returning an object from vi.fn is fine, and a static import can be mocked because the vi.mock call is hoisted above it. Rename the variable to mockFetch or to anything else and the bug stays until the value is created inside vi.hoisted.',
      wrong: [
        {
          option: 'Vitest rejects every vi.fn that returns an object',
          reason: 'The implementation may return an object. The throw is the early read of mockFetch.',
        },
        {
          option: 'The Jest form works in Vitest when the variable name starts with mock',
          reason: 'Vitest does not treat a mock prefix as hoisted. The name does not change when the const is initialized.',
        },
        {
          option: 'A static ESM import cannot be mocked, so the variable prefix is unrelated',
          reason: 'The static import can be mocked. The failure is the factory closing over a const that is not initialized yet.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst { mockFetch } = vi.hoisted(() => ({\n  mockFetch: vi.fn(() => ({ id: 1 })),\n}));\n\nvi.mock('./api', () => ({\n  fetchUser: mockFetch,\n}));\n\nit('fetches', async () => {\n  await fetchUser();\n  expect(mockFetch).toHaveBeenCalledTimes(1);\n});",
      },
      remember: 'Jest hoists mock-prefixed variables. Vitest uses vi.hoisted instead.',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { fetchUser } from './api';\n\nconst { mockFetch } = vi.hoisted(() => ({\n  mockFetch: vi.fn(() => ({ id: 1 })),\n}));\n\nvi.mock('./api', () => ({\n  fetchUser: mockFetch,\n}));\n\nit('fetches', async () => {\n  await fetchUser();\n  expect(mockFetch).toHaveBeenCalledTimes(1);\n});",
      },
    },
  },
  {
    id: 'vitest-028',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The suite calls jest.fn() under Vitest with the default config. What happens?',
    code: {
      lang: 'ts',
      source: "import { expect, it } from 'vitest';\n\nit('builds a mock', () => {\n  const spy = jest.fn();\n  spy('ok');\n  expect(spy).toHaveBeenCalledWith('ok');\n});",
    },
    options: [
      'ok is recorded, because Vitest installs jest as an alias of vi',
      'The mock runs, but toHaveBeenCalledWith is ignored unless globals is true',
      'jest.fn() returns undefined, and the call throws when spy is invoked',
      'It throws a ReferenceError, because the Vitest API is vi, not a global jest',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The file throws a ReferenceError. Default Vitest does not define jest. The mock helper is vi.fn.',
      why: 'The test reaches jest.fn while loading the callback, and jest has no binding, so it throws before spy can be called. Vitest does not install a global jest alias of vi, even when you import expect and it from vitest. globals: true injects describe, it, expect, and vi. It does not inject jest. toHaveBeenCalledWith is a real matcher and is not the line that fails. The port is to call vi.fn(), vi.spyOn(), vi.mock(), and the other vi helpers. A project can assign its own alias, but the default config does not. Expect the same rename for timers: vi.useFakeTimers rather than jest.useFakeTimers.',
      wrong: [
        {
          option: 'ok is recorded, because Vitest installs jest as an alias of vi',
          reason: 'There is no default jest global. The call throws while resolving jest.',
        },
        {
          option: 'The mock runs, but toHaveBeenCalledWith is ignored unless globals is true',
          reason: 'The matcher is available from the expect import. Execution never gets there, because jest is missing.',
        },
        {
          option: 'jest.fn() returns undefined, and the call throws when spy is invoked',
          reason: 'jest itself is missing, so the throw is a ReferenceError on jest, not a call on undefined from a successful jest.fn().',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { expect, it, vi } from 'vitest';\n\nit('builds a mock', () => {\n  const spy = vi.fn();\n  spy('ok');\n  expect(spy).toHaveBeenCalledWith('ok');\n  expect(spy).toHaveBeenCalledTimes(1);\n});",
      },
      remember: 'Vitest mocks are vi.fn and vi.spyOn. A global jest object is not provided.',
    },
  },
  {
    id: 'vitest-029',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A teammate says this Vitest project has a DOM because their Jest setup did. The Vitest config omits environment. Which statement is true?',
    options: [
      'Vitest defaults to node. A DOM comes from jsdom, happy-dom, or browser mode, and browser mode is not jsdom',
      'Vitest defaults to jsdom and also reads Jest testEnvironment as its environment',
      'Vitest defaults to happy-dom whenever a test file imports expect',
      'Omitting environment selects browser mode, so document exists in every file',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Vitest defaults to the node environment. A Jest config key does not fill that in, and a DOM is something you opt into.',
      why: 'When environment is omitted, Vitest runs tests in node, so document is not defined. Jest projects often set testEnvironment themselves, sometimes to jsdom, but Vitest does not read that Jest key and does not adopt it as the default. You opt in with environment in the Vitest config, or with a @vitest-environment jsdom or happy-dom docblock on one file. Those two are simulated DOMs that still run in node. Browser mode is a separate feature that runs tests in a real browser. It is not selected by omitting environment, and it is not the same as setting jsdom. Importing expect has no effect on the environment.',
      wrong: [
        {
          option: 'Vitest defaults to jsdom and also reads Jest testEnvironment as its environment',
          reason: 'The Vitest default is node. Jest testEnvironment is a different config and is not applied automatically.',
        },
        {
          option: 'Vitest defaults to happy-dom whenever a test file imports expect',
          reason: 'Importing expect does not change the environment. happy-dom is an explicit environment name.',
        },
        {
          option: 'Omitting environment selects browser mode, so document exists in every file',
          reason: 'Omitting environment means node. Browser mode is configured separately and is not jsdom.',
        },
      ],
      example: {
        lang: 'ts',
        source: "// @vitest-environment jsdom\nimport { expect, it } from 'vitest';\n\nit('opts into a simulated document', () => {\n  document.body.textContent = 'Hi';\n  expect(document.body.textContent).toBe('Hi');\n});\n\n// Files without this docblock stay on the default, which is node.\n// Browser mode is a separate feature, not this environment.",
      },
      remember: 'Vitest defaults to node. jsdom, happy-dom, and browser mode are separate opt-ins.',
    },
  },
  {
    id: 'vitest-030',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The real enabled returns false. The test calls vi.doMock and then expects the static import to return true. It still returns false. What is the bug?',
    code: {
      lang: 'ts',
      source: "import { vi, expect, it } from 'vitest';\nimport { enabled } from './flag';\n\nit('enables the flag', () => {\n  vi.doMock('./flag', () => ({\n    enabled: () => true,\n  }));\n  expect(enabled()).toBe(true);\n});",
    },
    options: [
      'vi.doMock is hoisted like vi.mock, so it replaced the module before the import and the real function cannot return false',
      'vi.doMock is not hoisted, so the static import stays real. A later import() sees the mock',
      'An ESM factory cannot export a function, so enabled is removed and the call throws',
      'Dynamic import() is Jest-only, so Vitest ignores vi.doMock and always keeps the first mock',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The static import stays on the real module. vi.doMock is not hoisted, so it only affects a dynamic import that runs after the call.',
      why: 'Jest jest.mock is hoisted, and people often expect every mock helper to behave that way. vi.doMock is the Vitest helper that stays in place so its factory can use variables from the test. The static import of enabled was already bound to the real function, which returns false, and doMock does not rewrite that binding. A later await import("./flag") loads the mocked module and returns true. If the test needs the static binding itself to be mocked, use vi.mock, which Vitest hoists above the import even though the test file is ESM. vi.mock is the usual port of a hoisted Jest mock. vi.doMock is for the next import(), not for a binding that already exists.',
      wrong: [
        {
          option: 'vi.doMock is hoisted like vi.mock, so it replaced the module before the import and the real function cannot return false',
          reason: 'doMock is not hoisted. That is why the static call still returns false.',
        },
        {
          option: 'An ESM factory cannot export a function, so enabled is removed and the call throws',
          reason: 'A factory may export a function. This call does not throw. It invokes the real enabled.',
        },
        {
          option: 'Dynamic import() is Jest-only, so Vitest ignores vi.doMock and always keeps the first mock',
          reason: 'import() is how you load the module after doMock. Vitest does not ignore that mock.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { enabled } from './flag';\n\nvi.mock('./flag', () => ({\n  enabled: () => true,\n}));\n\nit('enables the static flag', () => {\n  expect(enabled()).toBe(true);\n});",
      },
      remember: 'vi.mock is hoisted and can replace a static import. vi.doMock only affects a later import().',
      fixedCode: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { enabled } from './flag';\n\nvi.mock('./flag', () => ({\n  enabled: () => true,\n}));\n\nit('enables the static flag', () => {\n  expect(enabled()).toBe(true);\n});",
      },
    },
  },
  {
    id: 'vitest-031',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You are porting a Jest factory that calls jest.requireActual so most of the module stays real. The Vitest test file is ESM. What is the equivalent?',
    options: [
      'Spread vi.importActual synchronously, the same way requireActual is synchronous',
      'Call jest.requireActual, because Vitest maps that name onto the Vite module graph',
      'Use an async vi.mock factory and await vi.importActual, because the real ESM module arrives as a promise',
      'Drop the factory and prefix the kept exports with mock so Vitest hoists them like Jest',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Make the vi.mock factory async and await vi.importActual. Vitest loads the real module as a promise because tests are ESM.',
      why: 'jest.requireActual is synchronous because it reads the CommonJS module table. Vitest runs on Vite, so the test graph is ESM, and vi.importActual returns a promise of the real module even when you call it from inside a mock factory. The factory is allowed to be async. Await the promise, spread the actual exports, and override only the ones the test replaces. Spreading the promise itself copies nothing useful. jest.requireActual is not a Vitest function, just as jest.fn is not. A mock prefix on a variable is the old Jest hoisting trick and does not keep the real exports. vi.hoisted is how you share a vi.fn with the factory when the override has to be referenced outside it.',
      wrong: [
        {
          option: 'Spread vi.importActual synchronously, the same way requireActual is synchronous',
          reason: 'importActual returns a promise. A synchronous spread does not copy the real exports.',
        },
        {
          option: 'Call jest.requireActual, because Vitest maps that name onto the Vite module graph',
          reason: 'Vitest does not provide jest.requireActual. The ESM helper is vi.importActual.',
        },
        {
          option: 'Drop the factory and prefix the kept exports with mock so Vitest hoists them like Jest',
          reason: 'Vitest does not hoist mock-prefixed names. That prefix does not import the real module.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\nimport { readConfig, envName } from './config';\n\nvi.mock('./config', async () => {\n  const actual = await vi.importActual<typeof import('./config')>('./config');\n  return {\n    ...actual,\n    readConfig: vi.fn(() => ({ port: 0 })),\n  };\n});\n\nit('keeps the real env helper', () => {\n  expect(envName()).toBeTypeOf('string');\n  expect(readConfig()).toEqual({ port: 0 });\n});",
      },
      remember: 'Port jest.requireActual to await vi.importActual inside an async vi.mock factory.',
    },
  },
  {
    id: 'vitest-032',
    tech: 'vitest',
    topic: 'vitest-vs-jest',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The module counter starts at 0. bump adds one, and reads returns it. Jest would re-require the module after jest.resetModules. This file calls vi.resetModules and then reads through the static import. What does reads() return?',
    code: {
      lang: 'ts',
      source: "import { vi, it } from 'vitest';\nimport { bump, reads } from './hits';\n\nit('tries to reload', () => {\n  bump();\n  vi.resetModules();\n  return reads();\n});",
    },
    options: [
      '0, because resetModules rebinds static imports the way Jest resets require',
      'undefined, because resetModules removes named exports from the static import',
      'It throws, because a static import is illegal after resetModules',
      '1, because the static ESM binding stays on the first evaluation',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'reads() returns 1. The static import is still the first module instance, and bump already incremented that counter.',
      why: 'bump runs on the module instance the static import captured, so its counter becomes 1. vi.resetModules clears the registry that a future import() will use. It does not rerun the static import and it does not point reads at a new copy, so the return value stays 1. In a Jest CommonJS test, jest.resetModules plus a fresh require can evaluate the module again and show 0. Vitest tests are ESM, and a static import stays bound to the first evaluation. To see 0, import dynamically, call bump on that copy, call vi.resetModules, and import dynamically again. The second import() is a new evaluation whose counter is 0. The first binding still reports 1 if you keep using it.',
      wrong: [
        {
          option: '0, because resetModules rebinds static imports the way Jest resets require',
          reason: 'That is the Jest require pattern. A Vitest static import is not rebound by resetModules.',
        },
        {
          option: 'undefined, because resetModules removes named exports from the static import',
          reason: 'The named functions are still the original ones. reads returns the number 1.',
        },
        {
          option: 'It throws, because a static import is illegal after resetModules',
          reason: 'Calling the static binding is legal. It simply still sees the first module instance.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { vi, expect, it } from 'vitest';\n\nit('reloads with a dynamic import', async () => {\n  const first = await import('./hits');\n  first.bump();\n  expect(first.reads()).toBe(1);\n  vi.resetModules();\n  const next = await import('./hits');\n  expect(next.reads()).toBe(0);\n  expect(first.reads()).toBe(1);\n});",
      },
      remember: 'vi.resetModules refreshes the next import(). A static ESM import stays on the first evaluation.',
    },
  },
] satisfies Question[];
