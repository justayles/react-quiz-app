import type { Question } from '../types';

export const jsConceptsF: Question[] = [
  {
    id: 'js-151',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What do scheduler.yield and scheduler.postTask add beyond setTimeout?',
    options: [
      'yield hands control back so higher-priority work can run. postTask queues work at a named priority. Both need a fallback.',
      'postTask preempts JavaScript in the middle of a statement. yield blocks until the network is idle.',
      'They replace workers and move the continuation to another thread.',
      'setTimeout of 0 already sets a user-blocking priority, so postTask is identical.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The scheduler API is cooperative. yield pauses so the browser can run more important work, and postTask files a callback at a priority you choose.',
      why: 'JavaScript does not preempt a running function. A long loop must choose to pause. scheduler.yield returns a promise that resumes after the browser has handled higher-priority work such as input. scheduler.postTask(callback, { priority }) queues background, user-visible, or user-blocking work. A background analytics flush can wait while a key handler stays user-blocking. setTimeout of 0 only says "a later macrotask," with no priority and with a minimum delay that browsers clamp. These methods are not in every browser, so feature-detect them and fall back to a timeout. They do not move work off the main thread. A chunk that is still too long needs a worker. Yielding inside a microtask loop does not help, because microtasks finish before this scheduling can matter.',
      wrong: [
        {
          option: 'postTask preempts JavaScript in the middle of a statement. yield blocks until the network is idle.',
          reason: 'The running function continues until it awaits a yield or returns. Nothing here watches the network.',
        },
        {
          option: 'They replace workers and move the continuation to another thread.',
          reason: 'The continuation stays on the main thread. Workers are still the off-thread option.',
        },
        {
          option: 'setTimeout of 0 already sets a user-blocking priority, so postTask is identical.',
          reason: 'A timer has no priority argument. postTask exists so background work can wait behind input.',
        },
      ],
      example: { lang: 'js', source: "const yieldToBrowser = globalThis.scheduler?.yield\n  ? () => scheduler.yield()\n  : () => new Promise((resolve) => setTimeout(resolve, 0));\nawait yieldToBrowser();" },
      remember: 'Yield and postTask cooperate with the browser by priority. They do not preempt or leave the thread.',
    },
  },
  {
    id: 'js-152',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How should Web Vitals be watched in production?',
    options: [
      'Collect LCP, CLS, and INP from real sessions, send them with a beacon, and alert on a percentile by route.',
      'Average one developer\'s Lighthouse score and page the team when that average moves.',
      'Record only the first millisecond of the HTML response and ignore input.',
      'Sample every event on the main thread and store the trace in localStorage.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Field measurements of LCP, CLS, and INP, split by route and device, show whether users are actually fine. Alert on a high percentile.',
      why: 'Lab tools such as Lighthouse run one controlled load. They miss a slow phone, a cached return visit, and a heavy interaction. The web-vitals library reports each metric once it is ready. sendBeacon or fetch with keepalive survives a navigation better than a canceled XHR. Attach the route, release, device class, and country so a regression can be found. p75 is the common summary because the average hides a bad tail. Alert when a route\'s percentile crosses a budget, not when one session is slow. Sampling is reasonable at high volume if the sample still represents each route. A full performance trace for every user is too large and can contain sensitive URLs. Pair the field alert with a lab check in CI so a bad release is caught before it is the only source of truth.',
      wrong: [
        {
          option: 'Average one developer\'s Lighthouse score and page the team when that average moves.',
          reason: 'A lab average is not the field distribution. One laptop does not represent users.',
        },
        {
          option: 'Record only the first millisecond of the HTML response and ignore input.',
          reason: 'That ignores paint, shift, and interaction, which are the vitals.',
        },
        {
          option: 'Sample every event on the main thread and store the trace in localStorage.',
          reason: 'Full traces are for a sampled debug session. localStorage is small, synchronous, and not a telemetry pipeline.',
        },
      ],
      example: { lang: 'js', source: "onINP(({ value, rating, id }) => {\n  navigator.sendBeacon('/vitals', JSON.stringify({ name: 'INP', value, rating, id, path }));\n});" },
      remember: 'Measure vitals on real sessions and alert on a percentile for each route.',
    },
  },
  {
    id: 'js-153',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What makes a strict CSP hard to roll out on a large site?',
    options: [
      'Third-party scripts, per-request nonces, and report-only rollout. A tag manager widens the trust boundary.',
      'CSP can be enabled by one meta tag that contains unsafe-inline and unsafe-eval and still blocks injected scripts.',
      'Hashes remove the need to know which third parties the page loads.',
      'A single static nonce in the CDN HTML is enough for every user.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A strict policy fails closed on unexpected scripts. Third parties, nonce injection, and a report-only period are the hard parts.',
      why: 'script-src \'self\' breaks inline bootstraps and every marketing tag until each one is allowed on purpose. Nonces must be generated per document, which fights a fully static CDN response unless the edge injects them. Hashes fit static inline scripts and break when the bytes change. strict-dynamic lets a trusted loader pull more scripts, which is practical and also means the loader is now a high-value target. A tag manager loads whatever the marketing tool adds next, so the allowlist is no longer the list you reviewed. Start with Content-Security-Policy-Report-Only, collect violation reports, fix the real sources, then enforce. Expect to proxy or remove a third party you cannot put under a nonce. unsafe-inline and unsafe-eval recreate the XSS hole the policy was meant to shrink.',
      wrong: [
        {
          option: 'CSP can be enabled by one meta tag that contains unsafe-inline and unsafe-eval and still blocks injected scripts.',
          reason: 'Those keywords allow the injected inline script and eval. The policy would look present and block little.',
        },
        {
          option: 'Hashes remove the need to know which third parties the page loads.',
          reason: 'A hash allowlists one exact script body. A third-party URL still has to be a nonce, a hash, or a host you trust.',
        },
        {
          option: 'A single static nonce in the CDN HTML is enough for every user.',
          reason: 'A cached nonce is public. Attackers can reuse it on a forged inline script.',
        },
      ],
      example: { lang: 'js', source: "res.setHeader(\n  'Content-Security-Policy-Report-Only',\n  `script-src 'nonce-${nonce}' 'strict-dynamic'; report-to csp`,\n);" },
      remember: 'Enforce a nonce or hash policy after report-only. Treat each third-party loader as trusted code.',
    },
  },
  {
    id: 'js-154',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which Chromium stages run for a style change that only updates opacity?',
    options: [
      'A compositor can often apply opacity without repeating style, layout, and paint on the main thread.',
      'Every opacity change repeats selector matching, layout, paint, and a full document parse.',
      'Blink skips compositing for opacity and only reparses HTML.',
      'Layout runs on the GPU, and paint always runs on the main thread for opacity.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Parsing builds the trees, style resolves rules, layout computes boxes, paint records drawing, and compositing combines layers. Opacity can stop at compositing.',
      why: 'Blink turns HTML and CSS into a DOM and a CSSOM. Style recalculation matches selectors and computes used values. Layout, also called reflow, turns those values into positions and sizes. Paint produces display lists, and compositing turns layers into the screen image, often on the GPU thread. A change to width invalidates layout and everything after it. A change to color invalidates paint. A change to opacity or transform on an element that has its own layer can be handled by the compositor, so the main thread stays free for input. That split is why an animation of top is more expensive than an animation of transform. Long style or layout on the main thread is a long task. Forcing layout by reading geometry flushes the pending stages early.',
      wrong: [
        {
          option: 'Every opacity change repeats selector matching, layout, paint, and a full document parse.',
          reason: 'Parse does not rerun. Opacity often avoids layout and paint when the layer can be composited.',
        },
        {
          option: 'Blink skips compositing for opacity and only reparses HTML.',
          reason: 'Opacity is a compositing candidate. HTML parsing is unrelated to a later style change.',
        },
        {
          option: 'Layout runs on the GPU, and paint always runs on the main thread for opacity.',
          reason: 'Layout is main-thread work. The point of a composited opacity change is that paint can be skipped.',
        },
      ],
      example: { lang: 'js', source: "box.style.opacity = '0.5';\nbox.style.transform = 'translateY(8px)';" },
      remember: 'Style, layout, paint, then composite. Animate transform and opacity when you can.',
    },
  },
  {
    id: 'js-155',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When is a normalized GraphQL cache a better fit than a document cache with stale-while-revalidate?',
    options: [
      'Normalize when the same entity appears in many queries and one mutation should update all of them. A document cache is simpler for independent responses.',
      'A document cache stores entities by id. A normalized cache stores only the raw response text and cannot show stale data.',
      'Stale-while-revalidate cannot refetch, so it is unusable with GraphQL.',
      'Normalized caches remove the need for identifiers on entities.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A normalized cache stores each entity by id, so one write updates every query that contains it. A document cache stores each response and refetches it.',
      why: 'A document or SWR-style cache keys the response by the query and variables. It can show the previous result immediately and revalidate in the background. Two queries that both contain product 10 hold two copies, and a mutation must know every key to patch or must refetch them. A normalized cache splits the response into records such as Product:10 and stores references inside each query result. Updating that record updates every visible query. The cost is identity: entities need stable ids, and the cache must understand the schema. Garbage collection and partial results are harder. Choose the document cache when responses are independent and refetch is cheap. Choose normalization when the same records show up all over the UI and you want one mutation to be consistent.',
      wrong: [
        {
          option: 'A document cache stores entities by id. A normalized cache stores only the raw response text and cannot show stale data.',
          reason: 'Those shapes are reversed. Both can show stale data while a request is in flight.',
        },
        {
          option: 'Stale-while-revalidate cannot refetch, so it is unusable with GraphQL.',
          reason: 'Revalidation is the refetch. GraphQL can use it per query key.',
        },
        {
          option: 'Normalized caches remove the need for identifiers on entities.',
          reason: 'Ids are what the store uses to merge an entity that arrived from two queries.',
        },
      ],
      example: { lang: 'js', source: "const cache = { 'Product:10': { id: '10', name: 'Lamp', price: 40 } };\nfunction patchPrice(id, price) {\n  cache[`Product:${id}`] = { ...cache[`Product:${id}`], price };\n}" },
      remember: 'Normalize when one entity is shared across queries. Cache the document when refetch is enough.',
    },
  },
  {
    id: 'js-156',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When is a state machine a better UI model than several booleans?',
    options: [
      'Use it when some combinations are illegal and events should move the UI through an explicit list of states.',
      'Use it for every checkbox, because two booleans cannot be stored in React.',
      'A statechart removes the need to handle errors or loading.',
      'Machines are only useful on the server because the client cannot store the current state.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A machine lists the states and the events that move between them, so impossible combinations cannot be represented.',
      why: 'isLoading, isError, and isSuccess can all be true at once if each flag is set independently. A machine has one current state, such as idle, submitting, success, or failure. An event such as submit is handled only from the states that allow it. Guards can require valid input. A statechart adds hierarchy and parallel regions, which fits a checkout with a payment substate. The transition function is pure and easy to test without rendering. The cost is ceremony for a widget whose states really are independent, such as two unrelated toggles. Do not reach for a library until the boolean combinations have already caused a bug. The machine stores the state. It does not remove the need to render each state, including the error.',
      wrong: [
        {
          option: 'Use it for every checkbox, because two booleans cannot be stored in React.',
          reason: 'Independent flags are a poor fit for a machine, and React can store booleans.',
        },
        {
          option: 'A statechart removes the need to handle errors or loading.',
          reason: 'Those become states you still have to render. The machine only makes them explicit.',
        },
        {
          option: 'Machines are only useful on the server because the client cannot store the current state.',
          reason: 'The current state is ordinary client data. The value is the constrained transitions.',
        },
      ],
      example: { lang: 'js', source: "function reduce(state, event) {\n  if (state === 'idle' && event === 'submit') return 'submitting';\n  if (state === 'submitting' && event === 'ok') return 'success';\n  if (state === 'submitting' && event === 'fail') return 'failure';\n  return state;\n}" },
      remember: 'One explicit state beats booleans that can all be true. Use it when combinations are illegal.',
    },
  },
  {
    id: 'js-157',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does an offline-first client have to decide besides storing data locally?',
    options: [
      'It needs a sync queue, idempotent operations, and a conflict policy for edits made while disconnected.',
      'The local store replaces the server permanently, so conflicts cannot happen.',
      'Last-write-wins is the only possible policy, and retries are unsafe by definition.',
      'A service worker cache of HTML is sufficient for collaborative edits.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The local store is the source of truth while offline. Replaying the queue later requires idempotent operations and a rule for conflicting edits.',
      why: 'Offline-first means the user can read and write without a connection, and the UI shows local data immediately. Writes go into a queue with stable ids. When the network returns, the client replays them. A retry must not create a second object, so each operation needs an idempotency key. Two people, or one person on two devices, can edit the same record. Last-write-wins is simple and loses data. A field-level merge, a CRDT, or an operational transform can converge. A prompt that shows both versions is appropriate when the cost of a silent loss is high. The queue should survive reloads. A service worker can cache reads and even replay POST requests, and it does not by itself decide which edit wins. Design the operations as commutative or include a base version the server can reject.',
      wrong: [
        {
          option: 'The local store replaces the server permanently, so conflicts cannot happen.',
          reason: 'The server is still the shared history. Conflicts appear when another writer touched the same data.',
        },
        {
          option: 'Last-write-wins is the only possible policy, and retries are unsafe by definition.',
          reason: 'It is one policy. Idempotent retries are what make the queue safe to replay.',
        },
        {
          option: 'A service worker cache of HTML is sufficient for collaborative edits.',
          reason: 'Cached pages help reads. Concurrent edits need a merge rule the cache does not provide.',
        },
      ],
      example: { lang: 'js', source: "const queue = [{ id: 'op-1', type: 'rename', base: 4, name: 'Lamp' }];\nawait fetch('/sync', {\n  method: 'POST',\n  headers: { 'Idempotency-Key': 'op-1' },\n  body: JSON.stringify(queue[0]),\n});" },
      remember: 'Queue local writes, replay them idempotently, and choose how conflicts resolve.',
    },
  },
  {
    id: 'js-158',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which client-side index fits autocomplete versus full-text search?',
    options: [
      'A trie answers prefixes quickly. An inverted index maps terms to documents and a score ranks them.',
      'An inverted index is fastest for a single prefix character. A trie stores term frequency per document.',
      'Both structures require a server round trip on every keystroke.',
      'A linear scan of the raw strings is the scalable choice for tens of thousands of titles.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A trie walks characters for prefix suggestions. An inverted index lists the documents that contain each term and then scores those documents.',
      why: 'Autocomplete asks "what names start with these characters?" A trie, or prefix tree, stores each character on an edge, so the suggestions are the subtree under the typed prefix. Memory is the cost, and a ternary or radix variant can shrink it. Full-text search asks "which documents contain these words?" An inverted index maps a token to postings, which are document ids and positions. A query intersects postings and scores them, for example with term frequency. Stemming and stop words change what gets indexed. Neither index should be rebuilt on a keystroke. Debounce the query, and cancel a stale result if a slower earlier search returns last. A scan of every title is fine for a short list and too slow, and too janky, once the list is large. The index lives in memory or a worker. It does not replace a server search of data the client does not have.',
      wrong: [
        {
          option: 'An inverted index is fastest for a single prefix character. A trie stores term frequency per document.',
          reason: 'The prefix walk is the trie. Frequencies belong with postings in an inverted index.',
        },
        {
          option: 'Both structures require a server round trip on every keystroke.',
          reason: 'They exist so the client can answer from data it already loaded.',
        },
        {
          option: 'A linear scan of the raw strings is the scalable choice for tens of thousands of titles.',
          reason: 'That scan runs on every keystroke and will block the main thread as the list grows.',
        },
      ],
      example: { lang: 'js', source: "const trie = { children: new Map(), ids: [] };\nfunction insert(word, id) {\n  let node = trie;\n  for (const char of word) {\n    if (!node.children.has(char)) node.children.set(char, { children: new Map(), ids: [] });\n    node = node.children.get(char);\n  }\n  node.ids.push(id);\n}" },
      remember: 'Tries serve prefixes. Inverted indexes serve term lookup and ranking.',
    },
  },
  {
    id: 'js-159',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What should a performance budget gate in CI?',
    options: [
      'Gate compressed JavaScript size, image weight, and a lab limit for LCP or INP on the critical routes.',
      'Gate the number of Git commits and ignore bundle size because HTTP/2 makes it free.',
      'Fail the build when any third-party script is present, including the ones the product requires.',
      'A budget only belongs in a quarterly slide and cannot run in CI.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A budget is a number the build can check: bytes of JavaScript and images, and a lab timing for the main route.',
      why: 'Without a budget, each feature adds a dependency and the regression shows up months later in field INP. Choose limits that match the user, such as the compressed JavaScript of the entry route, the hero image, and a Lighthouse or WebPageTest run of LCP and a scripted interaction. Fail or warn in CI when a pull request crosses the line, and show the delta. Budgets need owners. A limit that everyone overrides is not a budget. Lab gates miss real-device variance, so keep field p75 as the second signal and tighten the lab number when field data says users are over the line. HTTP/2 does not make a megabyte of JavaScript free, because parse and execute still occupy the main thread. Count third-party tags in the same budget instead of banning them by slogan.',
      wrong: [
        {
          option: 'Gate the number of Git commits and ignore bundle size because HTTP/2 makes it free.',
          reason: 'Commit count is not user cost. Multiplexing does not make parse and execute free.',
        },
        {
          option: 'Fail the build when any third-party script is present, including the ones the product requires.',
          reason: 'The budget should price those scripts. A blanket ban ignores product decisions.',
        },
        {
          option: 'A budget only belongs in a quarterly slide and cannot run in CI.',
          reason: 'Byte and timing checks are ordinary CI assertions. A slide does not stop a regression.',
        },
      ],
      example: { lang: 'js', source: "const budgetKb = 180;\nconst actualKb = gzipSize / 1024;\nif (actualKb > budgetKb) {\n  throw new Error(`JS is ${actualKb.toFixed(0)}kb, budget is ${budgetKb}kb`);\n}" },
      remember: 'Fail CI on route bytes and a lab vital before the field percentile moves.',
    },
  },
  {
    id: 'js-160',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How does scheduler.postTask express cooperative multitasking?',
    options: [
      'You queue a callback at a priority, and the browser runs higher-priority tasks first. Your code must return or yield to let that happen.',
      'The browser pauses any loop every 5 ms, so priorities are unnecessary.',
      'postTask starts a worker per priority level and shares the DOM with it.',
      'A background task always runs before user-blocking work if it was queued first.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'postTask schedules a callback with a priority. The main thread only switches tasks when your JavaScript returns or yields.',
      why: 'Cooperative multitasking means tasks give up the thread. They are not forcibly interrupted. scheduler.postTask(fn, { priority: "background" }) files fn behind user-blocking and user-visible work. A continuation can await scheduler.yield so a keypress already waiting can paint first. If you never yield, the priority of the queued tasks does not matter, because they cannot start. There is a delay option and an AbortSignal for cancellation. Feature detection matters, and a timeout is the fallback, without priorities. This is the same thread as the page, so a 200 ms background callback still blocks once it starts. Use it to order main-thread work. Use a worker when the work should not be on that thread at all.',
      wrong: [
        {
          option: 'The browser pauses any loop every 5 ms, so priorities are unnecessary.',
          reason: 'A loop runs until it returns. Nothing injects a pause at a fixed interval.',
        },
        {
          option: 'postTask starts a worker per priority level and shares the DOM with it.',
          reason: 'The callback stays on the main thread. Workers do not share the DOM.',
        },
        {
          option: 'A background task always runs before user-blocking work if it was queued first.',
          reason: 'Priority is allowed to reorder work. Background is the queue that should wait.',
        },
      ],
      example: { lang: 'js', source: "scheduler.postTask(() => sendLogs(), { priority: 'background' });\nscheduler.postTask(() => paintSelection(), { priority: 'user-blocking' });" },
      remember: 'postTask orders main-thread work. The running function must yield before a higher priority can run.',
    },
  },
  {
    id: 'js-161',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Where does runtime CSS-in-JS become a problem at scale?',
    options: [
      'Injecting styles during render adds main-thread work, can flash unstyled content, and complicates server rendering.',
      'Build-time extraction is always slower because the browser prefers style tags created in render.',
      'Runtime libraries remove specificity conflicts by isolating every rule in a shadow root automatically.',
      'The only cost is the size of the style string, and render time is unaffected.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Runtime CSS-in-JS pays during render to create and insert rules. Build-time extraction moves that cost to the build and ships plain CSS.',
      why: 'Colocating styles with a component is the ergonomic win. A runtime library that serializes styles and inserts a style tag or adopts a stylesheet does that work on the main thread as components render. On a large tree that delays first paint and interactions. Server rendering must either extract the same CSS or the client will mismatch and then inject it, causing a flash. Specificity wars and generated class names make overrides hard to trace. Frequent prop-driven styles defeat caching of the rule. Libraries that extract CSS at build time, or CSS modules with tokens, keep the colocation and drop the runtime insertion. Use runtime injection only for styles that truly depend on data you cannot know at build time, and keep that set small.',
      wrong: [
        {
          option: 'Build-time extraction is always slower because the browser prefers style tags created in render.',
          reason: 'The browser is fast at matching a stylesheet that arrived with the document. Creating rules during render is the extra work.',
        },
        {
          option: 'Runtime libraries remove specificity conflicts by isolating every rule in a shadow root automatically.',
          reason: 'Most CSS-in-JS writes normal style tags. Shadow DOM is a separate choice and is not implied.',
        },
        {
          option: 'The only cost is the size of the style string, and render time is unaffected.',
          reason: 'Insertion and rule construction happen while rendering. Byte size is only part of the cost.',
        },
      ],
      example: { lang: 'js', source: "const className = 'button';\nbutton.className = className;" },
      remember: 'Runtime style injection competes with rendering. Extract CSS at build time when the app is large.',
    },
  },
  {
    id: 'js-162',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What can accessibility automation catch in CI, and what can it not?',
    options: [
      'Lint and axe catch missing names, bad roles, and some contrast issues. They do not replace a keyboard and screen-reader pass.',
      'A green axe run proves the flow is operable by keyboard and understandable in a screen reader.',
      'CI should snapshot class names, and that snapshot is an accessibility test.',
      'Automation cannot see labels, so manual testing is the only option.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Automated checks catch a slice of WCAG, mostly names, roles, and contrast. Keyboard order, focus traps, and screen-reader wording need a person.',
      why: 'eslint-plugin-jsx-a11y flags obvious JSX mistakes while you edit. axe-core, in a unit test or a Playwright scan, runs a page and reports rule violations such as a button without a name or an image without alt. Those rules are worth failing CI on, because they are repeatable. They do not click through the product. They will not tell you that focus never reaches the dialog, that Escape does not close it, or that the accessible name is confusing. A manual pass on the critical flows, with only the keyboard and with one screen reader, covers that gap. Snapshotting CSS class strings tests implementation, not the accessibility tree. Keep the automated gate small and strict, and do not treat a clean report as certification.',
      wrong: [
        {
          option: 'A green axe run proves the flow is operable by keyboard and understandable in a screen reader.',
          reason: 'The tool inspects the tree it was given. It does not complete the task the way a user does.',
        },
        {
          option: 'CI should snapshot class names, and that snapshot is an accessibility test.',
          reason: 'Class names are not the accessibility tree. A rename can fail the test while the widget stays broken.',
        },
        {
          option: 'Automation cannot see labels, so manual testing is the only option.',
          reason: 'Missing names are exactly what the automated rules see well. Manual testing covers what they cannot operate.',
        },
      ],
      example: { lang: 'js', source: "import AxeBuilder from '@axe-core/playwright';\nconst results = await new AxeBuilder({ page }).analyze();\nif (results.violations.length) throw new Error('axe violations');" },
      remember: 'Fail CI on axe and lint findings. Still tab through the real flow and listen to it.',
    },
  },
  {
    id: 'js-163',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How do logs, metrics, traces, and RUM differ for a frontend?',
    options: [
      'Logs are events, metrics are aggregated numbers, traces follow one request across hops, and RUM is what real browsers experienced.',
      'RUM replaces traces, and metrics are the raw console output from one session.',
      'A trace is a p75 of LCP. A log is a distributed timing graph.',
      'All four names mean the same beacon, so one endpoint is the whole design.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Logs record discrete events, metrics are numbers you can alert on, traces connect spans of one operation, and RUM measures real users.',
      why: 'A frontend log might be "checkout failed" with a release and a route. It should not contain tokens, names, or full card numbers. A metric is a counter, gauge, or histogram, such as API error rate or INP. Alerts belong on metrics, not on a string search of logs. A trace starts at the click or the server request and carries a trace id through each span, including the API call, so you can see which hop was slow. RUM is field data: vitals, resource timing, and errors from actual browsers, as opposed to a lab run. You join them with the release, route, and trace id. Shipping every console line from every user is expensive and risky. Sample high-volume logs, keep metrics aggregated, and trace a sample of requests plus the failures.',
      wrong: [
        {
          option: 'RUM replaces traces, and metrics are the raw console output from one session.',
          reason: 'RUM is the field aggregate. A trace is one correlated operation. Console lines are closer to logs.',
        },
        {
          option: 'A trace is a p75 of LCP. A log is a distributed timing graph.',
          reason: 'Those are swapped. The percentile is a metric. The graph of spans is a trace.',
        },
        {
          option: 'All four names mean the same beacon, so one endpoint is the whole design.',
          reason: 'They answer different questions and have different volumes. One pipe without a schema collapses them.',
        },
      ],
      example: { lang: 'js', source: "function report(error, traceId) {\n  navigator.sendBeacon('/rum', JSON.stringify({\n    release, route: location.pathname, traceId, name: error.name,\n  }));\n}" },
      remember: 'Logs explain an event, metrics alert, traces follow one request, and RUM is the field.',
    },
  },
  {
    id: 'js-164',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When should a route chunk be prefetched?',
    options: [
      'Prefetch a chunk the user is likely to need next, such as on hover or when a link is visible, and skip it on a constrained network.',
      'Prefetch every route in the app as soon as the first page loads.',
      'Prefetch replaces code splitting, so the main bundle should contain every route as well.',
      'A prefetch must block the current route\'s first paint until it finishes.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Prefetch downloads a split chunk before navigation when the chance of using it is high and the network can spare the bytes.',
      why: 'Code splitting makes the current route smaller and makes the next route wait for a download. Prefetch starts that download during idle time. Good triggers are a link in the viewport, a hover or focus, or the next step in a wizard you know is likely. A low-priority fetch, or the browser\'s link rel=prefetch, keeps it from competing with the hero and the current script. Save-Data, a slow connection, or a metered network is a reason to skip. Prefetching the entire site on startup recreates the large download splitting was meant to avoid, just later in the same visit. The chunk should still be cached with a hash so a repeat visit does not download it again. Prefetch is a hint. The navigation must still work if it has not finished.',
      wrong: [
        {
          option: 'Prefetch every route in the app as soon as the first page loads.',
          reason: 'That spends the user\'s bandwidth on screens they may never open and competes with the current page.',
        },
        {
          option: 'Prefetch replaces code splitting, so the main bundle should contain every route as well.',
          reason: 'Prefetch depends on a split. Putting the route in the main bundle means there is nothing left to prefetch.',
        },
        {
          option: 'A prefetch must block the current route\'s first paint until it finishes.',
          reason: 'It is speculative and low priority. The current route should paint without waiting for it.',
        },
      ],
      example: { lang: 'js', source: "link.addEventListener('mouseenter', () => {\n  if (navigator.connection?.saveData) return;\n  import('./settings.js');\n}, { once: true });" },
      remember: 'Prefetch the likely next chunk at low priority. Do not download the whole app just in case.',
    },
  },
  {
    id: 'js-165',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When is WebAssembly a good fit in a frontend?',
    options: [
      'Use it for a hot numeric or parsing workload you can isolate. JavaScript still owns the DOM, and the module has a download and startup cost.',
      'Use it for every component render, because it can update the DOM faster than JavaScript.',
      'WebAssembly can import the document object and replace React without a glue layer.',
      'It is always smaller and faster than the equivalent JavaScript, including tiny helpers.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'WebAssembly speeds CPU-heavy modules such as codecs, image filters, and parsers. The page, the DOM, and most UI logic stay in JavaScript.',
      why: 'A .wasm module is a compiled binary with predictable numeric performance and a linear memory. JavaScript loads it, instantiates it, and calls exports. Crossing the boundary has a cost, and strings and objects need an explicit copy or a shared buffer. The module cannot touch the DOM. The browser UI remains JavaScript that calls into the module and writes the result back. Startup includes the download, compile, and instantiate time, so a tiny function is slower end to end than staying in JavaScript. Good fits are codecs, PDF or image processing, games, and a library you already have in C, C++, or Rust. Threading needs SharedArrayBuffer and cross-origin isolation. Ship it when a profile shows a hot loop, not as a default for ordinary interface code.',
      wrong: [
        {
          option: 'Use it for every component render, because it can update the DOM faster than JavaScript.',
          reason: 'It cannot update the DOM. The boundary cost would also dominate a small render.',
        },
        {
          option: 'WebAssembly can import the document object and replace React without a glue layer.',
          reason: 'There is no direct DOM access. A JavaScript glue layer is required for the page.',
        },
        {
          option: 'It is always smaller and faster than the equivalent JavaScript, including tiny helpers.',
          reason: 'The binary, the compile, and the calls can outweigh a small JavaScript function.',
        },
      ],
      example: { lang: 'js', source: "const { instance } = await WebAssembly.instantiateStreaming(fetch('/blur.wasm'));\nconst pixels = instance.exports.blur(width, height);" },
      remember: 'WebAssembly is for heavy computation beside JavaScript. It does not take over the DOM.',
    },
  },
];
