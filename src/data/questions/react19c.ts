import type { Question } from '../types';

export const react19cQuestions: Question[] = [
  {
    id: 'r19c-001',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does the virtual DOM change about an update?',
    options: [
      'React keeps a description of the UI, diffs it against the previous one, and applies the resulting changes to the real DOM.',
      'React copies the entire document into a string and replaces document.body on every setState.',
      'The virtual DOM is a browser thread that updates elements without running your component.',
      'A virtual DOM update skips your component function and edits the DOM from the JSX file.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The virtual DOM is React\'s in-memory UI description. Reconciliation compares the new description with the previous one and updates the real nodes that differ.',
      why: 'Your component returns React elements, which are plain objects describing the type, props, and children. That tree is not the document. When state updates, React renders again and reconciles the new tree with the last one. Matching nodes can have their props updated. A changed type, or a changed key, throws away the old node and mounts a new one. The real DOM calls are the commit at the end, so many logical changes become a smaller set of mutations. This does not make every update faster than a hand-written DOM edit. It makes updates predictable and lets React schedule them. The browser still has to style, lay out, and paint whatever React committed.',
      wrong: [
        {
          option: 'React copies the entire document into a string and replaces document.body on every setState.',
          reason: 'That would destroy focus and selection. Reconciliation updates the nodes that changed.',
        },
        {
          option: 'The virtual DOM is a browser thread that updates elements without running your component.',
          reason: 'It is a JavaScript data structure. The component still runs to produce the next tree.',
        },
        {
          option: 'A virtual DOM update skips your component function and edits the DOM from the JSX file.',
          reason: 'JSX is compiled into element calls. React learns the next UI by rendering the component.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n" },
      remember: 'React diffs the element tree and patches the real DOM from that result.',
    },
  },
  {
    id: 'r19c-002',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Why must hooks run in the same order on every render?',
    options: [
      'React stores hook state in a list matched by call order. A conditional hook shifts that list and reads the wrong state.',
      'The rules are a style guide. A hook inside an if statement still lines up with the previous render.',
      'Hooks are matched by the variable name, so order does not matter.',
      'A hook inside a loop is required so each item gets its own state.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Hook state is stored by the order of the calls. The same component must call the same hooks in the same order every time it renders.',
      why: 'React does not look up a hook by the name you chose. The first useState on this component is the first slot, the second call is the next slot, and so on. If a later render skips a call because it sat inside an if, every slot after it reads someone else\'s state. That is why hooks sit at the top level of the component or of another hook, not inside branches, loops, or nested functions. Early return before a hook has the same effect. The dependency list is a separate rule: values used inside an effect belong in its list, or the effect closes over a stale one. A custom hook is a function whose name starts with use and follows the same rules. The React Compiler does not relax the order rule. It relies on it.',
      wrong: [
        {
          option: 'The rules are a style guide. A hook inside an if statement still lines up with the previous render.',
          reason: 'The if changes the number of calls. The next slot then belongs to a different hook.',
        },
        {
          option: 'Hooks are matched by the variable name, so order does not matter.',
          reason: 'The variable name is invisible to React. Position in the call list is the identity.',
        },
        {
          option: 'A hook inside a loop is required so each item gets its own state.',
          reason: 'A loop changes how many hooks run. Per-item state belongs in a child component, one level per item.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function Profile({ showBio }: { showBio: boolean }) {\n  const [name, setName] = useState('');\n  const [bio, setBio] = useState('');\n  return showBio ? <textarea value={bio} onChange={(event) => setBio(event.target.value)} /> : <input value={name} onChange={(event) => setName(event.target.value)} />;\n}\n" },
      remember: 'Call the same hooks in the same order. Put per-item state in a child.',
    },
  },
  {
    id: 'r19c-003',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'When is an input controlled, and what goes wrong if you switch it mid-flight?',
    options: [
      'A controlled input\'s value comes from state on every render. Switching between value and defaultValue after mount resets or warns.',
      'An input is controlled when it has a defaultValue, and useState is only for uncontrolled inputs.',
      'A controlled input stores the value in the DOM, and React reads it only on submit.',
      'Passing value without onChange makes a normal editable field.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Controlled means React state is the value on every render, with an onChange that writes that state. Uncontrolled means the DOM holds the value.',
      why: 'value={text} plus onChange that calls setText makes the input controlled. React owns the current characters, so validation and formatting see them immediately. defaultValue sets the DOM once and then leaves it alone. You read an uncontrolled input through a ref, usually on submit. Pick one for the life of the component. Changing an input from uncontrolled to controlled, or the reverse, means the source of truth moved, and React warns because the update is ambiguous. value without onChange freezes the field, unless you also pass readOnly. A controlled input that copies from props needs the parent to update those props. Neither mode is more accessible by itself. The form behavior is what you are choosing.',
      wrong: [
        {
          option: 'An input is controlled when it has a defaultValue, and useState is only for uncontrolled inputs.',
          reason: 'defaultValue is the uncontrolled start value. State bound to value is the controlled pattern.',
        },
        {
          option: 'A controlled input stores the value in the DOM, and React reads it only on submit.',
          reason: 'That is the uncontrolled pattern. Controlled state is updated as the user types.',
        },
        {
          option: 'Passing value without onChange makes a normal editable field.',
          reason: 'The field becomes read-only in practice because React keeps writing the same value back.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useState } from 'react';\n\nexport function NameField() {\n  const [name, setName] = useState('');\n  return <input value={name} onChange={(event) => setName(event.target.value)} />;\n}\n" },
      remember: 'value and onChange control the input. defaultValue leaves it to the DOM.',
    },
  },
  {
    id: 'r19c-004',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does context solve, and when is it a poor state container?',
    options: [
      'Context passes a value to descendants without threading props. Every consumer re-renders when the provided value changes.',
      'Context re-renders only the component that called useContext, and siblings that read it are skipped.',
      'Context is a subscription bus for high-frequency values such as pointer position.',
      'A provider isolates updates, so a new value does not re-render the consumers.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Context avoids prop drilling. Any consumer of that context re-renders when the provider value identity changes.',
      why: 'You create a context, render a provider with a value, and call useContext in a descendant. Intermediate components do not need a prop they only forward. The cost is the update scope. React re-renders consumers of that context when the value is a new reference, even if the part they use is unchanged. A value={{ user, theme }} created during render is new every time and defeats any attempt to limit updates. Memoize the value, or split a fast-changing value from a rare one into two contexts. Context is a poor fit for a pointer stream or a text cursor. A store with selectors can update one subscriber. Context is a good fit for theme, locale, and the current user.',
      wrong: [
        {
          option: 'Context re-renders only the component that called useContext, and siblings that read it are skipped.',
          reason: 'Every component that reads that context is a consumer. Siblings that read it update together.',
        },
        {
          option: 'Context is a subscription bus for high-frequency values such as pointer position.',
          reason: 'Each change re-renders all consumers. A high-frequency value wants a selector or an external store.',
        },
        {
          option: 'A provider isolates updates, so a new value does not re-render the consumers.',
          reason: 'Publishing a new value is how consumers hear about the change. Isolation would hide it.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { createContext, useContext, useMemo, useState } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function ThemeProvider({ children }: { children: React.ReactNode }) {\n  const [theme, setTheme] = useState('light');\n  const value = useMemo(() => ({ theme, setTheme }), [theme]);\n  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;\n}\n\nexport function useTheme() {\n  return useContext(ThemeContext);\n}\n" },
      remember: 'Context skips prop drilling. Split or memoize values so unrelated updates stay local.',
    },
  },
  {
    id: 'r19c-005',
    tech: 'react19',
    topic: 'compiler-memo',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do memo, useMemo, and useCallback each skip?',
    options: [
      'memo can skip a render when props are shallowly equal. useMemo caches a computed value. useCallback caches a function identity.',
      'useMemo skips rendering the child. memo caches a function. useCallback caches a computed array.',
      'All three skip the next network request when their dependencies change.',
      'They deep-compare props, so a new object nested inside props still counts as equal.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'memo compares props and can skip the child render. useMemo returns the last computed value. useCallback returns the last function.',
      why: 'memo wraps a component. If the new props are shallowly equal to the previous props, React reuses the last render. A new object or function prop fails that check even when the contents match. useCallback keeps the function reference stable as long as its dependencies do, which is how you pass a callback to a memoized child. useMemo keeps an expensive result, or a stable object, while its dependencies are unchanged. All three compare dependencies with Object.is, not a deep equal. A wrong dependency list returns a stale value. They also have a cost, so they help at a measured boundary and not on every line. The React Compiler can insert the equivalent memoization. Hand-written calls still matter at a library boundary the compiler does not see.',
      wrong: [
        {
          option: 'useMemo skips rendering the child. memo caches a function. useCallback caches a computed array.',
          reason: 'The jobs are swapped. memo is the component skip, and the two hooks cache a value and a function.',
        },
        {
          option: 'All three skip the next network request when their dependencies change.',
          reason: 'They cache render work. A fetch stays in your effect or loader, and a changed dependency invalidates the cache.',
        },
        {
          option: 'They deep-compare props, so a new object nested inside props still counts as equal.',
          reason: 'The comparison is shallow. A new nested object is a changed prop.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { memo, useCallback, useMemo, useState } from 'react';\n\nconst Row = memo(function Row({ onSelect, label }: { onSelect: () => void; label: string }) {\n  return <button onClick={onSelect}>{label}</button>;\n});\n\nexport function List({ items }: { items: string[] }) {\n  const [picked, setPicked] = useState('');\n  const labels = useMemo(() => items.map((item) => item.toUpperCase()), [items]);\n  const onSelect = useCallback(() => setPicked(labels[0] ?? ''), [labels]);\n  return <Row onSelect={onSelect} label={labels[0] ?? ''} />;\n}\n" },
      remember: 'memo skips a render. useMemo caches a value. useCallback caches a function.',
    },
  },
  {
    id: 'r19c-006',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Why can an index key corrupt a list that reorders?',
    options: [
      'React uses the key as the identity. An index key makes the state of position 0 stay at position 0 after a reorder.',
      'Keys are only for CSS. Index keys are safe because React compares the child text.',
      'A missing key is faster and keeps input state glued to the item id.',
      'Keys must be unique across the whole app, so an item id cannot be used twice on one page.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The key tells React which child is which. An index key means "the child at this position," so state stays with the position when the items move.',
      why: 'Reconciliation matches children in a list by key. A stable id lets React move the existing component, including its input state and DOM node, to the new position. If the key is the array index, the component that was key 0 is still key 0 after you sort. The text may update through props while the local state and an uncontrolled input stay with the old position. Inserting at the front shifts every index and can reuse the wrong state for every row. Indexes are tolerable only for a static list with no state and no reorder. Keys need to be unique among siblings, not globally. A random key during render creates a new identity every time and remounts the row, which loses state and focus.',
      wrong: [
        {
          option: 'Keys are only for CSS. Index keys are safe because React compares the child text.',
          reason: 'Keys are identity for reconciliation. Text is a prop, and it does not carry local state.',
        },
        {
          option: 'A missing key is faster and keeps input state glued to the item id.',
          reason: 'A missing key falls back to the index. The item id is what you should pass as the key.',
        },
        {
          option: 'Keys must be unique across the whole app, so an item id cannot be used twice on one page.',
          reason: 'Uniqueness is among siblings in that list. Another list can reuse the same ids.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nexport function Todos({ todos }: { todos: { id: string; title: string }[] }) {\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li key={todo.id}>{todo.title}</li>\n      ))}\n    </ul>\n  );\n}\n" },
      remember: 'Key by a stable id. An index key keeps state at the position, not on the item.',
    },
  },
  {
    id: 'r19c-007',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does hydration do with server-rendered HTML?',
    options: [
      'React attaches event handlers and state to the existing HTML. The first client render must describe the same tree.',
      'Hydration throws away the server HTML and creates every node again before any event works.',
      'Hydration runs only for Client Components that were not in the server response.',
      'A mismatch is ignored, and the server text stays even if the client renders a different string.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Hydration reuses the server HTML and wires it to React. The client\'s first render is expected to match that HTML.',
      why: 'Server rendering sends HTML so the user can see content before your client bundle finishes. Hydration walks that HTML and the element tree from the first client render together. It attaches listeners and associates state with those nodes instead of creating a second document. If a text node, attribute, or element differs, React reports a hydration mismatch. The usual causes are a timestamp, a random id, locale formatting, or a window check that was not true on the server. Invalid HTML, such as a div inside a p, can also be rewritten by the parser before React sees it. After a mismatch, React may discard that part of the server tree and render again on the client, which costs a flash and can lose input. The fix is to render the same output in both places.',
      wrong: [
        {
          option: 'Hydration throws away the server HTML and creates every node again before any event works.',
          reason: 'That would be a client render into an empty container. Hydration exists to keep the server nodes.',
        },
        {
          option: 'Hydration runs only for Client Components that were not in the server response.',
          reason: 'The server HTML is what gets hydrated. Client Components in that HTML still need to match.',
        },
        {
          option: 'A mismatch is ignored, and the server text stays even if the client renders a different string.',
          reason: 'React warns and repairs the tree. The mismatch is a bug, not a supported way to show two values.',
        },
      ],
      example: { lang: 'tsx', source: "export default function UpdatedAt({ stamp }: { stamp: string }) {\n  return <p>Updated {stamp}</p>;\n}\n" },
      remember: 'Hydration wires the existing HTML. The first client render has to match it.',
    },
  },
  {
    id: 'r19c-008',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which heuristic does React use when it diffs a list?',
    options: [
      'It matches siblings by key and updates nodes of the same type in place. It does not compute a minimum edit script for the whole tree.',
      'It finds the longest common subsequence of the whole document on every update.',
      'It ignores keys and always unmounts every child when one prop changes.',
      'A changed prop on a parent unmounts the whole subtree even when the child type and key match.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'React walks level by level, pairs children by key, and reuses a node when the type matches. It does not solve a full tree-edit distance.',
      why: 'A minimum set of inserts, deletes, and moves for a general tree is expensive. React uses a linear heuristic instead. Two elements of different types, such as a div becoming a span, unmount the old subtree and mount the new one. Two elements of the same type are updated, and their children are compared next. In a list, the key decides which previous child corresponds to which next child. Without keys, React pairs by position. With keys, it can move a child instead of recreating it. The heuristic can do extra DOM work on a pathological case, and it stays predictable. Keys belong on the array element, must be stable, and only need to be unique among those siblings. This matching is what makes a wrong key look like corrupted state rather than a slow diff.',
      wrong: [
        {
          option: 'It finds the longest common subsequence of the whole document on every update.',
          reason: 'That global edit script is what the heuristic avoids. React compares one level and then the children.',
        },
        {
          option: 'It ignores keys and always unmounts every child when one prop changes.',
          reason: 'A same-type match is updated in place. Keys exist so the match is not only the position.',
        },
        {
          option: 'A changed prop on a parent unmounts the whole subtree even when the child type and key match.',
          reason: 'The parent updates and the children are reconciled. A matching child is reused.',
        },
      ],
      example: { lang: 'tsx', source: "export function Stack({ mode }: { mode: 'a' | 'b' }) {\n  return mode === 'a' ? <section key=\"a\" /> : <section key=\"b\" />;\n}\n" },
      remember: 'Same type and key are updated. A different type remounts. Lists match by key.',
    },
  },
  {
    id: 'r19c-009',
    tech: 'react19',
    topic: 'transitions',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How does concurrent rendering keep a page responsive?',
    options: [
      'React can start a render, pause it for a more urgent update, and discard a stale result before it commits.',
      'It runs two component trees on two threads and locks the DOM for the slower one.',
      'Every setState is deferred until the browser has been idle for a second.',
      'Concurrent rendering means effects run twice in production so bugs show up earlier.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A concurrent render is interruptible. Urgent input can commit before a slower transition, and an outdated render is thrown away.',
      why: 'Rendering is the work of calling your components. Concurrent rendering lets React do part of that work, check for a more urgent update, and come back. Typing in a controlled input is urgent. Filtering a large list can be marked as a transition with startTransition or useDeferredValue, so the input commits first and the list may show a pending state. If the user types again, the in-progress list render can be abandoned instead of committing a stale frame. This does not add a second JavaScript thread, and it does not move the DOM off the main thread. A render still has to be pure, because React may call it more than once and discard the result. Strict Mode\'s extra development calls are a related purity check, not the production scheduler.',
      wrong: [
        {
          option: 'It runs two component trees on two threads and locks the DOM for the slower one.',
          reason: 'There is one main thread. Interrupting a render is not a second thread and not a lock.',
        },
        {
          option: 'Every setState is deferred until the browser has been idle for a second.',
          reason: 'Urgent updates still commit promptly. Only updates you mark as transitions are treated as interruptible.',
        },
        {
          option: 'Concurrent rendering means effects run twice in production so bugs show up earlier.',
          reason: 'The double invoke is a development Strict Mode check. Production concurrency is about interrupting renders.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { startTransition, useState } from 'react';\n\nexport function Search({ items }: { items: string[] }) {\n  const [query, setQuery] = useState('');\n  const [visible, setVisible] = useState(items);\n  function onChange(value: string) {\n    setQuery(value);\n    startTransition(() => {\n      setVisible(items.filter((item) => item.includes(value)));\n    });\n  }\n  return <input value={query} onChange={(event) => onChange(event.target.value)} />;\n}\n" },
      remember: 'Urgent updates can interrupt a transition. React may discard a stale render.',
    },
  },
  {
    id: 'r19c-010',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which cost does a virtual DOM diff not remove?',
    options: [
      'It does not remove layout and paint, and a large tree or a bad key still does too much work.',
      'It removes the need to render components when state changes.',
      'It makes a list of 100,000 mounted rows as cheap as one row.',
      'It skips browser style calculation for every DOM mutation React commits.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The diff reduces DOM mutations. It still runs your components, and the browser still lays out and paints the mutations that remain.',
      why: 'Reconciliation is a JavaScript walk of the element tree. A parent state change renders the parent and, unless a child bails out, its descendants. That walk is pure overhead when the tree is huge and the visible change is one row. Keys that change every render turn an update into an unmount and mount. Memoization and splitting state lower the walk. They do not change the fact that committing a size change causes layout. Virtualization is a different technique: do not mount the off-screen rows at all. Treating the virtual DOM as "faster than the DOM" misses cases where you should not have described those nodes. The useful property is consistent updates and scheduling, not a free pass on rendering cost.',
      wrong: [
        {
          option: 'It removes the need to render components when state changes.',
          reason: 'The new description comes from rendering. The diff happens after that render.',
        },
        {
          option: 'It makes a list of 100,000 mounted rows as cheap as one row.',
          reason: 'Each mounted row is still reconciled. Windowing is what avoids mounting them.',
        },
        {
          option: 'It skips browser style calculation for every DOM mutation React commits.',
          reason: 'Once a DOM node changes, the browser\'s style, layout, and paint pipeline still runs.',
        },
      ],
      example: { lang: 'tsx', source: "export function Rows({ ids }: { ids: string[] }) {\n  return ids.map((id) => <div key={id}>{id}</div>);\n}\n" },
      remember: 'Diffing avoids some DOM writes. It does not make a huge mounted tree free.',
    },
  },
  {
    id: 'r19c-011',
    tech: 'react19',
    topic: 'compiler-memo',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What combination keeps a 50,000-row list responsive?',
    options: [
      'Render the visible window, give each row a stable key, and memoize the row so a parent update does not render every mounted row.',
      'Mount every row, key them by index, and wrap the parent in memo only.',
      'useMemo around the entire 50,000-element array is enough, with no window and no keys.',
      'Put each row in its own context provider so updates skip the list.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Window the list so only visible rows mount, key those rows by id, and memoize a row so unrelated parent state does not render it again.',
      why: 'Mounting 50,000 rows creates 50,000 component states and DOM nodes. A scroll then lays out all of them. A window, or virtual list, renders the slice that intersects the viewport plus a small overscan and positions it in a spacer of the full height. Variable row heights need measurement. The row component should be memoized, and callbacks passed to it should be stable, or every parent render re-renders every visible row. Keys must be the row id so recycling a DOM node does not show the previous row\'s state. Splitting work with a transition helps the first filter, and it does not replace the window. Memoizing the source array does not stop React from walking every child you return.',
      wrong: [
        {
          option: 'Mount every row, key them by index, and wrap the parent in memo only.',
          reason: 'The parent memo does not shrink the child list. Index keys attach state to the position while rows move.',
        },
        {
          option: 'useMemo around the entire 50,000-element array is enough, with no window and no keys.',
          reason: 'The array identity is not the cost. Rendering and laying out every row is the cost.',
        },
        {
          option: 'Put each row in its own context provider so updates skip the list.',
          reason: 'Thousands of providers add cost. They are not a substitute for mounting fewer rows.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { memo } from 'react';\n\nconst Row = memo(function Row({ title }: { title: string }) {\n  return <div>{title}</div>;\n});\n\nexport function Window({ rows, start }: { rows: { id: string; title: string }[]; start: number }) {\n  return rows.slice(start, start + 20).map((row) => <Row key={row.id} title={row.title} />);\n}\n" },
      remember: 'Mount the visible rows, key them by id, and memoize the row component.',
    },
  },
  {
    id: 'r19c-012',
    tech: 'react19',
    topic: 'hooks-rendering',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which server render will mismatch when the client hydrates?',
    options: [
      'HTML that includes Date.now(), Math.random(), or a window check that was false on the server.',
      'HTML that renders a prop the server already serialized, with the same formatting on both sides.',
      'A list whose keys are stable ids and whose text comes from that same prop data.',
      'A Client Component that reads a prop and does not touch the clock, random, or the DOM during render.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Hydration mismatches when the client\'s first render is not the same tree the server sent. Time, randomness, and browser-only checks are the usual causes.',
      why: 'The server and the client run the same component to produce the first tree. Date.now() and Math.random() return different values in the two places, so the text differs. if (typeof window !== "undefined") renders one branch on the server and the other in the browser. Invalid markup is a quieter version: a p that contains a div is rewritten by the HTML parser, and React then sees a different tree. Browser extensions that inject nodes can cause the same warning. suppressHydrationWarning on a single text node is for an intentional difference such as a timestamp, and it does not fix a different element structure. The durable fix is to pass the server value as a prop, or to render the client-only part after mount. A mismatch makes React recover on the client and can discard the server HTML for that subtree.',
      wrong: [
        {
          option: 'HTML that renders a prop the server already serialized, with the same formatting on both sides.',
          reason: 'The same prop produces the same tree. That is the pattern that hydrates cleanly.',
        },
        {
          option: 'A list whose keys are stable ids and whose text comes from that same prop data.',
          reason: 'Stable keys and shared data match. Keys do not by themselves create a hydration mismatch.',
        },
        {
          option: 'A Client Component that reads a prop and does not touch the clock, random, or the DOM during render.',
          reason: 'A pure render from props is what hydration expects. The client directive does not cause a mismatch.',
        },
      ],
      example: { lang: 'tsx', source: "export function Stamp({ iso }: { iso: string }) {\n  return <time dateTime={iso}>{iso}</time>;\n}\n" },
      remember: 'Do not read the clock, random, or window during the render that hydrates.',
    },
  },
];
