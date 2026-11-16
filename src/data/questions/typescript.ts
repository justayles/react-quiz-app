import type { Question } from "../types";

export const typescriptQuestions = [
  {
    id: "ts-001",
    tech: "typescript",
    topic: "conditionals",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "A naked conditional type checks T extends any[] and returns a different object for each branch. What is Result when that check is applied to string | number[]?",
    code: {
      lang: "ts",
      source: "type IsArray<T> = T extends any[] ? { array: T } : { other: T };\ntype Result = IsArray<string | number[]>;",
    },
    options: [
      "A union of two objects: one other object holding string, and one array object holding number[]",
      "A single other object holding the whole union string | number[]",
      "A single array object holding the whole union string | number[]",
      "never, because a mixed union cannot be checked",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Result is a union of { other: string } and { array: number[] }, because the check runs once per member.",
      why: "A naked conditional type is one whose checked type is a bare type parameter, written T extends something rather than a wrapper around T. TypeScript distributes that pattern over a union, which means it runs the check separately on each member and unions the results. string is not an array, so that member becomes the other object holding string. number[] is an array, so that member becomes the array object holding number[]. The union as a whole is not an array, but distribution never asks that question.",
      wrong: [
        {
          option: "A single other object holding the whole union string | number[]",
          reason: "That is the result of checking the union once, which only happens when the checked type is wrapped so it does not distribute.",
        },
        {
          option: "A single array object holding the whole union string | number[]",
          reason: "The whole union is not assignable to any[], and distribution would still have produced a separate result for string.",
        },
        {
          option: "never, because a mixed union cannot be checked",
          reason: "Each member is checked on its own, and both branches produce an object type, so the result is a union of those objects.",
        },
      ],
      example: { lang: 'ts', source: "type IsArray<T> = T extends any[] ? { array: T } : { other: T };\ntype Result = IsArray<string | number[]>;\nconst text: Result = { other: 'text' };\nconst nums: Result = { array: [1, 2] };\nfunction show(value: Result) {\n  if ('array' in value) {\n    return value.array.length;\n  }\n  return value.other.length;\n}\nshow(text);\nshow(nums);" },
      remember: "A naked type parameter in a conditional distributes, so each union member is checked on its own.",
    },
  },
  {
    id: "ts-002",
    tech: "typescript",
    topic: "conditionals",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The checked type is wrapped in a one-element tuple on both sides. What is Result for string | number[]?",
    code: {
      lang: "ts",
      source: "type IsArray<T> = [T] extends [any[]] ? { array: T } : { other: T };\ntype Result = IsArray<string | number[]>;",
    },
    options: [
      "A union of an other object holding string and an array object holding number[]",
      "A single other object holding the whole union string | number[]",
      "A single array object holding number[] only",
      "never, because a tuple cannot extend an array",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Result is one other object whose value is string | number[], because the tuple wrapper checks the union a single time.",
      why: "Distribution happens only when the checked type is a naked type parameter. Wrapping both sides in a tuple, written [T] extends [any[]], makes the checked type a tuple that contains T, so TypeScript does not split the union. It asks one question: is the tuple containing string | number[] assignable to a tuple containing any[]? That is the same as asking whether the whole union is an array, and it is not, because string is one of the members. The false branch therefore runs once, and T inside the result is still the original union. This is the usual way to turn a distributive conditional off.",
      wrong: [
        {
          option: "A union of an other object holding string and an array object holding number[]",
          reason: "That is what the naked form T extends any[] would produce. The tuple wrapper prevents that split.",
        },
        {
          option: "A single array object holding number[] only",
          reason: "The union fails the array test, so the true branch does not run, and string is not dropped.",
        },
        {
          option: "never, because a tuple cannot extend an array",
          reason: "The two sides are both tuples, so the comparison is valid. It simply fails for this union and takes the false branch.",
        },
      ],
      example: { lang: 'ts', source: "type IsArray<T> = [T] extends [any[]] ? { array: T } : { other: T };\ntype Result = IsArray<string | number[]>;\nconst asText: Result = { other: 'text' };\nconst asNums: Result = { other: [1, 2] };\nfunction read(value: Result): string | number[] {\n  return value.other;\n}\nread(asText);\nread(asNums);" },
      remember: "Wrap both sides of a conditional in a tuple when the union should be checked once.",
    },
  },
  {
    id: "ts-003",
    tech: "typescript",
    topic: "conditionals",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Unwrap uses infer to take the type inside one Promise. What are OneStep and Fully for a Promise of a Promise of string?",
    code: {
      lang: "ts",
      source: "type Unwrap<T> = T extends Promise<infer U> ? U : never;\ntype OneStep = Unwrap<Promise<Promise<string>>>;\ntype Fully = Awaited<Promise<Promise<string>>>;",
    },
    options: [
      "Both are string",
      "Both are Promise<string>",
      "OneStep is Promise<string>, and Fully is string",
      "OneStep is string, and Fully is Promise<string>",
    ],
    correctIndex: 2,
    explanation: {
      answer: "OneStep is Promise<string> because infer unwraps a single Promise, while Awaited keeps going and yields string.",
      why: "infer names a type that TypeScript fills in while matching a pattern. Here U is whatever sits inside one Promise, and the conditional returns that piece. The input matches Promise of something, and that something is itself Promise<string>, so one step stops there. Awaited is the standard library type that repeats this unwrapping for Promises and other thenable objects until the inner type is no longer thenable. A non-promise type is left unchanged by Awaited, whereas Unwrap would turn it into never because it would miss the Promise pattern. Use Awaited for the type of a value after every await.",
      wrong: [
        {
          option: "Both are string",
          reason: "The hand-written conditional does not loop. Only Awaited continues into the inner Promise.",
        },
        {
          option: "Both are Promise<string>",
          reason: "Awaited does not stop after one layer. Nested promises collapse to the innermost type.",
        },
        {
          option: "OneStep is string, and Fully is Promise<string>",
          reason: "That swaps the two results. infer on Promise captures one level, and Awaited is the recursive helper.",
        },
      ],
      example: { lang: 'ts', source: "type Unwrap<T> = T extends Promise<infer U> ? U : never;\ntype OneStep = Unwrap<Promise<Promise<string>>>;\ntype Fully = Awaited<Promise<Promise<string>>>;\nconst oneStep: OneStep = Promise.resolve('inner');\nconst fully: Fully = 'inner';\nfunction show(step: Promise<string>, done: string) {\n  return step.then(() => done);\n}\nshow(oneStep, fully);" },
      remember: "infer Promise captures one layer. Awaited unwraps nested promises and thenables.",
    },
  },
  {
    id: "ts-004",
    tech: "typescript",
    topic: "conditionals",
    kind: "concept",
    difficulty: "expert",
    prompt: "TypeScript 5 lets you write infer I extends string inside a conditional. The check is T extends { id: infer I extends string } ? I : never. What does the constraint on I change?",
    options: [
      "It supplies string as the default for I when id is missing",
      "It distributes I over a union before the property is read",
      "It makes id a required property even when the object type marks it optional",
      "It accepts the inferred type only when that type is assignable to string, and otherwise the match fails",
    ],
    correctIndex: 3,
    explanation: {
      answer: "infer extends adds a constraint, so a bad inferred type rejects the match and the false branch is used.",
      why: "infer still captures a piece of the matched type, and the extends clause is an extra requirement on that piece. A constraint is an upper bound: the captured type must be assignable to it. If id is the literal abc, I is inferred as that literal, the bound string accepts it, and the true branch returns the literal. If id is number, number is not assignable to string, so this whole pattern fails rather than inferring number. The conditional then takes the false branch, which is never in this example. Without the constraint, the same pattern would have returned number.",
      wrong: [
        {
          option: "It supplies string as the default for I when id is missing",
          reason: "A constraint is not a default. A missing id fails the object pattern instead of filling in string.",
        },
        {
          option: "It distributes I over a union before the property is read",
          reason: "Distribution is controlled by whether the checked type is a naked type parameter, not by infer extends.",
        },
        {
          option: "It makes id a required property even when the object type marks it optional",
          reason: "The clause constrains the inferred value type. It does not change how optional properties are declared.",
        },
      ],
      example: { lang: 'ts', source: "type IdOf<T> = T extends { id: infer I extends string } ? I : never;\ntype Good = IdOf<{ id: 'abc' }>;\ntype Bad = IdOf<{ id: 1 }>;\nconst good: Good = 'abc';\nfunction take(id: string) {\n  return id.length;\n}\nconst size = take(good);\ntype Rejected = Bad extends never ? true : false;\nconst rejected: Rejected = true;\nvoid size;\nvoid rejected;" },
      remember: "infer extends keeps the inferred type only when it satisfies the constraint.",
    },
  },
  {
    id: "ts-005",
    tech: "typescript",
    topic: "conditionals",
    kind: "code-output",
    difficulty: "expert",
    prompt: "This distributive conditional returns never for array members and returns the member otherwise. What is Result?",
    code: {
      lang: "ts",
      source: "type NotArray<T> = T extends any[] ? never : T;\ntype Result = NotArray<string | number[] | boolean>;",
    },
    options: [
      "string | boolean",
      "string | number[] | boolean",
      "string | never | boolean",
      "never",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Result is string | boolean. The array member becomes never, and never disappears from the union.",
      why: "Because the checked type is a naked T, the conditional distributes over string, number[], and boolean. string and boolean fail the array test, so each is returned unchanged. number[] passes the test, so that branch contributes never. never is the empty type, and an empty alternative adds nothing to a union, so string | never | boolean is simplified to string | boolean. The never does not stay around as a visible member. This is a common way to filter a union, and it is the same idea Exclude uses.",
      wrong: [
        {
          option: "string | number[] | boolean",
          reason: "The array member is not copied through. Its branch is never, so number[] is removed.",
        },
        {
          option: "string | never | boolean",
          reason: "That is the union before simplification. TypeScript drops never from a union.",
        },
        {
          option: "never",
          reason: "Only the array member produces never. The other members produce themselves, so the result is not empty.",
        },
      ],
      example: { lang: 'ts', source: "type NotArray<T> = T extends any[] ? never : T;\ntype Result = NotArray<string | number[] | boolean>;\nconst text: Result = 'hi';\nconst flag: Result = true;\nfunction show(value: string | boolean) {\n  return value;\n}\nshow(text);\nshow(flag);" },
      remember: "A distributive branch that returns never filters that member out of the union.",
    },
  },
  {
    id: "ts-006",
    tech: "typescript",
    topic: "mapped",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "This mapped type walks keyof T and sets every property to true. What is Result when T is the primitive string?",
    code: {
      lang: "ts",
      source: "type Flag<T> = { [K in keyof T]: true };\ntype Result = Flag<string>;",
    },
    options: [
      "An object type with a single property whose name is string",
      "An object type whose keys are the keys of the boxed String type, including method names and number",
      "never, because a primitive has no keys to map",
      "The primitive string, because a mapped type cannot wrap a primitive",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Result maps the keys of String, the object wrapper for the primitive, not a single property named string.",
      why: "A mapped type written over keyof T visits each key and builds a property for it. keyof of a primitive does not mean the name of that primitive, because TypeScript uses the keys of the boxed object type instead, so keyof string is keyof String. That set includes method names such as charAt and slice, the iterator symbol, and number, since String has a numeric index signature. People expect either never or one key called string, and both guesses miss this boxing step, so mapping a primitive produces a large object type full of methods.",
      wrong: [
        {
          option: "An object type with a single property whose name is string",
          reason: "keyof string is not the literal name string. It is the much larger set of String property names.",
        },
        {
          option: "never, because a primitive has no keys to map",
          reason: "The primitive is treated as its wrapper object, and that wrapper has many keys.",
        },
        {
          option: "The primitive string, because a mapped type cannot wrap a primitive",
          reason: "The mapped type still builds an object type. The surprise is which keys it finds, not a failure to map.",
        },
      ],
      example: { lang: 'ts', source: "type Flag<T> = { [K in keyof T]: true };\ntype Result = Flag<string>;\ntype HasCharAt = 'charAt' extends keyof Result ? true : false;\ntype HasIndex = number extends keyof Result ? true : false;\nconst methodFlag: HasCharAt = true;\nconst indexFlag: HasIndex = true;\nfunction both(a: true, b: true) {\n  return a && b;\n}\nboth(methodFlag, indexFlag);" },
      remember: "keyof a primitive uses the boxed object type, so mapped types over string see String methods.",
    },
  },
  {
    id: "ts-007",
    tech: "typescript",
    topic: "mapped",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The key remapping keeps a key only when the property value extends string, and otherwise remaps that key to never. What is Result?",
    code: {
      lang: "ts",
      source: "type OnlyStrings<T> = {\n  [K in keyof T as T[K] extends string ? K : never]: T[K];\n};\ntype Result = OnlyStrings<{ a: string; b: number; c: string }>;",
    },
    options: [
      "An object with a, b, and c unchanged",
      "An object with a and c as string, and b as never",
      "An object with only a and c, both string",
      "An object with only b, typed as number",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Result is an object with a and c, both string. The number property is omitted.",
      why: "Key remapping is the as clause inside a mapped type, so instead of always using the original key, TypeScript uses the type written after as. A conditional there can keep the key or replace it with never, and never means the empty key, so a property remapped to never is dropped rather than stored with a never value. The number property fails the string test, so its name becomes never and disappears, while the two string properties stay with their original value types. This is how a mapped type filters keys.",
      wrong: [
        {
          option: "An object with a, b, and c unchanged",
          reason: "The remapping is not an identity. The number property fails the string test and is removed.",
        },
        {
          option: "An object with a and c as string, and b as never",
          reason: "never is used as the new key, not as the value. The property is omitted, not kept with a never value.",
        },
        {
          option: "An object with only b, typed as number",
          reason: "b is the property that fails the test. The string properties are the ones that remain.",
        },
      ],
      example: { lang: 'ts', source: "type OnlyStrings<T> = {\n  [K in keyof T as T[K] extends string ? K : never]: T[K];\n};\ntype Result = OnlyStrings<{ a: string; b: number; c: string }>;\nconst result: Result = { a: 'one', c: 'two' };\nfunction read(value: Result) {\n  return value.a + value.c;\n}\nread(result);" },
      remember: "Remapping a key to never removes that property from the mapped type.",
    },
  },
  {
    id: "ts-008",
    tech: "typescript",
    topic: "mapped",
    kind: "concept",
    difficulty: "advanced",
    prompt: "In a mapped type, what do the modifiers -readonly and -? do?",
    options: [
      "They add readonly and make every property optional",
      "They delete every property they are applied to",
      "They change every value type to undefined",
      "They remove readonly, and they make every property required",
    ],
    correctIndex: 3,
    explanation: {
      answer: "-readonly strips readonly, and -? strips the optional marker so each property is required.",
      why: "A mapped type can copy keys and also change two property modifiers. readonly, or +readonly, adds the readonly modifier, and -readonly takes it away so the property can be written. A question mark adds optional, which means the property may be omitted, and -? removes optional so the property is required. Required and Partial in the standard library are mapped types that use these modifiers, not different language features. The minus sign is easy to misread as delete, but it only removes the modifier and leaves the property in place.",
      wrong: [
        {
          option: "They add readonly and make every property optional",
          reason: "Adding those modifiers is readonly and ?, without the minus. The minus forms do the opposite.",
        },
        {
          option: "They delete every property they are applied to",
          reason: "Deleting a key is done by remapping it to never. These modifiers keep the key and change its flags.",
        },
        {
          option: "They change every value type to undefined",
          reason: "The value type stays T[K]. Only the readonly and optional modifiers change.",
        },
      ],
      example: { lang: 'ts', source: "type Mutable<T> = {\n  -readonly [K in keyof T]-?: T[K];\n};\ntype Locked = {\n  readonly id?: string;\n  readonly name?: string;\n};\ntype Open = Mutable<Locked>;\nconst row: Open = { id: 'a', name: 'b' };\nrow.id = 'c';\nfunction label(value: Open) {\n  return value.id + value.name;\n}\nlabel(row);" },
      remember: "In a mapped type, a leading minus removes readonly or optional instead of adding it.",
    },
  },
  {
    id: "ts-009",
    tech: "typescript",
    topic: "mapped",
    kind: "concept",
    difficulty: "advanced",
    prompt: "EventName is the union of the string literals click and focus. You build handler names by capitalizing each event and prefixing the letters o and n, using a template literal type with Capitalize. What union do you get?",
    options: [
      "The literal union onClick and onFocus",
      "The wide type string",
      "The literal union onclick and onfocus",
      "The literal union onCLICK and onFOCUS",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The union is the literals onClick and onFocus.",
      why: "A template literal type builds a new string-literal union by attaching fixed text to every member of an existing string-literal union. Capitalize is one of the built-in string types, and it changes only the first character to uppercase, so click becomes Click and focus becomes Focus. Prefixing the two letters o and n then produces onClick and onFocus. The result stays a union of literals, so a misspelled handler is rejected, rather than collapsing to the wide type string. Uppercase would have capitalized every character, which is a different helper.",
      wrong: [
        {
          option: "The wide type string",
          reason: "Both the input and Capitalize preserve literal types, so the prefixed result is still a union of literals.",
        },
        {
          option: "The literal union onclick and onfocus",
          reason: "Capitalize uppercases the first letter of each event. The prefix does not lowercase that letter again.",
        },
        {
          option: "The literal union onCLICK and onFOCUS",
          reason: "That would be Uppercase, which changes every character. Capitalize changes only the first.",
        },
      ],
      example: { lang: 'ts', source: "type Click = Capitalize<'click'>;\ntype Focus = Capitalize<'focus'>;\ntype HandlerName = 'onClick' | 'onFocus';\nconst click: Click = 'Click';\nconst focusLabel: Focus = 'Focus';\nfunction on(name: HandlerName) {\n  return name;\n}\non('onClick');\non('onFocus');\nvoid click;\nvoid focusLabel;" },
      remember: "A template literal type plus Capitalize turns click into the literal onClick.",
    },
  },
  {
    id: "ts-010",
    tech: "typescript",
    topic: "narrowing",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "You have an object whose primary property is the literal red, and every value must be one of red, green, or blue. You want a type error if a value is wrong or an extra property appears, but you still want primary to stay the literal red. What should you write?",
    options: [
      "Assert the object with as Record<string, Color>, which both checks it and keeps the literal",
      "Check the object with satisfies Record<string, Color>, which checks it and keeps the inferred literal",
      "Annotate the const as Record<string, Color>, which keeps primary as the literal red",
      "Wrap it in Partial so extra properties and wrong colors are rejected and literals stay narrow",
    ],
    correctIndex: 1,
    explanation: {
      answer: "satisfies checks the object against the target type and leaves the inferred type, including the literal red, in place.",
      why: "satisfies means the value must be assignable to the type you name, and then the variable keeps the narrower type TypeScript inferred from the value. An as assertion replaces the inferred type with the type you name, so primary becomes the wide color union instead of the literal red. as also skips excess property checks, so an extra property can be hidden when the rest of the object still overlaps the target. A type annotation has the same widening effect as far as the stored type goes: the variable's type becomes the annotation, not the literal. Partial would allow missing properties and would not preserve this check.",
      wrong: [
        {
          option: "Assert the object with as Record<string, Color>, which both checks it and keeps the literal",
          reason: "as changes the type to the asserted type and can hide an extra property. It does not keep the literal red.",
        },
        {
          option: "Annotate the const as Record<string, Color>, which keeps primary as the literal red",
          reason: "An annotation sets the variable's type to that record, so primary is the wide color union, not the literal.",
        },
        {
          option: "Wrap it in Partial so extra properties and wrong colors are rejected and literals stay narrow",
          reason: "Partial makes properties optional. It is not a check that preserves a literal while rejecting extras.",
        },
      ],
      example: { lang: 'ts', source: "type Color = 'red' | 'green' | 'blue';\nconst palette = {\n  primary: 'red',\n  secondary: 'green',\n} satisfies Record<string, Color>;\nconst primary: 'red' = palette.primary;\nfunction paint(color: 'red') {\n  return color;\n}\npaint(primary);" },
      remember: "satisfies validates a value and keeps its inferred type. as replaces the type and can hide a mistake.",
    },
  },
  {
    id: "ts-011",
    tech: "typescript",
    topic: "narrowing",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What is the type of pair?",
    code: {
      lang: "ts",
      source: "const pair = ['red', 1] as const;\ntype Pair = typeof pair;",
    },
    options: [
      "string[]",
      "An array of string or number",
      "A readonly tuple whose elements are the literal red and the literal 1",
      "A mutable tuple whose elements are the literal red and the literal 1",
    ],
    correctIndex: 2,
    explanation: {
      answer: "as const makes pair a readonly tuple of the literals red and 1.",
      why: "Without as const, a fresh array is widened to an array type such as (string | number)[]. as const is a const assertion, and it tells TypeScript to infer the narrowest literal types and to treat the array as a readonly tuple. A tuple remembers length and the type of each position, unlike an array, which remembers only one element type. readonly means the tuple cannot be pushed to or have an element reassigned. The value at runtime is still a normal array. Only the type is frozen and narrowed.",
      wrong: [
        {
          option: "string[]",
          reason: "The second element is a number, and as const does not widen both elements to string.",
        },
        {
          option: "An array of string or number",
          reason: "That is the widened inference you get without as const. The assertion keeps each literal and the length.",
        },
        {
          option: "A mutable tuple whose elements are the literal red and the literal 1",
          reason: "as const produces a readonly tuple. A mutable tuple would still allow element assignment.",
        },
      ],
      example: { lang: 'ts', source: "const pair = ['red', 1] as const;\ntype Pair = typeof pair;\nconst color: 'red' = pair[0];\nconst count: 1 = pair[1];\nfunction show(value: Pair) {\n  return [value[0], value[1]];\n}\nshow(pair);\nvoid color;\nvoid count;" },
      remember: "as const infers a readonly tuple of literal types instead of a widened array.",
    },
  },
  {
    id: "ts-012",
    tech: "typescript",
    topic: "generics",
    kind: "code-output",
    difficulty: "expert",
    prompt: "tune has a const type parameter constrained to readonly string arrays. What is the type of song?",
    code: {
      lang: "ts",
      source: "function tune<const T extends readonly string[]>(notes: T) {\n  return notes;\n}\nconst song = tune(['do', 're']);\ntype Song = typeof song;",
    },
    options: [
      "string[]",
      "A mutable tuple of the literals do and re",
      "readonly string[]",
      "A readonly tuple of the literals do and re",
    ],
    correctIndex: 3,
    explanation: {
      answer: "song is a readonly tuple of the literals do and re.",
      why: "A const type parameter, written const before the type parameter name, asks inference to keep literal types from the argument, in the same spirit as as const. The argument is a fresh array of two string literals, so T is inferred as the readonly tuple of those literals rather than as string[]. The constraint readonly string[] still has to be satisfied, and this tuple is. The const modifier is what requests the narrow inference. The constraint alone only limits which arguments are legal. This arrived in TypeScript 5.",
      wrong: [
        {
          option: "string[]",
          reason: "That is the ordinary widened inference for a fresh array. The const type parameter keeps the literals and the length.",
        },
        {
          option: "A mutable tuple of the literals do and re",
          reason: "Const type parameters infer readonly tuples, so the elements cannot be reassigned through this type.",
        },
        {
          option: "readonly string[]",
          reason: "The constraint mentions that wide type, but inference with const keeps the two specific literals.",
        },
      ],
      example: { lang: 'ts', source: "function tune<const T extends readonly string[]>(notes: T) {\n  return notes;\n}\nconst song = tune(['do', 're']);\ntype Song = typeof song;\nconst first: 'do' = song[0];\nconst second: 're' = song[1];\nfunction play(value: Song) {\n  return [value[0], value[1]];\n}\nplay(song);\nvoid first;\nvoid second;" },
      remember: "A const type parameter infers a readonly tuple of literal types from the argument.",
    },
  },
  {
    id: "ts-013",
    tech: "typescript",
    topic: "generics",
    kind: "scenario",
    difficulty: "expert",
    prompt: "createStreetLight infers its color union from a list of color names, and it also takes an optional default color. You want the default checked against that list, not merged into the union. A call that passes blue as the default should fail when blue is not in the list. What do you put on the default parameter?",
    options: [
      "NoInfer around the type parameter, so the default is checked against the list and is not an inference site",
      "any, so the default is accepted and the list still infers the narrow union",
      "A default type argument of string, so a bad default is rejected",
      "unknown, so the default is narrowed to one of the list colors automatically",
    ],
    correctIndex: 0,
    explanation: {
      answer: "NoInfer stops that parameter from affecting inference, so the list alone decides the union and the default is checked against it.",
      why: "Normally every place a type parameter appears is an inference site, meaning an argument there can choose the type parameter. If both the list and the default infer the same type parameter, a default of blue widens the union to include blue, and the call succeeds. NoInfer marks a position that should be checked but not inferred from. The list still infers red, yellow, and green, and blue is then compared with that union and rejected. any would accept the default and also turn checking off. A default type argument is used only when inference finds nothing, so it does not solve a second argument that infers too much.",
      wrong: [
        {
          option: "any, so the default is accepted and the list still infers the narrow union",
          reason: "any accepts every default, including a color that is not in the list, and it disables the check you wanted.",
        },
        {
          option: "A default type argument of string, so a bad default is rejected",
          reason: "A default type argument does not stop a passed argument from widening inference, and string would also be wider than the list.",
        },
        {
          option: "unknown, so the default is narrowed to one of the list colors automatically",
          reason: "unknown does not infer the list and does not narrow the default to those colors by itself.",
        },
      ],
      example: { lang: 'ts', source: "function createStreetLight<T extends string>(\n  colors: T[],\n  defaultColor?: NoInfer<T>,\n) {\n  return { colors, defaultColor };\n}\nconst light = createStreetLight(['red', 'yellow', 'green'], 'red');\nfunction first(value: 'red' | 'yellow' | 'green') {\n  return value;\n}\nfirst(light.colors[0]);" },
      remember: "NoInfer checks a type parameter in that spot without letting the argument infer it.",
    },
  },
  {
    id: "ts-014",
    tech: "typescript",
    topic: "narrowing",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "After the if returns, what is the type of shape?",
    code: {
      lang: "ts",
      source: "type Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'square'; side: number };\nfunction area(shape: Shape): number {\n  if (shape.kind === 'circle') {\n    return shape.radius;\n  }\n  return shape.side;\n}",
    },
    options: [
      "The full Shape union, because a comparison with a string does not narrow",
      "Only the square member, because the circle tag has been ruled out",
      "Only the circle member, because kind is still in scope",
      "never, because the function already returned",
    ],
    correctIndex: 1,
    explanation: {
      answer: "shape is the square member. The literal tag circle was eliminated, so side is known to exist.",
      why: "This is a discriminated union: every member has the same property, kind, and each member gives that property a different literal type. A comparison with one of those literals narrows the union to the members that could still match. Inside the if, kind is the literal circle, so radius is legal. The return ends that branch, and control-flow analysis, which is TypeScript tracking which types are still possible at each line, leaves only the square member afterward. side is then safe, and radius would not be. The value is not never, because a square can still arrive there.",
      wrong: [
        {
          option: "The full Shape union, because a comparison with a string does not narrow",
          reason: "The compared property is a literal tag, not a wide string. TypeScript removes the members whose tag cannot match.",
        },
        {
          option: "Only the circle member, because kind is still in scope",
          reason: "The circle branch returned. The code after the if is the remaining member, which is square.",
        },
        {
          option: "never, because the function already returned",
          reason: "Only the circle case returned. A square still reaches the last line, so the type is the square member.",
        },
      ],
      example: { lang: 'ts', source: "type Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'square'; side: number };\nfunction area(shape: Shape): number {\n  if (shape.kind === 'circle') {\n    return shape.radius;\n  }\n  const side: number = shape.side;\n  return side;\n}" },
      remember: "Comparing a shared literal tag narrows a discriminated union to the matching member.",
    },
  },
  {
    id: "ts-015",
    tech: "typescript",
    topic: "narrowing",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Fish has swim and Bird has fly. animal is Fish | Bird. What does if ('swim' in animal) do to the type of animal?",
    options: [
      "It leaves animal as the full union and only checks the property at runtime",
      "It narrows animal only when swim is a unique symbol, not a string name",
      "It narrows the true branch to Fish and the false branch to Bird, because only Fish declares swim",
      "It turns animal into any so both methods can be called",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The true branch is Fish and the false branch is Bird, because only one member declares swim.",
      why: "The in operator is a JavaScript check that asks whether a property name exists on an object, and TypeScript also uses it as a type guard. A type guard is a check that narrows a union. When only one member of the union declares that property, the true branch keeps that member and the false branch keeps the members that do not declare it. Fish is the only type here with swim, so the true branch can call swim and the false branch can call fly. If both members declared swim, the check would not separate them. This is structural narrowing, based on which shapes mention the property, not a runtime cast to any.",
      wrong: [
        {
          option: "It leaves animal as the full union and only checks the property at runtime",
          reason: "TypeScript does narrow on in when the property is present on only some members of the union.",
        },
        {
          option: "It narrows animal only when swim is a unique symbol, not a string name",
          reason: "A string property name works. The important part is that only one member declares it.",
        },
        {
          option: "It turns animal into any so both methods can be called",
          reason: "in does not disable checking. Each branch sees only the member or members that fit the check.",
        },
      ],
      example: { lang: 'ts', source: "type Fish = { swim: () => void };\ntype Bird = { fly: () => void };\nfunction move(animal: Fish | Bird) {\n  if ('swim' in animal) {\n    animal.swim();\n    return;\n  }\n  animal.fly();\n}\nconst fish: Fish = { swim() {} };\nmove(fish);" },
      remember: "in narrows a union to the member that declares the property, when the others do not.",
    },
  },
  {
    id: "ts-016",
    tech: "typescript",
    topic: "mapped",
    kind: "concept",
    difficulty: "advanced",
    prompt: "config is a const value with host set to localhost and port set to 8080, and it is not marked as const. What is keyof typeof config?",
    options: [
      "string",
      "The object type whose host is string and whose port is number",
      "number",
      "The union of the literal keys host and port",
    ],
    correctIndex: 3,
    explanation: {
      answer: "keyof typeof config is the literal union host and port.",
      why: "typeof in a type position takes a value and produces the type of that value. It does not mean the JavaScript typeof operator, which returns a string such as object at runtime. The inferred type of config is an object type with host: string and port: number, because the property values widen to string and number when there is no const assertion. keyof of that object type is the union of its property names, the literals host and port. Those keys are exactly what a mapped type iterates if you map over typeof config. The widened value types do not widen the keys.",
      wrong: [
        {
          option: "string",
          reason: "The keys are two literal names. string would be an index signature or a wide key type, which this object does not have.",
        },
        {
          option: "The object type whose host is string and whose port is number",
          reason: "That description is typeof config itself. keyof takes one more step and returns the property names.",
        },
        {
          option: "number",
          reason: "port's value is a number, but keyof asks for keys, and these keys are the names host and port.",
        },
      ],
      example: { lang: 'ts', source: "const config = {\n  host: 'localhost',\n  port: 8080,\n};\ntype ConfigKey = keyof typeof config;\nconst hostKey: ConfigKey = 'host';\nconst portKey: ConfigKey = 'port';\nfunction read(key: ConfigKey) {\n  return config[key];\n}\nread(hostKey);\nread(portKey);" },
      remember: "typeof a value is its type, and keyof typeof that value is the union of its keys.",
    },
  },
  {
    id: "ts-017",
    tech: "typescript",
    topic: "narrowing",
    kind: "concept",
    difficulty: "expert",
    prompt: "assertIsString has the return type asserts value is string, and it throws when value is not a string. After a normal call assertIsString(value) where value was unknown, what is value?",
    options: [
      "string, because a normal return means the asserted condition held",
      "boolean, because you are expected to branch on the call like a predicate",
      "unknown, because the narrowing applies only inside the assertion function",
      "any, because an asserts return type turns checking off",
    ],
    correctIndex: 0,
    explanation: {
      answer: "If the call returns, value is narrowed to string for the rest of that block.",
      why: "An assertion function has a return type that says the value is some type, and it does not return a boolean for you to test. The contract is that a normal return means the condition held, while a failed condition must throw or loop forever, so TypeScript narrows the value at the call site after the call. Callers should not branch on the call, because the result is not a true-or-false predicate. The parameter starts as unknown and becomes string only after the call succeeds.",
      wrong: [
        {
          option: "boolean, because you are expected to branch on the call like a predicate",
          reason: "A type predicate, written value is string as a boolean return, is the form you branch on. asserts does not return that boolean.",
        },
        {
          option: "unknown, because the narrowing applies only inside the assertion function",
          reason: "The point of the asserts return type is to narrow the caller's variable after the call.",
        },
        {
          option: "any, because an asserts return type turns checking off",
          reason: "The value becomes string, which is stricter than any. Checking stays on.",
        },
      ],
      example: { lang: 'ts', source: "function assertIsString(value: unknown): asserts value is string {\n  if (typeof value !== 'string') {\n    throw new Error('not a string');\n  }\n}\nfunction lengthOf(value: unknown) {\n  assertIsString(value);\n  return value.length;\n}\nconst count = lengthOf('quiz');\nvoid count;" },
      remember: "If an assertion function returns, the asserted type holds at the call site.",
    },
  },
  {
    id: "ts-018",
    tech: "typescript",
    topic: "narrowing",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "This switch is meant to handle every Status, but it does not compile. What is the bug?",
    code: {
      lang: "ts",
      source: "type Status = 'open' | 'closed' | 'pending';\nfunction label(status: Status): string {\n  switch (status) {\n    case 'open':\n      return 'Open';\n    case 'closed':\n      return 'Closed';\n    default: {\n      const _exhaustive: never = status;\n      return _exhaustive;\n    }\n  }\n}",
    },
    options: [
      "default is illegal in a switch on a union of string literals",
      "pending is still possible in default, so status is not assignable to never",
      "_exhaustive must be typed as any or the assignment is always rejected",
      "A const binding is not allowed in a default clause",
    ],
    correctIndex: 1,
    explanation: {
      answer: "pending has no case, so default still sees the literal pending, and pending is not assignable to never.",
      why: "never is the empty type, and nothing except never itself is assignable to it. After the open and closed cases return, control-flow analysis leaves the remaining members of Status in default, and pending was never handled, so status there is still the literal pending. Assigning that leftover to never is an error, which is the exhaustiveness check working, because adding a union member without a case makes the build fail. If pending had a returning case, default would see never and the assignment would compile, so the default clause and the const binding are both legal.",
      wrong: [
        {
          option: "default is illegal in a switch on a union of string literals",
          reason: "default is legal. The error is the type of status inside it, not the existence of the clause.",
        },
        {
          option: "_exhaustive must be typed as any or the assignment is always rejected",
          reason: "The assignment is accepted when every member has been handled, because the remaining type is then never.",
        },
        {
          option: "A const binding is not allowed in a default clause",
          reason: "The binding is fine. Moving the same pattern into a handled switch compiles.",
        },
      ],
      example: { lang: 'ts', source: "type Status = 'open' | 'closed' | 'pending';\nfunction label(status: Status): string {\n  switch (status) {\n    case 'open':\n      return 'Open';\n    case 'closed':\n      return 'Closed';\n    case 'pending':\n      return 'Pending';\n    default: {\n      const _exhaustive: never = status;\n      return _exhaustive;\n    }\n  }\n}" },
      remember: "Assigning the leftover union to never fails the build when a member has no case.",
      fixedCode: {
        lang: "ts",
        source: "type Status = 'open' | 'closed' | 'pending';\nfunction label(status: Status): string {\n  switch (status) {\n    case 'open':\n      return 'Open';\n    case 'closed':\n      return 'Closed';\n    case 'pending':\n      return 'Pending';\n    default: {\n      const _exhaustive: never = status;\n      return _exhaustive;\n    }\n  }\n}",
      },
    },
  },
  {
    id: "ts-019",
    tech: "typescript",
    topic: "config",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "useUnknownInCatchVariables is enabled, which strict also turns on. Why does reading e.message fail?",
    code: {
      lang: "ts",
      source: "try {\n  run();\n} catch (e) {\n  console.log(e.message);\n}",
    },
    options: [
      "Catch bindings are always any, so this fails for a different reason",
      "message must be read with an index signature or the access is illegal",
      "e is unknown, so it must be narrowed before message can be read",
      "The flag types catch bindings as never, so no property access is possible even after a check",
    ],
    correctIndex: 2,
    explanation: {
      answer: "e is unknown, and unknown does not allow property access until you prove it is an Error or another type that has message.",
      why: "useUnknownInCatchVariables types the catch binding as unknown instead of any. unknown is a top type that accepts any caught value but refuses to let you use it until you narrow it, and JavaScript can throw any value, not only Error, so reading message would be unsafe. Narrow with instanceof Error, or another check, and inside that branch message is allowed. any would have permitted the access and spread unchecked types into later code, but this flag does not make the binding never, so a check can still refine it.",
      wrong: [
        {
          option: "Catch bindings are always any, so this fails for a different reason",
          reason: "any was the old default. With this flag, or with strict, the binding is unknown.",
        },
        {
          option: "message must be read with an index signature or the access is illegal",
          reason: "The access fails because the receiver is unknown, not because message requires bracket syntax.",
        },
        {
          option: "The flag types catch bindings as never, so no property access is possible even after a check",
          reason: "The type is unknown. An instanceof Error check narrows it and then message is legal.",
        },
      ],
      example: { lang: 'ts', source: "try {\n  run();\n} catch (e) {\n  if (e instanceof Error) {\n    console.log(e.message);\n  }\n}" },
      remember: "With useUnknownInCatchVariables, narrow the catch binding before reading a property.",
      fixedCode: {
        lang: "ts",
        source: "try {\n  run();\n} catch (e) {\n  if (e instanceof Error) {\n    console.log(e.message);\n  }\n}",
      },
    },
  },
  {
    id: "ts-020",
    tech: "typescript",
    topic: "narrowing",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Which assignment is a type error?",
    code: {
      lang: "ts",
      source: "type Point = { x: number; y: number };\nconst fresh: Point = { x: 1, y: 2, z: 3 };\nconst wider = { x: 1, y: 2, z: 3 };\nconst later: Point = wider;",
    },
    options: [
      "Both assignments to Point are errors",
      "Only the assignment from the wider variable is an error",
      "Neither assignment is an error",
      "Only the fresh object literal assigned to Point is an error",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Only the fresh literal is an error. The later assignment from a variable is allowed.",
      why: "Excess property checking is a extra check TypeScript applies to a fresh object literal when it is assigned or passed to a type that does not mention those extra properties. z is not on Point, so the first assignment fails. The variable wider is inferred as an object type that includes z, and a value of that type is still assignable to Point because it has x and y with compatible types. TypeScript does not keep hunting for extra properties through an existing variable. This check catches typos in object literals without making every wider object unassignable. It is not the same as an exact type.",
      wrong: [
        {
          option: "Both assignments to Point are errors",
          reason: "The variable assignment is allowed. Excess property checks do not apply to a value that already has a wider inferred type.",
        },
        {
          option: "Only the assignment from the wider variable is an error",
          reason: "That is the one that is allowed. The fresh literal is the one that fails.",
        },
        {
          option: "Neither assignment is an error",
          reason: "The fresh literal fails excess property checking because z is not part of Point.",
        },
      ],
      example: { lang: 'ts', source: "type Point = { x: number; y: number };\nconst fresh: Point = { x: 1, y: 2 };\nconst wider = { x: 1, y: 2, z: 3 };\nconst later: Point = wider;\nfunction read(point: Point) {\n  return point.x + point.y;\n}\nread(fresh);\nread(later);" },
      remember: "Excess property checks apply to fresh object literals, not to a variable that already has a wider type.",
    },
  },
  {
    id: "ts-021",
    tech: "typescript",
    topic: "variance",
    kind: "concept",
    difficulty: "expert",
    prompt: "strictFunctionTypes is enabled. How are function-property parameters checked compared with parameters of methods written with method syntax?",
    options: [
      "A function-property parameter is checked contravariantly, while a method-syntax parameter stays bivariant",
      "Both forms are checked contravariantly, so a Dog parameter is rejected wherever an Animal parameter is expected",
      "strictFunctionTypes turns parameter checks off for both forms",
      "Methods become invariant and function properties stay bivariant",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Function properties are contravariant in their parameters. Method syntax remains bivariant, which is a historical exception.",
      why: "Contravariant means the function you supply may accept a wider parameter than the caller will pass, but not a narrower one. If callers will pass any Animal, a callback that accepts only Dog is unsafe, because a cat is an Animal and has no breed. Under strictFunctionTypes, a property typed as a function arrow is checked that way, so the Dog callback is rejected. Bivariant means the checker allows the parameter to be either wider or narrower. Methods declared with method syntax still use that older bivariant rule so that generic classes such as arrays keep working as they did. The exception is unsound: a method can require Dog where Animal will actually be passed.",
      wrong: [
        {
          option: "Both forms are checked contravariantly, so a Dog parameter is rejected wherever an Animal parameter is expected",
          reason: "The strict check applies to function properties. Method syntax is deliberately still bivariant.",
        },
        {
          option: "strictFunctionTypes turns parameter checks off for both forms",
          reason: "The flag makes function-property parameters stricter. It does not disable checking.",
        },
        {
          option: "Methods become invariant and function properties stay bivariant",
          reason: "That swaps the two rules. Function properties are the strict, contravariant form.",
        },
      ],
      example: { lang: 'ts', source: "type Animal = { name: string };\ntype Dog = { name: string; breed: string };\ntype Feed = (animal: Dog) => void;\nconst feedAnimal: (animal: Animal) => void = (animal) => {\n  console.log(animal.name);\n};\nconst feed: Feed = feedAnimal;\nfunction run(feedDog: Feed, dog: Dog) {\n  feedDog(dog);\n}\nrun(feed, { name: 'fido', breed: 'collie' });" },
      remember: "strictFunctionTypes checks function-property parameters contravariantly. Methods stay bivariant.",
    },
  },
  {
    id: "ts-022",
    tech: "typescript",
    topic: "config",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "exactOptionalPropertyTypes is enabled. Why does the call fail?",
    code: {
      lang: "ts",
      source: "type Options = { title?: string };\nfunction setTitle(options: Options) {\n  return options.title ?? 'untitled';\n}\nsetTitle({ title: undefined });",
    },
    options: [
      "Optional properties reject string values when this flag is on",
      "title?: string allows the property to be missing, but not explicitly set to undefined",
      "undefined is always identical to omitting the property, so this call is legal under every flag",
      "setTitle must return Options, and the nullish default makes the return type wrong",
    ],
    correctIndex: 1,
    explanation: {
      answer: "With exactOptionalPropertyTypes, title?: string does not include undefined, so passing title: undefined is an error.",
      why: "Normally an optional property also accepts an explicit undefined, and exactOptionalPropertyTypes turns that off. Optional then means the property may be absent, and if it is present its value must be string, because undefined is a different value from a missing property. The empty object is still allowed, and a string title is still allowed. To permit an explicit undefined as well, the property type must include undefined, and the return type of setTitle is not the problem.",
      wrong: [
        {
          option: "Optional properties reject string values when this flag is on",
          reason: "A string is still a legal title. The rejected value is undefined.",
        },
        {
          option: "undefined is always identical to omitting the property, so this call is legal under every flag",
          reason: "That is the default behavior. This flag makes an explicit undefined illegal unless undefined is in the type.",
        },
        {
          option: "setTitle must return Options, and the nullish default makes the return type wrong",
          reason: "The function returns a string. The error is on the call argument, not on the return.",
        },
      ],
      example: { lang: 'ts', source: "type Options = { title?: string | undefined };\nfunction setTitle(options: Options) {\n  return options.title ?? 'untitled';\n}\nsetTitle({ title: undefined });" },
      remember: "With exactOptionalPropertyTypes, add undefined to the type if callers may pass undefined explicitly.",
      fixedCode: {
        lang: "ts",
        source: "type Options = { title?: string | undefined };\nfunction setTitle(options: Options) {\n  return options.title ?? 'untitled';\n}\nsetTitle({ title: undefined });",
      },
    },
  },
  {
    id: "ts-023",
    tech: "typescript",
    topic: "config",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "noUncheckedIndexedAccess is enabled. What is the type of first?",
    code: {
      lang: "ts",
      source: "const nums: number[] = [10, 20, 30];\nconst first = nums[0];",
    },
    options: [
      "number",
      "number or null",
      "number or undefined",
      "undefined",
    ],
    correctIndex: 2,
    explanation: {
      answer: "first is number | undefined, because an index access might miss.",
      why: "noUncheckedIndexedAccess adds undefined to reads through an index, including array element access. nums has type number[], but index 0 might still be missing at runtime if the array is empty or shorter than you think. The flag forces you to handle that before using first as a number. It does not insert null. Without the flag, the type would be number and a missing element would be a silent undefined at runtime. Object index signatures are treated the same way: a string index read becomes the value type or undefined.",
      wrong: [
        {
          option: "number",
          reason: "That is the type only when the flag is off. The flag adds undefined to the read.",
        },
        {
          option: "number or null",
          reason: "A missing element is undefined in JavaScript, and the flag models it as undefined, not null.",
        },
        {
          option: "undefined",
          reason: "The element can exist and be a number. The type is the element type plus undefined, not undefined alone.",
        },
      ],
      example: { lang: 'ts', source: "const nums: number[] = [10, 20, 30];\nconst first = nums[0];\nfunction lower(value: number | undefined) {\n  if (value === undefined) {\n    return 0;\n  }\n  return value;\n}\nconst safe = lower(first);\nvoid safe;" },
      remember: "With noUncheckedIndexedAccess, arr[0] has type T | undefined.",
    },
  },
  {
    id: "ts-024",
    tech: "typescript",
    topic: "modules",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What is the runtime value of fromNumber, and can Label be indexed by its value the same way?",
    code: {
      lang: "ts",
      source: "enum Code {\n  Ok = 200,\n}\nenum Label {\n  Ok = 'OK',\n}\nconst fromNumber = Code[200];",
    },
    options: [
      "fromNumber is undefined, and Label indexed by OK returns the name Ok",
      "Both enums return the name Ok when indexed by their values",
      "Both lookups are rejected, and neither enum object stores a reverse mapping",
      "fromNumber is the string Ok. A string enum does not create a reverse mapping",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Code[200] is the string Ok at runtime. Label has no reverse mapping from OK back to the name.",
      why: "A numeric enum compiles to an object that stores both directions: the name Ok points at 200, and 200 points back at the name Ok. That reverse mapping is why indexing the enum object with the number yields the string Ok. Its type is string, not the literal Ok. A string enum stores only the forward direction, from the name to the string value, so there is no property for the value OK. Indexing a string enum by that value is a type error and would be undefined at runtime. The two enum forms are not interchangeable if you rely on the reverse lookup.",
      wrong: [
        {
          option: "fromNumber is undefined, and Label indexed by OK returns the name Ok",
          reason: "That swaps the two forms. The numeric enum has the reverse mapping, and the string enum does not.",
        },
        {
          option: "Both enums return the name Ok when indexed by their values",
          reason: "Only the numeric enum emits the reverse property. The string enum object has no key OK.",
        },
        {
          option: "Both lookups are rejected, and neither enum object stores a reverse mapping",
          reason: "Code[200] is legal and evaluates to the name. The reverse entry is part of the emitted numeric enum object.",
        },
      ],
      example: { lang: 'ts', source: "enum Code {\n  Ok = 200,\n}\nenum Label {\n  Ok = 'OK',\n}\nconst fromNumber: string = Code[200];\nconst forward: string = Label.Ok;\nfunction show(name: string, value: string) {\n  return name + value;\n}\nshow(fromNumber, forward);" },
      remember: "A numeric enum maps values back to names. A string enum maps names to values only.",
    },
  },
  {
    id: "ts-025",
    tech: "typescript",
    topic: "modules",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A shared const enum breaks down when each file is compiled alone: isolatedModules rejects an ambient const enum, and a single-file transpile does not reliably substitute members from another file. You only need a fixed set of names. What should you ship instead?",
    options: [
      "A union of string literals, which is erased and needs no runtime enum object",
      "A bigger ambient const enum, because isolatedModules can always inline those",
      "A numeric enum whose reverse mapping is required for the names to type-check",
      "An abstract class with one subclass for each name",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Prefer a union of string literals. It gives you a fixed set of names with no runtime object to inline.",
      why: "A const enum is compiled by substitution: in a full TypeScript emit, each use becomes the member value and, by default, no enum object is created. An ambient const enum, declared with declare in a type definition file, cannot be accessed when isolatedModules is enabled, because a compiler that sees one file cannot read the other file to substitute the value. A single-file transpile often fails to inline a const enum and may emit a normal object instead. A union of string literals is only a type, so there is nothing to inline and nothing that isolatedModules has to preserve. If you also need a runtime value, an as const object is the usual companion.",
      wrong: [
        {
          option: "A bigger ambient const enum, because isolatedModules can always inline those",
          reason: "Ambient const enums are exactly what isolatedModules rejects, with an error about not being able to access them.",
        },
        {
          option: "A numeric enum whose reverse mapping is required for the names to type-check",
          reason: "A numeric enum is a runtime object. It does not solve the need for a simple set of literal names.",
        },
        {
          option: "An abstract class with one subclass for each name",
          reason: "That adds runtime classes and a different type relationship. It is not a substitute for a set of names.",
        },
      ],
      example: { lang: 'ts', source: "type Code = 'ok' | 'missing';\nfunction label(code: Code) {\n  if (code === 'ok') {\n    return 'OK';\n  }\n  return 'Missing';\n}\nconst current: Code = 'ok';\nconst text = label(current);\nvoid text;" },
      remember: "Prefer a union of literals over a const enum when files are transpiled separately.",
    },
  },
  {
    id: "ts-026",
    tech: "typescript",
    topic: "modules",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "Two declaration files should each add fields to the same named shape, and those fields should combine into one type. Which declaration form does that?",
    options: [
      "Two type aliases with the same name, because aliases concatenate",
      "Two interfaces with the same name, because interfaces merge",
      "A class in each file, because classes with the same name share one prototype automatically",
      "A numeric enum in each file, because reverse mappings combine the names",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Two interfaces with the same name merge, so members from both declarations end up on one interface.",
      why: "Declaration merging means TypeScript combines compatible declarations that share a name instead of treating the second one as a duplicate. Interfaces participate in that merge, so each interface Box adds its properties to a single Box, while type aliases do not merge and a second alias with the same name is a duplicate-identifier error. Classes and enums follow their own rules and do not concatenate arbitrary fields across files. If you want open-ended extension, declare an interface, and if you want a sealed shape that must not be reopened, use a type alias.",
      wrong: [
        {
          option: "Two type aliases with the same name, because aliases concatenate",
          reason: "Type aliases do not merge. The second alias with the same name is an error.",
        },
        {
          option: "A class in each file, because classes with the same name share one prototype automatically",
          reason: "Two classes with the same name in the same scope conflict. They do not merge their fields.",
        },
        {
          option: "A numeric enum in each file, because reverse mappings combine the names",
          reason: "Enum merging is a separate, limited feature. It is not how you add arbitrary fields to a shape.",
        },
      ],
      example: { lang: 'ts', source: "interface Box {\n  id: string;\n}\ninterface Box {\n  name: string;\n}\nconst box: Box = { id: 'a', name: 'kit' };\nfunction read(value: Box) {\n  return value.id + value.name;\n}\nread(box);" },
      remember: "Interfaces with the same name merge. Type aliases with the same name error.",
    },
  },
  {
    id: "ts-027",
    tech: "typescript",
    topic: "modules",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A library exports an interface named Existing, and you need to add extra: string without editing node_modules. What is the right approach?",
    options: [
      "Change the library's type alias into a class inside node_modules",
      "Assert the library value to a wider type at every call site",
      "Write declare module for the library name and add extra to interface Existing",
      "Import the library with import type and assign a new export object over it",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Module augmentation with declare module merges a new member into an interface from that package.",
      why: "Module augmentation is a file that says declare module and uses the same module specifier you import, then declares more of that module's types. Interfaces merge, so interface Existing { extra: string } adds extra to the interface that already exists in the library. The added field is visible to imports of that module in your project. This does not work if Existing is a type alias, because aliases do not merge and cannot be reopened. import type only brings in a type for local use and cannot add members to the module. Editing node_modules would be overwritten on the next install.",
      wrong: [
        {
          option: "Change the library's type alias into a class inside node_modules",
          reason: "Edits inside the dependency are not a stable type extension, and a class is not required for this merge.",
        },
        {
          option: "Assert the library value to a wider type at every call site",
          reason: "Assertions do not add a field to the library's interface, and they can hide mistakes at each call.",
        },
        {
          option: "Import the library with import type and assign a new export object over it",
          reason: "import type creates no runtime value, and assigning over an import does not augment the module's types.",
        },
      ],
      example: { lang: 'ts', source: "declare module 'widget' {\n  export interface Existing {\n    id: string;\n    extra: string;\n  }\n}\ntype Row = import('widget').Existing;\nconst row: Row = { id: 'a', extra: 'more' };\nfunction read(value: Row) {\n  return value.id + value.extra;\n}\nread(row);" },
      remember: "declare module can merge extra members into an interface exported by that module.",
    },
  },
  {
    id: "ts-028",
    tech: "typescript",
    topic: "modules",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Box is a class exported from ./box. Why does new Box() fail?",
    code: {
      lang: "ts",
      source: "import type { Box } from './box';\nconst box = new Box();",
    },
    options: [
      "new cannot construct an imported name, even when the import is a value import",
      "Box must be a const enum before it can be constructed",
      "A type import is copied into the output as a runtime object, but new still requires a factory",
      "import type is erased, so Box exists only as a type and cannot be constructed",
    ],
    correctIndex: 3,
    explanation: {
      answer: "import type erases Box completely, so there is no runtime value to pass to new.",
      why: "import type is a type-only import. TypeScript removes it from the emitted JavaScript, and the name cannot be used in a value position. A value position is any place that must exist at runtime, such as new, a function call, or the right-hand side of an assignment. Box may be a class, which is both a type and a value, but the type-only import keeps only the type. The fix is a value import, import { Box } from './box', which leaves the class in the output. Use import type when the name is used only in type positions, such as annotations.",
      wrong: [
        {
          option: "new cannot construct an imported name, even when the import is a value import",
          reason: "A normal value import of a class can be constructed. This fails because the import was type-only.",
        },
        {
          option: "Box must be a const enum before it can be constructed",
          reason: "A const enum is not a constructor. The class needs a value import, not a different declaration form.",
        },
        {
          option: "A type import is copied into the output as a runtime object, but new still requires a factory",
          reason: "A type import is erased. It is not copied out as an object, which is why the name is missing at runtime.",
        },
      ],
      example: { lang: 'ts', source: "import { Box } from './box';\nconst box = new Box();" },
      remember: "import type is erased and cannot be used as a value.",
      fixedCode: {
        lang: "ts",
        source: "import { Box } from './box';\nconst box = new Box();",
      },
    },
  },
  {
    id: "ts-029",
    tech: "typescript",
    topic: "modules",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "verbatimModuleSyntax is enabled. Settings is an interface and readFile is a function. Why does this import fail?",
    code: {
      lang: "ts",
      source: "import { readFile, Settings } from './io';\nexport function go(settings: Settings) {\n  return readFile() + settings.theme;\n}",
    },
    options: [
      "Settings is a type, so it needs the inline type keyword or a separate import type",
      "readFile must use import type because functions are erased",
      "verbatimModuleSyntax bans every import from another file",
      "The inline type keyword would keep Settings as a runtime value, so it cannot be used",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Settings is type-only, and verbatimModuleSyntax requires that to be written explicitly with type.",
      why: "verbatimModuleSyntax keeps import and export syntax in the output instead of silently dropping names that are only types. A type-only name must be imported with import type, or marked with the inline type keyword in a mixed import. Settings is an interface, so it has no runtime value and the import must mark it with type, while readFile is a function and stays in the JavaScript. The inline type keyword is erased with Settings and does not create a runtime binding, which makes explicit the elision older TypeScript did silently.",
      wrong: [
        {
          option: "readFile must use import type because functions are erased",
          reason: "readFile is a value. Importing it with import type would erase it and break the call.",
        },
        {
          option: "verbatimModuleSyntax bans every import from another file",
          reason: "Value imports are allowed. The flag requires type names to be marked as types.",
        },
        {
          option: "The inline type keyword would keep Settings as a runtime value, so it cannot be used",
          reason: "The inline type keyword does the opposite: it marks Settings as type-only so it is erased.",
        },
      ],
      example: { lang: 'ts', source: "import { readFile, type Settings } from './io';\nexport function go(settings: Settings) {\n  return readFile() + settings.theme;\n}" },
      remember: "Under verbatimModuleSyntax, mark type names with import type or the inline type keyword.",
      fixedCode: {
        lang: "ts",
        source: "import { readFile, type Settings } from './io';\nexport function go(settings: Settings) {\n  return readFile() + settings.theme;\n}",
      },
    },
  },
  {
    id: "ts-030",
    tech: "typescript",
    topic: "generics",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The author wanted a string argument to return string and a number argument to return number. parse of the string ab is typed as string | number. What is the bug?",
    code: {
      lang: "ts",
      source: "function parse(value: string | number): string | number;\nfunction parse(value: string): string;\nfunction parse(value: string | number): string | number {\n  return value;\n}\nconst out = parse('ab');",
    },
    options: [
      "The implementation signature is what callers see, so the specific overload is the public return type",
      "The wide overload is first, so it matches a string and the later string overload is never chosen",
      "Overloads are combined into an intersection, so every call returns string and number at once",
      "A string is not assignable to string | number, so the call should have been rejected",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Callers see the overload list, and the first matching overload wins. The wide one matches a string before the specific one is considered.",
      why: "Overload signatures are the call signatures written before the implementation, and the implementation signature is hidden from callers while still having to be compatible with every overload. When a call is resolved, TypeScript uses the first overload that matches the arguments. A string is assignable to string or number, so the first signature matches, the return type is the wide union, and the later overload that returns string is unreachable. Put the more specific overload first so a string argument hits it before the wide one, because the hidden implementation is not the type callers get.",
      wrong: [
        {
          option: "The implementation signature is what callers see, so the specific overload is the public return type",
          reason: "Callers do not see the implementation. They see the overload signatures, and order among those signatures matters.",
        },
        {
          option: "Overloads are combined into an intersection, so every call returns string and number at once",
          reason: "Overloads are not merged into an intersection. One signature is selected, and here it is the first one.",
        },
        {
          option: "A string is not assignable to string | number, so the call should have been rejected",
          reason: "A string is assignable to string | number. That is why the wide overload matches and hides the specific one.",
        },
      ],
      example: { lang: 'ts', source: "function parse(value: string): string;\nfunction parse(value: number): number;\nfunction parse(value: string | number): string | number {\n  return value;\n}\nconst out = parse('ab');" },
      remember: "Callers see overloads, not the implementation. Put the more specific overload first.",
      fixedCode: {
        lang: "ts",
        source: "function parse(value: string): string;\nfunction parse(value: number): number;\nfunction parse(value: string | number): string | number {\n  return value;\n}\nconst out = parse('ab');",
      },
    },
  },
  {
    id: "ts-031",
    tech: "typescript",
    topic: "generics",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A function is declared as function pluck<T extends { id: string }>(value: T): T. The author expected a call with no type argument to fill T in as { id: string } even when nothing is passed to infer from. What is true about extends here?",
    options: [
      "extends sets the default type argument to { id: string }",
      "extends makes T exactly { id: string } and drops extra properties from the argument",
      "extends is an upper bound: the argument must be assignable to that shape, and T is inferred from the argument",
      "extends turns T into any so the call always succeeds",
    ],
    correctIndex: 2,
    explanation: {
      answer: "T extends { id: string } is an upper bound, not a default. T is inferred from the value you pass.",
      why: "An upper bound limits how general a type argument may be: T must be assignable to { id: string }, so the value needs an id that is a string. Inference then sets T to the argument's type, including extra properties such as name, and the return type is that same T. A default type argument is a different feature, written T = { id: string }, and it is used only when inference and the caller supply nothing. extends does not fill that in. It also does not erase extra properties, and it does not mean any. A value with no id is rejected because it fails the bound.",
      wrong: [
        {
          option: "extends sets the default type argument to { id: string }",
          reason: "A default is written with equals, not extends. extends only constrains T.",
        },
        {
          option: "extends makes T exactly { id: string } and drops extra properties from the argument",
          reason: "The bound is a ceiling, not the inferred type. Extra properties stay on T when they were on the argument.",
        },
        {
          option: "extends turns T into any so the call always succeeds",
          reason: "The bound rejects values that are not assignable to { id: string }. Checking stays on.",
        },
      ],
      example: { lang: 'ts', source: "function pluck<T extends { id: string }>(value: T): T {\n  return value;\n}\nconst user = pluck({ id: 'a', name: 'Ada' });\nconst id: string = user.id;\nconst label: string = user.name;\nfunction show(value: { id: string; name: string }) {\n  return value.id + value.name;\n}\nshow(user);" },
      remember: "T extends Shape is an upper bound. A default is written T = Shape.",
    },
  },
  {
    id: "ts-032",
    tech: "typescript",
    topic: "generics",
    kind: "code-output",
    difficulty: "expert",
    prompt: "read is overloaded. What do ReturnType and Parameters report for typeof read?",
    code: {
      lang: "ts",
      source: "declare function read(id: string): string;\ndeclare function read(id: number): number[];\ntype R = ReturnType<typeof read>;\ntype P = Parameters<typeof read>;",
    },
    options: [
      "string, and a tuple of one string, because both helpers use the first overload",
      "string | number[], and a union of both parameter lists",
      "any and any, because an overloaded function has no signature these helpers can read",
      "number[], and a tuple of one number, because both helpers use the last overload",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Both helpers use the last overload, so the return is number[] and the parameters are a tuple of one number.",
      why: "ReturnType and Parameters are conditional types that infer from a function type: ReturnType captures the return type, and Parameters captures the parameter list as a tuple. When the function is overloaded, a conditional type does not combine every overload into a union, and it uses the last overload signature. Here that last signature takes a number and returns number[], so expecting the first overload or a union of all of them is wrong. A hidden implementation signature is not what these helpers read either, so if you need one specific overload, write a non-overloaded function type for that case.",
      wrong: [
        {
          option: "string, and a tuple of one string, because both helpers use the first overload",
          reason: "The first overload is not the one selected. Conditional types on an overload use the last signature.",
        },
        {
          option: "string | number[], and a union of both parameter lists",
          reason: "The helpers do not union the overloads together. Only the last signature is used.",
        },
        {
          option: "any and any, because an overloaded function has no signature these helpers can read",
          reason: "They do resolve a signature. It is specifically the last overload, which is number[] and one number parameter.",
        },
      ],
      example: { lang: 'ts', source: "declare function read(id: string): string;\ndeclare function read(id: number): number[];\ntype R = ReturnType<typeof read>;\ntype P = Parameters<typeof read>;\nconst rows: R = [1, 2];\nconst args: P = [1];\nfunction show(value: number[], params: [number]) {\n  return [value.length, params[0]];\n}\nshow(rows, args);" },
      remember: "ReturnType and Parameters on an overloaded function use the last overload, not a union of them.",
    },
  },
  {
    id: "ts-033",
    tech: "typescript",
    topic: "variance",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Why is addItem(row) rejected?",
    code: {
      lang: "ts",
      source: "function addItem(items: string[]) {\n  items.push('tail');\n}\nconst row = ['a', 'b'] as const;\naddItem(row);",
    },
    options: [
      "row is a readonly tuple, and string[] would allow push, so the tuple is not assignable to it",
      "as const widens the tuple to string, so push cannot see the elements",
      "push exists only on tuples, so the parameter type string[] is the wrong target",
      "A two-element array is not an array and can never be passed to string[]",
    ],
    correctIndex: 0,
    explanation: {
      answer: "as const made a readonly tuple, and a readonly tuple cannot be passed to an array that push can mutate.",
      why: "as const infers row as a readonly tuple of the literals a and b, and readonly means the type does not allow push or element writes. The parameter is a mutable string array, so accepting the tuple would let addItem mutate a value the tuple type promised not to mutate, and TypeScript rejects that assignment. This is variance of a mutable collection: a read-only collection is not a writable one, while a mutable string array can be passed where only reading is allowed. Copying into a new array, or accepting a readonly string array and returning a new array, fixes the call.",
      wrong: [
        {
          option: "as const widens the tuple to string, so push cannot see the elements",
          reason: "as const narrows the elements and adds readonly. It does not widen them to a single string.",
        },
        {
          option: "push exists only on tuples, so the parameter type string[] is the wrong target",
          reason: "push exists on mutable arrays. The tuple is rejected because it is readonly, not because the parameter is an array.",
        },
        {
          option: "A two-element array is not an array and can never be passed to string[]",
          reason: "A mutable two-element string array would be assignable to string[]. Readonly is the reason this one is not.",
        },
      ],
      example: { lang: 'ts', source: "function addItem(items: readonly string[]) {\n  return [...items, 'tail'];\n}\nconst row = ['a', 'b'] as const;\naddItem(row);" },
      remember: "A readonly tuple is not assignable to an array type that can push.",
      fixedCode: {
        lang: "ts",
        source: "function addItem(items: readonly string[]) {\n  return [...items, 'tail'];\n}\nconst row = ['a', 'b'] as const;\naddItem(row);",
      },
    },
  },
  {
    id: "ts-034",
    tech: "typescript",
    topic: "generics",
    kind: "code-output",
    difficulty: "expert",
    prompt: "What is Result?",
    code: {
      lang: "ts",
      source: "type AppendNum<Args extends unknown[]> = [...Args, number];\ntype Result = AppendNum<[string, boolean]>;",
    },
    options: [
      "number[]",
      "A tuple of string, boolean, then number",
      "A tuple of number, then string, then boolean",
      "The union string | boolean | number",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Result is the tuple [string, boolean, number]. The variadic element appends number.",
      why: "A variadic tuple uses ...Type inside a tuple type to splice another tuple into that position. Args extends unknown[] means Args itself must be a tuple or array. Writing [...Args, number] copies every element of Args and then adds number at the end, so [string, boolean] becomes [string, boolean, number]. Putting the fixed element first, [number, ...Args], would prepend number instead. This does not flatten the elements into a union, and it does not forget the earlier positions. Variadic tuples are how functions type rest parameters and how helpers append arguments.",
      wrong: [
        {
          option: "number[]",
          reason: "The spread keeps the existing elements. The result is a three-element tuple, not an open array of numbers.",
        },
        {
          option: "A tuple of number, then string, then boolean",
          reason: "That would be a prepend, written [number, ...Args]. This form puts number after Args.",
        },
        {
          option: "The union string | boolean | number",
          reason: "A tuple spread keeps positions. It does not collapse the elements into a union.",
        },
      ],
      example: { lang: 'ts', source: "type AppendNum<Args extends unknown[]> = [...Args, number];\ntype Result = AppendNum<[string, boolean]>;\nconst row: Result = ['hi', true, 1];\nfunction show(value: [string, boolean, number]) {\n  return value[2];\n}\nconst last = show(row);\nvoid last;" },
      remember: "[...Args, number] appends. [number, ...Args] prepends.",
    },
  },
  {
    id: "ts-035",
    tech: "typescript",
    topic: "config",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A parser returns JSON that the caller does not trust yet. Which return type forces the caller to narrow before reading a field?",
    options: [
      "any, because it is the strict top type and blocks property access",
      "never, because the shape is not known yet and every read is impossible",
      "unknown, because it accepts any value but blocks property access until you narrow",
      "object, because every JSON value is an object and fields are then checked",
    ],
    correctIndex: 2,
    explanation: {
      answer: "unknown accepts whatever was parsed and still makes the caller narrow before using it.",
      why: "any and unknown are both top types, meaning every value is assignable to them, but they differ in what you may do next. any disables checking and spreads, so a value of type any can be passed anywhere and reading a property on it yields any. unknown accepts the value but refuses property access, calls, and assignment to a more specific type until you narrow with a check. JSON can be an object, an array, or a primitive, so object is the wrong top, and never would reject every real result, which makes unknown the strict choice at a trust boundary.",
      wrong: [
        {
          option: "any, because it is the strict top type and blocks property access",
          reason: "any does the opposite of blocking. It turns checking off and lets the caller read any property.",
        },
        {
          option: "never, because the shape is not known yet and every read is impossible",
          reason: "never means no value can be returned. The parser does return a value. The safe top type is unknown.",
        },
        {
          option: "object, because every JSON value is an object and fields are then checked",
          reason: "JSON can be a string, number, boolean, or null. object would reject those and still would not check field names.",
        },
      ],
      example: { lang: 'ts', source: "function parse(raw: string): unknown {\n  return JSON.parse(raw);\n}\nfunction readCount(value: unknown) {\n  if (typeof value === 'number') {\n    return value;\n  }\n  return 0;\n}\nconst data = parse('1');\nconst count = readCount(data);\nvoid count;" },
      remember: "any turns checking off and spreads. unknown forces a narrowing step before use.",
    },
  },
  {
    id: "ts-036",
    tech: "typescript",
    topic: "conditionals",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What is string | never, and what does a function return type of never mean?",
    options: [
      "string | never is never, and a never return means the function returns null",
      "string | never is string | null, and never means the function returns undefined",
      "never is another spelling of any, so both the union and the return type accept every value",
      "string | never is string, and a never return means the function does not return normally",
    ],
    correctIndex: 3,
    explanation: {
      answer: "string | never simplifies to string. A never return type means the function never returns to its caller.",
      why: "never is the empty type, so no value has that type, and a union drops empty members, which makes string or never just string. The same simplification is why a distributive conditional can filter a member by returning never for it. As a return type, never means the function does not finish normally, because it always throws or loops forever and the caller never receives a value. never is assignable to every type, which is why a throw can stand where a string is expected, but it is not any, null, or undefined.",
      wrong: [
        {
          option: "string | never is never, and a never return means the function returns null",
          reason: "never disappears from a union, so the result is string. A never return does not produce null.",
        },
        {
          option: "string | never is string | null, and never means the function returns undefined",
          reason: "never is not null or undefined. The union does not gain either of those types.",
        },
        {
          option: "never is another spelling of any, so both the union and the return type accept every value",
          reason: "any accepts every value and spreads. never accepts nothing and means the function does not return.",
        },
      ],
      example: { lang: 'ts', source: "type Simplified = string | never;\nconst label: Simplified = 'ok';\nfunction fail(message: string): never {\n  throw new Error(message);\n}\nfunction must(ok: boolean): string {\n  if (!ok) {\n    return fail('nope');\n  }\n  return label;\n}\nmust(true);" },
      remember: "never vanishes from a union. As a return type it means the function does not return normally.",
    },
  },
  {
    id: "ts-037",
    tech: "typescript",
    topic: "variance",
    kind: "code-output",
    difficulty: "expert",
    prompt: "UserId is a branded string. Does welcome('user-1') type-check?",
    code: {
      lang: "ts",
      source: "type UserId = string & { readonly brand: unique symbol };\nfunction welcome(id: UserId) {\n  return id;\n}\nwelcome('user-1');",
    },
    options: [
      "No. A plain string is missing the brand, so it is not assignable to UserId",
      "Yes. UserId is only a string, so every string is accepted",
      "Yes. An intersection accepts a value that matches either side",
      "No. unique symbol forbids every parameter, branded or not",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The call is rejected. A raw string does not carry the brand, so it is not a UserId.",
      why: "A branded type is an intersection, so the value must be a string and must also have a brand property whose type is unique symbol. A unique symbol names one exact symbol, and a plain string does not have that property, so string alone is not assignable to the branded type. An intersection requires both parts, not either part, and that one-way gap is the point of the brand. A helper can assert a string into the branded type at a trusted boundary, and the result is still usable as a string, while only the raw argument is rejected.",
      wrong: [
        {
          option: "Yes. UserId is only a string, so every string is accepted",
          reason: "The intersection adds a brand the raw string does not have. UserId is stricter than string.",
        },
        {
          option: "Yes. An intersection accepts a value that matches either side",
          reason: "That description is a union. An intersection requires every part, so the brand is mandatory.",
        },
        {
          option: "No. unique symbol forbids every parameter, branded or not",
          reason: "The parameter type is valid. The error is that the argument has not been branded.",
        },
      ],
      example: { lang: 'ts', source: "type UserId = string & { readonly brand: unique symbol };\nfunction asUserId(value: string): UserId {\n  return value as UserId;\n}\nfunction welcome(id: UserId) {\n  return id;\n}\nconst id = asUserId('user-1');\nconst text: string = welcome(id);\nvoid text;" },
      remember: "A brand is an intersection that blocks raw strings while still allowing the branded value as a string.",
    },
  },
  {
    id: "ts-038",
    tech: "typescript",
    topic: "config",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "strictPropertyInitialization is on, as it is under strict. The class compiles, but name is undefined at runtime if the constructor forgets it. What is the bug?",
    code: {
      lang: "ts",
      source: "class User {\n  name!: string;\n  constructor() {\n    // name is never assigned\n  }\n}",
    },
    options: [
      "The exclamation mark makes name optional, so reads of name are typed as string | undefined",
      "The definite assignment assertion hides the missing write, so the compiler does not warn",
      "The assertion initializes name to the empty string at runtime",
      "strictPropertyInitialization ignores class fields unless they are marked readonly",
    ],
    correctIndex: 1,
    explanation: {
      answer: "name! tells the compiler the field is definitely assigned, so a forgotten write produces no error.",
      why: "strictPropertyInitialization requires each instance property to be set in the constructor or given an initializer. The postfix exclamation mark on a property declaration is a definite assignment assertion: you tell the compiler that some code it cannot see will set the field, but it is only a type-level promise. It does not write a value at runtime and it does not make the property optional, so a forgotten assignment leaves the field undefined while its type still says string. Removing the assertion makes that missing write an error again, so use it only when the field really is assigned somewhere the checker cannot follow.",
      wrong: [
        {
          option: "The exclamation mark makes name optional, so reads of name are typed as string | undefined",
          reason: "Optional is the ? marker. This assertion keeps the type as string and suppresses the initialization check.",
        },
        {
          option: "The assertion initializes name to the empty string at runtime",
          reason: "No runtime value is written. The marker changes only what the checker believes.",
        },
        {
          option: "strictPropertyInitialization ignores class fields unless they are marked readonly",
          reason: "The check applies to ordinary fields. This class compiles only because the assertion suppresses it.",
        },
      ],
      example: { lang: 'ts', source: "class User {\n  name: string;\n  constructor(name: string) {\n    this.name = name;\n  }\n}" },
      remember: "A definite assignment assertion silences the checker and does not prove the field was set.",
      fixedCode: {
        lang: "ts",
        source: "class User {\n  name: string;\n  constructor(name: string) {\n    this.name = name;\n  }\n}",
      },
    },
  },
  {
    id: "ts-039",
    tech: "typescript",
    topic: "config",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The first call is accepted and the second is an error. What does the non-null assertion actually do?",
    code: {
      lang: "ts",
      source: "class Box {\n  value?: string;\n  read() {\n    this.value!.toUpperCase();\n    this.value.toUpperCase();\n  }\n}",
    },
    options: [
      "Both calls should be errors, because a non-null assertion is not allowed on an optional property",
      "The second call is string, because the assertion narrows the property for the rest of the method",
      "The assertion silences the check only on that expression. The later read is still string | undefined",
      "The assertion assigns a string to value at runtime before the second call",
    ],
    correctIndex: 2,
    explanation: {
      answer: "value! silences null checking on that one expression. It does not narrow later uses of the property.",
      why: "A non-null assertion is the postfix exclamation mark, and it tells the checker to treat that one expression as not null and not undefined. It is not control-flow narrowing, so it does not change the type of the property on the next line, and a mutable property is especially easy to get wrong because the checker will not assume it stays set. The second call still sees string or undefined and correctly reports a possible missing value. The operator is erased at runtime and does not assign a string, so to narrow for real, copy the property to a local and check that local.",
      wrong: [
        {
          option: "Both calls should be errors, because a non-null assertion is not allowed on an optional property",
          reason: "The assertion is allowed, and it is why the first call compiles. Only the later bare read is an error.",
        },
        {
          option: "The second call is string, because the assertion narrows the property for the rest of the method",
          reason: "The assertion is not a narrowing assignment. The property type on the next line is unchanged.",
        },
        {
          option: "The assertion assigns a string to value at runtime before the second call",
          reason: "The operator is erased. It does not write a value, so it cannot make the second read safe.",
        },
      ],
      example: { lang: 'ts', source: "class Box {\n  value?: string;\n  read() {\n    const current = this.value;\n    if (current === undefined) {\n      return;\n    }\n    current.toUpperCase();\n  }\n}" },
      remember: "A non-null assertion silences one expression. It does not narrow a later use of a mutable property.",
      fixedCode: {
        lang: "ts",
        source: "class Box {\n  value?: string;\n  read() {\n    const current = this.value;\n    if (current === undefined) {\n      return;\n    }\n    current.toUpperCase();\n  }\n}",
      },
    },
  },
  {
    id: "ts-040",
    tech: "typescript",
    topic: "generics",
    kind: "concept",
    difficulty: "advanced",
    prompt: "names is string[]. The callback passed to names.forEach does not annotate its parameter. What is the type of that parameter?",
    options: [
      "any, because an unannotated parameter is always any",
      "unknown, because forEach hides the array element type",
      "string[], because the callback receives the whole array",
      "string, because the parameter is contextually typed by forEach",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The parameter is string. forEach on a string array supplies that type from context.",
      why: "Contextual typing means an expression gets a type from the place it is used, rather than only from what is written inside it. forEach on string[] expects a callback whose first parameter is string, so the unannotated parameter takes that type. You can call string methods on it without an annotation. This is still inference, not a special case of forEach. If the callback is used where no function type is expected, noImplicitAny will reject the missing annotation instead of inventing string. The parameter is not the whole array, and it is not unknown.",
      wrong: [
        {
          option: "any, because an unannotated parameter is always any",
          reason: "any is the fallback when no context and no annotation exist. Here forEach provides the element type.",
        },
        {
          option: "unknown, because forEach hides the array element type",
          reason: "forEach exposes the element type. The callback parameter is string, not unknown.",
        },
        {
          option: "string[], because the callback receives the whole array",
          reason: "The first callback argument is one element. The array itself is not the parameter type.",
        },
      ],
      example: { lang: 'ts', source: "const names: string[] = ['ada', 'bea'];\nnames.forEach((name) => {\n  const upper: string = name.toUpperCase();\n  console.log(upper);\n});\nfunction lengths(values: string[]) {\n  return values.map((value) => value.length);\n}\nconst counts = lengths(names);\nvoid counts;" },
      remember: "An unannotated callback parameter takes its type from the function it is passed to.",
    },
  },
  {
    id: "ts-041",
    tech: "typescript",
    topic: "conditionals",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What are NotPending and OnlyPending?",
    code: {
      lang: "ts",
      source: "type Status = 'open' | 'closed' | 'pending';\ntype NotPending = Exclude<Status, 'pending'>;\ntype OnlyPending = Extract<Status, 'pending'>;",
    },
    options: [
      "NotPending is open or closed, and OnlyPending is pending",
      "NotPending is pending, and OnlyPending is open or closed",
      "Both are the full Status union",
      "Both are never",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Exclude removes pending and leaves open | closed. Extract keeps pending.",
      why: "Exclude and Extract are distributive conditional types in the standard library. Exclude keeps members of the first union that are not assignable to the second type, which is the same as returning never for the members you want to drop. Extract does the opposite and keeps only the members that are assignable to the second type. pending is assignable to pending, so it is removed by Exclude and kept by Extract. The other two literals stay in NotPending. Neither helper returns the original union or never for this input, because some members match and some do not.",
      wrong: [
        {
          option: "NotPending is pending, and OnlyPending is open or closed",
          reason: "That swaps the two helpers. Exclude drops the match, and Extract keeps the match.",
        },
        {
          option: "Both are the full Status union",
          reason: "Both helpers filter. pending is not left in the Exclude result, and the other members are not left in the Extract result.",
        },
        {
          option: "Both are never",
          reason: "never would mean every member was discarded. Each helper keeps a non-empty part of the union.",
        },
      ],
      example: { lang: 'ts', source: "type Status = 'open' | 'closed' | 'pending';\ntype NotPending = Exclude<Status, 'pending'>;\ntype OnlyPending = Extract<Status, 'pending'>;\nconst opened: NotPending = 'open';\nconst shut: NotPending = 'closed';\nconst waiting: OnlyPending = 'pending';\nfunction show(left: NotPending, right: OnlyPending) {\n  return [left, right];\n}\nshow(opened, waiting);\nvoid shut;" },
      remember: "Exclude removes members assignable to the second type. Extract keeps only those members.",
    },
  },
  {
    id: "ts-042",
    tech: "typescript",
    topic: "mapped",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What are Upper, Cap, and Low?",
    code: {
      lang: "ts",
      source: "type Upper = Uppercase<'ts'>;\ntype Cap = Capitalize<'ts'>;\ntype Low = Lowercase<'TS'>;",
    },
    options: [
      "The literals ts, ts, and TS",
      "The literals TS, Ts, and ts",
      "The literals Ts, TS, and ts",
      "The wide type string for all three",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Upper is TS, Cap is Ts, and Low is ts.",
      why: "Uppercase, Lowercase, Capitalize, and Uncapitalize are intrinsic string types, which means the compiler implements them directly rather than as a conditional you could write yourself. Uppercase changes every character, so the literal ts becomes TS, Capitalize changes only the first character, so ts becomes Ts, and Lowercase turns TS into ts. They distribute over a union of string literals, but applied to the wide type string they stay string, because there is no literal text to rewrite. They do not change a value at runtime, and they only compute a type.",
      wrong: [
        {
          option: "The literals ts, ts, and TS",
          reason: "That leaves the inputs unchanged or reversed. Each helper does rewrite the literal.",
        },
        {
          option: "The literals Ts, TS, and ts",
          reason: "That swaps Capitalize and Uppercase. Uppercase of ts is TS, and Capitalize of ts is Ts.",
        },
        {
          option: "The wide type string for all three",
          reason: "These helpers preserve literal types. The wide type string is what you get if the input was already string.",
        },
      ],
      example: { lang: 'ts', source: "type Upper = Uppercase<'ts'>;\ntype Cap = Capitalize<'ts'>;\ntype Low = Lowercase<'TS'>;\nconst upper: Upper = 'TS';\nconst cap: Cap = 'Ts';\nconst low: Low = 'ts';\nfunction show(a: string, b: string, c: string) {\n  return a + b + c;\n}\nshow(upper, cap, low);" },
      remember: "Uppercase and Lowercase rewrite every character. Capitalize and Uncapitalize rewrite the first.",
    },
  },
  {
    id: "ts-043",
    tech: "typescript",
    topic: "variance",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Why is the bare call read() a type error?",
    code: {
      lang: "ts",
      source: "type Box = { label: string };\nfunction read(this: Box) {\n  return this.label;\n}\nread();",
    },
    options: [
      "A this parameter is passed as the first runtime argument, so read() is the correct call",
      "Box is a value, so the call should be read(box) to supply this",
      "The this parameter is erased at runtime and only types the receiver, so a call with no receiver is an error",
      "call is illegal on a function that declares a this parameter",
    ],
    correctIndex: 2,
    explanation: {
      answer: "this: Box types the receiver and is erased. Calling read() provides no Box, so the call is rejected.",
      why: "A this parameter is a fake first parameter that exists only in the type. TypeScript removes it from the emitted JavaScript, so it is not a real argument you pass in the parentheses. It types this, the receiver, which is the object the function is called on. A bare call has a receiver of undefined or the global object, which is not a Box, so it is an error. The legal ways to supply a receiver are a method call on a Box, or read.call(box), or read.apply. Because the parameter is erased, the runtime function still looks like a zero-argument function, but the type will not let you call it that way.",
      wrong: [
        {
          option: "A this parameter is passed as the first runtime argument, so read() is the correct call",
          reason: "It is not a runtime argument. The bare call is exactly what the this type rejects.",
        },
        {
          option: "Box is a value, so the call should be read(box) to supply this",
          reason: "Box is only a type here, and this is not passed in the argument list. Use call or a method call.",
        },
        {
          option: "call is illegal on a function that declares a this parameter",
          reason: "call is a correct way to set the receiver. The illegal call is the bare read().",
        },
      ],
      example: { lang: 'ts', source: "type Box = { label: string };\nfunction read(this: Box) {\n  return this.label;\n}\nconst box: Box = { label: 'a' };\nread.call(box);" },
      remember: "A this parameter is erased and types the receiver. Calling the function with no receiver is an error.",
      fixedCode: {
        lang: "ts",
        source: "type Box = { label: string };\nfunction read(this: Box) {\n  return this.label;\n}\nconst box: Box = { label: 'a' };\nread.call(box);",
      },
    },
  },
  {
    id: "ts-044",
    tech: "typescript",
    topic: "variance",
    kind: "concept",
    difficulty: "expert",
    prompt: "What is the difference between a construct signature new (...args) => Instance and an abstract construct signature abstract new (...args) => Instance?",
    options: [
      "abstract new erases the class at runtime, and new leaves a runtime constructor",
      "Both signatures accept only abstract classes",
      "new (...args) => Instance is a function that returns a Promise of the instance",
      "new types a class you can construct. abstract new also accepts an abstract class, which you cannot construct directly",
    ],
    correctIndex: 3,
    explanation: {
      answer: "A construct signature types a concrete constructor. abstract new also allows an abstract class that still needs a subclass.",
      why: "A construct signature is written with new, a parameter list, and the instance type, and it describes a value you can call with new, such as a concrete class. An abstract class may be missing method bodies, so JavaScript will not let you construct it, and a plain construct signature rejects it for that reason. abstract new also accepts an abstract constructor, and you use it when a helper receives a base class and returns a subclass rather than calling new immediately. Neither form returns a Promise or erases the class, because both are types of constructors.",
      wrong: [
        {
          option: "abstract new erases the class at runtime, and new leaves a runtime constructor",
          reason: "Both are type-level signatures. abstract new does not delete a runtime value.",
        },
        {
          option: "Both signatures accept only abstract classes",
          reason: "The plain new signature accepts concrete constructors and rejects abstract classes.",
        },
        {
          option: "new (...args) => Instance is a function that returns a Promise of the instance",
          reason: "A construct signature types new. It is not an async function and does not wrap the instance in a Promise.",
        },
      ],
      example: { lang: 'ts', source: "class Item {\n  constructor(public id: string) {}\n}\ntype Build = new (id: string) => Item;\nabstract class BaseItem {\n  abstract id: string;\n}\ntype BaseBuild = abstract new (id: string) => BaseItem;\nfunction create(Ctor: Build, Base: BaseBuild) {\n  return { item: new Ctor('a'), Base };\n}\nconst made = create(Item, BaseItem);\nvoid made;" },
      remember: "new (...args) => Instance types a constructible class. abstract new also accepts an abstract class.",
    },
  },
  {
    id: "ts-045",
    tech: "typescript",
    topic: "config",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Why does this class fail to compile?",
    code: {
      lang: "ts",
      source: "class Base {\n  draw() {\n    return 'base';\n  }\n}\nclass Child extends Base {\n  override render() {\n    return 'child';\n  }\n}",
    },
    options: [
      "Base has no render method, so override is an error",
      "override is only legal on fields, not on methods",
      "Child must be abstract before it can use override",
      "draw and render match because both take no arguments, so override should be accepted",
    ],
    correctIndex: 0,
    explanation: {
      answer: "override render is an error because Base does not declare render.",
      why: "The override modifier says this method replaces a method of the same name on the base class, and TypeScript checks that the base actually has that member. Base has draw, not render, so the modifier is a mistake and the class fails. This check is separate from noImplicitOverride, which warns when you override a real base method without writing the keyword, and matching parameter counts is not enough because the names have to match. The fix is to override draw, or to add render to Base if a new method was the goal, and Child does not need to be abstract.",
      wrong: [
        {
          option: "override is only legal on fields, not on methods",
          reason: "override is used on methods. The failure is the missing base method, not the method form.",
        },
        {
          option: "Child must be abstract before it can use override",
          reason: "A concrete subclass can override. Abstract is unrelated to this error.",
        },
        {
          option: "draw and render match because both take no arguments, so override should be accepted",
          reason: "Override matches by name. A different name is a different method even when the parameters look alike.",
        },
      ],
      example: { lang: 'ts', source: "class Base {\n  draw() {\n    return 'base';\n  }\n}\nclass Child extends Base {\n  override draw() {\n    return 'child';\n  }\n}" },
      remember: "override is an error when the base class has no member with that name.",
      fixedCode: {
        lang: "ts",
        source: "class Base {\n  draw() {\n    return 'base';\n  }\n}\nclass Child extends Base {\n  override draw() {\n    return 'child';\n  }\n}",
      },
    },
  },
  {
    id: "ts-046",
    tech: "typescript",
    topic: "config",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A function returns T | null and its result is assigned to a variable of type T. This compiled while strictNullChecks was off. What breaks when strictNullChecks is turned on?",
    options: [
      "Every string type becomes string | null, so unrelated annotations change",
      "T | null is no longer assignable to T, so the missing null check becomes an error",
      "Unions are no longer allowed anywhere in the program",
      "null and undefined both become never, so the function return type itself is illegal",
    ],
    correctIndex: 1,
    explanation: {
      answer: "With strictNullChecks on, T | null is not assignable to T. The caller has to narrow away null first.",
      why: "strictNullChecks makes null and undefined real types instead of values that belong to every type. While the flag is off, null is ignored by assignability, so a function that returns T or null can be used as if it returned T, and turning the flag on stops that. The union really might be null, so the assignment to T is an error until you check for null and use the value in the branch where null has been ruled out. The flag does not rewrite every string, it does not ban unions, and null does not become never.",
      wrong: [
        {
          option: "Every string type becomes string | null, so unrelated annotations change",
          reason: "Existing string annotations stay string. The flag stops null from hiding inside types that do not mention it.",
        },
        {
          option: "Unions are no longer allowed anywhere in the program",
          reason: "Unions remain legal. T | null is a normal union, and it simply is not assignable to T.",
        },
        {
          option: "null and undefined both become never, so the function return type itself is illegal",
          reason: "null and undefined stay as their own types. The return type T | null is still a valid type.",
        },
      ],
      example: { lang: 'ts', source: "function load(): string | null {\n  return 'ok';\n}\nfunction label() {\n  const value = load();\n  if (value === null) {\n    return 'missing';\n  }\n  const text: string = value;\n  return text;\n}\nlabel();" },
      remember: "With strictNullChecks on, T | null is not assignable to T until you remove null.",
    },
  },
  {
    id: "ts-047",
    tech: "typescript",
    topic: "mapped",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What does Result do compared with User?",
    code: {
      lang: "ts",
      source: "type MyPartial<T> = { [K in keyof T]?: T[K] };\ntype User = { id: string; name: string };\ntype Result = MyPartial<User>;",
    },
    options: [
      "It makes id and name readonly and leaves them required",
      "It removes id and keeps name required",
      "It makes every property optional and keeps each value type as string",
      "It makes every property required and changes each value to string | undefined",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Result is User with id and name both optional, and each present value is still string.",
      why: "This mapped type visits every key and rebuilds the property with the same value type plus the optional modifier, which is the definition of Partial. Required is the same mapping with the minus optional modifier so the properties become mandatory again, Pick keeps only a chosen set of keys, and Omit drops keys by remapping rejected names to never with a conditional. A mapped type, sometimes together with a conditional, is therefore how Partial, Required, Pick, and Omit are built. This helper does not add readonly or delete id, and although reading an optional property can produce undefined because the property may be missing, the declared value type stays string.",
      wrong: [
        {
          option: "It makes id and name readonly and leaves them required",
          reason: "The modifier in the mapping is ?, not readonly. The properties become optional.",
        },
        {
          option: "It removes id and keeps name required",
          reason: "keyof User includes both names, and neither is remapped to never, so both remain as optional properties.",
        },
        {
          option: "It makes every property required and changes each value to string | undefined",
          reason: "The question mark makes them optional. Required would use -?, which this mapping does not.",
        },
      ],
      example: { lang: 'ts', source: "type MyPartial<T> = { [K in keyof T]?: T[K] };\ntype User = { id: string; name: string };\ntype Result = MyPartial<User>;\nconst user: Result = { id: 'a' };\nfunction read(value: Result) {\n  return value.name;\n}\nconst label = read(user);\nvoid label;" },
      remember: "Partial is a mapped type that adds ? to every property and keeps the value type.",
    },
  },
  {
    id: "ts-048",
    tech: "typescript",
    topic: "mapped",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Readonly is applied to Box. Which write is allowed?",
    code: {
      lang: "ts",
      source: "type Box = { inner: { n: number } };\nfunction edit(box: Readonly<Box>) {\n  box.inner = { n: 2 };\n  box.inner.n = 2;\n}",
    },
    options: [
      "Both writes are errors, because Readonly freezes nested objects too",
      "Only replacing box.inner is allowed",
      "Neither write is an error, because Readonly is only a compile-time name and checks nothing",
      "Replacing box.inner is an error, but assigning box.inner.n is allowed",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Replacing inner is an error. Writing inner.n is allowed because Readonly is shallow.",
      why: "Readonly is a mapped type that adds the readonly modifier to each property and leaves the value type as it was. Shallow means it does not walk into nested objects, so the inner property cannot be replaced, but the type of that inner object is still a plain object with a writable number field. A deep freeze is a different, hand-written mapped type that applies Readonly again when a property type is an object, and the standard helper does not do that. Both lines are still real type checks, so Readonly is not an ignored name.",
      wrong: [
        {
          option: "Both writes are errors, because Readonly freezes nested objects too",
          reason: "Only the top-level properties become readonly. The inner object keeps a writable n.",
        },
        {
          option: "Only replacing box.inner is allowed",
          reason: "That replacement is the one Readonly forbids. The nested write is the one it still allows.",
        },
        {
          option: "Neither write is an error, because Readonly is only a compile-time name and checks nothing",
          reason: "The readonly modifier is checked. Replacing inner is an error.",
        },
      ],
      example: { lang: 'ts', source: "type Box = { inner: { n: number } };\nfunction edit(box: Readonly<Box>) {\n  box.inner.n = 2;\n  return box.inner.n;\n}\nconst box: Readonly<Box> = { inner: { n: 1 } };\nconst next = edit(box);\nvoid next;" },
      remember: "Readonly is shallow. Nested objects stay writable unless you wrap them too.",
    },
  },
  {
    id: "ts-049",
    tech: "typescript",
    topic: "narrowing",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Why is shape.radius rejected?",
    code: {
      lang: "ts",
      source: "type Circle = { kind: 'circle'; radius: number };\ntype Square = { kind: 'square'; side: number };\nfunction measure(shape: Circle | Square) {\n  return shape.radius;\n}",
    },
    options: [
      "radius is not on Square, and a union lets you read a property only when every member has it, until you narrow",
      "kind is the only property name TypeScript allows on a union",
      "A union automatically selects the first member, so radius should have been accepted",
      "side and radius are both number, so they are interchangeable without a check",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Square has no radius, so the union does not let you read radius until you narrow to Circle.",
      why: "A union value might be any of its members at runtime, so TypeScript only lets you read a property that exists on every member. kind exists on both the circle and the square, so that shared tag is legal, but radius exists only on the circle, so the read is an error. Narrowing on the literal circle tag leaves the circle member, and radius is then safe. The union does not pick the first member for you, and two number fields with different names are not interchangeable.",
      wrong: [
        {
          option: "kind is the only property name TypeScript allows on a union",
          reason: "Any shared property can be read. kind is simply the only data property these two members share.",
        },
        {
          option: "A union automatically selects the first member, so radius should have been accepted",
          reason: "A union does not prefer the first member. The value might be a square, which has no radius.",
        },
        {
          option: "side and radius are both number, so they are interchangeable without a check",
          reason: "Property access is by name. A number named side does not satisfy a read of radius.",
        },
      ],
      example: { lang: 'ts', source: "type Circle = { kind: 'circle'; radius: number };\ntype Square = { kind: 'square'; side: number };\nfunction measure(shape: Circle | Square) {\n  if (shape.kind === 'circle') {\n    return shape.radius;\n  }\n  return shape.side;\n}" },
      remember: "On a union, you can read a property only when every member has it, unless you narrow first.",
      fixedCode: {
        lang: "ts",
        source: "type Circle = { kind: 'circle'; radius: number };\ntype Square = { kind: 'square'; side: number };\nfunction measure(shape: Circle | Square) {\n  if (shape.kind === 'circle') {\n    return shape.radius;\n  }\n  return shape.side;\n}",
      },
    },
  },
  {
    id: "ts-050",
    tech: "typescript",
    topic: "variance",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Which call is a type error?",
    code: {
      lang: "ts",
      source: "enum Color {\n  Red = 1,\n  Blue = 2,\n}\nfunction paint(color: Color) {\n  return color;\n}\nfunction take(n: number) {\n  return n;\n}\nconst widened: number = 4;\npaint(1);\npaint(4);\npaint(widened);\ntake(Color.Red);",
    },
    options: [
      "paint(1), paint(4), and take(Color.Red) all fail",
      "Only paint(4) fails. A numeric literal is accepted only when it matches a member, while a number-typed value and the enum used as a number are allowed",
      "All four calls succeed, because a numeric enum is identical to number",
      "Only take(Color.Red) fails, because a numeric enum is not assignable to number",
    ],
    correctIndex: 1,
    explanation: {
      answer: "paint(4) is the error. 4 is not a member value. paint(1), paint of a number, and take(Color.Red) are allowed.",
      why: "A numeric enum is nominal-ish: its member values are a special set of numbers, not a plain alias of number. A numeric literal is checked against those member values, so 1 is allowed because Red is 1, and 4 is rejected because no member has that value. A cast would be required to force 4 into the enum. A value that is already typed as number is assignable to the enum, which is a known hole, because the compiler no longer knows which number it is. In the other direction the enum member is assignable to number, so take(Color.Red) is fine. The enum is therefore not identical to number, but the ban on raw numbers is not total.",
      wrong: [
        {
          option: "paint(1), paint(4), and take(Color.Red) all fail",
          reason: "1 matches a member, and the enum member is assignable to number. Only the non-member literal fails.",
        },
        {
          option: "All four calls succeed, because a numeric enum is identical to number",
          reason: "The literal 4 is rejected. The enum is not a transparent alias of every number.",
        },
        {
          option: "Only take(Color.Red) fails, because a numeric enum is not assignable to number",
          reason: "The enum is assignable to number. The failing call is paint(4), in the other direction.",
        },
      ],
      example: { lang: 'ts', source: "enum Color {\n  Red = 1,\n  Blue = 2,\n}\nfunction paint(color: Color) {\n  return color;\n}\nfunction take(n: number) {\n  return n;\n}\nconst widened: number = 4;\npaint(1);\npaint(widened);\ntake(Color.Red);" },
      remember: "A non-member numeric literal is not assignable to a numeric enum. The enum itself is assignable to number.",
    },
  },
  {
    id: "ts-051",
    tech: "typescript",
    topic: "modules",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Why do these two declarations fail?",
    code: {
      lang: "ts",
      source: "type Box = { id: string };\ninterface Box {\n  name: string;\n}",
    },
    options: [
      "They merge into one Box with id and name",
      "The interface wins and the type alias is ignored, so the program compiles with only name",
      "A type alias and an interface do not merge, so the duplicate name is an error",
      "The type alias wins and the interface is ignored, so the program compiles with only id",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The duplicate name is an error. A type alias does not merge with an interface.",
      why: "Declaration merging combines some declarations that share a name, and two interfaces named Box would merge into one interface with both fields. A type alias is not one of the forms that merges, so it occupies the name and a later interface with that same name is a duplicate identifier. The compiler does not pick a winner and ignore the other declaration. If you want one shape, put both fields on a single interface or a single type alias, and if you wanted extension across files, both declarations need to be interfaces.",
      wrong: [
        {
          option: "They merge into one Box with id and name",
          reason: "That would happen for two interfaces. A type alias and an interface do not merge.",
        },
        {
          option: "The interface wins and the type alias is ignored, so the program compiles with only name",
          reason: "Neither declaration silently wins. The shared name is an error.",
        },
        {
          option: "The type alias wins and the interface is ignored, so the program compiles with only id",
          reason: "The alias does not override the interface. Both names conflict.",
        },
      ],
      example: { lang: 'ts', source: "interface Box {\n  id: string;\n  name: string;\n}" },
      remember: "A type alias and an interface with the same name do not merge. The name is a duplicate.",
      fixedCode: {
        lang: "ts",
        source: "interface Box {\n  id: string;\n  name: string;\n}",
      },
    },
  },
  {
    id: "ts-052",
    tech: "typescript",
    topic: "modules",
    kind: "concept",
    difficulty: "expert",
    prompt: "What does typeof import('./mod').default describe?",
    options: [
      "A runtime dynamic import, so the type is a Promise of the module",
      "The instance type of the default export, and it is always an instance even when the export is a class",
      "A merge of ./mod into the current file's scope",
      "The type of the default export's value, from a type query that does not itself emit a runtime import",
    ],
    correctIndex: 3,
    explanation: {
      answer: "It is the type of the module's default export. The query is type-only and is not a Promise.",
      why: "An import of a module path written in type position is a type query, which reads the module type without being a runtime call, and typeof of its default export is the type of that value. If the default export is a function you get the function type, and if it is a class you get the constructor type rather than the instance type, which would require InstanceType. A value-level import call is different, because that one is a real dynamic import whose type is a Promise of the module. The type query by itself does not emit that call, and it does not merge the other file into the current scope.",
      wrong: [
        {
          option: "A runtime dynamic import, so the type is a Promise of the module",
          reason: "A value-level import() returns a Promise. This typeof query is erased and names the export's type directly.",
        },
        {
          option: "The instance type of the default export, and it is always an instance even when the export is a class",
          reason: "typeof of a class is the constructor. The instance type needs InstanceType around that constructor.",
        },
        {
          option: "A merge of ./mod into the current file's scope",
          reason: "The query does not import names into scope and does not augment the current module.",
        },
      ],
      example: { lang: 'ts', source: "declare module 'widget-mod' {\n  export default function create(): { id: string };\n}\ntype DefaultExport = typeof import('widget-mod').default;\nfunction read(create: DefaultExport) {\n  return create().id;\n}\nconst sample: DefaultExport = () => ({ id: 'a' });\nread(sample);" },
      remember: "typeof import('./mod').default is the type of the default export, not a Promise and not automatically the instance.",
    },
  },
  {
    id: "ts-053",
    tech: "typescript",
    topic: "generics",
    kind: "scenario",
    difficulty: "expert",
    prompt: "wrap is declared as function wrap<T = string>(value?: T): T | undefined. You call wrap() with no arguments, wrap(10), and wrap<boolean>(true). When is the default string used?",
    options: [
      "Only for wrap(), where inference finds nothing and the caller passes no type argument",
      "For every call, because a default always overrides inference and explicit type arguments",
      "For wrap(10), because 10 is assignable to string and the default therefore wins",
      "For wrap<boolean>(true), because an explicit type argument resets back to the default",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The default string is used only for wrap(), where nothing is inferred and no type argument is written.",
      why: "A default type argument is the fallback written after equals on a type parameter, and it is used only when inference cannot choose a type and the caller does not supply one. A call with no argument has nothing to infer from, so the type parameter becomes string and the return type is string or undefined. Passing 10 infers the literal 10, so the default is ignored, and an explicit boolean type argument stays boolean. A default does not override successful inference or an explicit type argument, and it is unrelated to a constraint written with extends.",
      wrong: [
        {
          option: "For every call, because a default always overrides inference and explicit type arguments",
          reason: "Inference and an explicit type argument both win over the default. The default fills a gap only.",
        },
        {
          option: "For wrap(10), because 10 is assignable to string and the default therefore wins",
          reason: "The argument 10 is inferred as the literal 10. The default string is not consulted.",
        },
        {
          option: "For wrap<boolean>(true), because an explicit type argument resets back to the default",
          reason: "An explicit type argument is used as written. boolean stays boolean.",
        },
      ],
      example: { lang: 'ts', source: "function wrap<T = string>(value?: T): T | undefined {\n  return value;\n}\nconst fallback = wrap();\nconst text: string | undefined = fallback;\nconst numberValue: number | undefined = wrap(10);\nconst boolValue: boolean | undefined = wrap<boolean>(true);\nvoid text;\nvoid numberValue;\nvoid boolValue;" },
      remember: "A generic default is used only when inference and the caller both supply nothing.",
    },
  },
  {
    id: "ts-054",
    tech: "typescript",
    topic: "conditionals",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The author wanted one object whose value property is string | number. Result is a union of two objects. What went wrong, and what is the fix?",
    code: {
      lang: "ts",
      source: "type Id<T> = T extends any ? { value: T } : never;\ntype Result = Id<string | number>;",
    },
    options: [
      "any blocks the conditional, so Result is any. Remove any from the check",
      "The naked check distributes, producing one object per member. Wrap both sides as [T] extends [any] to check the union once",
      "value must already be a tuple, so the property should be declared as value: [T]",
      "string | number is never, so the false branch ran for both members",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The naked T extends any distributes, so Result is { value: string } | { value: number }. A tuple wrapper checks the union once.",
      why: "A check of a naked type parameter against any looks pointless because every type extends any, but that naked parameter makes the conditional distributive. Distribution splits string from number, runs the true branch for each member, and unions the objects, so you get one object holding string and another holding number rather than one object whose value is the union. The false branch does not run for these members, and the result is not any. Wrapping both sides in a one-element tuple stops distribution, because the checked type is no longer bare, so the original union stays inside a single object.",
      wrong: [
        {
          option: "any blocks the conditional, so Result is any. Remove any from the check",
          reason: "any does not collapse the conditional to any. The split into two objects is distribution.",
        },
        {
          option: "value must already be a tuple, so the property should be declared as value: [T]",
          reason: "Changing the property to a tuple does not stop distribution. You would still get two objects.",
        },
        {
          option: "string | number is never, so the false branch ran for both members",
          reason: "Both members extend any, so the true branch runs twice. never is not the result.",
        },
      ],
      example: { lang: 'ts', source: "type Id<T> = [T] extends [any] ? { value: T } : never;\ntype Result = Id<string | number>;" },
      remember: "To stop a conditional from distributing, check [T] extends [any] instead of T extends any.",
      fixedCode: {
        lang: "ts",
        source: "type Id<T> = [T] extends [any] ? { value: T } : never;\ntype Result = Id<string | number>;",
      },
    },
  },
  {
    id: "ts-055",
    tech: "typescript",
    topic: "variance",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "strictFunctionTypes is on. This assignment is accepted, and dogsOnly.add(cat) type-checks, but the method reads breed. What is the bug?",
    code: {
      lang: "ts",
      source: "type Animal = { name: string };\ntype Dog = { name: string; breed: string };\ntype Kennel = {\n  add(animal: Animal): void;\n};\nconst dogsOnly: Kennel = {\n  add(animal: Dog) {\n    console.log(animal.breed);\n  },\n};\nconst cat: Animal = { name: 'cat' };\ndogsOnly.add(cat);",
    },
    options: [
      "cat is not an Animal, because it has no breed property",
      "console.log cannot print a string property, so breed is the type error",
      "Method syntax stays bivariant, so a method that requires Dog is accepted where Animal will be passed",
      "strictFunctionTypes rejects this method, so the assignment cannot be the bug",
    ],
    correctIndex: 2,
    explanation: {
      answer: "add is a method, so its parameter is bivariant and the Dog implementation is allowed even though a cat can be passed.",
      why: "Bivariant means the checker allows a method parameter to be either a wider type or a narrower type than the base method. Dog is narrower than Animal, so an add that only accepts Dog is not safe where callers may pass any Animal. strictFunctionTypes would reject that if add were a function property, written as an arrow type on the property. Method syntax is the historical exception, and the strict flag does not apply to it, so the assignment compiles. dogsOnly.add(cat) is then allowed by Kennel's public type, and the body reads breed on a cat that has no breed. Declare add as a function property so the parameter is checked contravariantly, and implement it to accept Animal.",
      wrong: [
        {
          option: "cat is not an Animal, because it has no breed property",
          reason: "A cat with a name is an Animal. The unsound part is the method accepting Dog where Animal is required.",
        },
        {
          option: "console.log cannot print a string property, so breed is the type error",
          reason: "The log is fine. The bug is that breed is read on a value that was only known to be an Animal.",
        },
        {
          option: "strictFunctionTypes rejects this method, so the assignment cannot be the bug",
          reason: "The flag does not apply to method syntax. The assignment is accepted, and that acceptance is the bug.",
        },
      ],
      example: { lang: 'ts', source: "type Animal = { name: string };\ntype Kennel = {\n  add: (animal: Animal) => void;\n};\nconst dogsOnly: Kennel = {\n  add(animal) {\n    console.log(animal.name);\n  },\n};\nconst cat: Animal = { name: 'cat' };\ndogsOnly.add(cat);" },
      remember: "strictFunctionTypes does not apply to methods, so a method parameter can be unsoundly narrower.",
      fixedCode: {
        lang: "ts",
        source: "type Animal = { name: string };\ntype Kennel = {\n  add: (animal: Animal) => void;\n};\nconst dogsOnly: Kennel = {\n  add(animal) {\n    console.log(animal.name);\n  },\n};\nconst cat: Animal = { name: 'cat' };\ndogsOnly.add(cat);",
      },
    },
  },
] satisfies Question[];
