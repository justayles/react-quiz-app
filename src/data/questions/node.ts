import type { Question } from '../types';

export const nodeQuestions = [
  {
    id: 'node-001',
    tech: 'node',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the order of the phases in the Node event loop?',
    options: [
      'timers, then pending callbacks, then idle/prepare, then poll, then check, then close callbacks',
      'poll, then check, then timers, then pending callbacks, then idle/prepare, then close callbacks',
      'timers, then poll, then check, then close callbacks, then pending callbacks, then idle/prepare',
      'nextTick, then promise microtasks, then timers, then poll, then check, then close callbacks',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The phases run in this order: timers, pending callbacks, idle/prepare, poll, check, close callbacks.',
      why: 'The event loop is the cycle Node repeats to run timers and I/O after synchronous code finishes, and a phase is one stage of that cycle. Those stages always run as timers, pending callbacks, idle/prepare, poll, check, and then close callbacks. Timers runs setTimeout and setInterval callbacks, poll runs I/O callbacks such as a finished file read, and check runs setImmediate. Pending callbacks are a few deferred system callbacks, idle and prepare are internal bookkeeping, and close callbacks run when a handle such as a socket closes. process.nextTick and promise callbacks are not phases. A microtask is a small job such as a promise callback, and both that queue and the nextTick queue run before the loop continues.',
      wrong: [
        {
          option: 'poll, then check, then timers, then pending callbacks, then idle/prepare, then close callbacks',
          reason: 'Poll and check do sit next to each other, so starting the list there is a common mix-up. The cycle reaches timers before it reaches poll.',
        },
        {
          option: 'timers, then poll, then check, then close callbacks, then pending callbacks, then idle/prepare',
          reason: 'Timers, poll, and check are the phases people schedule directly, so it is easy to drop the stages between them. Pending callbacks and idle/prepare still sit between timers and poll.',
        },
        {
          option: 'nextTick, then promise microtasks, then timers, then poll, then check, then close callbacks',
          reason: 'nextTick and promise callbacks do run before the loop continues, which makes them look like opening phases. They are queues beside the loop, not phases in the cycle.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfs.readFile(__filename, () => {\n  console.log('poll');\n  setImmediate(() => {\n    console.log('check');\n  });\n  setTimeout(() => {\n    console.log('timers');\n  }, 0);\n});",
      },
      remember: 'Phase order is timers, pending callbacks, idle/prepare, poll, check, close callbacks.',
    },
  },
  {
    id: 'node-002',
    tech: 'node',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is printed, and in what order?',
    code: {
      lang: 'js',
      source: "console.log('start');\nPromise.resolve().then(() => {\n  console.log('promise');\n});\nprocess.nextTick(() => {\n  console.log('tick');\n});\nconsole.log('end');",
    },
    options: [
      'start, then tick, then promise, then end. nextTick jumps ahead of the rest of the synchronous function.',
      'start, then end, then tick, then promise. Synchronous code finishes, then the nextTick queue, then the promise microtask.',
      'start, then end, then promise, then tick. Promise microtasks always run ahead of process.nextTick.',
      'start, then end, then timeout, then tick. A resolved promise is queued as a timer.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The program prints start, end, tick, and then promise.',
      why: 'Synchronous code runs to the end of the current stack before any callback, so start and end print first. Promise.resolve().then queues a microtask, which is a small job that runs before the event loop moves to its next phase. process.nextTick queues a separate callback that Node drains before those promise microtasks. After end prints, the nextTick queue runs and prints tick, and only then does the promise callback print promise. No timer is scheduled here, so the event loop does not need to reach the timers phase for this output.',
      wrong: [
        {
          option: 'start, then tick, then promise, then end. nextTick jumps ahead of the rest of the synchronous function.',
          reason: 'nextTick does run ahead of promise callbacks, so putting tick before promise is half right. It still waits until the synchronous function returns, so end prints before tick.',
        },
        {
          option: 'start, then end, then promise, then tick. Promise microtasks always run ahead of process.nextTick.',
          reason: 'Promises and nextTick are both drained before the next phase, so treating them as one queue is understandable. Node empties the nextTick queue first.',
        },
        {
          option: 'start, then end, then timeout, then tick. A resolved promise is queued as a timer.',
          reason: 'A later callback can look like a timer because it is not synchronous. Promise callbacks are microtasks, not setTimeout callbacks, and this snippet never calls setTimeout.',
        },
      ],
      example: {
        lang: 'js',
        source: "console.log('start');\nPromise.resolve().then(() => {\n  console.log('promise');\n});\nprocess.nextTick(() => {\n  console.log('tick');\n});\nconsole.log('end');",
      },
      remember: 'After synchronous code, process.nextTick runs before promise microtasks.',
    },
  },
  {
    id: 'node-003',
    tech: 'node',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'The file callback has started. What does it print, and why is that order the usual one?',
    code: {
      lang: 'js',
      source: "const fs = require('node:fs');\n\nfs.readFile(__filename, () => {\n  setTimeout(() => {\n    console.log('timeout');\n  }, 0);\n  setImmediate(() => {\n    console.log('immediate');\n  });\n});",
    },
    options: [
      'timeout, then immediate. A delay of 0 is defined to run before every setImmediate callback.',
      'They run in one shared queue, so timeout prints first because it was scheduled first.',
      'immediate, then timeout. The file callback runs in poll, check is the next phase, and the timer waits for a later timers phase.',
      'Only timeout prints. setImmediate is skipped once any timer exists.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Inside this file callback the usual output is immediate, then timeout.',
      why: 'fs.readFile does the disk work off the JavaScript thread and then runs this callback in the poll phase, the stage where I/O callbacks run. setTimeout(fn, 0) asks to run in the timers phase, and setImmediate asks to run in the check phase. Poll is followed by check, so the immediate callback is next. The new timer cannot run until the loop comes back around to timers, which is after check. That is why, inside an I/O callback, setImmediate usually runs before setTimeout(fn, 0).',
      wrong: [
        {
          option: 'timeout, then immediate. A delay of 0 is defined to run before every setImmediate callback.',
          reason: 'A delay of 0 sounds like the soonest possible callback, so it feels like it should win. From the poll phase the check phase is sooner than the next timers phase.',
        },
        {
          option: 'They run in one shared queue, so timeout prints first because it was scheduled first.',
          reason: 'Scheduling order would matter if both callbacks shared one list. They are queued for different phases, and check comes before the next timers phase.',
        },
        {
          option: 'Only timeout prints. setImmediate is skipped once any timer exists.',
          reason: 'A timer and an immediate callback can both be pending. setImmediate is not cancelled by setTimeout.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfs.readFile(__filename, () => {\n  setTimeout(() => {\n    console.log('timeout');\n  }, 0);\n  setImmediate(() => {\n    console.log('immediate');\n  });\n});",
      },
      remember: 'Inside an I/O callback, setImmediate usually runs before setTimeout(fn, 0).',
    },
  },
  {
    id: 'node-004',
    tech: 'node',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'At the top level of a script, setTimeout(fn, 0) and setImmediate(fn) are both scheduled. What can you rely on?',
    options: [
      'setImmediate always runs first at the top level, because check is defined to beat timers.',
      'setTimeout(fn, 0) always runs first at the top level, because timers is the first phase.',
      'The same uncertainty applies inside an I/O callback, so neither order is useful there either.',
      'At the top level their order is not guaranteed. Inside an I/O callback, setImmediate usually runs first.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Top-level order is not guaranteed. Inside an I/O callback, setImmediate usually runs before setTimeout(fn, 0).',
      why: 'setTimeout(fn, 0) schedules the timers phase, and setImmediate schedules the check phase. At the top level, the timer might already be due when the loop first reaches timers, so the timeout can run first. The loop can also reach poll before that timer is due, move on to check, and run setImmediate first. Because both outcomes happen in real programs, top-level order is not something to depend on. Inside an I/O callback the callback is already in poll, so check is next and the new timer waits for the following turn.',
      wrong: [
        {
          option: 'setImmediate always runs first at the top level, because check is defined to beat timers.',
          reason: 'Check does follow poll, so a fixed win for setImmediate sounds like the inside-I/O rule. At the top level the timers phase can run before check.',
        },
        {
          option: 'setTimeout(fn, 0) always runs first at the top level, because timers is the first phase.',
          reason: 'Timers is the first phase, so a timeout looks guaranteed to win the first lap. If it is not due yet, the loop continues and check can run the immediate callback first.',
        },
        {
          option: 'The same uncertainty applies inside an I/O callback, so neither order is useful there either.',
          reason: 'The top-level race is real, so it is tempting to treat every scheduling site the same. An I/O callback is already in poll, which makes the check phase the usual next stop.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfs.readFile(__filename, () => {\n  setTimeout(() => {\n    console.log('timer');\n  }, 0);\n  setImmediate(() => {\n    console.log('immediate');\n  });\n});",
      },
      remember: 'Top-level setTimeout(fn, 0) and setImmediate have no guaranteed order.',
    },
  },
  {
    id: 'node-005',
    tech: 'node',
    topic: 'event-loop',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The timer was supposed to print while background steps kept being scheduled. It never prints. What is wrong?',
    code: {
      lang: 'js',
      source: "function keepGoing() {\n  process.nextTick(keepGoing);\n}\n\nkeepGoing();\nsetTimeout(() => {\n  console.log('timer');\n}, 20);",
    },
    options: [
      'keepGoing queues another process.nextTick forever. Node drains that queue before it can enter the timers phase, so the timer never runs.',
      'A delay of 20 milliseconds is stored as 0, so the timer runs before keepGoing is called and then gets lost.',
      'setTimeout waits until keepGoing returns, and the first call never returns, so the timer is never scheduled.',
      'process.nextTick runs inside the timers phase, so the timer and keepGoing share one queue and the timer should run first.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The recursive nextTick queue never empties, so the event loop never reaches the timer.',
      why: 'process.nextTick places a callback on a queue that Node empties completely before it continues the event loop. keepGoing schedules itself again every time it runs, so that queue never becomes empty. The timers phase is a stage of the loop, and the loop cannot enter it while nextTick callbacks are still queued. The setTimeout call does schedule a timer, and keepGoing does return the first time. The starvation comes from the callbacks it keeps adding. setImmediate yields between loop turns, which gives timers and I/O a chance to run.',
      wrong: [
        {
          option: 'A delay of 20 milliseconds is stored as 0, so the timer runs before keepGoing is called and then gets lost.',
          reason: 'A short delay can look like it should fire immediately. The timer is scheduled after keepGoing starts the nextTick chain, and the loop never gets to run it.',
        },
        {
          option: 'setTimeout waits until keepGoing returns, and the first call never returns, so the timer is never scheduled.',
          reason: 'An infinite loop would block the next line, so this reading is reasonable. The first keepGoing returns as soon as it has queued one nextTick, and the timer is scheduled.',
        },
        {
          option: 'process.nextTick runs inside the timers phase, so the timer and keepGoing share one queue and the timer should run first.',
          reason: 'nextTick is about scheduling something soon, so filing it under timers is a common picture. It has its own queue and is drained before the timers phase can start.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "function keepGoing(stepsLeft) {\n  if (stepsLeft === 0) {\n    return;\n  }\n  console.log('step');\n  setImmediate(() => {\n    keepGoing(stepsLeft - 1);\n  });\n}\n\nkeepGoing(2);\nsetTimeout(() => {\n  console.log('timer');\n}, 0);",
      },
      example: {
        lang: 'js',
        source: "function keepGoing(stepsLeft) {\n  if (stepsLeft === 0) {\n    return;\n  }\n  console.log('step');\n  setImmediate(() => {\n    keepGoing(stepsLeft - 1);\n  });\n}\n\nkeepGoing(2);\nsetTimeout(() => {\n  console.log('timer');\n}, 0);",
      },
      remember: 'A recursive process.nextTick starves timers and I/O because that queue must empty first.',
    },
  },
  {
    id: 'node-006',
    tech: 'node',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The timer fires. What is printed from inside it, in order?',
    code: {
      lang: 'js',
      source: "setTimeout(() => {\n  console.log('timeout');\n  Promise.resolve().then(() => {\n    console.log('promise');\n  });\n  process.nextTick(() => {\n    console.log('tick');\n  });\n}, 0);",
    },
    options: [
      'timeout, then promise, then tick. Promise callbacks always run before process.nextTick.',
      'timeout, then tick, then promise. After the timer callback returns, the nextTick queue runs before promise microtasks.',
      'tick, then promise, then timeout. nextTick and promises run before any timer callback starts.',
      'timeout only. Extra async work scheduled inside a timer is discarded.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'It prints timeout, then tick, then promise.',
      why: 'The outer callback runs in the timers phase and prints timeout before it schedules anything else. The promise callback is a microtask, meaning a small job that runs before the event loop continues, and the nextTick callback is placed on the nextTick queue. Those queues were empty when the timer callback started, so neither tick nor promise can print first. When the timer callback returns, Node drains every nextTick callback and prints tick. Promise microtasks run after that nextTick queue, so promise is last.',
      wrong: [
        {
          option: 'timeout, then promise, then tick. Promise callbacks always run before process.nextTick.',
          reason: 'Both callbacks are scheduled before the timer function returns, so the promise can look older. Node still drains the nextTick queue before promise microtasks.',
        },
        {
          option: 'tick, then promise, then timeout. nextTick and promises run before any timer callback starts.',
          reason: 'The rule that nextTick runs before promises is easy to apply to the whole program. Here both are scheduled only after timeout has already been printed.',
        },
        {
          option: 'timeout only. Extra async work scheduled inside a timer is discarded.',
          reason: 'A callback that schedules more callbacks can look nested enough to be ignored. Both the nextTick queue and the promise queue still run after this timer callback returns.',
        },
      ],
      example: {
        lang: 'js',
        source: "setTimeout(() => {\n  console.log('timeout');\n  Promise.resolve().then(() => {\n    console.log('promise');\n  });\n  process.nextTick(() => {\n    console.log('tick');\n  });\n}, 0);",
      },
      remember: 'When a callback returns, process.nextTick runs before promise microtasks.',
    },
  },
  {
    id: 'node-007',
    tech: 'node',
    topic: 'event-loop',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A request handler splits a large CPU job by scheduling the next chunk with process.nextTick. Under load, new connections stall even though each chunk is short. What is going wrong?',
    options: [
      'nextTick runs on the libuv threadpool, and the default pool of 4 threads is busy with the chunks.',
      'Each nextTick starts a new JavaScript thread, and the process hits an internal thread limit.',
      'The nextTick queue is drained completely before the loop can continue, so poll never gets a turn to accept I/O.',
      'nextTick callbacks run in the close phase, so they run only after every connection has already closed.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'A long chain of process.nextTick callbacks keeps the queue non-empty, so the event loop cannot reach poll and accept I/O.',
      why: 'process.nextTick does not run on a background thread. It adds a callback that the single JavaScript thread runs before the event loop continues. Node drains that whole queue, and a callback that schedules another nextTick keeps the queue filled. Poll is the phase that accepts new connections and runs I/O callbacks, and it cannot start while the queue is still full. Short chunks do not help if they never give the loop a turn. Schedule the next chunk with setImmediate so check can run and the other phases still get time.',
      wrong: [
        {
          option: 'nextTick runs on the libuv threadpool, and the default pool of 4 threads is busy with the chunks.',
          reason: 'A stall under load often is threadpool congestion, so this is a fair guess. nextTick callbacks run on the JavaScript thread, not on the libuv pool.',
        },
        {
          option: 'Each nextTick starts a new JavaScript thread, and the process hits an internal thread limit.',
          reason: 'Scheduling more callbacks can look like spawning workers. JavaScript still runs on one thread, and nextTick only queues more work for that thread.',
        },
        {
          option: 'nextTick callbacks run in the close phase, so they run only after every connection has already closed.',
          reason: 'The name sounds like it could belong to a later phase. nextTick is not a phase, and close callbacks are a different stage that runs when handles close.',
        },
      ],
      example: {
        lang: 'js',
        source: "function chunkedWork(stepsLeft) {\n  if (stepsLeft === 0) {\n    return;\n  }\n  console.log('chunk');\n  setImmediate(() => {\n    chunkedWork(stepsLeft - 1);\n  });\n}\n\nchunkedWork(3);",
      },
      remember: 'Recursive process.nextTick starves poll because that queue must empty before the loop continues.',
    },
  },
  {
    id: 'node-008',
    tech: 'node',
    topic: 'event-loop',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'runAfterRead should call done in the check phase, right after the file callback, instead of waiting for a later timers phase. What is wrong?',
    code: {
      lang: 'js',
      source: "const fs = require('node:fs');\n\nfunction runAfterRead(done) {\n  fs.readFile(__filename, () => {\n    setTimeout(done, 0);\n  });\n}",
    },
    options: [
      'readFile blocks the JavaScript thread, so done cannot be scheduled until the read returns on this same stack.',
      'The file callback already runs in the check phase, so the only correct call is done() before readFile returns.',
      'setTimeout(done, 0) runs during poll, before the file callback finishes.',
      'setTimeout(done, 0) waits for a later timers phase. setImmediate(done) runs in the check phase, which follows poll.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The file callback is in poll, and setTimeout waits for timers. setImmediate runs in check, the next phase.',
      why: 'The readFile callback runs in the poll phase after the disk read finishes. A phase is one stage of the event loop, and poll is followed by check, then later by the timers phase of the next turn. setTimeout(done, 0) schedules that later timers phase. setImmediate(done) schedules the check phase, so done runs before timers that were queued in this same callback. readFile does not block the JavaScript thread while the disk work is in progress. Calling done synchronously would still be inside poll, which is earlier than check.',
      wrong: [
        {
          option: 'readFile blocks the JavaScript thread, so done cannot be scheduled until the read returns on this same stack.',
          reason: 'The callback style can look like the read has to finish before any later line. The disk work is off the JavaScript thread, and the callback runs later in poll.',
        },
        {
          option: 'The file callback already runs in the check phase, so the only correct call is done() before readFile returns.',
          reason: 'Check is the phase people associate with running something immediately after I/O. The file callback itself is poll, and check is the following phase.',
        },
        {
          option: 'setTimeout(done, 0) runs during poll, before the file callback finishes.',
          reason: 'A delay of 0 sounds like it could run before the surrounding function returns. The timer callback is queued for a later timers phase, after this callback returns.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfunction runAfterRead(done) {\n  fs.readFile(__filename, () => {\n    setImmediate(done);\n  });\n}\n\nrunAfterRead(() => {\n  console.log('check phase');\n});",
      },
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfunction runAfterRead(done) {\n  fs.readFile(__filename, () => {\n    setImmediate(done);\n  });\n}\n\nrunAfterRead(() => {\n  console.log('check phase');\n});",
      },
      remember: 'After an I/O callback in poll, setImmediate runs in check, ahead of a timer queued there.',
    },
  },
  {
    id: 'node-009',
    tech: 'node',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A package.json sets "type" to "module". Which file extensions are ESM, and which stay CommonJS?',
    options: [
      '.js files are ESM, .cjs files are always CommonJS, and .mjs files are always ESM.',
      '.js and .cjs files are both ESM, and only .mjs can still call require.',
      '.js files stay CommonJS until they contain an import, and .mjs follows the type field.',
      'The type field applies only to .mjs files. Every .js file stays CommonJS.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'With "type": "module", .js files are ESM. .cjs is always CommonJS, and .mjs is always ESM.',
      why: 'CommonJS is the module system that uses require and module.exports. ESM is the module system that uses import and export. The nearest package.json type field decides what a .js file means: module makes it ESM, and commonjs or no type field makes it CommonJS. The .cjs extension is always CommonJS, even when type is module, so require and __dirname still exist there. The .mjs extension is always ESM, even in a CommonJS package, and it has no require or __dirname. A file does not switch systems just because its source text contains import or require.',
      wrong: [
        {
          option: '.js and .cjs files are both ESM, and only .mjs can still call require.',
          reason: 'type module sounds like it could convert every JavaScript file. The .cjs extension stays CommonJS, and .mjs is the extension that is always ESM.',
        },
        {
          option: '.js files stay CommonJS until they contain an import, and .mjs follows the type field.',
          reason: 'Looking at the syntax is a reasonable way to guess the module system. Node chooses from the extension and the type field before it runs the file.',
        },
        {
          option: 'The type field applies only to .mjs files. Every .js file stays CommonJS.',
          reason: '.mjs is the explicit ESM extension, so it is easy to think the type field is about that extension only. type module is exactly what changes plain .js files to ESM.',
        },
      ],
      example: {
        lang: 'js',
        source: "import { createRequire } from 'node:module';\n\nconst require = createRequire(import.meta.url);\nconst config = require('./config.cjs');\n\nconsole.log(config.port);\nconsole.log(typeof require);\nconsole.log(typeof config);",
      },
      remember: 'type module makes .js ESM. .cjs is always CommonJS. .mjs is always ESM.',
    },
  },
  {
    id: 'node-010',
    tech: 'node',
    topic: 'modules',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This ESM file should read data.json from the same directory. It throws before reading the file. What is wrong?',
    versionNote: 'import.meta.dirname was added in Node 20.11. Older Node can use fileURLToPath(import.meta.url) from node:url.',
    code: {
      lang: 'js',
      source: "import { readFile } from 'node:fs/promises';\nimport { join } from 'node:path';\n\nconst file = join(__dirname, 'data.json');\nconst text = await readFile(file, 'utf8');\nconsole.log(text);",
    },
    options: [
      'readFile from node:fs/promises only accepts a file descriptor, so a path string is invalid in ESM.',
      '__dirname and __filename are not defined in ESM. On Node 20.11 or newer, import.meta.dirname is the directory of this file.',
      'join always returns undefined in ESM, so the path has to be built with string addition.',
      'Top-level await is invalid in ESM, so the read never starts.',
    ],
    correctIndex: 1,
    explanation: {
      answer: '__dirname is a CommonJS binding. ESM does not define __dirname or __filename.',
      why: 'CommonJS provides __dirname and __filename as the directory and path of the current file. ESM, the system that uses import and export, does not create those names, so this file throws ReferenceError before readFile runs. import.meta.url is the file URL of the current module, and import.meta.dirname is its directory string on Node 20.11 or newer. join from node:path still works in ESM and can combine that directory with data.json. On older Node, fileURLToPath(import.meta.url) from node:url turns the URL into a filesystem path you can pass to path.dirname.',
      wrong: [
        {
          option: 'readFile from node:fs/promises only accepts a file descriptor, so a path string is invalid in ESM.',
          reason: 'The promise form is different from the callback form, so a stricter signature sounds plausible. fs.promises.readFile accepts a path string, and the crash here happens while building that path.',
        },
        {
          option: 'join always returns undefined in ESM, so the path has to be built with string addition.',
          reason: 'A missing path value could look like a path helper that stopped working. join works in ESM. The missing piece is __dirname.',
        },
        {
          option: 'Top-level await is invalid in ESM, so the read never starts.',
          reason: 'Top-level await used to be a syntax error, so this is a reasonable suspect. ESM supports top-level await. The name __dirname is what this file does not have.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "import { readFile } from 'node:fs/promises';\nimport { join } from 'node:path';\n\nconst file = join(import.meta.dirname, 'data.json');\nconst text = await readFile(file, 'utf8');\n\nconsole.log(text.length);\nconsole.log(typeof file);",
      },
      example: {
        lang: 'js',
        source: "import { readFile } from 'node:fs/promises';\nimport { join } from 'node:path';\n\nconst file = join(import.meta.dirname, 'data.json');\nconst text = await readFile(file, 'utf8');\n\nconsole.log(text.length);\nconsole.log(typeof file);",
      },
      remember: 'ESM has no __dirname or __filename. import.meta.dirname exists on Node 20.11 or newer.',
    },
  },
  {
    id: 'node-011',
    tech: 'node',
    topic: 'modules',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'This file is named app.cjs. The nearest package.json says "type": "module". What is printed?',
    code: {
      lang: 'js',
      source: "console.log(typeof require);\nconsole.log(typeof __dirname);\nconsole.log(typeof module.exports);",
    },
    options: [
      'It throws ReferenceError: require is not defined, because type module forces every file to be ESM.',
      'undefined, then undefined, then undefined. type module removes the CommonJS globals.',
      'function, then string, then object. A .cjs file is always CommonJS.',
      'function, then undefined, then object. __dirname was removed from CommonJS.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'It prints function, then string, then object, because app.cjs is CommonJS.',
      why: 'The type field in package.json changes how .js files are loaded. It does not change .cjs. CommonJS is the module format that provides require, module.exports, __dirname, and __filename, and the .cjs extension always uses that format. typeof require is function, typeof __dirname is string, and typeof module.exports is object. An ESM file would not have those names, but this filename keeps the file in CommonJS even though type is module.',
      wrong: [
        {
          option: 'It throws ReferenceError: require is not defined, because type module forces every file to be ESM.',
          reason: 'type module does make .js files ESM, where require is missing, so a throw is a fair guess. The .cjs extension overrides the type field.',
        },
        {
          option: 'undefined, then undefined, then undefined. type module removes the CommonJS globals.',
          reason: 'If the file were ESM, reading these names would throw rather than print undefined. In this .cjs file the names exist and have the CommonJS types.',
        },
        {
          option: 'function, then undefined, then object. __dirname was removed from CommonJS.',
          reason: '__dirname is absent from ESM, so it is easy to think modern CommonJS lost it too. CommonJS still defines __dirname as a string.',
        },
      ],
      example: {
        lang: 'js',
        source: "const path = require('node:path');\n\nconst file = path.join(__dirname, 'data.json');\n\nconsole.log(typeof require);\nconsole.log(typeof __dirname);\nconsole.log(typeof module.exports);\nconsole.log(typeof file);",
      },
      remember: 'The .cjs extension is always CommonJS, even when package.json says type module.',
    },
  },
  {
    id: 'node-012',
    tech: 'node',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A published package has an exports field. What does that field change for people who import the package?',
    options: [
      'exports is documentation only. Any file under the package can still be imported by its path.',
      'exports lists files that are hidden from ESM, while require can still open every file.',
      'exports replaces package.json name, so importers must use a file path instead of the package name.',
      'exports decides which entry points importers can load. A deep path that is not exported fails even if the file exists.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The exports field is the allowlist of entry points. A path that is not exported cannot be loaded.',
      why: 'Without exports, Node still allows a deep import, which means loading a file inside a package by its path. Once exports is present, that map is the public surface for both import and require. Each key is an entry point, such as the package root or a subpath like ./public.js, and the value is the file Node should load. A deep import that does not match the map fails with ERR_PACKAGE_PATH_NOT_EXPORTED even when the file is on disk. The imports field is a different map, used by the package itself for private # names, and it is not what publishes those entry points.',
      wrong: [
        {
          option: 'exports is documentation only. Any file under the package can still be imported by its path.',
          reason: 'The field looks like a manifest of files, so treating it as comments is understandable. Node enforces it, and an unlisted deep import fails at load time.',
        },
        {
          option: 'exports lists files that are hidden from ESM, while require can still open every file.',
          reason: 'ESM is stricter about paths than old CommonJS, so a split rule sounds plausible. The exports boundary applies to require and import.',
        },
        {
          option: 'exports replaces package.json name, so importers must use a file path instead of the package name.',
          reason: 'The package name and the export map solve different problems, and it is easy to merge them. The name still identifies the package. exports decides which of its files outsiders can reach.',
        },
      ],
      example: {
        lang: 'js',
        source: "import widget from 'widget';\nimport { format } from 'widget/format.js';\n\nconst label = format(widget.name);\n\nconsole.log(label);\nconsole.log(typeof widget);\nconsole.log(typeof format);",
      },
      remember: 'exports is the allowlist. A deep import that is not exported fails.',
    },
  },
  {
    id: 'node-013',
    tech: 'node',
    topic: 'modules',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'The widget package exports only "." and "./public.js". A consumer imports widget/src/secret.js and the file does exist in node_modules. What happens?',
    options: [
      'The import fails with ERR_PACKAGE_PATH_NOT_EXPORTED because that subpath is not in exports.',
      'The import succeeds because a file on disk is always reachable, and exports is only a hint for bundlers.',
      'The import succeeds through require and fails through import, because exports applies to ESM only.',
      'The import fails only while typechecking. Node loads the file when the program runs.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Node refuses the import. secret.js is not an exported entry point.',
      why: 'The exports field is the list of entry points a package allows other code to load. A deep import is an import that reaches inside the package by path, and widget/src/secret.js is one of those. It does not match "." or "./public.js", so Node throws ERR_PACKAGE_PATH_NOT_EXPORTED instead of reading the file. The same boundary applies to require, not only to ESM import. Importing widget or widget/public.js matches the map and is allowed. The file being present in node_modules is not enough once exports exists.',
      wrong: [
        {
          option: 'The import succeeds because a file on disk is always reachable, and exports is only a hint for bundlers.',
          reason: 'Older Node did let you import any file inside a package, so this matches that memory. An exports map replaces that open layout and Node enforces it.',
        },
        {
          option: 'The import succeeds through require and fails through import, because exports applies to ESM only.',
          reason: 'ESM and CommonJS differ on __dirname and require, so a split here sounds consistent. The package export boundary is enforced for both loaders.',
        },
        {
          option: 'The import fails only while typechecking. Node loads the file when the program runs.',
          reason: 'Many package problems show up only in TypeScript, so a types-only failure is a reasonable guess. This error is raised by Node when it resolves the specifier.',
        },
      ],
      example: {
        lang: 'js',
        source: "import widget from 'widget';\nimport { theme } from 'widget/public.js';\n\nconst html = widget.render('Hello', theme);\n\nconsole.log(html);\nconsole.log(theme.name);\nconsole.log(typeof widget.render);",
      },
      remember: 'If exports is set, only listed subpaths can be imported. Other files stay private.',
    },
  },
  {
    id: 'node-014',
    tech: 'node',
    topic: 'modules',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This ESM file should load a CommonJS config and then read the path it names. It throws ReferenceError. What is wrong?',
    code: {
      lang: 'js',
      source: "import { readFile } from 'node:fs/promises';\n\nconst config = require('./config.cjs');\nconst text = await readFile(config.path, 'utf8');\nconsole.log(text);",
    },
    options: [
      'config.cjs cannot be loaded from ESM at all, so the config has to be rewritten as export syntax.',
      'ESM has no require. createRequire from node:module can load the CommonJS file.',
      'readFile rejects CommonJS paths. The call has to use fs.readFileSync instead.',
      'The throw happens because top-level await cannot follow a require call in the same file.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'require is not defined in ESM. createRequire(import.meta.url) creates a CommonJS loader for this file.',
      why: 'ESM is the module system that uses import and export, and it does not create the CommonJS require function. The ReferenceError is raised on the require line, before readFile runs. createRequire from node:module builds a require function tied to the current module URL, and that function can load a .cjs file. The loaded module.exports value is what require returns, so config.path is available after that call. Rewriting the config is optional. A .cjs file is allowed to stay CommonJS.',
      wrong: [
        {
          option: 'config.cjs cannot be loaded from ESM at all, so the config has to be rewritten as export syntax.',
          reason: 'ESM and CommonJS are different systems, so a hard wall is a fair guess. Node can load CommonJS from ESM with createRequire, and a default import can also see module.exports.',
        },
        {
          option: 'readFile rejects CommonJS paths. The call has to use fs.readFileSync instead.',
          reason: 'The failure is near a path that came from CommonJS, so the read API looks suspicious. The crash is ReferenceError on require, and fs.promises.readFile accepts a normal path string.',
        },
        {
          option: 'The throw happens because top-level await cannot follow a require call in the same file.',
          reason: 'Mixing await with require looks like a syntax conflict. ESM allows top-level await. The missing name is require.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "import { readFile } from 'node:fs/promises';\nimport { createRequire } from 'node:module';\n\nconst require = createRequire(import.meta.url);\nconst config = require('./config.cjs');\nconst text = await readFile(config.path, 'utf8');\n\nconsole.log(text.length);\nconsole.log(typeof config.path);",
      },
      example: {
        lang: 'js',
        source: "import { readFile } from 'node:fs/promises';\nimport { createRequire } from 'node:module';\n\nconst require = createRequire(import.meta.url);\nconst config = require('./config.cjs');\nconst text = await readFile(config.path, 'utf8');\n\nconsole.log(text.length);\nconsole.log(typeof config.path);",
      },
      remember: 'ESM has no require. createRequire from node:module can load CommonJS.',
    },
  },
  {
    id: 'node-015',
    tech: 'node',
    topic: 'modules',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'This file is ESM. What does it print?',
    code: {
      lang: 'js',
      source: "import { createRequire } from 'node:module';\n\nconst require = createRequire(import.meta.url);\nconst path = require('node:path');\n\nconsole.log(typeof path.join);",
    },
    options: [
      'It throws ReferenceError because require cannot be created inside an ESM file.',
      'It throws because createRequire can load only JSON, not a node: built-in.',
      'function. createRequire returns a working require, and path.join is a function.',
      'undefined. The node: prefix hides join when the module is loaded through require.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'It prints function.',
      why: 'createRequire from node:module returns a require function whose paths are resolved from the module URL you pass in. import.meta.url is that URL for the current ESM file. require("node:path") loads the same path built-in that CommonJS would load, and path.join is a function on it. ESM itself still has no global require. This local binding is a normal function created by createRequire, which is why typeof path.join is function.',
      wrong: [
        {
          option: 'It throws ReferenceError because require cannot be created inside an ESM file.',
          reason: 'A bare require call in ESM does throw ReferenceError, so this looks like the same bug. createRequire is the supported way to make a require function in ESM.',
        },
        {
          option: 'It throws because createRequire can load only JSON, not a node: built-in.',
          reason: 'createRequire is often used for config files, so a JSON-only limit sounds plausible. It can load CommonJS modules and node: built-ins such as node:path.',
        },
        {
          option: 'undefined. The node: prefix hides join when the module is loaded through require.',
          reason: 'The node: prefix is an extra spelling of the built-in name, so it could look like a different export shape. node:path still provides join as a function.',
        },
      ],
      example: {
        lang: 'js',
        source: "import { createRequire } from 'node:module';\n\nconst require = createRequire(import.meta.url);\nconst path = require('node:path');\n\nconsole.log(typeof path.join);\nconsole.log(typeof path.dirname);",
      },
      remember: 'createRequire(import.meta.url) gives ESM a require that can load CommonJS and built-ins.',
    },
  },
  {
    id: 'node-016',
    tech: 'node',
    topic: 'modules',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A package adds "type": "module". An old script.js that calls require now throws ReferenceError, but that file must stay CommonJS. What should change?',
    options: [
      'Rename it to script.mjs. The .mjs extension turns require back on.',
      'Add a leading comment that says commonjs. Node reads that comment before the type field.',
      'Leave the filename alone. type module applies only to files that already contain import.',
      'Rename it to script.cjs. The .cjs extension is always CommonJS, even when type is module.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Rename the file to script.cjs so it stays CommonJS while the rest of the .js files become ESM.',
      why: 'The type field selects the module system for .js files. CommonJS means require and module.exports, and ESM means import and export. After type is set to module, script.js is loaded as ESM, which has no require, so the old file throws ReferenceError. The .cjs extension is always CommonJS, regardless of that field, so the same source works under the new name. The .mjs extension is always ESM and still has no require. Node does not use a file comment to pick the format.',
      wrong: [
        {
          option: 'Rename it to script.mjs. The .mjs extension turns require back on.',
          reason: 'A special extension is the right kind of fix, so .mjs is a close guess. .mjs is always ESM, which is the format that does not provide require.',
        },
        {
          option: 'Add a leading comment that says commonjs. Node reads that comment before the type field.',
          reason: 'Some tools do use a pragma comment, so this feels familiar. Node chooses CommonJS or ESM from the extension and package.json, not from a comment.',
        },
        {
          option: 'Leave the filename alone. type module applies only to files that already contain import.',
          reason: 'A file full of require looks like CommonJS, so it is reasonable to think Node will notice. With type module, .js is ESM even when the source still calls require.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst path = require('node:path');\n\nconst file = path.join(__dirname, 'data.json');\nconst text = fs.readFileSync(file, 'utf8');\n\nconsole.log(text.length);\nconsole.log(typeof require);",
      },
      remember: 'Keep a CommonJS file in a type module package by naming it .cjs.',
    },
  },
  {
    id: 'node-017',
    tech: 'node',
    topic: 'streams',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do stream.pipe and stream.pipeline differ when one of the streams fails?',
    options: [
      'stream.pipe does not forward errors or destroy both sides. stream.pipeline, or stream.promises.pipeline, does.',
      'stream.pipe forwards the error and destroys both streams. pipeline only connects them and ignores errors.',
      'Neither helper forwards errors. The caller must listen only on the source, and the destination always closes itself.',
      'stream.promises.pipeline returns a promise but leaves both streams open after an error.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'pipe does not forward errors or destroy both sides. pipeline does both.',
      why: 'pipe connects a readable stream to a writable stream and copies chunks across. It does not attach the error handling for you, and it does not destroy the other side when one side fails. An error event with no listener is thrown, which can crash the process, and any stream that stays open can leak the file or socket it holds. pipeline, including the promise form stream.promises.pipeline, wires the streams, destroys each of them if one fails, and delivers that error to your callback or rejected promise. That cleanup is the reason pipeline is the safer way to connect streams.',
      wrong: [
        {
          option: 'stream.pipe forwards the error and destroys both streams. pipeline only connects them and ignores errors.',
          reason: 'pipe is the older helper people learned first, so it is easy to assume it includes cleanup. Error forwarding and destroy-on-error are what pipeline adds.',
        },
        {
          option: 'Neither helper forwards errors. The caller must listen only on the source, and the destination always closes itself.',
          reason: 'Both APIs can look like thin connectors. pipeline is specifically the one that forwards the error and destroys every stream in the chain.',
        },
        {
          option: 'stream.promises.pipeline returns a promise but leaves both streams open after an error.',
          reason: 'The promise form is easy to read as a thin wrapper that only changes the callback into a return value. It still destroys the streams and rejects with the error.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst zlib = require('node:zlib');\nconst { pipeline } = require('node:stream');\n\nfunction compress(src, dest, done) {\n  pipeline(\n    fs.createReadStream(src),\n    zlib.createGzip(),\n    fs.createWriteStream(dest),\n    done\n  );\n}",
      },
      remember: 'pipe does not forward errors or destroy both sides. pipeline does.',
    },
  },
  {
    id: 'node-018',
    tech: 'node',
    topic: 'streams',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'compress pipes a file through gzip into another file. The source path is missing, and there is no error listener. What goes wrong?',
    code: {
      lang: 'js',
      source: "const fs = require('node:fs');\nconst zlib = require('node:zlib');\n\nfunction compress(src, dest) {\n  const input = fs.createReadStream(src);\n  const gzip = zlib.createGzip();\n  const output = fs.createWriteStream(dest);\n  input.pipe(gzip).pipe(output);\n}",
    },
    options: [
      'createReadStream throws synchronously for a missing file, so pipe is never reached and nothing leaks.',
      'The missing file emits an error on the read stream. pipe does not forward that error or destroy the other streams, and an error with no listener can crash the process.',
      'zlib.createGzip throws synchronously when the source path is missing, before any stream is connected.',
      'pipe retries the missing file on the write stream, so the error is swallowed and the destination stays empty.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The missing file fails on the read stream later. pipe does not forward that error or destroy the gzip and write streams.',
      why: 'createReadStream does not throw just because the path is missing. It emits an error event when the read starts, and if nobody listens Node throws that error and can exit the process. pipe only connects the data flow, so it does not pass the error along and it does not destroy the gzip stream or the write stream. pipeline does both: it destroys every stream in the chain and gives the error to your callback or promise. createGzip is not where this missing path is detected.',
      wrong: [
        {
          option: 'createReadStream throws synchronously for a missing file, so pipe is never reached and nothing leaks.',
          reason: 'Opening a missing file feels like it should throw on the create call. The failure is asynchronous and arrives as an error event on the readable stream.',
        },
        {
          option: 'zlib.createGzip throws synchronously when the source path is missing, before any stream is connected.',
          reason: 'The gzip stream sits in the middle of the chain, so it looks like a place that could validate the path. createGzip does not see the filesystem path. The read stream does.',
        },
        {
          option: 'pipe retries the missing file on the write stream, so the error is swallowed and the destination stays empty.',
          reason: 'A quiet empty output can look like a retry that produced nothing. pipe does not retry, and an unhandled error event is noisy enough to crash rather than disappear.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst zlib = require('node:zlib');\nconst { pipeline } = require('node:stream');\n\nfunction compress(src, dest, done) {\n  pipeline(\n    fs.createReadStream(src),\n    zlib.createGzip(),\n    fs.createWriteStream(dest),\n    done\n  );\n}",
      },
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst zlib = require('node:zlib');\nconst { pipeline } = require('node:stream');\n\nfunction compress(src, dest, done) {\n  pipeline(\n    fs.createReadStream(src),\n    zlib.createGzip(),\n    fs.createWriteStream(dest),\n    done\n  );\n}",
      },
      remember: 'Use pipeline so a stream error is forwarded and every stream in the chain is destroyed.',
    },
  },
  {
    id: 'node-019',
    tech: 'node',
    topic: 'streams',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which description of readable stream modes is accurate?',
    options: [
      'Calling pause() starts flowing mode, and the data event is how paused mode is consumed.',
      'for await leaves the stream paused, and the readable event switches the stream into flowing mode.',
      'A data listener starts flowing mode. pause() and the readable event are paused mode. for await consumes the readable.',
      'Object mode is a third delivery mode that runs between poll and check on the event loop.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'A data listener starts flowing mode, while pause() and the readable event are paused mode. for await reads the stream until it ends.',
      why: 'A readable stream starts paused, which means it holds chunks until you pull them. Flowing mode means the stream pushes chunks out as data events. Adding a data listener switches the stream into flowing mode, and pause() switches it back so data stops being pushed. In paused mode you listen for readable and call read() to pull each chunk. for await walks a readable stream and consumes it until the stream ends, so you should not also attach a data listener to the same stream.',
      wrong: [
        {
          option: 'Calling pause() starts flowing mode, and the data event is how paused mode is consumed.',
          reason: 'pause and data are the two names people remember, and swapping them is a common mix-up. data starts flowing mode. pause returns the stream to paused mode.',
        },
        {
          option: 'for await leaves the stream paused, and the readable event switches the stream into flowing mode.',
          reason: 'for await looks like a loop you control, so leaving the stream paused sounds right. Async iteration consumes the stream, and the readable event is the paused-mode signal.',
        },
        {
          option: 'Object mode is a third delivery mode that runs between poll and check on the event loop.',
          reason: 'Object mode is a real stream setting, so filing it next to flowing and paused is understandable. It changes what a chunk is, not which event-loop phase runs.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Readable } = require('node:stream');\n\nasync function main() {\n  const source = Readable.from(['A', 'B'], { objectMode: true });\n  const parts = [];\n  for await (const chunk of source) {\n    parts.push(chunk);\n  }\n  console.log(parts.join(''));\n}\n\nmain();",
      },
      remember: 'data flows, readable and pause() are paused mode, and for await consumes a readable.',
    },
  },
  {
    id: 'node-020',
    tech: 'node',
    topic: 'streams',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is printed?',
    code: {
      lang: 'js',
      source: "const { Readable } = require('node:stream');\n\nasync function main() {\n  const source = Readable.from([10, 20, 30], { objectMode: true });\n  let total = 0;\n  for await (const value of source) {\n    total += value;\n  }\n  console.log(total);\n}\n\nmain();",
    },
    options: [
      'It throws because a readable stream cannot yield numbers.',
      '102030, because every chunk is concatenated as text.',
      '0, because for await leaves the stream paused and the loop body never runs.',
      '60. Object mode yields each number, and for await reads the stream until it ends.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'It prints 60.',
      why: 'Object mode means each chunk can be any JavaScript value, not only a Buffer or string. Readable.from is given the numbers 10, 20, and 30 with object mode turned on, so those numbers are the chunks. for await consumes a readable stream: it pulls each chunk and finishes when the stream ends. The loop adds the three numbers, and console.log prints 60. The stream does not stringify the values first, and the loop does run.',
      wrong: [
        {
          option: 'It throws because a readable stream cannot yield numbers.',
          reason: 'Streams are often taught with Buffers only, so a number chunk looks illegal. Object mode exists so a chunk can be a number, object, or other value.',
        },
        {
          option: '102030, because every chunk is concatenated as text.',
          reason: 'Byte streams do concatenate string or buffer chunks, so a joined result is a fair guess. Object mode keeps each number separate, and the loop adds them.',
        },
        {
          option: '0, because for await leaves the stream paused and the loop body never runs.',
          reason: 'A stream that starts paused can look like it will never enter the loop. for await is a consumer. It reads until the readable ends.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Readable } = require('node:stream');\n\nasync function main() {\n  const source = Readable.from([10, 20, 30], { objectMode: true });\n  let total = 0;\n  for await (const value of source) {\n    total += value;\n  }\n  console.log(total);\n}\n\nmain();",
      },
      remember: 'In object mode, for await yields each value as it is. Numbers stay numbers.',
    },
  },
  {
    id: 'node-021',
    tech: 'node',
    topic: 'streams',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'dump writes a huge list of lines and ignores the value returned by write. Memory grows until the process struggles. What is wrong?',
    code: {
      lang: 'js',
      source: "const fs = require('node:fs');\n\nfunction dump(lines, dest) {\n  const out = fs.createWriteStream(dest);\n  for (const line of lines) {\n    out.write(line);\n  }\n  out.end();\n}",
    },
    options: [
      'write returns false when the internal buffer has reached highWaterMark. The loop keeps writing anyway. Wait for drain before writing more.',
      'write returns false when the disk is full, and the loop should retry the same chunk with fs.writeFileSync.',
      'end() deletes the buffered lines, so the function must omit end() to keep the data.',
      'createWriteStream only accepts one write call. The rest have to go through pipe.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The loop ignores backpressure. When write returns false, it should wait for drain.',
      why: 'Backpressure means the producer is faster than the destination, so the stream asks it to slow down. highWaterMark is the buffer limit, and write returns false once the buffered amount has reached it. The data is still queued, which is why a tight loop can grow memory without bound. The drain event means the buffer has emptied enough to accept more. Stop writing when write returns false, wait for drain, then continue, and call end() after the last line.',
      wrong: [
        {
          option: 'write returns false when the disk is full, and the loop should retry the same chunk with fs.writeFileSync.',
          reason: 'A false return sounds like a failed disk write. It usually means the in-memory buffer is full. A real disk error arrives later as an error event.',
        },
        {
          option: 'end() deletes the buffered lines, so the function must omit end() to keep the data.',
          reason: 'Calling end in the same turn as write can look like it cancels the buffer. end marks the finish and still flushes the chunks that were already written.',
        },
        {
          option: 'createWriteStream only accepts one write call. The rest have to go through pipe.',
          reason: 'pipe is the usual way to connect two streams, so a manual loop looks illegal. Multiple write calls are valid. The bug is ignoring the false return value.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfunction dump(lines, dest) {\n  const out = fs.createWriteStream(dest);\n  let index = 0;\n  function writeMore() {\n    let canContinue = true;\n    while (index < lines.length && canContinue) {\n      canContinue = out.write(lines[index]);\n      index += 1;\n    }\n    if (index < lines.length) out.once('drain', writeMore);\n    else out.end();\n  }\n  writeMore();\n}",
      },
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nfunction dump(lines, dest) {\n  const out = fs.createWriteStream(dest);\n  let index = 0;\n  function writeMore() {\n    let canContinue = true;\n    while (index < lines.length && canContinue) {\n      canContinue = out.write(lines[index]);\n      index += 1;\n    }\n    if (index < lines.length) out.once('drain', writeMore);\n    else out.end();\n  }\n  writeMore();\n}",
      },
      remember: 'When write() returns false, wait for drain before writing more.',
    },
  },
  {
    id: 'node-022',
    tech: 'node',
    topic: 'streams',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is printed when the stream ends?',
    code: {
      lang: 'js',
      source: "const { Readable } = require('node:stream');\n\nconst parts = [];\nconst source = Readable.from(['A', 'B'], { objectMode: true });\n\nsource.on('data', (chunk) => {\n  parts.push(chunk);\n});\n\nsource.on('end', () => {\n  console.log(parts.join(''));\n});",
    },
    options: [
      'Nothing. A data listener leaves the stream paused, so end never runs.',
      'AB. The data listener switches the stream to flowing mode and delivers each chunk.',
      'A,B. join inserts a comma when it is called with an empty string.',
      'It throws because object mode cannot emit data events.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'It prints AB.',
      why: 'A readable stream can be paused, holding chunks until you pull them, or flowing, pushing chunks out. Adding a listener for the data event switches this stream into flowing mode. Readable.from then delivers the object-mode chunks A and B, and the handler pushes each one into parts. The end event runs after the last chunk, and join with an empty string concatenates them into AB. Object mode still uses data and end. It only changes the chunk type, which here is a string.',
      wrong: [
        {
          option: 'Nothing. A data listener leaves the stream paused, so end never runs.',
          reason: 'Readable streams start paused, so it is reasonable to think they stay that way. A data listener is what switches them into flowing mode.',
        },
        {
          option: 'A,B. join inserts a comma when it is called with an empty string.',
          reason: 'Array join defaults to a comma, so A,B is the result of calling join with no argument. An empty string separator concatenates the chunks directly.',
        },
        {
          option: 'It throws because object mode cannot emit data events.',
          reason: 'Object mode sounds like a different consumption API. It still emits data in flowing mode. The chunks are the original values instead of Buffers.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Readable } = require('node:stream');\n\nconst parts = [];\nconst source = Readable.from(['A', 'B'], { objectMode: true });\n\nsource.on('data', (chunk) => {\n  parts.push(chunk);\n});\n\nsource.on('end', () => {\n  console.log(parts.join(''));\n});",
      },
      remember: 'A data listener starts flowing mode and receives each chunk until end.',
    },
  },
  {
    id: 'node-023',
    tech: 'node',
    topic: 'streams',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A file copy uses source.pipe(destination). The happy path works. When the disk fills up, the destination errors, the source file stays open, and the process can crash. What should replace pipe?',
    options: [
      'source.pause() around the pipe call. Pausing forwards errors and closes both file descriptors.',
      'destination.on("finish") only. The finish event runs for both success and disk errors.',
      'stream.pipeline, or stream.promises.pipeline. It forwards the error and destroys both streams.',
      'fs.readFileSync and fs.writeFileSync. Synchronous calls close both files if either side throws.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Replace pipe with pipeline so the disk error is forwarded and both streams are destroyed.',
      why: 'pipe copies data from the readable source to the writable destination, and that is enough when nothing fails. It does not forward an error from the destination back to the source, and it does not destroy the other side. Destroying a file stream closes the descriptor it holds, and an error event with no listener can also crash the process. pipeline, or the promise helper stream.promises.pipeline, connects the streams, destroys each of them when one fails, and reports the error to your callback or rejected promise. pause only stops the data flow and does not install that cleanup.',
      wrong: [
        {
          option: 'source.pause() around the pipe call. Pausing forwards errors and closes both file descriptors.',
          reason: 'Pausing is how you stop a readable stream from pushing data, so it sounds like a safety switch. It does not subscribe to errors or destroy the destination.',
        },
        {
          option: 'destination.on("finish") only. The finish event runs for both success and disk errors.',
          reason: 'finish sounds like the event for every outcome. It runs after a successful end. Failures go to the error event, which pipe does not forward for you.',
        },
        {
          option: 'fs.readFileSync and fs.writeFileSync. Synchronous calls close both files if either side throws.',
          reason: 'Synchronous code can look easier to clean up because throw stops the function. These calls also block the JavaScript thread and buffer the whole file, and they are not the stream fix.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst { pipeline } = require('node:stream');\n\nfunction copyFile(src, dest, done) {\n  pipeline(\n    fs.createReadStream(src),\n    fs.createWriteStream(dest),\n    done\n  );\n}\n\ncopyFile('in.txt', 'out.txt', (error) => {\n  console.log(error ? error.code : 'ok');\n});",
      },
      remember: 'pipeline forwards stream errors and destroys every stream. pipe does neither.',
    },
  },
  {
    id: 'node-024',
    tech: 'node',
    topic: 'streams',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'collect listens for both data and readable so it will not miss chunks. Some chunks are duplicated or skipped. What is wrong?',
    code: {
      lang: 'js',
      source: "const { Readable } = require('node:stream');\n\nfunction collect(stream, done) {\n  const parts = [];\n  stream.on('data', (chunk) => {\n    parts.push(chunk);\n  });\n  stream.on('readable', () => {\n    let chunk = stream.read();\n    while (chunk !== null) {\n      parts.push(chunk);\n      chunk = stream.read();\n    }\n  });\n  stream.on('end', () => {\n    done(parts);\n  });\n}",
    },
    options: [
      'end never fires if readable is listening, so done is the only bug and the two consumers are fine.',
      'read() always returns a string, so object-mode chunks are the part that gets skipped.',
      'The while loop stops at the first chunk because read() returns null after one successful call.',
      'The data listener switches on flowing mode while readable also pulls with read(). Consume the stream only once.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The function consumes the same readable in flowing mode and paused mode at the same time.',
      why: 'Flowing mode pushes chunks through the data event, while paused mode keeps them until you pull with read(), usually from a readable listener. Adding the data listener switches the stream into flowing mode, so the readable listener is no longer the only consumer. The two handlers can see the same chunk or find an empty buffer and skip one. Pick one style: a data listener, a paused readable loop, or for await. for await is often the clearest because it consumes the readable until end and returns the chunks.',
      wrong: [
        {
          option: 'end never fires if readable is listening, so done is the only bug and the two consumers are fine.',
          reason: 'end is tied to consumption, so blaming that event is reasonable. end can still fire. The bug is that two consumers are pulling from one stream.',
        },
        {
          option: 'read() always returns a string, so object-mode chunks are the part that gets skipped.',
          reason: 'read is often shown with Buffer chunks, so a type mismatch sounds plausible. read returns whatever chunk the stream produced, including objects in object mode.',
        },
        {
          option: 'The while loop stops at the first chunk because read() returns null after one successful call.',
          reason: 'A null return means empty right now, so it can look like a one-chunk limit. The loop is the normal paused-mode pattern. Mixing it with data is the problem.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const { Readable } = require('node:stream');\n\nasync function collect(stream) {\n  const parts = [];\n  for await (const chunk of stream) {\n    parts.push(chunk);\n  }\n  return parts;\n}\n\nconst source = Readable.from(['A', 'B'], { objectMode: true });\ncollect(source).then((parts) => {\n  console.log(parts.join(''));\n});",
      },
      example: {
        lang: 'js',
        source: "const { Readable } = require('node:stream');\n\nasync function collect(stream) {\n  const parts = [];\n  for await (const chunk of stream) {\n    parts.push(chunk);\n  }\n  return parts;\n}\n\nconst source = Readable.from(['A', 'B'], { objectMode: true });\ncollect(source).then((parts) => {\n  console.log(parts.join(''));\n});",
      },
      remember: 'Consume a readable once: data events, paused read(), or for await. Do not mix them.',
    },
  },
  {
    id: 'node-025',
    tech: 'node',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What uses the libuv threadpool, and what does that pool actually run?',
    options: [
      'Filesystem calls such as readFile, dns.lookup, and crypto.pbkdf2 or scrypt use it. The default size is 4. JavaScript still runs on one thread.',
      'dns.lookup and pbkdf2 run on the JavaScript thread. The pool exists only for worker_threads.',
      'The pool is a set of extra JavaScript threads, so four filesystem callbacks can run your JS at the same time.',
      'UV_THREADPOOL_SIZE defaults to 4 and covers every network request, including dns.resolve. Filesystem calls bypass it.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The libuv threadpool defaults to 4 threads and is used by fs, dns.lookup, and crypto.pbkdf2 or scrypt. It is not the JavaScript thread.',
      why: 'The JavaScript thread is the one thread that runs your code. The libuv threadpool is a separate group of background threads for work that would otherwise block that thread. Its default size is 4, set by the environment variable UV_THREADPOOL_SIZE. Node uses it for filesystem calls such as readFile, for dns.lookup which calls the blocking operating-system resolver, and for crypto.pbkdf2 and crypto.scrypt. dns.resolve does not use the pool, because it uses the non-blocking c-ares resolver, and ordinary sockets also stay in the poll phase. When a pool job finishes, the result is queued back onto the single JavaScript thread.',
      wrong: [
        {
          option: 'dns.lookup and pbkdf2 run on the JavaScript thread. The pool exists only for worker_threads.',
          reason: 'worker_threads are extra threads, so they are easy to confuse with the pool. The pool is inside libuv. worker_threads are a separate API with their own isolates.',
        },
        {
          option: 'The pool is a set of extra JavaScript threads, so four filesystem callbacks can run your JS at the same time.',
          reason: 'Background threads sound like they could run callbacks in parallel. They do the blocking work only. Your callback still runs on the one JavaScript thread.',
        },
        {
          option: 'UV_THREADPOOL_SIZE defaults to 4 and covers every network request, including dns.resolve. Filesystem calls bypass it.',
          reason: 'The default size is 4, so that part is right. dns.resolve and normal socket I/O do not use the pool, while filesystem calls such as readFile do.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\nconst crypto = require('node:crypto');\n\nconsole.log('start');\nfs.readFile(__filename, () => {\n  console.log('file');\n});\ncrypto.pbkdf2('secret', 'salt', 1000, 16, 'sha256', () => {\n  console.log('hash');\n});\nconsole.log('end');",
      },
      remember: 'The libuv pool, default size 4, runs fs, dns.lookup, and pbkdf2 or scrypt. JS stays on one thread.',
    },
  },
  {
    id: 'node-026',
    tech: 'node',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A promise rejects and nothing handles it. What does current Node do by default?',
    versionNote: 'Node 15 changed the default from a warning to terminating the process.',
    options: [
      'It prints a warning and keeps running, which has been the default since the first Promise support.',
      'Since Node 15, an unhandled rejection terminates the process by default.',
      'It converts the rejection into a resolved promise so later awaits see undefined.',
      'It waits forever on the next poll phase until some other code attaches catch.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Since Node 15, an unhandled promise rejection terminates the process by default.',
      why: 'An unhandled rejection means a promise failed and no rejection handler was attached in time. Node notices that after the current turn, so a catch added on a later timer is already too late. Since Node 15 the default is to treat that rejection as fatal and exit with a non-zero status. Older Node printed a warning and left the process running, which hid bugs. Await the promise inside try, call catch, or return it to a caller that handles the failure. A handler attached in time keeps the process alive.',
      wrong: [
        {
          option: 'It prints a warning and keeps running, which has been the default since the first Promise support.',
          reason: 'That was the older behavior, so it is still a common expectation. Node 15 changed the default so the process terminates.',
        },
        {
          option: 'It converts the rejection into a resolved promise so later awaits see undefined.',
          reason: 'Swallowing the error would match code that forgets to check a returned status. A rejection stays a rejection, and if nobody handles it the process exits.',
        },
        {
          option: 'It waits forever on the next poll phase until some other code attaches catch.',
          reason: 'Poll is where I/O waits, so a promise could look like it waits there too. Node does not leave an unhandled rejection pending for a later catch.',
        },
      ],
      example: {
        lang: 'js',
        source: "async function main() {\n  try {\n    await Promise.reject(new Error('lost'));\n  } catch (error) {\n    console.error(error.message);\n  }\n  console.log('still running');\n}\n\nmain();",
      },
      remember: 'Since Node 15, an unhandled promise rejection terminates the process by default.',
    },
  },
  {
    id: 'node-027',
    tech: 'node',
    topic: 'runtime',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What is printed, in order?',
    code: {
      lang: 'js',
      source: "const fs = require('node:fs');\n\nconsole.log('before');\nfs.readFile(__filename, () => {\n  console.log('file');\n});\nconsole.log('after');",
    },
    options: [
      'file, then before, then after. The callback runs as soon as readFile is called.',
      'before, then file, then after. The JavaScript thread waits for the disk read.',
      'before, then after, then file. The read is queued, and the callback runs later on the JavaScript thread.',
      'before, then after. The callback is skipped because the file is the script itself.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'It prints before, then after, then file.',
      why: 'The before log runs immediately on the JavaScript thread, and fs.readFile does not make that thread wait for the disk. The libuv threadpool, a small set of background threads, does the read, and Node queues the callback for later. Synchronous code continues, so after prints next. When the pool finishes, the callback runs on the single JavaScript thread and prints file. Reading the current script is a normal file read and is not skipped.',
      wrong: [
        {
          option: 'file, then before, then after. The callback runs as soon as readFile is called.',
          reason: 'Passing a callback can look like it runs before the next line. readFile only schedules the read. The callback waits until the file data is ready.',
        },
        {
          option: 'before, then file, then after. The JavaScript thread waits for the disk read.',
          reason: 'That is what fs.readFileSync would do, so the order is a common mix-up. The callback form returns before the read finishes.',
        },
        {
          option: 'before, then after. The callback is skipped because the file is the script itself.',
          reason: 'Reading __filename looks special because it is the running program. It is still an ordinary file, and the callback runs after the read completes.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nconsole.log('before');\nfs.readFile(__filename, () => {\n  console.log('file');\n});\nconsole.log('after');",
      },
      remember: 'fs callbacks do not block the JavaScript thread. The threadpool does the disk work.',
    },
  },
  {
    id: 'node-028',
    tech: 'node',
    topic: 'runtime',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The author expects this program to log still running and stay up. On Node 15 or newer the process exits with a failure status. What is wrong?',
    versionNote: 'Node 15 made an unhandled rejection terminate the process by default.',
    code: {
      lang: 'js',
      source: "async function main() {\n  Promise.reject(new Error('lost'));\n  console.log('still running');\n}\n\nmain();",
    },
    options: [
      'async functions cannot call Promise.reject. The call throws synchronously and skips the log.',
      'console.log keeps the rejection handled, so the exit must be caused by the missing return value.',
      'The process stays up because a rejected promise is only a warning. The failure status comes from somewhere else.',
      'The rejection is never awaited or caught. Since Node 15 that unhandled rejection terminates the process.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Promise.reject is left unhandled, so Node 15 and newer exit after the log line.',
      why: 'Promise.reject creates a rejected promise. Nothing awaits it, returns it, or attaches catch, so it is an unhandled rejection. The log still runs, because that line is synchronous and happens before Node checks the promise. Since Node 15 the default is to terminate the process when a rejection is still unhandled at the end of the turn. Making main an async function does not catch promises that were not awaited. Await it inside try, or attach catch, and the process can keep running.',
      wrong: [
        {
          option: 'async functions cannot call Promise.reject. The call throws synchronously and skips the log.',
          reason: 'A rejection inside async code often becomes a throw at an await, so a synchronous throw sounds close. Promise.reject only returns a rejected promise. The next line still runs.',
        },
        {
          option: 'console.log keeps the rejection handled, so the exit must be caused by the missing return value.',
          reason: 'Code that continues after creating a promise can look like it acknowledged the promise. Handling means catch, await, or returning it to a caller that handles it. A log does none of those.',
        },
        {
          option: 'The process stays up because a rejected promise is only a warning. The failure status comes from somewhere else.',
          reason: 'That matches Node before version 15, which warned and continued. Current Node treats the unhandled rejection as fatal by default.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "async function main() {\n  try {\n    await Promise.reject(new Error('lost'));\n  } catch (error) {\n    console.error(error.message);\n  }\n  console.log('still running');\n}\n\nmain();",
      },
      example: {
        lang: 'js',
        source: "async function main() {\n  try {\n    await Promise.reject(new Error('lost'));\n  } catch (error) {\n    console.error(error.message);\n  }\n  console.log('still running');\n}\n\nmain();",
      },
      remember: 'Await a rejection or attach catch. Since Node 15, an unhandled rejection exits the process.',
    },
  },
  {
    id: 'node-029',
    tech: 'node',
    topic: 'runtime',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'An API does many crypto.pbkdf2 hashes and many fs.readFile calls at the same time. Both get slow together, even though the JavaScript thread looks idle. UV_THREADPOOL_SIZE is unset. Why?',
    options: [
      'They share the libuv threadpool, whose default size is 4, so hashes and file reads wait for the same background threads.',
      'Each pbkdf2 call starts a JavaScript thread, and Node allows only four of those threads.',
      'fs.readFile bypasses the pool, so only the hashes can be slow. The file delay must be a disk fault.',
      'The poll phase runs at most four callbacks per turn, so the rest are dropped until restart.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Async pbkdf2 and filesystem reads share the libuv threadpool, which defaults to 4 threads.',
      why: 'The libuv threadpool is a small set of background threads, not extra JavaScript threads, and UV_THREADPOOL_SIZE defaults to 4 when it is unset. crypto.pbkdf2 and crypto.scrypt use that pool, and so do filesystem calls such as fs.readFile. When more jobs are running than there are pool threads, later jobs wait, so hashes and file reads slow down together. The JavaScript thread can look idle because it only runs the callbacks after a pool thread finishes. dns.lookup uses this same pool, so raising the pool size or lowering concurrency reduces the queue.',
      wrong: [
        {
          option: 'Each pbkdf2 call starts a JavaScript thread, and Node allows only four of those threads.',
          reason: 'A default of 4 sounds like a cap on JavaScript threads. JavaScript stays on one thread. The 4 is the size of the libuv pool.',
        },
        {
          option: 'fs.readFile bypasses the pool, so only the hashes can be slow. The file delay must be a disk fault.',
          reason: 'File reads are I/O, so they can look unrelated to CPU hashing. Most filesystem calls, including readFile, use the same pool as pbkdf2.',
        },
        {
          option: 'The poll phase runs at most four callbacks per turn, so the rest are dropped until restart.',
          reason: 'Poll is involved in I/O, so a small per-turn limit is a reasonable picture. Poll does not drop callbacks, and this slowdown is the shared pool queue.',
        },
      ],
      example: {
        lang: 'js',
        source: "const crypto = require('node:crypto');\n\nconsole.log('start');\ncrypto.pbkdf2('secret', 'salt', 100000, 32, 'sha256', () => {\n  console.log('async hash');\n});\nconsole.log('continued');\nconsole.log('js thread was free');",
      },
      remember: 'fs and async pbkdf2 or scrypt share the libuv threadpool. The default size is 4.',
    },
  },
  {
    id: 'node-030',
    tech: 'node',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When does AsyncLocalStorage keep a store visible, and when does it not?',
    options: [
      'The store sticks to every function object created inside run, even if that function later runs from an outside timer.',
      'It follows async continuations started inside storage.run. It does not follow work queued outside that run.',
      'It is process-wide. getStore returns the latest store from any request until the process exits.',
      'It works only across worker_threads, because that is the async boundary it was built for.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The store follows async work started inside storage.run. Work queued outside that run does not see it.',
      why: 'AsyncLocalStorage keeps a value, called the store, across asynchronous continuations. storage.run(store, fn) makes that store active while fn runs and while async work scheduled from inside fn later runs. A continuation means a callback that belongs to something started there, such as a promise, nextTick, or timer created inside the run. getStore reads the store for the async operation that is running now, not a value saved on a function. A timer or queue created outside the run does not inherit it. Call storage.run again when that outside work actually starts.',
      wrong: [
        {
          option: 'The store sticks to every function object created inside run, even if that function later runs from an outside timer.',
          reason: 'Closures remember variables, so it is natural to think the store works the same way. AsyncLocalStorage looks at the current async operation, not at where the function was created.',
        },
        {
          option: 'It is process-wide. getStore returns the latest store from any request until the process exits.',
          reason: 'A single JavaScript thread makes a global current request sound sufficient. Each run has its own store, and overlapping async work keeps its own continuation.',
        },
        {
          option: 'It works only across worker_threads, because that is the async boundary it was built for.',
          reason: 'The name sounds like cross-thread storage. It tracks async work on one JavaScript thread. Workers do not automatically share the store.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\n\nstorage.run({ id: 4 }, () => {\n  process.nextTick(() => {\n    console.log(storage.getStore().id);\n  });\n});",
      },
      remember: 'AsyncLocalStorage follows async work started inside storage.run, not work queued outside it.',
    },
  },
  {
    id: 'node-031',
    tech: 'node',
    topic: 'runtime',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does the timer print?',
    code: {
      lang: 'js',
      source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\n\nstorage.run({ id: 1 }, () => {\n  setTimeout(() => {\n    console.log(storage.getStore().id);\n  }, 10);\n});",
    },
    options: [
      'undefined. setTimeout always drops the AsyncLocalStorage store.',
      'It throws. getStore cannot be called from a timer.',
      '1. The timer was scheduled inside storage.run, so its callback keeps that store.',
      '0. Every timer gets a fresh store whose id is zero.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The timer prints 1.',
      why: 'storage.run makes { id: 1 } the current store while its callback runs, and that store is the value AsyncLocalStorage tracks across later async work. setTimeout is called inside that run, so the timer is an async continuation, meaning a callback that belongs to work scheduled from inside the run. When the timer fires, getStore returns the same store and id is 1. Timers do not wipe the store when they were scheduled inside run. Nothing in this snippet replaces the store with a zero id.',
      wrong: [
        {
          option: 'undefined. setTimeout always drops the AsyncLocalStorage store.',
          reason: 'Timers often do lose a store, so this is a common bug report. That happens when the timer is scheduled outside run. This timer is scheduled inside it.',
        },
        {
          option: 'It throws. getStore cannot be called from a timer.',
          reason: 'getStore returns undefined when no store is active, and reading id would then throw. This callback still has the store, so id is 1.',
        },
        {
          option: '0. Every timer gets a fresh store whose id is zero.',
          reason: 'A new timer can look like a new context that starts from a default. AsyncLocalStorage does not invent a zero store. It keeps the store from the run that scheduled the timer.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\n\nstorage.run({ id: 1 }, () => {\n  setTimeout(() => {\n    console.log(storage.getStore().id);\n  }, 10);\n});",
      },
      remember: 'A timer scheduled inside storage.run still sees that store when it fires.',
    },
  },
  {
    id: 'node-032',
    tech: 'node',
    topic: 'runtime',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The author expects the timer to print 7 because later was created inside storage.run. It throws instead. What is wrong?',
    code: {
      lang: 'js',
      source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\nlet later;\n\nstorage.run({ id: 7 }, () => {\n  later = function () {\n    return storage.getStore().id;\n  };\n});\n\nsetTimeout(later, 0);",
    },
    options: [
      'setTimeout cannot call a function that was assigned inside storage.run, so later is still undefined.',
      'The store is cleared because the object key is named id. A key named store would survive.',
      'getStore returns a copy made at run time, and that copy expires when the run callback returns.',
      'The timer was scheduled outside storage.run. Creating the function inside run does not attach the store to it.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The timer is queued outside the run, so getStore is undefined when later reads id.',
      why: 'AsyncLocalStorage looks at the async operation that is running now, not at the function that happens to call getStore. Creating later inside storage.run does not freeze the store onto that function the way a closure freezes a variable. setTimeout is called after the run has finished, so the timer is work queued outside the run and has no store. getStore() is then undefined, and reading id throws. Schedule the timer inside storage.run, or capture the store object and pass it to a new storage.run when the timer fires.',
      wrong: [
        {
          option: 'setTimeout cannot call a function that was assigned inside storage.run, so later is still undefined.',
          reason: 'If later were undefined, the timer would fail in a similar way. The assignment did run. The failure is getStore() being empty when the timer calls it.',
        },
        {
          option: 'The store is cleared because the object key is named id. A key named store would survive.',
          reason: 'The property name is the thing the crash reads, so it looks suspicious. Any property would fail the same way because the whole store is absent.',
        },
        {
          option: 'getStore returns a copy made at run time, and that copy expires when the run callback returns.',
          reason: 'The run callback has returned before the timer fires, so an expired copy sounds plausible. The store lives as long as a continuation of that run is active. This timer is not one of those continuations.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\n\nstorage.run({ id: 7 }, () => {\n  setTimeout(() => {\n    console.log(storage.getStore().id);\n  }, 0);\n});",
      },
      example: {
        lang: 'js',
        source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\n\nstorage.run({ id: 7 }, () => {\n  setTimeout(() => {\n    console.log(storage.getStore().id);\n  }, 0);\n});",
      },
      remember: 'AsyncLocalStorage follows the async work scheduled inside run, not the function you created there.',
    },
  },
  {
    id: 'node-033',
    tech: 'node',
    topic: 'runtime',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'Request code stores a request id with AsyncLocalStorage. It pushes work onto a queue drained by a setInterval that was started at boot. The worker sees an undefined store. Why?',
    options: [
      'The interval was queued outside storage.run, so it has no store. Capture the store and call storage.run again when the queued job runs.',
      'AsyncLocalStorage cannot cross a timer at all, even a timer created inside storage.run.',
      'The store is cleared because setInterval runs in the poll phase, and the store exists only in the timers phase.',
      'The queue array clones the store and then deletes it, so getStore is empty for every job.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The interval is outside the request run, so its callbacks do not see that store.',
      why: 'AsyncLocalStorage follows async continuations started inside storage.run. A continuation is a later callback that belongs to work scheduled from inside the run. The setInterval was started at boot, outside any request, so its callbacks are not continuations of the request store. Pushing a function onto an array does not move that async context onto the interval. getStore is therefore undefined while the worker runs. Save the store object during the request and wrap the job in storage.run(store, fn) when the interval actually runs it.',
      wrong: [
        {
          option: 'AsyncLocalStorage cannot cross a timer at all, even a timer created inside storage.run.',
          reason: 'This bug involves a timer, so blaming every timer is understandable. A timer scheduled inside storage.run does keep the store. This interval was not scheduled there.',
        },
        {
          option: 'The store is cleared because setInterval runs in the poll phase, and the store exists only in the timers phase.',
          reason: 'Timers and intervals are event-loop work, so a phase limit sounds technical enough to be true. The store is tied to the async operation, not to one loop phase.',
        },
        {
          option: 'The queue array clones the store and then deletes it, so getStore is empty for every job.',
          reason: 'Arrays do hold the jobs you push, so a destructive copy is a possible picture. An array push does not touch AsyncLocalStorage. The missing piece is a new storage.run around the later work.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { AsyncLocalStorage } = require('node:async_hooks');\n\nconst storage = new AsyncLocalStorage();\nconst queue = [];\n\nstorage.run({ id: 9 }, () => {\n  const store = storage.getStore();\n  queue.push(() => {\n    storage.run(store, () => {\n      console.log(storage.getStore().id);\n    });\n  });\n});\n\nqueue[0]();",
      },
      remember: 'Work queued outside storage.run does not see the store unless you enter it again with storage.run.',
    },
  },
  {
    id: 'node-034',
    tech: 'node',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A developer replaces fs.readFileSync with fs.promises.readFile and expects the next line to run only after the disk read finishes. What actually happens?',
    options: [
      'The promise blocks the JavaScript thread until the file is in memory, same as the sync call.',
      'The call returns a promise immediately. The threadpool does the disk work, and the result is delivered later.',
      'fs.promises runs the read on a second JavaScript thread, so two files of your code run at once.',
      'fs.promises.readFile is still synchronous underneath and only wraps the return value in a resolved promise.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'fs.promises.readFile does not make the JavaScript thread wait. The threadpool reads the disk, and the promise settles later.',
      why: 'fs.readFileSync blocks the JavaScript thread, the one thread that runs your code, until the read finishes. fs.promises.readFile returns a promise and lets the next line run. The libuv threadpool, a small group of background threads, does the disk work. When that work finishes, Node queues the result back onto the JavaScript thread and resolves the promise. The callback form of fs.readFile behaves the same way: the threadpool reads, and your callback runs later. Neither promise nor callback form creates a second JavaScript thread.',
      wrong: [
        {
          option: 'The promise blocks the JavaScript thread until the file is in memory, same as the sync call.',
          reason: 'Awaiting a promise later can look like the call itself waited. The call returns immediately. Only await, inside an async function, pauses that function.',
        },
        {
          option: 'fs.promises runs the read on a second JavaScript thread, so two files of your code run at once.',
          reason: 'A background read sounds like parallel JavaScript. The pool threads do not run your JS. Callbacks and promise reactions still run on the one JavaScript thread.',
        },
        {
          option: 'fs.promises.readFile is still synchronous underneath and only wraps the return value in a resolved promise.',
          reason: 'Some promise APIs wrap a value that is already known. This one schedules real disk work and resolves later, which is why code after the call can run first.',
        },
      ],
      example: {
        lang: 'js',
        source: "const fs = require('node:fs');\n\nconsole.log('start');\nfs.promises.readFile(__filename, 'utf8').then((text) => {\n  console.log(text.length);\n});\nconsole.log('end');\nconsole.log('still on the js thread');",
      },
      remember: 'fs.promises and fs callbacks do not block the JavaScript thread. The threadpool does the disk work.',
    },
  },
  {
    id: 'node-035',
    tech: 'node',
    topic: 'workers',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How do worker_threads, cluster, and workerData handle memory?',
    options: [
      'worker_threads and cluster both share one JavaScript heap, so a plain object in workerData is updated in place.',
      'cluster workers share memory through SharedArrayBuffer. worker_threads cannot share memory and always copy it.',
      'worker_threads run in the same process and can share bytes with SharedArrayBuffer. cluster uses separate processes that do not share memory. Ordinary workerData is cloned.',
      'workerData is shared by reference for every object. SharedArrayBuffer is only a faster ArrayBuffer copy.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Workers share a process and can share a SharedArrayBuffer, while cluster processes do not share memory. Plain workerData is cloned.',
      why: 'worker_threads are extra threads in the same operating-system process, but each worker has its own JavaScript isolate, meaning its own heap and global object, so a normal object is not shared. A SharedArrayBuffer is a block of bytes both sides can see, and that is how workers share memory. The cluster module forks separate processes, and those processes do not share memory. workerData is copied with the structured clone algorithm, a snapshot copy used for messages, when the worker is created. A SharedArrayBuffer passed there is shared instead of copied, so later edits to a plain object still do not show up in the worker.',
      wrong: [
        {
          option: 'worker_threads and cluster both share one JavaScript heap, so a plain object in workerData is updated in place.',
          reason: 'They are both ways to use more CPUs, so shared memory sounds like the common feature. Cluster processes are separate, and workers do not share a plain JavaScript object.',
        },
        {
          option: 'cluster workers share memory through SharedArrayBuffer. worker_threads cannot share memory and always copy it.',
          reason: 'The names worker and thread get swapped easily. SharedArrayBuffer sharing belongs to worker_threads. Cluster processes do not share that memory.',
        },
        {
          option: 'workerData is shared by reference for every object. SharedArrayBuffer is only a faster ArrayBuffer copy.',
          reason: 'Passing an object into the worker looks like handing over the same reference. Ordinary values are cloned. SharedArrayBuffer is the exception that is actually shared.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Worker, isMainThread, workerData } = require('node:worker_threads');\n\nif (isMainThread) {\n  const shared = new SharedArrayBuffer(4);\n  const view = new Int32Array(shared);\n  view[0] = 5;\n  new Worker(__filename, { workerData: shared });\n} else {\n  const view = new Int32Array(workerData);\n  console.log(view[0]);\n}",
      },
      remember: 'Workers can share a SharedArrayBuffer in-process. Cluster processes cannot. Plain workerData is cloned.',
    },
  },
  {
    id: 'node-036',
    tech: 'node',
    topic: 'workers',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What does the worker print?',
    code: {
      lang: 'js',
      source: "const { Worker, isMainThread, workerData } = require('node:worker_threads');\n\nif (isMainThread) {\n  const payload = { n: 1 };\n  new Worker(__filename, { workerData: payload });\n  payload.n = 2;\n} else {\n  console.log(workerData.n);\n}",
    },
    options: [
      '2. The worker shares the payload object and sees the write that happens after construction.',
      'undefined. workerData is empty until the main thread calls postMessage.',
      'It throws DataCloneError because a plain object cannot be workerData.',
      '1. workerData is a clone taken when the Worker is constructed, while n is still 1.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The worker prints 1.',
      why: 'The main thread builds payload with n set to 1 and passes it as workerData. workerData is copied with the structured clone algorithm, which makes a snapshot rather than sharing the object, and that copy is taken in the Worker constructor. The worker is a separate JavaScript isolate in the same process, so it receives that snapshot as workerData. The later assignment payload.n = 2 changes only the main thread object, so the worker logs 1. A plain object is cloneable, so this does not throw, and postMessage is not required for workerData.',
      wrong: [
        {
          option: '2. The worker shares the payload object and sees the write that happens after construction.',
          reason: 'Passing an object often means sharing the reference, so the later write looks visible. workerData gets a clone, and the threads do not share that object.',
        },
        {
          option: 'undefined. workerData is empty until the main thread calls postMessage.',
          reason: 'postMessage is the usual way to talk to a running worker, so workerData can look unused. The value passed to the constructor is already available as workerData.',
        },
        {
          option: 'It throws DataCloneError because a plain object cannot be workerData.',
          reason: 'Some values cannot be cloned, so a throw is a reasonable worry. Plain objects clone fine. Functions and some other host objects are what fail.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Worker, isMainThread, workerData } = require('node:worker_threads');\n\nif (isMainThread) {\n  const payload = { n: 1 };\n  new Worker(__filename, { workerData: payload });\n  payload.n = 2;\n} else {\n  console.log(workerData.n);\n}",
      },
      remember: 'workerData is cloned when the worker is created. Later edits to the original object stay on the main thread.',
    },
  },
  {
    id: 'node-037',
    tech: 'node',
    topic: 'workers',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The main thread wants the worker to see live updates to box.count, including the write after the Worker is created. The worker only ever sees 0. What is wrong?',
    code: {
      lang: 'js',
      source: "const { Worker } = require('node:worker_threads');\n\nconst box = { count: 0 };\nconst worker = new Worker('./task.js', { workerData: box });\nbox.count = 1;",
    },
    options: [
      'workerData clones the plain object while count is 0. Later writes stay on the main thread. Share a SharedArrayBuffer for a live counter.',
      'The assignment runs too early. Moving box.count = 1 above the Worker constructor shares the same object.',
      'Worker ignores workerData unless it is an array. Wrap box in an array and the same object is shared.',
      'count is a number, and numbers are shared in place. The worker reads 0 because task.js resets it.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The plain object is cloned at construction time. A SharedArrayBuffer is what both threads can update in place.',
      why: 'workerData is passed through the structured clone algorithm, which copies values instead of sharing the JavaScript object. The clone is made while count is 0, so the worker sees 0 even after the main thread sets count to 1. Moving that assignment earlier would only change the cloned number, and it would still not share later updates. A SharedArrayBuffer is a byte buffer both the main thread and the worker can view, which is real shared memory inside the process. An Int32Array plus Atomics is the safe way to update a counter in that buffer, and wrapping the object in an array still clones it.',
      wrong: [
        {
          option: 'The assignment runs too early. Moving box.count = 1 above the Worker constructor shares the same object.',
          reason: 'The timing of the write does change what the clone contains, so this is a useful partial fix for a one-time value. It still copies the object. Later increments on the main thread stay invisible.',
        },
        {
          option: 'Worker ignores workerData unless it is an array. Wrap box in an array and the same object is shared.',
          reason: 'Arrays travel through postMessage often, so they can look like the shareable container. Arrays are cloned too. SharedArrayBuffer is the value that is shared.',
        },
        {
          option: 'count is a number, and numbers are shared in place. The worker reads 0 because task.js resets it.',
          reason: 'Numbers are simple values, so sharing them in place sounds possible. The number is copied into the clone. The worker is not shown resetting it.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const { Worker, isMainThread, workerData } = require('node:worker_threads');\n\nif (isMainThread) {\n  const shared = new SharedArrayBuffer(4);\n  const view = new Int32Array(shared);\n  Atomics.store(view, 0, 1);\n  new Worker(__filename, { workerData: shared });\n} else {\n  const view = new Int32Array(workerData);\n  console.log(Atomics.load(view, 0));\n}",
      },
      example: {
        lang: 'js',
        source: "const { Worker, isMainThread, workerData } = require('node:worker_threads');\n\nif (isMainThread) {\n  const shared = new SharedArrayBuffer(4);\n  const view = new Int32Array(shared);\n  Atomics.store(view, 0, 1);\n  new Worker(__filename, { workerData: shared });\n} else {\n  const view = new Int32Array(workerData);\n  console.log(Atomics.load(view, 0));\n}",
      },
      remember: 'Plain workerData is cloned. Use a SharedArrayBuffer when threads must see the same bytes.',
    },
  },
  {
    id: 'node-038',
    tech: 'node',
    topic: 'workers',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'An app keeps sessions in a module-level Map and runs one cluster worker per CPU. A login handled by one worker is missing on the next request. Why?',
    options: [
      'cluster workers share the Map, but cluster clears module scope after every request.',
      'cluster forks separate processes, and those processes do not share memory. Each process has its own Map.',
      'The Map is shared the way a SharedArrayBuffer is shared, but only string keys survive the fork.',
      'cluster workers share one JavaScript heap. The miss happens because Map cannot be read from more than one process.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Each cluster worker is a separate process with its own memory, so each has a different Map.',
      why: 'The cluster module forks extra operating-system processes so more than one CPU can run JavaScript. A process has its own memory. Forking copies the starting state and then the processes diverge, so a write to a Map in one worker is invisible to the others. This is different from worker_threads, which are threads in one process and can share a SharedArrayBuffer. A plain Map is still not shared between threads either. For a session cache across cluster workers, keep the data in an external store or send messages to the primary process.',
      wrong: [
        {
          option: 'cluster workers share the Map, but cluster clears module scope after every request.',
          reason: 'A cache that disappears between requests can look like a framework reset. Cluster does not wipe module variables. The next request may simply be a different process.',
        },
        {
          option: 'The Map is shared the way a SharedArrayBuffer is shared, but only string keys survive the fork.',
          reason: 'SharedArrayBuffer is the real shared-memory tool, so attaching it to cluster is a close guess. Cluster processes do not share a SharedArrayBuffer or a Map.',
        },
        {
          option: 'cluster workers share one JavaScript heap. The miss happens because Map cannot be read from more than one process.',
          reason: 'The conclusion that a Map is a poor cross-process cache is fair. The reason is stronger than that: cluster workers do not share a heap at all.',
        },
      ],
      example: {
        lang: 'js',
        source: "const cluster = require('node:cluster');\n\nif (cluster.isPrimary) {\n  const worker = cluster.fork();\n  worker.on('message', () => {\n    worker.send({ sessions: 1 });\n  });\n} else {\n  process.on('message', (message) => {\n    console.log(message.sessions);\n  });\n  process.send('ready');\n}",
      },
      remember: 'cluster workers are separate processes and do not share memory. A module Map stays local to each process.',
    },
  },
  {
    id: 'node-039',
    tech: 'node',
    topic: 'workers',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What can worker.postMessage send, and how do ArrayBuffer and SharedArrayBuffer travel?',
    options: [
      'postMessage shares every object by reference, so the worker can call a function you include in the message.',
      'Every ArrayBuffer is moved automatically. A SharedArrayBuffer must be listed in the transfer list or it is dropped.',
      'postMessage copies data with the structured clone algorithm. A function throws DataCloneError. An ArrayBuffer in the transfer list is moved. A SharedArrayBuffer is shared and must not be in that list.',
      'The structured clone algorithm copies functions, but it cannot copy plain objects or ArrayBuffers.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'postMessage clones data, and functions cannot be cloned. Transfer an ArrayBuffer to move it, and share a SharedArrayBuffer without transferring it.',
      why: 'The structured clone algorithm copies a message into the other thread instead of sharing your objects. Plain objects and arrays copy. A function is not cloneable data, and posting one throws DataCloneError. A normal ArrayBuffer is copied unless you put it in the transfer list, which moves it and leaves the sender buffer detached. A SharedArrayBuffer is shared memory, so both sides see the same bytes, and it must not be placed in the transfer list. workerData uses this same copy rule, with that same SharedArrayBuffer exception.',
      wrong: [
        {
          option: 'postMessage shares every object by reference, so the worker can call a function you include in the message.',
          reason: 'A message can look like a live object graph. The worker receives a copy, and functions cannot be copied or called on the other side.',
        },
        {
          option: 'Every ArrayBuffer is moved automatically. A SharedArrayBuffer must be listed in the transfer list or it is dropped.',
          reason: 'Transfer is real, so applying it to every buffer is a close rule. ArrayBuffers copy unless listed. SharedArrayBuffer is shared on its own and is invalid in the transfer list.',
        },
        {
          option: 'The structured clone algorithm copies functions, but it cannot copy plain objects or ArrayBuffers.',
          reason: 'Functions are the value people most want to send, so it is easy to invert the rule. Functions throw. Plain objects copy, and ArrayBuffers copy or move.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Worker, isMainThread, parentPort } = require('node:worker_threads');\n\nif (isMainThread) {\n  const worker = new Worker(__filename);\n  const buffer = new ArrayBuffer(4);\n  worker.postMessage({ label: 'count', buffer }, [buffer]);\n  console.log(buffer.byteLength);\n} else {\n  parentPort.on('message', (message) => {\n    console.log(message.label);\n    console.log(message.buffer.byteLength);\n  });\n}",
      },
      remember: 'postMessage clones data and cannot send functions. Transfer ArrayBuffers. Share SharedArrayBuffers.',
    },
  },
  {
    id: 'node-040',
    tech: 'node',
    topic: 'workers',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'A worker throws while starting, and the main thread never listens on the Worker object. The whole process dies. Why, and what should the main thread do?',
    options: [
      'A worker exception stays inside the thread and cannot affect the main process. The crash must be an unrelated signal.',
      'The main thread must call worker.terminate() in a timer or every exception becomes a cluster fork.',
      'Replace the worker with cluster. Cluster turns worker exceptions into warnings and keeps the primary alive by default.',
      'The worker emits error on the Worker object. With no listener, that error is thrown on the main thread. Listen for error, and for exit if you need the code.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'An uncaught worker exception emits error. With no listener, that error hits the main thread and can exit the process.',
      why: 'Each worker has its own JavaScript isolate, so its throw does not run on the main stack directly. Node reports that uncaught exception by emitting error on the Worker object in the parent. Worker is an event emitter, and an error event with no listener is thrown on the parent, which can take down the whole process. Add an error listener to record the failure and keep the parent alive. The exit event then reports the status code, which is 1 when the worker stops because of an error, while terminate is only for stopping a worker yourself.',
      wrong: [
        {
          option: 'A worker exception stays inside the thread and cannot affect the main process. The crash must be an unrelated signal.',
          reason: 'Separate isolates make a contained crash sound true. Node still forwards the failure to the parent as an error event, and an unhandled one can exit the process.',
        },
        {
          option: 'The main thread must call worker.terminate() in a timer or every exception becomes a cluster fork.',
          reason: 'terminate is the API for stopping a worker, so it looks like the required safety call. It does not handle an exception that has already been emitted, and it does not create cluster workers.',
        },
        {
          option: 'Replace the worker with cluster. Cluster turns worker exceptions into warnings and keeps the primary alive by default.',
          reason: 'Cluster is the other multi-CPU tool, so switching can look like the fix. A cluster worker that dies is still a dead process, and the primary still has to listen for exit if you want to recover.',
        },
      ],
      example: {
        lang: 'js',
        source: "const { Worker, isMainThread } = require('node:worker_threads');\n\nif (isMainThread) {\n  const worker = new Worker(__filename);\n  worker.on('error', (error) => {\n    console.error(error.message);\n  });\n  worker.on('exit', (code) => {\n    console.log(code);\n  });\n} else {\n  throw new Error('boom');\n}",
      },
      remember: 'Listen for error on a Worker, or an uncaught exception in the thread can crash the main process.',
    },
  },
] satisfies Question[];
