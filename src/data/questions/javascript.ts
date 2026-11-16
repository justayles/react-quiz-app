import type { Question } from '../types';

export const javascriptQuestions = [
  {
    id: 'js-001',
    tech: 'javascript',
    topic: 'closures',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The timers were meant to log 0, then 1, then 2. What does this loop log, and what is wrong with the binding?',
    code: {
      lang: 'js',
      source: "function start() {\n  for (var i = 0; i < 3; i++) {\n    setTimeout(function () {\n      console.log(i);\n    }, 0);\n  }\n}",
    },
    options: [
      'It logs 3, then 3, then 3. var creates one function-scoped binding, the loop leaves i at 3, and every timer reads that same binding.',
      'It logs 0, then 1, then 2. Each callback saves the value i held on the line that called setTimeout.',
      'It logs 2, then 2, then 2. The loop stops before i becomes 3, so the shared value is 2.',
      'It logs 0, then 1, then 2, then 3. The failing condition check schedules one extra timer.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The three timers log 3, 3, and 3 because they all read one var binding after the loop has finished.',
      why: 'A closure is a function that keeps using the variable bindings from the scope where it was created, and a binding is the variable slot itself rather than a frozen copy of its value. var is function-scoped, so this loop has a single i for every iteration. The synchronous loop queues three timers and then stops when i is 3, because the update i++ runs before the test i < 3 fails. No microtask is queued between the loop and the timers, so the timer callbacks run next and each one logs that same 3.',
      wrong: [
        {
          option: 'It logs 0, then 1, then 2. Each callback saves the value i held on the line that called setTimeout.',
          reason: 'That would be a fair guess if a closure stored a snapshot, or if the loop variable were let. var does not snapshot i, and setTimeout does not read i until the callback actually runs.',
        },
        {
          option: 'It logs 2, then 2, then 2. The loop stops before i becomes 3, so the shared value is 2.',
          reason: 'The last successful body does see i as 2, so stopping at 2 feels plausible. The increment still runs after that body, i becomes 3, and only then does 3 < 3 fail, so the stored value is 3.',
        },
        {
          option: 'It logs 0, then 1, then 2, then 3. The failing condition check schedules one extra timer.',
          reason: 'It is easy to picture the final failed test as another trip through the body. The body, including setTimeout, runs only while the test passes, so there are three timers, not four.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "function start() {\n  for (let i = 0; i < 3; i++) {\n    setTimeout(function () {\n      console.log(i);\n    }, 0);\n  }\n}",
      },
      example: { lang: 'js', source: "function start() {\n  for (let i = 0; i < 3; i++) {\n    setTimeout(function () {\n      console.log(i);\n    }, 0);\n  }\n}" },
      remember: 'A var loop has one shared binding; a let loop gives each iteration its own.',
    },
  },
  {
    id: 'js-002',
    tech: 'javascript',
    topic: 'closures',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'These timers log after the loop finishes. What appears, and in what order?',
    code: {
      lang: 'js',
      source: "function start() {\n  for (let i = 0; i < 3; i++) {\n    setTimeout(function () {\n      console.log(i);\n    }, 0);\n  }\n}",
    },
    options: [
      '3, then 3, then 3',
      '0, then 1, then 2',
      '0, then 0, then 0',
      '1, then 2, then 3',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The timers log 0, then 1, then 2.',
      why: 'A closure keeps a binding, which is the variable slot, not a copy taken at some earlier moment. For a for loop, let creates a fresh binding on each iteration, and the function created in that iteration closes over that iteration slot. Synchronously, the loop queues three timers and finishes with three separate stored indexes. Nothing queues a microtask here. When the timers run, they read 0, then 1, then 2.',
      wrong: [
        {
          option: '3, then 3, then 3',
          reason: 'That is the result of the same loop written with var, which has one shared binding. let in the for header does not share one slot across iterations.',
        },
        {
          option: '0, then 0, then 0',
          reason: 'The first value is easy to over-apply if you think the callbacks all captured the starting value. Each iteration has its own binding, so the later ones hold 1 and 2.',
        },
        {
          option: '1, then 2, then 3',
          reason: 'This treats the logged value as the result of the increment rather than the value during that iteration body. The callback closes over the i for that pass, which is 0, 1, or 2.',
        },
      ],
      example: { lang: 'js', source: "function start() {\n  for (let i = 0; i < 3; i++) {\n    setTimeout(function () {\n      console.log(i);\n    }, 0);\n  }\n}\nstart();" },
      remember: 'let in a for loop creates a new binding for every iteration.',
    },
  },
  {
    id: 'js-003',
    tech: 'javascript',
    topic: 'closures',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'read is created while n is 1, then n changes, then read runs. What does demo return?',
    code: {
      lang: 'js',
      source: "function demo() {\n  let n = 1;\n  const read = function () {\n    return n;\n  };\n  n = 2;\n  return read();\n}",
    },
    options: [
      '1, because the closure stored the value from the line where read was created',
      'undefined, because assigning to n after creating read detaches the closure',
      '2, because read closes over the binding n and sees its value at call time',
      'It throws, because a const function cannot read a let that later changes',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'demo returns 2 because read uses the live binding n, and the call happens after n = 2.',
      why: 'A closure captures the binding, meaning the variable slot, rather than copying the value that happened to be in it. The synchronous steps are: create n holding 1, create read, assign 2 into that same slot, then call read. The return inside read loads n at that moment, so the result is 2. No microtask or timer is involved. Creating the function earlier does not freeze the old value.',
      wrong: [
        {
          option: '1, because the closure stored the value from the line where read was created',
          reason: 'A snapshot is a common picture of how closures work, especially after seeing a let loop appear to keep old indexes. Those loop indexes are separate bindings; this read and the assignment share one binding.',
        },
        {
          option: 'undefined, because assigning to n after creating read detaches the closure',
          reason: 'Reassigning a let can look like it invalidates functions that already closed over it. Assignment updates the same slot, and read still has access to that slot.',
        },
        {
          option: 'It throws, because a const function cannot read a let that later changes',
          reason: 'const on read only prevents assigning a new function to read. It says nothing about whether the let that read uses may change.',
        },
      ],
      example: { lang: 'js', source: "function demo() {\n  let n = 1;\n  const read = function () {\n    return n;\n  };\n  n = 2;\n  return read();\n}\nconsole.log(demo());" },
      remember: 'A closure sees the binding current value when it runs, not a snapshot from when it was created.',
    },
  },
  {
    id: 'js-004',
    tech: 'javascript',
    topic: 'closures',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'make returns a function and then its own call is over. What do the next two calls return?',
    code: {
      lang: 'js',
      source: "function make() {\n  let n = 0;\n  return function () {\n    n += 1;\n    return n;\n  };\n}\nconst next = make();\nconst first = next();\nconst second = next();",
    },
    options: [
      'Both calls return 0. The local n is reset because make has already returned.',
      'Both calls return 1. Each call to next creates a fresh n.',
      'The second call throws, because n was freed when make returned.',
      'The first call returns 1 and the second returns 2. next keeps n alive after make returns.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'first is 1 and second is 2 because the returned function keeps the same n alive.',
      why: 'A closure keeps the bindings of its outer call reachable for as long as the inner function itself is reachable. make runs synchronously, creates n at 0, and returns the inner function, which is stored in next. The first call to next adds 1 and returns 1. The second call uses that same slot, adds 1, and returns 2. No microtask or timer is involved, and a later separate call to make would have a different n.',
      wrong: [
        {
          option: 'Both calls return 0. The local n is reset because make has already returned.',
          reason: 'Locals usually disappear with the stack frame, so a reset feels like ordinary scoping. The returned function still points at that frame environment, so the slot survives and is not put back to 0.',
        },
        {
          option: 'Both calls return 1. Each call to next creates a fresh n.',
          reason: 'It is easy to mix up a call to next with a call to make. next is the inner function, and both of these calls share the one n from the single make call.',
        },
        {
          option: 'The second call throws, because n was freed when make returned.',
          reason: 'Garbage collection does reclaim environments once nothing can reach them, so a use-after-return error sounds plausible. next can still reach n, so the engine keeps it.',
        },
      ],
      example: { lang: 'js', source: "function make() {\n  let n = 0;\n  return function () {\n    n += 1;\n    return n;\n  };\n}\nconst next = make();\nconsole.log(next());\nconsole.log(next());" },
      remember: 'An inner function keeps the outer bindings alive until the inner function is itself unreachable.',
    },
  },
  {
    id: 'js-005',
    tech: 'javascript',
    topic: 'closures',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The author expected the return value to be the string outer, believing the inner var belonged only to the block. What does read return?',
    code: {
      lang: 'js',
      source: "function read() {\n  var value = 'outer';\n  if (true) {\n    var value = 'inner';\n  }\n  return value;\n}",
    },
    options: [
      "It returns 'inner'. Both var declarations are one function-scoped binding, so the inner assignment replaces 'outer'.",
      "It returns 'outer'. A var inside a block is a separate binding, the same way let would be.",
      'It returns undefined. The inner var is hoisted to the block and clears the outer value before the return.',
      'It throws a SyntaxError because value is declared twice in one function.',
    ],
    correctIndex: 0,
    explanation: {
      answer: "read returns 'inner' because the two var declarations are the same function-scoped binding.",
      why: 'A binding is the single slot a name refers to, and var creates that slot for the whole function, ignoring braces. The declaration is hoisted once and starts as undefined, then the assignments run in source order. The first assignment stores outer, and the assignment inside the block stores inner into that same slot. The extra var keyword does not create a second slot and does not reset the value. The return therefore reads inner, with no microtask or timer involved.',
      wrong: [
        {
          option: "It returns 'outer'. A var inside a block is a separate binding, the same way let would be.",
          reason: 'Block scope is the rule people use every day with let and const, so applying it to var is a natural slip. var has function scope, so the braces do not protect the outer assignment.',
        },
        {
          option: 'It returns undefined. The inner var is hoisted to the block and clears the outer value before the return.',
          reason: 'A repeated var can look like a second initialization, and hoisting does involve undefined. That initial undefined happens once for the function, and the later var line only performs the assignment of inner.',
        },
        {
          option: 'It throws a SyntaxError because value is declared twice in one function.',
          reason: 'Duplicate let or const in one scope is a syntax error, so the same rejection seems likely here. var explicitly allows the same name to be declared again, and the second one is the same binding.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "function read() {\n  let value = 'outer';\n  if (true) {\n    let value = 'inner';\n  }\n  return value;\n}",
      },
      example: { lang: 'js', source: "function read() {\n  let value = 'outer';\n  if (true) {\n    let value = 'inner';\n  }\n  return value;\n}" },
      remember: 'var ignores block braces and reuses one function-scoped binding.',
    },
  },
  {
    id: 'js-006',
    tech: 'javascript',
    topic: 'closures',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You want two counters whose numbers stay private and independent. After the calls below, what do the two reads return?',
    code: {
      lang: 'js',
      source: "function createCounter() {\n  let n = 0;\n  return {\n    inc: function () {\n      n += 1;\n    },\n    read: function () {\n      return n;\n    }\n  };\n}\nconst a = createCounter();\nconst b = createCounter();\na.inc();\na.inc();\nb.inc();",
    },
    options: [
      'Both reads return 3. Every counter from the factory shares one n.',
      'a.read() returns 2 and b.read() returns 1. Each createCounter call closes over a new n that outsiders cannot name.',
      'Both reads return 0. n is destroyed when createCounter returns, so the methods can no longer see it.',
      'a.read() returns 2 and b.read() returns 2. inc is shared, so both counters add into one number.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'a.read() returns 2 and b.read() returns 1 because each factory call closes over its own private n.',
      why: 'A closure is a function plus the bindings it captured, and here inc and read capture n. Each synchronous call to createCounter creates a separate environment with its own n starting at 0, then returns functions that point at that environment. a.inc runs twice against the first n, and b.inc runs once against the second n. No microtask or timer is involved. Callers never receive n as a property, so the only way to observe it is through those functions.',
      wrong: [
        {
          option: 'Both reads return 3. Every counter from the factory shares one n.',
          reason: 'A factory can accidentally close over a module-level variable, and that shared-state bug is common. This n is declared inside createCounter, so each call gets a new slot.',
        },
        {
          option: 'Both reads return 0. n is destroyed when createCounter returns, so the methods can no longer see it.',
          reason: 'Stack locals do disappear when a call returns, unless something retained them. The returned functions retain this environment, so n is still there and already holds the increments.',
        },
        {
          option: 'a.read() returns 2 and b.read() returns 2. inc is shared, so both counters add into one number.',
          reason: 'Methods placed on a shared prototype really are one function, so sharing feels familiar. These inc functions are created inside each factory call, and each one closes over a different n.',
        },
      ],
      example: { lang: 'js', source: "function createCounter() {\n  let n = 0;\n  return {\n    inc: function () { n += 1; },\n    read: function () { return n; }\n  };\n}\nconst a = createCounter();\nconst b = createCounter();\na.inc();\na.inc();\nb.inc();\nconsole.log(a.read());\nconsole.log(b.read());" },
      remember: 'A factory keeps private state by closing each returned function over a fresh local binding.',
    },
  },
  {
    id: 'js-007',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'In what order are these four labels pushed?',
    code: {
      lang: 'js',
      source: "const log = [];\nlog.push('start');\nsetTimeout(function () {\n  log.push('timer');\n}, 0);\nPromise.resolve().then(function () {\n  log.push('then');\n});\nlog.push('end');",
    },
    options: [
      'start, timer, then, end',
      'start, then, end, timer',
      'start, end, then, timer',
      'start, end, timer, then',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The order is start, end, then, timer.',
      why: 'Synchronously, the code pushes start, queues a timer, queues a promise reaction, and pushes end. A microtask is a short job that runs after the current stack finishes and before timers; a promise then callback is a microtask. The stack then ends, so the microtask pushes then. The timer, which is a later task even when the delay is 0, pushes timer only after the microtask queue is empty.',
      wrong: [
        {
          option: 'start, timer, then, end',
          reason: 'A delay of 0 looks like it should jump the queue as soon as setTimeout is called. The timer waits until the current stack and the microtasks have both finished, and end is still part of the current stack.',
        },
        {
          option: 'start, then, end, timer',
          reason: 'Promises are often described as running immediately, so then can seem to jump ahead of the next synchronous line. The reaction is queued, and end still runs before the stack clears.',
        },
        {
          option: 'start, end, timer, then',
          reason: 'Timers are easy to place before promises because setTimeout appears first in the source. After the stack clears, the microtask queue is drained before the timer task.',
        },
      ],
      example: { lang: 'js', source: "const log = [];\nlog.push('start');\nsetTimeout(function () {\n  log.push('timer');\n  console.log(log.join(', '));\n}, 0);\nPromise.resolve().then(function () {\n  log.push('then');\n});\nlog.push('end');" },
      remember: 'After the current stack, drain microtasks, and only then run timers.',
    },
  },
  {
    id: 'js-008',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The first promise callback queues another promise. What is the order of the four labels after the timer has run?',
    code: {
      lang: 'js',
      source: "const log = [];\nsetTimeout(function () {\n  log.push('timer');\n}, 0);\nPromise.resolve().then(function () {\n  log.push('micro1');\n  Promise.resolve().then(function () {\n    log.push('micro2');\n  });\n});\nlog.push('sync');",
    },
    options: [
      'sync, timer, micro1, micro2',
      'sync, micro1, timer, micro2',
      'micro1, micro2, sync, timer',
      'sync, micro1, micro2, timer',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The order is sync, micro1, micro2, timer.',
      why: 'Synchronously, the code queues a timer, queues the first promise reaction, and pushes sync. A microtask checkpoint then drains promise reactions before any timer task. The first reaction pushes micro1 and queues a second promise reaction. That checkpoint keeps going until the microtask queue is empty, so micro2 runs before the engine moves on to the timer.',
      wrong: [
        {
          option: 'sync, timer, micro1, micro2',
          reason: 'The timer is registered first, so it can look like the next thing after sync. The current stack must finish and the microtask queue must be empty before that timer task starts.',
        },
        {
          option: 'sync, micro1, timer, micro2',
          reason: 'This is the usual mistake of thinking a checkpoint runs only the microtasks that already existed when it started. A promise queued by a microtask is still a microtask, and it is drained before timers.',
        },
        {
          option: 'micro1, micro2, sync, timer',
          reason: 'Promise callbacks can seem to preempt the rest of the current function. sync is synchronous, so it is pushed before either reaction runs.',
        },
      ],
      example: { lang: 'js', source: "const log = [];\nsetTimeout(function () {\n  log.push('timer');\n  console.log(log.join(', '));\n}, 0);\nPromise.resolve().then(function () {\n  log.push('micro1');\n  Promise.resolve().then(function () {\n    log.push('micro2');\n  });\n});\nlog.push('sync');" },
      remember: 'A promise queued by a microtask still runs before the next timer.',
    },
  },
  {
    id: 'js-009',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What order do these three labels end up in after the timer callback has run?',
    code: {
      lang: 'js',
      source: "const log = [];\nsetTimeout(function () {\n  log.push('timer');\n}, 0);\nqueueMicrotask(function () {\n  log.push('micro');\n});\nlog.push('sync');",
    },
    options: [
      'sync, micro, timer',
      'sync, timer, micro',
      'micro, sync, timer',
      'timer, micro, sync',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The order is sync, micro, timer.',
      why: 'Synchronously, setTimeout queues a timer task, queueMicrotask queues a microtask, and then sync is pushed. A microtask is a job reserved for the checkpoint immediately after the current stack, which is the same checkpoint promise reactions use. That checkpoint pushes micro. The timer task runs only after that queue is empty, even though its delay is 0 and it was requested first.',
      wrong: [
        {
          option: 'sync, timer, micro',
          reason: 'setTimeout appears first and 0 looks like no delay, so the timer seems next in line. A zero delay still means the next timer task, which waits until microtasks are done.',
        },
        {
          option: 'micro, sync, timer',
          reason: 'queueMicrotask sounds like it interrupts the current function. It only schedules work; sync still finishes on the current stack.',
        },
        {
          option: 'timer, micro, sync',
          reason: 'Reading the calls from top to bottom as the run order is tempting when every call schedules something. None of the callbacks run until the synchronous push has happened, and the microtask comes before the timer.',
        },
      ],
      example: { lang: 'js', source: "const log = [];\nsetTimeout(function () {\n  log.push('timer');\n  console.log(log.join(', '));\n}, 0);\nqueueMicrotask(function () {\n  log.push('micro');\n});\nlog.push('sync');" },
      remember: 'queueMicrotask runs in the microtask checkpoint, before setTimeout.',
    },
  },
  {
    id: 'js-010',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The awaited value is the already settled number 1, not a pending promise. What is the order of the four labels?',
    code: {
      lang: 'js',
      source: "const log = [];\nasync function run() {\n  log.push('body');\n  await 1;\n  log.push('after-await');\n}\nlog.push('before');\nrun();\nlog.push('after-call');",
    },
    options: [
      'before, body, after-await, after-call',
      'before, body, after-call, after-await',
      'before, after-call, body, after-await',
      'before, body, after-call, after-await, with after-await waiting on a timer',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The order is before, body, after-call, after-await. The continuation is a microtask, not a timer and not synchronous.',
      why: 'Synchronously, the outer code pushes before and calls run. The async function pushes body, then await wraps the plain number 1 with Promise.resolve and suspends the rest of run. await always continues later as a microtask, even when the value is already settled and was never a promise. run returns its promise, and the caller pushes after-call before the stack clears. The microtask then resumes run and pushes after-await. No timer is queued.',
      wrong: [
        {
          option: 'before, body, after-await, after-call',
          reason: 'Awaiting a non-promise looks like it could be optimized into a synchronous continuation. The language still schedules that continuation as a microtask, so after-call sneaks in first.',
        },
        {
          option: 'before, after-call, body, after-await',
          reason: 'Async functions are sometimes imagined as deferred entirely, like a timer callback. The body runs synchronously until the first await.',
        },
        {
          option: 'before, body, after-call, after-await, with after-await waiting on a timer',
          reason: 'Any delay that is not the current line gets lumped in with setTimeout. The resume is a microtask, so it runs before timers would, and this snippet does not queue a timer.',
        },
      ],
      example: { lang: 'js', source: "const log = [];\nasync function run() {\n  log.push('body');\n  await 1;\n  log.push('after-await');\n  console.log(log.join(', '));\n}\nlog.push('before');\nrun();\nlog.push('after-call');" },
      remember: 'await defers the rest of an async function as a microtask, even for an already settled value.',
    },
  },
  {
    id: 'js-011',
    tech: 'javascript',
    topic: 'async',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Just after these lines, before any queued promise job runs, what is value and what is seen?',
    code: {
      lang: 'js',
      source: "async function answer() {\n  return 5;\n}\nconst value = answer();\nlet seen = 'start';\nvalue.then(function () {\n  seen += '-then';\n});\nseen += '-after';",
    },
    options: [
      "value is 5, and seen is 'start-then-after', because a returned number skips the promise.",
      "value is undefined, and seen is 'start-after'. The number 5 appears only if the caller uses await.",
      "value is a promise that will fulfill with 5, and seen is 'start-after'. The then callback has not run yet.",
      "value is a promise that will fulfill with 5, and seen is 'start-then-after', because an already settled promise runs then immediately.",
    ],
    correctIndex: 2,
    explanation: {
      answer: "value is a promise for 5, and seen is still 'start-after' because then has not run.",
      why: 'An async function always returns a promise, even when its body returns a plain number and never uses await. Synchronously, answer runs the return, wraps 5 as the fulfillment of that promise, and hands the promise back to the caller. Attaching then queues a microtask; it does not run the callback on the current stack, so the following line can still append -after first. If an async function returns a promise, that promise is flattened so the caller still gets one promise, not a promise of a promise. No timer is involved.',
      wrong: [
        {
          option: "value is 5, and seen is 'start-then-after', because a returned number skips the promise.",
          reason: 'A function that returns 5 normally produces 5, so the async keyword is easy to overlook. The async keyword changes the return contract: the caller gets a promise, and then is not synchronous.',
        },
        {
          option: "value is undefined, and seen is 'start-after'. The number 5 appears only if the caller uses await.",
          reason: 'People mix this up with forgetting to return inside a then callback, which really does yield undefined. The number is the fulfillment value, and await is only one way for the caller to read it.',
        },
        {
          option: "value is a promise that will fulfill with 5, and seen is 'start-then-after', because an already settled promise runs then immediately.",
          reason: 'Promise.resolve(5).then can feel synchronous because the promise is already settled. Settlement reactions are microtasks, so the current stack appends -after first.',
        },
      ],
      example: { lang: 'js', source: "async function answer() {\n  return 5;\n}\nconst value = answer();\nlet seen = 'start';\nvalue.then(function (n) {\n  console.log(n, seen + '-then');\n});\nseen += '-after';\nconsole.log(value instanceof Promise, seen);" },
      remember: 'An async function returns a promise even when you return a plain number.',
    },
  },
  {
    id: 'js-012',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The author expected the rejection to be handled. What does load return, and what happens to the rejection?',
    code: {
      lang: 'js',
      source: "function load() {\n  try {\n    Promise.reject(new Error('boom'));\n    return 'ok';\n  } catch (error) {\n    return 'caught';\n  }\n}",
    },
    options: [
      "load returns 'caught'. try/catch handles every rejection created inside the block.",
      "load throws the Error 'boom' on the Promise.reject line, so the caller needs its own try/catch.",
      "load returns 'ok', and the rejection is discarded because nobody awaited the promise.",
      "load returns 'ok'. The catch block does not run, and the rejection is reported later unless something awaits the promise or attaches catch.",
    ],
    correctIndex: 3,
    explanation: {
      answer: "load returns 'ok', and the catch block never sees the rejection.",
      why: 'Synchronously, Promise.reject returns an already rejected promise and does not throw, so execution continues to return ok and skips catch. A rejection becomes an exception in try/catch only when code awaits it inside an async function, or when a catch handler is attached to the promise. The rejected promise schedules its unhandled-rejection tracking as promise bookkeeping, which is a microtask concern, not a synchronous throw. No timer is queued. Nothing here attaches a handler, so after the stack finishes the host reports an unhandled rejection.',
      wrong: [
        {
          option: "load returns 'caught'. try/catch handles every rejection created inside the block.",
          reason: 'try/catch is the tool people reach for around any failure, and the reject call sits inside the block. catch only sees synchronous throws, and creating a rejected promise is not a throw.',
        },
        {
          option: "load throws the Error 'boom' on the Promise.reject line, so the caller needs its own try/catch.",
          reason: 'The constructor call new Error looks like the moment of failure, so a synchronous throw is believable. Promise.reject captures that error as the rejection reason and returns normally.',
        },
        {
          option: "load returns 'ok', and the rejection is discarded because nobody awaited the promise.",
          reason: 'The return value really is ok, which makes the rest of this option feel safe. Ignoring a rejected promise does not cancel it; the host still reports it if no handler is attached in time.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "async function load() {\n  try {\n    await Promise.reject(new Error('boom'));\n    return 'ok';\n  } catch (error) {\n    return 'caught';\n  }\n}",
      },
      example: { lang: 'js', source: "async function load() {\n  try {\n    await Promise.reject(new Error('boom'));\n    return 'ok';\n  } catch (error) {\n    return 'caught';\n  }\n}" },
      remember: 'try/catch sees a rejected promise only if you await it or attach a catch handler.',
    },
  },
  {
    id: 'js-013',
    tech: 'javascript',
    topic: 'async',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'After the reactions queued by Promise.all have run, what is the fate of result?',
    code: {
      lang: 'js',
      source: "const result = Promise.all([\n  Promise.resolve('ok'),\n  Promise.reject(new Error('first')),\n  Promise.reject(new Error('second'))\n]);",
    },
    options: [
      "result rejects with the Error whose message is 'first'. It does not wait to include 'second' in that rejection.",
      "result rejects with an AggregateError that lists both 'first' and 'second'.",
      "result fulfills with ['ok'] and drops the rejected inputs.",
      "result waits until both rejections exist, then rejects with the Error whose message is 'second'.",
    ],
    correctIndex: 0,
    explanation: {
      answer: "result rejects with the first error, the one whose message is 'first'.",
      why: 'Synchronously, Promise.all subscribes to each input and returns a pending promise. These inputs are already settled, so their reactions are queued as microtasks in array order. The fulfillment of ok does not settle the combined promise, and the next reaction rejects it with the error first. Once that has happened, the later rejection is ignored for the combined result rather than being packaged with the first. No timer is involved. AggregateError is the failure shape used by Promise.any when every input rejects, not the shape used here.',
      wrong: [
        {
          option: "result rejects with an AggregateError that lists both 'first' and 'second'.",
          reason: 'AggregateError is the real failure type for a related combinator, so it is a reasonable memory. Promise.any produces that when all inputs reject; Promise.all rejects with the first reason alone.',
        },
        {
          option: "result fulfills with ['ok'] and drops the rejected inputs.",
          reason: 'Keeping the successful value and skipping failures sounds like a best-effort gather. Promise.all is all-or-nothing: one rejection rejects the result, and ok is not returned.',
        },
        {
          option: "result waits until both rejections exist, then rejects with the Error whose message is 'second'.",
          reason: 'Several combinators do wait for every input, so waiting for the last failure feels consistent. Promise.all settles on the first rejection and does not replace that reason with a later one.',
        },
      ],
      example: { lang: 'js', source: "const result = Promise.all([\n  Promise.resolve('ok'),\n  Promise.reject(new Error('first')),\n  Promise.reject(new Error('second'))\n]);\nresult.catch(function (error) {\n  console.log(error.message);\n});" },
      remember: 'Promise.all rejects on the first rejection and does not describe the other inputs.',
    },
  },
  {
    id: 'js-014',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Promise.allSettled is given a promise that fulfills with 1 and a promise that rejects with the string bad. What does the returned promise do?',
    code: {
      lang: 'js',
      source: "const result = Promise.allSettled([\n  Promise.resolve(1),\n  Promise.reject('bad')\n]);",
    },
    options: [
      "It rejects with 'bad' and never produces the fulfilled value 1.",
      "It fulfills after both inputs settle, with a fulfilled outcome for 1 and then a rejected outcome whose reason is 'bad'.",
      'It fulfills with [1] and leaves the rejection out of the array.',
      'It fulfills as soon as the first input settles and ignores the input that is still pending.',
    ],
    correctIndex: 1,
    explanation: {
      answer: "The allSettled promise fulfills with both outcomes, including a rejected outcome for 'bad'.",
      why: 'Synchronously, Promise.allSettled subscribes to every input and returns its own pending promise. Each input then settles through a microtask, and the combinator records an outcome object instead of adopting that settlement. The first outcome is fulfilled with value 1, and the second is rejected with reason bad. No timer is used. The returned promise itself fulfills when the list is complete, so a rejection in the list does not short-circuit it.',
      wrong: [
        {
          option: "It rejects with 'bad' and never produces the fulfilled value 1.",
          reason: 'Promise.all does reject on the first failure, and the two names are close. allSettled converts that failure into a result entry and fulfills.',
        },
        {
          option: 'It fulfills with [1] and leaves the rejection out of the array.',
          reason: 'Filtering to successes is what a manual gather often wants, so it is easy to assume the built-in does that. The array keeps every input, and failures appear as rejected outcome objects.',
        },
        {
          option: 'It fulfills as soon as the first input settles and ignores the input that is still pending.',
          reason: 'Promise.race settles on the first result, and that shortcut is easy to attach to any combinator. allSettled waits until every input has either fulfilled or rejected.',
        },
      ],
      example: { lang: 'js', source: "Promise.allSettled([\n  Promise.resolve(1),\n  Promise.reject('bad')\n]).then(function (outcomes) {\n  console.log(outcomes[0].status, outcomes[0].value);\n  console.log(outcomes[1].status, outcomes[1].reason);\n});" },
      remember: 'Promise.allSettled waits for every input and fulfills with an outcome for each one.',
    },
  },
  {
    id: 'js-015',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How do Promise.race and Promise.any treat fulfillment and rejection differently?',
    code: {
      lang: 'js',
      source: "const race = Promise.race([\n  Promise.reject('no'),\n  Promise.resolve('yes')\n]);\nconst any = Promise.any([\n  Promise.reject('no'),\n  Promise.resolve('yes')\n]);\nconst none = Promise.any([\n  Promise.reject('a'),\n  Promise.reject('b')\n]);",
    },
    options: [
      'race and any are the same: both reject as soon as any input rejects.',
      'any rejects on the first rejection. race fulfills with the first success and ignores failures.',
      "race settles with the first outcome, whether it fulfills or rejects. any ignores rejections until one input fulfills, and if every input rejects it rejects with an AggregateError.",
      'race waits for every promise. any returns the first fulfillment and never rejects.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'race mirrors the first settlement, while any waits for the first fulfillment and uses AggregateError only if all reject.',
      why: 'Synchronously, each combinator subscribes to its inputs in order and returns a pending promise. These inputs are already settled, so the reactions run as microtasks in that same order, and no timer is involved. For race, the rejection no is handled first and becomes the result, so the later fulfillment is ignored. For any, that rejection is remembered but skipped, and the fulfillment yes becomes the result. For none, there is no fulfillment, so the result rejects with an AggregateError whose errors list holds both reasons.',
      wrong: [
        {
          option: 'race and any are the same: both reject as soon as any input rejects.',
          reason: 'The names both sound like a contest decided by the fastest input. any is specifically a contest among fulfillments, and a rejection does not eliminate the remaining inputs.',
        },
        {
          option: 'any rejects on the first rejection. race fulfills with the first success and ignores failures.',
          reason: 'This swaps the two policies, which is easy when the names are only half remembered. race adopts a rejection if that rejection settles first, and any does not.',
        },
        {
          option: 'race waits for every promise. any returns the first fulfillment and never rejects.',
          reason: 'Waiting for everyone belongs to allSettled, so it gets attached to race. any can still reject, but only after every input has rejected, and the reason is an AggregateError.',
        },
      ],
      example: { lang: 'js', source: "const race = Promise.race([Promise.reject('no'), Promise.resolve('yes')]);\nconst any = Promise.any([Promise.reject('no'), Promise.resolve('yes')]);\nconst none = Promise.any([Promise.reject('a'), Promise.reject('b')]);\nrace.catch(function (reason) { console.log('race', reason); });\nany.then(function (value) { console.log('any', value); });\nnone.catch(function (error) { console.log(error.name); });" },
      remember: 'race takes the first settlement; any takes the first fulfillment, or AggregateError if all reject.',
    },
  },
  {
    id: 'js-016',
    tech: 'javascript',
    topic: 'async',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does pick return?',
    code: {
      lang: 'js',
      source: "function pick() {\n  try {\n    return 'try';\n  } finally {\n    return 'finally';\n  }\n}",
    },
    options: [
      'try',
      'undefined, because the two return statements cancel each other',
      'It throws a SyntaxError because finally cannot return',
      'finally',
    ],
    correctIndex: 3,
    explanation: {
      answer: "pick returns the string 'finally'.",
      why: 'Synchronously, try completes by preparing to return the string try, and that completion is suspended while finally runs. A return inside finally is a new completion, and it replaces the pending return from try. The function therefore yields finally. There is no microtask or timer. If finally did not return, the original try completion would continue, and if finally threw, that throw would replace the return instead.',
      wrong: [
        {
          option: 'try',
          reason: 'The try return is written first and is the value people mean to produce, so it feels like the real result. finally is allowed to override that pending completion when it returns.',
        },
        {
          option: 'undefined, because the two return statements cancel each other',
          reason: 'Two returns can look like a conflict that the language resolves by returning nothing. The language keeps one completion, and the finally completion wins.',
        },
        {
          option: 'It throws a SyntaxError because finally cannot return',
          reason: 'Returning from finally is widely discouraged, so a syntax ban sounds plausible. It is legal, and that is exactly why it can change the result by surprise.',
        },
      ],
      example: { lang: 'js', source: "function pick() {\n  try {\n    return 'try';\n  } finally {\n    return 'finally';\n  }\n}\nconsole.log(pick());" },
      remember: 'A return or throw in finally replaces the completion that try or catch was about to produce.',
    },
  },
  {
    id: 'js-017',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'run is supposed to return the user name. What happens when the method is passed as a callback?',
    code: {
      lang: 'js',
      source: "'use strict';\nconst user = {\n  name: 'Ada',\n  getName: function () {\n    return this.name;\n  }\n};\nfunction run(fn) {\n  return fn();\n}\nrun(user.getName);",
    },
    options: [
      'It throws a TypeError. The callback is called with no receiver, so strict mode sets this to undefined.',
      'It returns Ada. A method keeps the object it was read from.',
      'It returns undefined and does not throw. A missing this quietly becomes an empty name.',
      'It returns the global object name. A bare call in strict mode uses the global object.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The call throws a TypeError because the extracted method is invoked with this set to undefined.',
      why: 'Reading user.getName copies out the function without bundling a receiver, and the receiver is the object that should become this. Synchronously, run calls that function as fn(), which is a bare call. The directive makes this code strict, so a bare call sets this to undefined rather than the global object. Reading the name property of undefined throws a TypeError before any microtask or timer could matter. The call user.getName() would have set this to user because the call expression still had a receiver.',
      wrong: [
        {
          option: 'It returns Ada. A method keeps the object it was read from.',
          reason: 'Method syntax looks like the function belongs to the object permanently. The object is only the receiver of a particular call, and this call does not supply one.',
        },
        {
          option: 'It returns undefined and does not throw. A missing this quietly becomes an empty name.',
          reason: 'Optional access and default values often turn a missing name into undefined, so a soft failure seems likely. The failure happens earlier: this itself is undefined, and the property read throws.',
        },
        {
          option: 'It returns the global object name. A bare call in strict mode uses the global object.',
          reason: 'Non-strict code really does substitute the global object for a missing this, and a lot of older code depends on that. This snippet is strict, so the missing this stays undefined and the property read throws.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "'use strict';\nconst user = {\n  name: 'Ada',\n  getName: function () {\n    return this.name;\n  }\n};\nfunction run(fn) {\n  return fn();\n}\nrun(user.getName.bind(user));",
      },
      example: { lang: 'js', source: "'use strict';\nconst user = {\n  name: 'Ada',\n  getName: function () {\n    return this.name;\n  }\n};\nfunction run(fn) {\n  return fn();\n}\nrun(user.getName.bind(user));" },
      remember: 'Passing obj.fn as a callback drops the receiver unless you bind it or wrap the call.',
    },
  },
  {
    id: 'js-018',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'getName is copied off the instance and called with no receiver. What does it return?',
    code: {
      lang: 'js',
      source: "'use strict';\nfunction Person(name) {\n  this.name = name;\n  this.getName = () => this.name;\n}\nconst ada = new Person('Ada');\nconst getName = ada.getName;\ngetName();",
    },
    options: [
      'It throws a TypeError, because taking the function off the instance clears this.',
      "It returns 'Ada'. The arrow captured this from new Person, and the later bare call does not replace it.",
      'It returns undefined. An arrow takes this from the call site, and this call has no receiver.',
      'It returns the global object. An extracted arrow uses the global this.',
    ],
    correctIndex: 1,
    explanation: {
      answer: "The bare call returns 'Ada' because the arrow captured this while new Person was running.",
      why: 'An arrow function does not have its own this; it uses the this of the enclosing scope, captured when the arrow is created. Synchronously, new Person creates an object, assigns the name, and creates the arrow while this is that new object. Copying the function to getName does not change the captured this, so the later bare call still reads Ada. No microtask or timer runs, and a normal function in that same spot would have taken this from the bare call instead.',
      wrong: [
        {
          option: 'It throws a TypeError, because taking the function off the instance clears this.',
          reason: 'Extracting a normal method and calling it bare does throw in strict mode, and this code looks similar. An arrow ignores the call site, so there is still a this to read.',
        },
        {
          option: 'It returns undefined. An arrow takes this from the call site, and this call has no receiver.',
          reason: 'The rule for ordinary functions is that this comes from the call, so applying it to every function is natural. Arrows are the exception: they keep the enclosing this.',
        },
        {
          option: 'It returns the global object. An extracted arrow uses the global this.',
          reason: 'Non-strict bare calls use the global object, and it is easy to assume an extracted function falls back to that. This arrow never consults the call site, and the captured this is the instance.',
        },
      ],
      example: { lang: 'js', source: "'use strict';\nfunction Person(name) {\n  this.name = name;\n  this.getName = () => this.name;\n}\nconst ada = new Person('Ada');\nconst getName = ada.getName;\nconsole.log(getName());" },
      remember: 'An arrow uses the this of the scope where it was created, not the this of the caller.',
    },
  },
  {
    id: 'js-019',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What are fromCall and fromBare?',
    code: {
      lang: 'js',
      source: "'use strict';\nfunction id() {\n  return this;\n}\nconst obj = { tag: 'obj' };\nconst fromCall = id.call(obj);\nconst fromBare = id();",
    },
    options: [
      'Both are obj. Once call has been used, later calls keep that this.',
      'fromCall is undefined and fromBare is obj. call clears this, and a bare call restores the last object.',
      'fromCall is obj and fromBare is undefined. call sets this for that call only, and a bare strict call sets this to undefined.',
      'fromCall is obj and fromBare is the global object. Strict mode still falls back to the global object.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'fromCall is obj, and fromBare is undefined.',
      why: 'Synchronously, call invokes id with its this argument set to obj, so the first return is that object. call does not rewrite the function. The next line calls id with no receiver. Because of the strict directive, a bare call sets this to undefined instead of substituting the global object. No microtask or timer is involved. In a non-strict classic script, that bare call would have used the global object.',
      wrong: [
        {
          option: 'Both are obj. Once call has been used, later calls keep that this.',
          reason: 'bind really does fix this for later calls, and call is easy to confuse with bind. call affects only the invocation it performs.',
        },
        {
          option: 'fromCall is undefined and fromBare is obj. call clears this, and a bare call restores the last object.',
          reason: 'The two call forms are easy to reverse if you remember only that they differ. The this argument of call is the object used for that call, and the bare call is the one with no object.',
        },
        {
          option: 'fromCall is obj and fromBare is the global object. Strict mode still falls back to the global object.',
          reason: 'The global fallback is real in non-strict code, so it stays in memory as the default. The strict directive in this snippet turns that fallback off.',
        },
      ],
      example: { lang: 'js', source: "'use strict';\nfunction id() {\n  return this;\n}\nconst obj = { tag: 'obj' };\nconst fromCall = id.call(obj);\nconst fromBare = id();\nconsole.log(fromCall === obj, fromBare);" },
      remember: 'fn.call(obj) sets this for one call; a bare strict call sets this to undefined.',
    },
  },
  {
    id: 'js-020',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Bound was created with a this value and a bound first argument. What does new Bound(2) produce?',
    code: {
      lang: 'js',
      source: "function Point(x, y) {\n  this.x = x;\n  this.y = y;\n}\nconst origin = { x: 0, y: 0 };\nconst Bound = Point.bind(origin, 1);\nconst p = new Bound(2);",
    },
    options: [
      'p is origin, and origin.x is 1. new uses the bound this.',
      'It throws, because a bound function cannot be constructed with new.',
      'p.x is 2 and p.y is undefined. new drops the bound argument and keeps only the argument 2.',
      'p is a new object with x 1 and y 2, origin.x stays 0, and p is an instance of Point. new ignores the bound this and still applies the bound argument.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'p is a new Point with x 1 and y 2, and origin is unchanged.',
      why: 'Synchronously, bind returns a new function whose stored this is origin and whose stored first argument is 1. new takes precedence over that stored this: the construct path creates a fresh object and passes it to Point, so origin.x stays 0. The stored argument is still prepended, so x receives 1 and the explicit argument 2 becomes y. The new object prototype is Point.prototype, so p is an instance of Point. No microtask or timer runs. Calling Bound without new would have written onto origin instead.',
      wrong: [
        {
          option: 'p is origin, and origin.x is 1. new uses the bound this.',
          reason: 'bind is supposed to lock this, so new looks like it should lock onto origin too. Construction ignores the bound this and allocates a new object.',
        },
        {
          option: 'It throws, because a bound function cannot be constructed with new.',
          reason: 'Bound functions are exotic, and several exotic functions cannot be constructed, so a TypeError seems likely. A bound function can be constructed when its target can, and Point can.',
        },
        {
          option: 'p.x is 2 and p.y is undefined. new drops the bound argument and keeps only the argument 2.',
          reason: 'If new ignores the bound this, it is reasonable to think it ignores the bound arguments as well. Only the this binding is ignored; the prepended argument 1 is still passed.',
        },
      ],
      example: { lang: 'js', source: "function Point(x, y) {\n  this.x = x;\n  this.y = y;\n}\nconst origin = { x: 0, y: 0 };\nconst Bound = Point.bind(origin, 1);\nconst p = new Bound(2);\nconsole.log(p.x, p.y);\nconsole.log(origin.x, p instanceof Point);" },
      remember: 'new ignores the this stored by bind, but it still prepends the bound arguments.',
    },
  },
  {
    id: 'js-021',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'After bind, what are direct and viaBound?',
    code: {
      lang: 'js',
      source: "'use strict';\nfunction id() {\n  return this && this.tag;\n}\nconst bound = id.bind({ tag: 'bound' });\nconst direct = id();\nconst viaBound = bound();",
    },
    options: [
      "direct is undefined and viaBound is 'bound'. bind returns a new function and leaves id unchanged.",
      "direct and viaBound are both 'bound'. bind rewrites id so every later call uses that this.",
      'viaBound is bound and id can no longer be called. bind consumes the original function.',
      'Both are undefined. bind only affects call and apply, not a later call of the bound function.',
    ],
    correctIndex: 0,
    explanation: {
      answer: "direct is undefined and viaBound is 'bound', because bind produced a new function.",
      why: 'Synchronously, bind returns a different function object that remembers the this value and any bound arguments. Calling id still performs a bare call. In this strict code, that bare this is undefined, and the && operator returns that undefined without reading tag. Calling the new function supplies the stored object, so tag is bound. No microtask or timer is involved. The original function remains callable and unbound.',
      wrong: [
        {
          option: "direct and viaBound are both 'bound'. bind rewrites id so every later call uses that this.",
          reason: 'The name bind sounds like a mutation of the existing function, similar to assigning a property. bind does not write into id; the caller has to use the function it returned.',
        },
        {
          option: 'viaBound is bound and id can no longer be called. bind consumes the original function.',
          reason: 'Some wrapping APIs replace the original, so a one-time conversion seems possible. The original stays in place, and the wrapper is an additional function.',
        },
        {
          option: 'Both are undefined. bind only affects call and apply, not a later call of the bound function.',
          reason: 'call and apply are the methods people use when they want a one-off this, so bind can get filed with them as a call-site tool. A bound function applies its stored this on an ordinary call.',
        },
      ],
      example: { lang: 'js', source: "'use strict';\nfunction id() {\n  return this && this.tag;\n}\nconst bound = id.bind({ tag: 'bound' });\nconst direct = id();\nconst viaBound = bound();\nconsole.log(direct, viaBound);" },
      remember: 'bind returns a new function. The original function stays unbound.',
    },
  },
  {
    id: 'js-022',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'After the assignment, what are obj.a and proto.a?',
    code: {
      lang: 'js',
      source: "const proto = { a: 1 };\nconst obj = Object.create(proto);\nobj.a = 2;",
    },
    options: [
      'obj.a is 1 and proto.a is 2. The assignment writes through to the prototype.',
      'obj.a is 2 and proto.a is 1. The own property hides the prototype property.',
      'Both are 2. Creating obj copies the prototype properties onto obj.',
      'Reading obj.a throws, because an own property and a prototype property cannot share a name.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'obj.a is 2 and proto.a is 1. The own property shadows the prototype.',
      why: 'Prototype lookup walks a chain of objects: if the property is not stored on the receiver, the engine follows the internal prototype link and tries again. Object.create sets that link from obj to proto, so a read would initially find 1. The assignment obj.a = 2 creates an own property, meaning a property stored on obj itself, and a later read stops there. proto is a different object and still holds 1. The whole snippet is synchronous, with no microtask or timer.',
      wrong: [
        {
          option: 'obj.a is 1 and proto.a is 2. The assignment writes through to the prototype.',
          reason: 'Inherited data can look mutable in place, especially if you have seen a prototype method shared by every instance. Assignment to an ordinary inherited data property creates a shadowing own property instead of writing through.',
        },
        {
          option: 'Both are 2. Creating obj copies the prototype properties onto obj.',
          reason: 'Construction can feel like a copy of the parent fields onto the child. Object.create only sets the link, and the later assignment adds a separate own property.',
        },
        {
          option: 'Reading obj.a throws, because an own property and a prototype property cannot share a name.',
          reason: 'Duplicate names are errors for let in one scope, so a clash on the chain sounds illegal. Shadowing is normal: the own property wins, and the prototype property remains.',
        },
      ],
      example: { lang: 'js', source: "const proto = { a: 1 };\nconst obj = Object.create(proto);\nconsole.log(obj.a);\nobj.a = 2;\nconsole.log(obj.a, proto.a);\nconsole.log(Object.hasOwn(obj, 'a'));" },
      remember: 'An own property shadows the same name on the prototype; lookup stops at the own property.',
    },
  },
  {
    id: 'js-023',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'inc is added to the prototype after a already exists. What does a.inc() return?',
    code: {
      lang: 'js',
      source: "function Counter() {\n  this.n = 0;\n}\nconst a = new Counter();\nCounter.prototype.inc = function () {\n  this.n += 1;\n  return this.n;\n};\na.inc();",
    },
    options: [
      'It throws, because a was created before inc existed.',
      'It returns undefined. Existing instances keep the prototype object they saw at construction, which had no inc.',
      'It returns 1. Lookup happens when inc is called, so the method added later is visible, and this is a.',
      'It returns 0. inc is found, but it runs against Counter.prototype, so a.n stays 0.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'a.inc() returns 1. The instance sees the method that was added to the shared prototype.',
      why: 'Every instance created with new Counter shares one prototype object, the object on Counter.prototype. Synchronously, a is created with an own n of 0, then inc is added as a property of that same prototype object. The call looks up inc at call time, finds it, and uses a as this because the call has a receiver. this.n therefore changes from 0 to 1 and that 1 is returned. No microtask or timer is involved. Instances do not receive a private copy of the prototype at construction.',
      wrong: [
        {
          option: 'It throws, because a was created before inc existed.',
          reason: 'It is reasonable to think an instance freezes the shape it was constructed with, the way a copied object would. Lookup follows the live prototype object, so a property added later is found.',
        },
        {
          option: 'It returns undefined. Existing instances keep the prototype object they saw at construction, which had no inc.',
          reason: 'The phrase prototype at construction time suggests a snapshot. The instance keeps a link to the object, and mutations of that object stay visible.',
        },
        {
          option: 'It returns 0. inc is found, but it runs against Counter.prototype, so a.n stays 0.',
          reason: 'Methods live on the prototype, so it is easy to assume this is the prototype too. this comes from the call receiver, which is a, and a.n is the own property that changes.',
        },
      ],
      example: { lang: 'js', source: "function Counter() {\n  this.n = 0;\n}\nconst a = new Counter();\nCounter.prototype.inc = function () {\n  this.n += 1;\n  return this.n;\n};\nconsole.log(a.inc());" },
      remember: 'Mutating Constructor.prototype is visible to instances that already exist.',
    },
  },
  {
    id: 'js-024',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does Object.create do with proto here, and where does the property a live?',
    code: {
      lang: 'js',
      source: "const proto = { a: 1 };\nconst obj = Object.create(proto);",
    },
    options: [
      'It copies the properties of proto onto a new object, so a becomes an own property of obj.',
      'It sets the constructor property of obj to proto and does not link the prototype chain.',
      'It returns proto itself, so later changes to obj change proto.',
      'It sets the internal prototype of obj to proto. a is found by walking that link and is not an own property of obj.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Object.create(proto) makes proto the internal prototype of a new object, so a is inherited.',
      why: 'The internal prototype is the hidden link that property lookup follows, the same link Object.getPrototypeOf reads. Synchronously, Object.create allocates a fresh object and sets that link to proto. It does not copy a onto the new object, so Object.hasOwn(obj, a) is false while a read of obj.a still finds 1. No microtask or timer runs. The new object is not the same reference as proto.',
      wrong: [
        {
          option: 'It copies the properties of proto onto a new object, so a becomes an own property of obj.',
          reason: 'Object.assign and spread copy own properties, and create sounds similar. create only installs the prototype link, leaving a on proto.',
        },
        {
          option: 'It sets the constructor property of obj to proto and does not link the prototype chain.',
          reason: 'constructor is the visible property people use to talk about type, so it seems like the thing create would set. The important write is the internal prototype link, not the constructor property.',
        },
        {
          option: 'It returns proto itself, so later changes to obj change proto.',
          reason: 'If the link and the object were the same, returning proto would be the simplest implementation. create returns a new object whose link points at proto.',
        },
      ],
      example: { lang: 'js', source: "const proto = { a: 1 };\nconst obj = Object.create(proto);\nconsole.log(obj.a);\nconsole.log(Object.hasOwn(obj, 'a'));\nconsole.log(obj === proto);\nconsole.log(Object.getPrototypeOf(obj) === proto);" },
      remember: 'Object.create(proto) sets the internal prototype link. It does not copy properties.',
    },
  },
  {
    id: 'js-025',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Box was never called on mystery. What is mystery instanceof Box?',
    code: {
      lang: 'js',
      source: "function Box() {}\nconst mystery = Object.create(Box.prototype);\nmystery instanceof Box;",
    },
    options: [
      'true. instanceof walks the prototype chain looking for Box.prototype and does not require that Box was called.',
      'false. instanceof is true only for objects created by new Box.',
      'false. instanceof compares the constructor property, and mystery has no own constructor.',
      'It throws, because mystery was not initialized by Box.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The result is true because the prototype chain of mystery includes Box.prototype.',
      why: 'instanceof walks the internal prototype chain of the left object, comparing each link with the right function prototype property. Synchronously, Object.create sets the internal prototype of mystery to Box.prototype, so the first comparison matches and the result is true. The walk does not check whether Box was invoked, and it does not read a constructor property. No microtask or timer is involved. A function can replace this walk with Symbol.hasInstance, but Box does not.',
      wrong: [
        {
          option: 'false. instanceof is true only for objects created by new Box.',
          reason: 'new is the normal way to set up that link, so it is easy to treat new as part of the test. The operator only cares that the link is there, however it was installed.',
        },
        {
          option: 'false. instanceof compares the constructor property, and mystery has no own constructor.',
          reason: 'The constructor property is what shows up in object literals and logs, so it seems like the field being tested. instanceof compares prototype objects along the chain, not the constructor name.',
        },
        {
          option: 'It throws, because mystery was not initialized by Box.',
          reason: 'Using an instance before its constructor has run often throws when you call methods that expect fields. The instanceof operator does not call Box and does not need those fields.',
        },
      ],
      example: { lang: 'js', source: "function Box() {}\nconst mystery = Object.create(Box.prototype);\nconsole.log(mystery instanceof Box);\nconst made = new Box();\nconsole.log(made instanceof Box);\nconsole.log(Object.getPrototypeOf(mystery) === Box.prototype);" },
      remember: 'instanceof is a prototype-chain walk toward Constructor.prototype, not a check that new was used.',
    },
  },
  {
    id: 'js-026',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Where do value and double live, and how does a call such as a.double() choose this?',
    code: {
      lang: 'js',
      source: "class Box {\n  value = 1;\n  double() {\n    return this.value * 2;\n  }\n}\nconst a = new Box();\nconst b = new Box();",
    },
    options: [
      'value and double are both own properties of each instance, and a.double is a different function from b.double.',
      'value is an own property of each instance. double lives on Box.prototype, so a.double and b.double are the same function, and this is the receiver of the call.',
      'value and double both live on Box.prototype, so assigning a.value also changes b.value.',
      'double is an own property of each instance. value lives on Box.prototype and is shared.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'value is own on each instance, double is one shared prototype method, and this is the call receiver.',
      why: 'A class method is installed on the constructor prototype when the class is evaluated, so instances share that one function. A public field is different: during new, each instance gets its own property, so a and b each have an own value of 1. The expression a.double() looks up the shared function and sets this to a because a is the receiver in that call. That is why the method reads a.value and returns 2. Copying the method out and calling it bare would lose the receiver; class bodies are strict, so this would be undefined and the call would throw. No microtask or timer is involved.',
      wrong: [
        {
          option: 'value and double are both own properties of each instance, and a.double is a different function from b.double.',
          reason: 'Fields and methods are both written in the class body, so giving every instance its own copy of both is a natural model. Only the field initializer runs per instance; the method stays on the prototype.',
        },
        {
          option: 'value and double both live on Box.prototype, so assigning a.value also changes b.value.',
          reason: 'Shared prototype data is a real pattern in older constructor code, so a class field can be mistaken for it. The field creates an own property, and assigning it does not write the other instance.',
        },
        {
          option: 'double is an own property of each instance. value lives on Box.prototype and is shared.',
          reason: 'This swaps the two rules, often because methods feel more specific to the object than a plain field. The method is the shared one, and the field is the per-instance one.',
        },
      ],
      example: { lang: 'js', source: "class Box {\n  value = 1;\n  double() {\n    return this.value * 2;\n  }\n}\nconst a = new Box();\nconst b = new Box();\na.value = 3;\nconsole.log(a.double(), b.double());\nconsole.log(a.double === b.double);\nconsole.log(Object.hasOwn(a, 'value'), Object.hasOwn(a, 'double'));" },
      remember: 'Class fields are own properties of the instance. Methods live on the prototype and take this from the call.',
    },
  },
  {
    id: 'js-027',
    tech: 'javascript',
    topic: 'equality',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What are the loose comparison and the strict comparison?',
    code: {
      lang: 'js',
      source: "const loose = [] == ![];\nconst strict = [] === ![];",
    },
    options: [
      'loose is false and strict is false. An array and a boolean are never equal.',
      'loose is true and strict is true. Both operators coerce the two sides the same way.',
      'loose is true and strict is false. Both sides of the loose comparison become 0, while strict equality does not convert.',
      'loose is false and strict is true. Strict equality treats every object as equal to its boolean negation.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The loose comparison is true and the strict comparison is false.',
      why: 'An array is an object, and every object is truthy, so the negation ![] is the boolean false. Loose equality converts that boolean to the number 0, then converts the array: valueOf returns the array itself, which is not primitive, so toString produces an empty string. The empty string converts to the number 0, and 0 equals 0, so loose is true. Strict equality does not convert either side, so the array is not strictly equal to false. Both steps are synchronous.',
      wrong: [
        {
          option: 'loose is false and strict is false. An array and a boolean are never equal.',
          reason: 'Refusing to compare different types is exactly what strict equality does, so extending that refusal to == is appealing. == is defined to convert, and this particular conversion succeeds.',
        },
        {
          option: 'loose is true and strict is true. Both operators coerce the two sides the same way.',
          reason: 'Once the loose result is known to be true, it is tempting to think === is a stricter spelling of the same algorithm. === skips conversion, so different types make it false.',
        },
        {
          option: 'loose is false and strict is true. Strict equality treats every object as equal to its boolean negation.',
          reason: 'The operators are easy to swap when one result is surprising. The surprising true result belongs to ==, and === stays false.',
        },
      ],
      example: { lang: 'js', source: "const loose = [] == ![];\nconst strict = [] === ![];\nconsole.log(![]);\nconsole.log(Number([]));\nconsole.log(Number(false));\nconsole.log(loose, strict);" },
      remember: '[] == ![] is true because both sides become 0. [] === ![] stays false.',
    },
  },
  {
    id: 'js-028',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How should you test for null, given what typeof reports?',
    code: {
      lang: 'js',
      source: "typeof null;",
    },
    options: [
      "typeof null is 'null', so a switch on typeof can separate null from objects.",
      "typeof null is 'undefined'. null and undefined are the same missing value.",
      'typeof null is object, and null instanceof Object is the reliable null test.',
      "typeof null is 'object', which cannot separate null from a real object. Use value === null.",
    ],
    correctIndex: 3,
    explanation: {
      answer: "typeof null is 'object'. The precise test for null is strict equality.",
      why: "typeof is an operator that returns a string naming a broad category, and for historical reasons the category string for null is object. Synchronously, typeof null therefore produces that string, the same string it produces for an ordinary object. null instanceof Object is false, so the typeof string does not mean null has Object.prototype on its chain. Strict equality, written ===, compares without conversion and is true only when the value really is null. No microtask or timer is involved.",
      wrong: [
        {
          option: "typeof null is 'null', so a switch on typeof can separate null from objects.",
          reason: 'The missing category string null would make typeof a complete type test, which is what people expect from the operator. The actual string is object, so a switch cannot isolate null that way.',
        },
        {
          option: "typeof null is 'undefined'. null and undefined are the same missing value.",
          reason: 'Loose equality treats null and undefined as equal, so they feel interchangeable. typeof undefined is the string undefined, while typeof null is object, and they are different values.',
        },
        {
          option: 'typeof null is object, and null instanceof Object is the reliable null test.',
          reason: 'The typeof result really is object, so continuing to an object test feels consistent. instanceof walks the prototype chain, and null has no chain to walk, so that test is false.',
        },
      ],
      example: { lang: 'js', source: "console.log(typeof null);\nconsole.log(typeof {});\nconst value = null;\nconsole.log(value === null);\nconsole.log(null instanceof Object);\nconst box = {};\nconsole.log(box === null);" },
      remember: "typeof null is 'object'. Test null with strict equality.",
    },
  },
  {
    id: 'js-029',
    tech: 'javascript',
    topic: 'equality',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What are a, b, c, and d?',
    code: {
      lang: 'js',
      source: "const a = NaN === NaN;\nconst b = Object.is(NaN, NaN);\nconst c = Object.is(+0, -0);\nconst d = +0 === -0;",
    },
    options: [
      'a is false, b is true, c is false, and d is true.',
      'a is false, b is false, c is false, and d is false. NaN and the signed zeros never count as equal.',
      'a is true, b is true, c is true, and d is true. Object.is and === use the same rules.',
      'a is false, b is true, c is true, and d is false. Object.is treats both NaN and the two zeros as equal.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'a is false, b is true, c is false, and d is true.',
      why: 'Strict equality uses a rule where NaN is not equal to anything, including itself, so a is false. Object.is is a different comparison with exactly two deliberate disagreements: NaN matches NaN, and positive 0 does not match negative 0. Those disagreements make b true and c false. The strict comparison of the two zeros is true, which is the familiar rule that the sign of zero does not matter to ===. All four tests are synchronous.',
      wrong: [
        {
          option: 'a is false, b is false, c is false, and d is false. NaN and the signed zeros never count as equal.',
          reason: 'NaN breaks ordinary equality so thoroughly that it is tempting to say no algorithm treats it as equal. Object.is exists partly to answer the NaN case with true.',
        },
        {
          option: 'a is true, b is true, c is true, and d is true. Object.is and === use the same rules.',
          reason: 'Object.is is easy to remember as a clearer spelling of strict equality. It matches === for ordinary values and differs for NaN and for signed zero.',
        },
        {
          option: 'a is false, b is true, c is true, and d is false. Object.is treats both NaN and the two zeros as equal.',
          reason: 'Once you remember that Object.is fixes NaN, it is natural to assume it also treats the zeros as the same. It does the opposite for zeros: they compare false, while === compares them true.',
        },
      ],
      example: { lang: 'js', source: "const a = NaN === NaN;\nconst b = Object.is(NaN, NaN);\nconst c = Object.is(+0, -0);\nconst d = +0 === -0;\nconsole.log(a, b);\nconsole.log(c, d);" },
      remember: 'Object.is treats NaN as equal to NaN, and it treats +0 and -0 as different. === does the reverse.',
    },
  },
  {
    id: 'js-030',
    tech: 'javascript',
    topic: 'equality',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Which of these loose comparisons are true, and what does that say about transitivity?',
    code: {
      lang: 'js',
      source: "const a = 0 == '0';\nconst b = '' == 0;\nconst c = '' == '0';",
    },
    options: [
      "a, b, and c are all true. == converts everything to a number, and both '' and '0' become 0.",
      "a is true, b is true, and c is false. == relates both '' and '0' to 0 without relating those two strings to each other, so it is not transitive.",
      'a is true, b is false, and c is false. Only a number and a numeric string can be loosely equal.',
      "a is false, b is true, and c is true. An empty string is loosely equal to '0' and is never loosely equal to 0.",
    ],
    correctIndex: 1,
    explanation: {
      answer: "0 == '0' and '' == 0 are true, while '' == '0' is false, so == is not transitive.",
      why: 'A relation is transitive when A related to B and B related to C implies A related to C. Loose equality converts a string to a number when the other side is already a number, so the string 0 becomes 0 and the empty string becomes 0, making a and b true. When both sides are strings, == compares the characters and does not convert them to numbers, so the empty string and the string 0 are different and c is false. The three results are computed synchronously. Because the empty string loosely equals 0 and 0 loosely equals the string 0, but the two strings are not loosely equal, the relation fails transitivity.',
      wrong: [
        {
          option: "a, b, and c are all true. == converts everything to a number, and both '' and '0' become 0.",
          reason: 'Numeric conversion is the famous part of ==, so applying it to every pair feels consistent. Conversion does not run when both values are already strings.',
        },
        {
          option: 'a is true, b is false, and c is false. Only a number and a numeric string can be loosely equal.',
          reason: 'The empty string does not look like a number, so rejecting b is a careful-looking answer. Number of the empty string is 0, which is why b is true.',
        },
        {
          option: "a is false, b is true, and c is true. An empty string is loosely equal to '0' and is never loosely equal to 0.",
          reason: 'String comparison can seem like the default, with numeric conversion as a special case that people under-apply. The number-and-string pairs are the ones that convert, and the two strings do not match.',
        },
      ],
      example: { lang: 'js', source: "const a = 0 == '0';\nconst b = '' == 0;\nconst c = '' == '0';\nconsole.log(a);\nconsole.log(b);\nconsole.log(c);" },
      remember: "0 == '0' and '' == 0 are true, but '' == '0' is false. Loose equality is not transitive.",
    },
  },
  {
    id: 'js-031',
    tech: 'javascript',
    topic: 'equality',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What are a, b, c, and d?',
    code: {
      lang: 'js',
      source: "const a = 0 || 'fallback';\nconst b = 0 ?? 'fallback';\nconst c = '' ?? 'fallback';\nconst d = null ?? 'fallback';",
    },
    options: [
      "a, b, c, and d are all 'fallback'. Both operators treat 0, '', and null as missing.",
      "a is 0, b is 'fallback', c is 'fallback', and d is 'fallback'. ?? replaces 0, while || replaces every falsy value.",
      "a is 'fallback', b is 0, c is '', and d is 'fallback'. || replaces any falsy value, while ?? replaces only null or undefined.",
      "a is 'fallback', b is 0, c is 'fallback', and d is null. ?? replaces an empty string and preserves null.",
    ],
    correctIndex: 2,
    explanation: {
      answer: "a is 'fallback', b is 0, c is the empty string, and d is 'fallback'.",
      why: 'A falsy value is one that a boolean test treats as false: false, 0, the empty string, NaN, null, or undefined. The or operator returns the right side when the left side is falsy, so 0 is replaced by fallback. Nullish coalescing returns the right side only when the left side is null or undefined, so 0 and the empty string are kept and null is replaced. The four expressions run synchronously from top to bottom, and nullish coalescing does not use truthiness.',
      wrong: [
        {
          option: "a, b, c, and d are all 'fallback'. Both operators treat 0, '', and null as missing.",
          reason: '|| is the traditional defaulting operator, and ?? looks like a shorter spelling of it. ?? was added so that 0 and the empty string can survive as real values.',
        },
        {
          option: "a is 0, b is 'fallback', c is 'fallback', and d is 'fallback'. ?? replaces 0, while || replaces every falsy value.",
          reason: 'The two operators are easy to swap if you remember only that they disagree about 0. || is the one that replaces 0, and ?? keeps it.',
        },
        {
          option: "a is 'fallback', b is 0, c is 'fallback', and d is null. ?? replaces an empty string and preserves null.",
          reason: 'The empty string is the oddest falsy value, so it is reasonable to think ?? still treats it as missing while keeping null. The split is nullish versus everything else: the empty string is kept, and null is replaced.',
        },
      ],
      example: { lang: 'js', source: "const a = 0 || 'fallback';\nconst b = 0 ?? 'fallback';\nconst c = '' ?? 'fallback';\nconst d = null ?? 'fallback';\nconsole.log(a);\nconsole.log(b);\nconsole.log(c.length);\nconsole.log(d);" },
      remember: '?? replaces only null and undefined. || also replaces 0 and the empty string.',
    },
  },
  {
    id: 'js-032',
    tech: 'javascript',
    topic: 'equality',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'cityName should return the uppercased city, or undefined when address or city is missing. Why does it throw for some users?',
    code: {
      lang: 'js',
      source: "function cityName(user) {\n  return user.address?.city.toUpperCase();\n}",
    },
    options: [
      'It throws whenever address is null. Optional chaining only allows the read of city, and toUpperCase always runs.',
      "It returns the string 'undefined' when city is missing, because the call is skipped and the missing value is stringified.",
      'It returns undefined both for a null address and for a missing city. One ?. guards every later read and call.',
      'When address is null or undefined, the chain returns undefined and does not read city or call toUpperCase. When address exists but city is missing, it throws, because that ?. does not guard city.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'A nullish address stops the chain and returns undefined. A present address with a missing city still throws.',
      why: 'Optional chaining checks whether its base is nullish, and nullish means null or undefined. If the address is nullish, the rest of that chain is skipped synchronously and the expression is undefined, so city is not read and toUpperCase is not called. If address is an object, the check has already passed, and city is then read normally. A missing city is undefined, and calling toUpperCase on undefined throws a TypeError. No microtask or timer is involved, and a second optional chain before the call guards that missing city as well.',
      wrong: [
        {
          option: 'It throws whenever address is null. Optional chaining only allows the read of city, and toUpperCase always runs.',
          reason: 'The call at the end has no question mark, so it looks unprotected even when address is missing. The later property and call are part of the same chain and are skipped when the base of ?. is nullish.',
        },
        {
          option: "It returns the string 'undefined' when city is missing, because the call is skipped and the missing value is stringified.",
          reason: 'String conversion of undefined is a common accidental result of concatenation. This expression calls a method; it does not concatenate, and a missing city on a real address throws before a value is returned.',
        },
        {
          option: 'It returns undefined both for a null address and for a missing city. One ?. guards every later read and call.',
          reason: 'One marker at the start of a chain feels like it should cover the whole path, which is what short-circuiting suggests. The marker only tests the base it is attached to, and a later missing city is an ordinary property read.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "function cityName(user) {\n  return user.address?.city?.toUpperCase();\n}",
      },
      example: { lang: 'js', source: "function cityName(user) {\n  return user.address?.city?.toUpperCase();\n}\nconsole.log(cityName({ address: { city: 'Paris' } }));\nconsole.log(cityName({ address: null }));\nconsole.log(cityName({ address: {} }));" },
      remember: '?. returns undefined and skips the rest of the chain only when its own base is nullish.',
    },
  },
  {
    id: 'js-033',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Two different objects are used as keys. What does the plain object store, and what does the Map store?',
    code: {
      lang: 'js',
      source: "const left = { id: 1 };\nconst right = { id: 2 };\nconst record = {};\nrecord[left] = 'L';\nrecord[right] = 'R';\nconst map = new Map();\nmap.set(left, 'L');\nmap.set(right, 'R');",
    },
    options: [
      "record[left] is 'R' and the object has one key, the string [object Object]. map.get(left) is 'L' and the map size is 2.",
      "record[left] is 'L' and record[right] is 'R'. Object keys keep object identity, just as Map keys do.",
      "Both containers store 'R' for left. Every object key collapses to one entry in either structure.",
      'Assigning record[right] throws. Objects refuse an object used as a key, while Map allows it.',
    ],
    correctIndex: 0,
    explanation: {
      answer: "The object keeps only 'R' under the string [object Object]. The map keeps both objects and map.get(left) is 'L'.",
      why: 'An ordinary object key is a string or a symbol. When the key expression is a plain object, it is converted by toString, and the default result is the string [object Object]. Both assignments therefore write the same property, and the second write replaces L with R. A Map keeps the key by reference identity instead of converting it, so left and right are different entries and the first value is still L. The steps are synchronous. A custom toString on the key object would change the property name the object used.',
      wrong: [
        {
          option: "record[left] is 'L' and record[right] is 'R'. Object keys keep object identity, just as Map keys do.",
          reason: 'Maps have trained people to expect object keys to stay distinct, and the bracket syntax looks similar. Brackets convert a non-symbol key to a string before the property is chosen.',
        },
        {
          option: "Both containers store 'R' for left. Every object key collapses to one entry in either structure.",
          reason: 'The string conversion is easy to over-apply to every collection once you have been surprised by it. Map was designed so that two objects remain two keys.',
        },
        {
          option: 'Assigning record[right] throws. Objects refuse an object used as a key, while Map allows it.',
          reason: 'A type error would be a friendly result, and WeakMap really does reject a string key. A plain object accepts the value and stringifies it.',
        },
      ],
      example: { lang: 'js', source: "const left = { id: 1 };\nconst right = { id: 2 };\nconst record = {};\nrecord[left] = 'L';\nrecord[right] = 'R';\nconst map = new Map();\nmap.set(left, 'L');\nmap.set(right, 'R');\nconsole.log(record[left], Object.keys(record).length);\nconsole.log(map.get(left), map.size);" },
      remember: 'Object keys are strings or symbols. Map keeps object identity, so two objects do not collide.',
    },
  },
  {
    id: 'js-034',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is nums.size, and which equality rule explains it?',
    code: {
      lang: 'js',
      source: "const nums = new Set([NaN, NaN]);",
    },
    options: [
      'The size is 2. Set uses strict equality, and NaN is not equal to NaN, so both values are stored.',
      'The size is 1. Set uses SameValueZero, which treats NaN as the same value, so the second NaN is not added.',
      'The size is 0. Set rejects NaN and ignores both adds.',
      'It throws. NaN is not a valid Set value.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The size is 1 because Set treats the two NaN values as the same key.',
      why: 'SameValueZero is the equality Set and Map use for keys: it matches NaN with NaN, and it also treats positive 0 and negative 0 as the same value. The constructor adds the first NaN, then sees the second NaN as already present and does not add another entry. Strict equality would have treated them as different, but Set does not use strict equality for this check. The construction is synchronous. This is why a membership test for NaN in a Set can succeed even though NaN === NaN is false.',
      wrong: [
        {
          option: 'The size is 2. Set uses strict equality, and NaN is not equal to NaN, so both values are stored.',
          reason: 'NaN !== NaN is one of the best-known edge cases, so applying it to Set is the senior default. Set deliberately uses a different rule so that NaN can be a usable key.',
        },
        {
          option: 'The size is 0. Set rejects NaN and ignores both adds.',
          reason: 'Invalid numeric values are often dropped by collections and serializers, so a silent skip seems plausible. NaN is a legal element; it is simply deduplicated.',
        },
        {
          option: 'It throws. NaN is not a valid Set value.',
          reason: 'Some typed-array and serialization paths reject values they cannot represent, so a throw sounds strict and safe. Set accepts NaN and stores one entry.',
        },
      ],
      example: { lang: 'js', source: "const nums = new Set([NaN, NaN]);\nconsole.log(nums.size);\nconsole.log(nums.has(NaN));\nconsole.log(NaN === NaN);\nconst zeros = new Set([+0, -0]);\nconsole.log(zeros.size);" },
      remember: 'Set and Map treat NaN as the same key, so a second NaN does not create another entry.',
    },
  },
  {
    id: 'js-035',
    tech: 'javascript',
    topic: 'collections',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'remember is called with a string id. What happens?',
    code: {
      lang: 'js',
      source: "const cache = new WeakMap();\nfunction remember(id, value) {\n  cache.set(id, value);\n  return cache;\n}\nremember('user-1', { name: 'Ada' });",
    },
    options: [
      "It stores the value under the string key 'user-1' and returns the WeakMap.",
      "It wraps the string in a String object and uses that wrapper as the key, so a later lookup with 'user-1' misses.",
      'It throws a TypeError. A string is not an object or a symbol, and those are the only keys a WeakMap accepts.',
      'It throws a TypeError for the string, and it would also throw for a symbol. Only objects are allowed.',
    ],
    correctIndex: 2,
    explanation: {
      answer: "The call throws a TypeError because the string 'user-1' cannot be a WeakMap key.",
      why: 'A WeakMap holds its keys weakly so an entry can disappear when nothing else refers to the key, which is why the key has to be something the garbage collector can track as an object, or a symbol. Synchronously, set checks the key and throws a TypeError for a string before any entry is stored. Symbols are allowed as keys in the language since the 2023 edition, so the older only objects rule is incomplete, but a string is still rejected. No microtask or timer runs. A Map is the collection that accepts string keys.',
      wrong: [
        {
          option: "It stores the value under the string key 'user-1' and returns the WeakMap.",
          reason: 'Map accepts a string here, and WeakMap has the same set method, so the call looks legal. The weak collection rejects the string instead of coercing it into a key.',
        },
        {
          option: "It wraps the string in a String object and uses that wrapper as the key, so a later lookup with 'user-1' misses.",
          reason: 'Property access sometimes boxes primitives, so a hidden String object is a sophisticated guess. WeakMap does not box the string; it throws.',
        },
        {
          option: 'It throws a TypeError for the string, and it would also throw for a symbol. Only objects are allowed.',
          reason: 'The original WeakMap rule really was objects only, and many codebases still teach that. Symbol keys are now valid, while strings still throw.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "const cache = new Map();\nfunction remember(id, value) {\n  cache.set(id, value);\n  return cache;\n}\nremember('user-1', { name: 'Ada' });",
      },
      example: { lang: 'js', source: "const cache = new Map();\nfunction remember(id, value) {\n  cache.set(id, value);\n  return cache;\n}\nremember('user-1', { name: 'Ada' });" },
      remember: 'WeakMap keys are objects or symbols. Use Map when the key is a string.',
    },
  },
  {
    id: 'js-036',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is true of this copy, and what changes if the value graph also contains a function?',
    code: {
      lang: 'js',
      source: "const original = {\n  when: new Date('2020-01-02T00:00:00.000Z'),\n  nested: { n: 1 }\n};\nconst copy = structuredClone(original);",
    },
    options: [
      'copy.when is the same Date object as original.when, and a function in the graph is copied as a function.',
      'copy.when is a string, the nested object is copied, and a function is omitted, matching JSON.stringify.',
      'copy.when is a new Date and nested is a new object, and a function is omitted without an error.',
      'copy.when is a new Date with the same time, and copy.nested is a different object whose n is 1. A function in the graph makes structuredClone throw DataCloneError.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The date and the nested object are deep-copied. A function makes structuredClone throw DataCloneError.',
      why: 'structuredClone uses the structured clone algorithm, a deep copy that understands built-ins such as Date, Map, and Set. Synchronously, it creates a new Date with the same timestamp and a new nested object whose n is 1, so the copies are not the original references. Functions are not cloneable data, and encountering one throws DataCloneError instead of returning a partial copy. No microtask or timer is involved. JSON.stringify is a different tool: it turns a Date into a string and drops function properties rather than throwing.',
      wrong: [
        {
          option: 'copy.when is the same Date object as original.when, and a function in the graph is copied as a function.',
          reason: 'A shallow copy such as Object.assign would keep the same Date, and functions are values you can assign. structuredClone allocates new supported objects and refuses functions.',
        },
        {
          option: 'copy.when is a string, the nested object is copied, and a function is omitted, matching JSON.stringify.',
          reason: 'JSON is the familiar deep copy people reach for, so its date strings and omitted functions get attributed to structuredClone. The clone keeps a real Date and throws on a function.',
        },
        {
          option: 'copy.when is a new Date and nested is a new object, and a function is omitted without an error.',
          reason: 'The successful half of this option matches the date and object behavior, so the silent omission feels like a small extra. Functions are unsupported and abort the clone with DataCloneError.',
        },
      ],
      example: { lang: 'js', source: "const original = {\n  when: new Date('2020-01-02T00:00:00.000Z'),\n  nested: { n: 1 }\n};\nconst copy = structuredClone(original);\nconsole.log(copy.when.getTime() === original.when.getTime());\nconsole.log(copy.when !== original.when);\nconsole.log(copy.nested !== original.nested, copy.nested.n);\ntry {\n  structuredClone({ fn: function () { return 1; } });\n} catch (error) {\n  console.log(error.name);\n}" },
      remember: 'structuredClone deep-copies dates and plain data, and it throws DataCloneError on functions.',
    },
  },
  {
    id: 'js-037',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What strings do these two JSON.stringify calls produce?',
    code: {
      lang: 'js',
      source: "const objText = JSON.stringify({ a: undefined, b: 1 });\nconst arrText = JSON.stringify([1, undefined, , 4]);",
    },
    options: [
      'objText is {"b":1} and arrText is [1,null,null,4]. Undefined object fields are omitted. Array holes and undefined elements become null.',
      'objText is {"a":null,"b":1} and arrText is [1,null,null,4]. Every undefined becomes null, including object fields.',
      'objText is {"b":1} and arrText is [1,null,4]. Holes disappear, while an explicit undefined element becomes null.',
      'objText is {"a":undefined,"b":1} and arrText is [1,undefined,null,4]. JSON writes undefined for fields and elements, and only holes become null.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The object string is {"b":1}. The array string is [1,null,null,4].',
      why: 'JSON has no undefined and no holes, so JSON.stringify has to choose a substitute while it walks the value synchronously. On an object, a field whose value is undefined is omitted, which drops a and keeps b. On an array, both an explicit undefined element and a hole, which is an index with no property, are written as null so the indexes and the length stay put. No microtask or timer is involved. A function field on an object is omitted the same way as undefined, which is separate from the array rule.',
      wrong: [
        {
          option: 'objText is {"a":null,"b":1} and arrText is [1,null,null,4]. Every undefined becomes null, including object fields.',
          reason: 'The array rule really does use null, so using it for object fields looks consistent. Object fields are dropped instead, because JSON objects do not need to preserve a missing key.',
        },
        {
          option: 'objText is {"b":1} and arrText is [1,null,4]. Holes disappear, while an explicit undefined element becomes null.',
          reason: 'Holes and explicit undefined feel different in JavaScript, so giving them different JSON is a careful guess. Both become null, and the hole does not close up.',
        },
        {
          option: 'objText is {"a":undefined,"b":1} and arrText is [1,undefined,null,4]. JSON writes undefined for fields and elements, and only holes become null.',
          reason: 'Preserving the source spelling would make the JSON easier to round-trip, so it is a tempting spec. JSON cannot encode the token undefined, and stringify does not emit it.',
        },
      ],
      example: { lang: 'js', source: "const objText = JSON.stringify({ a: undefined, b: 1 });\nconst arrText = JSON.stringify([1, undefined, , 4]);\nconsole.log(objText);\nconsole.log(arrText);\nconsole.log(objText === '{\"b\":1}');\nconsole.log(arrText === '[1,null,null,4]');" },
      remember: 'JSON.stringify omits undefined object fields and writes null for array holes and undefined elements.',
    },
  },
  {
    id: 'js-038',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What are the contents of nums after sort returns?',
    code: {
      lang: 'js',
      source: "const nums = [10, 2, 1];\nnums.sort();",
    },
    options: [
      'The array is [1, 2, 10]. The default sort compares the numbers as numbers.',
      'The array is [1, 10, 2]. The default compare converts values to strings and orders those strings.',
      'The array stays [10, 2, 1]. sort without a compare function makes a copy and leaves the receiver alone.',
      'The array is [2, 10, 1]. Only the first pair is swapped, because 2 is greater than 10 as a string prefix.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'nums becomes [1, 10, 2] because the default ordering is lexicographic.',
      why: 'The default sort converts each element to a string and compares UTF-16 code units, which is dictionary order rather than numeric order. Synchronously, the strings are 10, 2, and 1. The string 1 comes before the string 10 because it is a matching prefix, and the string 10 comes before the string 2 because the character 1 comes before the character 2. sort also mutates the receiver and returns that same array. No microtask or timer is involved.',
      wrong: [
        {
          option: 'The array is [1, 2, 10]. The default sort compares the numbers as numbers.',
          reason: 'Numeric order is what almost every caller wants from a list of numbers, so it feels like the default. The default compare never subtracts the numbers; it orders their strings.',
        },
        {
          option: 'The array stays [10, 2, 1]. sort without a compare function makes a copy and leaves the receiver alone.',
          reason: 'Newer helpers such as toSorted return a copy, and it is easy to assume sort was updated to match. sort still rearranges the original array.',
        },
        {
          option: 'The array is [2, 10, 1]. Only the first pair is swapped, because 2 is greater than 10 as a string prefix.',
          reason: 'Prefix reasoning is part of string order, so a partial swap sounds like a plausible algorithm. The full string order places 1 first, then 10, then 2.',
        },
      ],
      example: { lang: 'js', source: "const nums = [10, 2, 1];\nnums.sort();\nconsole.log(nums.join(' '));\nconsole.log(String(10) < String(2));\nconst numeric = [10, 2, 1];\nnumeric.sort(function (a, b) { return a - b; });\nconsole.log(numeric.join(' '));" },
      remember: 'The default sort is string order, so [10, 2, 1] becomes [1, 10, 2].',
    },
  },
  {
    id: 'js-039',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What are nums and copy after toSorted returns?',
    code: {
      lang: 'js',
      source: "const nums = [10, 2, 1];\nconst copy = nums.toSorted(function (a, b) {\n  return a - b;\n});",
    },
    options: [
      'nums becomes [1, 2, 10] and copy is that same array. toSorted is another name for sort.',
      'nums stays [10, 2, 1] and copy is [1, 10, 2]. toSorted copies the array but still uses string order even with this compare function.',
      'nums stays [10, 2, 1] and copy is a different array [1, 2, 10]. toSorted returns a sorted copy and does not change the receiver.',
      'nums becomes [1, 2, 10] and copy is [10, 2, 1]. toSorted sorts in place and returns the previous contents.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'nums stays [10, 2, 1], and copy is a new array [1, 2, 10].',
      why: 'toSorted is the copying sort added in the 2023 edition: it allocates a new array, sorts that copy, and leaves the receiver untouched. The compare function returns a negative number when a should come first, zero when they are tied, and a positive number otherwise, so a - b is numeric order. Synchronously, that produces 1, then 2, then 10 in the copy, while nums remains 10, 2, 1. No microtask or timer is involved. sort would have mutated nums instead of allocating the copy.',
      wrong: [
        {
          option: 'nums becomes [1, 2, 10] and copy is that same array. toSorted is another name for sort.',
          reason: 'The names differ by only two letters, so an alias is a reasonable memory. toSorted is the non-mutating form, and the return value is a different array.',
        },
        {
          option: 'nums stays [10, 2, 1] and copy is [1, 10, 2]. toSorted copies the array but still uses string order even with this compare function.',
          reason: 'The default sort really is lexicographic, so it is easy to think every sort helper ignores a numeric comparator. A provided compare function replaces the default, and a - b orders the numbers.',
        },
        {
          option: 'nums becomes [1, 2, 10] and copy is [10, 2, 1]. toSorted sorts in place and returns the previous contents.',
          reason: 'Some APIs mutate and also hand back the old data so you can undo, which would match this shape. toSorted does not mutate, and the new array is the sorted one.',
        },
      ],
      example: { lang: 'js', source: "const nums = [10, 2, 1];\nconst copy = nums.toSorted(function (a, b) {\n  return a - b;\n});\nconsole.log(nums.join(' '));\nconsole.log(copy.join(' '));\nconsole.log(copy !== nums);" },
      remember: 'sort mutates the array. toSorted returns a sorted copy and leaves the original in place.',
    },
  },
  {
    id: 'js-040',
    tech: 'javascript',
    topic: 'collections',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'The array has a hole at index 1. How many times does the callback run, and what is in out?',
    code: {
      lang: 'js',
      source: "const calls = [];\nconst out = [1, , 3].map(function (x, i) {\n  calls.push(i);\n  return x * 2;\n});",
    },
    options: [
      'The callback runs three times, calls is [0, 1, 2], and out is [2, NaN, 6] because the hole is read as undefined.',
      'The callback runs three times and out is [2, empty, 6]. map visits every index, and the hole is copied after the callback returns undefined.',
      'The callback runs twice and out is [2, 6]. map drops holes and shortens the array.',
      'The callback runs twice, at indexes 0 and 2. out has length 3, out[0] is 2, out[2] is 6, and index 1 is still a hole.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The callback runs for indexes 0 and 2 only, and out keeps a hole at index 1.',
      why: 'A hole is an index below length that has no property, which is different from a present slot holding undefined. Synchronously, map builds a result with the same length and visits only indexes that exist. Index 0 holds 1 and becomes 2, index 1 is skipped so the callback does not run and the result index stays empty, and index 2 holds 3 and becomes 6. No microtask or timer is involved. A present undefined would have been visited and passed to the callback.',
      wrong: [
        {
          option: 'The callback runs three times, calls is [0, 1, 2], and out is [2, NaN, 6] because the hole is read as undefined.',
          reason: 'Most loops from 0 to length visit every index, and undefined times 2 is NaN, so this is the ordinary for-loop result. map checks that the index exists before calling you, and a hole fails that check.',
        },
        {
          option: 'The callback runs three times and out is [2, empty, 6]. map visits every index, and the hole is copied after the callback returns undefined.',
          reason: 'Preserving the hole in the output is right, which makes the rest of the option feel earned. The callback is not invoked for the hole, so calls does not contain 1.',
        },
        {
          option: 'The callback runs twice and out is [2, 6]. map drops holes and shortens the array.',
          reason: 'filter removes holes, and map is easy to group with it as a skipping helper. map keeps the length and leaves the hole in place.',
        },
      ],
      example: { lang: 'js', source: "const calls = [];\nconst out = [1, , 3].map(function (x, i) {\n  calls.push(i);\n  return x * 2;\n});\nconsole.log(calls.join(','));\nconsole.log(out.length);\nconsole.log(1 in out);\nconsole.log(out[0], out[2]);" },
      remember: 'map skips holes and preserves them in the result. It does not treat a hole as undefined.',
    },
  },
  {
    id: 'js-041',
    tech: 'javascript',
    topic: 'collections',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'What happens when sum is called with an empty array?',
    code: {
      lang: 'js',
      source: "function sum(nums) {\n  return nums.reduce(function (total, n) {\n    return total + n;\n  });\n}\nsum([]);",
    },
    options: [
      'sum([]) throws a TypeError. reduce on an empty array needs an initial value, and this call does not pass one.',
      'sum([]) returns 0. reduce uses 0 as the starting total when the array is empty and no initial value is given.',
      'sum([]) returns undefined. The callback runs once with undefined as the total.',
      'sum([]) returns an empty array. There is nothing to add, so the input is returned unchanged.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'sum([]) throws a TypeError because reduce has no initial value and no first element.',
      why: 'Without an initial value, reduce takes the first element as the starting total and begins calling the callback at the second element. An empty array has no first element, so there is no legal starting total and the call throws a TypeError synchronously. Passing 0 as the second argument supplies that total, the callback never runs, and the result is 0. A one-element array with no initial value returns that element and also skips the callback, which is another reason an explicit initial value is the predictable form. No microtask or timer is involved.',
      wrong: [
        {
          option: 'sum([]) returns 0. reduce uses 0 as the starting total when the array is empty and no initial value is given.',
          reason: 'Addition has an identity of 0, so a math library would often choose it. reduce does not guess an identity; the empty call without an initial value throws.',
        },
        {
          option: 'sum([]) returns undefined. The callback runs once with undefined as the total.',
          reason: 'Missing values in JavaScript often show up as undefined, and one callback with a missing total sounds like a soft failure. The engine throws before calling the reducer.',
        },
        {
          option: 'sum([]) returns an empty array. There is nothing to add, so the input is returned unchanged.',
          reason: 'Several array helpers return an empty array when the input is empty, so identity looks plausible. reduce returns an accumulated value, and here it cannot start the accumulation.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "function sum(nums) {\n  return nums.reduce(function (total, n) {\n    return total + n;\n  }, 0);\n}\nsum([]);",
      },
      example: { lang: 'js', source: "function sum(nums) {\n  return nums.reduce(function (total, n) {\n    return total + n;\n  }, 0);\n}\nsum([]);" },
      remember: 'reduce on an empty array throws unless you pass an initial value.',
    },
  },
  {
    id: 'js-042',
    tech: 'javascript',
    topic: 'modules',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'main.js imports count and inc, then calls inc before reading count. What does the importer observe?',
    code: {
      lang: 'js',
      source: "// counter.js\nexport let count = 0;\nexport function inc() {\n  count += 1;\n}\n\n// main.js\nimport { count, inc } from './counter.js';\ninc();\nconsole.log(count);",
    },
    options: [
      'The log prints 0. An import copies the number at the moment the module is linked.',
      'The log prints 1. The imported name is a live binding to the exported let, so it sees the assignment inside inc.',
      'The log throws. An imported binding is sealed, and reading it after the exporter assigns is illegal.',
      'The log prints undefined. Exports stay uninitialized until the importer reloads the page.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The log prints 1 because the import stays connected to the exporter let.',
      why: 'A live binding is an import name that reads the current value of the exported binding rather than a copy made at link time. The modules are instantiated and then evaluated, so count starts at 0 before inc runs. The call inc assigns 1 to that exported let, and the following read in main.js sees 1 through the live connection. Those steps are synchronous module evaluation, not a microtask or a timer. The importer is not allowed to assign to count itself; that restriction is about writing, not about seeing later writes from the exporter.',
      wrong: [
        {
          option: 'The log prints 0. An import copies the number at the moment the module is linked.',
          reason: 'CommonJS and many bundler mental models copy exports, so a snapshot of 0 is the usual expectation. ES module imports of a let stay live.',
        },
        {
          option: 'The log throws. An imported binding is sealed, and reading it after the exporter assigns is illegal.',
          reason: 'Imported names really are read-only from the importer, so any use after a change can look illegal. The ban is on assignment in the importer; reading the updated export is the normal live behavior.',
        },
        {
          option: 'The log prints undefined. Exports stay uninitialized until the importer reloads the page.',
          reason: 'Cyclic imports can observe a binding before initialization, so undefined feels like the module loading story. Both of these modules finish initializing before inc is called, and count is 0 and then 1.',
        },
      ],
      example: { lang: 'js', source: "// counter.js\nexport let count = 0;\nexport function inc() {\n  count += 1;\n}\n\n// main.js\nimport { count, inc } from './counter.js';\ninc();\nconsole.log(count);" },
      remember: 'An ES module import of a let is live: the importer sees later assignments made by the exporter.',
    },
  },
  {
    id: 'js-043',
    tech: 'javascript',
    topic: 'modules',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'These two modules import each other and each reads the other let while initializing. What happens when the cycle is evaluated?',
    code: {
      lang: 'js',
      source: "// a.js\nimport { fromB } from './b.js';\nexport let fromA = fromB + 1;\n\n// b.js\nimport { fromA } from './a.js';\nexport let fromB = fromA + 1;",
    },
    options: [
      'Both modules finish. fromA is 2 and fromB is 1, because the cycle uses the final values.',
      'Both modules finish. fromA and fromB are undefined, because a cycle publishes each let early.',
      'Evaluation throws a ReferenceError. b.js reads fromA while a.js is still waiting, so fromA is in the temporal dead zone.',
      'Evaluation throws a SyntaxError. ES modules forbid import cycles.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Evaluation throws a ReferenceError because fromA is read before its initializer runs.',
      why: 'The temporal dead zone is the period after a let or const binding has been created and before its initializer has run, when any read throws ReferenceError. Module instantiation links the imports first, then evaluation runs the bodies. Evaluating a.js starts b.js before fromA is initialized, and the body of b.js reads fromA immediately. That read is still inside the temporal dead zone, so evaluation throws synchronously. A function that waited until both modules had finished would see the live value; the bug is the top-level read. Cycles themselves are allowed.',
      wrong: [
        {
          option: 'Both modules finish. fromA is 2 and fromB is 1, because the cycle uses the final values.',
          reason: 'Live bindings do expose the final value after initialization, so a finished cycle with numbers is a hopeful outcome. The read happens during initialization, before a final value exists.',
        },
        {
          option: 'Both modules finish. fromA and fromB are undefined, because a cycle publishes each let early.',
          reason: 'var would be visible as undefined if it were read early, and that story gets copied onto let. A let in the temporal dead zone throws instead of yielding undefined.',
        },
        {
          option: 'Evaluation throws a SyntaxError. ES modules forbid import cycles.',
          reason: 'Cycles cause painful bugs, so a hard syntax ban would be a plausible language rule. Cycles are legal, and this one fails later with a reference error because of when the value is read.',
        },
      ],
      fixedCode: {
        lang: 'js',
        source: "// a.js\nimport { getFromB } from './b.js';\nexport let fromA = 1;\nexport function getFromA() {\n  return fromA + getFromB();\n}\n\n// b.js\nimport { fromA } from './a.js';\nexport function getFromB() {\n  return fromA + 1;\n}",
      },
      example: { lang: 'js', source: "// a.js\nimport { getFromB } from './b.js';\nexport let fromA = 1;\nexport function getFromA() {\n  return fromA + getFromB();\n}\n\n// b.js\nimport { fromA } from './a.js';\nexport function getFromB() {\n  return fromA + 1;\n}" },
      remember: 'A circular import can hit the temporal dead zone if you read a let before its initializer runs.',
    },
  },
  {
    id: 'js-044',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does a dynamic import() call return, and when does it run?',
    code: {
      lang: 'js',
      source: "async function load() {\n  const ns = await import('./math.js');\n  return ns.add(1, 2);\n}",
    },
    options: [
      'import() is hoisted like a static import, and the call expression itself is already the namespace object.',
      'import() returns the namespace object synchronously, but only if that module has already been evaluated.',
      'import() returns a promise of the default export only. Named exports are dropped.',
      'import() returns a promise that fulfills with the module namespace object. The call is not hoisted, and the namespace exposes the module exports.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'import() returns a promise of the module namespace, and the call runs where it is written.',
      why: 'A dynamic import is a call that starts loading or looking up a module when that call executes, rather than being moved to the top of the file the way a static import is. Synchronously, the call returns a promise. That promise later fulfills with the module namespace object, whose properties are the exports, so a named export such as add is a property of that object. The await in this function resumes as a microtask when the promise fulfills, and no timer is required by the import syntax itself. The namespace is the same kind of live view a static import uses.',
      wrong: [
        {
          option: 'import() is hoisted like a static import, and the call expression itself is already the namespace object.',
          reason: 'Static imports are hoisted and bound early, so the parentheses can look like a minor spelling change. The parentheses make a real call that returns a promise from that line.',
        },
        {
          option: 'import() returns the namespace object synchronously, but only if that module has already been evaluated.',
          reason: 'A cached module can fulfill quickly, which makes a synchronous return seem like an optimization the spec would allow. The call still returns a promise even when the module is already evaluated.',
        },
        {
          option: 'import() returns a promise of the default export only. Named exports are dropped.',
          reason: 'Many tutorials only await a default function, so the promise payload looks like that one value. The fulfillment value is the namespace, and named exports are properties on it, alongside default when one exists.',
        },
      ],
      example: { lang: 'js', source: "const url = 'data:text/javascript,' + encodeURIComponent('export function add(a, b) { return a + b; }');\nconst pending = import(url);\nconsole.log(pending instanceof Promise);\npending.then(function (ns) {\n  console.log(typeof ns.add);\n  console.log(ns.add(1, 2));\n});" },
      remember: 'import() is asynchronous and fulfills with the module namespace object.',
    },
  },
  {
    id: 'js-045',
    tech: 'javascript',
    topic: 'modules',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'This is the whole body of an ES module. What happens as it evaluates?',
    code: {
      lang: 'js',
      source: "console.log(a);\nconsole.log(b);\nvar a = 1;\nlet b = 2;",
    },
    options: [
      'The first log prints undefined. The second log throws a ReferenceError. var is hoisted and initialized to undefined, while let stays in the temporal dead zone until its line.',
      'Both logs print undefined. let is hoisted and initialized the same way var is.',
      'The first log throws a ReferenceError. var and let are both in the temporal dead zone until their lines.',
      'The logs print 1 and then 2. Module declarations are initialized before any of the body runs.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The first log prints undefined, and the second log throws because b is still in the temporal dead zone.',
      why: 'The temporal dead zone is the span from the start of the scope until the let or const initializer runs, and a read during that span throws ReferenceError. var is also hoisted, but its binding is initialized to undefined, so the first log prints undefined and then the assignment of 1 would run if evaluation got there. let b is uninitialized at the second log, so that read throws synchronously and the assignment of 2 never happens. No microtask or timer is queued. This is ordinary module evaluation from top to bottom after instantiation has created the bindings.',
      wrong: [
        {
          option: 'Both logs print undefined. let is hoisted and initialized the same way var is.',
          reason: 'Hoisting is often taught as one mechanism for every declaration, with undefined as the early value. let is hoisted into the temporal dead zone and is not initialized with undefined.',
        },
        {
          option: 'The first log throws a ReferenceError. var and let are both in the temporal dead zone until their lines.',
          reason: 'The temporal dead zone is the modern rule, so applying it to var sounds strict and consistent. var is specially initialized to undefined, which is why the first log can run.',
        },
        {
          option: 'The logs print 1 and then 2. Module declarations are initialized before any of the body runs.',
          reason: 'Function declarations and module linking do some work before evaluation, so full initialization is a believable extra. The initializers of var and let run when evaluation reaches their lines, and the second line never gets there.',
        },
      ],
      example: { lang: 'js', source: "console.log(a);\ntry {\n  console.log(b);\n} catch (error) {\n  console.log(error.name);\n}\nvar a = 1;\nlet b = 2;" },
      remember: 'let and const are in the temporal dead zone before their line. var is hoisted as undefined.',
    },
  },
  {
    id: 'js-046',
    tech: 'javascript',
    topic: 'modules',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'This is the whole body of an ES module. What do the two typeof checks do?',
    code: {
      lang: 'js',
      source: "console.log(typeof first);\nconsole.log(typeof second);\nfunction first() {\n  return 1;\n}\nconst second = function () {\n  return 2;\n};",
    },
    options: [
      "Both logs print 'function'. Every function value is initialized early, including a const assignment.",
      "The first log prints 'function'. The second log throws a ReferenceError. A function declaration is hoisted and initialized, while a const function expression stays in the temporal dead zone.",
      "The first log prints 'function' and the second prints 'undefined'. const is hoisted like var and holds undefined until the assignment.",
      'Both logs throw a ReferenceError. Nothing in a module body is available before its line.',
    ],
    correctIndex: 1,
    explanation: {
      answer: "typeof first is 'function', and typeof second throws a ReferenceError.",
      why: 'A function declaration is created and initialized for the whole scope before the body evaluates, so the first typeof sees a function and logs that string. const second is in the temporal dead zone until its line, and typeof does not get a special exception for that zone. The second log therefore throws ReferenceError synchronously, and the assignment never runs. No microtask or timer is involved. A var holding a function expression would have been typeof undefined instead of a throw, because var is initialized early.',
      wrong: [
        {
          option: "Both logs print 'function'. Every function value is initialized early, including a const assignment.",
          reason: 'Function declarations really are available early, so extending that privilege to every function expression is natural. The const binding is uninitialized until the assignment line, regardless of what the expression will eventually be.',
        },
        {
          option: "The first log prints 'function' and the second prints 'undefined'. const is hoisted like var and holds undefined until the assignment.",
          reason: 'typeof of an undeclared name returns undefined without throwing, and var would also produce undefined here. A let or const in the temporal dead zone is a different state, and typeof throws for it.',
        },
        {
          option: 'Both logs throw a ReferenceError. Nothing in a module body is available before its line.',
          reason: 'Modules feel strict about order, so a total ban on early access is plausible. Function declarations are initialized during instantiation and can be called from anywhere in the module scope.',
        },
      ],
      example: { lang: 'js', source: "console.log(typeof first);\ntry {\n  console.log(typeof second);\n} catch (error) {\n  console.log(error.name);\n}\nfunction first() {\n  return 1;\n}\nconst second = function () {\n  return 2;\n};" },
      remember: 'A function declaration is hoisted and initialized. A function expression assigned to const is not.',
    },
  },
  {
    id: 'js-047',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What are original, replaced, and reversed after these copying methods return?',
    code: {
      lang: 'js',
      source: "const original = [1, 2, 3];\nconst replaced = original.with(0, 9);\nconst reversed = original.toReversed();",
    },
    options: [
      'original, replaced, and reversed are all [9, 2, 3]. Both methods edit the same array.',
      'original is [3, 2, 1], replaced is [9, 2, 3], and reversed is that same mutated array. Both methods mutate, and toReversed runs last.',
      'original is still [1, 2, 3]. replaced is a new array [9, 2, 3]. reversed is a new array [3, 2, 1].',
      'original is still [1, 2, 3], replaced is [9, 2, 3], and toReversed throws because only reverse exists.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'original stays [1, 2, 3]. replaced is [9, 2, 3] and reversed is [3, 2, 1], each a new array.',
      why: 'with and toReversed are copying array methods from the 2023 edition. Synchronously, with returns a new array whose index 0 is 9 and whose other elements match the original. toReversed then returns another new array in reverse order, 3 then 2 then 1. Neither call writes into original, so it remains 1, 2, 3. No microtask or timer is involved. An out-of-range index passed to with throws RangeError instead of growing the array.',
      wrong: [
        {
          option: 'original, replaced, and reversed are all [9, 2, 3]. Both methods edit the same array.',
          reason: 'Older updates such as assigning an index or calling reverse mutate in place, so shared identity is the habit. These methods allocate new arrays.',
        },
        {
          option: 'original is [3, 2, 1], replaced is [9, 2, 3], and reversed is that same mutated array. Both methods mutate, and toReversed runs last.',
          reason: 'If both methods mutated, the last call would decide the final contents of one array, which is a coherent story. Each call returns a copy and the receiver stays as it started.',
        },
        {
          option: 'original is still [1, 2, 3], replaced is [9, 2, 3], and toReversed throws because only reverse exists.',
          reason: 'reverse is the long-standing method, so a differently named helper can look like a typo. toReversed is the standard copying reverse, and it returns the reversed copy.',
        },
      ],
      example: { lang: 'js', source: "const original = [1, 2, 3];\nconst replaced = original.with(0, 9);\nconst reversed = original.toReversed();\nconsole.log(original.join(' '));\nconsole.log(replaced.join(' '));\nconsole.log(reversed.join(' '));" },
      remember: 'with and toReversed return new arrays. They do not mutate the original.',
    },
  },
  {
    id: 'js-048',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does Object.groupBy return for these three items?',
    code: {
      lang: 'js',
      source: "const grouped = Object.groupBy(\n  [\n    { type: 'a', n: 1 },\n    { type: 'b', n: 2 },\n    { type: 'a', n: 3 }\n  ],\n  function (item) {\n    return item.type;\n  }\n);",
    },
    options: [
      "A Map whose keys are the strings 'a' and 'b'.",
      'The original array, rearranged so the two type a objects come first.',
      'An ordinary object that inherits object methods, with a set to the number 2 and b set to the number 1.',
      'A null-prototype object. Key a is an array of the two original type a objects, in order. Key b is an array of the type b object.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'groupBy returns a null-prototype object whose a and b properties are arrays of the original objects.',
      why: 'Object.groupBy calls the callback once per element and uses each returned value as a property key, gathering matching elements into arrays. Synchronously, the two type a objects land in the a array in their original order, and the type b object lands in the b array. The result is created with a null prototype so a key such as a built-in method name does not collide with an inherited property. The elements are the same objects, not copies. No microtask or timer is involved. Map.groupBy is the variant that returns a Map when the keys themselves need object identity.',
      wrong: [
        {
          option: "A Map whose keys are the strings 'a' and 'b'.",
          reason: 'Grouping often wants arbitrary keys, and Map is the modern collection for that, so it is a fair guess. Object.groupBy returns a null-prototype object; the Map-returning method is Map.groupBy.',
        },
        {
          option: 'The original array, rearranged so the two type a objects come first.',
          reason: 'sort and group are both ways to organize records, so an in-place rearrangement seems possible. groupBy builds a new object of arrays and does not reorder the input as its return value.',
        },
        {
          option: 'An ordinary object that inherits object methods, with a set to the number 2 and b set to the number 1.',
          reason: 'A count per key is what many group helpers in other languages return, and ordinary objects inherit from Object.prototype. This helper returns arrays of items, and the result prototype is null.',
        },
      ],
      example: { lang: 'js', source: "const grouped = Object.groupBy(\n  [\n    { type: 'a', n: 1 },\n    { type: 'b', n: 2 },\n    { type: 'a', n: 3 }\n  ],\n  function (item) {\n    return item.type;\n  }\n);\nconsole.log(Object.getPrototypeOf(grouped) === null);\nconsole.log(grouped.a.length, grouped.a[0].n, grouped.a[1].n);\nconsole.log(grouped.b.length, grouped.b[0].n);" },
      remember: 'Object.groupBy builds a null-prototype object of arrays, grouped by the callback key.',
    },
  },
  {
    id: 'js-049',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What is both, and what is left afterward?',
    code: {
      lang: 'js',
      source: "const left = new Set([1, 2, 3]);\nconst right = new Set([3, 4]);\nconst both = left.intersection(right);",
    },
    options: [
      'both is a new Set containing 3. left still contains 1, 2, and 3.',
      'left is mutated to a Set containing only 3, and both is that same Set.',
      'both is the array [3]. intersection returns a list, not a Set.',
      'It throws a TypeError. Sets have no intersection method, so the values have to be filtered by hand.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'both is a new Set containing 3, and left is unchanged.',
      why: 'intersection is a Set method from the 2025 edition that returns a new Set of values present in both collections. Synchronously, it finds 3, which is the only shared value, and allocates a Set holding that value. left still contains 1, 2, and 3, and right is also unchanged. No microtask or timer is involved. Related methods such as union and difference follow the same copying pattern.',
      wrong: [
        {
          option: 'left is mutated to a Set containing only 3, and both is that same Set.',
          reason: 'sort mutates and returns the receiver, so a set operation that both changes and returns the set fits that older habit. intersection allocates a new Set and leaves the receiver alone.',
        },
        {
          option: 'both is the array [3]. intersection returns a list, not a Set.',
          reason: 'Many set recipes spread a Set into an array before filtering, so an array result looks familiar. The method returns a Set, which can be used with the other set operations.',
        },
        {
          option: 'It throws a TypeError. Sets have no intersection method, so the values have to be filtered by hand.',
          reason: 'For years the standard library really had no set algebra, so a missing-method error matches older runtimes. Current JavaScript provides intersection and it returns the overlap.',
        },
      ],
      example: { lang: 'js', source: "const left = new Set([1, 2, 3]);\nconst right = new Set([3, 4]);\nconst both = left.intersection(right);\nconsole.log(both.has(3), both.has(1), both.size);\nconsole.log(left.has(1), left.has(2), left.has(3));\nconsole.log(both !== left);" },
      remember: 'Set.prototype.intersection returns a new Set and does not mutate the receiver.',
    },
  },
  {
    id: 'js-050',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What array does this iterator chain produce?',
    code: {
      lang: 'js',
      source: "const values = [10, 20, 30, 40].values().drop(1).take(2).toArray();",
    },
    options: [
      '[10, 20]. drop skips nothing when it is placed before take, so take keeps the first two values.',
      '[20, 30]. drop(1) skips 10, then take(2) keeps the next two values.',
      '[20, 30, 40]. take(2) skips two values, so only the drop changes where the result starts.',
      'It throws. Helper methods live on arrays, and the iterator from values() does not have drop.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The array is [20, 30].',
      why: 'Iterator helpers are methods on iterators, added in the 2025 edition, that return another iterator instead of building an intermediate array. Synchronously, values() produces an iterator over the four numbers, drop(1) skips the first value 10, and take(2) keeps the next two values, 20 and 30. toArray then pulls that iterator into a real array. No microtask or timer is involved. Calling drop on the array itself would throw; Iterator.from is the other way to wrap an iterable before using the same helpers.',
      wrong: [
        {
          option: '[10, 20]. drop skips nothing when it is placed before take, so take keeps the first two values.',
          reason: 'Chain order is easy to reverse when both helpers are about limiting a sequence. drop runs first and removes 10 before take chooses two items.',
        },
        {
          option: '[20, 30, 40]. take(2) skips two values, so only the drop changes where the result starts.',
          reason: 'take can be confused with skip if you read it as take away. take keeps the requested count, and drop is the helper that skips.',
        },
        {
          option: 'It throws. Helper methods live on arrays, and the iterator from values() does not have drop.',
          reason: 'The methods look like array operations, so putting them on the array and not on the iterator is a natural placement. The array itself has no drop; the iterator returned by values() does.',
        },
      ],
      example: { lang: 'js', source: "const values = [10, 20, 30, 40]\n  .values()\n  .drop(1)\n  .take(2)\n  .toArray();\nconsole.log(values.join(', '));\nconsole.log(values.length);" },
      remember: 'Iterator helpers such as drop, take, and toArray run on an iterator, including the one from values() or Iterator.from.',
    },
  },
  {
    id: 'js-051',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does Promise.withResolvers return, and what happens when resolve is called with the string ready?',
    code: {
      lang: 'js',
      source: "const deferred = Promise.withResolvers();\ndeferred.resolve('ready');",
    },
    options: [
      'deferred is an already fulfilled promise of undefined. resolve and reject are not returned.',
      'deferred is an object with promise and resolve only. The promise stays pending because reject was not provided.',
      "deferred is an object with promise, resolve, and reject. promise starts pending, and resolve('ready') fulfills it with 'ready'.",
      'deferred is an object with promise, resolve, and reject, but promise is already fulfilled with undefined before resolve is called.',
    ],
    correctIndex: 2,
    explanation: {
      answer: "withResolvers returns { promise, resolve, reject }, and resolve('ready') fulfills that pending promise with 'ready'.",
      why: 'Promise.withResolvers synchronously returns a plain object whose promise is pending and whose resolve and reject are the exact functions that settle it. Calling resolve with ready fulfills that promise with ready, and any already attached reactions run later as microtasks, the same way they would for a promise created with new Promise. This replaces the older pattern of declaring outer variables and assigning them from inside an executor. A second call to resolve would not change the fulfillment. No timer is involved.',
      wrong: [
        {
          option: 'deferred is an already fulfilled promise of undefined. resolve and reject are not returned.',
          reason: 'Promise.resolve returns a fulfilled promise directly, and the names are easy to blend. withResolvers returns the three-part object, and the promise starts pending.',
        },
        {
          option: 'deferred is an object with promise and resolve only. The promise stays pending because reject was not provided.',
          reason: 'Many hand-rolled deferreds only keep resolve when the caller never plans to fail, so a missing reject seems likely. The returned object includes reject as well, and resolve alone is enough to fulfill.',
        },
        {
          option: 'deferred is an object with promise, resolve, and reject, but promise is already fulfilled with undefined before resolve is called.',
          reason: 'An executor that forgets to call resolve leaves people worried about the opposite bug, an early empty fulfillment. The promise stays pending until the returned resolve or reject is used.',
        },
      ],
      example: { lang: 'js', source: "const deferred = Promise.withResolvers();\nconsole.log('resolve' in deferred, 'reject' in deferred);\nlet state = 'pending';\ndeferred.promise.then(function (value) {\n  state = value;\n  console.log('then', state);\n});\nconsole.log('before', state);\ndeferred.resolve('ready');\nconsole.log('after', state);" },
      remember: 'Promise.withResolvers returns a pending promise plus the resolve and reject functions that settle it.',
    },
  },
  {
    id: 'js-052',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'After the timer callback has run, what is in log? What would change if using were written as const?',
    code: {
      lang: 'js',
      source: "const log = [];\nconst resource = {\n  [Symbol.dispose]: function () {\n    log.push('dispose');\n  }\n};\nfunction run() {\n  using held = resource;\n  queueMicrotask(function () {\n    log.push('micro');\n  });\n  setTimeout(function () {\n    log.push('timer');\n  }, 0);\n  log.push('sync');\n}\nrun();\nlog.push('after-call');",
    },
    options: [
      'sync, micro, dispose, after-call, timer. dispose is a microtask, and a const binding would dispose too.',
      'sync, after-call, micro, timer, dispose. dispose waits for timers, and a const binding would do the same.',
      'sync, dispose, micro, after-call, timer. dispose is synchronous but runs after microtasks that were queued in the block, and const would also dispose.',
      'sync, dispose, after-call, micro, timer. dispose runs synchronously as the block exits, before microtasks and timers. A const binding would not call dispose.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The log is sync, dispose, after-call, micro, timer. const would not call Symbol.dispose.',
      why: 'Synchronously, run queues a microtask, queues a timer, and pushes sync. A using binding registers disposal for the end of its block, and leaving the block calls Symbol.dispose immediately, still on the current stack, before run returns. The caller then pushes after-call. Only after that stack clears does the microtask push micro, and the timer pushes timer after the microtask queue is empty. A const binding stores the object and does not register disposal, so the same block would not push dispose. null or undefined is allowed with using and is skipped.',
      wrong: [
        {
          option: 'sync, micro, dispose, after-call, timer. dispose is a microtask, and a const binding would dispose too.',
          reason: 'Cleanup often gets scheduled with queueMicrotask, so disposal can look like another microtask, and const looks like it holds the same resource. using disposes synchronously on block exit, and const does not dispose at all.',
        },
        {
          option: 'sync, after-call, micro, timer, dispose. dispose waits for timers, and a const binding would do the same.',
          reason: 'Some resource systems dispose on a later turn so stacked work can finish, which would put dispose last. The call happens as the block exits, before the function returns to the caller, and const would skip it.',
        },
        {
          option: 'sync, dispose, micro, after-call, timer. dispose is synchronous but runs after microtasks that were queued in the block, and const would also dispose.',
          reason: 'Putting dispose after the queued microtask matches the rule that microtasks run before the caller continues, which is close but early. The stack has not cleared yet: dispose runs before run returns, and the caller line after-call is still ahead of the microtask. const still would not dispose.',
        },
      ],
      example: { lang: 'js', source: "const log = [];\nconst resource = {\n  [Symbol.dispose]: function () { log.push('dispose'); }\n};\nfunction run() {\n  using held = resource;\n  queueMicrotask(function () { log.push('micro'); });\n  setTimeout(function () {\n    log.push('timer');\n    console.log(log.join(', '));\n  }, 0);\n  log.push('sync');\n}\nrun();\nlog.push('after-call');" },
      remember: 'using calls Symbol.dispose synchronously at block exit. const does not, and that call happens before microtasks and timers.',
    },
  },
  {
    id: 'js-053',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'expert',
    prompt: "A tag function is applied to a template whose static pieces are 'Hi ' and '!', with one interpolated value, the string 'Ada'. There are no escape sequences. What does the tag receive?",
    options: [
      "The first argument is an array of the cooked strings 'Hi ' and '!'. The next argument is 'Ada'. That array also has a raw property holding the same two strings.",
      "One string argument, 'Hi Ada!'. The tag runs only after the template has been fully combined.",
      "The first argument is 'Ada', and the second argument is the array of static strings.",
      "The first argument is an array of three strings: 'Hi ', 'Ada', and '!'. Interpolated values are inserted into the strings array.",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The tag receives cooked strings 'Hi ' and '!', then the value 'Ada'. The raw strings match because nothing was escaped.",
      why: 'A tagged template calls your function with the static pieces separated from the interpolated values, instead of passing one finished string. The first argument is an array of the cooked strings, meaning escapes have already been interpreted, and each interpolated value follows as its own argument. The same array has a raw property, an array of the static pieces as they were written before escape interpretation. This template has no escapes, so cooked and raw both contain Hi followed by a space, then an exclamation mark, and the single value argument is Ada. The call itself is synchronous.',
      wrong: [
        {
          option: "One string argument, 'Hi Ada!'. The tag runs only after the template has been fully combined.",
          reason: 'An ordinary template does produce one string, so a tag looks like a hook that runs after that work. The tag is what receives the pieces, and it may build any return value it wants.',
        },
        {
          option: "The first argument is 'Ada', and the second argument is the array of static strings.",
          reason: 'The interpolated value is the interesting input, so putting it first matches how people read the template. The strings array is always first, and the values follow in order.',
        },
        {
          option: "The first argument is an array of three strings: 'Hi ', 'Ada', and '!'. Interpolated values are inserted into the strings array.",
          reason: 'A single list of parts would be a simpler API, and the value does sit between the two static pieces in the source. The value is passed separately so the tag can tell static text from evaluated data.',
        },
      ],
      example: { lang: 'js', source: "function tag(strings, value) {\n  console.log(strings[0], strings[1]);\n  console.log(strings.raw[0], strings.raw[1]);\n  console.log(value);\n}\n// arguments a tag receives for Hi, Ada, !\nconst strings = ['Hi ', '!'];\nstrings.raw = ['Hi ', '!'];\ntag(strings, 'Ada');" },
      remember: 'A tag receives the cooked strings array, including its raw property, and the interpolated values as separate arguments.',
    },
  },
  {
    id: 'js-054',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What does delete return, and what are obj.a and proto.a afterward?',
    code: {
      lang: 'js',
      source: "const proto = { a: 1 };\nconst obj = Object.create(proto);\nobj.a = 2;\nconst removed = delete obj.a;",
    },
    options: [
      'removed is false, obj.a stays 2, and proto.a stays 1. delete refuses a property that also exists on the prototype.',
      'removed is true, obj.a is then 1, and proto.a stays 1. The own property is removed and the prototype property shows through.',
      'removed is true, obj.a is undefined, and proto.a is undefined. delete removes the name from the whole chain.',
      'removed is true and obj.a stays 2. delete only affects the prototype, not the own property.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'delete returns true, obj.a reads as 1 again, and proto.a stays 1.',
      why: 'delete removes an own property, a property stored on that object, and returns true when the removal works. Synchronously, the assignment created an own a of 2 that shadowed the prototype. delete removes that own property and returns true, so the next read walks to proto and finds 1. The prototype object is not modified. No microtask or timer is involved. In strict mode, deleting a non-configurable own property throws; this property is configurable because ordinary assignment created it.',
      wrong: [
        {
          option: 'removed is false, obj.a stays 2, and proto.a stays 1. delete refuses a property that also exists on the prototype.',
          reason: 'A name that exists in two places looks protected, and delete does return false for some non-configurable properties. An own configurable property is removed even if the prototype has the same name.',
        },
        {
          option: 'removed is true, obj.a is undefined, and proto.a is undefined. delete removes the name from the whole chain.',
          reason: 'Deleting a name sounds global, like removing a binding from every scope that can see it. delete stops at the object you name, so the prototype property remains and becomes visible again.',
        },
        {
          option: 'removed is true and obj.a stays 2. delete only affects the prototype, not the own property.',
          reason: 'People sometimes hope delete will clear an inherited value while leaving a local override. It does the opposite: it can remove the own override and cannot remove the prototype property through obj.',
        },
      ],
      example: { lang: 'js', source: "const proto = { a: 1 };\nconst obj = Object.create(proto);\nobj.a = 2;\nconsole.log(obj.a);\nconst removed = delete obj.a;\nconsole.log(removed, obj.a, proto.a);" },
      remember: 'delete removes an own property and returns true. The property on the prototype stays.',
    },
  },
  {
    id: 'js-055',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'kind comes from the prototype and name is own. What do Object.hasOwn and the in operator say?',
    code: {
      lang: 'js',
      source: "const proto = { kind: 'proto' };\nconst obj = Object.create(proto);\nobj.name = 'Ada';",
    },
    options: [
      "Object.hasOwn is true for both 'kind' and 'name'. It walks the prototype the same way in does.",
      "'kind' in obj is false, and Object.hasOwn(obj, 'name') is true. The in operator only sees own properties.",
      "Object.hasOwn(obj, 'kind') is false, Object.hasOwn(obj, 'name') is true, and both 'kind' in obj and 'name' in obj are true.",
      "Both checks are false for 'kind' and true for 'name'. in and Object.hasOwn skip the prototype.",
    ],
    correctIndex: 2,
    explanation: {
      answer: "hasOwn is false for 'kind' and true for 'name'. The in operator is true for both names.",
      why: 'Object.hasOwn reports whether the object itself stores that key, and it does not follow the internal prototype link. The in operator does walk that link, so an inherited property counts as present. Synchronously, kind is only on proto, so hasOwn is false and in is true. name was assigned on obj, so it is own and both checks are true. No microtask or timer is involved. hasOwn is the reliable form of the older hasOwnProperty call, because that method can be missing or overwritten, including when the prototype is null.',
      wrong: [
        {
          option: "Object.hasOwn is true for both 'kind' and 'name'. It walks the prototype the same way in does.",
          reason: 'The word has in the name sounds like the in operator, so the two checks feel interchangeable. hasOwn is specifically the own-property check and stops at obj.',
        },
        {
          option: "'kind' in obj is false, and Object.hasOwn(obj, 'name') is true. The in operator only sees own properties.",
          reason: 'This swaps the two tools, which is a common slip after learning that in can surprise you. in is the walk, and hasOwn is the own-key test, so kind is visible to in.',
        },
        {
          option: "Both checks are false for 'kind' and true for 'name'. in and Object.hasOwn skip the prototype.",
          reason: 'After a bug caused by inherited properties, it is tempting to believe both modern checks ignore the chain. Only hasOwn ignores it; in still walks.',
        },
      ],
      example: { lang: 'js', source: "const proto = { kind: 'proto' };\nconst obj = Object.create(proto);\nobj.name = 'Ada';\nconsole.log(Object.hasOwn(obj, 'kind'));\nconsole.log(Object.hasOwn(obj, 'name'));\nconsole.log('kind' in obj);\nconsole.log('name' in obj);" },
      remember: 'Object.hasOwn checks only the object itself. The in operator walks the prototype chain.',
    },
  },
] satisfies Question[];
