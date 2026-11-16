import type { Question } from '../types';

export const jsConceptsA: Question[] = [
  {
    id: 'js-056',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the difference between == and ===?',
    options: [
      '=== compares without converting types. == converts the values to a common type first, and that conversion makes null == undefined true.',
      '== compares without converting types. === converts both sides to strings before it compares them.',
      'They are the same except === also treats NaN as equal to NaN.',
      '=== is only for objects. == is only for numbers and strings.',
    ],
    correctIndex: 0,
    explanation: {
      answer: '=== checks value and type as they are. == converts operands first, so different types can still compare equal.',
      why: '=== is strict equality. It does not convert a string into a number or a boolean into a number. 1 === "1" is false because the types differ. == is loose equality. It runs a conversion, called coercion, so 1 == "1" and true == 1 are both true. One special case is not a numeric conversion: null == undefined is true, while null === undefined is false. Objects compared with == are converted through ToPrimitive, so the result can surprise you. Neither operator treats NaN as equal to NaN.',
      wrong: [
        {
          option: '== compares without converting types. === converts both sides to strings before it compares them.',
          reason: 'This swaps the two operators. The extra = is the one that refuses conversion.',
        },
        {
          option: 'They are the same except === also treats NaN as equal to NaN.',
          reason: 'NaN is unequal to itself with both operators. Object.is is the check that treats NaN as equal to NaN.',
        },
        {
          option: '=== is only for objects. == is only for numbers and strings.',
          reason: 'Both operators accept any values. The difference is whether a type conversion happens.',
        },
      ],
      example: { lang: 'js', source: "console.log(1 === '1');\nconsole.log(1 == '1');\nconsole.log(null === undefined);\nconsole.log(null == undefined);" },
      remember: '=== does not convert. == converts, and null == undefined is true.',
    },
  },
  {
    id: 'js-057',
    tech: 'javascript',
    topic: 'scope',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do var, let, and const differ, and what is the temporal dead zone?',
    options: [
      'var is function-scoped and starts as undefined. let and const are block-scoped, and reading either before its line throws because that binding is in the temporal dead zone. const also cannot be reassigned.',
      'let and const are function-scoped. var is block-scoped and throws if you read it before its line.',
      'const makes the object frozen. let and var both allow reassignment and are function-scoped.',
      'All three are block-scoped. The temporal dead zone is the time before the script is parsed.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'var is function-scoped and initializes to undefined. let and const are block-scoped and cannot be read before their declaration. const cannot be reassigned.',
      why: 'A binding is the variable slot itself. var creates one function-scoped binding and sets it to undefined at the start of the function, so an early read logs undefined. let and const are limited to the nearest block, such as the inside of an if or for. They are created when the block starts, but they stay uninitialized until the declaration line runs. That gap is the temporal dead zone, and a read there throws ReferenceError. const must be given a value on the declaration line and that binding cannot later be pointed at a new value. A const object can still have its properties changed, because the binding is fixed and the object contents are not frozen.',
      wrong: [
        {
          option: 'let and const are function-scoped. var is block-scoped and throws if you read it before its line.',
          reason: 'This reverses the scoping rules. var ignores block boundaries other than functions, and it does not have a temporal dead zone.',
        },
        {
          option: 'const makes the object frozen. let and var both allow reassignment and are function-scoped.',
          reason: 'const stops a new assignment to the name. Object.freeze is a separate step, and let is block-scoped.',
        },
        {
          option: 'All three are block-scoped. The temporal dead zone is the time before the script is parsed.',
          reason: 'var is not block-scoped. The dead zone is the stretch inside a running block before the let or const line, not a parse-time delay.',
        },
      ],
      example: { lang: 'js', source: "function demo(ok) {\n  if (ok) {\n    console.log(later);\n    var later = 1;\n  }\n  const fixed = { n: 1 };\n  fixed.n = 2;\n  return fixed.n;\n}" },
      remember: 'var is function-scoped. let and const are block-scoped and unreadable before their line.',
    },
  },
  {
    id: 'js-058',
    tech: 'javascript',
    topic: 'scope',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does hoisting do to function declarations, var, and let?',
    options: [
      'A function declaration can be called earlier in its scope. var exists early but is undefined. let exists early too, and reading it before the declaration throws.',
      'Nothing is hoisted. Every name exists only from the line where it is written.',
      'let and const are copied to the top and set to undefined. Function declarations stay on their original line.',
      'Hoisting moves the assignment of every var, let, and const to the top of the file.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Declarations are registered before the code runs. Function declarations are ready to call, var is undefined until its assignment, and let throws if read too early.',
      why: 'Hoisting means the scope records a declaration before it runs the statements. A function declaration is fully created, so a call above it in the same scope works. A var declaration is recorded and set to undefined, while the assignment stays on its original line, so an early read sees undefined. let and const are recorded too, which is why a later declaration still conflicts with an early use, but they are not initialized. Reading one before its line hits the temporal dead zone and throws ReferenceError. A function expression assigned to a var is not a function declaration, so only the var is hoisted and the function value appears at the assignment.',
      wrong: [
        {
          option: 'Nothing is hoisted. Every name exists only from the line where it is written.',
          reason: 'Calls to a function declaration above its source line do work. The scope prepared that function before the line ran.',
        },
        {
          option: 'let and const are copied to the top and set to undefined. Function declarations stay on their original line.',
          reason: 'This swaps the behaviors. let is not initialized with undefined, and a function declaration is callable early.',
        },
        {
          option: 'Hoisting moves the assignment of every var, let, and const to the top of the file.',
          reason: 'Assignments stay where they are written. Only the declaration is prepared, so a var read before its assignment is undefined rather than the assigned value.',
        },
      ],
      example: { lang: 'js', source: "console.log(greet());\nconsole.log(count);\nfunction greet() {\n  return 'hi';\n}\nvar count = 1;" },
      remember: 'Function declarations are ready early. var is undefined early. let throws early.',
    },
  },
  {
    id: 'js-059',
    tech: 'javascript',
    topic: 'closures',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a closure, in practical terms?',
    options: [
      'A function that keeps using the bindings from the scope where it was created, including after that outer function has returned.',
      'A copy of every outer variable, frozen at the moment the inner function was created.',
      'A function that can only be called once, because the outer scope is sealed.',
      'The prototype chain that an object uses to find methods.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A closure is a function that still sees the variable bindings from the place it was created, even after the outer call has finished.',
      why: 'When a function is created inside another function, it keeps a link to that outer environment. A binding is the variable slot, not a photo of the value. If the outer function returns the inner function, those slots stay alive because the inner function can still use them. Later changes to a let or var are visible to the inner function, because it reads the slot at call time. That is how a private counter works: the count variable is not global, and the returned functions are the only way to change it. If you need a frozen value, copy it into a const before creating the function.',
      wrong: [
        {
          option: 'A copy of every outer variable, frozen at the moment the inner function was created.',
          reason: 'A closure keeps the binding. A later assignment to that binding is visible, so the value is not automatically frozen.',
        },
        {
          option: 'A function that can only be called once, because the outer scope is sealed.',
          reason: 'The outer scope stays available for as many calls as you want. Running once is the behavior of a separate once helper.',
        },
        {
          option: 'The prototype chain that an object uses to find methods.',
          reason: 'The prototype chain is how property lookup walks objects. A closure is about a function remembering its surrounding bindings.',
        },
      ],
      example: { lang: 'js', source: "function makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}\nconst next = makeCounter();\nnext();\nnext();" },
      remember: 'A closure keeps the outer bindings alive and reads them when it runs.',
    },
  },
  {
    id: 'js-060',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A script queues a promise callback and a setTimeout of 0. Which runs first, and why?',
    options: [
      'The timer runs first because 0 ms means immediately, before any promise.',
      'The promise callback runs first. Promise callbacks are microtasks, and they drain before the next timer macrotask.',
      'They run together on the same turn of the call stack.',
      'The timer runs first in browsers, and the promise runs first in every other host.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The promise callback runs before the timer. Microtasks are drained before the event loop takes the next macrotask.',
      why: 'The call stack runs the synchronous script first. Promise.then and queueMicrotask schedule microtasks, which are small jobs that run after the current stack empties and before the event loop moves on. setTimeout schedules a macrotask, also called a task, even when the delay is 0. A delay of 0 means "after the current work and after waiting for the timer queue," not "before promises." Once the script finishes, the engine drains the microtask queue, including promise callbacks added by those microtasks, and only then runs the timer. Rendering in a browser gets a chance between tasks, not in the middle of the microtask drain.',
      wrong: [
        {
          option: 'The timer runs first because 0 ms means immediately, before any promise.',
          reason: 'Zero only means the timer is due. It still waits behind the current stack and the microtask queue.',
        },
        {
          option: 'They run together on the same turn of the call stack.',
          reason: 'Both callbacks are scheduled, so neither runs inside the current stack. They run later, and in a fixed order.',
        },
        {
          option: 'The timer runs first in browsers, and the promise runs first in every other host.',
          reason: 'Browsers and Node both run promise microtasks before timer callbacks. Hosts differ in their task queues, not in this ordering.',
        },
      ],
      example: { lang: 'js', source: "setTimeout(function () {\n  console.log('timer');\n}, 0);\nPromise.resolve().then(function () {\n  console.log('promise');\n});\nconsole.log('sync');" },
      remember: 'Sync code finishes, then promise microtasks, then timer macrotasks.',
    },
  },
  {
    id: 'js-061',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What decides this inside an ordinary function?',
    options: [
      'The place where the function was written always supplies this.',
      'new binds this to the new object. Otherwise call, apply, or bind win, then a method call uses the receiver, and a plain call is undefined in strict mode.',
      'this is always the object the function sits on in the source file.',
      'A plain call uses the global object in strict mode and undefined in sloppy mode.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Ordinary functions take this from the call. new wins, then an explicit bind, then the receiver of a method call, then undefined in strict mode.',
      why: 'this is not a local variable captured at definition time for a normal function. The call site chooses it. new constructs an object and binds this to that object. call, apply, and a function produced by bind supply this explicitly, and bind takes priority over a later method call. A call of the form obj.method() sets this to obj. Taking the method out and calling it as a bare function drops that receiver. In strict mode a bare call sets this to undefined. In non-strict mode it falls back to the global object. Arrow functions are the exception: they do not have their own this and keep the surrounding one.',
      wrong: [
        {
          option: 'The place where the function was written always supplies this.',
          reason: 'That is lexical this, which arrow functions use. An ordinary function is rebound by the call.',
        },
        {
          option: 'this is always the object the function sits on in the source file.',
          reason: 'Where the function is stored does not matter until it is called. Passing it as a callback loses the object in front of the dot.',
        },
        {
          option: 'A plain call uses the global object in strict mode and undefined in sloppy mode.',
          reason: 'This is the reverse of the mode rule. Strict mode uses undefined so accidental globals are easier to spot.',
        },
      ],
      example: { lang: 'js', source: "'use strict';\nfunction show() {\n  return this;\n}\nconst obj = { show };\nobj.show();\nshow();\nshow.call({ name: 'Ada' });" },
      remember: 'new, then bind, then the receiver, then undefined in strict mode.',
    },
  },
  {
    id: 'js-062',
    tech: 'javascript',
    topic: 'prototypes',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does prototypal inheritance find a property?',
    options: [
      'The object copies every property from its parent when it is created, so later parent changes are invisible.',
      'Missing properties are looked up on the internal prototype link, then on that object\'s prototype, until null.',
      'Only objects created with class have a prototype. Object.create objects do not.',
      'The search checks the constructor function\'s own properties and skips the prototype object.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'If an object lacks a property, lookup follows its [[Prototype]] link and continues until the chain ends at null.',
      why: 'Every ordinary object has an internal prototype link. Object.getPrototypeOf reads it, and Object.create(parent) sets it. A read of obj.color checks obj first. If the property is missing, the engine checks the parent, then the grandparent. Object.prototype usually sits near the end, and its prototype is null, which stops the walk. Writing a property creates it on the object itself and hides the inherited one. class and new are syntax over this same link: the instance\'s prototype is Constructor.prototype. Methods live once on that shared object, not as copies on every instance. instanceof walks the same chain.',
      wrong: [
        {
          option: 'The object copies every property from its parent when it is created, so later parent changes are invisible.',
          reason: 'That would be a copy. Prototype lookup is live, so a method added to the prototype is visible to existing instances.',
        },
        {
          option: 'Only objects created with class have a prototype. Object.create objects do not.',
          reason: 'class uses the prototype link. Object.create, Object.setPrototypeOf, and constructor functions use it too.',
        },
        {
          option: 'The search checks the constructor function\'s own properties and skips the prototype object.',
          reason: 'Methods belong on Constructor.prototype. Properties of the constructor function itself are not the instance lookup path.',
        },
      ],
      example: { lang: 'js', source: "const parent = { color: 'blue' };\nconst child = Object.create(parent);\nconsole.log(child.color);\nchild.color = 'red';\nconsole.log(child.color, parent.color);" },
      remember: 'Property lookup walks the prototype link. Assignment writes the object itself.',
    },
  },
  {
    id: 'js-063',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a higher-order function?',
    options: [
      'A function that takes a function, returns a function, or does both.',
      'A function whose name starts with an uppercase letter.',
      'A function that is stored on a prototype and shared by every instance.',
      'A function that always returns a promise.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A higher-order function is a function that accepts a function as an argument, returns a function, or both.',
      why: 'Functions are values, so one function can receive another. Array map, filter, and reduce are higher-order because each takes a callback and calls it for the items. A helper such as withLogging that returns a new function is higher-order too. This is the usual way to share looping or timing while the caller supplies the specific work. The callback still follows normal this and closure rules. Returning a function is also how decorators, once, memoize, and partial application are built.',
      wrong: [
        {
          option: 'A function whose name starts with an uppercase letter.',
          reason: 'An uppercase name is a convention for constructors. It says nothing about taking or returning functions.',
        },
        {
          option: 'A function that is stored on a prototype and shared by every instance.',
          reason: 'That is a shared method. It is higher-order only if it also takes or returns a function.',
        },
        {
          option: 'A function that always returns a promise.',
          reason: 'Returning a promise makes the function async in result shape. The argument or return value has to be a function for it to be higher-order.',
        },
      ],
      example: { lang: 'js', source: "function twice(fn) {\n  return function (value) {\n    return fn(fn(value));\n  };\n}\nconst addTwo = twice(function (n) {\n  return n + 1;\n});\naddTwo(3);" },
      remember: 'Higher-order means it takes a function, returns a function, or both.',
    },
  },
  {
    id: 'js-064',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Why does immutability matter in JavaScript and React?',
    options: [
      'A new value is created for a change, so callers can use === to see that something changed and old copies stay intact.',
      'Immutable data is required by the language, and any property write throws TypeError.',
      'Immutability makes nested updates faster than mutation in every case.',
      'React re-renders only when a value is frozen with Object.freeze.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Immutability means a change produces a new value. That makes change detection a reference check and keeps older snapshots usable.',
      why: 'JavaScript objects are mutable by default, so a function can change a property and every other holder of that object sees it. An immutable update copies the changed level and reuses the rest, which is called structural sharing when a library does it. The new object is a different reference, so === tells React, a memoized selector, or a cache that the value changed. The previous object is unchanged, which makes undo and pure renders possible. React state updates should be written this way because mutating state in place can skip a render. Object.freeze can enforce it in development, but the pattern is the copy, not the freeze call. Copies have a cost, so the win is predictable updates rather than fewer allocations.',
      wrong: [
        {
          option: 'Immutable data is required by the language, and any property write throws TypeError.',
          reason: 'Ordinary objects can be mutated. A throw happens if the object was frozen or the property is read-only.',
        },
        {
          option: 'Immutability makes nested updates faster than mutation in every case.',
          reason: 'Copying a path allocates. The benefit is safe sharing and reliable change detection, not a guaranteed speed win.',
        },
        {
          option: 'React re-renders only when a value is frozen with Object.freeze.',
          reason: 'React compares state and props. Freeze is a guard, and a render does not depend on it.',
        },
      ],
      example: { lang: 'js', source: "const before = { count: 1 };\nconst after = { ...before, count: before.count + 1 };\nconsole.log(before.count, after.count, before === after);" },
      remember: 'Update by copying. === then means "this value changed."',
    },
  },
  {
    id: 'js-065',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do debouncing and throttling differ?',
    options: [
      'Debounce runs the function once after calls stop for the delay. Throttle runs it at most once per interval while calls continue.',
      'Throttle waits until calls stop. Debounce runs on a fixed interval.',
      'They both ignore every call after the first one for the lifetime of the page.',
      'Debounce is for network requests and throttle is for CPU work, and the timing behavior is the same.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Debounce waits for a quiet period. Throttle allows one run per time window while events keep arriving.',
      why: 'Both limit how often a noisy source, such as typing or scrolling, runs expensive work. A debounce timer resets on every call. The function runs after the delay has passed with no new call, so a search box waits until the user pauses. A throttle records the last run. Further calls during the interval are dropped or postponed, and the function can run again when the interval ends, so a scroll handler can update at a steady pace. Leading and trailing options choose whether the first call, the last call, or both run. Neither changes the result of the function. They only choose when it is invoked.',
      wrong: [
        {
          option: 'Throttle waits until calls stop. Debounce runs on a fixed interval.',
          reason: 'Those definitions are swapped. Debounce is the pause detector, and throttle is the rate cap.',
        },
        {
          option: 'They both ignore every call after the first one for the lifetime of the page.',
          reason: 'That is a once helper. Debounce and throttle both run again on later bursts.',
        },
        {
          option: 'Debounce is for network requests and throttle is for CPU work, and the timing behavior is the same.',
          reason: 'Either tool can wrap either kind of work. The difference is the schedule, not the kind of task.',
        },
      ],
      example: { lang: 'js', source: "function debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}" },
      remember: 'Debounce waits for quiet. Throttle caps the rate.',
    },
  },
  {
    id: 'js-066',
    tech: 'javascript',
    topic: 'scope',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does JavaScript strict mode change?',
    options: [
      'It makes silent failures throw, sets this to undefined in bare calls, and rejects assignments to undeclared names.',
      'It turns every var into a let and enables block scope for var.',
      'It disables the event loop so all work runs on one stack.',
      'It allows assignment to undeclared names and creates them as globals.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Strict mode turns several silent mistakes into errors and stops bare function calls from seeing the global object as this.',
      why: 'Adding "use strict" at the top of a script or function changes a set of legacy behaviors. Assigning to an undeclared name throws ReferenceError instead of creating a global. A plain function call gets this as undefined instead of the global object. Writing a read-only property, deleting a plain variable, or using duplicate parameter names throws. Octal numeric literals are rejected. eval gets its own scope so names it creates do not leak. ES modules and classes are already strict, so a module does not need the directive. Strict mode does not change let scoping, the event loop, or type checking.',
      wrong: [
        {
          option: 'It turns every var into a let and enables block scope for var.',
          reason: 'var stays function-scoped in strict mode. Block scope comes from let and const.',
        },
        {
          option: 'It disables the event loop so all work runs on one stack.',
          reason: 'Timers and promises still schedule work. Strict mode changes language checks, not the host event loop.',
        },
        {
          option: 'It allows assignment to undeclared names and creates them as globals.',
          reason: 'That is the non-strict behavior. Strict mode is what rejects those assignments.',
        },
      ],
      example: { lang: 'js', source: "function demo() {\n  'use strict';\n  function bare() {\n    return this;\n  }\n  return bare();\n}\ndemo();" },
      remember: 'Strict mode throws on silent mistakes and uses undefined for a bare this.',
    },
  },
  {
    id: 'js-067',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does this work inside an arrow function?',
    options: [
      'The arrow function uses this from the surrounding scope, and call, apply, and bind do not replace it.',
      'The arrow function gets a new this on every call, chosen by the receiver before the dot.',
      'Arrow functions set this to the global object in both strict and sloppy mode.',
      'An arrow function copies this when it is created and updates that copy whenever the outer this changes binding method.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'An arrow function has no this of its own. It reads the this of the scope where it was written, and call sites cannot rebind it.',
      why: 'Lexical this means the value comes from the enclosing function or module, the same way a closure reads an outer variable. obj.arrow() does not set this to obj. fn.call(something) and fn.apply(something) pass arguments, but their this argument is ignored. bind also cannot give an arrow a new this. That makes arrows a good fit for callbacks that should keep the surrounding component or class instance. They are a poor fit for object methods that expect this to be the receiver. An arrow also has no arguments object and no prototype, so it cannot be used as a constructor with new.',
      wrong: [
        {
          option: 'The arrow function gets a new this on every call, chosen by the receiver before the dot.',
          reason: 'That is an ordinary method. An arrow ignores the receiver.',
        },
        {
          option: 'Arrow functions set this to the global object in both strict and sloppy mode.',
          reason: 'The surrounding scope decides. Inside a strict function that this is undefined, not the global object.',
        },
        {
          option: 'An arrow function copies this when it is created and updates that copy whenever the outer this changes binding method.',
          reason: 'It does not keep a separate copy that tracks later rebinding. It resolves this in the enclosing environment.',
        },
      ],
      example: { lang: 'js', source: "const obj = {\n  name: 'Ada',\n  wait() {\n    setTimeout(() => {\n      console.log(this.name);\n    }, 0);\n  },\n};\nobj.wait();" },
      remember: 'Arrows keep the surrounding this. call, apply, and bind do not replace it.',
    },
  },
  {
    id: 'js-068',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do null and undefined differ?',
    options: [
      'undefined means a value was never provided. null is an explicit empty value. They are loosely equal and strictly unequal.',
      'They are the same value, and typeof reports object for both.',
      'undefined is an object. null is the missing-property result and typeof reports undefined for it.',
      'null == undefined is false, and a missing property reads as null.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'undefined is the default missing value. null is a value you assign to mean empty. == treats them as equal, and === does not.',
      why: 'A declared variable with no assignment, a missing parameter, and a missing object property all produce undefined. null has to be written, or returned by a host API, as a deliberate empty value. typeof undefined is "undefined". typeof null is "object", which is a long-standing bug and not evidence that null is an object you can add properties to. null == undefined is true, so a loose check treats both as empty. null === undefined is false. JSON.stringify omits undefined object properties and keeps null. Default parameters replace undefined and do not replace null.',
      wrong: [
        {
          option: 'They are the same value, and typeof reports object for both.',
          reason: 'They are different values. Only null has the historical typeof result "object".',
        },
        {
          option: 'undefined is an object. null is the missing-property result and typeof reports undefined for it.',
          reason: 'This swaps both the meaning and the typeof results. Missing properties are undefined.',
        },
        {
          option: 'null == undefined is false, and a missing property reads as null.',
          reason: 'Loose equality is true for this pair. A missing property is undefined unless code assigns null.',
        },
      ],
      example: { lang: 'js', source: "let missing;\nconsole.log(missing, typeof missing);\nconsole.log(typeof null);\nconsole.log(null == undefined, null === undefined);" },
      remember: 'undefined means missing. null means empty on purpose. Only == treats them as equal.',
    },
  },
  {
    id: 'js-069',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a pure function, and what counts as a side effect?',
    options: [
      'A pure function\'s result depends only on its inputs and it changes nothing outside itself. A side effect is a write to outside state, I/O, or the arguments\' contents.',
      'A pure function may change global variables as long as it returns a value.',
      'A pure function is any function that returns a promise.',
      'Side effects are syntax errors. Pure functions are the only functions JavaScript can call.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A pure function returns a result from its inputs alone and does not change outside state. Logging, mutating arguments, and network calls are side effects.',
      why: 'Given the same arguments, a pure function returns the same value every time. It does not read a changing global, the clock, or random input unless those values are passed in. A side effect is something observable besides the return value: assigning a global, pushing into an input array, writing to the DOM, or fetching. Pure functions are easy to test and safe to memoize. React render functions are expected to be pure for this reason. A function can call other pure functions and stay pure. Hiding a mutation inside a helper does not make the caller pure.',
      wrong: [
        {
          option: 'A pure function may change global variables as long as it returns a value.',
          reason: 'Changing a global is a side effect. A return value does not cancel that.',
        },
        {
          option: 'A pure function is any function that returns a promise.',
          reason: 'Async functions often perform I/O. Purity is about inputs and effects, not about the return type.',
        },
        {
          option: 'Side effects are syntax errors. Pure functions are the only functions JavaScript can call.',
          reason: 'Side effects are normal and necessary. The language does not restrict calls to pure functions.',
        },
      ],
      example: { lang: 'js', source: "function add(a, b) {\n  return a + b;\n}\nfunction pushItem(list, item) {\n  list.push(item);\n  return list;\n}" },
      remember: 'Pure means same inputs, same output, and no outside changes.',
    },
  },
  {
    id: 'js-070',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the difference between the DOM and the BOM?',
    options: [
      'The DOM is the document tree. The BOM is the browser objects around it, such as window, navigator, location, history, and screen.',
      'The BOM is the document tree. The DOM is localStorage and cookies.',
      'They are two names for the element tree.',
      'The DOM is available in Node. The BOM is the JavaScript type system.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The DOM is the page structure. The BOM is the browser environment that hosts the page.',
      why: 'The document object model is the tree of nodes: document, elements, text, and attributes. Methods such as querySelector, createElement, and appendChild are DOM APIs. The browser object model is the surrounding host: window, navigator, location, history, and screen. window is the global object in a page and is also the top BOM object, and document hangs off it. Node can parse HTML with a DOM library, but it has no BOM because there is no browser window. Mixing the names matters when you decide what a unit test can touch without a browser.',
      wrong: [
        {
          option: 'The BOM is the document tree. The DOM is localStorage and cookies.',
          reason: 'The document tree is the DOM. Storage and cookies are host APIs, not the document model.',
        },
        {
          option: 'They are two names for the element tree.',
          reason: 'Only the DOM is the element tree. The BOM covers the browser objects outside that tree.',
        },
        {
          option: 'The DOM is available in Node. The BOM is the JavaScript type system.',
          reason: 'Node does not provide a browser document unless you add one. The type system is the language, not the BOM.',
        },
      ],
      example: { lang: 'js', source: "const title = document.querySelector('h1');\nconst path = location.pathname;\nconst browser = navigator.userAgent;\nconsole.log(title, path, browser);" },
      remember: 'DOM is the document. BOM is the browser around it.',
    },
  },
  {
    id: 'js-071',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does event delegation work?',
    options: [
      'One listener on an ancestor handles events from current and future children by reading event.target as they bubble.',
      'The browser copies the parent listener onto every child when the child is created.',
      'Delegation only works during the capture phase, and event.target is always the parent.',
      'Each child must register its own listener. The parent listener never sees child events.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A single ancestor listener handles child events. event.target is the element that started the event, including children added later.',
      why: 'Most UI events bubble from the target up through ancestors. You can listen on a stable parent, such as a list, and inspect event.target to see which item was clicked. Children added after the listener still work, because the listener is not attached to them. event.currentTarget is the parent that owns the listener. A check such as matching a data attribute or closest() finds the row even if the click landed on a nested icon. Delegation cuts listener count and avoids leaks from nodes you forgot to unbind. It depends on bubbling, so an event that does not bubble, or a stopPropagation in between, will not reach the parent.',
      wrong: [
        {
          option: 'The browser copies the parent listener onto every child when the child is created.',
          reason: 'No copy is made. The event travels up to the existing parent listener.',
        },
        {
          option: 'Delegation only works during the capture phase, and event.target is always the parent.',
          reason: 'The usual pattern uses bubbling. event.target stays the origin, and currentTarget is the parent.',
        },
        {
          option: 'Each child must register its own listener. The parent listener never sees child events.',
          reason: 'Bubbling is what lets the parent see them. Per-child listeners are the pattern delegation replaces.',
        },
      ],
      example: { lang: 'js', source: "list.addEventListener('click', function (event) {\n  const row = event.target.closest('[data-id]');\n  if (!row) return;\n  console.log(row.dataset.id);\n});" },
      remember: 'Listen on a stable parent and read event.target as the event bubbles.',
    },
  },
  {
    id: 'js-072',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the order of capturing and bubbling, and how do you listen during capture?',
    options: [
      'The event travels from the window down to the target, then back up. The third argument true, or { capture: true }, listens on the way down.',
      'The event only travels from the target up. Capture is an old name for bubbling.',
      'Capture runs after bubbling. The default addEventListener listens on the way down.',
      'stopPropagation stops the current listener and leaves the rest of that phase running.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The event goes window to target in the capture phase, then target to window in the bubble phase. Capture listeners opt in.',
      why: 'Dispatch has three stages. Capture walks from window through ancestors down to the target. The target phase runs listeners on the target. Bubble walks back up to window. addEventListener(type, fn) listens on bubble for events that bubble. Passing true, or { capture: true }, registers the listener for the way down. event.eventPhase reports the stage. stopPropagation prevents the event from visiting further nodes in either direction. stopImmediatePropagation also skips later listeners on the same node. Some events, such as focus, do not bubble, so a parent bubble listener never sees them. You can still observe them with capture or with focusin.',
      wrong: [
        {
          option: 'The event only travels from the target up. Capture is an old name for bubbling.',
          reason: 'Capture is the downward trip and is a separate phase. Bubbling is the upward trip.',
        },
        {
          option: 'Capture runs after bubbling. The default addEventListener listens on the way down.',
          reason: 'Capture happens first. The default registration is the bubble phase.',
        },
        {
          option: 'stopPropagation stops the current listener and leaves the rest of that phase running.',
          reason: 'The current listener finishes. Propagation control stops the event from continuing to other nodes.',
        },
      ],
      example: { lang: 'js', source: "parent.addEventListener('click', () => console.log('down'), true);\nparent.addEventListener('click', () => console.log('up'));\nchild.addEventListener('click', () => console.log('target'));" },
      remember: 'Capture goes down, bubble goes up. The default listener is bubble.',
    },
  },
  {
    id: 'js-073',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is CORS, and who enforces it?',
    options: [
      'The browser blocks a page from reading a cross-origin response unless the response allows that origin. The server still receives the request.',
      'The operating system blocks the TCP connection before the request leaves the machine.',
      'CORS stops every cross-origin request, including <img> and <script> tags, from being sent.',
      'A missing Access-Control-Allow-Origin means the server rejected the route with 401.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'CORS is a browser rule. A page may only read a cross-origin response when that response says the page\'s origin is allowed.',
      why: 'An origin is scheme, host, and port. A fetch from https://app.example to https://api.example is cross-origin. The browser sends the request, then hides the body and headers from JavaScript unless the response includes a matching Access-Control-Allow-Origin. A non-simple request, such as JSON content type or a custom header, triggers a preflight OPTIONS call first. The preflight lists the method and headers the later request will use. Credentialed requests, which include cookies, need a specific origin rather than * and Access-Control-Allow-Credentials: true. curl and other non-browser clients do not apply CORS. Images and scripts can load cross-origin, but the page still cannot read their contents without the right CORS headers.',
      wrong: [
        {
          option: 'The operating system blocks the TCP connection before the request leaves the machine.',
          reason: 'The connection is allowed. The browser withholds the response from page script after it arrives.',
        },
        {
          option: 'CORS stops every cross-origin request, including <img> and <script> tags, from being sent.',
          reason: 'Those tags are allowed to make the request. CORS governs whether script can read the response.',
        },
        {
          option: 'A missing Access-Control-Allow-Origin means the server rejected the route with 401.',
          reason: 'The route may have returned 200. The browser turns a missing allow header into a failed read for the page.',
        },
      ],
      example: { lang: 'js', source: "fetch('https://api.example/items', {\n  headers: { 'Content-Type': 'application/json' },\n}).then((response) => response.json());" },
      remember: 'CORS is enforced by the browser when script tries to read a cross-origin response.',
    },
  },
  {
    id: 'js-074',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which description matches GET, PUT, POST, and the status codes 401 and 403?',
    options: [
      'GET reads. PUT replaces a known resource and is safe to repeat. POST runs an action that may not be safe to repeat. 401 means unauthenticated, and 403 means authenticated but not allowed.',
      'POST reads. GET creates. 401 means forbidden, and 403 means the session is missing.',
      'PUT always creates a brand-new URL. Repeating a PUT creates a second copy.',
      '401 and 403 both mean the resource does not exist. 404 means the caller is not logged in.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'GET reads, PUT replaces, and POST submits an action. 401 is for missing authentication, and 403 is for a known caller who is not allowed.',
      why: 'GET is safe and idempotent: repeating it does not change server state. PUT sends a full representation to a URL the client chose, and repeating that same request leaves the resource in the same state. POST sends an action to a collection or process, and repeating it may create a second order or charge. PATCH sends a partial change. DELETE removes, and a second delete should still end with the resource gone. 200 means success, 201 means created, and 204 means success with no body. 400 is a bad request, 404 means not found, 409 is a conflict, and 429 is too many requests. 401 asks the caller to authenticate. 403 means the server knows the caller and refuses the action. 500 is a server fault.',
      wrong: [
        {
          option: 'POST reads. GET creates. 401 means forbidden, and 403 means the session is missing.',
          reason: 'The methods and the two status codes are reversed here. GET is the read, and 401 is the missing-login code.',
        },
        {
          option: 'PUT always creates a brand-new URL. Repeating a PUT creates a second copy.',
          reason: 'PUT targets a specific URL and replaces that resource. Creating an extra item on every call is POST behavior.',
        },
        {
          option: '401 and 403 both mean the resource does not exist. 404 means the caller is not logged in.',
          reason: '404 is the missing resource. 401 and 403 are authentication and authorization.',
        },
      ],
      example: { lang: 'js', source: "await fetch('/articles/10', { method: 'PUT', body: JSON.stringify(article) });\nawait fetch('/articles', { method: 'POST', body: JSON.stringify(article) });" },
      remember: 'GET reads, PUT replaces, POST acts. 401 needs login, 403 is not allowed.',
    },
  },
  {
    id: 'js-075',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do localStorage, sessionStorage, and cookies differ?',
    options: [
      'localStorage lasts until cleared and is per origin. sessionStorage lasts for the tab. Cookies are small, can expire, and are sent to the server.',
      'sessionStorage is shared by every tab. Cookies stay only in JavaScript and are never sent on requests.',
      'localStorage is sent on every HTTP request. Cookies can only be read by server code.',
      'All three hold about the same amount of data and all three are HttpOnly by default.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'localStorage persists per origin. sessionStorage is per tab. Cookies are limited, expiring header values that the browser attaches to matching requests.',
      why: 'localStorage and sessionStorage store strings for an origin, which is scheme, host, and port. The page reads them with getItem, and they are not attached to fetch automatically. localStorage remains after the browser restarts. sessionStorage is separate for each tab and is discarded when that tab closes. Both are synchronous and typically limited to around 5 MB. Cookies are much smaller, often a few kilobytes, and the browser sends matching ones on every request. Expires, Max-Age, Secure, HttpOnly, and SameSite control lifetime and visibility. HttpOnly cookies are invisible to document.cookie, which is why they are preferred for session ids. None of the three is a safe place for secrets that page script must be kept from reading, except an HttpOnly cookie.',
      wrong: [
        {
          option: 'sessionStorage is shared by every tab. Cookies stay only in JavaScript and are never sent on requests.',
          reason: 'sessionStorage is per tab. Cookies exist so the browser can send them to the server.',
        },
        {
          option: 'localStorage is sent on every HTTP request. Cookies can only be read by server code.',
          reason: 'localStorage stays on the client. A cookie without HttpOnly can be read by document.cookie.',
        },
        {
          option: 'All three hold about the same amount of data and all three are HttpOnly by default.',
          reason: 'Storage holds much more than a cookie. HttpOnly applies to cookies and is off unless the server sets it.',
        },
      ],
      example: { lang: 'js', source: "localStorage.setItem('theme', 'dark');\nsessionStorage.setItem('draft', 'hello');\ndocument.cookie = 'seen=1; Secure; SameSite=Lax';" },
      remember: 'localStorage persists. sessionStorage is the tab. Cookies ride on requests.',
    },
  },
  {
    id: 'js-076',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does JSON.stringify drop or reject?',
    options: [
      'It omits undefined and functions in objects, turns array undefined into null, converts Date to a string, and throws on a cycle or a BigInt.',
      'It keeps functions, undefined, and cyclic links by storing them as null.',
      'It preserves Date objects, Map, and class prototypes so the parse result has the same class.',
      'It throws as soon as an object property is undefined.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'JSON.stringify keeps JSON types only. undefined and functions disappear from objects, cycles and BigInt throw, and Dates become strings.',
      why: 'JSON has objects, arrays, strings, numbers, booleans, and null. An object property whose value is undefined, a function, or a symbol is omitted. An array slot with those values becomes null, so holes do not stay holes. Date becomes an ISO string, and JSON.parse does not turn that string back into a Date. Map, Set, and class instances become plain objects or empty objects, and the prototype is lost. A circular reference throws TypeError. BigInt throws because it has no JSON number that is safe for every integer. A toJSON method can choose the value that gets serialized. JSON.parse of untrusted text is safe from script execution, but using the result as an object merge can still be a prototype-pollution bug if you copy __proto__ blindly.',
      wrong: [
        {
          option: 'It keeps functions, undefined, and cyclic links by storing them as null.',
          reason: 'Functions and undefined are dropped from objects, not stored. A cycle throws rather than becoming null.',
        },
        {
          option: 'It preserves Date objects, Map, and class prototypes so the parse result has the same class.',
          reason: 'The result of a later parse is plain data. Dates are strings, and prototypes are not recorded.',
        },
        {
          option: 'It throws as soon as an object property is undefined.',
          reason: 'undefined properties are skipped. The throw is for cycles, BigInt, and some host objects.',
        },
      ],
      example: { lang: 'js', source: "const json = JSON.stringify({\n  name: 'Ada',\n  skip: undefined,\n  when: new Date('2024-01-02T00:00:00Z'),\n});\nJSON.parse(json);" },
      remember: 'JSON keeps plain data. It drops undefined and functions, and it throws on cycles.',
    },
  },
  {
    id: 'js-077',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What are the usual costs of push, shift, index access, and object key lookup?',
    options: [
      'Index access and a typical object or Map lookup are O(1). push is amortized O(1). shift and unshift are O(n) because later items move.',
      'shift is O(1) and push is O(n). Object keys are always an O(n) scan.',
      'Every array method is O(1) because arrays are hash tables.',
      'indexOf is O(1) and includes is O(n).',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Reading by index and a normal property lookup are constant time. Adding at the end is cheap. Adding or removing at the front moves the rest of the array.',
      why: 'Big-O describes how work grows with the number of items, ignoring constants. A JavaScript array gives O(1) access at a numeric index. push adds at the end and occasionally grows the storage, so it is amortized O(1). shift and unshift must renumber every later element, so they are O(n). includes, indexOf, and a linear search are O(n). A plain object or Map averages O(1) for get and set by key, with a worse case that normal code rarely hits. That average depends on hashing, so it is not a promise about order. Sorting is O(n log n). These shapes guide choices such as using a Set for membership instead of includes inside a loop.',
      wrong: [
        {
          option: 'shift is O(1) and push is O(n). Object keys are always an O(n) scan.',
          reason: 'shift is the expensive end. Property lookup is hashed on average, not a walk of every key.',
        },
        {
          option: 'Every array method is O(1) because arrays are hash tables.',
          reason: 'Methods that visit every element, and edits at the front, grow with the length.',
        },
        {
          option: 'indexOf is O(1) and includes is O(n).',
          reason: 'Both scan until they find a match, so both are O(n) in the worst case.',
        },
      ],
      example: { lang: 'js', source: "const items = [1, 2, 3, 4];\nitems.push(5);\nitems.shift();\nconst seen = new Set(items);\nseen.has(3);" },
      remember: 'Index and key lookup are O(1). shift moves every later item.',
    },
  },
  {
    id: 'js-078',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a polyfill, and how is it different from a transpile step?',
    options: [
      'A polyfill supplies a missing runtime API, such as Promise or Array.prototype.flat. A transpile step rewrites newer syntax so an older parser can read it.',
      'A polyfill rewrites arrow functions into function expressions. A transpile step adds missing methods at runtime.',
      'A polyfill is a source map that connects minified lines to the original file.',
      'Polyfills replace the browser event loop with the Node event loop.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A polyfill implements an API the engine lacks. Transpiling rewrites syntax. You need a polyfill when the built-in is missing at runtime.',
      why: 'Older browsers fail in two different ways. New syntax, such as optional chaining, is a parse error, and a compiler such as Babel or the TypeScript emit rewrites it into older syntax. A missing built-in, such as an old browser without Promise or Object.hasOwn, is a runtime gap. A polyfill checks for the feature and installs a JavaScript implementation when it is absent. Loading it before your code is required. Polyfills add bytes, so shipping them only to browsers that need them keeps modern users lighter. A polyfill should match the specified behavior, including edge cases, or it becomes a second source of bugs. It cannot speed up a native API that already exists.',
      wrong: [
        {
          option: 'A polyfill rewrites arrow functions into function expressions. A transpile step adds missing methods at runtime.',
          reason: 'Those jobs are reversed. Syntax rewriting is the compile step, and the runtime patch is the polyfill.',
        },
        {
          option: 'A polyfill is a source map that connects minified lines to the original file.',
          reason: 'That file is a source map. A polyfill is executable code that adds an API.',
        },
        {
          option: 'Polyfills replace the browser event loop with the Node event loop.',
          reason: 'A polyfill adds library-level APIs. It does not swap the host event loop.',
        },
      ],
      example: { lang: 'js', source: "if (!Object.hasOwn) {\n  Object.hasOwn = function (obj, key) {\n    return Object.prototype.hasOwnProperty.call(obj, key);\n  };\n}" },
      remember: 'Polyfill a missing API. Transpile new syntax.',
    },
  },
  {
    id: 'js-079',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does tree-shaking remove, and when does it fail?',
    options: [
      'It drops unused ES module exports. It cannot see through dynamic use, and CommonJS or files marked with side effects are kept.',
      'It removes unused CSS selectors and never looks at JavaScript.',
      'It deletes every function that is not the default export, even if another export is imported.',
      'It runs only in the browser, after the bundle has been downloaded.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Tree-shaking is a bundler pass that omits exports nothing imports. It needs a static import graph and modules without hidden side effects.',
      why: 'ES module import and export are static, so a bundler can tell which exports are used. If a package exports ten functions and the app imports one, the other nine can be left out of the bundle. This is dead-code elimination aimed at the module graph. It fails when the use is invisible: a computed property, eval, or a CommonJS require that builds the exports object at runtime. Packages that run code on import, such as registering a global, must be kept. The package.json sideEffects flag tells the bundler which files are safe to drop entirely. Tree-shaking happens at build time, so it does not shrink a bundle that was already shipped.',
      wrong: [
        {
          option: 'It removes unused CSS selectors and never looks at JavaScript.',
          reason: 'Unused CSS is a different optimization. Tree-shaking refers to unused JavaScript exports.',
        },
        {
          option: 'It deletes every function that is not the default export, even if another export is imported.',
          reason: 'Used named exports stay. The test is whether something imports them, not whether they are the default.',
        },
        {
          option: 'It runs only in the browser, after the bundle has been downloaded.',
          reason: 'The bundler does it before the browser downloads the file. The browser cannot un-download dead code.',
        },
      ],
      example: { lang: 'js', source: "export function used() {\n  return 1;\n}\nexport function unused() {\n  return 2;\n}\nimport { used } from './math.js';\nused();" },
      remember: 'Tree-shaking drops unused static exports. Side effects and CommonJS block it.',
    },
  },
];
