import type { Question } from '../types';

export const jsConceptsB: Question[] = [
  {
    id: 'js-080',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do ES modules differ from CommonJS?',
    options: [
      'ES modules use static import and export, are strict, and expose live bindings. CommonJS uses require and module.exports and copies exported values.',
      'CommonJS imports are static and live. ES modules load with require and are evaluated lazily on each call.',
      'They are identical except ES modules are allowed only in browsers.',
      'CommonJS cannot export functions. ES modules cannot export objects.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'ES modules have a static import graph, run in strict mode, and share live bindings. CommonJS loads synchronously with require and exports a copy of each value.',
      why: 'import and export must sit at the top level, so tools can see the graph without running the file. The bindings are live: if the exporting module assigns a new value to a named export, importers see that change. Evaluation is asynchronous from the host\'s point of view, and the module runs once. CommonJS require can sit inside a function, so the graph is known only at runtime. module.exports is an object, and a primitive or function placed on it is a copy, not a live link. __dirname and require are CommonJS features and are absent in ES modules unless a bundler or Node option provides a substitute. A default import does not automatically pick up every CommonJS export when the interop layer is incomplete.',
      wrong: [
        {
          option: 'CommonJS imports are static and live. ES modules load with require and are evaluated lazily on each call.',
          reason: 'This swaps the two systems. require is the dynamic CommonJS loader, and ES bindings are the live ones.',
        },
        {
          option: 'They are identical except ES modules are allowed only in browsers.',
          reason: 'The syntax, loading, and binding rules differ. Node loads ES modules as well as browsers.',
        },
        {
          option: 'CommonJS cannot export functions. ES modules cannot export objects.',
          reason: 'Both can export functions and objects. The difference is the module format, not the value types.',
        },
      ],
      example: { lang: 'js', source: "export let count = 1;\nexport function inc() {\n  count += 1;\n}\nimport { count, inc } from './counter.js';\ninc();" },
      remember: 'ES modules are static and live. CommonJS require copies exports.',
    },
  },
  {
    id: 'js-081',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does async/await relate to promises?',
    options: [
      'async/await is syntax over promises. An async function returns a promise, and await pauses that function until the promise settles.',
      'await replaces the event loop and runs the next line on a background thread.',
      'An async function runs its body on a timer and does not return a promise unless you write return Promise.resolve.',
      'try/catch cannot see a rejection from await. You must attach .catch to the async function call only.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'async and await are promise syntax. The function returns a promise, and await waits for another promise without blocking the rest of the program.',
      why: 'Marking a function async makes it return a promise even if you return a plain value. await on a promise suspends that function and lets the caller continue. When the promise fulfills, the function resumes as a microtask with the value. A rejection throws at the await, so try/catch around it handles the failure. If nobody awaits the async call, that rejection becomes an unhandled promise rejection rather than a synchronous exception. The promise executor and the code before the first await still run synchronously. await does not create a thread, and it does not make the work after it run in parallel unless you start several promises before awaiting them.',
      wrong: [
        {
          option: 'await replaces the event loop and runs the next line on a background thread.',
          reason: 'await schedules a resume on the existing microtask queue. JavaScript stays single-threaded here.',
        },
        {
          option: 'An async function runs its body on a timer and does not return a promise unless you write return Promise.resolve.',
          reason: 'The body starts immediately, and the return value is always wrapped in a promise.',
        },
        {
          option: 'try/catch cannot see a rejection from await. You must attach .catch to the async function call only.',
          reason: 'A rejection at await becomes a throw inside the async function, so try/catch works there.',
        },
      ],
      example: { lang: 'js', source: "async function load(id) {\n  try {\n    const response = await fetch('/items/' + id);\n    return await response.json();\n  } catch (error) {\n    return null;\n  }\n}" },
      remember: 'async returns a promise. await resumes after it settles, on the microtask queue.',
    },
  },
  {
    id: 'js-082',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the difference between a shallow copy and a deep copy?',
    options: [
      'A shallow copy duplicates the top level and shares nested objects. A deep copy duplicates nested objects too.',
      'A deep copy shares nested objects. A shallow copy walks the whole graph.',
      'Object spread is a deep copy. structuredClone is shallow.',
      'Both copies break the link to the original top-level object and also freeze it.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Shallow copy makes a new container and reuses the inner objects. Deep copy clones those inner objects as well.',
      why: 'Spread, Object.assign, Array.slice, and Array.from copy the first level. If a property holds an object, both copies point at that same object, so a nested write shows up in both. A deep copy creates new objects all the way down. structuredClone does that and keeps Date, Map, Set, and cycles. JSON.parse(JSON.stringify(value)) is a limited deep copy: it drops functions and undefined, turns Date into a string, and throws on cycles. Neither kind of copy preserves class prototypes in the general case. Copying is also how you avoid mutating a value you do not own.',
      wrong: [
        {
          option: 'A deep copy shares nested objects. A shallow copy walks the whole graph.',
          reason: 'The names mean the opposite. Shallow stops at the first level.',
        },
        {
          option: 'Object spread is a deep copy. structuredClone is shallow.',
          reason: 'Spread is the common shallow copy. structuredClone walks the graph.',
        },
        {
          option: 'Both copies break the link to the original top-level object and also freeze it.',
          reason: 'The top-level reference is new, but freeze is a separate operation, and a shallow copy still shares children.',
        },
      ],
      example: { lang: 'js', source: "const original = { meta: { n: 1 } };\nconst shallow = { ...original };\nshallow.meta.n = 2;\nconst deep = structuredClone(original);\ndeep.meta.n = 3;" },
      remember: 'Spread is shallow. Nested objects stay shared until you deep-copy them.',
    },
  },
  {
    id: 'js-083',
    tech: 'javascript',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the call stack, and how does recursion overflow it?',
    options: [
      'The call stack is the list of running function frames. Unbounded recursion pushes frames until the engine throws a stack overflow.',
      'The call stack is the timer queue. Overflow means too many setTimeout calls are waiting.',
      'A stack overflow is a failed promise rejection, and it is caught by Promise.all.',
      'Recursion reuses one frame, so the stack cannot grow.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Each function call pushes a frame. Recursive calls that never return push frames until the engine stops them with a range error.',
      why: 'The call stack tracks the function that is running and the ones waiting for it to return. A call pushes a frame with its local variables. A return pops it. This is synchronous control flow, not the event-loop queue. Recursion calls the same function before the previous call returns, so the stack grows with the depth. A missing base case, or a depth in the tens of thousands, exhausts the limit and throws RangeError. That error happens on the stack that is overflowing, so a try/catch around the first call can catch it, but the work has already failed. An iterative loop uses one frame. Scheduled callbacks do not pile onto the stack at once, because each task starts after the previous stack is empty.',
      wrong: [
        {
          option: 'The call stack is the timer queue. Overflow means too many setTimeout calls are waiting.',
          reason: 'Timers wait in a host queue. The call stack is the active synchronous frames.',
        },
        {
          option: 'A stack overflow is a failed promise rejection, and it is caught by Promise.all.',
          reason: 'It is a RangeError thrown by the engine while pushing frames. Promise combinators do not absorb it unless the throw happens inside a promise.',
        },
        {
          option: 'Recursion reuses one frame, so the stack cannot grow.',
          reason: 'Each call has its own frame. Tail-call reuse is not something you can rely on in JavaScript engines.',
        },
      ],
      example: { lang: 'js', source: "function down(n) {\n  if (n === 0) return 'done';\n  return down(n - 1);\n}\ndown(3);" },
      remember: 'The call stack is active function frames. Recursion without a stop grows it until it throws.',
    },
  },
  {
    id: 'js-084',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How should code test for NaN?',
    options: [
      'Use Number.isNaN(value). value === NaN is always false, and the global isNaN converts the value first.',
      'Use value === NaN. Number.isNaN also returns true for the string "hello".',
      'Use value == null. NaN is null in arithmetic.',
      'typeof NaN is "nan", so a typeof check is enough.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Number.isNaN is the check. NaN is not strictly equal to itself, and global isNaN coerces its argument.',
      why: 'NaN means "not a number," but typeof NaN is "number". It is the result of 0/0 or a failed numeric conversion. The IEEE rule is that NaN compares unequal to every value, including NaN, so both === and == fail as tests. Object.is(NaN, NaN) is true, and Number.isNaN(value) is true only when the value is the NaN number. Global isNaN("hello") is true because it first converts "hello" to NaN. Number.isNaN("hello") is false. Number.isFinite is the usual check when you want a real finite number and want to reject NaN and Infinity together.',
      wrong: [
        {
          option: 'Use value === NaN. Number.isNaN also returns true for the string "hello".',
          reason: 'The strict comparison is always false. The global isNaN coerces, and Number.isNaN does not.',
        },
        {
          option: 'Use value == null. NaN is null in arithmetic.',
          reason: 'NaN is a number value. It is not null or undefined.',
        },
        {
          option: 'typeof NaN is "nan", so a typeof check is enough.',
          reason: 'typeof reports "number", which also matches every ordinary number.',
        },
      ],
      example: { lang: 'js', source: "const value = Number('nope');\nconsole.log(value === NaN);\nconsole.log(Number.isNaN(value));\nconsole.log(Number.isNaN('nope'));" },
      remember: 'Number.isNaN checks for NaN. === never matches it.',
    },
  },
  {
    id: 'js-085',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the Intl API for?',
    options: [
      'It formats numbers, dates, lists, and relative times for a locale without hand-built separators.',
      'It translates JavaScript keywords into another language.',
      'It replaces fetch with a locale-aware HTTP client.',
      'It stores translations in localStorage under one key per language.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Intl formats values according to a locale: numbers, dates, lists, plural rules, and relative time.',
      why: 'Languages differ in decimal separators, currency symbols, date order, and plural forms. Intl.NumberFormat, Intl.DateTimeFormat, Intl.ListFormat, Intl.PluralRules, and Intl.RelativeTimeFormat implement those rules. You pass a locale such as en-GB and options such as style, currency, or timeZone. format returns the string. formatToParts returns the pieces when you need to place them in the UI separately. The API formats values you already have. It does not fetch translations or change the language of your source code. Creating a formatter is more expensive than calling format, so reuse the formatter when you format a list.',
      wrong: [
        {
          option: 'It translates JavaScript keywords into another language.',
          reason: 'The language syntax stays the same. Intl formats data for people reading the page.',
        },
        {
          option: 'It replaces fetch with a locale-aware HTTP client.',
          reason: 'Network calls are unchanged. Intl is a formatting library built into the engine.',
        },
        {
          option: 'It stores translations in localStorage under one key per language.',
          reason: 'It does not persist anything. Message catalogs are a separate i18n concern.',
        },
      ],
      example: { lang: 'js', source: "const price = new Intl.NumberFormat('en-GB', {\n  style: 'currency',\n  currency: 'GBP',\n}).format(12.5);\nconst day = new Intl.DateTimeFormat('en-GB', {\n  dateStyle: 'medium',\n  timeZone: 'UTC',\n}).format(new Date('2024-01-02T00:00:00Z'));" },
      remember: 'Intl formats numbers, dates, and related text for a locale.',
    },
  },
  {
    id: 'js-086',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do call, apply, and bind differ?',
    options: [
      'call and apply invoke the function now, with arguments listed or in an array. bind returns a new function whose this is fixed.',
      'bind invokes the function now. call returns a new function and ignores this.',
      'apply fixes this and does not call the function. call is only for constructors.',
      'All three return a new function and none of them can pass arguments.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'call and apply run the function immediately. bind returns a function that will use the this you supplied.',
      why: 'fn.call(receiver, a, b) sets this to receiver and passes the arguments one by one. fn.apply(receiver, [a, b]) does the same with an array of arguments. Both run now and return the function\'s result. fn.bind(receiver, a) does not run fn. It returns a function that, when called, uses that receiver and starts with those arguments. A later method call does not override a bound this. Arrow functions ignore all three for this, because they have no this of their own. bind is the usual fix when a method is passed as a callback. Calling a bound function with new ignores the bound this and constructs an object, which is a rare edge.',
      wrong: [
        {
          option: 'bind invokes the function now. call returns a new function and ignores this.',
          reason: 'call runs immediately. bind is the one that returns a function for later.',
        },
        {
          option: 'apply fixes this and does not call the function. call is only for constructors.',
          reason: 'apply runs the function now. Both call and apply work on ordinary functions, not only constructors.',
        },
        {
          option: 'All three return a new function and none of them can pass arguments.',
          reason: 'Only bind returns a function. All three accept arguments.',
        },
      ],
      example: { lang: 'js', source: "function greet(punctuation) {\n  return this.name + punctuation;\n}\ngreet.call({ name: 'Ada' }, '!');\nconst hi = greet.bind({ name: 'Ada' });\nhi('!');" },
      remember: 'call and apply run now. bind returns a function with this fixed.',
    },
  },
  {
    id: 'js-087',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which values are falsy?',
    options: [
      'false, 0, -0, 0n, "", null, undefined, and NaN. Empty arrays and objects are truthy.',
      'false, 0, [], {}, and "0". Everything else is truthy.',
      'Only false and null. 0 and "" are truthy.',
      'Every empty value, including [] and {}, plus the string "false".',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The falsy values are false, 0, -0, 0n, the empty string, null, undefined, and NaN. Other values are truthy.',
      why: 'An if statement, a ternary, and the operators &&, ||, and ?? decide from the value itself, not from a boolean conversion you write. The list of falsy values is short and fixed. [] is truthy, so a check for a missing list should use length. {} is truthy. The string "0" and the string "false" are truthy because they are not empty. document.all is a historical oddity that acts falsy, and ordinary code can ignore it. || returns the first truthy operand, so 0 || 5 is 5. ?? only replaces null and undefined, so 0 ?? 5 is 0. Picking the wrong one drops legitimate zeros.',
      wrong: [
        {
          option: 'false, 0, [], {}, and "0". Everything else is truthy.',
          reason: 'Arrays and objects are truthy, and so is the string "0". The empty string, not a non-empty one, is falsy.',
        },
        {
          option: 'Only false and null. 0 and "" are truthy.',
          reason: '0 and the empty string are both falsy, along with undefined, NaN, and 0n.',
        },
        {
          option: 'Every empty value, including [] and {}, plus the string "false".',
          reason: 'Empty containers are truthy. "false" is a non-empty string, so it is truthy too.',
        },
      ],
      example: { lang: 'js', source: "const samples = [false, 0, '', null, undefined, NaN, [], {}, '0'];\nconst flags = samples.map(Boolean);" },
      remember: 'Falsy means false, 0, -0, 0n, "", null, undefined, and NaN.',
    },
  },
  {
    id: 'js-088',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Does JavaScript pass objects by reference?',
    options: [
      'Arguments are passed by value. For an object, the value is a reference, so mutating the object is visible and reassigning the parameter is not.',
      'Objects are copied on the call, so property writes inside the function stay local.',
      'Reassigning a parameter always updates the caller\'s variable, for both numbers and objects.',
      'Primitives are passed by reference and objects are passed by value.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The parameter receives a copy of the value. That value is a reference when the argument is an object, so both sides share the object.',
      why: 'A primitive parameter is a copy of the number, string, or boolean. Assigning to the parameter does not change the caller. An object argument copies the reference, not the object. Pushing into an array parameter or setting a property changes the same object the caller holds. Assigning a new object to the parameter replaces only the local reference. This is pass-by-value of the reference, which people often shorten to pass-by-reference. The shorter phrase hides the fact that rebinding is local. If the function must not affect the caller, copy the object before changing it.',
      wrong: [
        {
          option: 'Objects are copied on the call, so property writes inside the function stay local.',
          reason: 'There is no automatic clone. Property writes go through the shared reference.',
        },
        {
          option: 'Reassigning a parameter always updates the caller\'s variable, for both numbers and objects.',
          reason: 'The parameter is a new binding. Assignment inside the function never updates the caller\'s binding.',
        },
        {
          option: 'Primitives are passed by reference and objects are passed by value.',
          reason: 'Primitives are copied. Objects share state only because the copied value is a reference.',
        },
      ],
      example: { lang: 'js', source: "function edit(user) {\n  user.name = 'Ada';\n  user = { name: 'Grace' };\n}\nconst person = { name: 'Al' };\nedit(person);" },
      remember: 'The reference is copied. Mutating the object is shared. Rebinding the parameter is not.',
    },
  },
  {
    id: 'js-089',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is type coercion?',
    options: [
      'An automatic conversion from one type to another, used by ==, +, if, and templates. + concatenates when either side is a string.',
      'A TypeScript compile error that JavaScript also throws at runtime for every mixed operation.',
      'A conversion that happens only when you call Number or String, never inside operators.',
      'The rule that objects cannot be used in if statements.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Coercion converts a value so an operator can run. ==, +, if, and template placeholders do it automatically.',
      why: 'JavaScript is dynamically typed, so operators convert operands. == uses abstract equality and will convert a string to a number, which makes "" == 0 true. + is overloaded: if either operand is a string, both become strings and it concatenates, so 1 + "2" is "12". Other arithmetic converts with ToNumber, so "2" * 3 is 6. if converts with ToBoolean. Template literals convert the interpolated value with ToString, and an object becomes "[object Object]" unless it defines toString or Symbol.toPrimitive. Arrays become empty strings in numeric coercion, so [] == 0 is true. Explicit Number(value), String(value), and Boolean(value) make the conversion visible. Relying on the automatic path is a common source of bugs.',
      wrong: [
        {
          option: 'A TypeScript compile error that JavaScript also throws at runtime for every mixed operation.',
          reason: 'JavaScript converts and continues. It does not throw just because types differ.',
        },
        {
          option: 'A conversion that happens only when you call Number or String, never inside operators.',
          reason: 'Those calls are explicit. Operators coerce on their own.',
        },
        {
          option: 'The rule that objects cannot be used in if statements.',
          reason: 'Objects are truthy and are allowed. Coercion is what turns them into true.',
        },
      ],
      example: { lang: 'js', source: "console.log(1 + '2');\nconsole.log('2' * 3);\nconsole.log('' == 0);\nconsole.log([] == 0);" },
      remember: '+ concatenates if either side is a string. == converts before it compares.',
    },
  },
  {
    id: 'js-090',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which values are primitives, and how do they differ from objects?',
    options: [
      'string, number, bigint, boolean, undefined, symbol, and null are primitives. Objects, arrays, and functions are reference values and can be mutated.',
      'string and number are objects. Only null and undefined are primitives.',
      'Arrays are primitives. Functions are primitives. Plain objects are the only reference type.',
      'Primitives are stored on the prototype. Objects are stored on the call stack only.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The primitives are string, number, bigint, boolean, undefined, symbol, and null. Objects are mutable reference values.',
      why: 'A primitive is compared and copied by its value, and the value itself cannot be changed. Methods such as string.toUpperCase work through a temporary wrapper, and they return a new primitive rather than editing the old one. null is a primitive even though typeof null is "object". Objects, including arrays and functions, are references. Two separately created objects with the same contents are not ===. Property changes mutate the one object everyone shares. A function is an object with internal call behavior, which is why it can have properties. Knowing the split tells you when a copy is required and when === means identity rather than deep equality.',
      wrong: [
        {
          option: 'string and number are objects. Only null and undefined are primitives.',
          reason: 'Strings and numbers are primitives. The wrapper objects String and Number are separate and rarely used.',
        },
        {
          option: 'Arrays are primitives. Functions are primitives. Plain objects are the only reference type.',
          reason: 'Arrays and functions are objects. All three are reference values.',
        },
        {
          option: 'Primitives are stored on the prototype. Objects are stored on the call stack only.',
          reason: 'The primitive and object distinction is about value identity, not a storage slot on the prototype.',
        },
      ],
      example: { lang: 'js', source: "const word = 'ada';\nword.toUpperCase();\nconst a = { n: 1 };\nconst b = { n: 1 };\nconsole.log(a === b);" },
      remember: 'Primitives are immutable values. Objects are mutable references.',
    },
  },
  {
    id: 'js-091',
    tech: 'javascript',
    topic: 'scope',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is an IIFE, and why was it used?',
    options: [
      'An immediately invoked function expression runs as soon as it is defined, creating a private scope before modules and block scope existed.',
      'An IIFE is a function declaration that is hoisted and called by the event loop.',
      'An IIFE waits for DOMContentLoaded and then runs once.',
      'An IIFE is the required wrapper around every ES module.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'An IIFE is a function expression that is called immediately. It creates a scope so locals do not become globals.',
      why: 'The pattern wraps a function in parentheses and calls it: (function () { ... })(). The parentheses force an expression, because a bare function declaration cannot be called in place that way. Variables inside stay private. Before let and modules, this was how scripts avoided clashes and how loops captured a value. It also runs once at startup. Modules give file scope, and blocks give let scope, so new code rarely needs an IIFE. An async IIFE still appears when a module or script needs a top-level await in a context that does not allow it. The function runs synchronously at the call, not on a later timer.',
      wrong: [
        {
          option: 'An IIFE is a function declaration that is hoisted and called by the event loop.',
          reason: 'It is an expression, and the call is right there in the source. The event loop is not involved.',
        },
        {
          option: 'An IIFE waits for DOMContentLoaded and then runs once.',
          reason: 'It runs where it is written. Waiting for the document is a listener, not this pattern.',
        },
        {
          option: 'An IIFE is the required wrapper around every ES module.',
          reason: 'Modules have their own scope. No wrapper call is required.',
        },
      ],
      example: { lang: 'js', source: "const counter = (function () {\n  let value = 0;\n  return function () {\n    value += 1;\n    return value;\n  };\n})();" },
      remember: 'An IIFE runs immediately and hides its locals in a function scope.',
    },
  },
  {
    id: 'js-092',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do default parameters, rest, and spread differ?',
    options: [
      'A default fills in undefined. Rest gathers the leftover arguments into an array. Spread expands an iterable or object properties into a new call, array, or object.',
      'Rest expands an array into arguments. Spread gathers leftover object keys. Defaults also replace null.',
      'Defaults run for null and false. Rest and spread are two names for Object.assign.',
      'Spread mutates the source array. Rest copies the function\'s this.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Defaults replace undefined arguments. Rest collects the rest into an array. Spread expands values into a call, array, or object.',
      why: 'A default parameter is used only when the argument is missing or undefined. null, 0, and false are kept, because they were passed. Rest, written ...args, must be the last parameter and builds a real array of the remaining arguments. Spread in a call, fn(...items), passes the items as separate arguments. Spread in an array or object copies that level into a new container. Object spread copies enumerable own properties and is shallow, so nested objects are still shared. Rest and spread look alike and work in opposite directions: rest collects, spread expands.',
      wrong: [
        {
          option: 'Rest expands an array into arguments. Spread gathers leftover object keys. Defaults also replace null.',
          reason: 'Rest and spread are reversed here, and defaults do not replace null.',
        },
        {
          option: 'Defaults run for null and false. Rest and spread are two names for Object.assign.',
          reason: 'null and false stay. Spread can copy properties, but rest is a parameter form, not Object.assign.',
        },
        {
          option: 'Spread mutates the source array. Rest copies the function\'s this.',
          reason: 'Spread reads the source and writes into the new target. Rest does not set this.',
        },
      ],
      example: { lang: 'js', source: "function join(separator = ',', ...parts) {\n  return parts.join(separator);\n}\nconst more = ['c', ...['d']];\njoin('-', 'a', 'b');" },
      remember: 'Defaults fill undefined. Rest gathers. Spread expands.',
    },
  },
  {
    id: 'js-093',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is currying?',
    options: [
      'Currying turns a function of several arguments into a chain of one-argument functions, such as add(1)(2).',
      'Currying runs a function only once and ignores later arguments.',
      'Currying merges two objects and returns the left one.',
      'Currying is the name for catching an error and returning a default.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A curried function takes its arguments one at a time and returns the next function until all arguments are present.',
      why: 'add(a, b) can be rewritten as a function that takes a and returns a function that takes b. add(1) returns that second function, and add(1)(2) produces the sum. Each step can be saved. const increment = add(1) reuses the first argument. Partial application is related and less strict: it fixes some arguments and still accepts the rest in one call, which bind can do. Currying is the one-argument chain. It is useful for building specialized functions, and it is awkward when a function has optional arguments or depends on this. JavaScript does not curry functions automatically.',
      wrong: [
        {
          option: 'Currying runs a function only once and ignores later arguments.',
          reason: 'That is a once helper. Currying changes how arguments are supplied, not how many times the body runs.',
        },
        {
          option: 'Currying merges two objects and returns the left one.',
          reason: 'Merging objects is a copy or assign. It is unrelated to argument chains.',
        },
        {
          option: 'Currying is the name for catching an error and returning a default.',
          reason: 'That is error handling. Currying is a shape of function calls.',
        },
      ],
      example: { lang: 'js', source: "function add(a) {\n  return function (b) {\n    return a + b;\n  };\n}\nconst increment = add(1);\nincrement(2);" },
      remember: 'Currying is f(a, b) rewritten as f(a)(b).',
    },
  },
  {
    id: 'js-094',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the difference between synchronous and asynchronous code?',
    options: [
      'Synchronous code finishes on the current stack before the next line. Asynchronous code schedules work and the current function continues or returns.',
      'Asynchronous code runs on a second JavaScript call stack at the same time as the first line.',
      'Synchronous code uses promises. Asynchronous code is any code inside a for loop.',
      'They differ only in syntax. Both block the page until the function returns.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Synchronous work runs to completion on the stack. Asynchronous work is scheduled and finishes later, through a callback, promise, or await resume.',
      why: 'A normal function call blocks the lines after it until it returns. That is synchronous. fetch, setTimeout, and filesystem calls in Node start an operation and return before the result exists. The result is delivered later as a task or microtask. The page or process can run other JavaScript in between, which is why a long synchronous loop freezes clicks and an awaited fetch does not. Starting two promises before awaiting either lets the operations overlap. The callbacks themselves still run one at a time on the single JavaScript thread. Async does not mean parallel CPU work. A worker is what provides another thread.',
      wrong: [
        {
          option: 'Asynchronous code runs on a second JavaScript call stack at the same time as the first line.',
          reason: 'The main thread has one call stack. Async work is scheduled, then runs later on that same thread.',
        },
        {
          option: 'Synchronous code uses promises. Asynchronous code is any code inside a for loop.',
          reason: 'Promises are a tool for async results. A for loop is synchronous unless the body awaits.',
        },
        {
          option: 'They differ only in syntax. Both block the page until the function returns.',
          reason: 'The scheduling is the difference. Async work is specifically how you avoid blocking until the result is ready.',
        },
      ],
      example: { lang: 'js', source: "console.log('start');\nsetTimeout(() => console.log('later'), 0);\nconsole.log('end');" },
      remember: 'Sync finishes now. Async finishes later, on the same JavaScript thread.',
    },
  },
  {
    id: 'js-095',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a Web Worker, and when is one appropriate?',
    options: [
      'A worker runs JavaScript off the main thread. It cannot touch the DOM, and it is for heavy computation that would otherwise freeze the page.',
      'A worker is a background HTTP cache. It can update the DOM while the main thread is busy.',
      'A worker shares all memory and global variables with the page by default.',
      'Workers replace promises and are required for every fetch.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A Web Worker is a separate thread with its own JavaScript environment. Use it for CPU work, and talk to it with messages because it cannot touch the page.',
      why: 'The main thread runs the UI. A long calculation there blocks input. new Worker(url) starts a script off that thread. The worker has no document or window, so it cannot read layout or change elements. postMessage copies data by structured clone, unless you transfer an ArrayBuffer. The cost of copying a large structure can erase the benefit, so workers fit parsing, image data, and other CPU-heavy jobs more than tiny calculations. Errors stay in the worker unless you handle onerror or message them back. A service worker is a different kind of worker: it intercepts network requests and does not exist to run a long loop.',
      wrong: [
        {
          option: 'A worker is a background HTTP cache. It can update the DOM while the main thread is busy.',
          reason: 'Caching the network is a service worker. A dedicated worker cannot update the DOM.',
        },
        {
          option: 'A worker shares all memory and global variables with the page by default.',
          reason: 'The global scopes are separate. Shared memory requires SharedArrayBuffer, which is opt-in.',
        },
        {
          option: 'Workers replace promises and are required for every fetch.',
          reason: 'fetch is already asynchronous. A worker is an extra thread, not a requirement for I/O.',
        },
      ],
      example: { lang: 'js', source: "const worker = new Worker('hash.js');\nworker.postMessage({ text: 'hello' });\nworker.onmessage = (event) => {\n  console.log(event.data);\n};" },
      remember: 'Workers move CPU work off the main thread. They cannot touch the DOM.',
    },
  },
  {
    id: 'js-096',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do setTimeout and setInterval differ?',
    options: [
      'setTimeout runs the callback once. setInterval keeps scheduling it every delay, and a slow callback can overlap the next tick.',
      'setInterval runs once. setTimeout repeats until clearTimeout.',
      'Both wait until the call stack is idle and then run the callback on a worker.',
      'A delay of 0 runs in the current stack, before the lines after the call.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'setTimeout schedules one callback. setInterval schedules a repeating callback, without waiting for the previous one to finish.',
      why: 'Both return an id you pass to clearTimeout or clearInterval. The delay is a minimum, not a guarantee, because a busy call stack postpones the task. setTimeout does not repeat unless the callback schedules the next timeout. That recursive form waits until the work finishes, then waits the delay, so runs do not overlap. setInterval asks the host to queue the callback on a cadence. If the callback takes longer than the delay, another can be queued behind it, and the runs stack up in time. Neither is a clock: background tabs and load stretch the gaps. A delay of 0 still queues a macrotask, so it runs after the current stack and after microtasks.',
      wrong: [
        {
          option: 'setInterval runs once. setTimeout repeats until clearTimeout.',
          reason: 'The names match the opposite behavior. Timeout is one shot, and interval repeats.',
        },
        {
          option: 'Both wait until the call stack is idle and then run the callback on a worker.',
          reason: 'They queue a task on the same thread. They do not move the callback to a worker.',
        },
        {
          option: 'A delay of 0 runs in the current stack, before the lines after the call.',
          reason: 'The lines after the call run first. The callback is a later task.',
        },
      ],
      example: { lang: 'js', source: "const once = setTimeout(() => console.log('once'), 100);\nconst pulse = setInterval(() => console.log('pulse'), 100);\nclearTimeout(once);\nclearInterval(pulse);" },
      remember: 'setTimeout fires once. setInterval repeats and does not wait for the callback.',
    },
  },
  {
    id: 'js-097',
    tech: 'javascript',
    topic: 'collections',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do for...in, for...of, and forEach differ?',
    options: [
      'for...in visits enumerable keys, including inherited ones. for...of visits values of an iterable. forEach visits array elements and cannot break.',
      'for...of visits object keys. for...in visits Map values. forEach can break with a return.',
      'All three visit only the array\'s own values and all three wait for an awaited callback.',
      'forEach skips defined elements and visits holes. for...of does the opposite.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'for...in enumerates keys. for...of walks an iterable\'s values. forEach calls a function per present element and has no break.',
      why: 'for...in is for object keys. It includes inherited enumerable properties and does not guarantee a useful order for a mixed object, so it is a poor fit for arrays. for...of uses the iterator protocol. Arrays, strings, Map, and Set work, and a plain object does not unless you iterate Object.keys or Object.entries. You can break and continue. forEach is an array method. It skips holes, visits indexes in order, and ignores a return value, so return does not stop the loop. An async callback inside forEach is not awaited. The loop finishes while the promises are still running. Use for...of when you need await or an early exit.',
      wrong: [
        {
          option: 'for...of visits object keys. for...in visits Map values. forEach can break with a return.',
          reason: 'for...of yields values, for...in yields keys, and return inside forEach only returns from the callback.',
        },
        {
          option: 'All three visit only the array\'s own values and all three wait for an awaited callback.',
          reason: 'for...in yields keys and inherited names. None of them automatically awaits, and forEach will not wait at all.',
        },
        {
          option: 'forEach skips defined elements and visits holes. for...of does the opposite.',
          reason: 'forEach skips holes. for...of visits every index of an array, and a hole shows up as undefined.',
        },
      ],
      example: { lang: 'js', source: "const items = ['a', 'b'];\nfor (const index in items) console.log(index);\nfor (const value of items) console.log(value);\nitems.forEach((value) => console.log(value));" },
      remember: 'in is keys, of is values, forEach cannot break or await.',
    },
  },
  {
    id: 'js-098',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does array and object destructuring do?',
    options: [
      'It unpacks array positions or object properties into variables, with renaming, defaults, and rest.',
      'It deep-clones the source and freezes the new variables.',
      'It only works on JSON strings, after an automatic JSON.parse.',
      'Missing properties throw ReferenceError before a default can apply.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Destructuring assigns pieces of an array or object to variables. You can rename, default a missing value, and collect the rest.',
      why: 'const [first, second] = items takes positions. const { name, age } = user takes properties. A missing value is undefined, and = default replaces undefined, not null. Renaming is { name: userName }. Rest is ...others and collects what was not named. Nested patterns unpack a property that is itself an object. The source is not copied as a whole and is not frozen. Assigning a destructured object property still shares the nested object. A default parameter and a destructuring default can appear together on a function argument. The pattern fails if the source is null or undefined, because there is nothing to unpack.',
      wrong: [
        {
          option: 'It deep-clones the source and freezes the new variables.',
          reason: 'It binds to the pieces. Nested objects are shared, and nothing is frozen.',
        },
        {
          option: 'It only works on JSON strings, after an automatic JSON.parse.',
          reason: 'The source must already be an array or object. Parsing is a separate call.',
        },
        {
          option: 'Missing properties throw ReferenceError before a default can apply.',
          reason: 'A missing property is undefined, and the default replaces that undefined.',
        },
      ],
      example: { lang: 'js', source: "const [first, ...rest] = ['a', 'b', 'c'];\nconst { name: userName = 'anon', city } = { city: 'London' };" },
      remember: 'Destructuring unpacks positions or properties. Defaults replace undefined.',
    },
  },
  {
    id: 'js-099',
    tech: 'javascript',
    topic: 'collections',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do Map, Set, WeakMap, and WeakSet differ?',
    options: [
      'Map stores key-value pairs in insertion order. Set stores unique values. WeakMap and WeakSet hold objects weakly and cannot be iterated.',
      'WeakMap is a Map that accepts only strings. Set keeps duplicate values.',
      'Map keys must be strings. Object keys are fine in a plain object and nowhere else.',
      'All four can be iterated with for...of, and all four prevent garbage collection of their keys.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Map is an ordered key-value collection. Set stores unique values. WeakMap and WeakSet keep object keys weakly so they can be collected, and they are not enumerable.',
      why: 'A Map can use any value as a key, including objects, and it remembers insertion order. size and for...of work. A plain object turns keys into strings, so a Map is the right store when the key is an object or you need order. A Set ignores values that are already present, using SameValueZero, which treats NaN as equal to NaN. WeakMap and WeakSet accept objects, and current engines also accept non-registered symbols. They do not expose size or iteration, because the entries must be able to disappear. When nothing else references the key, the entry can be collected. That fits private metadata attached to an object you do not own, such as a DOM node cache.',
      wrong: [
        {
          option: 'WeakMap is a Map that accepts only strings. Set keeps duplicate values.',
          reason: 'WeakMap keys are objects or unregistered symbols, not strings. A Set drops duplicates.',
        },
        {
          option: 'Map keys must be strings. Object keys are fine in a plain object and nowhere else.',
          reason: 'Object keys are stringified. Map exists so an object can be a key without that conversion.',
        },
        {
          option: 'All four can be iterated with for...of, and all four prevent garbage collection of their keys.',
          reason: 'The weak collections cannot be iterated, and they do not keep their keys alive.',
        },
      ],
      example: { lang: 'js', source: "const scores = new Map([['ada', 10]]);\nconst seen = new Set([1, 1, 2]);\nconst meta = new WeakMap();\nmeta.set(scores, { saved: true });" },
      remember: 'Map and Set are enumerable. WeakMap and WeakSet let object keys be collected.',
    },
  },
];
