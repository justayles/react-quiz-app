import type { Question } from '../types';

export const react19aQuestions = [
  {
    id: "r19a-001",
    tech: "react19",
    topic: "rsc",
    kind: "concept",
    difficulty: "advanced",
    prompt: "In a React Server Components app, what is a module that has no directive at the top?",
    options: [
      "A Server Component that renders on the server",
      "A Client Component, because React 19 defaults to the browser",
      "A Server Action module, because the server is the default runtime",
      "Nothing yet, until the file adds 'use client' or 'use server'",
    ],
    correctIndex: 0,
    explanation: {
      answer: "A file with no directive is a Server Component. It renders on the server until a module opts into the client bundle.",
      why: "A Server Component is a component that runs on the server and sends finished UI to the browser. With no directive at the top, that is the default in a React Server Components app. A directive is a string such as 'use client' or 'use server' at the top of a file that changes how the bundler treats the module. A client boundary is the 'use client' mark, and it sends that module plus the modules it imports to the browser. 'use server' does not choose the component type, because it marks Server Actions, which are async functions the browser can ask the server to run.",
      wrong: [
        {
          option: "A Client Component, because React 19 defaults to the browser",
          reason: "Client Components are the opt-in path. You add 'use client' when a module needs the browser.",
        },
        {
          option: "A Server Action module, because the server is the default runtime",
          reason: "A Server Action module starts with 'use server'. The default file is a Server Component, not an action module.",
        },
        {
          option: "Nothing yet, until the file adds 'use client' or 'use server'",
          reason: "The file is already a Server Component. Directives change that default or mark actions.",
        },
      ],
      example: { lang: 'tsx', source: "import { ProductList } from './product-list';\n\nexport default async function Page() {\n  const title = await loadTitle();\n  return (\n    <main>\n      <h1>{title}</h1>\n      <ProductList />\n    </main>\n  );\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Catalog';\n}\n" },
      remember: "No directive means the file is a Server Component.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-002",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "product-details.tsx is an async Server Component and has no 'use client' directive. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { ProductDetails } from './product-details';\n\nexport function ProductFrame() {\n  return (\n    <section>\n      <ProductDetails id='sku-9' />\n    </section>\n  );\n}\n",
    },
    options: [
      "'use client' must sit under the import, or the bundler ignores it",
      "ProductFrame cannot import ProductDetails, because a Client Component cannot import a Server Component",
      "ProductDetails must return a string, because a client frame only accepts text children",
      "The id prop must be a number, because server modules reject string props",
    ],
    correctIndex: 1,
    explanation: {
      answer: "ProductFrame cannot import ProductDetails. A Client Component cannot import a Server Component.",
      why: "A Client Component is a component in a file marked 'use client', so it runs in the browser. The import line pulls ProductDetails into that client module. A Server Component is a component that stays on the server, and the client bundle cannot include it. The supported path is to render ProductDetails in a Server Component and pass the finished UI through as children or another prop. Children means UI the parent already created and handed in, so the server child is not imported by the client file.",
      wrong: [
        {
          option: "'use client' must sit under the import, or the bundler ignores it",
          reason: "The directive belongs at the top of the file, above imports. Moving it down is not valid and does not fix the import.",
        },
        {
          option: "ProductDetails must return a string, because a client frame only accepts text children",
          reason: "Client components can render elements. The failure is the import across the client boundary, not the return type.",
        },
        {
          option: "The id prop must be a number, because server modules reject string props",
          reason: "A string is a serializable prop. The bug is importing a Server Component from a Client Component.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport type { ReactNode } from 'react';\n\nexport function ProductFrame(props: { children: ReactNode }) {\n  return <section>{props.children}</section>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport type { ReactNode } from 'react';\n\nexport function ProductFrame(props: { children: ReactNode }) {\n  return <section>{props.children}</section>;\n}\n" },
      remember: "Import Client Components into Server Components, and pass server UI through as children.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-003",
    tech: "react19",
    topic: "rsc",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Clock is a Client Component. What happens when this Server Component renders it?",
    code: {
      lang: "tsx",
      source: "import { Clock } from './clock';\n\nexport default function Page() {\n  return <Clock when={new Date('2026-10-30T12:00:00.000Z')} />;\n}\n",
    },
    options: [
      "Clock receives a live Date and can call getTime on it",
      "React turns the Date into an ISO string before Clock sees it",
      "Rendering fails because a Date is not a serializable prop",
      "React drops the prop, so when is undefined in Clock",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The render fails because a Date cannot cross to a Client Component. Pass an ISO string instead.",
      why: "A Client Component runs in the browser, so props from the server must be serializable. Serializable means React can turn the value into a plain message and rebuild it on the client. Plain objects, arrays, strings, numbers, and promises can make that trip. A Date is a class instance, and class instances are not rebuilt as dates. Pass the time as an ISO string, which is the plain text form of a date and time, and format that string in Clock.",
      wrong: [
        {
          option: "Clock receives a live Date and can call getTime on it",
          reason: "The Date is created on the server and is not a supported prop type for a Client Component.",
        },
        {
          option: "React turns the Date into an ISO string before Clock sees it",
          reason: "React does not convert dates for you. The caller has to pass a string.",
        },
        {
          option: "React drops the prop, so when is undefined in Clock",
          reason: "Unsupported props fail the render. React does not silently omit a Date.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "import { Clock } from './clock';\n\nexport default function Page() {\n  const when = '2026-10-30T12:00:00.000Z';\n  return <Clock when={when} />;\n}\n",
      },
      example: { lang: 'tsx', source: "import { Clock } from './clock';\n\nexport default function Page() {\n  const when = '2026-10-30T12:00:00.000Z';\n  return <Clock when={when} />;\n}\n" },
      remember: "Pass an ISO string to the client, not a Date.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-004",
    tech: "react19",
    topic: "rsc",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A client theme provider must wrap part of a page, and a Server Component must still render in that slot. Which composition is supported?",
    options: [
      "Import the Server Component into the provider file and render it beside the provider",
      "Call use on the theme context inside the Server Component after the provider wraps it",
      "Add 'use client' to the Server Component so it can read context and still await the database",
      "Render the provider from a Server Component and pass the server child as children",
    ],
    correctIndex: 3,
    explanation: {
      answer: "A Server Component renders the client provider and passes the server child as children. That child still renders on the server.",
      why: "A context provider is a Client Component that holds a value for descendants that read it in the browser. That value is not available to a Server Component, even when the provider wraps it in the tree. The supported composition is a Server Component that renders the provider and passes another Server Component as children. Children are UI the server already rendered and then passed through the client component. The child stays a Server Component, and it still cannot read the client context.",
      wrong: [
        {
          option: "Import the Server Component into the provider file and render it beside the provider",
          reason: "The provider file is a Client Component, and a Client Component cannot import a Server Component.",
        },
        {
          option: "Call use on the theme context inside the Server Component after the provider wraps it",
          reason: "A client provider does not make its context available to a Server Component.",
        },
        {
          option: "Add 'use client' to the Server Component so it can read context and still await the database",
          reason: "Adding 'use client' makes the module a Client Component, so it can no longer await server data as a Server Component.",
        },
      ],
      example: { lang: 'tsx', source: "import { ThemeProvider } from './theme-provider';\nimport { ProductList } from './product-list';\n\nexport default async function Page() {\n  const title = await loadTitle();\n  return (\n    <ThemeProvider>\n      <h1>{title}</h1>\n      <ProductList />\n    </ThemeProvider>\n  );\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Catalog';\n}\n" },
      remember: "Pass server UI through a client provider as children. The child still renders on the server.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-005",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "This file has no directive. What is the bug?",
    code: {
      lang: "tsx",
      source: "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n",
    },
    options: [
      "useState and the click handler are client-only, and this file has no 'use client' directive",
      "useState must be renamed to useActionState in a Server Component",
      "The button text must be a prop, because Server Components cannot render numbers",
      "The click handler is allowed, but useState must be called after an await",
    ],
    correctIndex: 0,
    explanation: {
      answer: "This Server Component calls useState and defines a click handler. Both belong in a Client Component.",
      why: "With no directive, Counter is a Server Component, which runs on the server and does not stay alive in the browser. useState is a hook that stores a value between browser renders, and a hook is a function React must call in the same order each time. A Server Component cannot call useState, useEffect, or useLayoutEffect. The onClick function is an event handler, which is code that runs after a click, and a Server Component cannot define one unless it is a Server Action passed to a form. Add 'use client' at the top so this counter ships to the browser.",
      wrong: [
        {
          option: "useState must be renamed to useActionState in a Server Component",
          reason: "useActionState tracks a form action. It does not turn a Server Component into a place that can store click state.",
        },
        {
          option: "The button text must be a prop, because Server Components cannot render numbers",
          reason: "Server Components can render numbers and strings. The illegal parts are useState and the click handler.",
        },
        {
          option: "The click handler is allowed, but useState must be called after an await",
          reason: "Awaiting does not enable hooks. This file cannot call useState or define this click handler.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n" },
      remember: "State and click handlers belong in a file marked 'use client'.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-006",
    tech: "react19",
    topic: "rsc",
    kind: "concept",
    difficulty: "expert",
    prompt: "Which values can a Server Component pass as props to a Client Component?",
    options: [
      "A class instance, a symbol, and a function declared in the server file",
      "A plain object, an array, a string, a number, a promise, or a Server Action",
      "A Date, a Map, and localStorage, because the client rebuilds them",
      "Any JavaScript value, because React copies the prototype with the prop",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Pass plain objects, arrays, strings, numbers, promises, and Server Actions. Other functions, class instances, symbols, and dates stay on the server.",
      why: "Props that cross to a Client Component must be serializable, which means React can pack them into a message and unpack the same data in the browser. Plain objects, arrays, strings, numbers, and promises are in that set. A normal function is not, but a Server Action is the exception, because React replaces it with a reference the browser can call. A class instance, a symbol, and a Date are not in the set. Pass fields off the class, and pass an ISO string instead of a Date.",
      wrong: [
        {
          option: "A class instance, a symbol, and a function declared in the server file",
          reason: "Those values are not serializable. A function crosses only when it is a Server Action.",
        },
        {
          option: "A Date, a Map, and localStorage, because the client rebuilds them",
          reason: "Dates and maps are not serializable props, and localStorage is a browser API the server component cannot use.",
        },
        {
          option: "Any JavaScript value, because React copies the prototype with the prop",
          reason: "React does not send prototypes, class instances, or symbols to the client.",
        },
      ],
      example: { lang: 'tsx', source: "import { ProfileCard } from './profile-card';\nimport { saveName } from './save-name';\n\nexport default function Page() {\n  const profile = { id: 'u1', name: 'Ada', projects: 3 };\n  const tags = ['react', 'rsc'];\n  const notes = Promise.resolve('Notes');\n  return (\n    <ProfileCard\n      profile={profile}\n      tags={tags}\n      notes={notes}\n      save={saveName}\n    />\n  );\n}\n" },
      remember: "Send plain data, promises, or Server Actions. Keep functions, classes, symbols, and dates on the server.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-007",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "SaveButton is a Client Component. What is the bug in this Server Component?",
    code: {
      lang: "tsx",
      source: "import { SaveButton } from './save-button';\n\nexport default function Page() {\n  function save() {\n    console.log('save');\n  }\n  return <SaveButton onSave={save} />;\n}\n",
    },
    options: [
      "console.log is a server-only API, so the log line must move into a database module",
      "SaveButton must be async, because every client child of a page is async",
      "save is a plain function, and only a Server Action may be passed to a Client Component",
      "save is missing a Promise return type, which is required for every prop",
    ],
    correctIndex: 2,
    explanation: {
      answer: "save is a plain function, so it cannot be a prop of SaveButton. A function crosses only when it is a Server Action.",
      why: "Page is a Server Component, and SaveButton is a Client Component in the browser. Props between them must be serializable, which means React can pack the value into a message. The save function closes over server code and is not serializable. A Server Action is the one function exception, because it is an async function the browser is allowed to call on the server. A click handler that only logs belongs inside SaveButton itself. The page should render SaveButton with no function prop.",
      wrong: [
        {
          option: "console.log is a server-only API, so the log line must move into a database module",
          reason: "console.log is not the bug. The bug is passing a plain function across the client boundary.",
        },
        {
          option: "SaveButton must be async, because every client child of a page is async",
          reason: "Client Components are not required to be async. The illegal prop is the function.",
        },
        {
          option: "save is missing a Promise return type, which is required for every prop",
          reason: "A return type would not make this function serializable. It is still a plain function prop.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "import { SaveButton } from './save-button';\n\nexport default function Page() {\n  return <SaveButton />;\n}\n",
      },
      example: { lang: 'tsx', source: "import { SaveButton } from './save-button';\n\nexport default function Page() {\n  return (\n    <SaveButton />\n  );\n}\n" },
      remember: "Do not pass plain functions to a Client Component. Pass a Server Action, or put the handler in the client file.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-008",
    tech: "react19",
    topic: "rsc",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A database module must never be included in the browser bundle. What should you do?",
    options: [
      "Name the file db.server.ts and rely on that file name alone",
      "Add 'use server' at the top of the database module",
      "Pass the database client object into a Client Component and call it there",
      "Import the server-only package in the database module so a client import throws",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Import the server-only package from the database module. If a Client Component pulls that module in, the import throws.",
      why: "The server-only package is a small module whose client entry throws an error. You import it at the top of a server module that reads the database or holds secrets. A Client Component is browser code, and the client bundle is the JavaScript sent to the browser. If that bundle imports the database module, server-only throws and the mistake fails fast. A file name does not create this guard, and 'use server' marks Server Actions rather than blocking imports.",
      wrong: [
        {
          option: "Name the file db.server.ts and rely on that file name alone",
          reason: "A file name is a convention. It does not throw when the client bundle imports the module.",
        },
        {
          option: "Add 'use server' at the top of the database module",
          reason: "'use server' marks exported async functions as Server Actions. It is not the guard that keeps a module off the client.",
        },
        {
          option: "Pass the database client object into a Client Component and call it there",
          reason: "A database client is a class instance full of secrets. It must not be a prop of a Client Component.",
        },
      ],
      example: { lang: 'tsx', source: "import 'server-only';\n\nexport async function loadUser(id: string): Promise<{ name: string }> {\n  const row = await readRow(id);\n  return { name: row.name };\n}\n\nasync function readRow(id: string): Promise<{ name: string }> {\n  return { name: id };\n}\n" },
      remember: "Import server-only in modules that must stay on the server.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-009",
    tech: "react19",
    topic: "rsc",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "read-secret.ts starts with import 'server-only' and then reads the database. What happens when this client file is bundled?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { readSecret } from './read-secret';\n\nexport function Panel() {\n  return <p>{readSecret()}</p>;\n}\n",
    },
    options: [
      "Bundling throws because server-only is pulled into the client bundle",
      "readSecret runs on the server and Panel receives a string prop",
      "React strips the server-only import and replaces readSecret with an empty function",
      "The module loads in the browser and server-only changes the export to null",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The client bundle throws. Panel imports a module that imports server-only, so that secret module is pulled into the browser graph.",
      why: "The file starts with 'use client', so Panel and everything it imports are bundled for the browser. The client bundle is the JavaScript the browser downloads. The secret module imports the server-only package, which throws when that module is included in the client bundle. React does not run readSecret on the server just because the name sounds secret. The throw is the guard that keeps the database module out of the browser.",
      wrong: [
        {
          option: "readSecret runs on the server and Panel receives a string prop",
          reason: "Panel calls readSecret in the client module. That is an import, not a serializable string prop from the server.",
        },
        {
          option: "React strips the server-only import and replaces readSecret with an empty function",
          reason: "React does not delete the import. server-only throws when the client graph includes it.",
        },
        {
          option: "The module loads in the browser and server-only changes the export to null",
          reason: "server-only does not turn the export into null. It throws.",
        },
      ],
      example: { lang: 'tsx', source: "import 'server-only';\n\nexport async function readSecret(): Promise<string> {\n  const row = await readRow();\n  return row.name;\n}\n\nasync function readRow(): Promise<{ name: string }> {\n  return { name: 'Ada' };\n}\n" },
      remember: "A client import of a server-only module throws.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-010",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "ApiWidget is a Client Component. These calls are the taintUniqueValue and taintObjectReference server APIs. What happens?",
    code: {
      lang: "tsx",
      source: "import { experimental_taintObjectReference, experimental_taintUniqueValue } from 'react';\nimport { ApiWidget } from './api-widget';\n\nexport default function Page() {\n  const token = 'sk-live-7f3a9c2e1b';\n  const user = { id: 'u1', name: 'Ada' };\n  experimental_taintUniqueValue(\n    'Do not pass the API token to the client.',\n    globalThis,\n    token,\n  );\n  experimental_taintObjectReference('Do not pass the user record to the client.', user);\n  return <ApiWidget token={token} />;\n}\n",
    },
    options: [
      "taintUniqueValue only runs in a file that starts with 'use client'",
      "Passing the tainted token into ApiWidget throws, because a secret must not be a Client Component prop",
      "The token is empty on the server, so ApiWidget must read it in the browser",
      "The message argument must be an Error object, not a string",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Rendering throws because the tainted token is passed to ApiWidget. Do not pass secrets to a Client Component.",
      why: "taintUniqueValue marks a unique secret such as a token, key, or password so React can reject it later. Its export name is experimental_taintUniqueValue, and the middle argument is a lifetime object that keeps the mark alive. taintObjectReference marks one object, such as a user record, and its export name is experimental_taintObjectReference. Passing a tainted value to a Client Component throws. The token has to stay on the server, and ApiWidget should receive plain data that is safe to show.",
      wrong: [
        {
          option: "taintUniqueValue only runs in a file that starts with 'use client'",
          reason: "These taint APIs are server APIs. They exist so server code can refuse to send a value to the client.",
        },
        {
          option: "The token is empty on the server, so ApiWidget must read it in the browser",
          reason: "The token is a string in this server file. The failure is passing that tainted string to the client.",
        },
        {
          option: "The message argument must be an Error object, not a string",
          reason: "The message is a string. React uses that string in the error it throws when the value is passed to the client.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "import { ApiWidget } from './api-widget';\n\nexport default async function Page() {\n  const summary = await loadSummary();\n  return <ApiWidget summary={summary} />;\n}\n\nasync function loadSummary(): Promise<string> {\n  return 'Ada has 3 projects';\n}\n",
      },
      example: { lang: 'tsx', source: "import { ApiWidget } from './api-widget';\n\nexport default async function Page() {\n  const summary = await loadSummary();\n  return <ApiWidget summary={summary} />;\n}\n\nasync function loadSummary(): Promise<string> {\n  return 'Ada has 3 projects';\n}\n" },
      remember: "Taint secrets, and never pass the tainted value to a Client Component.",
      docs: "https://react.dev/reference/react/experimental_taintUniqueValue",
    },
  },
  {
    id: "r19a-011",
    tech: "react19",
    topic: "rsc",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does a 'use client' directive at the top of a file apply to?",
    options: [
      "Only the component that is exported as the default",
      "Only the event handlers in that file, while the component stays a Server Component",
      "That module and every module it imports, which are bundled for the client",
      "The whole app, including parent Server Components that render this file",
    ],
    correctIndex: 2,
    explanation: {
      answer: "'use client' marks that module and the modules it imports as client code. Parent Server Components that render it stay on the server.",
      why: "A directive is the string at the top of a file that tells the bundler how to treat the module. 'use client' opens a client boundary, which is the line between server code and browser code. The bundler includes that file and its imports in the client bundle, the JavaScript sent to the browser. A parent Server Component can import this file and render it. That parent does not become client code.",
      wrong: [
        {
          option: "Only the component that is exported as the default",
          reason: "The directive covers the whole module, including helpers and every other export.",
        },
        {
          option: "Only the event handlers in that file, while the component stays a Server Component",
          reason: "The component in that file is a Client Component. The directive is not limited to handlers.",
        },
        {
          option: "The whole app, including parent Server Components that render this file",
          reason: "Parents stay on the server. Only this module and the modules it imports are client code.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { formatCount } from './format-count';\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  const label = formatCount(count);\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      {label}\n    </button>\n  );\n}\n" },
      remember: "'use client' bundles that file and its imports, not the server parents.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-012",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "This file has no directive. What is the bug?",
    code: {
      lang: "tsx",
      source: "export default function Greeting() {\n  const name = window.localStorage.getItem('name');\n  return <h1>Hello {name}</h1>;\n}\n",
    },
    options: [
      "window is allowed in a Server Component, but localStorage must be awaited",
      "The bug is a missing 'use server' directive, which turns on browser APIs",
      "getItem returns a promise in React 19, so name must be unwrapped with use",
      "window and localStorage are browser APIs, and a Server Component cannot call them",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Greeting is a Server Component, so it cannot read window or localStorage. Browser storage has to be read in a Client Component after the page is showing.",
      why: "With no directive, Greeting is a Server Component and runs on the server. window and localStorage are browser APIs, which means they exist in the browser and not on the server. A Server Component also cannot call useState, useEffect, or useLayoutEffect. 'use server' would mark Server Actions, and it does not enable browser APIs. Move this UI to a file with 'use client', store the name in state, and read localStorage inside useEffect, which runs after the component is on the page.",
      wrong: [
        {
          option: "window is allowed in a Server Component, but localStorage must be awaited",
          reason: "window is a browser global. The server render cannot read it, and await does not create it.",
        },
        {
          option: "The bug is a missing 'use server' directive, which turns on browser APIs",
          reason: "'use server' marks Server Actions. It does not provide window or localStorage.",
        },
        {
          option: "getItem returns a promise in React 19, so name must be unwrapped with use",
          reason: "getItem returns a string or null in the browser. The bug is calling a browser API from a Server Component.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport default function Greeting() {\n  const [name, setName] = useState('');\n  useEffect(() => {\n    const stored = window.localStorage.getItem('name');\n    if (stored) {\n      setName(stored);\n    }\n  }, []);\n  return <h1>Hello {name}</h1>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport default function Greeting() {\n  const [name, setName] = useState('');\n  useEffect(() => {\n    const stored = window.localStorage.getItem('name');\n    if (stored) {\n      setName(stored);\n    }\n  }, []);\n  return <h1>Hello {name}</h1>;\n}\n" },
      remember: "Read window and localStorage in a Client Component, not in a Server Component.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-013",
    tech: "react19",
    topic: "rsc",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A Server Component loaded a user and a Client Component button needs the id and the name. What should you pass?",
    options: [
      "A plain object with the id and the name",
      "The class instance from the database, so its methods stay attached",
      "A symbol keyed by the user id, so the client can look the user up",
      "A function that closes over the row and returns the name",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Pass a plain object with the id and the name. Those fields are serializable props.",
      why: "Serializable means React can pack a value into a message and rebuild it in the browser. A plain object of strings is in that set, along with arrays, numbers, and promises. A class instance is an object built with new, and its methods do not cross to a Client Component. A symbol is a unique key value that is not serializable. A function crosses only when it is a Server Action, not when it closes over a database row.",
      wrong: [
        {
          option: "The class instance from the database, so its methods stay attached",
          reason: "Class instances are not serializable props. Pass the plain fields you need.",
        },
        {
          option: "A symbol keyed by the user id, so the client can look the user up",
          reason: "Symbols are not serializable, and the client should not look the row up in the database.",
        },
        {
          option: "A function that closes over the row and returns the name",
          reason: "A plain function is not a legal prop. Pass the name string itself.",
        },
      ],
      example: { lang: 'tsx', source: "import { UserButton } from './user-button';\n\nexport default async function Page() {\n  const row = await loadUser();\n  const user = { id: row.id, name: row.name };\n  return <UserButton user={user} />;\n}\n\nasync function loadUser(): Promise<{ id: string; name: string }> {\n  return { id: 'u1', name: 'Ada' };\n}\n" },
      remember: "Pass plain fields such as id and name, not the database object.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-014",
    tech: "react19",
    topic: "rsc",
    kind: "code-output",
    difficulty: "expert",
    prompt: "This file has no directive. What happens when Page renders?",
    code: {
      lang: "tsx",
      source: "export default async function Page() {\n  const title = await loadTitle();\n  return <h1>{title}</h1>;\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Notes';\n}\n",
    },
    options: [
      "The component throws, because Server Components cannot be async",
      "Page may await, and the heading is rendered on the server with the loaded title",
      "await is ignored, and the heading prints the promise as text",
      "The file must start with 'use server', or the async function is rejected",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Page is a Server Component, so it may be async and it may await. The heading renders on the server with the title string.",
      why: "A Server Component runs on the server and can be an async function. await pauses that function until the promise finishes, then continues with the value. loadTitle resolves to the string Notes, and the heading uses that string. 'use server' is not required, because that directive marks Server Actions rather than allowing await. In this server file, await the data instead of calling use on the promise.",
      wrong: [
        {
          option: "The component throws, because Server Components cannot be async",
          reason: "Server Components may be async. That is how they load data before rendering.",
        },
        {
          option: "await is ignored, and the heading prints the promise as text",
          reason: "await reads the string. The heading does not receive the promise object.",
        },
        {
          option: "The file must start with 'use server', or the async function is rejected",
          reason: "Async Server Components do not use 'use server'. That directive marks Server Actions.",
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const title = await loadTitle();\n  return <h1>{title}</h1>;\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Notes';\n}\n" },
      remember: "Server Components may be async and may await their data.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-015",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "This file has no directive. What is the bug?",
    code: {
      lang: "tsx",
      source: "export default function Page() {\n  return <button onClick={() => console.log('hi')}>Hi</button>;\n}\n",
    },
    options: [
      "console.log must be imported from react-dom/server",
      "The button needs type submit, or React strips onClick",
      "The click handler is a function defined in a Server Component, which is not allowed",
      "Server Components can use onClick, but the handler must be named handleClick",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Page cannot define this click handler. An event handler in a Server Component is only allowed when it is a Server Action passed to a form.",
      why: "With no directive, Page is a Server Component and runs on the server. An event handler is a function that runs later in the browser, such as onClick. Server Components do not ship those functions to the browser. The exception is a Server Action, an async function passed to a form action so the browser can post the form. This button logs a click, so the handler belongs in a Client Component marked 'use client'.",
      wrong: [
        {
          option: "console.log must be imported from react-dom/server",
          reason: "console.log does not come from react-dom. The bug is the event handler on a Server Component.",
        },
        {
          option: "The button needs type submit, or React strips onClick",
          reason: "type submit would make a form button. It does not make this onClick legal in a Server Component.",
        },
        {
          option: "Server Components can use onClick, but the handler must be named handleClick",
          reason: "The name of the function does not matter. A Server Component cannot define this kind of handler.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nexport default function Page() {\n  return <button onClick={() => console.log('hi')}>Hi</button>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nexport default function Page() {\n  return (\n    <button onClick={() => console.log('hi')}>Hi</button>\n  );\n}\n" },
      remember: "Define click handlers in a Client Component. A Server Component may pass a Server Action to a form.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-016",
    tech: "react19",
    topic: "rsc",
    kind: "concept",
    difficulty: "expert",
    prompt: "A file starts with 'use server' and also exports a React component. What is true?",
    options: [
      "The component is a Server Component because 'use server' selects the server runtime",
      "The component is a Client Component because actions always run in the browser",
      "Every export becomes both a Client Component and a Server Action",
      "'use server' marks Server Actions, not Server Components, so a component export is the wrong use of that file",
    ],
    correctIndex: 3,
    explanation: {
      answer: "'use server' marks Server Actions. It does not mark a component as a Server Component.",
      why: "A Server Action is an async function the browser can ask the server to run. A file that starts with 'use server' exports those actions, and each export must be async. A Server Component is a different thing: it is the default component type and it has no directive of its own. Putting a component in a 'use server' file does not make it a Server Component and does not make it a Client Component. Keep components out of that file and export async actions only.",
      wrong: [
        {
          option: "The component is a Server Component because 'use server' selects the server runtime",
          reason: "There is no directive that selects Server Components. 'use server' is for actions.",
        },
        {
          option: "The component is a Client Component because actions always run in the browser",
          reason: "Server Actions run on the server. 'use server' does not mark client components.",
        },
        {
          option: "Every export becomes both a Client Component and a Server Action",
          reason: "Exports from a 'use server' file are actions. A component is not an action.",
        },
      ],
      example: { lang: 'tsx', source: "'use server';\n\nexport async function saveName(formData: FormData): Promise<{ name: string }> {\n  const name = String(formData.get('name') ?? '');\n  await writeName(name);\n  return { name: name };\n}\n\nasync function writeName(name: string): Promise<void> {\n  void name;\n}\n" },
      remember: "'use server' marks Server Actions. It does not mark Server Components.",
      docs: "https://react.dev/reference/rsc/use-server",
    },
  },
  {
    id: "r19a-017",
    tech: "react19",
    topic: "rsc",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Badge is a Client Component. What is the bug?",
    code: {
      lang: "tsx",
      source: "import { Badge } from './badge';\n\nclass User {\n  name = 'Ada';\n}\n\nexport default function Page() {\n  return <Badge user={new User()} mark={Symbol.for('admin')} />;\n}\n",
    },
    options: [
      "A class instance and a symbol are not serializable props, so they cannot be passed to Badge",
      "The symbol is serializable, but the class must be passed as its name string",
      "Both values are fine when Badge is wrapped in memo",
      "User must extend a React component class before it can be a prop",
    ],
    correctIndex: 0,
    explanation: {
      answer: "new User() and the symbol cannot cross to Badge. Pass plain strings such as the name and the word admin.",
      why: "Badge is a Client Component, so every prop must be serializable. Serializable means React can pack the value into a message and rebuild it in the browser. A class instance is an object created with new, and its methods and identity do not survive that trip. A symbol is a unique key that is not serializable either. Pass a plain object or plain strings instead. memo only skips some renders, and it does not change which props are allowed.",
      wrong: [
        {
          option: "The symbol is serializable, but the class must be passed as its name string",
          reason: "Symbols are not serializable. The class instance is not serializable either.",
        },
        {
          option: "Both values are fine when Badge is wrapped in memo",
          reason: "memo does not make class instances or symbols serializable.",
        },
        {
          option: "User must extend a React component class before it can be a prop",
          reason: "Extending a component class would still be a class instance. Pass plain data instead.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "import { Badge } from './badge';\n\nexport default function Page() {\n  return <Badge name='Ada' mark='admin' />;\n}\n",
      },
      example: { lang: 'tsx', source: "import { Badge } from './badge';\n\nexport default function Page() {\n  return (\n    <Badge name='Ada' mark='admin' />\n  );\n}\n" },
      remember: "Pass plain data to a Client Component, not class instances or symbols.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-018",
    tech: "react19",
    topic: "rsc",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A client modal owns the open state. Inside it you need a list that must render as a Server Component. How do you compose that?",
    options: [
      "Import the async list into the modal file and render it when open is true",
      "Have a Server Component pass the already rendered list as children of the client modal",
      "Fetch the list in the modal with useEffect, because a Server Component cannot be a child of a client",
      "Add 'use server' to the modal so it can import the list and still call useState",
    ],
    correctIndex: 1,
    explanation: {
      answer: "A Server Component renders the modal and passes the list as children. The list still renders on the server.",
      why: "The modal is a Client Component because it uses state, and a Client Component cannot import a Server Component. It can render UI that a Server Component passed in as children or another prop. That UI is already rendered on the server and is passed through the client component. The list does not become client code, and the modal does not start awaiting the database. 'use server' would mark actions, not let the modal import a Server Component.",
      wrong: [
        {
          option: "Import the async list into the modal file and render it when open is true",
          reason: "That import pulls a Server Component into a Client Component, which is not allowed.",
        },
        {
          option: "Fetch the list in the modal with useEffect, because a Server Component cannot be a child of a client",
          reason: "A server-rendered child is allowed when it is passed in. It does not have to be fetched again in the browser.",
        },
        {
          option: "Add 'use server' to the modal so it can import the list and still call useState",
          reason: "'use server' marks Server Actions. It does not let a stateful modal import a Server Component.",
        },
      ],
      example: { lang: 'tsx', source: "import { Modal } from './modal';\nimport { ProjectList } from './project-list';\n\nexport default function Page() {\n  return (\n    <Modal title='Projects'>\n      <ProjectList />\n    </Modal>\n  );\n}\n" },
      remember: "A client modal can display server UI that was passed in as children.",
      docs: "https://react.dev/reference/rsc/use-client",
    },
  },
  {
    id: "r19a-019",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "What is the bug in this module?",
    code: {
      lang: "ts",
      source: "'use server';\n\nexport function saveName(formData: FormData): { name: string } {\n  const name = String(formData.get('name') ?? '');\n  return { name: name };\n}\n",
    },
    options: [
      "'use server' must be inside the function, not at the top of the file",
      "formData.get returns a promise, so saveName must call use on it",
      "saveName must be async, because every Server Action is an async function",
      "The return value must be a string, because an action cannot return an object",
    ],
    correctIndex: 2,
    explanation: {
      answer: "saveName has to be async. A file starting with 'use server' exports Server Actions, and each one must be an async function.",
      why: "A Server Action is a function the browser can ask the server to run. The 'use server' directive at the top of a file marks every export as one of those actions. Each action must be async, which means it returns a promise, even when the body does not await yet. FormData is the object that holds the named fields from a submitted form, and get reads one field as a string or file. A Client Component may import saveName after it is async. A plain object is a legal return value.",
      wrong: [
        {
          option: "'use server' must be inside the function, not at the top of the file",
          reason: "A top-of-file 'use server' is valid. It marks the exported functions as Server Actions.",
        },
        {
          option: "formData.get returns a promise, so saveName must call use on it",
          reason: "get returns the field value directly. The missing piece is the async keyword.",
        },
        {
          option: "The return value must be a string, because an action cannot return an object",
          reason: "An action may return a plain object. That object can become the state in useActionState.",
        },
      ],
      fixedCode: {
        lang: "ts",
        source: "'use server';\n\nexport async function saveName(formData: FormData): Promise<{ name: string }> {\n  const name = String(formData.get('name') ?? '');\n  return { name: name };\n}\n",
      },
      example: { lang: 'tsx', source: "'use server';\n\nexport async function saveName(formData: FormData): Promise<{ name: string }> {\n  const name = String(formData.get('name') ?? '');\n  return { name: name };\n}\n" },
      remember: "Exports from a 'use server' file must be async Server Actions.",
      docs: "https://react.dev/reference/rsc/use-server",
    },
  },
  {
    id: "r19a-020",
    tech: "react19",
    topic: "server-actions",
    kind: "concept",
    difficulty: "expert",
    prompt: "How can a Client Component get a Server Action to pass to a form?",
    options: [
      "It cannot. Only Server Components may call Server Actions",
      "It defines the action inline and puts 'use client' above that function",
      "It imports useFormStatus from react, and that hook creates the action",
      "It imports an async function from a module that starts with 'use server'",
    ],
    correctIndex: 3,
    explanation: {
      answer: "A Client Component may import an async Server Action from a module that starts with 'use server'.",
      why: "A Server Action is an async function the browser can ask the server to run. React docs also call it a Server Function. A file with 'use server' at the top exports those actions, and client modules are allowed to import them. An inline 'use server' function is created inside a Server Component, not inside a Client Component. useFormStatus only reports whether a parent form is submitting. It does not create an action.",
      wrong: [
        {
          option: "It cannot. Only Server Components may call Server Actions",
          reason: "Client Components may import Server Actions and pass them to forms.",
        },
        {
          option: "It defines the action inline and puts 'use client' above that function",
          reason: "'use client' marks the client bundle. An inline 'use server' function belongs in a Server Component.",
        },
        {
          option: "It imports useFormStatus from react, and that hook creates the action",
          reason: "useFormStatus comes from react-dom and only reads the parent form status. It does not create an action.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { saveName } from './save-name';\n\nexport function NameForm() {\n  return (\n    <form action={saveName}>\n      <input name='name' />\n      <button type='submit'>Save</button>\n    </form>\n  );\n}\n" },
      remember: "Client Components import Server Actions from a 'use server' module.",
      docs: "https://react.dev/reference/rsc/server-functions",
    },
  },
  {
    id: "r19a-021",
    tech: "react19",
    topic: "server-actions",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Page is a Server Component. What is true about this form?",
    code: {
      lang: "tsx",
      source: "async function writePost(title: string): Promise<void> {\n  void title;\n}\n\nexport default function Page() {\n  async function publish(formData: FormData) {\n    'use server';\n    const title = String(formData.get('title') ?? '');\n    await writePost(title);\n  }\n  return (\n    <form action={publish}>\n      <input name='title' />\n      <button type='submit'>Publish</button>\n    </form>\n  );\n}\n",
    },
    options: [
      "publish is a Server Action, and the form can submit without client JavaScript",
      "The inner directive is ignored, so publish runs in the browser",
      "The form submits only after a Client Component imports publish",
      "writePost runs while Page renders, before the user clicks Publish",
    ],
    correctIndex: 0,
    explanation: {
      answer: "publish is a Server Action created inside a Server Component. The form can submit it without client JavaScript.",
      why: "An inline 'use server' function can be created inside a Server Component, and it must be async. That makes publish a Server Action, which is a function the browser can ask the server to run. Progressive enhancement means the form still works when JavaScript has not loaded, and a real Server Action on the form action supports that. writePost runs when the action runs, not while Page is rendering. A client-only function would not submit without JavaScript.",
      wrong: [
        {
          option: "The inner directive is ignored, so publish runs in the browser",
          reason: "The directive is at the start of the function body, which is the inline way to mark a Server Action.",
        },
        {
          option: "The form submits only after a Client Component imports publish",
          reason: "The Server Component can pass the action straight to the form. A client import is not required.",
        },
        {
          option: "writePost runs while Page renders, before the user clicks Publish",
          reason: "writePost is inside publish. It runs on submit, not during the render that creates the form.",
        },
      ],
      example: { lang: 'tsx', source: "async function writePost(title: string): Promise<void> {\n  void title;\n}\nexport default function Page() {\n  async function publish(formData: FormData) {\n    'use server';\n    const title = String(formData.get('title') ?? '');\n    await writePost(title);\n  }\n  return (\n    <form action={publish}>\n      <input name='title' />\n      <button type='submit'>Publish</button>\n    </form>\n  );\n}\n" },
      remember: "A Server Action on a form action works even when JavaScript is unavailable.",
      docs: "https://react.dev/reference/rsc/server-functions",
    },
  },
  {
    id: "r19a-022",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The team wants this form to submit even when JavaScript is unavailable. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nexport function NameForm() {\n  function save(formData: FormData) {\n    const name = String(formData.get('name') ?? '');\n    console.log(name);\n  }\n  return (\n    <form action={save}>\n      <input name='name' />\n      <button type='submit'>Save</button>\n    </form>\n  );\n}\n",
    },
    options: [
      "The input is missing a default value, so the action never receives FormData",
      "save is a client function, so this form does not submit when JavaScript is unavailable",
      "console.log is illegal in a form action, so React drops the action",
      "'use client' already makes every function a Server Action, so the only bug is a missing async keyword",
    ],
    correctIndex: 1,
    explanation: {
      answer: "save is a client function, so the form cannot submit without JavaScript. Progressive enhancement needs a real Server Action.",
      why: "The file starts with 'use client', so save runs in the browser. Progressive enhancement means a form still submits when JavaScript is unavailable. A real Server Action supports that, because it is an async function the browser can post to the server. A client-only function action does not. 'use client' does not turn save into a Server Action. Import an async action from a 'use server' module, or create an inline action in a Server Component, and pass that to the form.",
      wrong: [
        {
          option: "The input is missing a default value, so the action never receives FormData",
          reason: "The input has a name, so a real submit would include it. The bug is that save is not a Server Action.",
        },
        {
          option: "console.log is illegal in a form action, so React drops the action",
          reason: "The log is not why the no-JavaScript submit fails. The function is client-only.",
        },
        {
          option: "'use client' already makes every function a Server Action, so the only bug is a missing async keyword",
          reason: "'use client' marks the client bundle. It does not mark Server Actions, and async alone would not make this a server endpoint.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { saveName } from './save-name';\n\nexport function NameForm() {\n  return (\n    <form action={saveName}>\n      <input name='name' />\n      <button type='submit'>Save</button>\n    </form>\n  );\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { saveName } from './save-name';\n\nexport function NameForm() {\n  return (\n    <form action={saveName}>\n      <input name='name' />\n      <button type='submit'>Save</button>\n    </form>\n  );\n}\n" },
      remember: "A form works without JavaScript only when its action is a real Server Action.",
      docs: "https://react.dev/reference/rsc/server-functions",
    },
  },
  {
    id: "r19a-023",
    tech: "react19",
    topic: "server-actions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Where does useActionState come from, and what does it return?",
    options: [
      "Import it from react-dom. It returns isPending, then state, then error",
      "Import useFormState from react. It returns dispatch, then state",
      "Import useActionState from react. It returns state, then dispatch, then isPending",
      "Import it from react-dom/client. It returns the FormData from the last submit",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Import useActionState from react. It returns the state, the dispatch function, and isPending.",
      why: "useActionState is a hook that runs an action and keeps the value that action returns. A hook is a function whose name starts with use and that React calls while rendering. The tuple is state, then dispatch, then isPending. isPending is true while the action is still running. The older name useFormState lived in react-dom, and the current hook lives in react. The action is called as previous state, then form data, unless you bind an extra argument in front.",
      wrong: [
        {
          option: "Import it from react-dom. It returns isPending, then state, then error",
          reason: "react-dom is where useFormStatus lives. useActionState is imported from react, and state is the first tuple value.",
        },
        {
          option: "Import useFormState from react. It returns dispatch, then state",
          reason: "useFormState is the old name and it lived in react-dom. The current hook is useActionState from react.",
        },
        {
          option: "Import it from react-dom/client. It returns the FormData from the last submit",
          reason: "FormData for the submit in progress comes from useFormStatus. useActionState returns state, dispatch, and isPending.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useActionState } from 'react';\nimport { saveName } from './save-name';\n\nexport function NameForm() {\n  const [state, dispatch, isPending] = useActionState(saveName, { name: '' });\n  return (\n    <form action={dispatch}>\n      <input name='name' />\n      <button type='submit' disabled={isPending}>Save</button>\n      <p>{state.name}</p>\n    </form>\n  );\n}\n" },
      remember: "useActionState comes from react and returns state, dispatch, and isPending.",
      docs: "https://react.dev/reference/react/useActionState",
    },
  },
  {
    id: "r19a-024",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The client calls renameUser.bind(null, userId) and passes the result to useActionState. What is the bug?",
    code: {
      lang: "ts",
      source: "'use server';\n\nexport async function renameUser(\n  prevState: { error: string },\n  userId: string,\n  formData: FormData,\n): Promise<{ error: string }> {\n  const name = String(formData.get('name') ?? '');\n  await updateName(userId, name);\n  return { error: '' };\n}\n\nasync function updateName(userId: string, name: string): Promise<void> {\n  void userId;\n  void name;\n}\n",
    },
    options: [
      "bind is not allowed on a Server Action, so the form must call renameUser(userId) itself",
      "useActionState must be imported from react-dom when the action is bound",
      "isPending is the first tuple value, so the form reads the state object as the pending flag",
      "The bound userId arrives first, so the parameters must be userId, then prevState, then formData",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The bound userId is the first parameter. The function must be written as userId, then previous state, then FormData.",
      why: "bind is a function method that pre-fills arguments, and the client pre-fills userId. useActionState is a hook from react that then calls the action with the previous state and the submitted form data. FormData is the object that holds the named fields from the form. Those calls stack, so the function sees userId first, then the previous state, then FormData. The parameters in this file swap the first two, so the state object would be treated as the id. The id from the client is still not proof of who is signed in, so the action must check the session too.",
      wrong: [
        {
          option: "bind is not allowed on a Server Action, so the form must call renameUser(userId) itself",
          reason: "Binding an extra argument is supported. That argument comes first in the function.",
        },
        {
          option: "useActionState must be imported from react-dom when the action is bound",
          reason: "useActionState is imported from react whether or not the action is bound.",
        },
        {
          option: "isPending is the first tuple value, so the form reads the state object as the pending flag",
          reason: "The tuple is state, dispatch, then isPending. The bug is the parameter order of renameUser.",
        },
      ],
      fixedCode: {
        lang: "ts",
        source: "'use server';\n\nexport async function renameUser(\n  userId: string,\n  prevState: { error: string },\n  formData: FormData,\n): Promise<{ error: string }> {\n  void prevState;\n  const name = String(formData.get('name') ?? '');\n  await updateName(userId, name);\n  return { error: '' };\n}\n\nasync function updateName(userId: string, name: string): Promise<void> {\n  void userId;\n  void name;\n}\n",
      },
      example: { lang: 'tsx', source: "'use server';\n\nexport async function renameUser(\n  userId: string,\n  prevState: { error: string },\n  formData: FormData,\n): Promise<{ error: string }> {\n  void prevState;\n  const name = String(formData.get('name') ?? '');\n  await updateName(userId, name);\n  return { error: '' };\n}\nasync function updateName(userId: string, name: string): Promise<void> {\n  void userId;\n  void name;\n}\n" },
      remember: "A bound argument comes first: userId, then previous state, then FormData.",
      docs: "https://react.dev/reference/react/useActionState",
    },
  },
  {
    id: "r19a-025",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "saveName is a Server Action. The Save button never shows a pending state. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useFormStatus } from 'react-dom';\nimport { saveName } from './save-name';\n\nexport function SaveForm() {\n  const status = useFormStatus();\n  return (\n    <form action={saveName}>\n      <input name='name' />\n      <button type='submit' disabled={status.pending}>\n        Save\n      </button>\n    </form>\n  );\n}\n",
    },
    options: [
      "useFormStatus does not see the form in this component, because it only reads a parent form from a child",
      "useFormStatus must be imported from react, not from react-dom",
      "pending is a promise, so disabled must stay false until the promise is unwrapped",
      "The hook returns pending only after you pass the form id into useFormStatus",
    ],
    correctIndex: 0,
    explanation: {
      answer: "useFormStatus is called in the same component that renders the form, so it never sees that form. Call it in a child of the form.",
      why: "useFormStatus is a hook from react-dom that reports the parent form. A hook is a function React calls during render, and a parent form is a form tag rendered above this component. SaveForm creates the form itself, so there is no parent form to read and pending stays false. pending is a boolean that is true while that parent form is submitting. Move the button into a child component and call the hook there. The hook takes no form id.",
      wrong: [
        {
          option: "useFormStatus must be imported from react, not from react-dom",
          reason: "The import from react-dom is correct. useActionState is the hook that comes from react.",
        },
        {
          option: "pending is a promise, so disabled must stay false until the promise is unwrapped",
          reason: "pending is a boolean. The hook is in the wrong component, so that boolean never turns true.",
        },
        {
          option: "The hook returns pending only after you pass the form id into useFormStatus",
          reason: "useFormStatus takes no arguments. It finds the parent form by where you call it.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useFormStatus } from 'react-dom';\nimport { saveName } from './save-name';\n\nfunction SaveButton() {\n  const status = useFormStatus();\n  return (\n    <button type='submit' disabled={status.pending}>\n      Save\n    </button>\n  );\n}\n\nexport function SaveForm() {\n  return (\n    <form action={saveName}>\n      <input name='name' />\n      <SaveButton />\n    </form>\n  );\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { useFormStatus } from 'react-dom';\nimport { saveName } from './save-name';\n\nfunction SaveButton() {\n  const { pending } = useFormStatus();\n  return <button type='submit' disabled={pending}>Save</button>;\n}\n\nexport function SaveForm() {\n  return <form action={saveName}><input name='name' /><SaveButton /></form>;\n}\n" },
      remember: "Call useFormStatus in a child of the form, not in the component that renders the form.",
      docs: "https://react.dev/reference/react-dom/hooks/useFormStatus",
    },
  },
  {
    id: "r19a-026",
    tech: "react19",
    topic: "server-actions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "SaveButton is rendered inside a form. Which statement describes the object useFormStatus returns?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useFormStatus } from 'react-dom';\n\nexport function SaveButton() {\n  const status = useFormStatus();\n  return (\n    <button type='submit' disabled={status.pending}>\n      {status.pending ? 'Saving' : 'Save'}\n    </button>\n  );\n}\n",
    },
    options: [
      "It has pending only. data, method, and action belong to useActionState",
      "It has pending, data, method, and action",
      "It has pending, error, and state",
      "It has isPending, dispatch, and formData",
    ],
    correctIndex: 1,
    explanation: {
      answer: "useFormStatus returns pending, data, method, and action. This call works because SaveButton is a child of the form.",
      why: "useFormStatus is a hook from react-dom that reads the parent form, which is the form rendered above this component. pending is true while that form is submitting. data is the FormData being sent, or null when nothing is in flight, and FormData holds the named fields. method is the get or post method of the form. action is the function passed to the parent form, or null when there is no parent form. useActionState is a different hook and returns state, dispatch, and isPending.",
      wrong: [
        {
          option: "It has pending only. data, method, and action belong to useActionState",
          reason: "Those four fields are all on the useFormStatus object. useActionState returns a different tuple.",
        },
        {
          option: "It has pending, error, and state",
          reason: "Error text comes back as state from useActionState when the action returns it. useFormStatus does not have error or state.",
        },
        {
          option: "It has isPending, dispatch, and formData",
          reason: "That mix mixes the two hooks. useFormStatus uses the name pending, and it does not return dispatch.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useFormStatus } from 'react-dom';\n\nexport function SaveButton() {\n  const { pending, data, method, action } = useFormStatus();\n  const name = String(data?.get('name') ?? '');\n  const verb = typeof action === 'function' ? 'Saving' : 'Save';\n  return (\n    <button type='submit' disabled={pending} formMethod={method ?? 'post'}>\n      {pending ? verb : name || 'Save'}\n    </button>\n  );\n}\n" },
      remember: "useFormStatus returns pending, data, method, and action for the parent form.",
      docs: "https://react.dev/reference/react-dom/hooks/useFormStatus",
    },
  },
  {
    id: "r19a-027",
    tech: "react19",
    topic: "server-actions",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A Server Action needs to show a message in the form without triggering the error boundary. What should the action do?",
    options: [
      "Throw an Error, and useFormStatus will put the message on status.error",
      "Throw an Error inside the button child, and useFormStatus will turn the throw into pending",
      "Return an error value, and read that value from the useActionState state",
      "Return null, and React will turn null into the nearest error boundary message",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Return an error value from the action and render it from useActionState. A thrown error goes to the error boundary instead.",
      why: "An error boundary is a parent that catches a thrown error and shows fallback UI in place of its children. A thrown error from a Server Action goes there, so the form does not get a normal state update. useActionState is a hook from react that stores the value the action returns, along with dispatch and isPending. Return a plain object such as a message string and render that object in the form. useFormStatus only reports whether the parent form is pending. It does not catch errors.",
      wrong: [
        {
          option: "Throw an Error, and useFormStatus will put the message on status.error",
          reason: "useFormStatus has no error field. A throw leaves the action and goes to the error boundary.",
        },
        {
          option: "Throw an Error inside the button child, and useFormStatus will turn the throw into pending",
          reason: "pending means the parent form is submitting. It is not a caught error message.",
        },
        {
          option: "Return null, and React will turn null into the nearest error boundary message",
          reason: "null is just a returned value. It does not become an error boundary message.",
        },
      ],
      example: { lang: 'tsx', source: "'use server';\n\nexport async function saveName(\n  prev: { message: string },\n  formData: FormData,\n): Promise<{ message: string }> {\n  void prev;\n  const name = String(formData.get('name') ?? '');\n  if (name.length === 0) {\n    return { message: 'Name is required' };\n  }\n  return { message: '' };\n}\n" },
      remember: "Return an error value for the form. Throw only when the error boundary should handle it.",
      docs: "https://react.dev/reference/react/useActionState",
    },
  },
  {
    id: "r19a-028",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The form sends userId in a hidden field and this action deletes that user. What is the bug?",
    code: {
      lang: "ts",
      source: "'use server';\n\nexport async function deleteAccount(formData: FormData): Promise<{ ok: boolean }> {\n  const userId = String(formData.get('userId') ?? '');\n  await deleteUserById(userId);\n  return { ok: true };\n}\n\nasync function deleteUserById(userId: string): Promise<void> {\n  void userId;\n}\n",
    },
    options: [
      "FormData is not available in a Server Action, so the id must be a prop of a component",
      "deleteUserById is a client API, so this file needs 'use client' instead of 'use server'",
      "The action is private unless a Client Component imports it, so no auth check is required",
      "This action is a public endpoint, and the client-sent userId is not proof of who is signed in",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The action must decide who the user is on the server. An id from the form is not proof of identity.",
      why: "A Server Action is a public HTTP endpoint, which means anyone who can reach the server can try to call it. The hidden userId is just another form field, and the browser can change it. Authenticate inside the action by reading the session, and validate the input before deleting anything. Next.js 15 and newer can tree-shake unused actions, which means the bundler drops exports nothing imports, and it can hide them behind hard-to-guess ids. Those measures do not replace the session check.",
      wrong: [
        {
          option: "FormData is not available in a Server Action, so the id must be a prop of a component",
          reason: "A form action receives FormData. The bug is trusting the id inside it as the signed-in user.",
        },
        {
          option: "deleteUserById is a client API, so this file needs 'use client' instead of 'use server'",
          reason: "The delete belongs on the server. Moving the file to the client would expose it further.",
        },
        {
          option: "The action is private unless a Client Component imports it, so no auth check is required",
          reason: "Importing the action from your UI does not make the endpoint private. Check the session inside the action.",
        },
      ],
      fixedCode: {
        lang: "ts",
        source: "'use server';\n\nasync function readSessionUserId(): Promise<string> {\n  return 'user-from-session';\n}\n\nasync function deleteUserById(userId: string): Promise<void> {\n  void userId;\n}\n\nexport async function deleteAccount(): Promise<{ ok: boolean }> {\n  const userId = await readSessionUserId();\n  await deleteUserById(userId);\n  return { ok: true };\n}\n",
      },
      example: { lang: 'tsx', source: "'use server';\n\nasync function readSessionUserId(): Promise<string> {\n  return 'user-from-session';\n}\n\nasync function deleteUserById(userId: string): Promise<void> {\n  void userId;\n}\n\nexport async function deleteAccount(): Promise<{ ok: boolean }> {\n  const userId = await readSessionUserId();\n  await deleteUserById(userId);\n  return { ok: true };\n}\n" },
      remember: "Authenticate inside the action. Do not trust an id sent from the client.",
      docs: "https://react.dev/reference/rsc/server-functions",
    },
  },
  {
    id: "r19a-029",
    tech: "react19",
    topic: "server-actions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Next.js 15 and newer tree-shakes unused Server Actions and gives them hard-to-guess ids. What do you still do?",
    options: [
      "Authenticate and validate inside every action, because each one is still a public HTTP endpoint",
      "Skip auth, because an unguessable id means only your form can call the action",
      "Export every action from a client file so the ids stay secret",
      "Put 'use client' above 'use server' so the endpoint is removed",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Authenticate and validate inside every Server Action. A hard-to-guess id does not prove who the caller is.",
      why: "A Server Action is a public HTTP endpoint, which means a request can hit it without going through your button. Tree-shaking means the bundler drops actions that nothing imports, and an unguessable id means the URL is hard to guess. The person using the page still has the id, and a modified browser can send any form field. Read the session inside the action and check the fields before you write. Do not treat a client-sent user id as identity.",
      wrong: [
        {
          option: "Skip auth, because an unguessable id means only your form can call the action",
          reason: "Anyone who loaded the page can call the action. The id is not an authentication check.",
        },
        {
          option: "Export every action from a client file so the ids stay secret",
          reason: "Client files are sent to the browser. That does not hide the endpoint or check the user.",
        },
        {
          option: "Put 'use client' above 'use server' so the endpoint is removed",
          reason: "Those directives do different jobs. Stacking them does not remove the need to authorize the action.",
        },
      ],
      example: { lang: 'tsx', source: "'use server';\n\nexport async function deleteAccount(formData: FormData): Promise<{ ok: boolean }> {\n  const userId = await readSessionUserId();\n  const confirm = String(formData.get('confirm') ?? '');\n  if (confirm !== 'delete') {\n    return { ok: false };\n  }\n  await deleteUserById(userId);\n  return { ok: true };\n}\n" },
      remember: "Guess-resistant action ids still need auth and validation inside the action.",
      docs: "https://react.dev/reference/rsc/server-functions",
    },
  },
  {
    id: "r19a-030",
    tech: "react19",
    topic: "server-actions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "A client form runs this action with useActionState. The user submits an empty sku. What happens?",
    code: {
      lang: "ts",
      source: "'use server';\n\nexport async function checkout(\n  prevState: { message: string },\n  formData: FormData,\n): Promise<{ message: string }> {\n  const sku = String(formData.get('sku') ?? '');\n  if (sku.length === 0) {\n    throw new Error('Missing sku');\n  }\n  return { message: 'ok' };\n}\n",
    },
    options: [
      "useActionState sets state.message to Missing sku and isPending becomes false",
      "The thrown Error goes to the nearest error boundary, not into state.message",
      "React converts the throw into a returned message object for the form",
      "The form reloads and prints the Error inside the sku input",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The throw goes to the nearest error boundary. useActionState does not copy the Error text into the returned state.",
      why: "The action checks the sku and throws an Error when it is empty. An error boundary is a parent that catches a thrown error and shows fallback UI instead of the children. Thrown errors from an action go there. useActionState stores a value only when the action returns it, and the tuple is state, dispatch, and isPending. To show Missing sku in the form, return a message object instead of throwing.",
      wrong: [
        {
          option: "useActionState sets state.message to Missing sku and isPending becomes false",
          reason: "The action throws, so there is no returned state. The message is not written into state.message.",
        },
        {
          option: "React converts the throw into a returned message object for the form",
          reason: "React does not rewrite a throw as a return value. The error boundary handles it.",
        },
        {
          option: "The form reloads and prints the Error inside the sku input",
          reason: "The input does not become the error display. The throw is caught by the error boundary.",
        },
      ],
      example: { lang: 'tsx', source: "'use server';\n\nexport async function checkout(\n  prevState: { message: string },\n  formData: FormData,\n): Promise<{ message: string }> {\n  const sku = String(formData.get('sku') ?? '');\n  if (sku.length === 0) {\n    return { message: 'Missing sku' };\n  }\n  return { message: 'ok' };\n}\n" },
      remember: "A thrown action error goes to the error boundary. Return a value to show it with useActionState.",
      docs: "https://react.dev/reference/react/useActionState",
    },
  },
  {
    id: "r19a-031",
    tech: "react19",
    topic: "server-actions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "saveLike is a Server Action imported from another module. The count jumps and then snaps back, and nothing is saved. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useOptimistic } from 'react';\nimport { saveLike } from './save-like';\n\nexport function LikeButton(props: { likes: number }) {\n  const [likes, addLike] = useOptimistic(props.likes, function addOne(current: number, step: number) {\n    return current + step;\n  });\n  return (\n    <button\n      onClick={function onClick() {\n        addLike(1);\n      }}\n    >\n      {likes}\n    </button>\n  );\n}\n",
    },
    options: [
      "useOptimistic can only be called in a Server Component",
      "The reducer must return a promise, because an optimistic update is async",
      "The click updates a temporary count but never calls saveLike, so no action is in flight",
      "props.likes must be a promise, because useOptimistic only accepts promises",
    ],
    correctIndex: 2,
    explanation: {
      answer: "addLike only shows a temporary count. The click never calls saveLike, so there is no action in flight and nothing is saved.",
      why: "useOptimistic is a hook from react that shows a temporary state while an action is in flight. Temporary means the preview lasts until the action finishes, then React keeps the real result or rolls back. The click calls addLike and does not call saveLike, so the server never records the like. Call addLike and saveLike together inside a transition or a form action so the preview and the request match. The likes value can be a plain number, and the reducer returns the next number, not a promise.",
      wrong: [
        {
          option: "useOptimistic can only be called in a Server Component",
          reason: "This hook is for the client preview. The import from react in a Client Component is the right place.",
        },
        {
          option: "The reducer must return a promise, because an optimistic update is async",
          reason: "The reducer returns the next state now. The async work is the Server Action, which this click never calls.",
        },
        {
          option: "props.likes must be a promise, because useOptimistic only accepts promises",
          reason: "The first argument is the current state, here a number. Promises are for use, not for this hook.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { startTransition, useOptimistic } from 'react';\nimport { saveLike } from './save-like';\n\nexport function LikeButton(props: { likes: number }) {\n  const [likes, addLike] = useOptimistic(props.likes, function addOne(current: number, step: number) {\n    return current + step;\n  });\n  return (\n    <button\n      onClick={function onClick() {\n        startTransition(async function run() {\n          addLike(1);\n          await saveLike();\n        });\n      }}\n    >\n      {likes}\n    </button>\n  );\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { startTransition, useOptimistic } from 'react';\nimport { saveLike } from './save-like';\n\nexport function LikeButton(props: { likes: number }) {\n  const [likes, addLike] = useOptimistic(props.likes, (current: number, step: number) => current + step);\n  return (\n    <button onClick={() => startTransition(async () => {\n      addLike(1);\n      await saveLike();\n    })}>\n      {likes}\n    </button>\n  );\n}\n" },
      remember: "useOptimistic is a temporary preview. Start the Server Action in the same turn.",
      docs: "https://react.dev/reference/react/useOptimistic",
    },
  },
  {
    id: "r19a-032",
    tech: "react19",
    topic: "server-actions",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A like count should jump to the next number while a Server Action is still running, then settle on the server result. Which tool does that?",
    options: [
      "useFormStatus, because pending replaces the count with the next number",
      "use on the action promise, because the action returns a promise of the new count",
      "useState plus useEffect, because a Server Action cannot update the screen until reload",
      "useOptimistic, which shows a temporary state while the action is in flight",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Use useOptimistic from react. It shows a temporary count while the Server Action is in flight.",
      why: "Optimistic UI is a preview you show before the server answers. useOptimistic is a hook from react, and a hook is a function that runs during render. It keeps that preview as temporary state and then settles on the real result. useFormStatus only tells you whether the parent form is pending, which is a boolean plus the form data, method, and action. use reads a promise or context and does not invent a temporary count, while the Server Action can still update the real count when it finishes.",
      wrong: [
        {
          option: "useFormStatus, because pending replaces the count with the next number",
          reason: "pending is true or false for the parent form. It does not compute the next like count.",
        },
        {
          option: "use on the action promise, because the action returns a promise of the new count",
          reason: "use waits for a promise that already exists. It does not show a guessed count during the action.",
        },
        {
          option: "useState plus useEffect, because a Server Action cannot update the screen until reload",
          reason: "A Server Action can update the screen without a reload. useOptimistic is the hook made for the temporary preview.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { startTransition, useOptimistic } from 'react';\nimport { saveLike } from './save-like';\n\nexport function LikeButton(props: { likes: number }) {\n  const [likes, addLike] = useOptimistic(props.likes, (current: number, step: number) => current + step);\n  function onClick() {\n    startTransition(async () => {\n      addLike(1);\n      await saveLike();\n    });\n  }\n  return <button onClick={onClick}>{likes}</button>;\n}\n" },
      remember: "Import useOptimistic from react for a preview that lasts while the action runs.",
      docs: "https://react.dev/reference/react/useOptimistic",
    },
  },
  {
    id: "r19a-033",
    tech: "react19",
    topic: "server-actions",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "A client passes addComment to useActionState and does not bind any extra argument. On submit, what does addComment receive?",
    code: {
      lang: "ts",
      source: "'use server';\n\nexport async function addComment(\n  prev: { text: string },\n  formData: FormData,\n): Promise<{ text: string }> {\n  const text = String(formData.get('text') ?? '');\n  return { text: text };\n}\n",
    },
    options: [
      "The previous state is the first argument and the submitted FormData is the second",
      "FormData is first and the previous state is second",
      "Only FormData is passed, because useActionState does not send state into the action",
      "The arguments are isPending, then FormData, then the previous state",
    ],
    correctIndex: 0,
    explanation: {
      answer: "useActionState calls the action with the previous state first and the submitted FormData second.",
      why: "useActionState is a hook from react that stores what the action returns. When the form submits, it calls addComment with the previous state, then the FormData. FormData is the object that holds the named fields from the form. The first time, the previous state is the initial state you passed to the hook. An extra bound argument would come before both of those, but this client does not bind one. isPending is the third value the hook returns to the component, not an argument of the action.",
      wrong: [
        {
          option: "FormData is first and the previous state is second",
          reason: "That is the order for a form action that is not wrapped by useActionState. This hook puts state first.",
        },
        {
          option: "Only FormData is passed, because useActionState does not send state into the action",
          reason: "The hook always passes the previous state so the action can build the next state.",
        },
        {
          option: "The arguments are isPending, then FormData, then the previous state",
          reason: "isPending is returned to the component. It is not passed into addComment.",
        },
      ],
      example: { lang: 'tsx', source: "'use server';\n\nexport async function addComment(\n  prev: { text: string },\n  formData: FormData,\n): Promise<{ text: string }> {\n  const text = String(formData.get('text') ?? '');\n  return { text: text };\n}\n" },
      remember: "Without bind, the action is previous state, then FormData.",
      docs: "https://react.dev/reference/react/useActionState",
    },
  },
  {
    id: "r19a-034",
    tech: "react19",
    topic: "server-actions",
    kind: "scenario",
    difficulty: "expert",
    prompt: "You are editing a Client Component and the form needs a Server Action. What should you do?",
    options: [
      "Write an inline async function with 'use server' inside the Client Component",
      "Import an async action from a module that starts with 'use server'",
      "Put 'use server' on the line under 'use client' in the same file",
      "Call useFormStatus, which creates a Server Action for the nearest form",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Import an async Server Action from a module that starts with 'use server'. A Client Component cannot create an inline one.",
      why: "A Server Action is an async function the browser can ask the server to run. Client Components may import those functions from a 'use server' file. An inline 'use server' function can be created inside a Server Component, where the function is born on the server. A Client Component is already browser code, so it cannot declare that server function inside itself. useFormStatus only reads the parent form. It does not create an action.",
      wrong: [
        {
          option: "Write an inline async function with 'use server' inside the Client Component",
          reason: "Inline 'use server' belongs in a Server Component. A client file imports the action instead.",
        },
        {
          option: "Put 'use server' on the line under 'use client' in the same file",
          reason: "The two directives are not stacked. 'use client' marks the client module, and actions live in a server module.",
        },
        {
          option: "Call useFormStatus, which creates a Server Action for the nearest form",
          reason: "useFormStatus reports pending, data, method, and action for a parent form. It does not create a Server Action.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { publishPost } from './publish-post';\n\nexport function PostForm() {\n  return (\n    <form action={publishPost}>\n      <input name='title' />\n      <button type='submit'>Publish</button>\n    </form>\n  );\n}\n" },
      remember: "Client files import Server Actions. Inline 'use server' belongs in a Server Component.",
      docs: "https://react.dev/reference/rsc/use-server",
    },
  },
  {
    id: "r19a-035",
    tech: "react19",
    topic: "use-hook",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does use do when you pass it a promise?",
    options: [
      "It starts the promise and returns undefined until a later render",
      "It catches a rejection and returns that error as the value",
      "It suspends until the promise resolves, and a rejection goes to the nearest error boundary",
      "It is an alias of useEffect, so the caller must be a Server Component",
    ],
    correctIndex: 2,
    explanation: {
      answer: "use suspends the component until the promise resolves. A rejection goes to the nearest error boundary, and the component must be under Suspense.",
      why: "use is the React function that reads a promise or a context. A promise is a value that will hold a result later. Suspend means React pauses this component and shows the fallback of the nearest Suspense boundary until the promise resolves. Suspense is a wrapper whose fallback is the waiting UI. If the promise rejects, that failure goes to the nearest error boundary, which is the parent that catches errors. The component that calls use on a promise has to sit under Suspense.",
      wrong: [
        {
          option: "It starts the promise and returns undefined until a later render",
          reason: "use does not return undefined for a pending promise. It suspends the component.",
        },
        {
          option: "It catches a rejection and returns that error as the value",
          reason: "A rejection is not a normal return value. The nearest error boundary catches it.",
        },
        {
          option: "It is an alias of useEffect, so the caller must be a Server Component",
          reason: "use reads a promise or context during render. It is not useEffect, and the promise form is used in Client Components.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Suspense, use } from 'react';\n\nexport function Page(props: { note: Promise<string> }) {\n  return (\n    <Suspense fallback={<p>Loading</p>}>\n      <Title note={props.note} />\n    </Suspense>\n  );\n}\n\nfunction Title(props: { note: Promise<string> }) {\n  const title = use(props.note);\n  return <h1>{title}</h1>;\n}\n" },
      remember: "use on a promise suspends under Suspense. A rejection hits the error boundary.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-036",
    tech: "react19",
    topic: "use-hook",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Bio renders under Suspense, but the fallback never goes away. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { use } from 'react';\n\nexport function Bio(props: { userId: string }) {\n  const user = use(fetchUser(props.userId));\n  return <p>{user.name}</p>;\n}\n\nfunction fetchUser(userId: string): Promise<{ name: string }> {\n  return Promise.resolve({ name: userId });\n}\n",
    },
    options: [
      "use cannot read a promise in a Client Component, so the call must move into useEffect",
      "user.name must be unwrapped with a second use call",
      "fetchUser must be a Server Action, because use only accepts actions",
      "fetchUser runs during render and returns a new promise every time, so the component suspends again",
    ],
    correctIndex: 3,
    explanation: {
      answer: "fetchUser creates a new promise on every render, so use suspends again each time. Create that promise once and pass the same promise in.",
      why: "use reads a promise and suspends, which means React shows the Suspense fallback until that promise resolves. Suspense is the wrapper that shows waiting UI. A new promise during render is a different promise every time, so React treats the work as not done and suspends again. Create the promise in a Server Component, or cache it, and pass that stable promise as a prop. Do not wrap use in try and catch, because Suspense works by throwing a waiting signal and a catch would swallow it.",
      wrong: [
        {
          option: "use cannot read a promise in a Client Component, so the call must move into useEffect",
          reason: "Passing a promise into a Client Component and reading it with use is the React 19 pattern. The bug is creating a fresh promise during render.",
        },
        {
          option: "user.name must be unwrapped with a second use call",
          reason: "Once the promise resolves, user is the plain object. name is a string on that object.",
        },
        {
          option: "fetchUser must be a Server Action, because use only accepts actions",
          reason: "use accepts a promise or context. It does not need a Server Action.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { use } from 'react';\n\nexport function Bio(props: { user: Promise<{ name: string }> }) {\n  const user = use(props.user);\n  return <p>{user.name}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { use } from 'react';\n\nexport function Bio(props: { user: Promise<{ name: string }> }) {\n  const user = use(props.user);\n  return <p>{user.name}</p>;\n}\n" },
      remember: "Pass a stable promise into use. Do not create a new promise during render.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-037",
    tech: "react19",
    topic: "use-hook",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Price is under a Suspense boundary and an error boundary. props.quote rejects. What happens?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { use } from 'react';\n\nexport function Price(props: { quote: Promise<number> }) {\n  const amount = use(props.quote);\n  return <span>{amount}</span>;\n}\n",
    },
    options: [
      "The rejection is caught by the nearest error boundary, not by Suspense",
      "Suspense shows its fallback forever, because a rejection is still pending",
      "use returns 0 and the span renders that number",
      "Price retries the promise on every click",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The rejected promise is an error. The nearest error boundary catches it, and Suspense does not keep showing its fallback.",
      why: "use reads the promise in props and suspends while that promise is still pending. Suspend means the nearest Suspense boundary shows its fallback, which is the waiting UI. A rejection is a failure, not a longer wait. That failure goes to the nearest error boundary, the parent that catches errors and shows error UI. use does not turn the failure into 0, and this component has no click handler that retries the promise.",
      wrong: [
        {
          option: "Suspense shows its fallback forever, because a rejection is still pending",
          reason: "Pending and rejected are different. Suspense covers the wait, and the error boundary covers the rejection.",
        },
        {
          option: "use returns 0 and the span renders that number",
          reason: "use does not replace a rejection with a number. The error boundary handles the failure.",
        },
        {
          option: "Price retries the promise on every click",
          reason: "Nothing in this component retries the promise. A rejection is rendered by the error boundary.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Component, use, type ReactNode } from 'react';\n\nexport function Price(props: { quote: Promise<number> }) {\n  const amount = use(props.quote);\n  return <span>{amount}</span>;\n}\n\nexport class QuoteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {\n  state = { failed: false };\n  static getDerivedStateFromError() { return { failed: true }; }\n  render() {\n    return this.state.failed ? <p>Quote failed</p> : this.props.children;\n  }\n}\n" },
      remember: "Suspense is for the wait. A rejected promise used with use goes to the error boundary.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-038",
    tech: "react19",
    topic: "use-hook",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The promise in note stays pending, and the fallback never shows. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { use } from 'react';\n\nexport function Title(props: { note: Promise<string> }) {\n  try {\n    const title = use(props.note);\n    return <h1>{title}</h1>;\n  } catch (error) {\n    return <h1>Missing title</h1>;\n  }\n}\n",
    },
    options: [
      "The catch block must rethrow a string, because an error boundary ignores an Error object",
      "The try and catch swallow the throw that Suspense uses, so the promise never suspends correctly",
      "use must be called twice, once in try and once in catch",
      "Title must be async, and the try must await the promise even though this is a Client Component",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The try and catch block catches the signal use throws while the promise is pending. Suspense never sees it, so the fallback cannot show.",
      why: "Suspense works by throwing a special waiting signal out of the component. Suspense is a parent that catches that signal and shows fallback UI. The catch block in Title swallows the signal and renders Missing title instead. Do not wrap use in try and catch. Let a real rejection reach the nearest error boundary, which is the parent that shows error UI. In a Server Component you would await the data, but this client component should call use with no try around it.",
      wrong: [
        {
          option: "The catch block must rethrow a string, because an error boundary ignores an Error object",
          reason: "The catch should not be there. Error boundaries can catch Error values, and this catch is what breaks the wait.",
        },
        {
          option: "use must be called twice, once in try and once in catch",
          reason: "Calling use twice does not fix the swallowed signal. Remove the try and catch.",
        },
        {
          option: "Title must be async, and the try must await the promise even though this is a Client Component",
          reason: "This is a Client Component, so it unwraps the promise with use. await belongs in a Server Component.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { use } from 'react';\n\nexport function Title(props: { note: Promise<string> }) {\n  const title = use(props.note);\n  return <h1>{title}</h1>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { use } from 'react';\n\nexport function Title(props: { note: Promise<string> }) {\n  const title = use(props.note);\n  return <h1>{title}</h1>;\n}\n" },
      remember: "Do not wrap use in try and catch. Suspense needs that throw.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-039",
    tech: "react19",
    topic: "use-hook",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A Server Component can start loading comments, and a Client Component should reveal them when the promise resolves so the rest of the page can appear first. What is the React 19 pattern?",
    options: [
      "Await the promise in the Client Component inside useEffect",
      "Call use on the promise in the Server Component instead of await",
      "Pass the promise from the Server Component into the Client Component and unwrap it with use",
      "Turn the promise into a string with JSON and parse that string in the client",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The Server Component passes the promise to a Client Component, and that client calls use to unwrap it. The client sits under Suspense.",
      why: "A promise is a value that will hold a result later, and a promise is a legal prop from server to client. use reads that promise in the Client Component and suspends until it resolves. Suspend means the nearest Suspense boundary shows its fallback, so the rest of the page can render. Create the promise once on the server rather than during client render. In the Server Component itself, await data you need there instead of calling use.",
      wrong: [
        {
          option: "Await the promise in the Client Component inside useEffect",
          reason: "useEffect runs after render and is not how React 19 unwraps a server promise. Pass the promise to use.",
        },
        {
          option: "Call use on the promise in the Server Component instead of await",
          reason: "A Server Component should await data it needs itself. use is for the client that receives the promise.",
        },
        {
          option: "Turn the promise into a string with JSON and parse that string in the client",
          reason: "A promise is already a supported prop. You do not stringify it.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Suspense, use } from 'react';\n\nexport function Comments(props: { comments: Promise<string> }) {\n  const text = use(props.comments);\n  return <p>{text}</p>;\n}\n\nexport function CommentsSlot(props: { comments: Promise<string> }) {\n  return (\n    <Suspense fallback={<p>Loading comments</p>}>\n      <Comments comments={props.comments} />\n    </Suspense>\n  );\n}\n" },
      remember: "Pass a server promise into a Client Component and unwrap it with use.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-040",
    tech: "react19",
    topic: "use-hook",
    kind: "concept",
    difficulty: "expert",
    prompt: "Which call is allowed to run only inside a condition?",
    options: [
      "useContext only, because use on a context is illegal",
      "Every hook, including useState, because React 19 dropped the rules of hooks",
      "use on a promise, while use on a context must stay unconditional",
      "use on a context, while no other hook may be called conditionally",
    ],
    correctIndex: 3,
    explanation: {
      answer: "use on a context may be called conditionally. Hooks such as useState and useEffect may not.",
      why: "Context is a value a provider shares with components below it. use on that context reads it the way useContext does, and that call may sit inside an if. A hook is a function such as useState or useEffect that React must see in the same order on every render. No other hook may be called conditionally, because skipping it changes that order. use on a promise still needs a stable promise and a Suspense parent. It is not a reason to put useState in a branch.",
      wrong: [
        {
          option: "useContext only, because use on a context is illegal",
          reason: "use on a context is supported and may be conditional. It reads the same kind of value as useContext.",
        },
        {
          option: "Every hook, including useState, because React 19 dropped the rules of hooks",
          reason: "useState still has to run unconditionally. The conditional permission is for use on a context.",
        },
        {
          option: "use on a promise, while use on a context must stay unconditional",
          reason: "The fact that allows a condition is use on a context. Other hooks stay unconditional.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { createContext, use, useState } from 'react';\n\nconst ThemeContext = createContext({ name: 'Ink' });\n\nexport function Panel(props: { open: boolean }) {\n  const [note, setNote] = useState('');\n  if (!props.open) {\n    return null;\n  }\n  const theme = use(ThemeContext);\n  return <input value={note} placeholder={theme.name} onChange={(event) => setNote(event.target.value)} />;\n}\n" },
      remember: "Only use on a context may be conditional. Other hooks run on every render.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-041",
    tech: "react19",
    topic: "use-hook",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Panel(props: { open: boolean }) {\n  if (!props.open) {\n    return null;\n  }\n  const [note, setNote] = useState('');\n  return <input value={note} onChange={(event) => setNote(event.target.value)} />;\n}\n",
    },
    options: [
      "useState runs only when open is true, and no hook except use on a context may be conditional",
      "The early return is required, because useState must run after a condition in React 19",
      "onChange must be a Server Action, because setNote cannot run in the browser",
      "A controlled input is illegal in a Client Component and must drop the value prop",
    ],
    correctIndex: 0,
    explanation: {
      answer: "useState is skipped when the panel is closed. Call it on every render, above the condition.",
      why: "A hook is a function such as useState that React matches up by call order on every render. The early return means the closed render calls no hooks and the open render calls useState, so the order changes. No hook other than use on a context may be called conditionally. use on a context reads a provider value and is the call that may sit inside an if. Move useState above the if so both renders call it once. The input can stay controlled, which means its value comes from state.",
      wrong: [
        {
          option: "The early return is required, because useState must run after a condition in React 19",
          reason: "useState must run before any return so every render hits it. The condition belongs after the hook.",
        },
        {
          option: "onChange must be a Server Action, because setNote cannot run in the browser",
          reason: "setNote is client state. A Server Action is not required for typing in an input.",
        },
        {
          option: "A controlled input is illegal in a Client Component and must drop the value prop",
          reason: "Client inputs may be controlled. The bug is the conditional useState.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Panel(props: { open: boolean }) {\n  const [note, setNote] = useState('');\n  if (!props.open) {\n    return null;\n  }\n  return <input value={note} onChange={(event) => setNote(event.target.value)} />;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Panel(props: { open: boolean }) {\n  const [note, setNote] = useState('');\n  if (!props.open) {\n    return null;\n  }\n  return <input value={note} onChange={(event) => setNote(event.target.value)} />;\n}\n" },
      remember: "Call useState on every render. Only use on a context may sit inside a condition.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-042",
    tech: "react19",
    topic: "use-hook",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Title is a Client Component already wrapped in Suspense, and Title calls use on its title prop. What happens when this Server Component renders?",
    code: {
      lang: "tsx",
      source: "import { Title } from './title';\n\nexport default function Page() {\n  const titlePromise = fetchTitle();\n  return <Title title={titlePromise} />;\n}\n\nfunction fetchTitle(): Promise<string> {\n  return Promise.resolve('Notes');\n}\n",
    },
    options: [
      "fetchTitle runs in the browser because Title calls use",
      "Page starts the promise on the server, passes it to Title, and Title suspends until use resolves it",
      "use reads the promise during the server render, and Title receives a string",
      "The promise is dropped, so Title receives null",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Page creates the promise on the server and passes it to Title. Title unwraps that same promise with use and suspends until it resolves.",
      why: "A promise is a legal prop from a Server Component to a Client Component. Page calls fetchTitle once during its server render and hands that promise to Title. Title is a Client Component, so it calls use on the prop rather than the server calling use. use suspends, which means the Suspense fallback shows until the promise resolves to the string. Do not build a new promise inside Title on each render, or the wait starts over.",
      wrong: [
        {
          option: "fetchTitle runs in the browser because Title calls use",
          reason: "fetchTitle runs while Page renders on the server. Title only unwraps the promise it receives.",
        },
        {
          option: "use reads the promise during the server render, and Title receives a string",
          reason: "The server passes the promise through. The client calls use. In a Server Component you await instead of calling use.",
        },
        {
          option: "The promise is dropped, so Title receives null",
          reason: "Promises are serializable props. Title receives the promise, not null.",
        },
      ],
      example: { lang: 'tsx', source: "import { Title } from './title';\n\nexport default function Page() {\n  const titlePromise = fetchTitle();\n  return <Title title={titlePromise} />;\n}\n\nfunction fetchTitle(): Promise<string> {\n  return Promise.resolve('Notes');\n}\n" },
      remember: "Start the promise on the server, pass it to the client, and unwrap it with use.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-043",
    tech: "react19",
    topic: "use-hook",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "comments is a stable promise from a Server Component. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { use } from 'react';\n\nexport function Article(props: { comments: Promise<string> }) {\n  return (\n    <main>\n      <Comments comments={props.comments} />\n    </main>\n  );\n}\n\nexport function Comments(props: { comments: Promise<string> }) {\n  const text = use(props.comments);\n  return <p>{text}</p>;\n}\n",
    },
    options: [
      "Comments must import use from react-dom",
      "A Client Component cannot receive a promise, so Article must await it",
      "Comments calls use on a promise but is not wrapped in Suspense",
      "The promise must be created inside Comments, or use returns the previous text",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Comments calls use on a promise without a Suspense parent. Wrap Comments in Suspense so React can show a fallback while the promise is pending.",
      why: "use reads the promise and suspends until it resolves. Suspend means React pauses the component and looks for the nearest Suspense boundary. Suspense is a wrapper that shows fallback UI during that wait. Article renders Comments with no Suspense above the use call, so there is nowhere to show the waiting UI. The promise is already stable because the server created it. Creating another promise inside Comments would suspend on every render.",
      wrong: [
        {
          option: "Comments must import use from react-dom",
          reason: "use is imported from react. The missing piece is a Suspense boundary.",
        },
        {
          option: "A Client Component cannot receive a promise, so Article must await it",
          reason: "A promise is a legal prop. The client is supposed to unwrap it with use under Suspense.",
        },
        {
          option: "The promise must be created inside Comments, or use returns the previous text",
          reason: "A promise created during render is a new promise every time. Keep the server promise and add Suspense.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { Suspense, use } from 'react';\n\nexport function Article(props: { comments: Promise<string> }) {\n  return (\n    <main>\n      <Suspense fallback={<p>Loading comments</p>}>\n        <Comments comments={props.comments} />\n      </Suspense>\n    </main>\n  );\n}\n\nexport function Comments(props: { comments: Promise<string> }) {\n  const text = use(props.comments);\n  return <p>{text}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "'use client';\nimport { Suspense, use } from 'react';\n\nexport function Article(props: { comments: Promise<string> }) {\n  return (\n    <main>\n      <Suspense fallback={<p>Loading comments</p>}>\n        <Comments comments={props.comments} />\n      </Suspense>\n    </main>\n  );\n}\nexport function Comments(props: { comments: Promise<string> }) {\n  const text = use(props.comments);\n  return <p>{text}</p>;\n}\n" },
      remember: "A component that calls use on a promise must sit under Suspense.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-044",
    tech: "react19",
    topic: "use-hook",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A panel should read the theme context only when it is open. Which call is legal inside that if?",
    options: [
      "useContext, because it is the hook React allows inside a condition",
      "useState, because state hooks became conditional in React 19",
      "useEffect placed after an early return, because effects can be skipped",
      "use on the theme context, because that call may be conditional",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Call use on the theme context inside the if. That is the read that may be conditional.",
      why: "Context is a value a provider shares with the components under it. use on that context reads it like useContext, and this call may run only in the open branch. A hook such as useState or useEffect must run in the same order on every render, so those calls cannot sit inside the if or after a return that sometimes skips them. No other hook has the conditional exception. If the open branch also needs a promise, keep that promise stable and render it under Suspense.",
      wrong: [
        {
          option: "useContext, because it is the hook React allows inside a condition",
          reason: "useContext is still a hook and cannot be conditional. use on the context is the call that can.",
        },
        {
          option: "useState, because state hooks became conditional in React 19",
          reason: "useState still runs on every render. Skipping it when the panel is closed breaks hook order.",
        },
        {
          option: "useEffect placed after an early return, because effects can be skipped",
          reason: "useEffect is a hook. An early return that skips it is the same rules-of-hooks bug.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { createContext, use } from 'react';\n\nconst ThemeContext = createContext({ name: 'Ink' });\n\nexport function Panel(props: { open: boolean }) {\n  if (!props.open) {\n    return <p>Closed</p>;\n  }\n  const theme = use(ThemeContext);\n  return <p>{theme.name}</p>;\n}\n" },
      remember: "Read context with a conditional use call. Keep every other hook unconditional.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-045",
    tech: "react19",
    topic: "use-hook",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Where should you create a promise that a Client Component will pass to use?",
    options: [
      "In a Server Component, or in a cache, so the same promise is reused across renders",
      "Inside the client render that calls use, so each attempt is fresh",
      "Inside a try and catch next to use, so a failure skips Suspense",
      "Inside useEffect, then passed to use on the next line of that same render",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Create the promise in a Server Component or in a cache, then pass that same promise to use.",
      why: "use suspends until the promise you pass resolves. Suspend means the Suspense fallback shows during the wait. If render creates a new promise every time, it is a different promise, and the component suspends again. A Server Component can start the promise once and pass it down, and a cache can return the same promise for the same key. Do not build it beside use inside try and catch, because that catch swallows the waiting signal. useEffect runs after render, so it cannot supply the promise for a use call in that same render.",
      wrong: [
        {
          option: "Inside the client render that calls use, so each attempt is fresh",
          reason: "A fresh promise on every render suspends again. Reuse one promise.",
        },
        {
          option: "Inside a try and catch next to use, so a failure skips Suspense",
          reason: "try and catch around use breaks Suspense. Rejections belong to the error boundary.",
        },
        {
          option: "Inside useEffect, then passed to use on the next line of that same render",
          reason: "useEffect does not run in time to create the promise for that render. Pass a promise that already exists.",
        },
      ],
      example: { lang: 'tsx', source: "import { Bio } from './bio';\n\nconst userCache = new Map<string, Promise<{ name: string }>>();\n\nexport default function Page(props: { userId: string }) {\n  return <Bio user={loadUser(props.userId)} />;\n}\n\nfunction loadUser(userId: string): Promise<{ name: string }> {\n  const cached = userCache.get(userId);\n  if (cached) return cached;\n  const pending = Promise.resolve({ name: userId });\n  userCache.set(userId, pending);\n  return pending;\n}\n" },
      remember: "Create the promise once on the server or in a cache, then pass it to use.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-046",
    tech: "react19",
    topic: "use-hook",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Page needs the title before it returns the heading. This file has no 'use client' directive. What is the bug?",
    code: {
      lang: "tsx",
      source: "import { use } from 'react';\n\nexport default function Page() {\n  const title = use(loadTitle());\n  return <h1>{title}</h1>;\n}\n\nfunction loadTitle(): Promise<string> {\n  return Promise.resolve('Notes');\n}\n",
    },
    options: [
      "loadTitle must be wrapped in try and catch, or the heading never renders",
      "This Server Component should await the data instead of calling use",
      "use is correct here, but the heading must be moved into a Client Component child",
      "loadTitle must return context, because use in a Server Component only reads context",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Page is a Server Component, so it should await loadTitle. use is the client way to unwrap a promise that was passed in.",
      why: "With no 'use client' directive, Page is a Server Component and can be an async function. await pauses that function until the promise resolves, then the heading renders with the string. use is how a Client Component reads a promise prop, and it suspends under Suspense. Calling use here also calls loadTitle during render, which makes a new promise every time. Make Page async and await loadTitle once. Pass a promise to a client and call use only when the client should wait while the rest of the page shows.",
      wrong: [
        {
          option: "loadTitle must be wrapped in try and catch, or the heading never renders",
          reason: "try and catch around use breaks the waiting signal. This server file should await instead.",
        },
        {
          option: "use is correct here, but the heading must be moved into a Client Component child",
          reason: "The heading needs the title in this Server Component. Await it here rather than moving the heading.",
        },
        {
          option: "loadTitle must return context, because use in a Server Component only reads context",
          reason: "The server file should not call use for this data. Await the promise.",
        },
      ],
      fixedCode: {
        lang: "tsx",
        source: "export default async function Page() {\n  const title = await loadTitle();\n  return <h1>{title}</h1>;\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Notes';\n}\n",
      },
      example: { lang: 'tsx', source: "export default async function Page() {\n  const title = await loadTitle();\n  return <h1>{title}</h1>;\n}\n\nasync function loadTitle(): Promise<string> {\n  return 'Notes';\n}\n" },
      remember: "In a Server Component, await the data instead of calling use.",
      docs: "https://react.dev/reference/rsc/server-components",
    },
  },
  {
    id: "r19a-047",
    tech: "react19",
    topic: "use-hook",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Label is rendered with fancy set to true. The context default name is Ink. What text does it render?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { createContext, use } from 'react';\n\nconst ThemeContext = createContext({ name: 'Ink' });\n\nexport function Label(props: { fancy: boolean }) {\n  if (!props.fancy) {\n    return <span>Plain</span>;\n  }\n  const theme = use(ThemeContext);\n  return <span>{theme.name}</span>;\n}\n",
    },
    options: [
      "It throws, because use cannot be called after a condition",
      "It renders Plain, because the context read is skipped once any branch exists",
      "It renders Ink, because use reads the context and may run only in this branch",
      "It renders the provider element, because use returns the provider",
    ],
    correctIndex: 2,
    explanation: {
      answer: "It renders Ink. fancy is true, so the branch calls use on the context and reads the default name.",
      why: "Context is a value shared with components under a provider, and createContext sets the default when no provider is above this component. use on a context reads that value the way useContext does. This call may be conditional, so the if is legal. fancy is true, the early return does not run, and the theme name is Ink. A hook such as useState is a function React must call on every render, so it still could not be placed in this branch. use returns the context value, not a provider element.",
      wrong: [
        {
          option: "It throws, because use cannot be called after a condition",
          reason: "use on a context is the call that may be conditional. This branch is allowed.",
        },
        {
          option: "It renders Plain, because the context read is skipped once any branch exists",
          reason: "Plain is the closed branch. fancy is true, so execution continues and reads the context.",
        },
        {
          option: "It renders the provider element, because use returns the provider",
          reason: "use returns the context value, here the object with the name Ink.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { createContext, use } from 'react';\n\nconst ThemeContext = createContext({ name: 'Ink' });\n\nexport function Label(props: { fancy: boolean }) {\n  if (!props.fancy) {\n    return <span>Plain</span>;\n  }\n  const theme = use(ThemeContext);\n  return <span>{theme.name}</span>;\n}\n" },
      remember: "use on a context may run inside a branch and returns the context value.",
      docs: "https://react.dev/reference/react/use",
    },
  },
  {
    id: "r19a-048",
    tech: "react19",
    topic: "use-hook",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A promise passed to use rejects, and you want error UI rather than the loading fallback. Where does that UI come from?",
    options: [
      "From a try and catch around use, which is how Suspense reports failures",
      "From the Suspense fallback, because a rejection stays on the loading UI",
      "From an empty string you resolve before passing the promise, so use cannot fail",
      "From the nearest error boundary, because a rejected promise is an error rather than pending UI",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The rejection is caught by the nearest error boundary. Suspense only covers the pending state.",
      why: "use suspends while a promise is pending, and Suspense shows its fallback during that wait. Suspense is the waiting boundary, not the failure boundary. A rejection is an error, and the nearest error boundary renders the error UI. An error boundary is a parent that catches errors from children. Do not wrap use in try and catch, because that catch swallows the signal Suspense needs while the promise is still pending. Replacing the promise with an empty string would hide the failure instead of showing it.",
      wrong: [
        {
          option: "From a try and catch around use, which is how Suspense reports failures",
          reason: "try and catch breaks Suspense. Failures are not reported that way.",
        },
        {
          option: "From the Suspense fallback, because a rejection stays on the loading UI",
          reason: "The Suspense fallback is for the wait. A rejection moves to the error boundary.",
        },
        {
          option: "From an empty string you resolve before passing the promise, so use cannot fail",
          reason: "That hides the error. It does not render error UI.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Component, Suspense, use, type ReactNode } from 'react';\n\nclass NoteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {\n  state = { failed: false };\n  static getDerivedStateFromError() { return { failed: true }; }\n  render() { return this.state.failed ? <p>Could not load</p> : this.props.children; }\n}\n\nfunction Note(props: { body: Promise<string> }) {\n  return <p>{use(props.body)}</p>;\n}\nexport function NoteSlot(props: { body: Promise<string> }) {\n  return <NoteBoundary><Suspense fallback={<p>Loading</p>}><Note body={props.body} /></Suspense></NoteBoundary>;\n}\n" },
      remember: "Pending promises use Suspense. Rejected promises use the error boundary.",
      docs: "https://react.dev/reference/react/use",
    },
  },
] satisfies Question[];
