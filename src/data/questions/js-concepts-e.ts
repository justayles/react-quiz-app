import type { Question } from '../types';

export const jsConceptsE: Question[] = [
  {
    id: 'js-136',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is a source map used for, and what is the risk of publishing it?',
    options: [
      'It maps a minified line back to the original file so DevTools can show your source. A public map can reveal that source.',
      'It compresses the bundle a second time and hides the API from the network panel.',
      'It is required for the browser to run minified code, and hiding it breaks the page.',
      'It stores user session recordings and should be cached with no-store.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A source map lets DevTools translate generated code back to the original files. Serving it publicly exposes those files.',
      why: 'Minifiers rename variables and collapse lines, so a stack trace points at a useless column. The map records the mapping, and the bundle can refer to it with a sourceMappingURL comment. DevTools fetch the map and show the original TypeScript or JSX. The running code does not need the map, so production still works if the map is missing. The risk is that the map often contains original sources and names. Anyone who can download it can read them. Prefer uploading maps to an error tracker, or protecting the URL, when the source is sensitive. Hide the comment from the public bundle if the map is not meant to be public. Maps do not fix a bug. They only make the stack readable.',
      wrong: [
        {
          option: 'It compresses the bundle a second time and hides the API from the network panel.',
          reason: 'The map is a sidecar for debugging. It does not compress the program or hide requests.',
        },
        {
          option: 'It is required for the browser to run minified code, and hiding it breaks the page.',
          reason: 'The browser executes the generated file. The map is optional developer metadata.',
        },
        {
          option: 'It stores user session recordings and should be cached with no-store.',
          reason: 'It contains build output, not user sessions. Caching policy is not its purpose.',
        },
      ],
      example: { lang: 'js', source: "function fail() {\n  throw new Error('save failed');\n}\n//# sourceMappingURL=app.js.map" },
      remember: 'Source maps restore original stacks. Do not publish them if the source is sensitive.',
    },
  },
  {
    id: 'js-137',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do custom elements and Shadow DOM each provide?',
    options: [
      'A custom element is your tag with a class. Shadow DOM gives that tag a separate tree and style scope, with slots for light-DOM children.',
      'Shadow DOM replaces JavaScript events. Custom elements run only on the server.',
      'A closed shadow root is a security boundary against XSS in the main document.',
      'Custom elements cannot be used without a framework runtime.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'customElements.define registers a class for a tag. A shadow root encapsulates its markup and CSS, and slots project the children the caller wrote.',
      why: 'A custom element extends HTMLElement. connectedCallback runs when it is added to the document, and observedAttributes plus attributeChangedCallback react to attribute edits. The tag name must contain a hyphen. Shadow DOM attaches an internal tree. Styles in the shadow root do not leak out, and page styles do not reach in except for inherited properties and CSS variables. The children in the light DOM are not moved. A slot chooses where they appear. mode: "open" lets page script reach shadowRoot. mode: "closed" only hides that reference, and it is not a security boundary. Events from shadow nodes are retargeted when they cross the boundary. These primitives are how a design system ships a widget that does not depend on one framework\'s render loop.',
      wrong: [
        {
          option: 'Shadow DOM replaces JavaScript events. Custom elements run only on the server.',
          reason: 'Events still fire, with retargeting at the boundary. The element class runs in the browser.',
        },
        {
          option: 'A closed shadow root is a security boundary against XSS in the main document.',
          reason: 'Closed mode hides shadowRoot. It does not stop script that already runs in the page.',
        },
        {
          option: 'Custom elements cannot be used without a framework runtime.',
          reason: 'They are a browser API. A framework can wrap them, and it is not required.',
        },
      ],
      example: { lang: 'js', source: "class UserCard extends HTMLElement {\n  connectedCallback() {\n    const root = this.attachShadow({ mode: 'open' });\n    root.innerHTML = '<style>:host{display:block}</style><slot></slot>';\n  }\n}\ncustomElements.define('user-card', UserCard);" },
      remember: 'Custom elements define a tag. Shadow DOM encapsulates its tree and styles.',
    },
  },
  {
    id: 'js-138',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is the main trade-off of microfrontends?',
    options: [
      'Teams can ship their slice independently, and you pay with duplicated dependencies, inconsistent UX, and harder shared state.',
      'They remove the need for a design system and make one bundle smaller in every case.',
      'They are only an iframe technique, and build-time composition is not a microfrontend.',
      'Independent deploy means a shared global variable is always safe.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Microfrontends split the UI by team and release. The cost is alignment: dependencies, design, routing, and data do not stay consistent by accident.',
      why: 'A microfrontend is a slice of the product that a team can build and deploy without releasing the whole site. Integration can happen at build time by composing packages, at runtime by loading remotes, or by embedding an iframe. Runtime integration gives the strongest independence and the sharpest failures: two versions of a framework, a navigation that fights the shell, and CSS that leaks. iframes isolate faults and styles, and they make height, focus, and accessibility harder. A shared design system and a thin shell for auth and routing are what keep the product feeling like one app. Shared mutable globals are a coupling disguised as integration. Choose this split when team release speed matters more than the operational cost.',
      wrong: [
        {
          option: 'They remove the need for a design system and make one bundle smaller in every case.',
          reason: 'A design system matters more, not less. Runtime copies of a framework can make the total download larger.',
        },
        {
          option: 'They are only an iframe technique, and build-time composition is not a microfrontend.',
          reason: 'iframes are one integration option. Package composition at build time is another, with a coupled release.',
        },
        {
          option: 'Independent deploy means a shared global variable is always safe.',
          reason: 'A global couples the slices at runtime and breaks when two versions disagree.',
        },
      ],
      example: { lang: 'js', source: "const remote = await import('catalog/ProductList');\nconst list = document.querySelector('#catalog');\nremote.mount(list, { sku: '10' });" },
      remember: 'Independent slices need a shared shell and design system, or the UX fragments.',
    },
  },
  {
    id: 'js-139',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does it mean to normalize client state?',
    options: [
      'Store each entity once, keyed by id, and keep relationships as ids. Selectors build the nested view the screen needs.',
      'Nest every related object inside every list so each screen has a private copy.',
      'Normalization encrypts the store and removes the need for selectors.',
      'It means converting all dates to strings before any component reads state.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Normalized state keeps one record per entity and uses ids for relationships. Screens select and join those records.',
      why: 'A nested copy of a product inside every cart, list, and detail view drifts apart when one of them is updated. Normalization stores productsById and a cart that holds product ids. An update writes the product once. A selector derives the cart lines the view should render, and memoization can skip that work when the inputs are unchanged. Lists store ids in order rather than embedding the records. The cost is indirection and selector code. It pays off when the same entity appears in many places. A small form\'s local state does not need this treatment. Server caches that key by request, rather than by entity, are a different choice and can duplicate an entity across responses.',
      wrong: [
        {
          option: 'Nest every related object inside every list so each screen has a private copy.',
          reason: 'That is the duplication normalization removes. Private copies are what drift.',
        },
        {
          option: 'Normalization encrypts the store and removes the need for selectors.',
          reason: 'It is a shape for data. Selectors are how views read that shape.',
        },
        {
          option: 'It means converting all dates to strings before any component reads state.',
          reason: 'Date formatting is a display concern. Normalization is about entity identity.',
        },
      ],
      example: { lang: 'js', source: "const state = {\n  products: { 10: { id: '10', name: 'Lamp' } },\n  cartIds: ['10'],\n};\nconst lines = state.cartIds.map((id) => state.products[id]);" },
      remember: 'Keep one record per id. Store relationships as ids and derive the view.',
    },
  },
  {
    id: 'js-140',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What has to be true for a client feature flag or A/B test to be trustworthy?',
    options: [
      'The visitor must keep a stable assignment, the first paint must not flash the other variant, and a cached page must not mix variants.',
      'Assign the variant at random on every render so the sample stays unbiased.',
      'Store the only copy of the decision in a closure so the server cannot tell which variant ran.',
      'Flags should be permanent branches and should change the API response shape without a version.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A visitor needs one stable variant, no flash of the other UI, and a cache key that does not serve the wrong variant.',
      why: 'A feature flag turns a path on for a percentage, a tenant, or a kill switch. An A/B test also needs a measurement. If the client rolls again on every load, the same person sees both variants and the result is noise. Assignment belongs in a stable id, decided as early as possible. Rendering the default and then swapping after a network call causes a flash and a layout shift. On a server-rendered or CDN-cached page, the variant has to be part of the cache key or the HTML has to be chosen after the cache. Flags should be removable. A permanent branch is an untested fork. Do not let a flag change a data contract silently. Log the assignment with the metric so the analysis can join them.',
      wrong: [
        {
          option: 'Assign the variant at random on every render so the sample stays unbiased.',
          reason: 'Reassignment contaminates the sample. Stability is what makes the comparison valid.',
        },
        {
          option: 'Store the only copy of the decision in a closure so the server cannot tell which variant ran.',
          reason: 'The analysis needs the assignment. Hiding it from the server removes the experiment.',
        },
        {
          option: 'Flags should be permanent branches and should change the API response shape without a version.',
          reason: 'Permanent flags rot. Changing a payload without a contract breaks the other variant.',
        },
      ],
      example: { lang: 'js', source: "function variant(userId) {\n  return Number(userId) % 2 === 0 ? 'control' : 'treatment';\n}" },
      remember: 'Keep the assignment stable, render it before paint, and do not cache variants together.',
    },
  },
  {
    id: 'js-141',
    tech: 'javascript',
    topic: 'async',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is backpressure in an asynchronous stream of data?',
    options: [
      'The consumer signals that it cannot accept more yet, so the producer pauses instead of buffering without a bound.',
      'The producer drops the consumer and starts a second thread automatically.',
      'Backpressure means retrying a failed HTTP request with a longer timeout.',
      'It is the browser event where CSS blocks HTML, and streams do not use it.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Backpressure is the consumer telling the producer to slow down so an unbounded buffer does not grow.',
      why: 'A websocket, file stream, or cursor can produce faster than the UI can render or the database can write. If the code pushes every chunk into an array, memory grows without a limit. Streams express this with a readable that is pulled, or with a writable whose write returns false when the buffer is past its high-water mark. The producer then waits for a drain before writing more. In a UI, the matching pattern is to fetch the next page only when the current page is committed, or to ignore incoming events until the render catches up. Lossy backpressure drops intermediate values and keeps the latest, which fits a pointer position and not a payment ledger. An async generator applies backpressure naturally because it yields the next item only when the consumer calls next.',
      wrong: [
        {
          option: 'The producer drops the consumer and starts a second thread automatically.',
          reason: 'Backpressure coordinates the two sides. It does not spawn a thread or abandon the consumer.',
        },
        {
          option: 'Backpressure means retrying a failed HTTP request with a longer timeout.',
          reason: 'That is retry policy. Backpressure is about the rate of successful data, not about failures.',
        },
        {
          option: 'It is the browser event where CSS blocks HTML, and streams do not use it.',
          reason: 'Render-blocking CSS is a different bottleneck. Streams have an explicit pause and resume.',
        },
      ],
      example: { lang: 'js', source: "const reader = stream.getReader();\nconst { value, done } = await reader.read();\nif (done) reader.releaseLock();" },
      remember: 'A fast producer must pause or drop work when the consumer is behind.',
    },
  },
  {
    id: 'js-142',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When is it safe for a frontend to retry a failed API call?',
    options: [
      'Retry an idempotent call, or a non-idempotent call that sends an idempotency key, after a network failure or a 429 or 5xx. Do not blind-retry a 400.',
      'Retry every POST immediately and without a key, because the server ignores duplicates.',
      'Retry a 401 in a loop and never retry a timeout, because the first request did not arrive.',
      'A GET is unsafe to retry, and a payment POST is always safe.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Retry when repeating the same request cannot apply the action twice, or when an idempotency key lets the server recognize the repeat.',
      why: 'Idempotent means one call and several identical calls leave the server in the same state. GET, PUT of a full representation, and DELETE are the usual examples. A payment POST is not. A timeout is ambiguous: the request may have succeeded and the response was lost. Retrying it without a key can charge twice. An idempotency key lets the server return the original result for a repeat. Retry network errors, 408, 429, and 502, 503, or 504. Honor Retry-After. Do not retry a 400 or 422, because the same body will fail again. Use exponential backoff with jitter so every client does not reconnect in the same millisecond. Disable the submit button or share an in-flight promise so a double click is not a second request.',
      wrong: [
        {
          option: 'Retry every POST immediately and without a key, because the server ignores duplicates.',
          reason: 'A POST can create a second resource. The server only ignores the duplicate if you gave it a way to recognize it.',
        },
        {
          option: 'Retry a 401 in a loop and never retry a timeout, because the first request did not arrive.',
          reason: '401 needs a new credential, not a tight loop. A timeout may have succeeded, so a retry needs an idempotency story.',
        },
        {
          option: 'A GET is unsafe to retry, and a payment POST is always safe.',
          reason: 'Those are reversed. GET is the safe retry, and a payment is the dangerous one.',
        },
      ],
      example: { lang: 'js', source: "await fetch('/api/payments', {\n  method: 'POST',\n  headers: { 'Idempotency-Key': key, 'Content-Type': 'application/json' },\n  body: JSON.stringify(payment),\n});" },
      remember: 'Retry idempotent calls and keyed commands. Do not replay a failed validation.',
    },
  },
  {
    id: 'js-143',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is a long task, and how do you keep it from blocking input?',
    options: [
      'A task over about 50 ms blocks the main thread. Split the work and yield so the browser can paint and handle input between chunks.',
      'Long tasks run on the GPU, so they improve INP and need no change.',
      'A task is long only when it exceeds 10 seconds, and setTimeout cannot create a yield point.',
      'Moving the work into a microtask loop yields to painting after every item.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A long task monopolizes the main thread for about 50 ms or more. Break it up and return to the event loop so input and paint can run.',
      why: 'The browser cannot handle a click or paint a frame while your JavaScript occupies the stack. The Long Tasks API and PerformanceObserver report tasks past the 50 ms threshold, and they show up as long yellow blocks in the performance panel. INP suffers when the long task sits between the input and the next paint. The fix is to process a bounded chunk, then yield. scheduler.yield, scheduler.postTask, or a setTimeout of 0 schedules the continuation as later work. A promise microtask does not yield to rendering or input, because microtasks drain before the browser moves on. A worker is the alternative when the chunk itself is too heavy to run on the main thread at all. Yielding makes the total CPU time a bit worse and the responsiveness much better.',
      wrong: [
        {
          option: 'Long tasks run on the GPU, so they improve INP and need no change.',
          reason: 'A long task is main-thread JavaScript. It delays the frame that INP is waiting for.',
        },
        {
          option: 'A task is long only when it exceeds 10 seconds, and setTimeout cannot create a yield point.',
          reason: 'The usual threshold is 50 ms. A timer callback is a later task, which is a yield.',
        },
        {
          option: 'Moving the work into a microtask loop yields to painting after every item.',
          reason: 'Microtasks run before the browser paints. They do not create a gap for input.',
        },
      ],
      example: { lang: 'js', source: "async function processAll(items) {\n  for (let i = 0; i < items.length; i += 100) {\n    items.slice(i, i + 100).forEach(handle);\n    await scheduler.yield();\n  }\n}" },
      remember: 'Tasks over 50 ms block input. Yield between chunks, not with microtasks.',
    },
  },
  {
    id: 'js-144',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which image pipeline helps LCP and CLS together?',
    options: [
      'Serve a sized modern format, reserve width and height, lazy-load below the fold, and prioritize the hero.',
      'Lazy-load the hero, omit width and height, and ship the original PNG to every viewport.',
      'Inline every image as a separate base64 file so the layout cannot move.',
      'Wait until after hydration to set src, and use one 4000 px JPEG for thumbnails.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The hero should be discovered early and given a reserved box. Other images can wait, be smaller, and use a modern format.',
      why: 'LCP is often the hero image. It should be in the initial HTML, with fetchpriority="high" or a preload, and it should not be lazy. A CDN can negotiate AVIF or WebP, and srcset plus sizes lets a phone skip the desktop file. CLS drops when the browser knows the box before the bytes arrive, through width and height or an aspect-ratio. Lazy loading belongs on images outside the first viewport. Decoding a huge image on the main thread also hurts responsiveness, so the displayed size should be close to the natural size. Base64 in the HTML competes with the document itself and caches poorly. Adding the hero src only after hydration delays the request until JavaScript runs.',
      wrong: [
        {
          option: 'Lazy-load the hero, omit width and height, and ship the original PNG to every viewport.',
          reason: 'That delays LCP, shifts the layout, and sends more bytes than the screen needs.',
        },
        {
          option: 'Inline every image as a separate base64 file so the layout cannot move.',
          reason: 'Inlining bloats HTML and still needs a reserved box. It is not a caching strategy.',
        },
        {
          option: 'Wait until after hydration to set src, and use one 4000 px JPEG for thumbnails.',
          reason: 'The request starts too late, and the file is far larger than a thumbnail needs.',
        },
      ],
      example: { lang: 'js', source: "const img = document.createElement('img');\nimg.src = '/hero.avif';\nimg.width = 1200;\nimg.height = 800;\nimg.fetchPriority = 'high';\nimg.alt = 'Lamp on a table';" },
      remember: 'Prioritize a sized hero. Lazy-load the rest in a modern format.',
    },
  },
  {
    id: 'js-145',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How do CSP nonces and hashes allow a script without opening unsafe-inline?',
    options: [
      'A nonce is a per-response random value on the policy and the script tag. A hash allowlists one exact inline script. Both avoid a blanket unsafe-inline.',
      'A nonce is a permanent site-wide password placed in localStorage. A hash disables CSP.',
      'unsafe-inline is required for a nonce to work, and hashes apply only to images.',
      'One nonce can be reused for the whole deploy so a cached HTML page stays valid.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A matching nonce or a matching hash lets one script run. unsafe-inline would let injected script run too, so the tighter allowlist replaces it.',
      why: 'script-src \'self\' blocks inline scripts, which is good against XSS and awkward for a legitimate inline bootstrap. A nonce is a random value generated for that response. The policy says script-src \'nonce-abc\', and the script tag carries the same nonce attribute. An attacker who injects a tag does not know the next response\'s nonce. A hash is sha256, sha384, or sha512 of the exact script bytes, so it fits a static inline script and needs no per-request token. strict-dynamic trusts scripts loaded by a nonce-trusted script, which tames bundlers that inject loaders. A nonce cached inside HTML and reused is no longer secret. The policy has to be on the document response. Hashes break if a formatter changes one character of the inline script.',
      wrong: [
        {
          option: 'A nonce is a permanent site-wide password placed in localStorage. A hash disables CSP.',
          reason: 'A nonce must be unpredictable per response. A hash is part of the allowlist, not a way to turn the policy off.',
        },
        {
          option: 'unsafe-inline is required for a nonce to work, and hashes apply only to images.',
          reason: 'The nonce or hash replaces unsafe-inline for scripts. Image policy is a different directive.',
        },
        {
          option: 'One nonce can be reused for the whole deploy so a cached HTML page stays valid.',
          reason: 'A reused nonce is guessable and becomes as weak as allowing that inline slot forever.',
        },
      ],
      example: { lang: 'js', source: "res.setHeader('Content-Security-Policy', `script-src 'nonce-${nonce}' 'strict-dynamic'`);\nres.send(`<script nonce=\"${nonce}\">start()</script>`);" },
      remember: 'A per-response nonce or an exact hash allowlists a script without unsafe-inline.',
    },
  },
  {
    id: 'js-146',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is server-driven UI, and where does it hurt?',
    options: [
      'The server sends a UI description and the client renders it with a known component map. It slows iteration on native releases and limits interactions the schema forgot.',
      'The server sends executable JavaScript for every pixel, so the client needs no component map.',
      'It removes versioning, offline gaps, and security questions because the payload is JSON.',
      'It is the same as server-side rendering of HTML, with no client interpreter.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Server-driven UI sends a document that names components and props. The client owns the renderer. Flexibility stops at the components and actions that build already contains.',
      why: 'Instead of shipping a new screen in a mobile release, the server sends JSON such as a stack of known components and the actions they emit. The client maps each type to a local component. Product copy, order, and which block appears can change without an app-store release. The client build still defines the vocabulary. A new gesture or a new component needs a release. The schema needs a version because old binaries stay in the field. Unknown types need a fallback. The payload is data, and turning it into code with eval reintroduces XSS. Offline use needs a cached document. It is not the same as sending finished HTML: a web SSR response is the UI, while server-driven UI is a description a native and a web client can both interpret.',
      wrong: [
        {
          option: 'The server sends executable JavaScript for every pixel, so the client needs no component map.',
          reason: 'The payload should be data interpreted by known components. Executable payloads are an XSS risk.',
        },
        {
          option: 'It removes versioning, offline gaps, and security questions because the payload is JSON.',
          reason: 'Old clients, empty caches, and hostile JSON are the ongoing costs.',
        },
        {
          option: 'It is the same as server-side rendering of HTML, with no client interpreter.',
          reason: 'SSR sends HTML. Server-driven UI sends a structure the client maps onto its own components.',
        },
      ],
      example: { lang: 'js', source: "const registry = { banner: Banner, product: ProductCard };\nfunction render(node) {\n  const View = registry[node.type];\n  return View ? View(node.props) : null;\n}" },
      remember: 'The server chooses known components. New behavior still needs a client release.',
    },
  },
  {
    id: 'js-147',
    tech: 'javascript',
    topic: 'patterns',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is the trade-off of immutable data in a UI?',
    options: [
      'A new reference makes change detection and undo simple, and it allocates more than an in-place edit.',
      'Immutable updates are always faster than mutation and make === useless.',
      'Structural sharing copies every nested object on each keystroke.',
      'Mutation is required for React to see a state change.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Immutability makes "did this change?" a reference check and preserves old snapshots. The cost is allocation and more awkward nested edits.',
      why: 'UI frameworks skip work when props or state are the same reference. An immutable update produces a new parent and reuses the unchanged children. That reuse is structural sharing, and a persistent tree or a library such as Immer can do it without a hand-written copy at every level. Undo keeps the previous reference. The price is garbage: a burst of typing allocates a burst of objects, and a naive deep copy of a large state is slower and larger than a mutation. Mutation is faster in a local algorithm and then forces every subscriber to assume the value changed, or to deep-compare. A defensible split is to mutate inside one function that has the only reference, and to publish a new reference when the value crosses a framework boundary.',
      wrong: [
        {
          option: 'Immutable updates are always faster than mutation and make === useless.',
          reason: 'They allocate more. === is useful because a new reference is the change signal.',
        },
        {
          option: 'Structural sharing copies every nested object on each keystroke.',
          reason: 'Sharing reuses the nested objects that did not change. A full copy is the naive version.',
        },
        {
          option: 'Mutation is required for React to see a state change.',
          reason: 'React sees a new state value. Mutating the old object is a way to hide the change.',
        },
      ],
      example: { lang: 'js', source: "const next = { ...state, items: state.items.map((item) => item.id === id ? { ...item, done: true } : item) };" },
      remember: 'New references make updates visible and snapshots cheap to keep. They allocate.',
    },
  },
  {
    id: 'js-148',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What holds a design system together as it scales?',
    options: [
      'Tokens for color, type, and space, themed through those tokens, and small accessible components that apps compose.',
      'Each app copies the CSS it needs and names colors in component files.',
      'One large component with a mode prop for every screen in the product.',
      'Tokens are optional if every component reads a global stylesheet class.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Tokens are the source of truth for visual decisions. Components stay small and accessible, and apps compose them instead of restyling from scratch.',
      why: 'A token is a named decision such as color.bg.default or space.200. Themes swap token values, including a dark theme, without rewriting components. Components consume tokens rather than raw hex values, so a brand change is a token change. Primitives own keyboard behavior, focus, labels, and contrast. Recipes and patterns compose primitives into a dialog or a form row. An app that reaches into private CSS recreates the drift the system exists to prevent. Version the package, document breaking changes, and prefer composition over a prop for every variation. A single mega-component becomes a second product. The system fails when teams cannot find a component and invent a near-duplicate.',
      wrong: [
        {
          option: 'Each app copies the CSS it needs and names colors in component files.',
          reason: 'Copies diverge. Named tokens exist so a decision has one definition.',
        },
        {
          option: 'One large component with a mode prop for every screen in the product.',
          reason: 'That component becomes untestable. Composition of small pieces is what scales.',
        },
        {
          option: 'Tokens are optional if every component reads a global stylesheet class.',
          reason: 'A shared stylesheet without tokens still hard-codes decisions in selectors and invites overrides.',
        },
      ],
      example: { lang: 'js', source: "const theme = { color: { bg: { default: '#fff', inverse: '#111' } } };\ndocument.documentElement.style.setProperty('--bg', theme.color.bg.default);" },
      remember: 'Tokens decide the visuals. Small accessible components are composed, not copied.',
    },
  },
  {
    id: 'js-149',
    tech: 'javascript',
    topic: 'architecture',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How should you choose among module federation, iframes, and build-time integration?',
    options: [
      'Federation deploys remotes independently and risks version skew. iframes isolate strongly. Build-time composition is simple and ships together.',
      'iframes share memory and styles. Federation freezes every remote until the shell rebuilds.',
      'Build-time integration is the only option that can load a remote URL at runtime.',
      'All three isolate CSS completely and all three share one React copy by default.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Pick federation for independent runtime deploys, iframes for hard isolation, and build-time packages when one release train is acceptable.',
      why: 'Module federation lets a shell load a remote container that was built and deployed separately. Teams move faster, and they can accidentally ship incompatible shared libraries, duplicate React, or a remote the shell does not understand yet. You need a contract, a fallback when the remote is down, and a policy for shared dependency versions. An iframe has a separate document, so CSS and script faults stay inside, and so do focus, sizing, and screen-reader flow unless you build bridges. Build-time integration imports a package and resolves everything in one build. It is the easiest to test and the least independent. The choice is about failure domain and release cadence, not about which one is newer.',
      wrong: [
        {
          option: 'iframes share memory and styles. Federation freezes every remote until the shell rebuilds.',
          reason: 'iframes do not share the page\'s document. Federation\'s point is that a remote can ship without a shell rebuild.',
        },
        {
          option: 'Build-time integration is the only option that can load a remote URL at runtime.',
          reason: 'Build-time resolves during the build. Runtime loading is federation or a plain dynamic import of a URL.',
        },
        {
          option: 'All three isolate CSS completely and all three share one React copy by default.',
          reason: 'Only the iframe isolates CSS for free. Federation shares a library only when you configure the share.',
        },
      ],
      example: { lang: 'js', source: "const remote = await import('https://catalog.example/remoteEntry.js');\nconst factory = await remote.get('./ProductList');\nconst { mount } = factory();" },
      remember: 'Federation is independent and risky. iframes isolate. Build-time composition stays consistent.',
    },
  },
  {
    id: 'js-150',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Why is evaluating client-side code from a string dangerous?',
    options: [
      'eval, new Function, and setTimeout with a string run that string as script in your origin, and a CSP cannot allow them without weakening XSS defense.',
      'eval is sandboxed to a worker, so user input inside it cannot touch the page.',
      'new Function is safe when the string is built by concatenating a user name into source.',
      'A bundler removes eval before it can run, so production builds make the call a no-op.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A string passed to eval or new Function becomes code with the page\'s privileges. Allowing it in CSP also allows injected script.',
      why: 'The page origin can read the DOM and call your APIs. eval(userInput) gives an attacker that power as soon as they control the string. Concatenation is enough. They do not need a full script tag. setTimeout("code") and setInterval("code") are the same hole. new Function is a form of eval. These calls also prevent a tight CSP, because the policy needs unsafe-eval to let them run, and that permission applies to attacker script too. Bundlers do not delete a runtime eval. Some bundlers cannot tree-shake past it. If you need user-defined behavior, interpret a data format or a restricted expression language that cannot reach the global object. Never repair a bug by evaluating a server-supplied patch into the page.',
      wrong: [
        {
          option: 'eval is sandboxed to a worker, so user input inside it cannot touch the page.',
          reason: 'eval runs where you call it. On the page, it can touch the page.',
        },
        {
          option: 'new Function is safe when the string is built by concatenating a user name into source.',
          reason: 'The user name can close the string and add statements. Concatenation is the bug.',
        },
        {
          option: 'A bundler removes eval before it can run, so production builds make the call a no-op.',
          reason: 'The call remains at runtime. A bundler may even refuse to optimize the surrounding module.',
        },
      ],
      example: { lang: 'js', source: "const allowed = { red: '#c00', blue: '#04a' };\nfunction color(name) {\n  return allowed[name] ?? '#111';\n}" },
      remember: 'Do not eval strings. Interpret data, and keep unsafe-eval out of CSP.',
    },
  },
];
