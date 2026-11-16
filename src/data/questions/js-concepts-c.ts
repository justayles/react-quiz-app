import type { Question } from '../types';

export const jsConceptsC: Question[] = [
  {
    id: 'js-100',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'When does finally run, relative to a return or a throw?',
    options: [
      'finally runs whether the try block returns, throws, or finishes, and it runs before that return or throw completes.',
      'finally runs only when catch handles an error. A successful try skips it.',
      'finally replaces catch and receives the thrown value as its argument.',
      'A return inside try skips finally so the caller receives the value sooner.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'finally runs on the way out of try or catch, including when there is a return or a throw.',
      why: 'try runs the risky code. catch runs only if that code throws, and it receives the thrown value. finally runs in both the success and failure paths. If try returns a value, finally still runs before the caller receives it. A return or throw inside finally replaces the pending one, which is a sharp edge and a reason to keep finally for cleanup only. You can write try/finally with no catch when the error should keep propagating after cleanup. catch without a binding is legal when you do not need the error. An error thrown in catch can still be observed by finally and then propagates unless finally throws something else.',
      wrong: [
        {
          option: 'finally runs only when catch handles an error. A successful try skips it.',
          reason: 'The success path runs finally too. catch is the part that is skipped on success.',
        },
        {
          option: 'finally replaces catch and receives the thrown value as its argument.',
          reason: 'finally takes no error argument. catch is what receives the thrown value.',
        },
        {
          option: 'A return inside try skips finally so the caller receives the value sooner.',
          reason: 'The return is delayed until finally finishes. That is the point of the block.',
        },
      ],
      example: { lang: 'js', source: "function read() {\n  try {\n    return 'value';\n  } finally {\n    console.log('cleanup');\n  }\n}" },
      remember: 'finally runs on the way out, including after return or throw.',
    },
  },
  {
    id: 'js-101',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What causes ReferenceError, TypeError, and SyntaxError?',
    options: [
      'ReferenceError is an unknown or uninitialized binding. TypeError is an operation on the wrong type. SyntaxError is source the parser cannot read.',
      'SyntaxError is a bad property read at runtime. ReferenceError is a failed JSON.parse.',
      'TypeError means a variable was not declared. ReferenceError means a function returned the wrong type.',
      'All three are thrown by the parser before any line runs.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'ReferenceError is a bad binding lookup. TypeError is a value used the wrong way. SyntaxError is invalid source text.',
      why: 'Reading a name that was never declared, or a let before its line, throws ReferenceError while the code is running. Calling a non-function, reading a property of null or undefined, or assigning to a const throws TypeError, also at runtime. SyntaxError means the parser rejected the text, for example an unclosed brace. That normally prevents the script from running at all, so try/catch in the same script cannot catch it. eval, new Function, and a dynamic import can surface a parse failure as a catchable SyntaxError because they parse later. JSON.parse throws SyntaxError for bad JSON, which is a runtime parse of data rather than of the script.',
      wrong: [
        {
          option: 'SyntaxError is a bad property read at runtime. ReferenceError is a failed JSON.parse.',
          reason: 'A bad property read is a TypeError. JSON.parse does throw SyntaxError, but an unknown variable is the ReferenceError.',
        },
        {
          option: 'TypeError means a variable was not declared. ReferenceError means a function returned the wrong type.',
          reason: 'Those names are swapped. An undeclared name is a ReferenceError.',
        },
        {
          option: 'All three are thrown by the parser before any line runs.',
          reason: 'Only SyntaxError comes from parsing the script. The other two happen while it runs.',
        },
      ],
      example: { lang: 'js', source: "try {\n  JSON.parse('{');\n} catch (error) {\n  console.log(error.name);\n}\nconst broken = null;\nbroken.prop;" },
      remember: 'ReferenceError is a bad name. TypeError is a bad operation. SyntaxError is bad source.',
    },
  },
  {
    id: 'js-102',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do template literals add beyond a quoted string?',
    options: [
      'Backtick strings can span lines and interpolate expressions with ${}. The result is still an ordinary string.',
      'They return a special template object that stays linked to the variables and updates when they change.',
      'Interpolation HTML-escapes the values so they are safe to assign to innerHTML.',
      'They can only interpolate variables, not function calls or arithmetic.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Template literals are strings written with backticks. They allow multiple lines and embed expressions, and they evaluate to a normal string.',
      why: 'Quotes cannot span lines without an escape, and concatenation is noisy. A template evaluates each ${expression}, converts it to a string, and builds one string. The expression can be a calculation or a call, not only a variable name. The result does not stay live: later changes to the variables do not change the string you already built. Interpolation does not escape HTML. If the value is user input and you put the string into innerHTML, you still have an XSS hole. Tagged templates are the related feature where a function receives the parts instead of producing the string automatically.',
      wrong: [
        {
          option: 'They return a special template object that stays linked to the variables and updates when they change.',
          reason: 'The result is a string produced at that moment. It does not track the variables.',
        },
        {
          option: 'Interpolation HTML-escapes the values so they are safe to assign to innerHTML.',
          reason: 'No escaping happens. Safety has to be added by the tag or by the code that writes the DOM.',
        },
        {
          option: 'They can only interpolate variables, not function calls or arithmetic.',
          reason: 'The braces hold any expression, including calls and operators.',
        },
      ],
      example: { lang: 'js', source: "const name = 'Ada';\nconst message = `Hello,\n${name.toUpperCase()}!`;" },
      remember: 'Templates interpolate expressions into a normal string. They do not escape HTML.',
    },
  },
  {
    id: 'js-103',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do default and named ES module imports differ?',
    options: [
      'A default import names the module\'s single default export and the local name is your choice. A named import must match an export name, or use as to rename it.',
      'Named imports can use any local name with no as. Default imports must match the file name.',
      'A module can have several default exports and only one named export.',
      'Default imports are live. Named imports copy the value once.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'There is one default export, imported under any local name. Named exports are imported by their export name, with as when you want a different local name.',
      why: 'export default value marks the module\'s default. The importer writes import Button from "./button.js" and chooses the local name. export function save and export { save } are named. The importer writes import { save as store } from "./api.js" when the local name should differ. You can combine them: import Button, { save } from "./ui.js". A module has at most one default. Named imports are still live bindings, the same as other ES imports. Default is a convenience and a common source of mismatch when a file switches from default to named and the braces are forgotten. Braces around a name that was exported as default do not find it.',
      wrong: [
        {
          option: 'Named imports can use any local name with no as. Default imports must match the file name.',
          reason: 'Named imports need as to rename. The default local name is chosen by the importer and is unrelated to the file name.',
        },
        {
          option: 'A module can have several default exports and only one named export.',
          reason: 'The limit is one default. Named exports can be as many as you declare.',
        },
        {
          option: 'Default imports are live. Named imports copy the value once.',
          reason: 'Both forms are live ES module bindings. Copying is the CommonJS behavior.',
        },
      ],
      example: { lang: 'js', source: "import Button, { save as store } from './ui.js';\nexport default function Button() {}\nexport function save() {}" },
      remember: 'Default is one unnamed export. Named imports use the export name or as.',
    },
  },
  {
    id: 'js-104',
    tech: 'javascript',
    topic: 'collections',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Why can a WeakMap key be collected, while a string key cannot?',
    options: [
      'The key must be an object or an unregistered symbol so the entry can vanish when nothing else references that key. A string would stay reachable as a permanent key.',
      'WeakMap accepts only strings, and it deletes them after one read.',
      'Object keys are copied into the map, so the original object can be collected immediately while the entry remains.',
      'WeakMap keeps keys alive until the page unloads, which is why they must be objects.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'WeakMap keys are objects or non-registered symbols. The map does not keep the key alive, so the entry can be collected with the key.',
      why: 'A normal Map stores the key strongly. As long as the map exists, the key exists, which is a leak if you attach metadata to short-lived DOM nodes. WeakMap holds the key weakly. When the node is gone from the document and from your variables, garbage collection can remove the node and the metadata together. There is no iteration or size, because an entry may disappear between checks. Strings, numbers, and other primitives are not valid keys: they have no unique collectable identity you could watch. Registered symbols from Symbol.for are global and are also rejected. Unregistered symbols are allowed because they can become unreachable. Use a WeakMap for private data hanging off an object you do not own.',
      wrong: [
        {
          option: 'WeakMap accepts only strings, and it deletes them after one read.',
          reason: 'Strings are rejected. Entries disappear when the key is collected, not when you read them.',
        },
        {
          option: 'Object keys are copied into the map, so the original object can be collected immediately while the entry remains.',
          reason: 'The original object is the key. Copying it would leave a strong entry, which is what WeakMap avoids.',
        },
        {
          option: 'WeakMap keeps keys alive until the page unloads, which is why they must be objects.',
          reason: 'The weak part means it does not keep them alive. A strong Map is what retains keys.',
        },
      ],
      example: { lang: 'js', source: "const meta = new WeakMap();\nlet node = document.createElement('div');\nmeta.set(node, { clicks: 0 });\nnode = null;" },
      remember: 'WeakMap does not keep its key alive. Primitives cannot be weak keys.',
    },
  },
  {
    id: 'js-105',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do generators and iterators provide?',
    options: [
      'An iterator\'s next() returns { value, done }. A generator function* produces an iterator and pauses at each yield.',
      'A generator runs its whole body immediately and returns an array of yielded values.',
      'Iterators are only for arrays. Generators cannot hold local variables across yields.',
      'yield sends the value to the event loop as a macrotask.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'An iterator delivers values one next() at a time. A generator is a function that pauses at yield and resumes with its locals intact.',
      why: 'The iterator protocol is an object with next(). Each call returns value and done. for...of uses that protocol. A generator function, marked function*, returns a generator object, which is an iterator. Execution starts at the first next(), runs until yield, and pauses. The next next() continues after that yield. Local variables survive the pause because the generator keeps its own context. yield* delegates to another iterable. Calling the generator function does not run the body. Generators can also implement infinite sequences because they produce a value only when asked. They are synchronous unless you use an async generator.',
      wrong: [
        {
          option: 'A generator runs its whole body immediately and returns an array of yielded values.',
          reason: 'The body pauses, and nothing collects the values into an array unless you spread or loop it.',
        },
        {
          option: 'Iterators are only for arrays. Generators cannot hold local variables across yields.',
          reason: 'Any object can implement next(). Generator locals are kept across pauses.',
        },
        {
          option: 'yield sends the value to the event loop as a macrotask.',
          reason: 'yield pauses the generator. It does not schedule a task. The caller decides when to resume.',
        },
      ],
      example: { lang: 'js', source: "function* countTo(limit) {\n  for (let n = 1; n <= limit; n += 1) yield n;\n}\nconst seq = countTo(2);\nseq.next();\nseq.next();" },
      remember: 'next() pulls one value. yield pauses a generator without losing its locals.',
    },
  },
  {
    id: 'js-106',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a Symbol, and where is it useful?',
    options: [
      'A Symbol is a unique primitive, useful as a non-colliding property key and as a well-known hook such as Symbol.iterator.',
      'A Symbol is a string that JSON.stringify keeps and that no two calls can duplicate by value equality.',
      'Symbols hide properties from the owning object, so a reference to the object cannot read them.',
      'Symbol.for creates a fresh symbol on every call, even with the same description.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Symbol() creates a unique key. It avoids name clashes and powers protocol hooks such as iteration.',
      why: 'A symbol is a primitive, not a string. Symbol("id") === Symbol("id") is false, so two libraries can both use an "id" description without sharing a property. Computed property names store it: { [key]: value }. It is not a security boundary. Anyone who holds the symbol, or who uses Object.getOwnPropertySymbols or Reflect.ownKeys, can read the property. Well-known symbols are shared by the language. Symbol.iterator makes an object usable in for...of. Symbol.toPrimitive customizes coercion. Symbol.for(key) returns the same global symbol for that key on later calls, which is the opposite of Symbol(). JSON.stringify drops symbol keys.',
      wrong: [
        {
          option: 'A Symbol is a string that JSON.stringify keeps and that no two calls can duplicate by value equality.',
          reason: 'It is its own primitive. JSON drops symbol keys, and uniqueness is identity, not string contents.',
        },
        {
          option: 'Symbols hide properties from the owning object, so a reference to the object cannot read them.',
          reason: 'They only avoid ordinary string-key enumeration. Code that has the symbol can read the property.',
        },
        {
          option: 'Symbol.for creates a fresh symbol on every call, even with the same description.',
          reason: 'Symbol.for reuses a global registry. Symbol() is the call that creates a new one each time.',
        },
      ],
      example: { lang: 'js', source: "const id = Symbol('id');\nconst user = { [id]: 7, name: 'Ada' };\nObject.keys(user);\nuser[id];" },
      remember: 'Symbols are unique keys. They avoid clashes and do not hide data from someone who has the symbol.',
    },
  },
  {
    id: 'js-107',
    tech: 'javascript',
    topic: 'this-binding',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does new.target tell you inside a function?',
    options: [
      'It is the constructor that new invoked, and it is undefined when the function was called without new.',
      'It is the prototype of this, and it is set for arrow functions as well.',
      'It is the arguments object under another name.',
      'It is always the class that lexically contains the function, even for a plain call.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'new.target is the constructor used with new. A normal call leaves it undefined, so a function can reject being called without new.',
      why: 'Inside a function invoked with new, new.target refers to the constructor that was new-ed. In a base class that is the class itself. In a derived constructor, new.target is the furthest subclass, while the function that is running may be the base. That lets a base class tell whether it was extended. A call without new sets new.target to undefined, which is how legacy code detects a missing new and throws. Arrow functions do not have new.target. They would see the enclosing function\'s value. It is unrelated to the arguments object and to this, though new also sets this. Abstract-class patterns throw when new.target is the abstract class itself.',
      wrong: [
        {
          option: 'It is the prototype of this, and it is set for arrow functions as well.',
          reason: 'It points at the constructor function, not the prototype object. Arrows do not have their own new.target.',
        },
        {
          option: 'It is the arguments object under another name.',
          reason: 'arguments lists the values that were passed. new.target describes how the function was invoked.',
        },
        {
          option: 'It is always the class that lexically contains the function, even for a plain call.',
          reason: 'A plain call makes it undefined. Inheritance also makes it the subclass that was constructed, not always the class currently executing.',
        },
      ],
      example: { lang: 'js', source: "function Box() {\n  if (!new.target) throw new TypeError('use new');\n  this.kind = 'box';\n}\nnew Box();" },
      remember: 'new.target is the constructor new used. It is undefined without new.',
    },
  },
  {
    id: 'js-108',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does a Proxy let you intercept?',
    options: [
      'Traps such as get, set, has, and apply run your code around an operation on a target object.',
      'A Proxy copies the target and freezes the copy. Later reads do not call your code.',
      'Traps replace the event loop and run once per macrotask.',
      'A Proxy can hide a non-configurable property so the in operator says it is missing.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A Proxy wraps an object and runs trap functions for operations such as reading, writing, calling, and the in operator.',
      why: 'new Proxy(target, handler) does not copy the target. Operations on the proxy are forwarded to traps, and a missing trap performs the default behavior on the target. A get trap can validate, log, or provide a default. A set trap can reject a bad write. An apply trap wraps a function. The engine enforces invariants. If the target has a non-configurable property, the proxy cannot pretend that property does not exist. Revocable proxies can be shut off later, which fits a sandbox that should expire. Proxies do not intercept internal operations that never go through the proxy object, and they confuse code that depends on identity because the proxy is a different object from the target.',
      wrong: [
        {
          option: 'A Proxy copies the target and freezes the copy. Later reads do not call your code.',
          reason: 'The target stays live behind the proxy. Traps run on later operations.',
        },
        {
          option: 'Traps replace the event loop and run once per macrotask.',
          reason: 'Traps run when code performs the matching object operation, not on a timer.',
        },
        {
          option: 'A Proxy can hide a non-configurable property so the in operator says it is missing.',
          reason: 'The invariant forbids that lie. The trap must report the property consistently with the target.',
        },
      ],
      example: { lang: 'js', source: "const user = new Proxy({}, {\n  set(target, key, value) {\n    if (key === 'age' && typeof value !== 'number') throw new TypeError('age');\n    target[key] = value;\n    return true;\n  },\n});" },
      remember: 'A Proxy runs your traps around operations on a target. It does not copy the target.',
    },
  },
  {
    id: 'js-109',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does Reflect differ from the matching Object method?',
    options: [
      'Reflect methods perform the default object operation, return a boolean instead of throwing for set and delete, and forward the receiver so proxies behave.',
      'Reflect freezes an object. Object methods cannot read properties.',
      'Reflect.get skips the prototype chain. Object.get walks it.',
      'Reflect only works inside a Proxy trap and throws anywhere else.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Reflect is a function form of object operations. It reports success as a boolean and is the correct way to forward a proxy trap.',
      why: 'Reflect.get, Reflect.set, Reflect.has, Reflect.deleteProperty, and Reflect.ownKeys match the internal operations a proxy trap can override. Reflect.set returns false when the write fails in strict-relevant cases, instead of the mixed throw-or-boolean behavior of older Object patterns. Inside a get trap, Reflect.get(target, key, receiver) keeps the original receiver, so a getter that uses this still sees the proxy. Object methods often omit that receiver and are a clumsy way to forward. Reflect also makes the operation a value you can pass around. It does not replace Object.create, Object.assign, or Object.keys, and it does not skip the prototype chain.',
      wrong: [
        {
          option: 'Reflect freezes an object. Object methods cannot read properties.',
          reason: 'Freeze is Object.freeze. Both APIs can read. Reflect is the functional form of the language operations.',
        },
        {
          option: 'Reflect.get skips the prototype chain. Object.get walks it.',
          reason: 'Reflect.get uses ordinary lookup, including the prototype. There is no Object.get for that job.',
        },
        {
          option: 'Reflect only works inside a Proxy trap and throws anywhere else.',
          reason: 'It works on ordinary objects. Traps are the place where forwarding matters most.',
        },
      ],
      example: { lang: 'js', source: "const target = { name: 'Ada' };\nconst proxy = new Proxy(target, {\n  get(obj, key, receiver) {\n    return Reflect.get(obj, key, receiver);\n  },\n});" },
      remember: 'Reflect performs the default operation and forwards the receiver.',
    },
  },
  {
    id: 'js-110',
    tech: 'javascript',
    topic: 'equality',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'When should you use BigInt instead of number?',
    options: [
      'Use BigInt for integers past Number.MAX_SAFE_INTEGER. You cannot mix it with a number in arithmetic, and JSON.stringify throws on it.',
      'Use BigInt for decimals and fractions. It mixes freely with number, and JSON stores it as a number.',
      'BigInt is a faster number for every loop index and is safe inside JSON.',
      'BigInt replaces Math.random and cannot represent integers.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'BigInt holds integers larger than the safe number range. Arithmetic with a number throws, and JSON does not support it.',
      why: 'A number is a 64-bit float. Integers are exact only up to Number.MAX_SAFE_INTEGER, which is 2^53 - 1. Past that, two different integers can become the same number. A BigInt literal ends in n, such as 1n, and BigInt(value) converts a safe integer or an integer string. Operations stay inside BigInt: 1n + 2n works, and 1n + 1 throws TypeError. Comparisons with == may coerce, which is another reason to convert explicitly. JSON has no BigInt type, so stringify throws unless a replacer converts it. Use it for ids, hashes, and money in the smallest unit when the value may exceed the safe range. Do not use it for fractional quantities or as a general replacement for number.',
      wrong: [
        {
          option: 'Use BigInt for decimals and fractions. It mixes freely with number, and JSON stores it as a number.',
          reason: 'BigInt is integers only. Mixing with number throws, and JSON does not have a BigInt encoding.',
        },
        {
          option: 'BigInt is a faster number for every loop index and is safe inside JSON.',
          reason: 'Ordinary indexes should stay numbers. JSON.stringify rejects a BigInt.',
        },
        {
          option: 'BigInt replaces Math.random and cannot represent integers.',
          reason: 'It represents integers. Random floats stay on number.',
        },
      ],
      example: { lang: 'js', source: "const wide = 9007199254740993n;\nconst next = wide + 1n;\nconst asText = wide.toString();" },
      remember: 'BigInt is for large integers. Do not mix it with number, and do not put it straight into JSON.',
    },
  },
  {
    id: 'js-111',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do you format a currency and a date in a chosen time zone with Intl?',
    options: [
      'NumberFormat with style currency and a currency code formats the amount. DateTimeFormat with timeZone formats the instant in that zone.',
      'Multiply by 100 and insert the currency symbol from the locale string. Dates always format in the server\'s zone.',
      'Intl.NumberFormat changes the number\'s value to the local currency. DateTimeFormat changes the Date\'s timestamp.',
      'Currency formatting requires a network call to a locale service on each render.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Intl.NumberFormat formats an amount with a currency code. Intl.DateTimeFormat formats an instant in a time zone you name.',
      why: 'style: "currency" and currency: "GBP" choose the symbol, the decimal places, and the position according to the locale. The number you pass is the amount in major units, such as pounds, not a translated value. currencyDisplay can select symbol, code, or name. A Date is an absolute instant. timeZone: "Europe/London" decides the wall-clock fields, so two users can see the same instant in different zones. dateStyle and timeStyle cover common layouts. formatToParts splits the string into currency, integer, and literal pieces when the UI needs markup. This work happens locally in the engine. It does not convert exchange rates or modify the Date.',
      wrong: [
        {
          option: 'Multiply by 100 and insert the currency symbol from the locale string. Dates always format in the server\'s zone.',
          reason: 'Currency minor units differ, and hand-built symbols break. The timeZone option chooses the zone.',
        },
        {
          option: 'Intl.NumberFormat changes the number\'s value to the local currency. DateTimeFormat changes the Date\'s timestamp.',
          reason: 'Both formatters return strings. They do not convert exchange rates or rewrite the Date.',
        },
        {
          option: 'Currency formatting requires a network call to a locale service on each render.',
          reason: 'The data ships with the engine. format is a local call.',
        },
      ],
      example: { lang: 'js', source: "const money = new Intl.NumberFormat('en-GB', {\n  style: 'currency',\n  currency: 'GBP',\n}).format(12.5);\nconst when = new Intl.DateTimeFormat('en-GB', {\n  dateStyle: 'medium',\n  timeZone: 'Europe/London',\n}).format(new Date('2024-06-01T12:00:00Z'));" },
      remember: 'NumberFormat formats money. DateTimeFormat shows an instant in a named time zone.',
    },
  },
  {
    id: 'js-112',
    tech: 'javascript',
    topic: 'syntax',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a tagged template literal?',
    options: [
      'A function placed in front of a template receives the string parts and the interpolated values, and it decides what to return.',
      'The tag is a locale code, and the runtime translates the string automatically.',
      'The tag HTML-escapes every template, whether or not you write a function.',
      'Tagged templates return the same string as an untagged template and cannot see the values separately.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A tag function receives the literal parts and the interpolated values separately, so it can escape, translate, or build a different result.',
      why: 'Writing tag`Hello ${name}` calls tag with a strings array and one argument per expression. strings also has a raw property with the unprocessed text, which String.raw uses. The tag does not have to return a string. CSS-in-JS, SQL builders, and i18n libraries use this to keep the literal under the programmer\'s control and the values in a separate channel that can be escaped. An untagged template would have concatenated first, and the function could not tell a punctuation mark from user input. The tag is ordinary JavaScript. The language does not translate or escape it for you.',
      wrong: [
        {
          option: 'The tag is a locale code, and the runtime translates the string automatically.',
          reason: 'The tag is a function you supply. Translation happens only if that function does it.',
        },
        {
          option: 'The tag HTML-escapes every template, whether or not you write a function.',
          reason: 'There is no automatic escaping. A tag can escape if you write that logic.',
        },
        {
          option: 'Tagged templates return the same string as an untagged template and cannot see the values separately.',
          reason: 'The point of the tag is that it sees the parts and values separately and chooses the return value.',
        },
      ],
      example: { lang: 'js', source: "function highlight(strings, ...values) {\n  return strings.reduce((html, part, index) => {\n    const value = index < values.length ? `<b>${values[index]}</b>` : '';\n    return html + part + value;\n  }, '');\n}\nhighlight`Hi ${'Ada'}`;" },
      remember: 'A tag receives string parts and values separately and chooses the result.',
    },
  },
  {
    id: 'js-113',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'When do you use requestAnimationFrame instead of requestIdleCallback?',
    options: [
      'requestAnimationFrame runs before the next paint and fits visual updates. requestIdleCallback runs in leftover time and can be delayed a long time.',
      'requestIdleCallback runs before every paint. requestAnimationFrame runs only when the user is idle.',
      'Both run inside the current call stack, so either can update a animation safely.',
      'requestAnimationFrame is a timer with a 16 ms guarantee. Idle callbacks have the same guarantee.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'requestAnimationFrame is for the next frame. requestIdleCallback is for work that can wait until the browser is idle.',
      why: 'The browser paints on a frame cadence, often around 60 Hz. requestAnimationFrame schedules a callback before the next paint, and the timestamp lets you move an animation by the elapsed time. It is the right place to read and write visual state once per frame. requestIdleCallback schedules work when the browser has spare time and gives you a deadline through timeRemaining(). Input, painting, and loading can push it back without a useful bound, so it is for analytics, prefetch, and other deferrable jobs. It is not available with the same behavior everywhere, and it is a poor place to mutate the DOM for a frame. Neither callback runs synchronously. A long callback in either still blocks the main thread once it starts.',
      wrong: [
        {
          option: 'requestIdleCallback runs before every paint. requestAnimationFrame runs only when the user is idle.',
          reason: 'The frame callback is the one tied to paint. The idle callback waits for spare time and may miss frames entirely.',
        },
        {
          option: 'Both run inside the current call stack, so either can update a animation safely.',
          reason: 'Both are scheduled. Animation belongs in the frame callback because it is aligned with paint.',
        },
        {
          option: 'requestAnimationFrame is a timer with a 16 ms guarantee. Idle callbacks have the same guarantee.',
          reason: 'The frame is aligned to the display, not a fixed timer. Idle time has no promise that it arrives soon.',
        },
      ],
      example: { lang: 'js', source: "requestAnimationFrame((time) => {\n  box.style.transform = `translateX(${time / 10}px)`;\n});\nrequestIdleCallback((deadline) => {\n  if (deadline.timeRemaining() > 0) sendMetrics();\n});" },
      remember: 'Frame callbacks paint. Idle callbacks use leftover time and may wait.',
    },
  },
  {
    id: 'js-114',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What problem do Atomics and SharedArrayBuffer solve?',
    options: [
      'SharedArrayBuffer is memory several threads can see. Atomics update and wait on that memory without torn reads. The page must be cross-origin isolated.',
      'They send DOM nodes between workers without copying. No extra headers are required.',
      'SharedArrayBuffer is a faster JSON.parse, and Atomics locks the main thread on purpose.',
      'Atomics.wait is the recommended way to pause the main thread until a fetch finishes.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'SharedArrayBuffer shares bytes between the page and workers. Atomics make updates and waits on those bytes race-free, and the document needs cross-origin isolation.',
      why: 'postMessage copies data. A SharedArrayBuffer is the same bytes in more than one thread, so workers can cooperate on a large buffer without cloning it. Ordinary reads and writes can tear or be reordered. Atomics.load, store, add, and compareExchange perform those updates indivisibly. Atomics.wait blocks a worker until another thread notifies it. It is not allowed on the main thread, because blocking it would freeze the page. Atomics.waitAsync is the non-blocking form. Browsers withhold this sharing unless the document is cross-origin isolated, through COOP and COEP headers, because shared memory was part of speculative-execution attacks. This is a specialized tool for media, graphics, and compiled code, not for ordinary UI state.',
      wrong: [
        {
          option: 'They send DOM nodes between workers without copying. No extra headers are required.',
          reason: 'Workers still cannot use the DOM. Sharing bytes requires isolation headers.',
        },
        {
          option: 'SharedArrayBuffer is a faster JSON.parse, and Atomics locks the main thread on purpose.',
          reason: 'It is shared memory, not a parser. Blocking the main thread is forbidden.',
        },
        {
          option: 'Atomics.wait is the recommended way to pause the main thread until a fetch finishes.',
          reason: 'wait cannot run on the main thread. fetch completion is a promise, not a shared-memory lock.',
        },
      ],
      example: { lang: 'js', source: "const buffer = new SharedArrayBuffer(4);\nconst view = new Int32Array(buffer);\nAtomics.store(view, 0, 1);\nAtomics.load(view, 0);" },
      remember: 'SharedArrayBuffer shares bytes. Atomics update them safely, and the page must be isolated.',
    },
  },
  {
    id: 'js-115',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What can structuredClone copy that JSON cannot?',
    options: [
      'structuredClone copies Date, Map, Set, ArrayBuffer, RegExp, and cycles. It still rejects functions and DOM nodes.',
      'structuredClone copies functions, prototypes, and DOM nodes. JSON copies cycles.',
      'They produce the same result for every value, including undefined and BigInt.',
      'JSON keeps Date objects as dates. structuredClone turns them into strings.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'structuredClone deep-copies structured data, including Date, Map, Set, binary buffers, RegExp, and cyclic graphs. Functions and DOM nodes still fail.',
      why: 'JSON.parse(JSON.stringify(value)) only survives the JSON types. Dates become strings, Map disappears into an empty object, undefined and functions vanish, and a cycle throws. structuredClone uses the structured-clone algorithm. It keeps those types, copies the bytes of an ArrayBuffer, and can clone an object that references itself. The result is a new graph, not a shared nested object. It does not copy functions, class prototypes, symbols as object identity, or DOM nodes, so a cloned class instance is a plain data object unless the type is one the algorithm knows. Use it when you need a real deep copy of data. Use JSON when you specifically need a JSON string for the network.',
      wrong: [
        {
          option: 'structuredClone copies functions, prototypes, and DOM nodes. JSON copies cycles.',
          reason: 'Functions, prototypes, and nodes are outside structured clone. JSON throws on a cycle.',
        },
        {
          option: 'They produce the same result for every value, including undefined and BigInt.',
          reason: 'JSON is lossy and throws on BigInt. structured clone preserves types JSON cannot represent.',
        },
        {
          option: 'JSON keeps Date objects as dates. structuredClone turns them into strings.',
          reason: 'The conversions are the other way around. JSON stringifies a Date, and structuredClone keeps one.',
        },
      ],
      example: { lang: 'js', source: "const original = { when: new Date(), scores: new Map([['ada', 1]]) };\noriginal.self = original;\nconst copy = structuredClone(original);" },
      remember: 'structuredClone keeps dates, maps, sets, and cycles. It does not keep functions.',
    },
  },
  {
    id: 'js-116',
    tech: 'javascript',
    topic: 'event-loop',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How does the event loop differ between a browser and Node.js?',
    options: [
      'Both drain promise microtasks before the next task. Node also has phase queues and a nextTick queue that runs before promises. Browsers can paint between tasks.',
      'Browsers run promise callbacks as macrotasks. Node runs timers before the current stack finishes.',
      'Node has no microtask queue. Browsers have no timer queue.',
      'setImmediate and requestAnimationFrame are the same queue in both hosts.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Promise microtasks run before the next task in both hosts. Node adds phases and process.nextTick, and only the browser paints.',
      why: 'After the current stack, a browser drains promise jobs and then may render or take the next task, such as a timer, an input event, or a network callback. There is no setImmediate. requestAnimationFrame is tied to painting. Node cycles through phases: timers, pending callbacks, idle and prepare, poll, check, and close callbacks. setTimeout runs in timers, I/O callbacks run in poll, and setImmediate runs in check. process.nextTick queues a callback that runs after the current operation and before promise microtasks. That extra queue can starve the loop if you add nextTick callbacks forever. The order of a timer and setImmediate scheduled from the top level is not stable, while inside an I/O callback the check phase runs before the next timers phase. None of this adds a second JavaScript thread.',
      wrong: [
        {
          option: 'Browsers run promise callbacks as macrotasks. Node runs timers before the current stack finishes.',
          reason: 'Promises are microtasks in both. Timers never interrupt the stack that is already running.',
        },
        {
          option: 'Node has no microtask queue. Browsers have no timer queue.',
          reason: 'Both have promise microtasks and timers. Node\'s extra structure is the phases and nextTick.',
        },
        {
          option: 'setImmediate and requestAnimationFrame are the same queue in both hosts.',
          reason: 'setImmediate is a Node check-phase API. requestAnimationFrame is a browser paint API.',
        },
      ],
      example: { lang: 'js', source: "setTimeout(() => console.log('timer'), 0);\nPromise.resolve().then(() => console.log('promise'));\nprocess.nextTick(() => console.log('nextTick'));" },
      remember: 'Promises run before the next task. Node also drains nextTick first and then walks its phases.',
    },
  },
  {
    id: 'js-117',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How does an async generator differ from a generator?',
    options: [
      'A generator\'s next() returns a result now. An async generator\'s next() returns a promise, and consumers walk it with for await...of.',
      'Both return promises from next(). Only the async form can yield.',
      'An async generator runs each yield on a worker. A generator cannot pause.',
      'for await...of works on a normal generator and skips the promises.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Async generators yield over time. next() returns a promise of { value, done }, and for await...of waits for each one.',
      why: 'function* pauses synchronously at yield. async function* can await a fetch or a stream read between yields. Calling next returns a promise that fulfills with the next value and the done flag. for await...of unwraps those promises and also works on other async iterables, such as a readable stream of bytes. A normal for...of does not await an async generator. Inside the async generator, yield pauses until the consumer asks again, so you can apply backpressure by not calling next. Errors reject the promise from next, and for await...of turns that into a throw. Use this for paging, log tails, and any sequence whose next item is not ready yet.',
      wrong: [
        {
          option: 'Both return promises from next(). Only the async form can yield.',
          reason: 'A normal generator returns the result object directly. Both forms use yield.',
        },
        {
          option: 'An async generator runs each yield on a worker. A generator cannot pause.',
          reason: 'Both pause on the same thread. Async means the resume can wait for a promise, not another thread.',
        },
        {
          option: 'for await...of works on a normal generator and skips the promises.',
          reason: 'A normal generator is walked with for...of. for await is for async iterables.',
        },
      ],
      example: { lang: 'js', source: "async function* pages(url) {\n  while (url) {\n    const body = await fetch(url).then((response) => response.json());\n    yield body.items;\n    url = body.next;\n  }\n}" },
      remember: 'Async generators yield through promises. Consume them with for await...of.',
    },
  },
  {
    id: 'js-118',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does dynamic import() do that a static import cannot?',
    options: [
      'import() loads a module at runtime, returns a promise of its namespace, and gives bundlers a code-split point.',
      'import() copies the module into the current file at build time and returns the namespace synchronously.',
      'A dynamic import cannot be conditional, and it does not produce a separate chunk.',
      'import() reloads and re-executes the module on every call, even after it has been evaluated.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'import() fetches and evaluates a module when that line runs. You can branch on it, and a bundler can put the module in its own chunk.',
      why: 'A static import runs before the module body and must name a string the bundler can see. import(specifier) is an expression. The specifier can be computed, and you can place it inside a function or a branch, so a heavy editor loads only when the user opens it. The call returns a promise. The module namespace is the fulfillment value, and default is the default export. The module is evaluated once and then cached, like a static import. Bundlers treat the call as a split point and emit a separate chunk. A fully dynamic specifier that the bundler cannot analyze may not be split and may not work in a bundled browser build. Errors reject the promise, often with a network or parse failure.',
      wrong: [
        {
          option: 'import() copies the module into the current file at build time and returns the namespace synchronously.',
          reason: 'The call returns a promise because loading happens later. It is not an inline synchronous copy.',
        },
        {
          option: 'A dynamic import cannot be conditional, and it does not produce a separate chunk.',
          reason: 'Conditionals are the reason to use it, and bundlers split at the call.',
        },
        {
          option: 'import() reloads and re-executes the module on every call, even after it has been evaluated.',
          reason: 'The module record is cached. A second import of the same URL reuses it.',
        },
      ],
      example: { lang: 'js', source: "async function openChart() {\n  const { Chart } = await import('./chart.js');\n  return new Chart();\n}" },
      remember: 'import() loads on demand and returns a promise. Bundlers can split there.',
    },
  },
  {
    id: 'js-119',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is a transferable object in postMessage?',
    options: [
      'An ArrayBuffer, MessagePort, or similar object listed in the transfer argument is moved. The sender\'s copy is detached.',
      'Every object in the message is transferred, including functions and DOM nodes, with no second argument.',
      'Transfer copies the bytes and leaves the sender\'s buffer usable at the same memory.',
      'Transferable objects are available only to service workers, not to dedicated workers.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The transfer list moves ownership of a buffer or port to the other side. The sender can no longer use the detached object.',
      why: 'The default postMessage uses structured clone, which copies the data. Large binary buffers make that copy expensive. The second argument is a list of transferable objects: ArrayBuffer, MessagePort, ImageBitmap, OffscreenCanvas, and a few related types. The receiver gets the object, and the sender\'s buffer is detached, so its byteLength becomes 0 and further use throws. That is a move, not a share. SharedArrayBuffer is the API that shares instead of moving, and it is not placed in the transfer list. Functions and DOM nodes are neither cloned nor transferred. Dedicated workers, window-to-window messages, and some worker types accept the transfer list. Use it for image pixels and file bytes when the sender is done with the buffer.',
      wrong: [
        {
          option: 'Every object in the message is transferred, including functions and DOM nodes, with no second argument.',
          reason: 'Only listed transferable types move. Functions and nodes fail structured clone.',
        },
        {
          option: 'Transfer copies the bytes and leaves the sender\'s buffer usable at the same memory.',
          reason: 'The sender\'s buffer is detached. A copy is what you get when you omit the transfer list.',
        },
        {
          option: 'Transferable objects are available only to service workers, not to dedicated workers.',
          reason: 'Dedicated workers are the common case. The transfer list is part of postMessage, not a service-worker-only feature.',
        },
      ],
      example: { lang: 'js', source: "const bytes = new Uint8Array([1, 2, 3]);\nworker.postMessage(bytes.buffer, [bytes.buffer]);\nbytes.buffer.byteLength;" },
      remember: 'Transfer moves a buffer to the other thread and detaches the sender.',
    },
  },
];
