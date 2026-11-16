import type { Question } from '../types';

export const jsConceptsD: Question[] = [
  {
    id: 'js-120',
    tech: 'javascript',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How does JavaScript garbage collection decide that memory can be freed?',
    options: [
      'An object is collected when it cannot be reached from roots such as the stack and globals. Modern engines split young objects from old ones.',
      'An object is collected when its reference count hits one, and cycles are freed immediately by that count.',
      'The collector frees every object at the end of the function that created it, including returned objects.',
      'Garbage collection runs only when you call global.gc, and unused closures stay allocated until then.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Collection is based on reachability from roots. Engines such as V8 collect short-lived objects more often than objects that have survived.',
      why: 'Roots include the running stack, global objects, and handles held by the host. Anything those can still reach stays. A reference-counting scheme sounds similar, but a cycle of objects that point at each other would never hit zero, so engines use tracing: mark what is reachable, then sweep the rest. V8 uses generations. New allocations go in a young space that is scavenged often, because most objects die quickly. Objects that survive are promoted to the old space, which is marked and compacted less often and can be scanned incrementally so the pause is shorter. A closure keeps its environment reachable. A detached DOM node stays alive if JavaScript still holds it. You do not free objects manually, and global.gc is not part of the language.',
      wrong: [
        {
          option: 'An object is collected when its reference count hits one, and cycles are freed immediately by that count.',
          reason: 'Counting alone leaks cycles. Tracing from roots is what finds those islands, and a live object can have many references.',
        },
        {
          option: 'The collector frees every object at the end of the function that created it, including returned objects.',
          reason: 'A returned object, or one stored on a global, is still reachable. Scope exit only drops the locals that nothing else captured.',
        },
        {
          option: 'Garbage collection runs only when you call global.gc, and unused closures stay allocated until then.',
          reason: 'The engine schedules collection itself. global.gc is an optional embedder hook, not application API.',
        },
      ],
      example: { lang: 'js', source: "function leak() {\n  const huge = new Uint8Array(1_000_000);\n  return () => huge[0];\n}\nlet keep = leak();\nkeep = null;" },
      remember: 'Unreachable objects are collected. Closures and globals keep objects alive.',
    },
  },
  {
    id: 'js-121',
    tech: 'javascript',
    topic: 'modules',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'How do bundling, code splitting, and dynamic import fit together?',
    options: [
      'A bundler builds a graph, emits one or more files, and can put a dynamic import() in its own chunk that loads when the call runs.',
      'Code splitting runs in the browser by deleting unused functions after parse. The bundler only minifies.',
      'A dynamic import always inlines the module into the main bundle and loads it synchronously.',
      'Bundling replaces HTTP caching, so split chunks should be avoided on every app.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Bundling resolves modules into files the browser can load. Splitting emits extra chunks, and import() is the point where a chunk loads on demand.',
      why: 'A bundler starts at the entry, follows static imports, rewrites modules so browsers do not need your source layout, and usually minifies the result. One large bundle delays the first interaction. Code splitting emits additional chunks. A static split might be a shared vendor file. A dynamic import() is a call the bundler can see, so it puts that module and its unique dependencies in a chunk the runtime fetches when the line executes. Route-based splitting loads a page\'s code on navigation. The module is still evaluated once and cached. If the specifier is a fully runtime string, the bundler may not know the chunk. Splitting does not remove the cost of a waterfall: the chunk request starts only when the call runs, unless you prefetch it.',
      wrong: [
        {
          option: 'Code splitting runs in the browser by deleting unused functions after parse. The bundler only minifies.',
          reason: 'Splitting is a build output. The browser downloads the chunks the build created.',
        },
        {
          option: 'A dynamic import always inlines the module into the main bundle and loads it synchronously.',
          reason: 'The call returns a promise, and a bundler that understands it emits a separate chunk.',
        },
        {
          option: 'Bundling replaces HTTP caching, so split chunks should be avoided on every app.',
          reason: 'Hashed chunk filenames cache well. Splitting is how unchanged code stays cached while one route changes.',
        },
      ],
      example: { lang: 'js', source: "const routes = {\n  async chart() {\n    const { Chart } = await import('./chart.js');\n    return Chart;\n  },\n};" },
      remember: 'import() is a split point. The bundler emits a chunk that loads when the call runs.',
    },
  },
  {
    id: 'js-122',
    tech: 'javascript',
    topic: 'runtime',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which pattern is a real frontend memory leak, and what removes it?',
    options: [
      'A detached node, timer, or subscription that JavaScript still references stays in memory. Drop the reference and cancel the subscription.',
      'Any object created inside a function leaks until reload, even after the function returns nothing.',
      'A leak only happens when the heap is larger than 1 MB, and the GC frees DOM nodes that listeners still use.',
      'Setting innerHTML to an empty string always frees every listener and child the page ever created.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'A leak is reachable memory you no longer need. Detached DOM, uncleared timers, and forgotten subscriptions are the usual frontend cases.',
      why: 'The collector cannot free an object that a closure, a global, a cache, or an event listener still holds. Removing a node from the document is not enough if your array still points at it, or if a listener on a parent closes over it. setInterval and a websocket callback keep their closures alive until you clear or close them. A Single Page App that adds window listeners on each visit grows without a bound. A Map used as a cache of DOM nodes keeps those nodes. A WeakMap does not. The fix is ownership: the code that subscribes also unsubscribes, an AbortController cancels listeners and fetches, and timers are cleared. Heap snapshots show the retaining path. A one-off object that nothing references is not a leak. It is ordinary garbage.',
      wrong: [
        {
          option: 'Any object created inside a function leaks until reload, even after the function returns nothing.',
          reason: 'Locals become unreachable when the call ends, unless a closure or an external store kept them.',
        },
        {
          option: 'A leak only happens when the heap is larger than 1 MB, and the GC frees DOM nodes that listeners still use.',
          reason: 'Size does not define a leak. A listener is a root that keeps the node alive.',
        },
        {
          option: 'Setting innerHTML to an empty string always frees every listener and child the page ever created.',
          reason: 'It drops those children only if nothing else references them. External arrays and window listeners still retain objects.',
        },
      ],
      example: { lang: 'js', source: "const controller = new AbortController();\nwindow.addEventListener('resize', onResize, { signal: controller.signal });\ncontroller.abort();" },
      remember: 'Cancel timers and subscriptions, and drop references to nodes you removed.',
    },
  },
  {
    id: 'js-123',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How does XSS succeed in a SPA, and what stops it?',
    options: [
      'Untrusted text reaches HTML, a URL, or eval and runs as script. Escape text, sanitize real HTML, and use a CSP.',
      'XSS is a server-only SQL problem. Frontend frameworks make innerHTML safe by default.',
      'A Content-Security-Policy is enough on its own, so escaping output is unnecessary.',
      'Storing HTML in a framework state array escapes it even if you later pass it to innerHTML.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'XSS runs an attacker\'s script in your origin. Treat untrusted data as text, sanitize HTML you must render, and restrict scripts with CSP.',
      why: 'The page\'s origin is the security boundary. Script that runs there can read the DOM, call your APIs, and often act as the user. Reflected XSS comes from the current request, stored XSS comes from saved content, and DOM XSS happens when client code writes a URL or message into HTML. innerHTML, insertAdjacentHTML, and React\'s dangerouslySetInnerHTML are the sinks. A javascript: URL and an inline event handler are sinks too. React and similar libraries escape text nodes, and that protection ends when you opt into raw HTML. Sanitizing with a maintained library is for the cases where markup is required. CSP limits which scripts the browser will execute, which reduces the damage of a missed escape. HttpOnly cookies are not readable by the injected script, but the script can still call your API while the user is logged in.',
      wrong: [
        {
          option: 'XSS is a server-only SQL problem. Frontend frameworks make innerHTML safe by default.',
          reason: 'SQL injection is a different bug. innerHTML is raw HTML, and framework escaping applies to text bindings.',
        },
        {
          option: 'A Content-Security-Policy is enough on its own, so escaping output is unnecessary.',
          reason: 'CSP is a second layer. A policy that allows unsafe inline, or a missed sink that is allowed, still leaves the bug.',
        },
        {
          option: 'Storing HTML in a framework state array escapes it even if you later pass it to innerHTML.',
          reason: 'State does not mark the string as safe. The sink that interprets HTML is what matters.',
        },
      ],
      example: { lang: 'js', source: "item.textContent = userInput;\nconst html = sanitize(trustedMarkup);\nitem.insertAdjacentHTML('beforeend', html);" },
      remember: 'Write untrusted data as text. Sanitize HTML, and back it with CSP.',
    },
  },
  {
    id: 'js-124',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is CSRF, and which SPA choices reduce it?',
    options: [
      'A foreign site triggers a request that includes the user\'s cookies. SameSite cookies, CSRF tokens, or a header the browser will not add automatically all reduce it.',
      'CSRF steals the response of a cross-origin JSON API without any browser involvement.',
      'A SameSite=None cookie without Secure is the strongest CSRF defense.',
      'Authorization headers are attached to every cross-site form submit, so bearer tokens need a CSRF token.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'CSRF uses the browser\'s habit of sending cookies on a request the attacker started. Stop automatic cookies, or require a secret the foreign page cannot read.',
      why: 'The user is logged in to your site. The attacker\'s page submits a form or fetch to your origin. The browser attaches your cookies even though the attacker cannot read them. If the cookie alone authorizes a state change, the attacker\'s request succeeds. SameSite=Lax sends the cookie on top-level GET navigations and not on cross-site POST. SameSite=Strict sends it only for same-site requests. SameSite=None sends it cross-site and requires Secure. A CSRF token is a second value, stored where script on your origin can read it and echoed in a custom header. A foreign origin cannot read the token because of the same-origin policy. A SPA that keeps a bearer token in memory and sends it in Authorization is not relying on an automatic cookie, so a foreign form cannot attach it. CORS does not replace this check, because a simple form POST is not blocked by a missing CORS header.',
      wrong: [
        {
          option: 'CSRF steals the response of a cross-origin JSON API without any browser involvement.',
          reason: 'The attacker does not need the response. The harm is the state change performed with the victim\'s cookies.',
        },
        {
          option: 'A SameSite=None cookie without Secure is the strongest CSRF defense.',
          reason: 'None is the setting that still sends the cookie cross-site. Lax or Strict is the reduction.',
        },
        {
          option: 'Authorization headers are attached to every cross-site form submit, so bearer tokens need a CSRF token.',
          reason: 'Browsers do not add Authorization to a foreign form. That is why a bearer token is not sent automatically.',
        },
      ],
      example: { lang: 'js', source: "await fetch('/api/transfer', {\n  method: 'POST',\n  credentials: 'same-origin',\n  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },\n  body: JSON.stringify({ amount: 20 }),\n});" },
      remember: 'CSRF rides on automatic cookies. SameSite or a token the other site cannot read stops it.',
    },
  },
  {
    id: 'js-125',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do LCP, CLS, and INP measure?',
    options: [
      'LCP is when the largest content appears. CLS is unexpected layout movement. INP is how slowly the page responds to interactions.',
      'LCP is JavaScript parse time. CLS is CSS file size. INP is the number of network requests.',
      'All three measure server CPU, and none of them are visible in the browser.',
      'CLS is the largest image. INP is a layout score. LCP is input delay only.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'LCP tracks loading of the main content, CLS tracks visual stability, and INP tracks how fast interactions get a frame.',
      why: 'Largest Contentful Paint is the time until the largest text or image in the viewport has painted. A slow hero image, a render-blocking stylesheet, or a late font delays it. Cumulative Layout Shift sums unexpected movement, weighted by how much of the viewport moved. Images without dimensions, injected banners, and late web fonts are common causes. Interaction to Next Paint, which replaced First Input Delay, looks at clicks, taps, and keys across the visit and reports a slow one. Long tasks on the main thread make INP worse. Lab tools approximate these. Field data from real users is the score that matches the metric definitions, usually as a percentile rather than an average.',
      wrong: [
        {
          option: 'LCP is JavaScript parse time. CLS is CSS file size. INP is the number of network requests.',
          reason: 'Those are resource costs. The three metrics are user-visible paint, movement, and responsiveness.',
        },
        {
          option: 'All three measure server CPU, and none of them are visible in the browser.',
          reason: 'The browser records them from the user\'s experience. Server time matters only when it delays the content.',
        },
        {
          option: 'CLS is the largest image. INP is a layout score. LCP is input delay only.',
          reason: 'The names are swapped. LCP is the content paint, CLS is the shift, and INP is the interaction.',
        },
      ],
      example: { lang: 'js', source: "import { onLCP, onCLS, onINP } from 'web-vitals';\nonLCP(console.log);\nonCLS(console.log);\nonINP(console.log);" },
      remember: 'LCP is main content. CLS is unexpected movement. INP is interaction delay.',
    },
  },
  {
    id: 'js-126',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the critical rendering path?',
    options: [
      'The browser turns HTML and CSS into a render tree, then layout and paint. CSS and synchronous scripts in the head delay the first paint.',
      'It is the path from a click handler to setState, and CSS does not affect it.',
      'The path is finished when the HTML bytes arrive, before CSS or layout.',
      'Async scripts in the head block the HTML parser until they download and run.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'HTML builds the DOM, CSS builds the CSSOM, and together they produce the render tree that layout and paint use. Blocking CSS and synchronous scripts postpone that first paint.',
      why: 'The parser builds the DOM as HTML arrives. A stylesheet is render-blocking because the browser does not want to paint and then restyle everything. A script without async or defer stops the parser, downloads, and runs before more HTML is parsed, so a script in the head delays discovery of later content. defer keeps order and runs after parsing. async runs when it arrives and can interrupt parsing. The render tree omits hidden nodes, layout computes geometry, and paint fills pixels. Critical CSS is the CSS needed for the first screen. Preload can fetch the hero image or font earlier. None of this measures interaction delay. It explains why the first pixels are late.',
      wrong: [
        {
          option: 'It is the path from a click handler to setState, and CSS does not affect it.',
          reason: 'That is an application update. The critical path is how the browser produces the first frame from HTML and CSS.',
        },
        {
          option: 'The path is finished when the HTML bytes arrive, before CSS or layout.',
          reason: 'Bytes are only the start. CSSOM, render tree, layout, and paint still have to happen.',
        },
        {
          option: 'Async scripts in the head block the HTML parser until they download and run.',
          reason: 'A plain script blocks the parser. async downloads without blocking and runs as soon as it is ready.',
        },
      ],
      example: { lang: 'js', source: "const link = document.createElement('link');\nlink.rel = 'preload';\nlink.as = 'image';\nlink.href = '/hero.avif';\ndocument.head.append(link);" },
      remember: 'First paint waits for HTML, blocking CSS, and synchronous scripts, then layout and paint.',
    },
  },
  {
    id: 'js-127',
    tech: 'javascript',
    topic: 'performance',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the difference between reflow and repaint, and what causes layout thrashing?',
    options: [
      'Reflow computes geometry. Repaint fills pixels. Interleaving layout reads and style writes forces the browser to recompute layout in a loop.',
      'Repaint computes geometry. Reflow only changes color and never runs during a read of offsetWidth.',
      'transform and opacity always reflow the document. color changes are compositor-only.',
      'Layout thrashing is a network retry loop and is unrelated to DOM reads.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Reflow, or layout, calculates positions and sizes. Repaint draws pixels. Reading layout between writes forces that calculation immediately.',
      why: 'Changing width, height, or font can invalidate layout. Changing color invalidates paint without a new layout. The compositor can move a layer with transform and opacity without asking the main thread to lay out or paint again, which is why animations prefer those properties. The browser normally batches style changes and lays out before the next paint. If your loop writes a style and then reads offsetWidth, scrollHeight, or getBoundingClientRect, the browser must lay out now so the read is correct. Doing that once per item is layout thrashing. Read the geometry you need first, then write styles, or do the visual change with a transform. A single forced layout is normal. A forced layout per row is the bug.',
      wrong: [
        {
          option: 'Repaint computes geometry. Reflow only changes color and never runs during a read of offsetWidth.',
          reason: 'The names are reversed. Reading offsetWidth is a classic way to force layout.',
        },
        {
          option: 'transform and opacity always reflow the document. color changes are compositor-only.',
          reason: 'transform and opacity can stay on the compositor. color needs a paint, and size changes need layout.',
        },
        {
          option: 'Layout thrashing is a network retry loop and is unrelated to DOM reads.',
          reason: 'It is a main-thread layout cost caused by alternating DOM writes and geometry reads.',
        },
      ],
      example: { lang: 'js', source: "const width = box.getBoundingClientRect().width;\nbox.style.transform = `translateX(${width / 2}px)`;" },
      remember: 'Layout computes boxes. Paint draws them. Do not read geometry between writes.',
    },
  },
  {
    id: 'js-128',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'When is a dedicated Web Worker the wrong tool?',
    options: [
      'It is the wrong tool for DOM updates and for small tasks where cloning the message costs more than the work.',
      'It is the wrong tool for parsing a multi-megabyte file, because workers cannot run JavaScript.',
      'It is required for every fetch, and it is wrong only when the file is served without HTTPS.',
      'Workers share the DOM, so they are wrong only when you also use a service worker.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Use a worker for CPU work that would block input. Skip it when the task is tiny, needs the DOM, or the copy outweighs the savings.',
      why: 'The main thread is the only place that can read layout and change the document. A worker that calculates a position still has to message the result back for the main thread to apply it. postMessage structured-clones the payload unless you transfer a buffer. Cloning a large object graph can take longer than the calculation. Startup also has a cost: the worker script loads and starts a fresh environment. The good fits are image filters, compression, parsing, and search indexes over large data, ideally with transferable buffers. Service workers are a different tool for network and cache, and they are also not a place to run a long synchronous loop. Measure the main-thread task before adding a worker.',
      wrong: [
        {
          option: 'It is the wrong tool for parsing a multi-megabyte file, because workers cannot run JavaScript.',
          reason: 'That parse is a strong fit. Workers exist to run JavaScript off the main thread.',
        },
        {
          option: 'It is required for every fetch, and it is wrong only when the file is served without HTTPS.',
          reason: 'fetch is already non-blocking. HTTPS is not the condition that makes a worker useful.',
        },
        {
          option: 'Workers share the DOM, so they are wrong only when you also use a service worker.',
          reason: 'Dedicated workers cannot see the DOM. A service worker does not change that.',
        },
      ],
      example: { lang: 'js', source: "const pixels = imageData.data.buffer;\nworker.postMessage({ pixels }, [pixels]);\nworker.onmessage = (event) => {\n  context.putImageData(new ImageData(new Uint8ClampedArray(event.data), width, height), 0, 0);\n};" },
      remember: 'Workers help large CPU jobs. DOM work and cheap tasks stay on the main thread.',
    },
  },
  {
    id: 'js-129',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What do HTTP/2 and HTTP/3 change compared with HTTP/1.1?',
    options: [
      'HTTP/2 multiplexes streams on one TCP connection. HTTP/3 uses QUIC over UDP so one lost packet does not stall every stream.',
      'HTTP/2 removes TLS. HTTP/3 restores one request per connection and deletes header compression.',
      'Both versions make caching unnecessary because every response is pushed.',
      'HTTP/3 is a JavaScript API. HTTP/2 is a CSS loading mode.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'HTTP/2 runs many requests on one connection. HTTP/3 keeps that multiplexing and avoids TCP head-of-line blocking by using QUIC.',
      why: 'HTTP/1.1 practically limits a browser to a handful of connections per host, so apps created many hostnames and combined files. HTTP/2 allows concurrent streams on one connection and compresses headers with HPACK. A lost TCP packet still stalls every stream on that connection, because TCP delivers bytes in order. HTTP/3 maps streams onto QUIC, which runs over UDP and retransmits a lost packet without blocking the other streams. The handshake can also complete in fewer round trips. Server push existed in HTTP/2 and is not the important win. Neither version shrinks an image or removes a slow server. You still want caching, small critical resources, and few round trips that depend on each other.',
      wrong: [
        {
          option: 'HTTP/2 removes TLS. HTTP/3 restores one request per connection and deletes header compression.',
          reason: 'Browsers use TLS for HTTP/2, and HTTP/3 keeps multiplexed, compressed streams on QUIC.',
        },
        {
          option: 'Both versions make caching unnecessary because every response is pushed.',
          reason: 'Push is not a cache. Cache-Control still decides whether a repeat visit downloads the file.',
        },
        {
          option: 'HTTP/3 is a JavaScript API. HTTP/2 is a CSS loading mode.',
          reason: 'Both are protocol versions negotiated by the browser and server. Page code does not select them per request.',
        },
      ],
      example: { lang: 'js', source: "const response = await fetch('/app.js');\nconsole.log(response.headers.get('alt-svc'));" },
      remember: 'HTTP/2 multiplexes on TCP. HTTP/3 multiplexes on QUIC so loss stays on one stream.',
    },
  },
  {
    id: 'js-130',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do Cache-Control, ETag, and Last-Modified each do?',
    options: [
      'Cache-Control sets freshness and revalidation rules. ETag and Last-Modified are validators that can turn a repeat request into 304.',
      'no-cache means the browser must not store the response. ETag stores the file body.',
      'Last-Modified replaces Cache-Control and is accurate to the millisecond for every file.',
      'A 304 response includes a fresh body and ignores the validator.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Cache-Control decides how long a response can be reused and when it must be checked. ETag and Last-Modified let the server say the stored body is still valid.',
      why: 'max-age=3600 means the response is fresh for an hour and can be reused with no request. no-store means do not keep it. no-cache means it may be stored but must be revalidated before reuse, which is not the same as "do not cache." private keeps it out of shared caches, and public allows them. s-maxage applies to shared caches. stale-while-revalidate lets a cache serve a stale response while it refreshes. An ETag is an identifier for the bytes. The next request sends If-None-Match, and a matching server returns 304 with no body. Last-Modified and If-Modified-Since do the same with a timestamp, which is coarser because two edits in one second can be missed. Validators do not set the lifetime. Cache-Control does.',
      wrong: [
        {
          option: 'no-cache means the browser must not store the response. ETag stores the file body.',
          reason: 'no-store is the directive that forbids storage. no-cache forces a check. An ETag identifies bytes and does not contain them.',
        },
        {
          option: 'Last-Modified replaces Cache-Control and is accurate to the millisecond for every file.',
          reason: 'It is a validator, not a freshness policy, and its precision is limited.',
        },
        {
          option: 'A 304 response includes a fresh body and ignores the validator.',
          reason: '304 means the cached body is still good. The body is omitted on purpose.',
        },
      ],
      example: { lang: 'js', source: "const response = await fetch('/app.js');\nresponse.headers.get('cache-control');\nresponse.headers.get('etag');" },
      remember: 'Cache-Control sets the lifetime. ETag and Last-Modified let the server answer 304.',
    },
  },
  {
    id: 'js-131',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does a service worker do in a stale-while-revalidate strategy?',
    options: [
      'It returns the cached response immediately and updates the cache from the network in the background.',
      'It waits for the network on every request and writes the cache only after the page unloads.',
      'It replaces the HTTP cache and disables Cache-Control for the whole origin.',
      'It runs inside the page and can read the DOM while it fetches.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Stale-while-revalidate serves the cached response now and refreshes that cache from the network without making the page wait.',
      why: 'A service worker sits between the page and the network. It can answer a fetch event with caches.match, fetch, or a combination. In stale-while-revalidate, a cache hit is returned immediately, and a network request updates the cache for next time. The user may see slightly old content. A cache miss still has to wait for the network or fall back to an offline page. The worker updates through install, waiting, and activate. skipWaiting and clients.claim make a new worker take over sooner, which can strand a page on mixed asset versions if you are careless. The Cache Storage API is separate from the HTTP cache. The worker has no DOM. HTTPS, or localhost, is required. This pattern fits shells and versioned assets better than a payment POST.',
      wrong: [
        {
          option: 'It waits for the network on every request and writes the cache only after the page unloads.',
          reason: 'Waiting for the network is a network-first strategy. The stale strategy returns the cache first.',
        },
        {
          option: 'It replaces the HTTP cache and disables Cache-Control for the whole origin.',
          reason: 'Both caches can apply. The service worker chooses a response, and Cache-Control still governs the network fetch it makes.',
        },
        {
          option: 'It runs inside the page and can read the DOM while it fetches.',
          reason: 'It is a separate worker. It cannot touch document.',
        },
      ],
      example: { lang: 'js', source: "self.addEventListener('fetch', (event) => {\n  event.respondWith((async () => {\n    const cache = await caches.open('app');\n    const cached = await cache.match(event.request);\n    const refresh = fetch(event.request).then((response) => {\n      cache.put(event.request, response.clone());\n      return response;\n    });\n    return cached || refresh;\n  })());\n});" },
      remember: 'Serve the cached response, then refresh the cache from the network.',
    },
  },
  {
    id: 'js-132',
    tech: 'javascript',
    topic: 'network',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'For a frontend, when is GraphQL a better fit than REST?',
    options: [
      'GraphQL fits when clients need different shapes from the same data and want one request that names those fields. REST fits cacheable resources and simple CRUD.',
      'GraphQL always uses fewer bytes and is cached by URL the same way a GET resource is.',
      'REST cannot return JSON. GraphQL cannot express a write.',
      'GraphQL removes the need for authorization because the schema is public.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'GraphQL lets each client ask for the fields it needs from one endpoint. REST is simpler when resources, caching, and uniform verbs match the UI.',
      why: 'A REST client often over-fetches a fixed representation or chains several calls to assemble a screen. GraphQL exposes a schema and a query language, so a list and a detail view can request different fields, including related objects, in one round trip. That helps multiple clients share one API. The costs move to the server: it must prevent expensive nested queries and the N+1 database problem, and POST queries are not cached like a REST GET unless you add persisted queries or a normalized client cache. Errors can arrive in a 200 body. REST maps cleanly onto HTTP verbs, status codes, and CDN caching. Choose REST for a small resource API and GraphQL when the shape of the UI drives the payload.',
      wrong: [
        {
          option: 'GraphQL always uses fewer bytes and is cached by URL the same way a GET resource is.',
          reason: 'A query can be larger than a tight REST response, and ordinary HTTP caches do not key POST queries.',
        },
        {
          option: 'REST cannot return JSON. GraphQL cannot express a write.',
          reason: 'REST commonly returns JSON. GraphQL mutations are the write operations.',
        },
        {
          option: 'GraphQL removes the need for authorization because the schema is public.',
          reason: 'The schema describes the API. Each field still needs an authorization check.',
        },
      ],
      example: { lang: 'js', source: "const query = `query { product(id: \"10\") { name price } }`;\nawait fetch('/graphql', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ query }),\n});" },
      remember: 'GraphQL lets the client name the fields. REST caches resources with ordinary HTTP.',
    },
  },
  {
    id: 'js-133',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do SameSite cookies affect a SPA login?',
    options: [
      'Lax and Strict limit when the browser adds the cookie on cross-site requests. A bearer token in a header is not sent automatically.',
      'SameSite=Strict sends the cookie on every cross-site POST and blocks same-site navigation.',
      'localStorage tokens are invisible to XSS, and cookies cannot be marked HttpOnly.',
      'SameSite replaces HTTPS and makes CSRF tokens useless on every design.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'SameSite controls cookie attachment. Lax or Strict reduces CSRF. A token you add yourself in a header is not attached to a foreign form.',
      why: 'A session cookie is convenient because the browser stores it and sends it. HttpOnly keeps page script from reading it, so an XSS bug cannot exfiltrate the token, though the script can still call your API. SameSite=Lax withholds the cookie from cross-site subrequests and sends it on a top-level GET, which is a practical default. Strict also withholds it from that GET, which can surprise a user arriving from an external link. None sends it cross-site and requires Secure. If the SPA stores a bearer token in localStorage, any XSS can read it, and a foreign site cannot attach it automatically. Memory storage dies on refresh. Cookie authentication needs a CSRF defense. Header authentication needs an XSS defense and a refresh story. The two designs trade those bugs. They do not eliminate both.',
      wrong: [
        {
          option: 'SameSite=Strict sends the cookie on every cross-site POST and blocks same-site navigation.',
          reason: 'Strict is the setting that does not send the cookie cross-site. Same-site requests still include it.',
        },
        {
          option: 'localStorage tokens are invisible to XSS, and cookies cannot be marked HttpOnly.',
          reason: 'localStorage is readable by script. HttpOnly is a cookie flag and is the one that hides the value from script.',
        },
        {
          option: 'SameSite replaces HTTPS and makes CSRF tokens useless on every design.',
          reason: 'Secure cookies still need HTTPS. A Lax cookie can be sent on a top-level navigation, so some flows still want a token.',
        },
      ],
      example: { lang: 'js', source: "document.cookie = 'sid=abc; Secure; HttpOnly; SameSite=Lax';\nawait fetch('/api/me', { credentials: 'same-origin' });" },
      remember: 'SameSite limits automatic cookies. HttpOnly hides them from script. A bearer header is not automatic.',
    },
  },
  {
    id: 'js-134',
    tech: 'javascript',
    topic: 'browser',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What is the practical order for making a widget accessible?',
    options: [
      'Use a native element first, give it a name and keyboard behavior, then add ARIA only for a pattern HTML does not provide.',
      'Start with a div and role="button", and skip the keyboard because ARIA implies it.',
      'WCAG applies to PDFs, not to HTML. ARIA replaces labels.',
      'Hide focus outlines globally and expose the same information through color alone.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Native controls already have names, roles, and keyboard behavior. ARIA fills gaps, and it does not add the behavior by itself.',
      why: 'WCAG groups the requirements as perceivable, operable, understandable, and robust. A button element is focusable, activates from the keyboard, and exposes its role. A div with role="button" still needs a tabindex, a key handler for Enter and Space, and a discernible name. The name comes from text, a label, or aria-label. aria-labelledby points at visible text. Do not override a native role with a conflicting one. Images that carry meaning need alt text. Empty alt marks a decorative image. Focus must stay visible. Color cannot be the only signal. Live updates use an aria-live region sparingly. Custom widgets should follow a known pattern so the states, such as expanded or selected, stay in sync with the UI.',
      wrong: [
        {
          option: 'Start with a div and role="button", and skip the keyboard because ARIA implies it.',
          reason: 'ARIA describes the element. You still implement focus and keys.',
        },
        {
          option: 'WCAG applies to PDFs, not to HTML. ARIA replaces labels.',
          reason: 'WCAG applies to the web UI. ARIA names an element and does not remove the need for a real label.',
        },
        {
          option: 'Hide focus outlines globally and expose the same information through color alone.',
          reason: 'Both choices fail operable and perceivable use. Keyboard users need a visible focus, and color needs a second cue.',
        },
      ],
      example: { lang: 'js', source: "const button = document.createElement('button');\nbutton.type = 'button';\nbutton.textContent = 'Save';\nbutton.addEventListener('click', save);" },
      remember: 'Use the native control. Add ARIA when HTML has no element for the pattern.',
    },
  },
  {
    id: 'js-135',
    tech: 'javascript',
    topic: 'security',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do CSP and X-Content-Type-Options protect?',
    options: [
      'CSP restricts where scripts, styles, and frames may load. nosniff stops the browser from treating a file as a different MIME type.',
      'CSP encrypts the HTML body. nosniff signs cookies.',
      'Both headers hide the page from search engines and replace HTTPS.',
      'X-Content-Type-Options allows inline scripts. CSP only affects images.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'CSP is an allowlist for resource types such as scripts and frames. X-Content-Type-Options: nosniff makes the browser honor the Content-Type you sent.',
      why: 'A Content-Security-Policy script-src list decides which script URLs may run. It can also ban plugins, restrict connect-src for fetch, and use frame-ancestors so other sites cannot embed you. That last directive replaces the older X-Frame-Options clickjacking control. A policy in report-only mode reports violations and does not block, which is how you roll one out. nosniff prevents MIME sniffing, so a user-uploaded text file is not executed as a script because the bytes happen to look like one. Other useful headers are Strict-Transport-Security, Referrer-Policy, and Permissions-Policy. Headers are defense in depth. They do not fix an XSS sink or a missing authorization check by themselves.',
      wrong: [
        {
          option: 'CSP encrypts the HTML body. nosniff signs cookies.',
          reason: 'TLS encrypts the connection. These headers tell the browser which behavior is allowed.',
        },
        {
          option: 'Both headers hide the page from search engines and replace HTTPS.',
          reason: 'They do not control indexing, and they assume you already have a transport.',
        },
        {
          option: 'X-Content-Type-Options allows inline scripts. CSP only affects images.',
          reason: 'nosniff is about MIME type. CSP script-src is what governs scripts.',
        },
      ],
      example: { lang: 'js', source: "res.setHeader('Content-Security-Policy', \"script-src 'self'\");\nres.setHeader('X-Content-Type-Options', 'nosniff');" },
      remember: 'CSP allowlists sources. nosniff keeps the declared MIME type.',
    },
  },
];
