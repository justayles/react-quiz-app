import type { Question } from '../types';

export const react19bQuestions = [
  {
    id: "r19b-001",
    tech: "react19",
    topic: "transitions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does useTransition return, and how are the updates inside startTransition scheduled?",
    options: [
      "It returns isPending, then startTransition. Updates inside that function are non-urgent and can be interrupted",
      "It returns startTransition, then isPending. Updates inside that function are urgent and flush before the next paint",
      "It returns only startTransition. React 19 removed the pending flag",
      "It returns isPending, then startTransition, and every update inside runs synchronously before the next keystroke",
    ],
    correctIndex: 0,
    explanation: {
      answer: "useTransition returns isPending first and startTransition second. State updates inside startTransition are non-urgent.",
      why: "The pair is always [isPending, startTransition], so the boolean comes first and the function comes second. You call startTransition with a function, and React marks the setState calls inside it as a transition. A transition can keep the current screen up while the next screen renders, and an urgent update such as typing can interrupt that work. isPending stays true while transition work is still unfinished, which is how a quiet loading hint is shown without blocking the input.",
      wrong: [
        {
          option: "It returns startTransition, then isPending. Updates inside that function are urgent and flush before the next paint",
          reason: "The boolean is first, and the updates are non-urgent rather than a sync flush before paint.",
        },
        {
          option: "It returns only startTransition. React 19 removed the pending flag",
          reason: "The hook still returns the pending flag so the UI can show that a transition is in progress.",
        },
        {
          option: "It returns isPending, then startTransition, and every update inside runs synchronously before the next keystroke",
          reason: "Transition updates are interruptible. They are not forced to finish before the next keystroke.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function Picker() {\n  const [tab, setTab] = useState('home');\n  const [isPending, startTransition] = useTransition();\n\n  function onPick(next: string) {\n    startTransition(() => {\n      setTab(next);\n    });\n  }\n\n  return <p>{isPending ? 'Updating' : tab}</p>;\n}\n" },
      remember: "The tuple is isPending, then startTransition, and the work inside can be interrupted.",
    },
  },
  {
    id: "r19b-002",
    tech: "react19",
    topic: "transitions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The text field feels stuck while the user types, even though the list is the expensive part. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function Search() {\n  const [query, setQuery] = useState('');\n  const [isPending, startTransition] = useTransition();\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={(event) => {\n          startTransition(() => {\n            setQuery(event.target.value);\n          });\n        }}\n      />\n      {isPending ? <span>Updating</span> : null}\n      <SlowList query={query} />\n    </div>\n  );\n}\n\nfunction SlowList({ query }: { query: string }) {\n  const items = buildResults(query);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction buildResults(query: string): string[] {\n  return [query];\n}\n",
    },
    options: [
      "useTransition is destructured backwards, so the input never receives the typed characters",
      "setQuery sits inside startTransition, so each keystroke is scheduled as non-urgent work",
      "A controlled input is illegal in React 19 and must be stored in a ref",
      "isPending blocks the whole page from painting until SlowList finishes",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The controlled query update is inside the transition, so the input itself waits on non-urgent rendering.",
      why: "The change handler does not update the input urgently. It wraps setQuery in startTransition, and React treats that update as work that can wait. The field is controlled by query, so the DOM value cannot move forward until that non-urgent render commits, which makes typing feel stuck. The expensive child is what should wait, not the keystroke. Set the input state immediately, then defer only the list with useDeferredValue or with a second piece of state updated inside the transition.",
      wrong: [
        {
          option: "useTransition is destructured backwards, so the input never receives the typed characters",
          reason: "isPending is first and startTransition is second, which is the correct order.",
        },
        {
          option: "A controlled input is illegal in React 19 and must be stored in a ref",
          reason: "Controlled inputs are still the normal pattern. The scheduling of setQuery is the problem.",
        },
        {
          option: "isPending blocks the whole page from painting until SlowList finishes",
          reason: "isPending is only a boolean you can render. It does not freeze paint by itself.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function Search() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n  return (\n    <div>\n      <input value={query} onChange={(event) => setQuery(event.target.value)} />\n      {isStale ? <span>Updating</span> : null}\n      <SlowList query={deferredQuery} />\n    </div>\n  );\n}\n" },
      remember: "Update the input urgently, and defer only the expensive child.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function Search() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={(event) => setQuery(event.target.value)}\n      />\n      {isStale ? <span>Updating</span> : null}\n      <SlowList query={deferredQuery} />\n    </div>\n  );\n}\n\nfunction SlowList({ query }: { query: string }) {\n  const items = buildResults(query);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction buildResults(query: string): string[] {\n  return [query];\n}\n",
      },
    },
  },
  {
    id: "r19b-003",
    tech: "react19",
    topic: "transitions",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "save returns a promise that resolves later. The user clicks Save. What is true before that promise resolves?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n\n  return (\n    <button onClick={onSave}>{isPending ? 'pending' : status}</button>\n  );\n}\n\nfunction save(): Promise<void> {\n  return new Promise((resolve) => {\n    setTimeout(resolve, 1000);\n  });\n}\n",
    },
    options: [
      "isPending becomes false when the sync part of the callback returns, so the update after await is urgent",
      "React rejects the async callback, leaves isPending false, and never calls setStatus",
      "isPending stays true until the async function finishes, and setStatus after await stays in that transition",
      "Both setStatus calls are dropped because state updates after await are discarded",
    ],
    correctIndex: 2,
    explanation: {
      answer: "In React 19 the async function is one transition, so isPending stays true through the await and the later setStatus stays inside it.",
      why: "startTransition receives an async function, which React 19 accepts. React sets isPending to true and keeps it true until that async function finishes, including the time spent waiting on save. The setStatus call after the await is still part of the same transition, so it does not suddenly become an urgent update. In React 18 this was not true: updates after an await left the transition, and you had to call startTransition again after the await. This quiz is React 19, so one async function covers the whole save.",
      wrong: [
        {
          option: "isPending becomes false when the sync part of the callback returns, so the update after await is urgent",
          reason: "That was the React 18 shape. React 19 waits for the async function to finish.",
        },
        {
          option: "React rejects the async callback, leaves isPending false, and never calls setStatus",
          reason: "React 19 runs the async function. It does not reject it or ignore the state updates.",
        },
        {
          option: "Both setStatus calls are dropped because state updates after await are discarded",
          reason: "Both updates are kept. The one after await remains inside the transition.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n\n  return <button onClick={onSave}>{isPending ? 'pending' : status}</button>;\n}\n" },
      remember: "In React 19, one async startTransition covers the updates after await.",
    },
  },
  {
    id: "r19b-004",
    tech: "react19",
    topic: "transitions",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A search box must stay responsive on every key, and the result grid is expensive to render. How should the updates be split?",
    options: [
      "Put both the input setState and the grid update inside one startTransition",
      "Store the typed text only in a ref and render the grid from a timer",
      "Copy the query into state inside useEffect so the grid always renders first",
      "Update the input state urgently, and defer the grid with useDeferredValue or a transition",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The keystroke updates the input immediately, and only the expensive grid is deferred.",
      why: "A controlled input has to show the character the user just typed, so that setState belongs outside the transition. If it is wrapped in startTransition, the keystroke becomes non-urgent and the field feels stuck. The grid can lag a frame or two, so its value should come from useDeferredValue or from state that is set inside startTransition. React can then keep the old grid on screen while it renders the next one, and a newer key can interrupt that work. The input and the expensive child are scheduled separately on purpose.",
      wrong: [
        {
          option: "Put both the input setState and the grid update inside one startTransition",
          reason: "That makes the keystrokes non-urgent, so the field feels stuck.",
        },
        {
          option: "Store the typed text only in a ref and render the grid from a timer",
          reason: "A ref does not re-render the input, and a timer is not the transition API.",
        },
        {
          option: "Copy the query into state inside useEffect so the grid always renders first",
          reason: "An effect runs after paint and adds a delayed extra render. It does not defer the grid.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function Search() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  return (\n    <div>\n      <input value={query} onChange={(event) => setQuery(event.target.value)} />\n      <Grid query={deferredQuery} />\n    </div>\n  );\n}\n" },
      remember: "Keep typing urgent, and defer only the slow child.",
    },
  },
  {
    id: "r19b-005",
    tech: "react19",
    topic: "transitions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does the optional initialValue argument of useDeferredValue do in React 19?",
    options: [
      "It is used on the first render only. Later renders defer the real value and keep showing the previous one while the next one renders",
      "It is shown again on every render where the deferred value is stale",
      "It replaces the real value permanently, so later updates are ignored",
      "It is a timeout in milliseconds, not a fallback value",
    ],
    correctIndex: 0,
    explanation: {
      answer: "initialValue is only for the first render. After that, a stale deferred value is the previous value, not the initial one.",
      why: "React 19 lets you pass a second argument to useDeferredValue. That initial value is what the hook returns on the first render only, which is useful when the real value would be too expensive for the very first paint. On later renders the hook defers the new value. While the new result is rendering in the background, React keeps showing the previous deferred value, not initialValue again. Treating initialValue as a loading placeholder for every keystroke will not work.",
      wrong: [
        {
          option: "It is shown again on every render where the deferred value is stale",
          reason: "After the first render, the stale UI is the previous deferred value.",
        },
        {
          option: "It replaces the real value permanently, so later updates are ignored",
          reason: "The real value is still deferred and will show once its render is ready.",
        },
        {
          option: "It is a timeout in milliseconds, not a fallback value",
          reason: "The second argument is a value of the same type, used on the first render only.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function Chart() {\n  const [points, setPoints] = useState('1,2,3');\n  const deferred = useDeferredValue(points, '');\n  return (\n    <div>\n      <button onClick={() => setPoints('4,5,6')}>Load</button>\n      <Heavy points={deferred} />\n    </div>\n  );\n}\n" },
      remember: "initialValue is first-render only. Later stale renders keep the previous value.",
    },
  },
  {
    id: "r19b-006",
    tech: "react19",
    topic: "transitions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Typing still forces the expensive list to render on every key. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function SearchBox() {\n  const [text, setText] = useState('');\n  const deferred = useDeferredValue(text);\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <SlowList query={text} />\n    </div>\n  );\n}\n\nfunction SlowList({ query }: { query: string }) {\n  const items = buildResults(query);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction buildResults(query: string): string[] {\n  return [query];\n}\n",
    },
    options: [
      "useDeferredValue must be called with an initialValue or it throws on the first key",
      "SlowList receives text, the urgent value, so the deferred query is never rendered",
      "The input setState is inside a transition, so the keystrokes are deferred too",
      "useDeferredValue runs only on the server, so the client list ignores it",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The hook result is unused. The slow list still receives the urgent text, so every key renders it immediately.",
      why: "The input correctly calls setText outside a transition, so the field itself can update at once. useDeferredValue(text) then creates a lagging copy of that text. The bug is the prop: SlowList is given text, not deferred, so the expensive child re-renders on the urgent update. While a deferred value is stale, React is supposed to keep showing the old one and render the new one in the background. That never happens here because the old value is not what the list reads. Pass deferred into SlowList.",
      wrong: [
        {
          option: "useDeferredValue must be called with an initialValue or it throws on the first key",
          reason: "initialValue is optional. Omitting it is valid and uses the real value on the first render.",
        },
        {
          option: "The input setState is inside a transition, so the keystrokes are deferred too",
          reason: "setText is called directly in the change handler, so the input update is urgent.",
        },
        {
          option: "useDeferredValue runs only on the server, so the client list ignores it",
          reason: "useDeferredValue is a client hook. The list ignores it because the prop passes the wrong variable.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function SearchBox() {\n  const [text, setText] = useState('');\n  const deferred = useDeferredValue(text);\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <SlowList query={deferred} />\n    </div>\n  );\n}\n" },
      remember: "Call useDeferredValue, then actually render the deferred value.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useDeferredValue, useState } from 'react';\n\nexport function SearchBox() {\n  const [text, setText] = useState('');\n  const deferred = useDeferredValue(text);\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <SlowList query={deferred} />\n    </div>\n  );\n}\n\nfunction SlowList({ query }: { query: string }) {\n  const items = buildResults(query);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction buildResults(query: string): string[] {\n  return [query];\n}\n",
      },
    },
  },
  {
    id: "r19b-007",
    tech: "react19",
    topic: "transitions",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "points changes from [1] to [1, 2, 3]. While React renders the new deferred result in the background, what does the user keep seeing?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useDeferredValue } from 'react';\n\nexport function Chart({ points }: { points: number[] }) {\n  const deferred = useDeferredValue(points);\n  return <Heavy points={deferred} />;\n}\n\nfunction Heavy({ points }: { points: number[] }) {\n  return <p>{points.join(',')}</p>;\n}\n",
    },
    options: [
      "A blank chart, because the previous points are thrown away as soon as points changes",
      "The text 1,2,3, because useDeferredValue always returns the latest points on this render",
      "The previous points, while the new points render in the background",
      "The initialValue placeholder, even though this call does not pass one",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The screen keeps the previous deferred points until the background render of the new points is ready.",
      why: "useDeferredValue returns a value that may lag behind the latest points. When points changes, React can keep the already shown result on screen and render the new one in the background. During that time Heavy still receives the old array, so the user keeps seeing the previous chart. The new text appears when that background render commits. No initialValue was passed, and even if it had been, that argument is only for the first render, not for this later update.",
      wrong: [
        {
          option: "A blank chart, because the previous points are thrown away as soon as points changes",
          reason: "A stale deferred value stays visible. React does not clear it while the next render is in progress.",
        },
        {
          option: "The text 1,2,3, because useDeferredValue always returns the latest points on this render",
          reason: "The whole point of the hook is that the rendered value can trail the latest points.",
        },
        {
          option: "The initialValue placeholder, even though this call does not pass one",
          reason: "There is no initialValue here, and that argument would not be reused on a later update anyway.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue } from 'react';\n\nexport function Chart({ points }: { points: number[] }) {\n  const deferred = useDeferredValue(points);\n  const isStale = points !== deferred;\n  return (\n    <div style={{ opacity: isStale ? 0.6 : 1 }}>\n      <Heavy points={deferred} />\n    </div>\n  );\n}\n" },
      remember: "While a deferred value is stale, keep showing the old one.",
    },
  },
  {
    id: "r19b-008",
    tech: "react19",
    topic: "transitions",
    kind: "concept",
    difficulty: "expert",
    prompt: "A Suspense boundary has already revealed its content. A later update makes the child suspend. When does the fallback replace that content?",
    options: [
      "On every update that suspends, whether or not it is a transition",
      "Never, once content has been revealed the fallback cannot appear again",
      "Only when the update is wrapped in a transition",
      "When the update is not a transition. A transition that suspends keeps the already revealed content",
    ],
    correctIndex: 3,
    explanation: {
      answer: "A non-transition update that suspends shows the fallback. A transition that suspends keeps the content that is already on screen.",
      why: "Suspense hides already revealed content only for an update that suspends outside a transition. React then swaps in the nearest fallback until the new tree is ready, so the user sees a flash of loading UI. If that same update is wrapped in startTransition, or the value is deferred, React keeps the revealed tree mounted and waits to show the next one. isPending can tell the user that work is happening without hiding the page. The fallback is still used for the first load, before anything has been revealed.",
      wrong: [
        {
          option: "On every update that suspends, whether or not it is a transition",
          reason: "Transitions are the exception. They do not hide content that has already been revealed.",
        },
        {
          option: "Never, once content has been revealed the fallback cannot appear again",
          reason: "An urgent update that suspends does show the fallback again.",
        },
        {
          option: "Only when the update is wrapped in a transition",
          reason: "It is the other way around. The transition is what avoids the fallback.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Suspense, useState, useTransition } from 'react';\n\nexport function Page() {\n  const [tab, setTab] = useState('home');\n  const [, startTransition] = useTransition();\n  return (\n    <div>\n      <button onClick={() => startTransition(() => setTab('next'))}>Next</button>\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n" },
      remember: "Transitions do not hide revealed content behind a Suspense fallback.",
    },
  },
  {
    id: "r19b-009",
    tech: "react19",
    topic: "transitions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Home is already on screen. Panel suspends when tab becomes stats, and the click replaces the page with Loading. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { Suspense, useState } from 'react';\n\nconst statsPromise = new Promise<string>(() => {});\n\nexport function Tabs() {\n  const [tab, setTab] = useState('home');\n  return (\n    <div>\n      <button onClick={() => setTab('stats')}>Stats</button>\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n\nfunction Panel({ tab }: { tab: string }) {\n  if (tab === 'stats') {\n    throw statsPromise;\n  }\n  return <p>{tab}</p>;\n}\n",
    },
    options: [
      "The tab change is an urgent update, so the suspend hides the revealed panel behind the fallback",
      "Suspense cannot wrap Panel, because Panel is a custom component",
      "useState ignores the click when the next tab is a string",
      "The fallback appears only if setTab is called inside startTransition",
    ],
    correctIndex: 0,
    explanation: {
      answer: "setTab is a normal urgent update, so the already revealed home panel is replaced by the Suspense fallback when stats suspends.",
      why: "The button calls setTab directly, which is not a transition. Home has already been revealed inside the boundary. When Panel throws statsPromise, React has to show the fallback for that urgent update, so the visible page disappears behind Loading. Wrapping the tab change in startTransition marks it non-urgent, and React then keeps the revealed panel on screen while stats loads. The boundary and the string state are fine, so the missing transition is the bug.",
      wrong: [
        {
          option: "Suspense cannot wrap Panel, because Panel is a custom component",
          reason: "Suspense is meant to wrap components that may suspend. That part is valid.",
        },
        {
          option: "useState ignores the click when the next tab is a string",
          reason: "setTab('stats') is a normal state update and will render.",
        },
        {
          option: "The fallback appears only if setTab is called inside startTransition",
          reason: "A transition is what prevents the fallback from hiding revealed content.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Suspense, useState, useTransition } from 'react';\n\nexport function Tabs() {\n  const [tab, setTab] = useState('home');\n  const [isPending, startTransition] = useTransition();\n  return (\n    <div>\n      <button onClick={() => startTransition(() => setTab('stats'))}>Stats</button>\n      {isPending ? <span>Pending</span> : null}\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n" },
      remember: "Wrap a suspending navigation in startTransition so the current screen stays up.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { Suspense, useState, useTransition } from 'react';\n\nconst statsPromise = new Promise<string>(() => {});\n\nexport function Tabs() {\n  const [tab, setTab] = useState('home');\n  const [isPending, startTransition] = useTransition();\n  return (\n    <div>\n      <button\n        onClick={() => {\n          startTransition(() => {\n            setTab('stats');\n          });\n        }}\n      >\n        Stats\n      </button>\n      {isPending ? <span>Pending</span> : null}\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n\nfunction Panel({ tab }: { tab: string }) {\n  if (tab === 'stats') {\n    throw statsPromise;\n  }\n  return <p>{tab}</p>;\n}\n",
      },
    },
  },
  {
    id: "r19b-010",
    tech: "react19",
    topic: "transitions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Home is already visible, and Panel suspends when tab becomes stats. Which click replaces the visible panel with Loading?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { Suspense, useState, useTransition } from 'react';\n\nconst statsPromise = new Promise<string>(() => {});\n\nexport function Tabs() {\n  const [tab, setTab] = useState('home');\n  const [isPending, startTransition] = useTransition();\n\n  function onUrgent() {\n    setTab('stats');\n  }\n\n  function onSoft() {\n    startTransition(() => {\n      setTab('stats');\n    });\n  }\n\n  return (\n    <div>\n      <button onClick={onUrgent}>Urgent</button>\n      <button onClick={onSoft}>Soft</button>\n      {isPending ? <span>Pending</span> : null}\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n\nfunction Panel({ tab }: { tab: string }) {\n  if (tab === 'stats') {\n    throw statsPromise;\n  }\n  return <p>{tab}</p>;\n}\n",
    },
    options: [
      "Both clicks show Loading, because any update that suspends reveals the fallback",
      "Only Urgent. Soft keeps the revealed panel and marks the transition pending",
      "Only Soft. An urgent setState is not allowed to suspend",
      "Neither click shows Loading, because this Suspense boundary ignores tab changes",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Urgent hides the revealed panel with Loading. Soft keeps that panel and sets isPending while stats is still suspended.",
      why: "onUrgent calls setTab with no transition, so the suspend is an ordinary update and the boundary shows its fallback. onSoft wraps the same setTab in startTransition. For a transition, React does not hide content that has already been revealed, so Home stays on screen while the stats tree is not ready. isPending becomes true for that soft click, which is the pending hint next to the buttons. The two clicks schedule the same next tab with different urgency, and that is why only one of them flashes Loading.",
      wrong: [
        {
          option: "Both clicks show Loading, because any update that suspends reveals the fallback",
          reason: "The soft click is a transition, so the revealed panel stays mounted.",
        },
        {
          option: "Only Soft. An urgent setState is not allowed to suspend",
          reason: "The urgent update is the one that shows the fallback. It is allowed to suspend.",
        },
        {
          option: "Neither click shows Loading, because this Suspense boundary ignores tab changes",
          reason: "The boundary does react. The urgent click shows Loading.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Suspense, useState, useTransition } from 'react';\n\nexport function Tabs() {\n  const [tab, setTab] = useState('home');\n  const [isPending, startTransition] = useTransition();\n  return (\n    <div>\n      <button onClick={() => startTransition(() => setTab('stats'))}>Soft</button>\n      {isPending ? <span>Pending</span> : null}\n      <Suspense fallback={<p>Loading</p>}>\n        <Panel tab={tab} />\n      </Suspense>\n    </div>\n  );\n}\n" },
      remember: "A transition that suspends keeps revealed content. An urgent update shows the fallback.",
    },
  },
  {
    id: "r19b-011",
    tech: "react19",
    topic: "transitions",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "A reviewer says a React 19 save must call startTransition again after every await, because that is what React 18 required. What should the author do?",
    options: [
      "Keep a fresh startTransition after every await. React 19 still drops those later updates",
      "Move the request into useEffect, because async functions are rejected by startTransition",
      "Pass one async function to startTransition and delete the extra calls after await",
      "Add the directive 'use no memo' so the updates after await stay urgent",
    ],
    correctIndex: 2,
    explanation: {
      answer: "React 19 keeps the updates after await inside the same async transition, so the second startTransition is no longer required.",
      why: "Pass one async function to startTransition and put the await inside it. isPending stays true until that async function finishes, and a setState after the await is still part of the transition. React 18 did not work this way: updates after an await left the transition, so you had to call startTransition again after the await. Copying that React 18 workaround into React 19 is unnecessary. The directive 'use no memo' has nothing to do with transition scope, and an effect would change when the save runs.",
      wrong: [
        {
          option: "Keep a fresh startTransition after every await. React 19 still drops those later updates",
          reason: "That extra call was the React 18 workaround. React 19 keeps the later updates in the transition.",
        },
        {
          option: "Move the request into useEffect, because async functions are rejected by startTransition",
          reason: "React 19 accepts an async function in startTransition. An effect is a different lifecycle.",
        },
        {
          option: "Add the directive 'use no memo' so the updates after await stay urgent",
          reason: "That directive opts a function out of the compiler. It does not change transition behavior.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n\n  return <button onClick={onSave}>{status}</button>;\n}\n" },
      remember: "In React 19, one async startTransition covers the code after await.",
    },
  },
  {
    id: "r19b-012",
    tech: "react19",
    topic: "transitions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The pending label turns off as soon as the click handler continues, before save has finished. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(() => {\n      setStatus('saving');\n    });\n    void save().then(() => {\n      setStatus('saved');\n    });\n  }\n\n  return <button onClick={onSave}>{isPending ? 'pending' : status}</button>;\n}\n\nfunction save(): Promise<void> {\n  return new Promise((resolve) => {\n    setTimeout(resolve, 1000);\n  });\n}\n",
    },
    options: [
      "The tuple is backwards, so isPending is the start function and the flag never changes",
      "setStatus is illegal inside startTransition, so React drops the saving update",
      "A promise always clears isPending, even when it was started inside the transition",
      "The promise runs outside startTransition, so the transition ends when the sync callback returns",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Only the saving update is inside the transition. The promise is started outside it, so isPending ends with the sync callback.",
      why: "startTransition runs a sync function that sets status to saving, and that function returns immediately. The call to save happens after that, in the click handler, so its later setStatus is an ordinary update and is not part of the transition. isPending is true only while transition work remains, so it drops as soon as the sync callback finishes. React 19 can take an async function instead, and then updates after the await stay in the transition until that function finishes. In React 18 those later updates did not stay in the transition, and you had to call startTransition again after the await. Here the await never entered the transition at all.",
      wrong: [
        {
          option: "The tuple is backwards, so isPending is the start function and the flag never changes",
          reason: "The destructuring order is already isPending, then startTransition.",
        },
        {
          option: "setStatus is illegal inside startTransition, so React drops the saving update",
          reason: "Setting state inside startTransition is the normal way to mark an update as a transition.",
        },
        {
          option: "A promise always clears isPending, even when it was started inside the transition",
          reason: "In React 19 an async function passed to startTransition keeps isPending true until it finishes.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n\n  return <button onClick={onSave}>{isPending ? 'pending' : status}</button>;\n}\n" },
      remember: "Await inside the async function you pass to startTransition, not after the call.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n\n  return <button onClick={onSave}>{isPending ? 'pending' : status}</button>;\n}\n\nfunction save(): Promise<void> {\n  return new Promise((resolve) => {\n    setTimeout(resolve, 1000);\n  });\n}\n",
      },
    },
  },
  {
    id: "r19b-013",
    tech: "react19",
    topic: "transitions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "A slow list render was started with startTransition. The user keeps typing. Can those keystrokes interrupt the list render?",
    options: [
      "Yes. The list update is non-urgent, so an urgent update such as typing can interrupt it",
      "No. startTransition locks input until the list render commits",
      "Only when the transition function is async. A sync transition always runs to the end",
      "Only during server rendering. Client transitions cannot be interrupted",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Yes. Transition renders are non-urgent, so a new keystroke can interrupt them and render first.",
      why: "Updates inside startTransition are allowed to wait, and React may abandon an in-progress transition render when something urgent happens. Typing in a controlled input is urgent, because the field has to keep up with the user. React handles that keystroke first, then retries the list with the newer query. A sync transition can be interrupted just as an async one can. This is a client scheduling rule, not something that only happens while rendering on the server.",
      wrong: [
        {
          option: "No. startTransition locks input until the list render commits",
          reason: "Transitions exist so urgent input does not have to wait for slow work.",
        },
        {
          option: "Only when the transition function is async. A sync transition always runs to the end",
          reason: "Urgency is about the update, not about whether the callback used await.",
        },
        {
          option: "Only during server rendering. Client transitions cannot be interrupted",
          reason: "Interrupting a transition is client render scheduling. The server is not required.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\nexport function Search() {\n  const [text, setText] = useState('');\n  const [list, setList] = useState<string[]>([]);\n  const [, startTransition] = useTransition();\n  function onChange(value: string) {\n    setText(value);\n    startTransition(() => setList(matchAll(value)));\n  }\n  return (\n    <div>\n      <input value={text} onChange={(event) => onChange(event.target.value)} />\n      <p>{list.length}</p>\n    </div>\n  );\n}\n" },
      remember: "Urgent updates such as typing can interrupt a transition.",
    },
  },
  {
    id: "r19b-014",
    tech: "react19",
    topic: "transitions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "matchAll is expensive, and the user types the next character before the list render finishes. Which update can React interrupt?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function Search() {\n  const [text, setText] = useState('');\n  const [list, setList] = useState<string[]>([]);\n  const [, startTransition] = useTransition();\n\n  function onChange(value: string) {\n    setText(value);\n    startTransition(() => {\n      setList(matchAll(value));\n    });\n  }\n\n  return (\n    <div>\n      <input value={text} onChange={(event) => onChange(event.target.value)} />\n      <p>{list.length}</p>\n    </div>\n  );\n}\n\nfunction matchAll(value: string): string[] {\n  return [value];\n}\n",
    },
    options: [
      "setText, because every setState in an event is non-urgent",
      "setList, because it is inside startTransition and the next keystroke is urgent",
      "Neither update. React finishes both before it reads the next key",
      "Both updates. useTransition marks every setState in the event as interruptible",
    ],
    correctIndex: 1,
    explanation: {
      answer: "setText is urgent and stays responsive. setList is the transition, so a newer keystroke can interrupt it.",
      why: "onChange updates the input with a normal setText, then puts only setList inside startTransition. The text update is urgent, so React will not set it aside to finish the slow list. The list update is non-urgent and can be interrupted when the next character calls setText again. React can then render the newer text first and restart the list for the newer value. The transition does not spread to setText, because that call sits outside startTransition.",
      wrong: [
        {
          option: "setText, because every setState in an event is non-urgent",
          reason: "setText is outside the transition, so it is the urgent update.",
        },
        {
          option: "Neither update. React finishes both before it reads the next key",
          reason: "A long transition render is allowed to yield to an urgent keystroke.",
        },
        {
          option: "Both updates. useTransition marks every setState in the event as interruptible",
          reason: "Only the updates inside the startTransition callback are transitions.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function Search() {\n  const [text, setText] = useState('');\n  const [list, setList] = useState<string[]>([]);\n  const [, startTransition] = useTransition();\n\n  function onChange(value: string) {\n    setText(value);\n    startTransition(() => {\n      setList(matchAll(value));\n    });\n  }\n\n  return <p>{text}:{list.length}</p>;\n}\n" },
      remember: "The setState inside startTransition is the one an urgent keystroke can interrupt.",
    },
  },
  {
    id: "r19b-015",
    tech: "react19",
    topic: "transitions",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A spinner bound to isPending disappears at the await, then the saved message appears later with no spinner. The handler calls startTransition with a sync function that sets saving, awaits save after that call returns, then sets saved. Why does the spinner drop early?",
    options: [
      "isPending can stay true only for the first setState of a component, so the second update clears it",
      "React 19 rejects async work, so isPending is hard-wired to false after any click",
      "The await is outside the transition, so isPending ends when the sync callback returns",
      "Showing isPending in the button forces React to commit the transition before the await",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The transition only contains the sync saving update. The await never joined it, so the pending flag ends immediately.",
      why: "startTransition finishes as soon as its sync callback returns, and the await happens after that call. Nothing after the await is marked as transition work, so the saved update is urgent and isPending is already false. The fix in React 19 is to pass an async function, so the await and the later setState stay inside the transition and isPending lasts until that function finishes. React 18 could not do that: updates after an await left the transition, and you had to call startTransition again after the await. This handler is not even the React 18 workaround, because the later update is not wrapped at all.",
      wrong: [
        {
          option: "isPending can stay true only for the first setState of a component, so the second update clears it",
          reason: "The flag tracks unfinished transition work, not a one-update quota.",
        },
        {
          option: "React 19 rejects async work, so isPending is hard-wired to false after any click",
          reason: "React 19 accepts an async function and keeps isPending true until it finishes.",
        },
        {
          option: "Showing isPending in the button forces React to commit the transition before the await",
          reason: "Rendering the flag does not end the transition. The sync callback returning is what ends it.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function SaveButton() {\n  const [status, setStatus] = useState('idle');\n  const [isPending, startTransition] = useTransition();\n  function onSave() {\n    startTransition(async () => {\n      setStatus('saving');\n      await save();\n      setStatus('saved');\n    });\n  }\n  return <button onClick={onSave}>{isPending ? 'pending' : status}</button>;\n}\n" },
      remember: "If the await sits outside startTransition, isPending will not cover the request.",
    },
  },
  {
    id: "r19b-016",
    tech: "react19",
    topic: "transitions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "This list starts a transition while rendering and keeps scheduling more updates. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState, useTransition } from 'react';\n\nexport function List({ query }: { query: string }) {\n  const [items, setItems] = useState<string[]>([]);\n  const [, startTransition] = useTransition();\n  startTransition(() => {\n    setItems(matchAll(query));\n  });\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction matchAll(query: string): string[] {\n  return [query];\n}\n",
    },
    options: [
      "useTransition is not allowed in a function component, so the call throws before the list paints",
      "matchAll has to be wrapped in useMemo or the rendered list is always empty",
      "The list key is illegal because the item is a string",
      "startTransition and setItems run during render, so every pass schedules another update",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The transition is a side effect during render. Each pass calls setItems, so the component schedules another update.",
      why: "Render should compute the UI from props and state, not start a transition. Here the body calls startTransition and then setItems on every pass, including the pass caused by that setItems. matchAll returns a new array, so the state does not settle and the work repeats. startTransition belongs in the event that changes query, or the list can derive its items during render from useDeferredValue(query). A string key is legal, and useTransition itself is legal in a component when it is called at the top level and used from a handler.",
      wrong: [
        {
          option: "useTransition is not allowed in a function component, so the call throws before the list paints",
          reason: "The hook is allowed. Calling it during render to set state is the mistake.",
        },
        {
          option: "matchAll has to be wrapped in useMemo or the rendered list is always empty",
          reason: "The list is empty only until a scheduled update lands. The loop comes from setting state while rendering.",
        },
        {
          option: "The list key is illegal because the item is a string",
          reason: "A stable string is a valid key. It is not why updates keep being scheduled.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useDeferredValue } from 'react';\n\nexport function List({ query }: { query: string }) {\n  const deferred = useDeferredValue(query);\n  const items = matchAll(deferred);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n" },
      remember: "Do not call startTransition or setState while the component function is rendering.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useDeferredValue } from 'react';\n\nexport function List({ query }: { query: string }) {\n  const deferred = useDeferredValue(query);\n  const items = matchAll(deferred);\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}\n\nfunction matchAll(query: string): string[] {\n  return [query];\n}\n",
      },
    },
  },
  {
    id: "r19b-017",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The counter jumps to 1 and then never moves again. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCount(count + 1);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <p>{count}</p>;\n}\n",
    },
    options: [
      "The interval closes over the first count, so setCount(count + 1) keeps writing 1",
      "useEffect does not run after mount, so the interval is never created",
      "The cleanup clears the interval before the first tick, so count cannot change",
      "Strict Mode resets count to 0 after every tick in production",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The effect captures count as 0 and never reads a later value, so every tick stores 1.",
      why: "The effect dependency list is empty, so the interval is created once and its callback keeps the count from that first render. count is 0 there, and count + 1 is 1 on every tick. setCount(1) after the first tick is the same state, so the screen stays at 1. The effect does run, and the cleanup runs only when the component unmounts or before a re-run, not before the first tick. The fix is the functional update setCount((current) => current + 1), which reads the latest state without putting count in the dependency list.",
      wrong: [
        {
          option: "useEffect does not run after mount, so the interval is never created",
          reason: "The effect does run after mount. That is why the counter reaches 1.",
        },
        {
          option: "The cleanup clears the interval before the first tick, so count cannot change",
          reason: "With an empty dependency list the cleanup waits until unmount. The tick does happen.",
        },
        {
          option: "Strict Mode resets count to 0 after every tick in production",
          reason: "The stuck value is the stale closure. Strict Mode does not reset state on each tick in production.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCount((current) => current + 1);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <p>{count}</p>;\n}\n" },
      remember: "If the next state depends on the previous state, use the functional setState form.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCount((current) => current + 1);\n    }, 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <p>{count}</p>;\n}\n",
      },
    },
  },
  {
    id: "r19b-018",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does Strict Mode do to a component in development?",
    options: [
      "It skips effects so the page stays on the server HTML",
      "It renders twice, and it runs effect setup, cleanup, then setup again. That extra cycle is development only",
      "It runs every effect twice in the production build so leaks show up for users",
      "It disables cleanup functions so subscriptions stay mounted",
    ],
    correctIndex: 1,
    explanation: {
      answer: "In development, Strict Mode double-invokes render and runs setup, cleanup, then setup for effects. Production does not add that cycle.",
      why: "React renders the component an extra time in development to surface impure render logic. It also mounts effects, runs their cleanup, and sets them up again, so a missing cleanup shows up immediately as a doubled subscription. That extra setup-cleanup-setup cycle is a development check, not production behavior. Cleanup must be safe to run, because React will call it during the check and later for a real unmount. Skipping effects or disabling cleanup would hide the bugs Strict Mode is there to find.",
      wrong: [
        {
          option: "It skips effects so the page stays on the server HTML",
          reason: "Strict Mode runs effects. It does not skip them to preserve server HTML.",
        },
        {
          option: "It runs every effect twice in the production build so leaks show up for users",
          reason: "The extra cycle is development only. Production sets the effect up once.",
        },
        {
          option: "It disables cleanup functions so subscriptions stay mounted",
          reason: "It does the opposite. It runs cleanup so an unsafe effect is obvious.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect } from 'react';\n\nexport function Feed() {\n  useEffect(() => {\n    const id = subscribe(onMessage);\n    return () => {\n      unsubscribe(id);\n    };\n  }, []);\n  return <p>Feed</p>;\n}\n" },
      remember: "Strict Mode's extra render and effect cycle are development only, and cleanup must be safe.",
    },
  },
  {
    id: "r19b-019",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The div is wider than 100 pixels. What can the user see on the client?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useEffect, useRef, useState } from 'react';\n\nexport function Box() {\n  const ref = useRef<HTMLDivElement>(null);\n  const [wide, setWide] = useState(false);\n  useEffect(() => {\n    const width = ref.current?.offsetWidth ?? 0;\n    setWide(width > 100);\n  }, []);\n  return <div ref={ref} className={wide ? 'wide' : 'narrow'}>Box</div>;\n}\n",
    },
    options: [
      "The first paint already has the wide class, because useEffect runs before the browser paints",
      "The server HTML already has the wide class, because useEffect runs during server rendering",
      "The first client paint can still have the narrow class, then the effect switches it after paint",
      "The effect never reads a width, because a ref is cleared before useEffect runs",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The first client paint can show narrow, because useEffect measures the box only after the browser has painted.",
      why: "wide starts false, so the first client render commits the narrow class. useEffect runs after that paint, reads offsetWidth, and then setWide(true) causes a second paint with the wide class. The user can see a flash of the narrow class. useLayoutEffect would run after the DOM update and before paint, so the correction could land in the first paint. Neither hook runs on the server, so the server HTML is not given the wide class by this effect.",
      wrong: [
        {
          option: "The first paint already has the wide class, because useEffect runs before the browser paints",
          reason: "useEffect runs after paint. useLayoutEffect is the hook that runs before paint.",
        },
        {
          option: "The server HTML already has the wide class, because useEffect runs during server rendering",
          reason: "useEffect does not run on the server, so it cannot measure or change the server HTML.",
        },
        {
          option: "The effect never reads a width, because a ref is cleared before useEffect runs",
          reason: "After commit the ref points at the div, and the effect can read offsetWidth.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useLayoutEffect, useRef, useState } from 'react';\n\nexport function Box() {\n  const ref = useRef<HTMLDivElement>(null);\n  const [wide, setWide] = useState(false);\n  useLayoutEffect(() => {\n    const width = ref.current?.offsetWidth ?? 0;\n    setWide(width > 100);\n  }, []);\n  return <div ref={ref} className={wide ? 'wide' : 'narrow'}>Box</div>;\n}\n" },
      remember: "useEffect runs after paint. useLayoutEffect runs before paint. Neither runs on the server.",
    },
  },
  {
    id: "r19b-020",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The profile refetches even when the parent re-renders with the same userId. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Profile({ userId }: { userId: string }) {\n  const options = { userId: userId };\n  const [name, setName] = useState<string | null>(null);\n  useEffect(() => {\n    let active = true;\n    void loadName(userId).then((next) => {\n      if (active) {\n        setName(next);\n      }\n    });\n    return () => {\n      active = false;\n    };\n  }, [options]);\n  return <p>{name}</p>;\n}\n\nfunction loadName(userId: string): Promise<string> {\n  return Promise.resolve(userId);\n}\n",
    },
    options: [
      "loadName is called during render, so React discards the effect",
      "The cleanup sets active to false before the request starts, so the name can never arrive",
      "useState refuses a null initial value, so every render starts a new request",
      "options is a new object every render, so the effect dependency changes on every commit",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The effect depends on options, and that object is a new identity on every render, so the effect is not tied to userId.",
      why: "The component creates options during render, and a new object is not the same reference as the previous one. The dependency list therefore changes on every commit, even when userId is the same string. React runs the cleanup and starts loadName again, and the setName that follows can cause one of those extra commits, as can any parent render. Depend on the userId string, or memoize the object, so the effect runs only when the id changes. The compiler can stabilize that object when it is on, but this component does not do that by itself.",
      wrong: [
        {
          option: "loadName is called during render, so React discards the effect",
          reason: "loadName is called inside the effect, after commit, which is a normal place for a request.",
        },
        {
          option: "The cleanup sets active to false before the request starts, so the name can never arrive",
          reason: "The cleanup runs on the next effect cycle or unmount, not before the first request.",
        },
        {
          option: "useState refuses a null initial value, so every render starts a new request",
          reason: "null is a valid initial state. The changing object dependency is what restarts the effect.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Profile({ userId }: { userId: string }) {\n  const [name, setName] = useState<string | null>(null);\n  useEffect(() => {\n    let active = true;\n    void loadName(userId).then((next) => {\n      if (active) setName(next);\n    });\n    return () => {\n      active = false;\n    };\n  }, [userId]);\n  return <p>{name}</p>;\n}\n" },
      remember: "An object created during render is a new dependency every commit unless something stabilizes it.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Profile({ userId }: { userId: string }) {\n  const [name, setName] = useState<string | null>(null);\n  useEffect(() => {\n    let active = true;\n    void loadName(userId).then((next) => {\n      if (active) {\n        setName(next);\n      }\n    });\n    return () => {\n      active = false;\n    };\n  }, [userId]);\n  return <p>{name}</p>;\n}\n\nfunction loadName(userId: string): Promise<string> {\n  return Promise.resolve(userId);\n}\n",
      },
    },
  },
  {
    id: "r19b-021",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A heading copies firstName and lastName into state inside useEffect so the full name can update. It lags by a render. What should replace that effect?",
    options: [
      "Compute the full name from the props during render. Use a key only when a child must reset its own state",
      "Keep the effect. Copying props into state is the supported way to derive a value",
      "Put the props in a ref so the heading updates before the browser paints",
      "Wrap the copy in startTransition so the extra render becomes the derived value",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The full name is derived, so render should compute it from props. A key is for resetting state, not for copying props.",
      why: "Storing firstName and lastName in state duplicates data React already receives as props. The effect runs after paint, so the heading is stale for a frame and the extra setState renders again. During render, join the two props and return that string. There is no state to keep in sync. A key on a child is a different tool: when the key changes, React unmounts that child and mounts a fresh one, which resets its state. Use a key when a draft really must reset, not to publish a value that can be calculated.",
      wrong: [
        {
          option: "Keep the effect. Copying props into state is the supported way to derive a value",
          reason: "That pattern lags and double-renders. Derived text should be calculated while rendering.",
        },
        {
          option: "Put the props in a ref so the heading updates before the browser paints",
          reason: "Writing a ref does not re-render the heading, and it is still a copy of the props.",
        },
        {
          option: "Wrap the copy in startTransition so the extra render becomes the derived value",
          reason: "A transition only changes urgency. It does not make a copied prop the right source of truth.",
        },
      ],
      example: { lang: 'tsx', source: "export function Heading(props: { firstName: string; lastName: string }) {\n  const fullName = props.firstName + ' ' + props.lastName;\n  return <h1>{fullName}</h1>;\n}\n\nexport function Screen({ docId }: { docId: string }) {\n  return <Editor key={docId} />;\n}\n" },
      remember: "Compute derived values during render. A changed key resets state.",
    },
  },
  {
    id: "r19b-022",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Each row keeps a draft. After a todo is inserted at the top, the drafts stick to the wrong rows. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function TodoList({ todos }: { todos: { id: string; text: string }[] }) {\n  return (\n    <ul>\n      {todos.map((todo, index) => (\n        <li key={index}>\n          <TodoRow text={todo.text} />\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nfunction TodoRow({ text }: { text: string }) {\n  const [draft, setDraft] = useState(text);\n  return (\n    <input value={draft} onChange={(event) => setDraft(event.target.value)} />\n  );\n}\n",
    },
    options: [
      "TodoRow cannot hold state because it is rendered inside map",
      "The index key ties each row's state to its position, so an insert gives the draft to the wrong todo",
      "useState(text) subscribes to later text props, so React is required to move the draft with the todo",
      "The input is uncontrolled, so React drops the draft when the list changes",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The key is the array index, so React keeps each TodoRow with a position instead of with a todo.",
      why: "Keys tell React which previous component matches which next component. key={index} means position 0 is always the same component, even if a new todo is inserted there. That component still holds the draft from whatever used to be first, so the state is associated with the wrong item. The same mix-up happens when the list is reordered or filtered. The todo id is stable data, and it should be the key. State inside a mapped child is legal, and this input is controlled by draft.",
      wrong: [
        {
          option: "TodoRow cannot hold state because it is rendered inside map",
          reason: "A child rendered in a loop can hold state. The key decides which child keeps which state.",
        },
        {
          option: "useState(text) subscribes to later text props, so React is required to move the draft with the todo",
          reason: "The initial state is used only on mount. It does not follow the todo when the key is the index.",
        },
        {
          option: "The input is uncontrolled, so React drops the draft when the list changes",
          reason: "The input's value is draft, so it is controlled. The index key is what mis-assigns that state.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function TodoList({ todos }: { todos: { id: string; text: string }[] }) {\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li key={todo.id}><TodoRow text={todo.text} /></li>\n      ))}\n    </ul>\n  );\n}\n\nfunction TodoRow({ text }: { text: string }) {\n  const [draft, setDraft] = useState(text);\n  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;\n}\n" },
      remember: "Key list rows by a stable id from the data, not by the array index.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport function TodoList({ todos }: { todos: { id: string; text: string }[] }) {\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li key={todo.id}>\n          <TodoRow text={todo.text} />\n        </li>\n      ))}\n    </ul>\n  );\n}\n\nfunction TodoRow({ text }: { text: string }) {\n  const [draft, setDraft] = useState(text);\n  return (\n    <input value={draft} onChange={(event) => setDraft(event.target.value)} />\n  );\n}\n",
      },
    },
  },
  {
    id: "r19b-023",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The user clicks the button once. How many re-renders does that click schedule?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Panel() {\n  const [a, setA] = useState(0);\n  const [b, setB] = useState(0);\n\n  function onClick() {\n    setA(1);\n    setB(2);\n  }\n\n  return (\n    <button onClick={onClick}>\n      {a}-{b}\n    </button>\n  );\n}\n",
    },
    options: [
      "Two. Each setState always renders on its own",
      "None. React skips the click because the handler reads no state",
      "One. Both updates from the click are batched into a single render",
      "Three. React renders once per setState and once more for the event",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The click produces one render, with a equal to 1 and b equal to 2.",
      why: "Both setState calls happen in the same click handler, and React batches them. The component renders once with the two new values, so the button text becomes 1-2 from that single commit. React 18 and later also batch updates that happen in timeouts and in promises, not only in React event handlers. This click is the event case: two updates, one render. The handler does change state, so the render is not skipped.",
      wrong: [
        {
          option: "Two. Each setState always renders on its own",
          reason: "Updates in the same event are batched. They do not each force a render.",
        },
        {
          option: "None. React skips the click because the handler reads no state",
          reason: "The handler writes new state, so React renders. It just renders once for both writes.",
        },
        {
          option: "Three. React renders once per setState and once more for the event",
          reason: "There is no extra event render. The two updates share one render.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Panel() {\n  const [a, setA] = useState(0);\n  const [b, setB] = useState(0);\n\n  function onClick() {\n    setA(1);\n    setB(2);\n  }\n\n  return <button onClick={onClick}>{a}-{b}</button>;\n}\n" },
      remember: "React 18 and later batches several setStates in an event, a timeout, or a promise into one render.",
    },
  },
  {
    id: "r19b-024",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "concept",
    difficulty: "advanced",
    prompt: "A component calls useSyncExternalStore during server rendering with subscribe and getSnapshot, and it omits getServerSnapshot. What goes wrong?",
    options: [
      "Nothing. The server reuses the client snapshot, so hydration is guaranteed to match",
      "The hook suspends until the store emits, then hydration continues from that emission",
      "React skips the hook on the server and renders null for that component",
      "The server snapshot is missing, so the server HTML can disagree with the client and hydration mismatches",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Server rendering needs getServerSnapshot. Without it, the server and the client can produce different HTML.",
      why: "useSyncExternalStore reads an external store during render. On the server there is no client store to subscribe to, so React asks for getServerSnapshot to know what HTML to emit. If that function is missing, the server output is not tied to a snapshot the client will use for hydration. The first client render can then disagree with the HTML, which is a hydration mismatch. Passing getServerSnapshot gives both sides the same initial value. The hook does not solve this by suspending or by rendering null.",
      wrong: [
        {
          option: "Nothing. The server reuses the client snapshot, so hydration is guaranteed to match",
          reason: "There is no client snapshot on the server. getServerSnapshot is what supplies the server value.",
        },
        {
          option: "The hook suspends until the store emits, then hydration continues from that emission",
          reason: "A missing server snapshot is a mismatch risk, not a suspense signal.",
        },
        {
          option: "React skips the hook on the server and renders null for that component",
          reason: "React still renders the component. It needs an explicit server snapshot to do that safely.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useSyncExternalStore } from 'react';\n\nexport function Online() {\n  const online = useSyncExternalStore(\n    subscribe,\n    () => navigator.onLine,\n    () => true,\n  );\n  return <p>{online ? 'online' : 'offline'}</p>;\n}\n" },
      remember: "Pass getServerSnapshot to useSyncExternalStore when the component is server-rendered.",
    },
  },
  {
    id: "r19b-025",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The list is filtered and reordered, and this component also crashes when the length changes. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useId } from 'react';\n\nexport function NameList({ people }: { people: { id: string; label: string }[] }) {\n  return (\n    <ul>\n      {people.map((person) => {\n        const id = useId();\n        return <li key={id}>{person.label}</li>;\n      })}\n    </ul>\n  );\n}\n",
    },
    options: [
      "useId is called in the loop and used as the key, but keys must come from the data",
      "useId is only legal on the server, so the client list must use the array index",
      "person.id would mismatch hydration, so useId is the required list key",
      "The component is missing a Context provider, which is what useId reads",
    ],
    correctIndex: 0,
    explanation: {
      answer: "A hook runs inside map, and the generated id is used as a key instead of the person's id.",
      why: "useId has to be called in a stable order at the top level of a component. Calling it inside map means the number of hook calls changes when people changes length, which breaks the Rules of Hooks. The ids it returns identify positions in the tree so accessibility attributes match on the server and the client, and they do not identify the person. Using them as keys sticks any row state to a position, just like an index, when the list is reordered, filtered, or inserted into. The key should be the id field on the person, which already comes from the data.",
      wrong: [
        {
          option: "useId is only legal on the server, so the client list must use the array index",
          reason: "useId is for matching server and client ids. An index key is the same position bug.",
        },
        {
          option: "person.id would mismatch hydration, so useId is the required list key",
          reason: "Data ids are the right keys. useId is for accessibility ids, not for list identity.",
        },
        {
          option: "The component is missing a Context provider, which is what useId reads",
          reason: "useId does not read a provider you forgot to render. The call site and the key are wrong.",
        },
      ],
      example: { lang: 'tsx', source: "export function NameList({ people }: { people: { id: string; label: string }[] }) {\n  return (\n    <ul>\n      {people.map((person) => (\n        <li key={person.id}>{person.label}</li>\n      ))}\n    </ul>\n  );\n}\n" },
      remember: "useId is for stable accessibility ids. List keys come from the data.",
      fixedCode: {
        lang: "tsx",
        source: "export function NameList({ people }: { people: { id: string; label: string }[] }) {\n  return (\n    <ul>\n      {people.map((person) => (\n        <li key={person.id}>{person.label}</li>\n      ))}\n    </ul>\n  );\n}\n",
      },
    },
  },
  {
    id: "r19b-026",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "count starts at 0. The user clicks once. What does the button show after that render?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  function onClick() {\n    setCount(count + 1);\n    setCount(count + 1);\n  }\n\n  return <button onClick={onClick}>{count}</button>;\n}\n",
    },
    options: [
      "2, because the two calls add one each",
      "1, because both calls read the same count from this render",
      "0, because React batches the two calls into a no-op",
      "3, because the click increments once and each setCount increments again",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Both calls store 0 + 1, so the button shows 1 after the single batched render.",
      why: "The click handler closes over count from this render, which is 0. The first setCount(count + 1) schedules 1, and the second call uses that same 0, so it also schedules 1. React batches the two updates into one render, and the result is 1 rather than 2. When the next value depends on the previous one, each update should use the functional form so the second update receives the result of the first. Two functional increments in this handler would show 2, still in one render.",
      wrong: [
        {
          option: "2, because the two calls add one each",
          reason: "They would add up only if each call saw the result of the previous one.",
        },
        {
          option: "0, because React batches the two calls into a no-op",
          reason: "Batching merges them into one render. It does not cancel the update to 1.",
        },
        {
          option: "3, because the click increments once and each setCount increments again",
          reason: "The click does not increment by itself. Only the setCount calls write state, and both write 1.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  function onClick() {\n    setCount((current) => current + 1);\n    setCount((current) => current + 1);\n  }\n\n  return <button onClick={onClick}>{count}</button>;\n}\n" },
      remember: "Use setState(prev => ...) when the next value depends on the previous one.",
    },
  },
  {
    id: "r19b-027",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "concept",
    difficulty: "expert",
    prompt: "What is useEffectEvent for in React 19.2, and what must you not do with the function it returns?",
    options: [
      "It lets you call a hook only when a prop is defined, and you pass the result to children",
      "It replaces useTransition for an effect that awaits, and you call it while rendering",
      "It lets an effect read the latest props and state without listing them as dependencies, and you do not call it during render or pass it to other components",
      "It memoizes an effect callback the way useCallback does, and it is safe to call during render",
    ],
    correctIndex: 2,
    explanation: {
      answer: "useEffectEvent gives an effect a function that always sees the latest props and state, without those values becoming effect dependencies.",
      why: "An effect often subscribes once, but the thing it does on each event needs the latest props or state. useEffectEvent, added in React 19.2, wraps that logic so the effect can call it and see current values without putting them in the dependency list, while the subscription stays tied to the values that should actually restart it. The returned function is only for calling from an effect. Do not call it during render, and do not pass it to other components. It is not a way to hide a conditional hook or to replace a transition.",
      wrong: [
        {
          option: "It lets you call a hook only when a prop is defined, and you pass the result to children",
          reason: "It does not relax the Rules of Hooks, and the function must not be passed to other components.",
        },
        {
          option: "It replaces useTransition for an effect that awaits, and you call it while rendering",
          reason: "It does not schedule transitions, and calling it during render is forbidden.",
        },
        {
          option: "It memoizes an effect callback the way useCallback does, and it is safe to call during render",
          reason: "It is not a general memo hook, and it is not safe to call while rendering.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useEffectEvent } from 'react';\n\nexport function Chat({ roomId }: { roomId: string }) {\n  const onMessage = useEffectEvent((text: string) => {\n    logMessage(roomId, text);\n  });\n  useEffect(() => {\n    const connection = connect(roomId);\n    connection.on('message', (text: string) => onMessage(text));\n    return () => connection.disconnect();\n  }, [roomId]);\n  return <p>{roomId}</p>;\n}\n" },
      remember: "Call a useEffectEvent function only from an effect, never during render or as a prop.",
    },
  },
  {
    id: "r19b-028",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Save is handed to a child through useEffectEvent. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useEffectEvent, useState } from 'react';\n\nexport function Editor({ onSave }: { onSave: (text: string) => void }) {\n  const [text, setText] = useState('');\n  const saveEvent = useEffectEvent(() => {\n    onSave(text);\n  });\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <Toolbar onSave={saveEvent} />\n    </div>\n  );\n}\n\nfunction Toolbar({ onSave }: { onSave: () => void }) {\n  return <button onClick={onSave}>Save</button>;\n}\n",
    },
    options: [
      "useEffectEvent must be called inside useEffect, so this component fails to compile before the hook runs",
      "The input is uncontrolled, so text is always an empty string when Save runs",
      "onSave from props is frozen at the first render unless it is listed in a dependency array here",
      "saveEvent is passed to Toolbar. An Effect Event must not be passed to another component or called during render",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The Effect Event is passed to Toolbar. That function may only be called from an effect.",
      why: "useEffectEvent returns a function that always sees the latest text and onSave, which is useful when an effect must not restart just because those values changed. This component never calls saveEvent from an effect. It passes it to Toolbar, and Toolbar uses it as a click handler. Passing an Effect Event to another component is not allowed, and calling it during render is not allowed either. A save button can use a normal function created during render, which already closes over the latest text. Reserve useEffectEvent for the call that happens inside an effect.",
      wrong: [
        {
          option: "useEffectEvent must be called inside useEffect, so this component fails to compile before the hook runs",
          reason: "The hook itself is called at the top level. The mistake is what happens to the function it returns.",
        },
        {
          option: "The input is uncontrolled, so text is always an empty string when Save runs",
          reason: "The input is controlled by text. The bug is handing the Effect Event to a child.",
        },
        {
          option: "onSave from props is frozen at the first render unless it is listed in a dependency array here",
          reason: "There is no effect dependency list here. A normal click handler would see the latest onSave.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Editor({ onSave }: { onSave: (text: string) => void }) {\n  const [text, setText] = useState('');\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <Toolbar onSave={() => onSave(text)} />\n    </div>\n  );\n}\n\nfunction Toolbar({ onSave }: { onSave: () => void }) {\n  return <button onClick={onSave}>Save</button>;\n}\n" },
      remember: "Do not pass a useEffectEvent function to another component or call it during render.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Editor({ onSave }: { onSave: (text: string) => void }) {\n  const [text, setText] = useState('');\n  return (\n    <div>\n      <input value={text} onChange={(event) => setText(event.target.value)} />\n      <Toolbar onSave={() => onSave(text)} />\n    </div>\n  );\n}\n\nfunction Toolbar({ onSave }: { onSave: () => void }) {\n  return <button onClick={onSave}>Save</button>;\n}\n",
      },
    },
  },
  {
    id: "r19b-029",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A page-view effect records two views in development and one view in production. The effect subscribes in setup and unsubscribes in cleanup. What does that mean?",
    options: [
      "Production is fine. The extra setup, cleanup, setup cycle is development only, so the cleanup must stay safe",
      "Production is double-counting too. Strict Mode ships that extra cycle to users",
      "Deleting the cleanup will make development match production, so the cleanup should be removed",
      "useEffect does not run in development, so the second view must be coming from the server",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The second development call is Strict Mode running setup, cleanup, then setup. Production does not add that cycle.",
      why: "In development, Strict Mode renders twice and runs the effect setup, the cleanup, and the setup again. A page view recorded in setup will be recorded twice on a dev machine even though the cleanup unsubscribes in between. That extra cycle is not in the production build, so users are not double-counted by Strict Mode. The cleanup still has to be safe to run, because the dev check calls it and a real unmount will call it too. Removing the cleanup would hide the check and leak the subscription.",
      wrong: [
        {
          option: "Production is double-counting too. Strict Mode ships that extra cycle to users",
          reason: "The extra setup and cleanup cycle is a development-only check.",
        },
        {
          option: "Deleting the cleanup will make development match production, so the cleanup should be removed",
          reason: "Cleanup is required. Strict Mode is showing whether that cleanup is safe.",
        },
        {
          option: "useEffect does not run in development, so the second view must be coming from the server",
          reason: "The effect does run in development. The server does not run useEffect at all.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect } from 'react';\n\nexport function PageView({ page }: { page: string }) {\n  useEffect(() => {\n    recordView(page);\n    return () => {\n      cancelView(page);\n    };\n  }, [page]);\n  return <p>{page}</p>;\n}\n" },
      remember: "Strict Mode's extra effect cycle is development only. Cleanup must be safe to run.",
    },
  },
  {
    id: "r19b-030",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The user types hello into the draft, then docId changes from a to b. What happens to the draft?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Screen({ docId }: { docId: string }) {\n  return <Editor key={docId} docId={docId} />;\n}\n\nfunction Editor({ docId }: { docId: string }) {\n  const [draft, setDraft] = useState('empty');\n  return (\n    <div>\n      <p>{docId}</p>\n      <input value={draft} onChange={(event) => setDraft(event.target.value)} />\n    </div>\n  );\n}\n",
    },
    options: [
      "It stays hello, because state is kept when a key changes",
      "It returns to empty, because the new key unmounts this Editor and mounts another",
      "It becomes the new docId, because the key copies the prop into state",
      "It stays hello in production and returns to empty only under Strict Mode",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The draft returns to empty. Changing the key throws away that Editor instance and creates a new one.",
      why: "Screen renders Editor with key={docId}. When docId changes from a to b, React treats that as a different component, so it unmounts the old Editor and mounts a new one. The new instance runs useState('empty') again, so hello is gone and the input shows empty. The key does not copy docId into draft. The paragraph shows the new docId because that value is rendered from props, while the input state started over. This reset happens in production as well as in development.",
      wrong: [
        {
          option: "It stays hello, because state is kept when a key changes",
          reason: "A key change is how you reset state. The old instance does not keep its draft.",
        },
        {
          option: "It becomes the new docId, because the key copies the prop into state",
          reason: "The key only identifies the instance. The draft is initialized to the string empty.",
        },
        {
          option: "It stays hello in production and returns to empty only under Strict Mode",
          reason: "Remounting on a key change is normal reconciliation, not a Strict Mode check.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Screen({ docId }: { docId: string }) {\n  return <Editor key={docId} docId={docId} />;\n}\n\nfunction Editor({ docId }: { docId: string }) {\n  const [draft, setDraft] = useState('empty');\n  return <input value={draft} onChange={(event) => setDraft(event.target.value)} />;\n}\n" },
      remember: "A new key unmounts the old component and resets its state.",
    },
  },
  {
    id: "r19b-031",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The parent changes name from Ada to Grace, and the heading still says Ada. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Greeting({ name }: { name: string }) {\n  const [text] = useState(name);\n  return <h1>Hello {text}</h1>;\n}\n",
    },
    options: [
      "The heading is a server component, so a prop change cannot reach it",
      "useState ignores a string initial value and keeps an empty string",
      "name is copied into state, so later prop updates are ignored instead of being rendered",
      "Hello is illegal text, so React freezes the first render",
    ],
    correctIndex: 2,
    explanation: {
      answer: "text is a copy of the first name. The heading should render the name prop directly.",
      why: "useState(name) uses name only as the initial state, on the first mount. When the parent passes Grace, the prop changes but text is still Ada, and nothing sets text again. The heading is not an edited draft. It is the name prop, so it should be computed during render as Hello plus the current name. Copying a prop into state is the wrong tool for a derived value. A key would reset state if this component really owned a draft that must start over, which this heading does not.",
      wrong: [
        {
          option: "The heading is a server component, so a prop change cannot reach it",
          reason: "This is an ordinary client component with state. The prop arrives, and the state ignores it.",
        },
        {
          option: "useState ignores a string initial value and keeps an empty string",
          reason: "The initial value is used. That is why the first name stays on screen.",
        },
        {
          option: "Hello is illegal text, so React freezes the first render",
          reason: "The text is fine. The stale state is why Grace never appears.",
        },
      ],
      example: { lang: 'tsx', source: "export function Greeting({ name }: { name: string }) {\n  return <h1>Hello {name}</h1>;\n}\n\nexport function Page({ name }: { name: string }) {\n  return <Greeting name={name} />;\n}\n" },
      remember: "Do not copy a prop into state just to render it. Compute the derived value during render.",
      fixedCode: {
        lang: "tsx",
        source: "export function Greeting({ name }: { name: string }) {\n  return <h1>Hello {name}</h1>;\n}\n",
      },
    },
  },
  {
    id: "r19b-032",
    tech: "react19",
    topic: "hooks-rendering",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Which statement about useEffect and useLayoutEffect is correct?",
    options: [
      "useLayoutEffect runs on the server, and useEffect runs in the browser before paint",
      "Both hooks run on the server, and useLayoutEffect runs after the browser paints",
      "useEffect runs before paint, and useLayoutEffect runs after paint, and only on the client",
      "useEffect runs after paint on the client. useLayoutEffect runs after DOM updates and before paint. Neither runs on the server",
    ],
    correctIndex: 3,
    explanation: {
      answer: "useEffect runs after the browser paints, useLayoutEffect runs after DOM updates and before paint, and neither runs on the server.",
      why: "After React commits DOM changes, useLayoutEffect runs and the browser has not painted yet, so a measurement can correct the DOM before the user sees it. useEffect runs later, after paint, so a measurement there can flash the previous frame. Server rendering does not run either hook, because there is no browser layout and no paint on the server. An effect that must change the HTML the server sends has to be done during render instead. Choosing the hook is about client timing, not about enabling server execution.",
      wrong: [
        {
          option: "useLayoutEffect runs on the server, and useEffect runs in the browser before paint",
          reason: "Neither hook runs on the server, and useEffect is the one that runs after paint.",
        },
        {
          option: "Both hooks run on the server, and useLayoutEffect runs after the browser paints",
          reason: "They are client hooks. useLayoutEffect is the before-paint one.",
        },
        {
          option: "useEffect runs before paint, and useLayoutEffect runs after paint, and only on the client",
          reason: "The timing is reversed. useLayoutEffect is before paint and useEffect is after paint.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useLayoutEffect, useRef } from 'react';\n\nexport function Box() {\n  const ref = useRef<HTMLDivElement>(null);\n  useLayoutEffect(() => {\n    measureBeforePaint(ref.current);\n  }, []);\n  useEffect(() => {\n    reportAfterPaint(ref.current);\n  }, []);\n  return <div ref={ref}>Box</div>;\n}\n" },
      remember: "useLayoutEffect is before paint, useEffect is after paint, and neither runs on the server.",
    },
  },
  {
    id: "r19b-033",
    tech: "react19",
    topic: "compiler-memo",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What is the React Compiler, and how is it turned on for Next.js 16?",
    options: [
      "It is a build-time Babel plugin, off by default. Next.js 16 opts in with reactCompiler: true and babel-plugin-react-compiler",
      "It is a runtime flag set with a property on the React object during render",
      "It is on by default in React 19, and the directive 'use no memo' enables it for one component",
      "It is a lint rule that allows conditional hooks when a file imports the compiler",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The compiler is a build-time Babel plugin, and it stays off until the Next 16 config opts in.",
      why: "The React Compiler memoizes components and hooks that follow the Rules of React, and it does that while the code is compiled, not by flipping a switch inside React at runtime. In Next.js 16 the opt-in is reactCompiler: true together with the babel-plugin-react-compiler package. It is off by default, so installing React 19 does not turn it on. The directive 'use no memo' opts a function out. It does not turn the compiler on, and the compiler does not make illegal hooks legal.",
      wrong: [
        {
          option: "It is a runtime flag set with a property on the React object during render",
          reason: "There is no runtime flag inside React. The plugin rewrites the code at build time.",
        },
        {
          option: "It is on by default in React 19, and the directive 'use no memo' enables it for one component",
          reason: "It is off by default, and 'use no memo' opts a function out.",
        },
        {
          option: "It is a lint rule that allows conditional hooks when a file imports the compiler",
          reason: "It is a Babel plugin, and conditional hooks still break.",
        },
      ],
      example: { lang: 'ts', source: "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  reactCompiler: true,\n};\n\nexport default nextConfig;\n" },
      remember: "The compiler is an opt-in build-time Babel plugin, not a runtime flag.",
    },
  },
  {
    id: "r19b-034",
    tech: "react19",
    topic: "compiler-memo",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The form crashes when admin flips from false to true. The team expected the React Compiler to allow this. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Form({ admin }: { admin: boolean }) {\n  const [name, setName] = useState('');\n  if (admin) {\n    const [note, setNote] = useState('');\n    return (\n      <div>\n        <input value={name} onChange={(event) => setName(event.target.value)} />\n        <input value={note} onChange={(event) => setNote(event.target.value)} />\n      </div>\n    );\n  }\n  return <input value={name} onChange={(event) => setName(event.target.value)} />;\n}\n",
    },
    options: [
      "The name state is updated inside onChange, which the compiler forbids",
      "note's useState runs only when admin is true, so the hook order changes. The compiler does not allow that",
      "Two inputs cannot share a component, so React unmounts the form when admin is true",
      "The early return skips compilation, so name is reset every render",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The note hook is conditional. Hook order changes with admin, and the compiler does not make that legal.",
      why: "On a non-admin render the component calls useState once, and on an admin render it calls useState twice because the second call sits inside the if. React identifies state by call order, so flipping admin changes that order and React throws. The Rules of React still require every hook to run unconditionally at the top level. The compiler memoizes components that follow those rules, and it does not rewrite a conditional hook into a legal one. Call both hooks on every render, and hide the note input in the returned tree.",
      wrong: [
        {
          option: "The name state is updated inside onChange, which the compiler forbids",
          reason: "Updating state from an event is normal. The compiler does not forbid it.",
        },
        {
          option: "Two inputs cannot share a component, so React unmounts the form when admin is true",
          reason: "A component can return as many inputs as it needs. The crash is the changing hook order.",
        },
        {
          option: "The early return skips compilation, so name is reset every render",
          reason: "name's hook is unconditional, so that state is kept. The conditional note hook is the bug.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Form({ admin }: { admin: boolean }) {\n  const [name, setName] = useState('');\n  const [note, setNote] = useState('');\n  return (\n    <div>\n      <input value={name} onChange={(event) => setName(event.target.value)} />\n      {admin ? (\n        <input value={note} onChange={(event) => setNote(event.target.value)} />\n      ) : null}\n    </div>\n  );\n}\n" },
      remember: "The compiler does not excuse conditional hooks. Call every hook on every render.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Form({ admin }: { admin: boolean }) {\n  const [name, setName] = useState('');\n  const [note, setNote] = useState('');\n  return (\n    <div>\n      <input value={name} onChange={(event) => setName(event.target.value)} />\n      {admin ? (\n        <input value={note} onChange={(event) => setNote(event.target.value)} />\n      ) : null}\n    </div>\n  );\n}\n",
      },
    },
  },
  {
    id: "r19b-035",
    tech: "react19",
    topic: "compiler-memo",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The compiler is off. The parent re-renders Search with the same query string. Does the effect run again?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useEffect } from 'react';\n\nexport function Search({ query }: { query: string }) {\n  const onDone = () => {\n    report(query);\n  };\n  useEffect(() => {\n    onDone();\n  }, [onDone]);\n  return <p>{query}</p>;\n}\n\nfunction report(query: string): void {\n  void query;\n}\n",
    },
    options: [
      "No. React compares the function source and sees that onDone has not changed",
      "No. A dependency array uses deep equality, so the same query skips the effect",
      "Yes. onDone is a new function every render, so the dependency changed",
      "Yes, but only because useEffect also runs on the server for the same query",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Yes. onDone is created during render, so its identity changes and the effect runs after that commit.",
      why: "The component creates onDone inside the function body, and that is a new function every time Search renders. The effect lists onDone as a dependency, and React compares dependencies by reference, not by the text of the function or by the fields it closes over. The same query string still produces a new function, so the effect cleans up and runs again. useMemo or useCallback could stabilize it, and the compiler can also memoize it when the plugin is on and the component follows the rules, but this question has the compiler off. useEffect does not run on the server.",
      wrong: [
        {
          option: "No. React compares the function source and sees that onDone has not changed",
          reason: "Dependencies are compared by identity. The source text is not the comparison.",
        },
        {
          option: "No. A dependency array uses deep equality, so the same query skips the effect",
          reason: "The dependency is the function, and a new function is not deeply compared to the old one.",
        },
        {
          option: "Yes, but only because useEffect also runs on the server for the same query",
          reason: "The effect runs again on the client because the dependency changed. It does not run on the server.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useCallback, useEffect } from 'react';\n\nexport function Search({ query }: { query: string }) {\n  const onDone = useCallback(() => {\n    report(query);\n  }, [query]);\n  useEffect(() => {\n    onDone();\n  }, [onDone]);\n  return <p>{query}</p>;\n}\n" },
      remember: "A function created during render is a new effect dependency every commit unless it is stabilized.",
    },
  },
  {
    id: "r19b-036",
    tech: "react19",
    topic: "compiler-memo",
    kind: "scenario",
    difficulty: "expert",
    prompt: "The React Compiler is on. A teammate wants to delete every useMemo and useCallback because the compiler memoizes components. Which wrappers should stay?",
    options: [
      "Delete them all. A compiled component can never need a stable identity",
      "Keep them all. The compiler only runs if every value is already wrapped in useMemo",
      "Move them into functions marked 'use no memo' so the compiler can see the wrappers",
      "Remove the ones that only existed to skip re-renders. Keep a stable identity when an effect depends on it or a non-compiled library compares by reference",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Drop the wrappers that only tried to stop re-renders. Keep one when an effect or a non-compiled library needs the same reference.",
      why: "With the compiler on, you do not add useMemo or useCallback just so your own components skip rendering. The plugin memoizes components and hooks that follow the Rules of React. An effect dependency is different: React compares it by identity, so the value has to stay stable when its contents did not change. A chart library that is not compiled and compares a callback with Object.is has the same need. 'use no memo' opts a function out of the compiler, which makes manual stability more necessary, not something the compiler reads as a hint to cache.",
      wrong: [
        {
          option: "Delete them all. A compiled component can never need a stable identity",
          reason: "Effects and non-compiled libraries still compare references, so some stable identities stay useful.",
        },
        {
          option: "Keep them all. The compiler only runs if every value is already wrapped in useMemo",
          reason: "The compiler does its own memoization. It does not require hand-written wrappers in order to run.",
        },
        {
          option: "Move them into functions marked 'use no memo' so the compiler can see the wrappers",
          reason: "That directive opts the function out. It is not how you show a value to the compiler.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useCallback, useEffect } from 'react';\n\nexport function Chart({ points }: { points: number[] }) {\n  const onHover = useCallback(() => {\n    logHover(points.length);\n  }, [points.length]);\n  useEffect(() => {\n    subscribe(onHover);\n    return () => unsubscribe(onHover);\n  }, [onHover]);\n  return <LegacyChart onHover={onHover} points={points} />;\n}\n" },
      remember: "Do not add useMemo just to skip re-renders when the compiler is on. Do keep a stable identity for effects and non-compiled libraries.",
    },
  },
  {
    id: "r19b-037",
    tech: "react19",
    topic: "compiler-memo",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does the directive 'use no memo' do?",
    options: [
      "It opts that function out of React Compiler memoization",
      "It turns the compiler on for that function only",
      "It allows conditional hooks inside that function",
      "It memoizes the function even when the compiler plugin is off",
    ],
    correctIndex: 0,
    explanation: {
      answer: "'use no memo' tells the compiler not to memoize that function.",
      why: "The directive sits at the start of a component or hook, and the Babel plugin skips its memoizing rewrite for that function. The rest of the program is unchanged, and the directive does nothing to turn the plugin on. It is also not a runtime cache you can use when the compiler was never enabled. The function still has to follow the Rules of React. Opting out does not make a conditional hook or a render-time mutation safe.",
      wrong: [
        {
          option: "It turns the compiler on for that function only",
          reason: "It is an opt-out. The plugin has to be enabled for the build before memoization happens at all.",
        },
        {
          option: "It allows conditional hooks inside that function",
          reason: "The Rules of React still apply. The directive only skips compiler memoization.",
        },
        {
          option: "It memoizes the function even when the compiler plugin is off",
          reason: "There is no runtime memoizer behind the directive. Without the plugin, nothing rewrites the function.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function LiveTotal({ price }: { price: number }) {\n  'use no memo';\n  const [qty, setQty] = useState(1);\n  return (\n    <button onClick={() => setQty(qty + 1)}>\n      {price * qty}\n    </button>\n  );\n}\n" },
      remember: "'use no memo' opts a function out of the compiler. It does not enable anything.",
    },
  },
  {
    id: "r19b-038",
    tech: "react19",
    topic: "compiler-memo",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The parent sees its scores array change order after Rank renders. The compiler is on. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Rank({ scores }: { scores: number[] }) {\n  const [selected, setSelected] = useState(0);\n  scores.sort((left, right) => right - left);\n  return (\n    <button onClick={() => setSelected(scores[0] ?? 0)}>\n      {selected}\n    </button>\n  );\n}\n",
    },
    options: [
      "useState after a calculation is a conditional hook, so the compiler skips the sort",
      "scores.sort mutates the caller's array during render. The compiler does not make that safe",
      "The click handler must be wrapped in useCallback or the sort is discarded",
      "selected is a number, and the compiler can only memoize string state",
    ],
    correctIndex: 1,
    explanation: {
      answer: "sort mutates the scores prop during render, so the parent's array is reordered as a side effect.",
      why: "The sort call changes the array in place and returns that same array. Rank received the parent's array, so the parent's order changes while Rank is rendering. Render must be pure, and a mutation like this is visible outside the component. Strict Mode's extra development render can make the surprise easier to hit, but the bug exists without it. The compiler memoizes code that follows the Rules of React, and it does not excuse a mutation during render or turn this into a safe copy. Copy the array, or use toSorted, and leave the prop alone.",
      wrong: [
        {
          option: "useState after a calculation is a conditional hook, so the compiler skips the sort",
          reason: "The hook is unconditional and runs before the sort. The mutation is the bug.",
        },
        {
          option: "The click handler must be wrapped in useCallback or the sort is discarded",
          reason: "The sort already ran during render. A missing useCallback does not undo a mutation.",
        },
        {
          option: "selected is a number, and the compiler can only memoize string state",
          reason: "State can be a number. The compiler is not failing because of that type.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Rank({ scores }: { scores: number[] }) {\n  const [selected, setSelected] = useState(0);\n  const ranked = [...scores].sort((left, right) => right - left);\n  return (\n    <button onClick={() => setSelected(ranked[0] ?? 0)}>\n      {selected}\n    </button>\n  );\n}\n" },
      remember: "Do not mutate props or other values during render. The compiler does not make that safe.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Rank({ scores }: { scores: number[] }) {\n  const [selected, setSelected] = useState(0);\n  const ranked = [...scores].sort((left, right) => right - left);\n  return (\n    <button onClick={() => setSelected(ranked[0] ?? 0)}>\n      {selected}\n    </button>\n  );\n}\n",
      },
    },
  },
  {
    id: "r19b-039",
    tech: "react19",
    topic: "compiler-memo",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The compiler is off. The user clicks the button. Does memo let Row skip that render?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { memo, useState } from 'react';\n\nconst Row = memo(function Row({ style }: { style: { color: string } }) {\n  return <span style={style}>Hi</span>;\n});\n\nexport function Parent() {\n  const [n, setN] = useState(0);\n  return (\n    <div>\n      <button onClick={() => setN(n + 1)}>{n}</button>\n      <Row style={{ color: 'red' }} />\n    </div>\n  );\n}\n",
    },
    options: [
      "Yes. memo skips every child when the only change is the parent's state",
      "Yes. The style object is compared by its color field, so memo sees it as equal",
      "No. The style object is a new reference, so memo treats the prop as changed",
      "No. memo does nothing for function components in React 19",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Row renders again. The style prop is a new object, and memo compares it by reference.",
      why: "The click updates n, so Parent renders again and creates another style object in that render. memo checks the next props by reference. A new object is not the same reference as the previous one, even when both have color red, so the check fails and Row renders. This is the case people used to paper over with useMemo. With the compiler on, and the component following the rules, the compiler can reuse that object so the child can skip, and you still would not add useMemo only to stop this re-render once the compiler is already doing it. A non-compiled library that compares by reference can still need a stable object if the compiler is not memoizing the caller.",
      wrong: [
        {
          option: "Yes. memo skips every child when the only change is the parent's state",
          reason: "memo looks at props. A changed prop reference still renders the child.",
        },
        {
          option: "Yes. The style object is compared by its color field, so memo sees it as equal",
          reason: "The comparison is Object.is on the object, not a walk of its fields.",
        },
        {
          option: "No. memo does nothing for function components in React 19",
          reason: "memo still works. It does not skip here because the style identity changed.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { memo, useMemo, useState } from 'react';\n\nconst Row = memo(function Row({ style }: { style: { color: string } }) {\n  return <span style={style}>Hi</span>;\n});\n\nexport function Parent() {\n  const [n, setN] = useState(0);\n  const style = useMemo(() => ({ color: 'red' }), []);\n  return (\n    <div>\n      <button onClick={() => setN(n + 1)}>{n}</button>\n      <Row style={style} />\n    </div>\n  );\n}\n" },
      remember: "memo compares props by reference. A new object during render defeats it when the compiler is off.",
    },
  },
  {
    id: "r19b-040",
    tech: "react19",
    topic: "compiler-memo",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "LegacyChart is not compiled, and it resets its canvas whenever onHover is a new function. This component opted out of the compiler. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nexport function ChartBox({ points }: { points: number[] }) {\n  'use no memo';\n  return (\n    <LegacyChart onHover={() => logHover(points.length)} points={points} />\n  );\n}\n\nfunction LegacyChart(props: { onHover: () => void; points: number[] }) {\n  return <button onClick={props.onHover}>{props.points.length}</button>;\n}\n\nfunction logHover(count: number): void {\n  void count;\n}\n",
    },
    options: [
      "The compiler ignores 'use no memo', so onHover is already stable and the canvas cannot reset",
      "points is mutated during render, so LegacyChart receives a new array every time",
      "onHover should be a useEffectEvent passed into LegacyChart",
      "'use no memo' opts this function out, so the inline onHover is a new function every render and the library resets",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The opt-out leaves the inline onHover unstable, and LegacyChart compares that callback by reference.",
      why: "'use no memo' tells the compiler not to memoize ChartBox, so the plugin will not reuse the hover function for you. The arrow is created during render, which means it is a new identity every time, even when the length of points did not change. LegacyChart is outside the compiler and treats a new onHover as a changed subscription, so it resets the canvas. The points prop is not mutated here. The fix, while this function stays opted out, is useCallback so the library sees a stable function. You would not add that wrapper only to stop a normal re-render in a compiled component, but a non-compiled library that compares by reference still needs the stable identity.",
      wrong: [
        {
          option: "The compiler ignores 'use no memo', so onHover is already stable and the canvas cannot reset",
          reason: "The directive is a real opt-out. The inline function is not stabilized.",
        },
        {
          option: "points is mutated during render, so LegacyChart receives a new array every time",
          reason: "The component only reads points.length. It does not mutate the array.",
        },
        {
          option: "onHover should be a useEffectEvent passed into LegacyChart",
          reason: "An Effect Event must not be passed to another component. The library needs an ordinary stable callback.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useCallback } from 'react';\n\nexport function ChartBox({ points }: { points: number[] }) {\n  'use no memo';\n  const onHover = useCallback(() => {\n    logHover(points.length);\n  }, [points.length]);\n  return <LegacyChart onHover={onHover} points={points} />;\n}\n" },
      remember: "After 'use no memo', stabilize a callback yourself if a non-compiled library compares it by reference.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nimport { useCallback } from 'react';\n\nexport function ChartBox({ points }: { points: number[] }) {\n  'use no memo';\n  const onHover = useCallback(() => {\n    logHover(points.length);\n  }, [points.length]);\n  return <LegacyChart onHover={onHover} points={points} />;\n}\n\nfunction LegacyChart(props: { onHover: () => void; points: number[] }) {\n  return <button onClick={props.onHover}>{props.points.length}</button>;\n}\n\nfunction logHover(count: number): void {\n  void count;\n}\n",
      },
    },
  },
  {
    id: "r19b-041",
    tech: "react19",
    topic: "react19-api",
    kind: "concept",
    difficulty: "advanced",
    prompt: "How does a function component receive a ref in React 19?",
    options: [
      "ref is a normal prop. forwardRef is unnecessary, and it still works",
      "ref was removed, so a function component cannot point at a DOM node",
      "ref works only when the component calls useImperativeHandle",
      "forwardRef is still required, and a ref prop is ignored",
    ],
    correctIndex: 0,
    explanation: {
      answer: "In React 19, ref is passed like any other prop. forwardRef is no longer required, though existing forwardRef components still work.",
      why: "A parent can write ref={field} on a function component, and that component can read ref from its props and pass it to a DOM node. You do not wrap the child in forwardRef just to receive it. forwardRef remains supported so older components keep working. useImperativeHandle is only for exposing a custom handle, not the requirement for receiving a ref. Nothing about this removes refs from function components.",
      wrong: [
        {
          option: "ref was removed, so a function component cannot point at a DOM node",
          reason: "Refs still work. React 19 made them a normal prop instead of removing them.",
        },
        {
          option: "ref works only when the component calls useImperativeHandle",
          reason: "Passing the ref through to a DOM node is enough. An imperative handle is optional.",
        },
        {
          option: "forwardRef is still required, and a ref prop is ignored",
          reason: "forwardRef is optional now. A ref prop is real and is not ignored.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useRef, type Ref } from 'react';\n\nexport function Field({ ref }: { ref: Ref<HTMLInputElement> }) {\n  return <input ref={ref} />;\n}\n\nexport function Form() {\n  const field = useRef<HTMLInputElement>(null);\n  return <Field ref={field} />;\n}\n" },
      remember: "React 19 passes ref as a normal prop. forwardRef still works, but you do not need it.",
    },
  },
  {
    id: "r19b-042",
    tech: "react19",
    topic: "react19-api",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Unmounting this button runs the click handler. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nexport function GoButton({ onClick }: { onClick: () => void }) {\n  return (\n    <button ref={(node) => (node ? (node.onclick = onClick) : undefined)}>\n      Go\n    </button>\n  );\n}\n",
    },
    options: [
      "Ref callbacks cannot assign DOM properties, so the click handler is never attached",
      "The arrow implicitly returns onClick, so React 19 calls that function as the ref cleanup and does not also call the ref with null",
      "React 19 ignores a ref callback's return value and always calls the ref with null, so this assignment is safe",
      "The ref callback runs while rendering, before the button exists, so onclick is assigned to null",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The one-line arrow returns the assigned function. React 19 treats that function as ref cleanup and calls it on unmount.",
      why: "The assignment to the onclick property both stores the handler and evaluates to onClick. The arrow returns that value with no block body, so the ref callback returns a function. In React 19 a returned function is cleanup: React calls it when the ref is detached and does not also call the ref callback with null. Calling onClick as cleanup is why the handler runs on unmount. A block-body arrow that assigns and returns nothing does not register a cleanup function, which is the right shape here. Return a function from a ref only when you mean that function to be the cleanup.",
      wrong: [
        {
          option: "Ref callbacks cannot assign DOM properties, so the click handler is never attached",
          reason: "The assignment does run when the node is attached. The bug is the returned function.",
        },
        {
          option: "React 19 ignores a ref callback's return value and always calls the ref with null, so this assignment is safe",
          reason: "React 19 does the opposite when the return value is a function. It uses it as cleanup and skips the null call.",
        },
        {
          option: "The ref callback runs while rendering, before the button exists, so onclick is assigned to null",
          reason: "Ref callbacks run when the node is attached or detached, not during render.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nexport function GoButton({ onClick }: { onClick: () => void }) {\n  return (\n    <button\n      ref={(node) => {\n        if (node) {\n          node.onclick = onClick;\n        }\n      }}\n    >\n      Go\n    </button>\n  );\n}\n" },
      remember: "Do not let a ref callback implicitly return a function. A block body that returns nothing is safe.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\nexport function GoButton({ onClick }: { onClick: () => void }) {\n  return (\n    <button\n      ref={(node) => {\n        if (node) {\n          node.onclick = onClick;\n        }\n      }}\n    >\n      Go\n    </button>\n  );\n}\n",
      },
    },
  },
  {
    id: "r19b-043",
    tech: "react19",
    topic: "react19-api",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "What does the paragraph show in React 19?",
    code: {
      lang: "tsx",
      source: "import { createContext, useContext } from 'react';\n\nconst Theme = createContext('light');\n\nexport function App() {\n  return (\n    <Theme value='dark'>\n      <Child />\n    </Theme>\n  );\n}\n\nfunction Child() {\n  const theme = useContext(Theme);\n  return <p>{theme}</p>;\n}\n",
    },
    options: [
      "It throws, because a context object cannot be rendered",
      "light, because only Theme.Provider reads a value prop",
      "dark, because rendering a context with a value prop provides that value",
      "An empty string, because value is ignored on a context component",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The paragraph shows dark. In React 19, Context with a value prop is a provider.",
      why: "App renders Theme and passes value='dark'. React 19 treats that as providing the context, so Child's useContext(Theme) reads dark instead of the default light. The older Theme.Provider form still works, and you can keep it. Rendering the context object is no longer a mistake when value is set. The child is not stuck with the default, and the tree does not throw just because Theme was used as the wrapper.",
      wrong: [
        {
          option: "It throws, because a context object cannot be rendered",
          reason: "React 19 renders a context with a value prop as its provider.",
        },
        {
          option: "light, because only Theme.Provider reads a value prop",
          reason: "Theme.Provider still works, but it is not the only form. Theme itself provides the value here.",
        },
        {
          option: "An empty string, because value is ignored on a context component",
          reason: "The value prop is read. The child gets dark.",
        },
      ],
      example: { lang: 'tsx', source: "import { createContext, useContext } from 'react';\n\nconst Theme = createContext('light');\n\nexport function App() {\n  return (\n    <Theme value='dark'>\n      <Child />\n    </Theme>\n  );\n}\n\nfunction Child() {\n  const theme = useContext(Theme);\n  return <p>Theme is {theme}</p>;\n}\n" },
      remember: "In React 19, Context with a value prop is a provider. Context.Provider still works.",
    },
  },
  {
    id: "r19b-044",
    tech: "react19",
    topic: "react19-api",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A product page renders a title element, a meta description, and a link from inside a nested component. Where do those tags end up?",
    options: [
      "They stay in the body at that nested position, and the document title does not change",
      "They are ignored unless the component file is a route module",
      "They replace the document element, so the rest of the page is dropped",
      "React hoists the title, meta, and link tags into the document head",
    ],
    correctIndex: 3,
    explanation: {
      answer: "React hoists title, meta, and link from that nested component into the document head.",
      why: "You can render those tags from any component, including one deep in the product page. React does not leave them in the body where the component happened to return them. It hoists them into the document head, so the tab title and the description update from ordinary render output. The component does not need to be the route module for the hoist to happen. The rest of the page still renders. The hoist is limited to those metadata tags, not a replacement of the document.",
      wrong: [
        {
          option: "They stay in the body at that nested position, and the document title does not change",
          reason: "React moves title, meta, and link into the head instead of leaving them in the body.",
        },
        {
          option: "They are ignored unless the component file is a route module",
          reason: "Any component can render them. The file's role as a route is not the requirement.",
        },
        {
          option: "They replace the document element, so the rest of the page is dropped",
          reason: "They are hoisted into the head. The page body still renders.",
        },
      ],
      example: { lang: 'tsx', source: "export function Product() {\n  return (\n    <article>\n      <title>Wool hat</title>\n      <meta name='description' content='Warm hat' />\n      <link rel='author' href='https://shop.example/team' />\n      <h1>Wool hat</h1>\n    </article>\n  );\n}\n" },
      remember: "Render title, meta, and link anywhere. React hoists them into the document head.",
    },
  },
  {
    id: "r19b-045",
    tech: "react19",
    topic: "react19-api",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Where do preload, preinit, and preconnect come from, and what are they for?",
    options: [
      "They are exported from react-dom, and they hint the browser about resources you will need",
      "They are exported from react, and they block render until the resource has downloaded",
      "They are Next.js router helpers, and they do nothing when called from React",
      "They were removed in React 19 along with hydrate",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Import preload, preinit, and preconnect from react-dom. They tell the browser to prepare resources ahead of time.",
      why: "These functions are browser hints, not a way to pause rendering until a file arrives. preload asks the browser to start fetching a resource you expect to use. preinit is the stronger hint for a stylesheet or script you want fetched and evaluated. preconnect warms the connection to an origin. All three are exported from react-dom, not from the react package and not from a router. React 19 did not remove them when it replaced the old hydrate API.",
      wrong: [
        {
          option: "They are exported from react, and they block render until the resource has downloaded",
          reason: "They come from react-dom, and a hint does not block the render.",
        },
        {
          option: "They are Next.js router helpers, and they do nothing when called from React",
          reason: "They are React DOM APIs. A Next.js app can call them because it renders with React.",
        },
        {
          option: "They were removed in React 19 along with hydrate",
          reason: "They are current React 19 APIs. The removed call is the old hydrate entry point.",
        },
      ],
      example: { lang: 'tsx', source: "import { preconnect, preinit, preload } from 'react-dom';\n\nexport function ProductPage() {\n  preload('/hero.jpg', { as: 'image' });\n  preinit('/styles.css', { as: 'style' });\n  preconnect('https://api.shop.example');\n  return <h1>Wool hat</h1>;\n}\n" },
      remember: "preload, preinit, and preconnect come from react-dom and only hint the browser.",
    },
  },
  {
    id: "r19b-046",
    tech: "react19",
    topic: "react19-api",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "A caller renders Button with no label and expects the text Save. The text is missing in React 19. What is the bug?",
    code: {
      lang: "tsx",
      source: "'use client';\n\ntype ButtonProps = {\n  label?: string;\n  onClick: () => void;\n};\n\nexport function Button({ label, onClick }: ButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}\n\nButton.defaultProps = { label: 'Save' };\n",
    },
    options: [
      "onClick must be a class method, so the button cannot receive a default label",
      "defaultProps on a function component is unsupported in React 19, so the missing label stays undefined",
      "Function components cannot return a button, so the label is never mounted",
      "React 19 reads defaultProps only from the react package's propTypes export",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The Save default is declared with defaultProps, which React 19 does not apply to function components.",
      why: "Button is a function component, and the assignment to defaultProps is the old defaulting mechanism. React 19 does not support defaultProps on function components, so a missing label stays undefined and the button has no text. The supported replacement is a default parameter, label = 'Save', which JavaScript applies when the prop is omitted. The click prop is unrelated, and the button element is a normal return value. propTypes is also not part of the react package, and it is not how this default would be read.",
      wrong: [
        {
          option: "onClick must be a class method, so the button cannot receive a default label",
          reason: "A function prop is fine. The broken part is defaultProps on the function component.",
        },
        {
          option: "Function components cannot return a button, so the label is never mounted",
          reason: "Returning a button is valid. The label is empty because the default was ignored.",
        },
        {
          option: "React 19 reads defaultProps only from the react package's propTypes export",
          reason: "propTypes is not exported from react, and it would not apply defaultProps either.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\ntype ButtonProps = {\n  label?: string;\n  onClick: () => void;\n};\n\nexport function Button({ label = 'Save', onClick }: ButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}\n" },
      remember: "Use default parameters. defaultProps on function components is unsupported in React 19.",
      fixedCode: {
        lang: "tsx",
        source: "'use client';\n\ntype ButtonProps = {\n  label?: string;\n  onClick: () => void;\n};\n\nexport function Button({ label = 'Save', onClick }: ButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}\n",
      },
    },
  },
  {
    id: "r19b-047",
    tech: "react19",
    topic: "react19-api",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "After Form commits, what is field.current?",
    code: {
      lang: "tsx",
      source: "'use client';\n\nimport { useRef, type Ref } from 'react';\n\ntype FieldProps = {\n  ref: Ref<HTMLInputElement>;\n};\n\nexport function Field({ ref }: FieldProps) {\n  return <input ref={ref} />;\n}\n\nexport function Form() {\n  const field = useRef<HTMLInputElement>(null);\n  return <Field ref={field} />;\n}\n",
    },
    options: [
      "null, because a function component ignores ref unless it is wrapped in forwardRef",
      "The Form function, because ref points at the component that rendered Field",
      "The input element, because Field takes ref as a prop and passes it to the input",
      "undefined, because React 19 removed ref from function components",
    ],
    correctIndex: 2,
    explanation: {
      answer: "After commit the ref points at the input, because React 19 passes ref into Field as a normal prop and Field forwards it to the DOM node.",
      why: "Form creates a ref and renders Field with ref={field}. Field reads that prop and puts it on the input, with no forwardRef wrapper. After the commit, the ref object points at that input element. It does not point at the Form function, and it is not left null just because Field is a function component. forwardRef would still work if this code used it, but it is unnecessary here. The value is available after commit, once the input exists.",
      wrong: [
        {
          option: "null, because a function component ignores ref unless it is wrapped in forwardRef",
          reason: "React 19 delivers ref as a prop. forwardRef is not required for this to work.",
        },
        {
          option: "The Form function, because ref points at the component that rendered Field",
          reason: "The ref is attached to the input Field renders, not to the Form component.",
        },
        {
          option: "undefined, because React 19 removed ref from function components",
          reason: "Refs were not removed. They became ordinary props on function components.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useRef, type Ref } from 'react';\n\ntype FieldProps = {\n  ref: Ref<HTMLInputElement>;\n};\n\nexport function Field({ ref }: FieldProps) {\n  return <input ref={ref} name='title' />;\n}\n\nexport function Form() {\n  const field = useRef<HTMLInputElement>(null);\n  return <Field ref={field} />;\n}\n" },
      remember: "A function component can take ref as a prop and pass it to a DOM node. forwardRef is optional.",
    },
  },
  {
    id: "r19b-048",
    tech: "react19",
    topic: "react19-api",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A development build reports a hydration error. What does React 19 include with that error to help you find the mismatch?",
    options: [
      "Only the sentence that hydration failed, with no component information",
      "A production crash report and an automatic retry that hides the mismatch",
      "A warning that propTypes on the component did not match the server",
      "A component stack and a diff of the server and client mismatch",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The development hydration error includes a component stack and a diff showing how the server HTML and the client render disagreed.",
      why: "Hydration fails when the client's first render does not match the HTML the server sent. React 19's development error names the components on the path to that spot and shows a diff of the mismatch, so you can see the text or attribute that diverged. It is a development diagnostic, not a production report that retries until the mismatch disappears. propTypes is not part of the react package and is not what this error is comparing. Use the stack and the diff to find the render branch that differed on the server.",
      wrong: [
        {
          option: "Only the sentence that hydration failed, with no component information",
          reason: "The development error includes a component stack and a diff, not a one-line failure.",
        },
        {
          option: "A production crash report and an automatic retry that hides the mismatch",
          reason: "The useful stack and diff are development diagnostics. Retrying does not fix the mismatch.",
        },
        {
          option: "A warning that propTypes on the component did not match the server",
          reason: "propTypes is not part of the react package. The diff is about the rendered output.",
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useState } from 'react';\n\nexport function Width() {\n  const [wide, setWide] = useState(false);\n  useEffect(() => {\n    setWide(window.innerWidth > 800);\n  }, []);\n  return <p>{wide ? 'wide' : 'narrow'}</p>;\n}\n" },
      remember: "A development hydration error shows a component stack and a diff of the mismatch.",
    },
  },
  {
    id: "r19b-049",
    tech: "react19",
    topic: "react19-api",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Which replacement story matches React 19?",
    options: [
      "Use createRoot and hydrateRoot. ReactDOM.render, ReactDOM.hydrate, unmountComponentAtNode, findDOMNode, string refs, legacy context, and defaultProps on function components are unsupported, and propTypes is not part of the react package",
      "Keep ReactDOM.render and ReactDOM.hydrate. Only string refs were removed, and propTypes still ships inside react",
      "Call hydrate instead of hydrateRoot, keep defaultProps on function components, and import propTypes from react",
      "Use findDOMNode instead of refs, keep string refs, and replace createRoot with ReactDOM.render",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Mount with createRoot or hydrateRoot. The old render, hydrate, unmount, findDOMNode, string ref, legacy context, and function defaultProps APIs are unsupported.",
      why: "React 19 expects createRoot for a client mount and hydrateRoot to attach to server HTML. The old render helper, the old hydrate helper, and unmountComponentAtNode are gone, and a root's own unmount method replaces the old unmount helper. findDOMNode, string refs, and legacy context are unsupported too. defaultProps is unsupported on function components, so use default parameters. propTypes is not part of the react package. The other options keep or restore those removed entry points.",
      wrong: [
        {
          option: "Keep ReactDOM.render and ReactDOM.hydrate. Only string refs were removed, and propTypes still ships inside react",
          reason: "render and hydrate were removed as well, and propTypes is not exported from react.",
        },
        {
          option: "Call hydrate instead of hydrateRoot, keep defaultProps on function components, and import propTypes from react",
          reason: "The supported hydrator is hydrateRoot. Function defaultProps and a react propTypes export are not available.",
        },
        {
          option: "Use findDOMNode instead of refs, keep string refs, and replace createRoot with ReactDOM.render",
          reason: "Those are the removed APIs. createRoot and ref props are the supported path.",
        },
      ],
      example: { lang: 'tsx', source: "import { createRoot, hydrateRoot } from 'react-dom/client';\n\nconst node = document.getElementById('root');\nif (node) {\n  createRoot(node).render(<App />);\n}\n\nconst serverNode = document.getElementById('app');\nif (serverNode) {\n  hydrateRoot(serverNode, <App />);\n}\n" },
      remember: "Mount with createRoot or hydrateRoot, and stop using the legacy render, ref, context, and defaultProps APIs.",
    },
  },
  {
    id: "r19b-050",
    tech: "react19",
    topic: "react19-api",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "This mount throws in React 19. What is the bug?",
    code: {
      lang: "tsx",
      source: "import ReactDOM from 'react-dom';\n\nfunction App() {\n  return <p>Quiz</p>;\n}\n\nconst root = document.getElementById('root');\nif (root) {\n  ReactDOM.render(<App />, root);\n}\n",
    },
    options: [
      "The paragraph must be a class component before ReactDOM can mount it",
      "ReactDOM.render was removed. Create a root with createRoot and call render on that root",
      "getElementById cannot be used with React 19, so the root node must come from findDOMNode",
      "The call should be ReactDOM.hydrate, which still mounts a client-only tree",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The old render helper is gone, so the mount has to go through createRoot.",
      why: "The code looks up a DOM node and then calls the old render helper, which React 19 does not provide. createRoot from react-dom/client takes that node and returns a root, and calling render on that root mounts the tree. hydrateRoot is the matching API when the HTML was already rendered on the server, not a replacement you use for a fresh client mount. findDOMNode was removed too, so it cannot supply the container. App can stay a function component. The bug is the removed entry point, not the paragraph it renders.",
      wrong: [
        {
          option: "The paragraph must be a class component before ReactDOM can mount it",
          reason: "Function components are the normal root. The removed API is ReactDOM.render.",
        },
        {
          option: "getElementById cannot be used with React 19, so the root node must come from findDOMNode",
          reason: "Looking up the container with getElementById is fine. findDOMNode is unsupported.",
        },
        {
          option: "The call should be ReactDOM.hydrate, which still mounts a client-only tree",
          reason: "ReactDOM.hydrate was removed. A client-only mount uses createRoot, and existing HTML uses hydrateRoot.",
        },
      ],
      example: { lang: 'tsx', source: "import { createRoot } from 'react-dom/client';\n\nfunction App() {\n  return <p>Quiz</p>;\n}\n\nconst root = document.getElementById('root');\nif (root) {\n  createRoot(root).render(<App />);\n}\n" },
      remember: "Use createRoot for a client mount and hydrateRoot for server HTML. ReactDOM.render is gone.",
      fixedCode: {
        lang: "tsx",
        source: "import { createRoot } from 'react-dom/client';\n\nfunction App() {\n  return <p>Quiz</p>;\n}\n\nconst root = document.getElementById('root');\nif (root) {\n  createRoot(root).render(<App />);\n}\n",
      },
    },
  },
  {
    id: "r19b-051",
    tech: "react19",
    topic: "react19-api",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "The page will use a stylesheet you control, and it will call an API on another origin. Which hints match those resources?",
    options: [
      "preconnect the stylesheet, and preload a dummy module from the API origin",
      "Import both helpers from react, and call them only inside a passive effect",
      "preinit the stylesheet and preconnect the API origin. Both helpers come from react-dom",
      "Render a title tag for the stylesheet. Resource hints were removed from React 19",
    ],
    correctIndex: 2,
    explanation: {
      answer: "preinit the stylesheet so the browser fetches and evaluates it, and preconnect the API origin so the connection is warm.",
      why: "preinit is the hint for a stylesheet or script you want the browser to fetch and evaluate, which fits a CSS file you know the page will use. preconnect does not download the API responses. It opens the connection to that origin so the later request spends less time on setup. Both functions are exported from react-dom. They are hints, so they do not belong behind a rule that they must be imported from react or delayed until a passive effect. A title tag is document metadata, not the hint for a stylesheet.",
      wrong: [
        {
          option: "preconnect the stylesheet, and preload a dummy module from the API origin",
          reason: "The stylesheet should be preinited, and the other origin only needs a connection, not a dummy module.",
        },
        {
          option: "Import both helpers from react, and call them only inside a passive effect",
          reason: "The helpers are exported from react-dom, and they are hints rather than effect-only subscriptions.",
        },
        {
          option: "Render a title tag for the stylesheet. Resource hints were removed from React 19",
          reason: "preload, preinit, and preconnect are current react-dom exports. A title does not load the stylesheet.",
        },
      ],
      example: { lang: 'tsx', source: "import { preconnect, preinit } from 'react-dom';\n\nexport function Page() {\n  preinit('/app.css', { as: 'style' });\n  preconnect('https://api.shop.example');\n  return <main>Catalog</main>;\n}\n" },
      remember: "Hint stylesheets with preinit and other origins with preconnect, imported from react-dom.",
    },
  },
  {
    id: "r19b-052",
    tech: "react19",
    topic: "react19-api",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "This module fails as soon as it is loaded in a React 19 app. What is the bug?",
    code: {
      lang: "tsx",
      source: "import { propTypes as PropTypes } from 'react';\n\ntype CardProps = { title: string };\n\nexport function Card({ title }: CardProps) {\n  return <h2>{title}</h2>;\n}\n\nCard.propTypes = { title: PropTypes.string };\n",
    },
    options: [
      "Card must be a class before it can accept a title prop",
      "The heading level is unsupported, so the import of react fails",
      "propTypes must be assigned inside render, or React 19 strips the title",
      "propTypes is not part of the react package, so that import does not exist",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The module imports propTypes from react, and React 19 does not export it.",
      why: "The import line asks the react package for propTypes. That export is not part of the package, so the module cannot load. Assigning a propTypes object on Card would not type-check the title either. The CardProps type already describes the prop, and TypeScript checks it at compile time. Runtime propTypes objects are the old pattern and are not supplied by react. The component can stay a function, and the heading is unrelated to the failed import.",
      wrong: [
        {
          option: "Card must be a class before it can accept a title prop",
          reason: "Function components accept props. The load failure is the missing export.",
        },
        {
          option: "The heading level is unsupported, so the import of react fails",
          reason: "An h2 is fine. The import fails because propTypes is not in the react package.",
        },
        {
          option: "propTypes must be assigned inside render, or React 19 strips the title",
          reason: "Render should not assign propTypes. The title is a normal prop and is not stripped.",
        },
      ],
      example: { lang: 'tsx', source: "type CardProps = { title: string };\n\nexport function Card({ title }: CardProps) {\n  return <h2>{title}</h2>;\n}\n\nexport function Shelf() {\n  return <Card title='Quiz' />;\n}\n" },
      remember: "Do not import propTypes from react. Describe props with TypeScript instead.",
      fixedCode: {
        lang: "tsx",
        source: "type CardProps = { title: string };\n\nexport function Card({ title }: CardProps) {\n  return <h2>{title}</h2>;\n}\n",
      },
    },
  },
] satisfies Question[];


