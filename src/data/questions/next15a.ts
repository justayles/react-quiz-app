import type { Question } from '../types';

export const next15aQuestions = [
  {
    id: 'n15a-001',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 does not store a fetch() with no cache option in the Data Cache. Next.js 14 defaulted that call to force-cache. Next.js 16 does not restore the force-cache default, and with cacheComponents you opt into cached work with the use cache directive.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'In a Next.js 15 Server Component, fetch(url) is called with no cache option and no next.revalidate. What happens to the response?',
    options: [
      'It is not written to the Data Cache. Next.js 15 no longer defaults fetch to force-cache.',
      'It is stored in the Data Cache until the next deployment, the same default Next.js 14 used.',
      'It is stored only in the browser Router Cache for about five minutes.',
      'It becomes the Full Route Cache for that URL even when the route renders on every request.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'A fetch with no cache option is uncached in Next.js 15, so the response is not stored in the Data Cache.',
      why:
        'The Data Cache is the persistent server store of fetch results that can be reused on later requests. Next.js 14 treated a bare fetch as force-cache, so the same call used to be stored there automatically. Next.js 15 changed that default, which means this call runs again whenever the route runs again. To opt in, pass cache set to force-cache, or pass next.revalidate with a positive number of seconds.',
      wrong: [
        {
          option:
            'It is stored in the Data Cache until the next deployment, the same default Next.js 14 used.',
          reason:
            'That describes the Next.js 14 default. Next.js 15 leaves a fetch with no cache option out of the Data Cache.',
        },
        {
          option: 'It is stored only in the browser Router Cache for about five minutes.',
          reason:
            'The Router Cache lives in the browser and stores route payloads the user has visited. It is not where a server fetch response is saved.',
        },
        {
          option:
            'It becomes the Full Route Cache for that URL even when the route renders on every request.',
          reason:
            'The Full Route Cache stores prerendered HTML and the RSC payload for a route. A single fetch response is not that cache, and a dynamic route is not stored there.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/products\", {\n    cache: \"force-cache\",\n  });\n  const extra = await fetch(\"https://example.com/reviews\", {\n    next: { revalidate: 60 },\n  });\n  const products = await res.json();\n  const reviews = await extra.json();\n  return <p>{products.length}:{reviews.length}</p>;\n}" },
      remember: 'In Next.js 15, an unconfigured fetch is not stored in the Data Cache.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-002',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 still dedupes identical fetch calls during one render with Request Memoization, and a fetch with no cache option stays out of the Data Cache. Next.js 16 keeps that one-render dedupe. With cacheComponents, longer-lived caching is opted into with the use cache directive.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'During one render of this page, what does Next.js 15 do with the two fetch calls?',
    code: {
      lang: 'tsx',
      source: "export default async function Page() {\n  const left = fetch(\"https://example.com/price\");\n  const right = fetch(\"https://example.com/price\");\n  const [first, second] = await Promise.all([left, right]);\n  return <p>{first.status}:{second.status}</p>;\n}\n",
    },
    options: [
      'Both calls are written to the Data Cache because the URLs match.',
      'Request Memoization dedupes them into one network call for this render, and neither result is written to the Data Cache.',
      'The second call is skipped only when cache is set to force-cache. Here both always hit the network and fill the Data Cache.',
      'Request Memoization is disabled in Next.js 15, so both calls always hit the network and the Data Cache.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The two identical fetches are deduped for this render only, and nothing is written to the Data Cache.',
      why:
        'Request Memoization dedupes identical fetch calls during one server render, so the matching URL and options collapse into one network request. The code starts both calls, then awaits them together, and both variables share that one result. The Data Cache is the persistent store of fetch results across later requests, and a fetch with no cache option is not written there in Next.js 15. A later request can therefore call the network again even though this render only called it once.',
      wrong: [
        {
          option: 'Both calls are written to the Data Cache because the URLs match.',
          reason:
            'Matching URLs can be memoized during one render. That match does not write the response into the Data Cache when no cache option is passed.',
        },
        {
          option:
            'The second call is skipped only when cache is set to force-cache. Here both always hit the network and fill the Data Cache.',
          reason:
            'Deduping during one render does not require force-cache. force-cache is the opt-in for the Data Cache, and these calls do not pass it.',
        },
        {
          option:
            'Request Memoization is disabled in Next.js 15, so both calls always hit the network and the Data Cache.',
          reason:
            'Next.js 15 still memoizes identical fetches during a single render. These calls are also left out of the Data Cache.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const left = fetch(\"https://example.com/price\");\n  const right = fetch(\"https://example.com/price\");\n  const [first, second] = await Promise.all([left, right]);\n  return <p>{first.status}:{second.status}</p>;\n}\n" },
      remember: 'One render can dedupe a fetch without storing it in the Data Cache.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-003',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 does not put a bare fetch() into the Data Cache, while Next.js 14 defaulted it to force-cache. Next.js 16 does not restore that default. With cacheComponents, opt in with the use cache directive instead of expecting the Next.js 14 behavior.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'The author says this product list should stay in the Data Cache between requests, the way a bare fetch did in Next.js 14. What is the bug?',
    code: {
      lang: 'tsx',
      source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/products\");\n  const products = await res.json();\n  return <p>{products.length}</p>;\n}\n",
    },
    options: [
      'products.length is rendered without a React key, so the Data Cache refuses the response.',
      'The URL must be a relative path, or the Data Cache rejects the fetch.',
      'fetch has no cache option, so Next.js 15 does not store the response in the Data Cache.',
      'Calling res.json() disables the Data Cache for that response.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'The fetch never opts into the Data Cache, so Next.js 15 will not reuse this response on later requests.',
      why:
        'The page fetches the products URL and then reads the JSON body. There is no cache option and no next.revalidate, so this is the Next.js 15 default. The Data Cache, the persistent store of fetch results across requests, does not keep that result. The fix is to pass cache set to force-cache, or next.revalidate with a positive number of seconds. Rendering the length is unrelated to that cache.',
      wrong: [
        {
          option:
            'products.length is rendered without a React key, so the Data Cache refuses the response.',
          reason:
            'Keys matter when rendering a list of elements. A single length number is not rejected by the Data Cache.',
        },
        {
          option: 'The URL must be a relative path, or the Data Cache rejects the fetch.',
          reason:
            'An absolute URL is valid for fetch. The missing cache option is what keeps this response out of the Data Cache.',
        },
        {
          option: 'Calling res.json() disables the Data Cache for that response.',
          reason:
            'Parsing the body does not change the cache decision. The decision was already made by the fetch options.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/products\", {\n    cache: \"force-cache\",\n  });\n  const products = await res.json();\n  return <p>{products.length}</p>;\n}" },
      remember: 'Opt into the Data Cache with force-cache or a positive revalidate number.',
      fixedCode: {
        lang: 'tsx',
        source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/products\", { cache: \"force-cache\" });\n  const products = await res.json();\n  return <p>{products.length}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/fetch',
    },
  },
  {
    id: 'n15a-004',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 describes caching with Request Memoization, the Data Cache, the Full Route Cache, and the client Router Cache. Next.js 16 still has a client router cache and prerendered output, and with cacheComponents you opt into server caching with the use cache directive.',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Which list names the four Next.js caches and what each one keeps?',
    options: [
      'The Data Cache stores browser pages, the Full Route Cache is CDN HTML only, the Router Cache stores server fetches, and Request Memoization writes localStorage.',
      'Only the Data Cache and the Router Cache exist in Next.js 15. The other two were removed.',
      'The Full Route Cache stores cookies, and the Data Cache stores finished HTML documents.',
      'Request Memoization dedupes identical fetches during one render, the Data Cache stores fetch results across requests, the Full Route Cache stores prerendered HTML and the RSC payload, and the Router Cache stores visited route payloads in the browser.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Next.js has four caches: Request Memoization, the Data Cache, the Full Route Cache, and the Router Cache.',
      why:
        'Request Memoization dedupes identical fetch calls during a single server render so the same URL is not requested twice while one page is drawing. The Data Cache is the persistent server store of fetch results that can be reused on later requests when you opt in. The Full Route Cache stores prerendered HTML and the RSC payload, which is the React Server Components data for that route. The Router Cache lives in the browser and keeps the RSC payload of routes the user has already visited. Each layer has a different lifetime, so a hit in one does not mean the others stored the same data.',
      wrong: [
        {
          option:
            'The Data Cache stores browser pages, the Full Route Cache is CDN HTML only, the Router Cache stores server fetches, and Request Memoization writes localStorage.',
          reason:
            'Those jobs are swapped. The Data Cache stores fetch results on the server, and the Router Cache is the browser store of visited routes.',
        },
        {
          option:
            'Only the Data Cache and the Router Cache exist in Next.js 15. The other two were removed.',
          reason:
            'Next.js 15 still uses Request Memoization and the Full Route Cache alongside the Data Cache and the Router Cache.',
        },
        {
          option: 'The Full Route Cache stores cookies, and the Data Cache stores finished HTML documents.',
          reason:
            'Cookies are request data, not the Full Route Cache. Finished HTML belongs to the Full Route Cache, while the Data Cache stores fetch results.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  // Request Memoization dedupes identical fetches during this render.\n  const res = await fetch(\"https://example.com/products\", {\n    cache: \"force-cache\",\n  });\n  // force-cache stores this response in the Data Cache across requests.\n  const products = await res.json();\n  // A prerendered page can sit in the Full Route Cache.\n  // The browser Router Cache stores visited route payloads.\n  return <p>{products.length}</p>;\n}" },
      remember: 'Memoize one render, cache fetch data, cache the route, and cache visited routes in the browser.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-005',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 gives page segments a client Router Cache staleTime of 0, so a link navigation loads fresh page data, while shared layouts are not refetched. Next.js 16 keeps that page staleTime of 0 rather than restoring a 30 second default.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A user is on /dashboard and clicks a link to /settings. Both pages share one root layout and neither reads cookies. What does the Next.js 15 client Router Cache do on that click?',
    options: [
      'The settings page segment loads fresh data because page segments have a staleTime of 0. The shared root layout is not refetched.',
      'The settings page and the shared layout are both served from the Router Cache for 30 seconds.',
      'Page segments stay fresh for about five minutes, so this click reuses the previous page payload.',
      'The Router Cache was removed in Next.js 15, so the click is a full browser document load.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The click loads a fresh page segment, and the shared layout stays as it is in the client Router Cache.',
      why:
        'The client Router Cache is the browser store of RSC payloads, the React Server Components data for routes the user has visited. In Next.js 15, page segments use a staleTime of 0, so a link click to /settings asks the server for fresh page data. The shared root layout is not part of that refetch, so its payload is reused. This click is a client navigation, not a full document reload. Back and forward are a separate case that can restore a cached page so scroll position can return.',
      wrong: [
        {
          option:
            'The settings page and the shared layout are both served from the Router Cache for 30 seconds.',
          reason:
            'A 30 second page staleTime was older client-cache behavior. Next.js 15 uses 0 for page segments, and shared layouts are not refetched.',
        },
        {
          option:
            'Page segments stay fresh for about five minutes, so this click reuses the previous page payload.',
          reason:
            'About five minutes is how long loading.js stays cached. Page segments use a staleTime of 0 on a link click.',
        },
        {
          option: 'The Router Cache was removed in Next.js 15, so the click is a full browser document load.',
          reason:
            'The client Router Cache still exists. A link click updates the page segment without reloading the whole document.',
        },
      ],
      example: { lang: 'tsx', source: "import Link from \"next/link\";\n\nexport default function DashboardPage() {\n  // A click loads a fresh page segment. The shared root layout is not refetched.\n  return (\n    <main>\n      <Link href=\"/settings\">Settings</Link>\n    </main>\n  );\n}" },
      remember: 'Link clicks refresh the page segment. Shared layouts stay put.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-006',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 does not refetch a shared layout on a client navigation, and the page segment staleTime is 0. Next.js 16 keeps that split: fresh page data on a link click, with the shared layout left in the client Router Cache.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'This root layout wraps every page, and the home page has its own fetch. The user client-navigates from / to /about under the same layout. What does Next.js 15 refetch?',
    code: {
      lang: 'tsx',
      source: "import type { ReactNode } from \"react\";\n\nexport default async function RootLayout({ children }: { children: ReactNode }) {\n  const res = await fetch(\"https://example.com/nav\", { cache: \"no-store\" });\n  const nav = await res.json();\n  return (\n    <html>\n      <body>\n        <header>{nav.label}</header>\n        {children}\n      </body>\n    </html>\n  );\n}\n",
    },
    options: [
      'The root layout fetch and the about page segment are both refetched on this client navigation.',
      'The about page segment loads fresh because its Router Cache staleTime is 0. This shared root layout is not refetched.',
      'Nothing is refetched. The Router Cache keeps page segments and layouts for about five minutes.',
      'Only this root layout is refetched. Page segments are immutable in the browser.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The about page segment is loaded fresh, and this shared layout is not fetched again.',
      why:
        'The layout fetches the nav URL with cache no-store, then renders the header around children. On a client navigation to /about, the client Router Cache, the browser store of visited route payloads, already has this shared layout. Next.js 15 does not refetch that layout. The new page segment has a staleTime of 0, so its data is requested fresh. The no-store option on the layout fetch does not change that client rule, because the layout function does not run again for this navigation.',
      wrong: [
        {
          option:
            'The root layout fetch and the about page segment are both refetched on this client navigation.',
          reason:
            'The page segment is fresh. A shared layout is not refetched on a client navigation in Next.js 15.',
        },
        {
          option:
            'Nothing is refetched. The Router Cache keeps page segments and layouts for about five minutes.',
          reason:
            'Page segments use a staleTime of 0, so the about page is not reused for five minutes. About five minutes applies to loading.js.',
        },
        {
          option: 'Only this root layout is refetched. Page segments are immutable in the browser.',
          reason:
            'The layout is the part that stays. The page segment is the part that loads fresh.',
        },
      ],
      example: { lang: 'tsx', source: "import type { ReactNode } from \"react\";\n\nexport default async function RootLayout({ children }: { children: ReactNode }) {\n  const res = await fetch(\"https://example.com/nav\", { cache: \"no-store\" });\n  const nav = await res.json();\n  return (\n    <html>\n      <body>\n        <header>{nav.label}</header>\n        {children}\n      </body>\n    </html>\n  );\n}\n" },
      remember: 'A client navigation refreshes the page segment and reuses the shared layout.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-007',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 restores back and forward navigations from the client Router Cache so scroll can return, even though page segments use a staleTime of 0 for link clicks. loading.js stays cached for about five minutes. Next.js 16 keeps this back-forward restore behavior.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement about the Next.js 15 client Router Cache is correct?',
    options: [
      'Back and forward always hit the server, and loading.js is never cached.',
      'loading.js is cached until the next deployment, and page segments use a staleTime of 30 seconds.',
      'Back and forward restore the cached RSC payload so scroll can return. Link clicks still load fresh page data because the page staleTime is 0. loading.js stays cached for about five minutes.',
      'The Router Cache stores the Data Cache on the server so back navigation can skip rendering.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Back and forward reuse the cached route payload, while link clicks still refresh page segments.',
      why:
        'The client Router Cache is the browser store of RSC payloads, the React Server Components data for routes already visited. A link click uses a page staleTime of 0, so that page segment loads fresh and shared layouts are not refetched. Back and forward are different: they restore the cached payload so the browser can put the scroll position back. loading.js is the extra exception and stays cached for about five minutes. Those rules are all client cache lifetimes, separate from the server Data Cache.',
      wrong: [
        {
          option: 'Back and forward always hit the server, and loading.js is never cached.',
          reason:
            'Back and forward restore the cached payload. loading.js stays cached for about five minutes.',
        },
        {
          option:
            'loading.js is cached until the next deployment, and page segments use a staleTime of 30 seconds.',
          reason:
            'loading.js is about five minutes, not until deploy. Page segments use a staleTime of 0 in Next.js 15.',
        },
        {
          option:
            'The Router Cache stores the Data Cache on the server so back navigation can skip rendering.',
          reason:
            'The Router Cache is in the browser. The Data Cache is the server store of fetch results.',
        },
      ],
      example: { lang: 'tsx', source: "import Link from \"next/link\";\n\nexport default function SettingsPage() {\n  return (\n    <main>\n      <h1>Settings</h1>\n      <Link href=\"/dashboard\">Dashboard</Link>\n    </main>\n  );\n}\n// Link clicks load this page fresh because the page staleTime is 0.\n// Back and forward restore the cached payload so scroll can return.\n// loading.js stays cached for about five minutes." },
      remember: 'Back and forward restore the page. A new link loads fresh page data.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-008',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 lets you opt toward the older client reuse window with experimental.staleTimes.dynamic, because page segments otherwise use a staleTime of 0. Next.js 16 does not go back to a 30 second page staleTime by default.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'You want link clicks to reuse a page segment for a short time, closer to the older client Router Cache behavior. What do you change in Next.js 15?',
    options: [
      'Export revalidate = 30 from the root layout. That number is the client staleTime.',
      'Call revalidateTag("router") from a Server Action after every navigation.',
      'Pass cache force-cache on every fetch. That sets the client page staleTime.',
      'Set experimental.staleTimes.dynamic in next.config to a number of seconds so dynamic page segments can be reused from the client Router Cache.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'experimental.staleTimes.dynamic is the Next.js 15 opt-in for a non-zero client page staleTime.',
      why:
        'The client Router Cache keeps RSC payloads, the React Server Components data for visited routes, inside the browser. Next.js 15 sets the page segment staleTime to 0, so each link click loads fresh page data. experimental.staleTimes.dynamic in next.config replaces that 0 with a number of seconds you choose. revalidate on a layout controls server regeneration, not this browser timer. cache force-cache opts a fetch into the Data Cache, the persistent server store of fetch results, and does not set the client staleTime.',
      wrong: [
        {
          option: 'Export revalidate = 30 from the root layout. That number is the client staleTime.',
          reason:
            'The revalidate segment config is a server ISR window. It does not set how long the browser reuses a page segment.',
        },
        {
          option: 'Call revalidateTag("router") from a Server Action after every navigation.',
          reason:
            'revalidateTag invalidates tagged server fetch data. It is not the client Router Cache staleTime.',
        },
        {
          option: 'Pass cache force-cache on every fetch. That sets the client page staleTime.',
          reason:
            'force-cache writes a fetch into the Data Cache on the server. The client page staleTime is experimental.staleTimes.dynamic.',
        },
      ],
      example: { lang: 'ts', source: "const nextConfig = {\n  experimental: {\n    staleTimes: {\n      dynamic: 30,\n    },\n  },\n};\n\nexport default nextConfig;" },
      remember: 'experimental.staleTimes.dynamic is how you reuse page segments on the client.',
      docs: 'https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes',
    },
  },
  {
    id: 'n15a-009',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 treats a normal GET Route Handler as dynamic unless you export dynamic = force-static. A force-cache fetch can still enter the Data Cache, but that does not make the handler static. Next.js 16 does not cache normal GET handlers by default either.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author added force-cache so this GET handler response would be statically cached. What is the bug in Next.js 15?',
    code: {
      lang: 'ts',
      source: "export async function GET() {\n  const res = await fetch(\"https://example.com/items\", { cache: \"force-cache\" });\n  const items = await res.json();\n  return Response.json(items);\n}\n",
    },
    options: [
      'A GET Route Handler is dynamic by default. force-cache can store the fetch in the Data Cache, but it does not make the handler itself static.',
      'force-cache is ignored on every fetch in Next.js 15, so the bug is using that option at all.',
      'Response.json always opts the handler into the Full Route Cache, so there is no bug.',
      'The handler is static only when the URL is relative. An absolute URL forces it to be dynamic.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The handler is still dynamic. force-cache stores the fetch, not the route handler response.',
      why:
        'The function handles GET, fetches the items URL with cache force-cache, and returns JSON. force-cache can write that fetch into the Data Cache, the persistent server store of fetch results. A normal GET Route Handler is still dynamic in Next.js 15, so its response is not served as a static route. The fix is to export dynamic set to force-static when the whole handler should be static. sitemap, opengraph-image, and icon files are the special cases that stay static by default.',
      wrong: [
        {
          option:
            'force-cache is ignored on every fetch in Next.js 15, so the bug is using that option at all.',
          reason:
            'force-cache is the supported way to opt a fetch into the Data Cache. The bug is expecting that option to make the handler static.',
        },
        {
          option: 'Response.json always opts the handler into the Full Route Cache, so there is no bug.',
          reason:
            'The response helper does not change the handler cache mode. GET handlers are dynamic unless dynamic is force-static.',
        },
        {
          option:
            'The handler is static only when the URL is relative. An absolute URL forces it to be dynamic.',
          reason:
            'The absolute URL is fine. The missing force-static export is what leaves the handler dynamic.',
        },
      ],
      example: { lang: 'ts', source: "export const dynamic = \"force-static\";\n\nexport async function GET() {\n  const res = await fetch(\"https://example.com/items\", { cache: \"force-cache\" });\n  const items = await res.json();\n  return Response.json(items);\n}\n" },
      remember: 'force-cache stores the fetch. force-static is what makes a GET handler static.',
      fixedCode: {
        lang: 'ts',
        source: "export const dynamic = \"force-static\";\n\nexport async function GET() {\n  const res = await fetch(\"https://example.com/items\", { cache: \"force-cache\" });\n  const items = await res.json();\n  return Response.json(items);\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-010',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 can store a force-cache fetch in the Data Cache even when cookies() makes the page dynamic, so the HTML stays out of the Full Route Cache. Next.js 16 with cacheComponents errors on force-static and force-dynamic, and cached work uses the use cache directive.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'A Server Component fetches with cache set to force-cache and also awaits cookies(). Which caches can hold what in Next.js 15?',
    options: [
      'The fetch and the HTML both go into the Full Route Cache, because force-cache makes the whole route static.',
      'The fetch result can be stored in the Data Cache and reused later. Reading cookies makes the page dynamic, so its HTML and RSC payload are not stored in the Full Route Cache.',
      'cookies() disables the Data Cache, so the fetch cannot be stored even with force-cache.',
      'The server Router Cache stores the cookies and the fetch together for about five minutes.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The fetch can live in the Data Cache. The page HTML does not live in the Full Route Cache.',
      why:
        'cache force-cache opts that fetch into the Data Cache, the persistent server store of fetch results across requests. Awaited cookies() read request data, so this route renders dynamically and is not saved in the Full Route Cache, the store of prerendered HTML and RSC payload. The RSC payload is the React Server Components data for the route. A dynamic page can still read a Data Cache hit while its own HTML is built per request. The browser Router Cache is a separate client store and does not hold the cookie jar on the server.',
      wrong: [
        {
          option:
            'The fetch and the HTML both go into the Full Route Cache, because force-cache makes the whole route static.',
          reason:
            'force-cache applies to that fetch. cookies() still opts the route out of static rendering.',
        },
        {
          option: 'cookies() disables the Data Cache, so the fetch cannot be stored even with force-cache.',
          reason:
            'Reading cookies makes the route dynamic. It does not turn off an explicit force-cache fetch.',
        },
        {
          option: 'The server Router Cache stores the cookies and the fetch together for about five minutes.',
          reason:
            'The Router Cache is in the browser. About five minutes is the loading.js client lifetime, not a server cookie cache.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from \"next/headers\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"light\";\n  const res = await fetch(\"https://example.com/products\", {\n    cache: \"force-cache\",\n  });\n  const products = await res.json();\n  return <p>{theme}:{products.length}</p>;\n}" },
      remember: 'A dynamic page can still read a force-cache fetch from the Data Cache.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-011',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 stores a fetch in the Data Cache when you pass cache force-cache, and it leaves a fetch with no cache option uncached. Next.js 14 had cached the bare call by default. Next.js 16 does not restore that default.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Which of these two fetches can be stored in the Next.js 15 Data Cache?',
    code: {
      lang: 'ts',
      source: "export async function load() {\n  const cached = await fetch(\"https://example.com/a\", { cache: \"force-cache\" });\n  const fresh = await fetch(\"https://example.com/b\");\n  return { cached: cached.status, fresh: fresh.status };\n}\n",
    },
    options: [
      'Both, because Next.js 15 defaults every fetch to force-cache.',
      'Only the fresh call, because force-cache means skip the Data Cache.',
      'Only the cached call. The fresh call has no cache option, so Next.js 15 does not store it.',
      'Neither. Next.js 15 ignores cache force-cache and only stores fetches in the browser.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Only the force-cache fetch is eligible for the Data Cache. The bare fetch is not.',
      why:
        'load awaits the first fetch with cache set to force-cache, which opts that response into the Data Cache, the persistent server store of fetch results. It then awaits a second fetch with no cache option and no revalidate number. Next.js 15 does not store that second response in the Data Cache. The returned statuses say nothing about cache storage. Passing next.revalidate with a positive number of seconds would be the other way to opt the second call in.',
      wrong: [
        {
          option: 'Both, because Next.js 15 defaults every fetch to force-cache.',
          reason:
            'That was the Next.js 14 default. Next.js 15 stores the call that passes force-cache and leaves the bare call out.',
        },
        {
          option: 'Only the fresh call, because force-cache means skip the Data Cache.',
          reason:
            'force-cache is the opt-in, not a skip. The bare fetch is the one left out of the Data Cache.',
        },
        {
          option: 'Neither. Next.js 15 ignores cache force-cache and only stores fetches in the browser.',
          reason:
            'force-cache is still honored. The Data Cache is a server store, not the browser Router Cache.',
        },
      ],
      example: { lang: 'ts', source: "export async function load() {\n  const cached = await fetch(\"https://example.com/a\", {\n    cache: \"force-cache\",\n  });\n  const fresh = await fetch(\"https://example.com/b\");\n  return { cached: cached.status, fresh: fresh.status };\n}" },
      remember: 'force-cache opts a fetch into the Data Cache. A bare fetch does not.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/fetch',
    },
  },
  {
    id: 'n15a-012',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 can prerender a page that only fetches, and that HTML and RSC payload can sit in the Full Route Cache. Next.js 16 can still prerender cached output, and with cacheComponents you mark that work with the use cache directive.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A page only fetches with cache set to force-cache and renders the JSON. It does not read cookies, headers, or searchParams, and it does not call connection(). What can Next.js 15 do at build time?',
    options: [
      'It always runs the page on every request because a fetch is present.',
      'It prerenders the HTML and refuses to store the RSC payload.',
      'It refuses to build until you export dynamic = force-dynamic.',
      'It can prerender the page. The HTML and RSC payload can sit in the Full Route Cache, and the fetch result can sit in the Data Cache.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The page can be prerendered into the Full Route Cache, and the fetch can be stored in the Data Cache.',
      why:
        'A page whose only IO is fetch can still be prerendered at build, even though you might expect every fetch to make it dynamic. The Full Route Cache stores that prerendered HTML and the RSC payload, the React Server Components data for the route. cache force-cache also lets the fetch result sit in the Data Cache, the persistent server store of fetch results. To force the route to run on every request you would call connection(), read cookies, headers, or searchParams, or export dynamic set to force-dynamic. None of those are present here.',
      wrong: [
        {
          option: 'It always runs the page on every request because a fetch is present.',
          reason:
            'A fetch by itself does not force dynamic rendering. This page can be prerendered.',
        },
        {
          option: 'It prerenders the HTML and refuses to store the RSC payload.',
          reason:
            'The Full Route Cache keeps both the prerendered HTML and the RSC payload.',
        },
        {
          option: 'It refuses to build until you export dynamic = force-dynamic.',
          reason:
            'force-dynamic would turn off this static prerender. The build can prerender the page as written.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/products\", {\n    cache: \"force-cache\",\n  });\n  const products = await res.json();\n  return <p>{products.length}</p>;\n}" },
      remember: 'A fetch-only page can still be prerendered into the Full Route Cache.',
      docs: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
  },
  {
    id: 'n15a-013',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 treats next.revalidate of 0 as uncached, like no-store, and does not keep that fetch in the Data Cache. A positive revalidate number or cache force-cache is the opt-in. Next.js 16 does not treat 0 as cache forever either.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author set revalidate to 0 because they want the Data Cache to keep this response forever. What is the bug?',
    code: {
      lang: 'tsx',
      source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/items\", { next: { revalidate: 0 } });\n  const items = await res.json();\n  return <p>{items.length}</p>;\n}\n",
    },
    options: [
      'revalidate 0 means do not cache the fetch. It does not mean store it forever.',
      'revalidate 0 stores the response until the next deploy, so the code already matches the goal.',
      'The bug is items.length. The Data Cache only stores fetches that render a list of elements.',
      'A revalidate number always writes the Full Route Cache and never the Data Cache.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'revalidate set to 0 leaves the fetch uncached. It does not keep the response forever.',
      why:
        'The page fetches the items URL with next.revalidate set to 0, then renders the length. A revalidate value of 0 means the fetch is not stored, in the same spirit as no-store. The Data Cache, the persistent server store of fetch results, does not keep this response. To cache it with no time window, pass cache set to force-cache. A positive number such as 60 would store it and allow a refresh after that many seconds.',
      wrong: [
        {
          option:
            'revalidate 0 stores the response until the next deploy, so the code already matches the goal.',
          reason:
            'Zero does not mean cache until deploy. It means the fetch is not cached.',
        },
        {
          option:
            'The bug is items.length. The Data Cache only stores fetches that render a list of elements.',
          reason:
            'The rendered output does not decide fetch caching. The revalidate value does.',
        },
        {
          option: 'A revalidate number always writes the Full Route Cache and never the Data Cache.',
          reason:
            'next.revalidate on fetch is a Data Cache control. Zero specifically opts out of storing the fetch.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/items\", {\n    cache: \"force-cache\",\n  });\n  const items = await res.json();\n  return <p>{items.length}</p>;\n}" },
      remember: 'revalidate 0 skips the Data Cache. force-cache stores the fetch until you invalidate it.',
      fixedCode: {
        lang: 'tsx',
        source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/items\", { cache: \"force-cache\" });\n  const items = await res.json();\n  return <p>{items.length}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/fetch',
    },
  },
  {
    id: 'n15a-014',
    tech: 'next15',
    topic: 'caching',
    versionNote:
      'Next.js 15 keeps sitemap, opengraph-image, and icon files static by default, while a normal GET Route Handler is dynamic unless you export dynamic = force-static. Next.js 16 does not make those metadata files dynamic by default.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'Which files stay static by default in Next.js 15, even though a normal GET Route Handler does not?',
    options: [
      'Every route.ts GET is static, and sitemap files are dynamic.',
      'sitemap, opengraph-image, and icon files stay static by default. A normal GET Route Handler is dynamic unless you export dynamic = force-static.',
      'icon files are dynamic because they read the filesystem, and opengraph-image is cached only in the browser.',
      'Only Route Handlers that return Response.json stay static. Metadata image files are dynamic.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'sitemap, opengraph-image, and icon stay static by default. A normal GET handler does not.',
      why:
        'Next.js 15 treats a normal GET Route Handler as dynamic, so its response is not cached as a static route. You opt that handler in with export const dynamic set to force-static. sitemap, opengraph-image, and icon files are special metadata files and stay static by default. That exception is about those file conventions, not about every file under app. A force-cache fetch inside a GET handler still does not replace the force-static export.',
      wrong: [
        {
          option: 'Every route.ts GET is static, and sitemap files are dynamic.',
          reason:
            'The defaults are the other way around. GET handlers are dynamic, and sitemap files stay static.',
        },
        {
          option:
            'icon files are dynamic because they read the filesystem, and opengraph-image is cached only in the browser.',
          reason:
            'icon and opengraph-image stay static by default. They are not browser-only caches.',
        },
        {
          option: 'Only Route Handlers that return Response.json stay static. Metadata image files are dynamic.',
          reason:
            'The return helper does not decide this. Metadata files stay static, and a normal GET handler stays dynamic until force-static.',
        },
      ],
      example: { lang: 'ts', source: "// sitemap, opengraph-image, and icon stay static by default.\n\nexport const dynamic = \"force-static\";\n\nexport async function GET() {\n  const res = await fetch(\"https://example.com/items\", {\n    cache: \"force-cache\",\n  });\n  const items = await res.json();\n  return Response.json(items);\n}" },
      remember: 'GET handlers are dynamic by default. sitemap, opengraph-image, and icon stay static.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-015',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 revalidateTag(tag) takes one argument. Next.js 16 requires a second cacheLife profile, for example revalidateTag(tag, max), and updateTag(tag) is the Server Action API for read-your-writes.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This Server Action is deployed on Next.js 15. The author passed a cache profile because they thought the tag alone was invalid. What is the bug?',
    code: {
      lang: 'ts',
      source: "\"use server\";\n\nimport { revalidateTag } from \"next/cache\";\n\nexport async function refreshPosts() {\n  revalidateTag(\"posts\", \"max\");\n}\n",
    },
    options: [
      'revalidateTag must be called during render, so moving it into a Server Action is the bug.',
      'The tag must include a leading slash, or Next.js 15 ignores it.',
      'Next.js 15 revalidateTag takes only the tag. The second cacheLife profile is the Next.js 16 API.',
      'The bug is the use server directive. revalidateTag works only in a Client Component.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Drop the second argument. Next.js 15 invalidates a tag with revalidateTag(tag) alone.',
      why:
        'The file is a Server Action, which is a valid place to invalidate cached data after a mutation. It imports revalidateTag and calls it with the tag posts and a second argument max. Next.js 15 accepts only the tag. The second value is a cacheLife profile, a named freshness setting required by Next.js 16, such as revalidateTag(tag, max). The Next.js 15 call is revalidateTag("posts"). updateTag is the Next.js 16 Server Action API for read-your-writes, which means the same action sees the data it just wrote.',
      wrong: [
        {
          option: 'revalidateTag must be called during render, so moving it into a Server Action is the bug.',
          reason:
            'Calling it during render is the unsupported direction. A Server Action is a correct place in Next.js 15.',
        },
        {
          option: 'The tag must include a leading slash, or Next.js 15 ignores it.',
          reason:
            'Tags are labels you choose, not URL paths. The extra argument is the problem.',
        },
        {
          option: 'The bug is the use server directive. revalidateTag works only in a Client Component.',
          reason:
            'revalidateTag runs on the server. A Client Component is the wrong place for this API.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidateTag } from \"next/cache\";\n\nexport async function refreshPosts() {\n  revalidateTag(\"posts\");\n  // Next.js 16 requires a cacheLife profile: revalidateTag(tag, 'max').\n}" },
      remember: 'Next.js 15: revalidateTag(tag). Next.js 16: revalidateTag(tag, profile).',
      fixedCode: {
        lang: 'ts',
        source: "\"use server\";\n\nimport { revalidateTag } from \"next/cache\";\n\nexport async function refreshPosts() {\n  revalidateTag(\"posts\");\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag',
    },
  },
  {
    id: 'n15a-016',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 ISR can serve a stale page after the revalidate window while a new render runs, which is stale-while-revalidate. Next.js 16 still uses time-based revalidation, and with cacheComponents the use cache directive plus cacheLife profiles replace the old segment config.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'The last successful render of this page was 90 seconds ago. A new request arrives. What can Next.js 15 do?',
    code: {
      lang: 'tsx',
      source: "export const revalidate = 60;\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/feed\", { next: { revalidate: 60 } });\n  const data = await res.json();\n  return <p>{data.updatedAt}</p>;\n}\n",
    },
    options: [
      'It must wait for a fresh render before sending any HTML.',
      'It returns a 404 because the 60 second window has expired.',
      'It ignores both revalidate settings when the page export and the fetch option match.',
      'It can serve the stale page immediately and regenerate in the background (stale-while-revalidate).',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'After the window, the next request can get the stale page while Next.js regenerates it.',
      why:
        'The segment exports revalidate of 60, and the fetch uses the same 60 second next.revalidate, so both the route and the Data Cache entry are on a one minute window. The Data Cache is the persistent server store of fetch results. Ninety seconds is past that window, so the cached page is stale. Incremental Static Regeneration can still send that stale HTML right away and run a new render in the background. That pattern is called stale-while-revalidate. The visitor does not have to wait for the fresh render, and the page is not a 404.',
      wrong: [
        {
          option: 'It must wait for a fresh render before sending any HTML.',
          reason:
            'The first request after the window can receive the previous page while regeneration runs.',
        },
        {
          option: 'It returns a 404 because the 60 second window has expired.',
          reason:
            'An expired ISR window marks the page stale. It does not remove the route.',
        },
        {
          option: 'It ignores both revalidate settings when the page export and the fetch option match.',
          reason:
            'Matching values do not cancel each other. Both say the content is fresh for 60 seconds.',
        },
      ],
      example: { lang: 'tsx', source: "export const revalidate = 60;\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/feed\", { next: { revalidate: 60 } });\n  const data = await res.json();\n  return <p>{data.updatedAt}</p>;\n}\n" },
      remember: 'After the ISR window, the next visitor can see stale HTML while a new render runs.',
      docs: 'https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration',
    },
  },
  {
    id: 'n15a-017',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 on-demand invalidation uses revalidateTag(tag) with one argument, called from a Server Action or Route Handler. Next.js 16 requires a cacheLife profile as the second argument and adds updateTag for read-your-writes inside a Server Action.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author calls revalidateTag while rendering so the tagged posts are always fresh. What is the bug?',
    code: {
      lang: 'tsx',
      source: "import { revalidateTag } from \"next/cache\";\n\nexport default async function Page() {\n  revalidateTag(\"posts\");\n  const res = await fetch(\"https://example.com/posts\", {\n    next: { tags: [\"posts\"], revalidate: 3600 },\n  });\n  const posts = await res.json();\n  return <p>{posts.length}</p>;\n}\n",
    },
    options: [
      'revalidateTag is called during render. Invalidate from a Server Action or Route Handler after a mutation, not while drawing the page.',
      'The tags array is invalid. A tag must be passed as cache: "posts".',
      'revalidate 3600 deletes the tag, so revalidateTag has nothing to do.',
      'The bug is importing revalidateTag from next/cache. The Next.js 15 path is next/headers.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'revalidateTag runs during render. Move it to a Server Action or Route Handler that runs after a write.',
      why:
        'The page calls revalidateTag("posts") before it fetches. That API is for on-demand invalidation after a mutation, and calling it while rendering is not supported. The fetch itself is a valid cached read: tags label the Data Cache entry, and revalidate 3600 stores it for an hour. The Data Cache is the persistent server store of fetch results. Remove the render-time call, and call revalidateTag("posts") from a Server Action after you change a post. In Next.js 15 that call takes one argument.',
      wrong: [
        {
          option: 'The tags array is invalid. A tag must be passed as cache: "posts".',
          reason:
            'next.tags is the correct place to label a cached fetch. cache is a different option.',
        },
        {
          option: 'revalidate 3600 deletes the tag, so revalidateTag has nothing to do.',
          reason:
            'A positive revalidate number stores the fetch and refreshes it on a timer. It does not delete the tag.',
        },
        {
          option: 'The bug is importing revalidateTag from next/cache. The Next.js 15 path is next/headers.',
          reason:
            'revalidateTag is exported from next/cache. next/headers is for cookies, headers, and draftMode.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/posts\", {\n    next: { tags: [\"posts\"], revalidate: 3600 },\n  });\n  const posts = await res.json();\n  return <p>{posts.length}</p>;\n}\n" },
      remember: 'Call revalidateTag after a write, not during render.',
      fixedCode: {
        lang: 'tsx',
        source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/posts\", {\n    next: { tags: [\"posts\"], revalidate: 3600 },\n  });\n  const posts = await res.json();\n  return <p>{posts.length}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag',
    },
  },
  {
    id: 'n15a-018',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 invalidates on demand with revalidatePath and revalidateTag, and revalidateTag takes only the tag. Next.js 16 requires a cacheLife profile such as revalidateTag(tag, max), and updateTag(tag) is the Server Action API for read-your-writes.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'Which on-demand cache APIs does Next.js 15 provide, and what does Next.js 16 add for tags?',
    options: [
      'Next.js 15 removed revalidatePath. Next.js 16 brings invalidation back only as updateTag.',
      'Next.js 15 uses revalidatePath and revalidateTag. revalidateTag takes the tag only. Next.js 16 requires a second cacheLife profile, such as revalidateTag(tag, max), and adds updateTag(tag) for read-your-writes in a Server Action.',
      'updateTag is the Next.js 15 API, and revalidateTag was removed before Next.js 15.',
      'revalidateTag in Next.js 15 already requires the profile max. Next.js 16 removes that argument.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Next.js 15 uses revalidatePath and a one-argument revalidateTag. Next.js 16 adds a profile and updateTag.',
      why:
        'revalidatePath invalidates a cached path, and revalidateTag invalidates fetch results labeled with that tag in the Data Cache, the persistent server store of fetch results. In Next.js 15, revalidateTag takes the tag alone and is called from a Server Action or Route Handler. Next.js 16 requires a second cacheLife profile, a named freshness setting, for example revalidateTag(tag, max). updateTag(tag) is the Next.js 16 Server Action API for read-your-writes, meaning the same action can read the data it just wrote. Passing the profile to the Next.js 15 function is the wrong signature for that version.',
      wrong: [
        {
          option: 'Next.js 15 removed revalidatePath. Next.js 16 brings invalidation back only as updateTag.',
          reason:
            'revalidatePath is a Next.js 15 on-demand API. updateTag is added in Next.js 16 and does not replace path invalidation in 15.',
        },
        {
          option: 'updateTag is the Next.js 15 API, and revalidateTag was removed before Next.js 15.',
          reason:
            'Next.js 15 uses revalidateTag with one argument. updateTag arrives in Next.js 16.',
        },
        {
          option:
            'revalidateTag in Next.js 15 already requires the profile max. Next.js 16 removes that argument.',
          reason:
            'The profile is required in Next.js 16. Next.js 15 takes the tag only.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidatePath, revalidateTag } from \"next/cache\";\n\nexport async function saveProduct() {\n  revalidatePath(\"/shop/42\");\n  revalidateTag(\"products\");\n  // Next.js 16 requires revalidateTag(tag, 'max') and adds updateTag(tag).\n}" },
      remember: 'One argument in Next.js 15. A cacheLife profile, and updateTag, in Next.js 16.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag',
    },
  },
  {
    id: 'n15a-019',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 on-demand ISR uses revalidatePath and revalidateTag from a Server Action or Route Handler. Next.js 16 still invalidates paths, and tag invalidation there requires a cacheLife profile plus updateTag when a Server Action needs read-your-writes.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A Server Action updates the product at /shop/42 and should drop the cached page so the next visit renders fresh data. Which call fits Next.js 15?',
    options: [
      'revalidateTag("/shop/42", "max"), because Next.js 15 path invalidation requires a cacheLife profile.',
      'Export revalidate = 0 from the action file so the path stays fresh forever.',
      'Call revalidatePath("/shop/42") in the Server Action so the cached route is invalidated on demand.',
      'Call connection() inside the action. That clears the Full Route Cache for that URL.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'revalidatePath("/shop/42") invalidates that cached route on demand.',
      why:
        'revalidatePath tells Next.js to drop the cached page for a path so the next request can render it again. Calling it from the Server Action, after the product write, is the on-demand ISR path for /shop/42. The Full Route Cache, the store of prerendered HTML and RSC payload, is what a static or ISR page would otherwise keep serving. revalidateTag is for labeled fetch entries, and in Next.js 15 it takes one tag argument, not a path plus a profile. connection() waits for a real request so a route renders dynamically. It does not invalidate a path.',
      wrong: [
        {
          option:
            'revalidateTag("/shop/42", "max"), because Next.js 15 path invalidation requires a cacheLife profile.',
          reason:
            'That two-argument tag call is not the Next.js 15 path API. Use revalidatePath for the URL, and revalidateTag takes only a tag in 15.',
        },
        {
          option: 'Export revalidate = 0 from the action file so the path stays fresh forever.',
          reason:
            'A revalidate export belongs on a route segment, and 0 does not mean invalidate this path from an action.',
        },
        {
          option: 'Call connection() inside the action. That clears the Full Route Cache for that URL.',
          reason:
            'connection() opts a route into dynamic rendering by waiting for a request. It is not the on-demand invalidation API.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidatePath } from \"next/cache\";\n\nexport async function saveProduct() {\n  revalidatePath(\"/shop/42\");\n}" },
      remember: 'After a write, revalidatePath invalidates one path in Next.js 15.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/revalidatePath',
    },
  },
  {
    id: 'n15a-020',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'Next.js 15 generateStaticParams lists paths to prerender, and dynamicParams defaults to true so unknown params render on demand and can then be cached. Next.js 16 with cacheComponents does not allow the dynamicParams export, and an empty generateStaticParams array errors.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'generateStaticParams returns red and blue. A request arrives for /green. What happens in Next.js 15?',
    code: {
      lang: 'tsx',
      source: "export const dynamicParams = true;\n\nexport async function generateStaticParams() {\n  return [{ slug: \"red\" }, { slug: \"blue\" }];\n}\n\nexport default async function Page({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <h1>{slug}</h1>;\n}\n",
    },
    options: [
      'Next.js returns a 404 because green was not returned from generateStaticParams.',
      'The build fails because dynamicParams is true while the list is not empty.',
      'green is prerendered at build anyway because dynamicParams defaults to true.',
      'green is rendered on demand, and that result can then be cached.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Unknown params are rendered on demand when dynamicParams is true, and the result can be cached.',
      why:
        'generateStaticParams returns red and blue, so those paths can be prerendered at build. dynamicParams is true, which is also the default, so a request for green is allowed. The page awaits params and renders that slug. Next.js renders green when the request arrives, and that result can then be cached like the prerendered paths. A 404 would happen if dynamicParams were false. The build does not fail just because the static list is shorter than the live URL space.',
      wrong: [
        {
          option: 'Next.js returns a 404 because green was not returned from generateStaticParams.',
          reason:
            'A 404 is what dynamicParams false does for unknown params. This file sets dynamicParams to true.',
        },
        {
          option: 'The build fails because dynamicParams is true while the list is not empty.',
          reason:
            'A non-empty list plus dynamicParams true is a normal ISR setup. The build can prerender red and blue.',
        },
        {
          option: 'green is prerendered at build anyway because dynamicParams defaults to true.',
          reason:
            'Only the returned params are prerendered at build. green waits for a request.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamicParams = true;\n\nexport async function generateStaticParams() {\n  return [{ slug: \"red\" }, { slug: \"blue\" }];\n}\n\nexport default async function Page({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <h1>{slug}</h1>;\n}\n" },
      remember: 'dynamicParams true renders unknown params on demand, then can cache them.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
    },
  },
  {
    id: 'n15a-021',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'In Next.js 15, dynamicParams false means unknown params 404, and true (the default) renders them on demand. Next.js 16 with cacheComponents does not allow the dynamicParams export.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'The author expects /products/99 to render on the first request. generateStaticParams only returns id 1. What is the bug?',
    code: {
      lang: 'tsx',
      source: "export const dynamicParams = false;\n\nexport async function generateStaticParams() {\n  return [{ id: \"1\" }];\n}\n\nexport default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  return <p>{id}</p>;\n}\n",
    },
    options: [
      'dynamicParams is false, so an id that was not returned from generateStaticParams 404s instead of rendering on demand.',
      'generateStaticParams must return an empty array or on-demand rendering is disabled.',
      'Awaiting params forces every id to 404.',
      'The field must be named slug, or dynamicParams is ignored.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'dynamicParams false turns unknown ids into 404s. Set it to true to render them on demand.',
      why:
        'generateStaticParams returns only id 1, so that path can be prerendered. dynamicParams is set to false, which means any other id, including 99, is not rendered on demand. The page function awaits params and would render the id, but that function does not run for an unknown param when the flag is false. The default is true, which renders the unknown path on demand and can then cache it. Awaiting params is the correct Next.js 15 read and is not what causes the 404.',
      wrong: [
        {
          option: 'generateStaticParams must return an empty array or on-demand rendering is disabled.',
          reason:
            'An empty array prerenders nothing at build. On-demand rendering of unknown params is controlled by dynamicParams, not by emptying the list.',
        },
        {
          option: 'Awaiting params forces every id to 404.',
          reason:
            'Awaiting params is required for the async request API. The 404 comes from dynamicParams false.',
        },
        {
          option: 'The field must be named slug, or dynamicParams is ignored.',
          reason:
            'The param name just has to match the folder. id is valid, and dynamicParams is not ignored.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamicParams = true;\n\nexport async function generateStaticParams() {\n  return [{ id: \"1\" }];\n}\n\nexport default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  return <p>{id}</p>;\n}\n" },
      remember: 'dynamicParams false 404s unknown params. true renders them on demand.',
      fixedCode: {
        lang: 'tsx',
        source: "export const dynamicParams = true;\n\nexport async function generateStaticParams() {\n  return [{ id: \"1\" }];\n}\n\nexport default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  return <p>{id}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
    },
  },
  {
    id: 'n15a-022',
    tech: 'next15',
    topic: 'isr',
    versionNote:
      'In Next.js 15, generateStaticParams that returns an empty array prerenders nothing at build, and the first request renders that path. dynamicParams still defaults to true. In Next.js 16 with cacheComponents, an empty array errors and the dynamicParams export is not allowed.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'generateStaticParams returns an empty array for a dynamic segment. What happens in Next.js 15, and what changes in Next.js 16 with cacheComponents?',
    options: [
      'Next.js 15 prerenders every possible path from the empty array. Next.js 16 ignores the function.',
      'Next.js 15 prerenders nothing at build, and the first request renders that path. dynamicParams still defaults to true. Next.js 16 with cacheComponents errors on the empty array and does not allow the dynamicParams export.',
      'Next.js 15 fails the build. Next.js 16 treats the empty array as prerender the layout only.',
      'Both versions treat an empty array as unknown params 404.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Next.js 15 renders the first request on demand. Next.js 16 with cacheComponents rejects the empty array.',
      why:
        'generateStaticParams lists the paths to prerender at build. An empty array means there is nothing to prerender then, so the first request renders that path. dynamicParams defaults to true, so unknown params are allowed and can be cached after that render. This is different from dynamicParams false, which 404s unknown params. In Next.js 16 with cacheComponents, returning an empty array is an error, and you are not allowed to export dynamicParams. The use cache directive is how that mode marks work that should be cached.',
      wrong: [
        {
          option:
            'Next.js 15 prerenders every possible path from the empty array. Next.js 16 ignores the function.',
          reason:
            'An empty list prerenders nothing. Next.js 16 with cacheComponents errors on that empty array instead of ignoring it.',
        },
        {
          option: 'Next.js 15 fails the build. Next.js 16 treats the empty array as prerender the layout only.',
          reason:
            'The Next.js 15 build succeeds and waits for the first request. The Next.js 16 cacheComponents mode errors.',
        },
        {
          option: 'Both versions treat an empty array as unknown params 404.',
          reason:
            'A 404 comes from dynamicParams false. An empty list in Next.js 15 still allows on-demand rendering.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamicParams = true;\n\nexport async function generateStaticParams() {\n  return [];\n}\n\nexport default async function Page({\n  params,\n}: {\n  params: Promise<{ slug: string }>;\n}) {\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n// Next.js 16 cacheComponents errors on an empty array and disallows dynamicParams." },
      remember: 'An empty generateStaticParams list prerenders nothing in Next.js 15. It errors under Next.js 16 cacheComponents.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/generate-static-params',
    },
  },
  {
    id: 'n15a-023',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 can prerender a page that only fetches, and that HTML and RSC payload can sit in the Full Route Cache. Next.js 16 can still prerender a static shell, and with cacheComponents you opt into cached work with the use cache directive.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'A page only calls fetch. It does not read cookies, headers, or searchParams, and it does not call connection(). Can Next.js 15 prerender it?',
    options: [
      'No. Any fetch forces the route to run on every request.',
      'Yes, but only the client JavaScript bundle is prerendered. The RSC payload is always dynamic.',
      'Yes. Next.js 15 can prerender it at build, and that HTML and RSC payload can sit in the Full Route Cache.',
      'No. The Full Route Cache was removed in Next.js 15, so every page renders on request.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'A fetch-only page can be prerendered, and the result can sit in the Full Route Cache.',
      why:
        'The Full Route Cache stores prerendered HTML and the RSC payload, the React Server Components data for a route. Fetch by itself does not opt the route into per-request rendering, so Next.js 15 can produce that HTML at build. If the fetch has no cache option, its response is still not stored in the Data Cache, the persistent store of fetch results, but the rendered page can still be reused from the Full Route Cache. To run on every request, call connection(), read cookies, headers, or searchParams, or export dynamic set to force-dynamic.',
      wrong: [
        {
          option: 'No. Any fetch forces the route to run on every request.',
          reason:
            'A fetch does not by itself make the route dynamic. The page can be prerendered.',
        },
        {
          option: 'Yes, but only the client JavaScript bundle is prerendered. The RSC payload is always dynamic.',
          reason:
            'The Full Route Cache stores both the HTML and the RSC payload for a prerendered route.',
        },
        {
          option: 'No. The Full Route Cache was removed in Next.js 15, so every page renders on request.',
          reason:
            'The Full Route Cache is still how Next.js 15 stores prerendered routes.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/catalog\");\n  const catalog = await res.json();\n  return (\n    <main>\n      <h1>Catalog</h1>\n      <p>{catalog.length}</p>\n    </main>\n  );\n}" },
      remember: 'Fetch alone does not stop a page from being prerendered.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering',
    },
  },
  {
    id: 'n15a-024',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 connection() from next/server waits until there is a real request and opts the route into dynamic rendering. Next.js 16 still uses connection() when a fetch-only page would otherwise be prerendered and you need per-request work.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does await connection() do in this Next.js 15 page?',
    code: {
      lang: 'tsx',
      source: "import { connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}\n",
    },
    options: [
      'It writes the time fetch into the Data Cache for the default revalidate window.',
      'It is a client hook and throws when called from a Server Component.',
      'It replaces cookies() and returns the request cookie jar.',
      'It waits until there is a real request and opts the route into dynamic rendering, so this page is not served from the Full Route Cache.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'connection() waits for a real request and makes this route dynamic.',
      why:
        'The page imports connection from next/server and awaits it before fetching the time URL. That wait means the function does not finish during prerender, because there is no real request yet. The route is therefore dynamic and runs per request, so its HTML is not served from the Full Route Cache, the store of prerendered HTML and RSC payload. The RSC payload is the React Server Components data for the route. The fetch has no cache option, so its result is also not stored in the Data Cache. connection() does not read cookies.',
      wrong: [
        {
          option: 'It writes the time fetch into the Data Cache for the default revalidate window.',
          reason:
            'connection() does not add a cache option. This bare fetch stays out of the Data Cache.',
        },
        {
          option: 'It is a client hook and throws when called from a Server Component.',
          reason:
            'connection() is a server API from next/server. This Server Component is the right place to await it.',
        },
        {
          option: 'It replaces cookies() and returns the request cookie jar.',
          reason:
            'connection() does not return cookies. It only waits for a request so the route stays dynamic.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}\n" },
      remember: 'Await connection() when a fetch-only page must run on every request.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/connection',
    },
  },
  {
    id: 'n15a-025',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 can still prerender a page that only fetches, and that HTML and RSC payload can sit in the Full Route Cache. Call connection() when you need per-request work. Next.js 16 still uses connection() for that wait, and with cacheComponents you mark cached work with the use cache directive.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author wants a new timestamp on every request. The page only fetches. What is the bug?',
    code: {
      lang: 'tsx',
      source: "export default async function Page() {\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}\n",
    },
    options: [
      'A page that only fetches can still be prerendered. The HTML and RSC payload can sit in the Full Route Cache, so this timestamp is not guaranteed to run on every request.',
      'The bug is that fetch without cache force-cache throws during the build.',
      'Every fetch opts the route into per-request rendering, so the timestamp is already fresh and there is no bug.',
      'res.json() stores the page in the browser Router Cache for about five minutes.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The page can be prerendered, so the timestamp can be frozen in the Full Route Cache. Await connection() before the fetch.',
      why:
        'The page fetches the time URL with no cache option and renders data.now. A missing cache option keeps that response out of the Data Cache, the persistent server store of fetch results, but it does not stop prerendering. The Full Route Cache can still store the HTML and the RSC payload, the React Server Components data for the route, from build time. Await connection() from next/server so Next.js waits for a real request and renders dynamically. Reading cookies, headers, or searchParams, or exporting dynamic set to force-dynamic, would also opt the route into per-request work.',
      wrong: [
        {
          option: 'The bug is that fetch without cache force-cache throws during the build.',
          reason:
            'A bare fetch is allowed at build. It does not throw, and the rendered output can be reused.',
        },
        {
          option:
            'Every fetch opts the route into per-request rendering, so the timestamp is already fresh and there is no bug.',
          reason:
            'Fetch alone does not make the route dynamic. This page can be served from the Full Route Cache.',
        },
        {
          option: 'res.json() stores the page in the browser Router Cache for about five minutes.',
          reason:
            'Parsing JSON does not set the client Router Cache. About five minutes is the loading.js lifetime.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}\n" },
      remember: 'A fetch-only page can still be prerendered. connection() makes it dynamic.',
      fixedCode: {
        lang: 'tsx',
        source: "import { connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/connection',
    },
  },
  {
    id: 'n15a-026',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 runs a route on every request when you call connection(), read cookies(), headers(), or searchParams, or export dynamic = force-dynamic. Next.js 16 with cacheComponents errors on force-dynamic and force-static, and you use the use cache directive for cached work.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which choice opts a Next.js 15 route into dynamic rendering so it runs per request?',
    options: [
      'Passing cache force-cache on a fetch.',
      'Calling connection() from next/server, reading cookies(), headers(), or searchParams, or exporting dynamic = force-dynamic.',
      'Exporting generateStaticParams that returns an empty array, with no other dynamic API.',
      'Exporting revalidate = 60 from the page.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'connection(), cookies(), headers(), searchParams, and dynamic = force-dynamic all make the route run per request.',
      why:
        'connection() from next/server waits until a real request exists, which opts the route out of prerendering. Reading cookies(), headers(), or searchParams also depends on the request, so Next.js renders dynamically. Exporting dynamic set to force-dynamic does the same and defaults a bare fetch to no-store. cache force-cache stores a fetch in the Data Cache, the persistent server store of fetch results, and does not force dynamic rendering. revalidate = 60 is Incremental Static Regeneration, and an empty generateStaticParams list still prerenders nothing at build while the first request can be cached afterward.',
      wrong: [
        {
          option: 'Passing cache force-cache on a fetch.',
          reason:
            'force-cache opts that fetch into the Data Cache. It does not make the route render on every request.',
        },
        {
          option:
            'Exporting generateStaticParams that returns an empty array, with no other dynamic API.',
          reason:
            'An empty list skips build-time prerender. The first request can still render that path and then be cached.',
        },
        {
          option: 'Exporting revalidate = 60 from the page.',
          reason:
            'That is a 60 second ISR window with stale-while-revalidate, not a render on every request.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from \"next/server\";\n\nexport const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/time\");\n  const data = await res.json();\n  return <p>{data.now}</p>;\n}" },
      remember: 'connection(), request APIs, or force-dynamic make a Next.js 15 route run per request.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-027',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 dynamic = force-dynamic renders every request and defaults fetch to no-store. dynamic = force-static does the opposite and caches fetches. Next.js 16 with cacheComponents errors on both segment configs, and you opt into caching with the use cache directive.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'You need this segment to render on every request, and a fetch with no cache option should default to no-store. What do you export in Next.js 15?',
    options: [
      'dynamic = force-static.',
      'revalidate = false.',
      'dynamic = force-dynamic.',
      'experimental_ppr = true.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Export dynamic = force-dynamic. The segment renders every request, and fetch defaults to no-store.',
      why:
        'force-dynamic turns off static prerendering for the segment, so the Full Route Cache, the store of prerendered HTML and RSC payload, does not reuse this page. A fetch that omits a cache option then defaults to no-store, which also keeps it out of the Data Cache, the persistent server store of fetch results. force-static would do the reverse: static rendering, empty cookies and headers, and cached fetches. revalidate = false caches for as long as the route stays static. experimental_ppr turns on Partial Prerendering for a route when the config flag allows it, which is a different feature.',
      wrong: [
        {
          option: 'dynamic = force-static.',
          reason:
            'force-static prerenders the segment and caches fetches. It does not render every request.',
        },
        {
          option: 'revalidate = false.',
          reason:
            'revalidate false means the route can stay cached indefinitely. It is not the per-request mode.',
        },
        {
          option: 'experimental_ppr = true.',
          reason:
            'That flag opts a route into experimental Partial Prerendering. It does not set the fetch default to no-store.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/stock\");\n  const data = await res.json();\n  return <p>{data.price}</p>;\n}" },
      remember: 'force-dynamic renders every request and defaults fetch to no-store.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-028',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 dynamic = force-static forces static rendering, makes cookies() and headers() return empty values, and caches fetches. Next.js 16 with cacheComponents errors on force-static and force-dynamic, and you use the use cache directive instead.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'The browser sends a theme cookie set to dark. What does this page show in Next.js 15, and why?',
    code: {
      lang: 'tsx',
      source: "import { cookies } from \"next/headers\";\n\nexport const dynamic = \"force-static\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"none\";\n  return <p>{theme}</p>;\n}\n",
    },
    options: [
      'It shows dark. force-static still reads the request cookie and then caches that HTML for later visitors.',
      'It throws because cookies() is forbidden when dynamic is force-static.',
      'It shows dark on the first request and none after the Full Route Cache fills.',
      'It shows none. force-static makes cookies() return an empty store, and the route is statically rendered.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The paragraph shows none. force-static gives cookies() an empty store and renders the page statically.',
      why:
        'The segment sets dynamic to force-static, then awaits cookies() and looks up theme. cookies() is the async API for the request cookie jar, but under force-static that jar is empty, so get returns nothing and the text falls through to none. The dark cookie on this request is not copied into the jar. The HTML can sit in the Full Route Cache, the store of prerendered HTML and RSC payload. The RSC payload is the React Server Components data for the route. The same empty result applies to headers().',
      wrong: [
        {
          option:
            'It shows dark. force-static still reads the request cookie and then caches that HTML for later visitors.',
          reason:
            'force-static does not read request cookies into the page. The jar is empty, so the cookie value is not dark.',
        },
        {
          option: 'It throws because cookies() is forbidden when dynamic is force-static.',
          reason:
            'The call still runs. It returns an empty cookie store instead of throwing.',
        },
        {
          option: 'It shows dark on the first request and none after the Full Route Cache fills.',
          reason:
            'There is no first live read of the cookie. The static render sees an empty jar from the start.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from \"next/headers\";\n\nexport const dynamic = \"force-static\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"none\";\n  return <p>{theme}</p>;\n}\n" },
      remember: 'force-static makes cookies() and headers() return empty values.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-029',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 dynamic = force-static caches fetches and prerenders the segment. dynamic = force-dynamic renders every request and defaults fetch to no-store. Next.js 16 with cacheComponents errors on both, and cached work uses the use cache directive.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author wants a live stock price on every request. What is the bug?',
    code: {
      lang: 'tsx',
      source: "export const dynamic = \"force-static\";\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/stock\");\n  const data = await res.json();\n  return <p>{data.price}</p>;\n}\n",
    },
    options: [
      'force-static forces static rendering and caches this fetch, so the price is reused instead of loading on every request.',
      'The bug is a missing await on fetch, so the price is a Promise.',
      'force-static makes fetch throw unless you pass cache no-store.',
      'A bare fetch always opts the route into per-request rendering, so the price is already live.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'force-static caches the fetch and the page. Use force-dynamic for a price on every request.',
      why:
        'The page sets dynamic to force-static, fetches the stock URL with no cache option, and renders data.price. force-static forces static rendering and caches fetches, so this price is captured for the static output. The Full Route Cache can keep that HTML and RSC payload, the React Server Components data for the route. Deleting the export is not enough on its own, because a page that only fetches can still be prerendered. force-dynamic renders every request and defaults this fetch to no-store, which keeps it out of the Data Cache, the persistent server store of fetch results.',
      wrong: [
        {
          option: 'The bug is a missing await on fetch, so the price is a Promise.',
          reason: 'fetch is already awaited, and so is res.json(). The price variable is the parsed body.',
        },
        {
          option: 'force-static makes fetch throw unless you pass cache no-store.',
          reason:
            'The fetch runs. force-static caches it instead of throwing.',
        },
        {
          option: 'A bare fetch always opts the route into per-request rendering, so the price is already live.',
          reason:
            'A bare fetch does not force dynamic rendering, and force-static caches it.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/stock\");\n  const data = await res.json();\n  return <p>{data.price}</p>;\n}\n" },
      remember: 'force-static caches fetches. force-dynamic renders every request.',
      fixedCode: {
        lang: 'tsx',
        source: "export const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/stock\");\n  const data = await res.json();\n  return <p>{data.price}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-030',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 dynamic = force-dynamic renders the segment on every request and defaults fetch to no-store. Next.js 16 with cacheComponents errors on that segment config. Cached work there uses the use cache directive instead.',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does export const dynamic = force-dynamic change about fetch in Next.js 15?',
    options: [
      'The segment is prerendered, and fetch defaults to force-cache.',
      'The segment renders on every request, and fetch defaults to no-store.',
      'fetch starts using the Router Cache on the server for five minutes.',
      'cookies() begins returning empty values, and headers() still returns the request.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'force-dynamic renders every request, and a fetch with no cache option defaults to no-store.',
      why:
        'The segment config opts the route out of the Full Route Cache, the store of prerendered HTML and RSC payload. The RSC payload is the React Server Components data for the route. When the page then calls fetch without a cache option, that default becomes no-store, so the response is not written to the Data Cache, the persistent server store of fetch results. An explicit cache force-cache on a particular call can still opt that call into the Data Cache. Empty cookies and headers are the force-static behavior, not this one.',
      wrong: [
        {
          option: 'The segment is prerendered, and fetch defaults to force-cache.',
          reason:
            'That is closer to force-static, which prerenders and caches fetches. force-dynamic renders every request.',
        },
        {
          option: 'fetch starts using the Router Cache on the server for five minutes.',
          reason:
            'The Router Cache is in the browser. About five minutes is the loading.js client lifetime, not a server fetch default.',
        },
        {
          option: 'cookies() begins returning empty values, and headers() still returns the request.',
          reason:
            'Empty cookies and headers come from force-static. force-dynamic is the per-request mode.',
        },
      ],
      example: { lang: 'tsx', source: "export const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/feed\");\n  const data = await res.json();\n  return <p>{data.title}</p>;\n}" },
      remember: 'force-dynamic means every request, and bare fetch defaults to no-store.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-031',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 allows dynamic = force-static and dynamic = force-dynamic. Next.js 16 with cacheComponents errors on both segment configs. You opt into caching with the use cache directive instead.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A Next.js 15 page exports dynamic = force-static. You enable cacheComponents while moving to Next.js 16. What happens to that segment config?',
    options: [
      'force-static keeps working, and cacheComponents only changes Partial Prerendering.',
      'Next.js 16 rewrites force-static into revalidateTag(tag, max) automatically.',
      'The force-static segment config errors. With cacheComponents you opt into caching with the use cache directive, and force-dynamic errors too.',
      'cacheComponents requires dynamic = force-dynamic on every page, or the build fails.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Both force-static and force-dynamic error under cacheComponents. Use the use cache directive to opt into caching.',
      why:
        'In Next.js 15, force-static prerenders the segment, returns empty cookies and headers, and caches fetches. force-dynamic renders every request and defaults fetch to no-store. Next.js 16 with cacheComponents rejects those segment configs instead of honoring them. The replacement for opting into cached work is the use cache directive on the function that should be cached. A page that must run per request waits with connection() or reads request data, rather than exporting force-dynamic. revalidateTag is an invalidation API and is not a rewrite of force-static.',
      wrong: [
        {
          option: 'force-static keeps working, and cacheComponents only changes Partial Prerendering.',
          reason:
            'cacheComponents replaces the old dynamic segment config. force-static errors in that mode.',
        },
        {
          option: 'Next.js 16 rewrites force-static into revalidateTag(tag, max) automatically.',
          reason:
            'Nothing rewrites the export into revalidateTag. The segment config errors, and caching is opted into with the use cache directive.',
        },
        {
          option: 'cacheComponents requires dynamic = force-dynamic on every page, or the build fails.',
          reason:
            'force-dynamic is also an error under cacheComponents. It is not a required export.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from \"next/headers\";\n\nexport const dynamic = \"force-static\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"none\";\n  return <p>{theme}</p>;\n}\n// Next.js 16 cacheComponents errors on force-static and force-dynamic and opts in with 'use cache'." },
      remember: 'With cacheComponents, skip force-static and force-dynamic and use the use cache directive.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config',
    },
  },
  {
    id: 'n15a-032',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 searchParams is a promise, and reading it opts the page into dynamic rendering. Synchronous access still runs but warns, and Next.js 16 removes it. Next.js 16 with cacheComponents also drops force-static and force-dynamic in favor of the use cache directive.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'The request URL is /search?q=boots. How does Next.js 15 render this page?',
    code: {
      lang: 'tsx',
      source: "export default async function Page({\n  searchParams,\n}: {\n  searchParams: Promise<{ q?: string }>;\n}) {\n  const { q } = await searchParams;\n  return <p>{q ?? \"all\"}</p>;\n}\n",
    },
    options: [
      'searchParams is ignored during static rendering, so the page always shows all.',
      'The promise never resolves unless you export dynamic = force-static.',
      'The page is prerendered once at build for every possible value of q.',
      'Reading searchParams opts the route into dynamic rendering, so this request shows boots and the page is not a fully static Full Route Cache entry.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'This request shows boots. Reading searchParams makes the page dynamic.',
      why:
        'The page types searchParams as a promise and awaits it, which is the correct Next.js 15 read. q is boots for this URL, so the paragraph shows boots instead of the fallback all. Using searchParams depends on the request, so the route renders dynamically. The Full Route Cache, the store of prerendered HTML and RSC payload, does not keep one static document for every visitor. The RSC payload is the React Server Components data for the route. force-static would fight this read by pushing the page toward static rendering.',
      wrong: [
        {
          option: 'searchParams is ignored during static rendering, so the page always shows all.',
          reason:
            'The awaited query is used. boots is rendered for this request, and the route is dynamic.',
        },
        {
          option: 'The promise never resolves unless you export dynamic = force-static.',
          reason:
            'Awaiting searchParams resolves on the request. force-static is not required for the promise.',
        },
        {
          option: 'The page is prerendered once at build for every possible value of q.',
          reason:
            'Next.js does not prerender every query string. Reading searchParams opts into dynamic rendering.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page({\n  searchParams,\n}: {\n  searchParams: Promise<{ q?: string }>;\n}) {\n  const { q } = await searchParams;\n  return <p>{q ?? \"all\"}</p>;\n}\n" },
      remember: 'Await searchParams. Reading it makes the Next.js 15 page dynamic.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/page',
    },
  },
  {
    id: 'n15a-033',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 dynamic = force-static makes headers() and cookies() return empty values. Next.js 16 with cacheComponents errors on force-static and force-dynamic. Use the use cache directive for cached work, and leave request headers on a dynamic path.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author expects the x-user request header to show up on the page. What is the bug?',
    code: {
      lang: 'tsx',
      source: "import { headers } from \"next/headers\";\n\nexport const dynamic = \"force-static\";\n\nexport default async function Page() {\n  const headerList = await headers();\n  const user = headerList.get(\"x-user\") ?? \"guest\";\n  return <p>{user}</p>;\n}\n",
    },
    options: [
      'force-static makes headers() return an empty list, so x-user from the request is never seen and the page always renders guest.',
      'The bug is awaiting headers(). In Next.js 15, headers() is still synchronous and await breaks it.',
      'force-static reads x-user once and caches that user HTML for every later visitor.',
      'headers() only works in a Client Component, so the server page always gets an empty list.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'force-static empties headers(), so the page renders guest. Use force-dynamic to read the request header.',
      why:
        'The page sets dynamic to force-static, awaits headers(), and reads x-user. headers() is the async API for request headers, and the await is the correct Next.js 15 call. Under force-static the list is empty, so get returns nothing and the text is guest. The request header is not baked into one user HTML document for everyone else. Switch the segment to force-dynamic so the route renders per request and headers() can see x-user. In Next.js 16 with cacheComponents that segment config errors, and cached work uses the use cache directive instead.',
      wrong: [
        {
          option: 'The bug is awaiting headers(). In Next.js 15, headers() is still synchronous and await breaks it.',
          reason:
            'headers() is async in Next.js 15. The await is correct. force-static is what empties the list.',
        },
        {
          option: 'force-static reads x-user once and caches that user HTML for every later visitor.',
          reason:
            'force-static does not capture a real request header. The header list is empty.',
        },
        {
          option: 'headers() only works in a Client Component, so the server page always gets an empty list.',
          reason:
            'headers() is a server API from next/headers. A Client Component cannot call it this way.',
        },
      ],
      example: { lang: 'tsx', source: "import { headers } from \"next/headers\";\n\nexport const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const headerList = await headers();\n  const user = headerList.get(\"x-user\") ?? \"guest\";\n  return <p>{user}</p>;\n}\n" },
      remember: 'force-static empties headers() and cookies(). Read them on a dynamic route.',
      fixedCode: {
        lang: 'tsx',
        source: "import { headers } from \"next/headers\";\n\nexport const dynamic = \"force-dynamic\";\n\nexport default async function Page() {\n  const headerList = await headers();\n  const user = headerList.get(\"x-user\") ?? \"guest\";\n  return <p>{user}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/headers',
    },
  },
  {
    id: 'n15a-034',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'On current Next.js 15, after() from next/server is stable. The launch post called it unstable_after and required the experimental after flag. Next.js 16 keeps after() for work that runs after the response finishes, and that work still cannot change the body or set cookies on the finished response.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement about after() on current Next.js 15 is correct?',
    options: [
      'after() can set cookies on the response that is being sent, as long as the callback calls cookies().set.',
      'after() from next/server is stable. It schedules work after the response finishes, so it cannot change that body or set cookies on that response. The platform keeps the invocation alive for the extra work.',
      'after() blocks the response until the callback returns, so the user waits for the extra work.',
      'Current Next.js 15 only exports unstable_after, and the callback runs in the browser after hydration.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'after() runs after the response is finished, so it cannot change that body or those cookies.',
      why:
        'You import after from next/server and pass a callback. On current Next.js 15 that function is stable, so you do not need the old unstable_after name or the experimental after flag from the launch post. The callback is scheduled after the response finishes, which means it is too late to change the HTML or call cookies().set for that same response. The platform keeps the serverless invocation alive so the extra work can finish. Use it for logging or similar follow-up work, not for anything the user must see in this response.',
      wrong: [
        {
          option:
            'after() can set cookies on the response that is being sent, as long as the callback calls cookies().set.',
          reason:
            'The response has already finished. The callback cannot set cookies on it.',
        },
        {
          option: 'after() blocks the response until the callback returns, so the user waits for the extra work.',
          reason:
            'The work is scheduled after the response is sent. It does not hold the body back.',
        },
        {
          option:
            'Current Next.js 15 only exports unstable_after, and the callback runs in the browser after hydration.',
          reason:
            'unstable_after was the launch name. Current Next.js 15 exports stable after(), and it runs on the server.',
        },
      ],
      example: { lang: 'tsx', source: "import { after, connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  after(() => {\n    console.log(\"response finished\");\n  });\n  return <p>ready</p>;\n}" },
      remember: 'after() runs after the response. It cannot change that body or those cookies.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/after',
    },
  },
  {
    id: 'n15a-035',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 Partial Prerendering is experimental: set experimental.ppr to incremental, then export experimental_ppr = true on a layout or page. Next.js 16 removes experimental.ppr and experimental_ppr. PPR there is cacheComponents set to true.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do you enable Partial Prerendering for one route in Next.js 15?',
    options: [
      'Set cacheComponents to true and export experimental_ppr = true. That pair is the Next.js 15 switch.',
      'Export ppr = incremental from the page only. There is no config flag.',
      'Set experimental.ppr to incremental in next.config, then export experimental_ppr = true on that layout or page.',
      'PPR is on by default for every App Router route in Next.js 15.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Use experimental.ppr set to incremental, then opt in with experimental_ppr on the layout or page.',
      why:
        'Partial Prerendering, or PPR, builds a static shell and leaves holes for dynamic work. In Next.js 15 it is experimental, so the config flag comes first. experimental.ppr set to incremental lets you turn it on per layout or page with export const experimental_ppr = true. Setting the config value to true instead would turn PPR on for the whole app. The static shell is prerendered, and dynamic work inside Suspense becomes a hole that streams. Next.js 16 removes both experimental flags and uses cacheComponents set to true.',
      wrong: [
        {
          option:
            'Set cacheComponents to true and export experimental_ppr = true. That pair is the Next.js 15 switch.',
          reason:
            'cacheComponents is the Next.js 16 switch, and Next.js 16 removes experimental_ppr. Next.js 15 uses experimental.ppr.',
        },
        {
          option: 'Export ppr = incremental from the page only. There is no config flag.',
          reason:
            'The page export is experimental_ppr, and it needs experimental.ppr set to incremental in next.config.',
        },
        {
          option: 'PPR is on by default for every App Router route in Next.js 15.',
          reason:
            'PPR is experimental and off until you set the config flag. It is not the default.',
        },
      ],
      example: { lang: 'tsx', source: "// next.config sets experimental.ppr to 'incremental'.\nexport const experimental_ppr = true;\n\nexport default function Page() {\n  return (\n    <main>\n      <h1>Shop</h1>\n    </main>\n  );\n}" },
      remember: 'Next.js 15 PPR: experimental.ppr incremental, then experimental_ppr on the route.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-036',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR prerenders a static shell, and dynamic work inside Suspense becomes a hole that streams. Next.js 16 removes experimental.ppr and experimental_ppr. PPR there is cacheComponents set to true.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'next.config sets experimental.ppr to incremental. What does Next.js 15 prerender for this page?',
    code: {
      lang: 'tsx',
      source: "import { Suspense } from \"react\";\nimport { cookies } from \"next/headers\";\n\nexport const experimental_ppr = true;\n\nasync function Cart() {\n  const jar = await cookies();\n  const count = jar.get(\"cart\")?.value ?? \"0\";\n  return <span>{count}</span>;\n}\n\nexport default function Page() {\n  return (\n    <main>\n      <h1>Shop</h1>\n      <Suspense fallback={<span>loading</span>}>\n        <Cart />\n      </Suspense>\n    </main>\n  );\n}\n",
    },
    options: [
      'The whole page is static, including the cart cookie value from build time.',
      'The whole page is dynamic because any cookies() call disables the static shell.',
      'experimental_ppr prerenders only the Suspense fallback and never streams Cart.',
      'A static shell that includes the heading is prerendered. The cookies() read inside Suspense is a hole that streams on the request.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The heading is in the static shell. The cart count is a hole that streams when the request has cookies.',
      why:
        'experimental_ppr is true and the config uses incremental, so this page opts into Partial Prerendering. The page renders a heading and a Suspense boundary, which is the React boundary that shows a fallback while a child waits. Cart awaits cookies(), which is request data, and that work sits inside the boundary. Next.js prerenders the static shell, including the heading, and the cookie read becomes a hole that streams. The fallback loading shows until the count arrives. The cookie value is not frozen into the shell at build.',
      wrong: [
        {
          option: 'The whole page is static, including the cart cookie value from build time.',
          reason:
            'The cookie read is dynamic. It is a streaming hole, not a value baked into the static shell.',
        },
        {
          option: 'The whole page is dynamic because any cookies() call disables the static shell.',
          reason:
            'Inside Suspense, that dynamic work becomes a hole. The heading can still be part of the prerendered shell.',
        },
        {
          option: 'experimental_ppr prerenders only the Suspense fallback and never streams Cart.',
          reason:
            'The fallback shows while the hole streams. Cart still runs on the request and sends the count.',
        },
      ],
      example: { lang: 'tsx', source: "import { Suspense } from \"react\";\nimport { cookies } from \"next/headers\";\nexport const experimental_ppr = true;\nasync function Cart() {\n  const jar = await cookies();\n  return <span>{jar.get(\"cart\")?.value ?? \"0\"}</span>;\n}\nexport default function Page() {\n  return (\n    <main>\n      <h1>Shop</h1>\n      <Suspense fallback={<span>loading</span>}><Cart /></Suspense>\n    </main>\n  );\n}" },
      remember: 'Put dynamic work in Suspense so PPR can stream it through a hole in the shell.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-037',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental.ppr set to true turns Partial Prerendering on for the whole app. incremental plus experimental_ppr opts in one layout or page. Next.js 16 removes both flags, and PPR there is cacheComponents set to true.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'The team wanted PPR only on routes that export experimental_ppr. What is the bug in this config?',
    code: {
      lang: 'ts',
      source: "const nextConfig = {\n  experimental: {\n    ppr: true,\n  },\n};\n\nexport default nextConfig;\n",
    },
    options: [
      'experimental.ppr true turns PPR on for the whole app. Use incremental, then export experimental_ppr on the layouts or pages you want.',
      'The bug is export default. PPR is enabled by exporting experimental_ppr from the config file.',
      'ppr true already means only routes that export experimental_ppr, so the config matches the goal.',
      'experimental.ppr was removed in Next.js 15, so the flag does nothing until Next.js 16.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'true enables PPR for the whole app. Set the flag to incremental and opt in per route.',
      why:
        'The config sets experimental.ppr to true. In Next.js 15 that value turns Partial Prerendering on for the whole app, not only for files that export experimental_ppr. The gradual switch is experimental.ppr set to incremental, plus export const experimental_ppr = true on each layout or page you want. The static shell is then prerendered, and dynamic work inside Suspense streams as a hole. Next.js 16 removes experimental.ppr and experimental_ppr, and PPR there is cacheComponents set to true.',
      wrong: [
        {
          option: 'The bug is export default. PPR is enabled by exporting experimental_ppr from the config file.',
          reason:
            'A default export is the normal next.config shape. experimental_ppr belongs on a layout or page, not on the config object.',
        },
        {
          option:
            'ppr true already means only routes that export experimental_ppr, so the config matches the goal.',
          reason:
            'true is the whole-app switch. incremental is the per-route switch.',
        },
        {
          option: 'experimental.ppr was removed in Next.js 15, so the flag does nothing until Next.js 16.',
          reason:
            'The flag exists in Next.js 15 and changes rendering. Next.js 16 is the version that removes it.',
        },
      ],
      example: { lang: 'ts', source: "const nextConfig = {\n  experimental: {\n    ppr: \"incremental\",\n  },\n};\n\nexport default nextConfig;\n" },
      remember: 'ppr true is the whole app. ppr incremental is opt-in per layout or page.',
      fixedCode: {
        lang: 'ts',
        source: "const nextConfig = {\n  experimental: {\n    ppr: \"incremental\",\n  },\n};\n\nexport default nextConfig;\n",
      },
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-038',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 enables PPR with experimental.ppr and experimental_ppr. Next.js 16 removes experimental.ppr and experimental_ppr. PPR there is cacheComponents set to true.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'A Next.js 15 app sets experimental.ppr to incremental and exports experimental_ppr. What replaces that in Next.js 16?',
    options: [
      'Keep the experimental_ppr export and set experimental.ppr to false.',
      'Remove experimental.ppr and experimental_ppr. Turn PPR on with cacheComponents set to true in next.config.',
      'Rename the page export from experimental_ppr to cacheComponents.',
      'PPR was removed in Next.js 16, so delete Suspense boundaries and render everything dynamically.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Next.js 16 drops the experimental PPR flags. cacheComponents set to true is the PPR switch.',
      why:
        'Next.js 15 PPR is experimental. incremental in next.config plus experimental_ppr on a layout or page prerenders a static shell and streams dynamic holes inside Suspense. Suspense is the React boundary that shows a fallback while a child waits. Next.js 16 removes both experimental.ppr and experimental_ppr, so leaving those exports in place is not the upgrade. Set cacheComponents to true instead. The use cache directive is how that mode opts a function into cached work inside the new model.',
      wrong: [
        {
          option: 'Keep the experimental_ppr export and set experimental.ppr to false.',
          reason:
            'Next.js 16 removes both the config flag and the segment export. Setting the flag to false does not enable the new model.',
        },
        {
          option: 'Rename the page export from experimental_ppr to cacheComponents.',
          reason:
            'cacheComponents is a next.config flag, not a page export that replaces experimental_ppr.',
        },
        {
          option:
            'PPR was removed in Next.js 16, so delete Suspense boundaries and render everything dynamically.',
          reason:
            'PPR stays, under cacheComponents set to true. Suspense holes are still how dynamic parts stream.',
        },
      ],
      example: { lang: 'tsx', source: "// next.config sets experimental.ppr to 'incremental'.\nexport const experimental_ppr = true;\n\nexport default function Page() {\n  return (\n    <main>\n      <h1>Catalog</h1>\n    </main>\n  );\n}\n// Next.js 16 removes experimental.ppr and experimental_ppr. PPR is cacheComponents set to true." },
      remember: 'Next.js 16 PPR is cacheComponents true, not experimental_ppr.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-039',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 PPR prerenders a static shell, and dynamic work inside Suspense becomes a hole that streams. The feature is experimental via experimental.ppr. Next.js 16 removes experimental.ppr and experimental_ppr, and PPR there is cacheComponents set to true.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'Incremental PPR is on for a product page. The price comes from a static fetch. The greeting reads cookies() inside Suspense. What should the user receive first?',
    options: [
      'A blank document until cookies() resolves. PPR does not send a shell.',
      'The greeting baked from build-time cookies, then a client refetch of the price.',
      'The prerendered static shell, including the static price, with the Suspense fallback in the greeting hole until the cookie greeting streams.',
      'Only the Suspense fallback, because static content is discarded when any Suspense boundary exists.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'The user gets the static shell first, then the greeting streams into the Suspense hole.',
      why:
        'Partial Prerendering prerenders the static shell, so the price from the static fetch can be in the first HTML. The greeting reads cookies(), which is per-request work, and it sits inside Suspense, the React boundary that shows a fallback while a child waits. That work becomes a hole that streams rather than blocking the whole document. The fallback shows in the hole until the greeting arrives. Next.js 15 needs experimental.ppr for this. Next.js 16 uses cacheComponents set to true instead of experimental_ppr.',
      wrong: [
        {
          option: 'A blank document until cookies() resolves. PPR does not send a shell.',
          reason:
            'The point of the static shell is to send the prerendered part immediately. The cookie read does not blank the page.',
        },
        {
          option: 'The greeting baked from build-time cookies, then a client refetch of the price.',
          reason:
            'Build-time cookies are not used for the greeting. The price is the static part, and the greeting streams on the request.',
        },
        {
          option:
            'Only the Suspense fallback, because static content is discarded when any Suspense boundary exists.',
          reason:
            'Static content stays in the shell. Suspense wraps the dynamic hole and does not discard the price.',
        },
      ],
      example: { lang: 'tsx', source: "import { Suspense } from \"react\";\nimport { cookies } from \"next/headers\";\nexport const experimental_ppr = true;\nasync function Greeting() {\n  const jar = await cookies();\n  return <p>{jar.get(\"name\")?.value ?? \"there\"}</p>;\n}\nexport default async function Page() {\n  const res = await fetch(\"https://example.com/price\", { cache: \"force-cache\" });\n  const data = await res.json();\n  return <main><p>{data.price}</p><Suspense fallback={<p>loading</p>}><Greeting /></Suspense></main>;\n}" },
      remember: 'The shell arrives first. Cookie work inside Suspense streams into the hole.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-040',
    tech: 'next15',
    topic: 'ppr',
    versionNote:
      'Next.js 15 lets a layout or a page export experimental_ppr when experimental.ppr is incremental. Next.js 16 removes experimental_ppr and experimental.ppr. PPR there is cacheComponents set to true.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'next.config sets experimental.ppr to incremental. What does this layout export do in Next.js 15?',
    code: {
      lang: 'tsx',
      source: "import type { ReactNode } from \"react\";\n\nexport const experimental_ppr = true;\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <section>\n      <h1>Catalog</h1>\n      {children}\n    </section>\n  );\n}\n",
    },
    options: [
      'It forces every child page to force-static and disables Suspense.',
      'It is ignored on layouts. Only page files can export experimental_ppr.',
      'It enables cacheComponents for this segment only.',
      'It opts this layout into Partial Prerendering, so the static shell can be prerendered and dynamic holes inside Suspense can stream.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The layout opts into PPR. Its static shell can be prerendered, and Suspense holes can stream.',
      why:
        'The file exports experimental_ppr set to true from a layout, and the config is incremental, which is the Next.js 15 way to opt in one segment. The layout renders a heading and children. The heading can be part of the static shell, the prerendered HTML around any dynamic holes. Dynamic work inside Suspense, the React boundary that shows a fallback while a child waits, becomes a hole that streams. The export is valid on a layout, not only on a page. cacheComponents is the Next.js 16 config flag and is not turned on by this export.',
      wrong: [
        {
          option: 'It forces every child page to force-static and disables Suspense.',
          reason:
            'PPR keeps Suspense holes for dynamic work. It does not turn children into force-static pages.',
        },
        {
          option: 'It is ignored on layouts. Only page files can export experimental_ppr.',
          reason:
            'Next.js 15 accepts experimental_ppr on a layout or a page when the config is incremental.',
        },
        {
          option: 'It enables cacheComponents for this segment only.',
          reason:
            'cacheComponents is the Next.js 16 app config. This export is the Next.js 15 experimental_ppr flag.',
        },
      ],
      example: { lang: 'tsx', source: "import type { ReactNode } from \"react\";\n\nexport const experimental_ppr = true;\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <section>\n      <h1>Catalog</h1>\n      {children}\n    </section>\n  );\n}\n" },
      remember: 'experimental_ppr on a layout or page opts that segment into Next.js 15 PPR.',
      docs: 'https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering',
    },
  },
  {
    id: 'n15a-041',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 makes cookies() async, and synchronous access still runs but warns. Next.js 16 removes that synchronous access, so the cookie jar must be awaited. The codemod is next-async-request-api.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This page reads the theme cookie. What is the bug in Next.js 15?',
    code: {
      lang: 'tsx',
      source: "import { cookies } from \"next/headers\";\n\nexport default async function Page() {\n  const theme = cookies().get(\"theme\")?.value ?? \"light\";\n  return <p>{theme}</p>;\n}\n",
    },
    options: [
      'cookies() is async in Next.js 15. Synchronous .get still runs but warns, and Next.js 16 removes it. Await the cookie jar before calling get.',
      'cookies() is still synchronous in Next.js 15, so this page is already correct.',
      'The bug is the light fallback. A theme cookie must be read in middleware or it is always empty.',
      'A fetch must run before cookies(), or the jar returns an empty store.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Await cookies() before get. Synchronous access warns in Next.js 15 and is removed in Next.js 16.',
      why:
        'The page imports cookies from next/headers and immediately calls get on the return value. In Next.js 15, cookies() returns a promise, so the supported read is to await the jar and then call get. Synchronous access still runs in Next.js 15, but it warns. Next.js 16 removes that sync path, so this line will not keep working. The same rule covers headers(), draftMode(), params, and searchParams. The codemod next-async-request-api rewrites these calls.',
      wrong: [
        {
          option: 'cookies() is still synchronous in Next.js 15, so this page is already correct.',
          reason:
            'The supported Next.js 15 API is async. Sync access only remains as a temporary warning.',
        },
        {
          option:
            'The bug is the light fallback. A theme cookie must be read in middleware or it is always empty.',
          reason:
            'A page can read cookies after awaiting them. Middleware is not required for this cookie.',
        },
        {
          option: 'A fetch must run before cookies(), or the jar returns an empty store.',
          reason:
            'cookies() does not depend on a prior fetch. The missing await is the bug.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from \"next/headers\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"light\";\n  return <p>{theme}</p>;\n}\n" },
      remember: 'Await cookies() in Next.js 15. Sync access warns now and goes away in Next.js 16.',
      fixedCode: {
        lang: 'tsx',
        source: "import { cookies } from \"next/headers\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"light\";\n  return <p>{theme}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/cookies',
    },
  },
  {
    id: 'n15a-042',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 headers() is async, and you should await it. Synchronous access still runs but warns, and Next.js 16 removes it. Reading headers also opts the route into dynamic rendering in Next.js 15.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'The request Host header is shop.example. What does this Next.js 15 page do?',
    code: {
      lang: 'tsx',
      source: "import { headers } from \"next/headers\";\n\nexport default async function Page() {\n  const headerList = await headers();\n  const host = headerList.get(\"host\") ?? \"unknown\";\n  return <p>{host}</p>;\n}\n",
    },
    options: [
      'It shows unknown, because headers() is empty unless dynamic is force-static.',
      'It shows shop.example. headers() is async and must be awaited, and reading it opts the route into dynamic rendering.',
      'It prerenders shop.example into the Full Route Cache and reuses that host for every later request.',
      'await headers() is a client API and throws in a Server Component.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The paragraph shows the request host. The await is correct, and the route is dynamic.',
      why:
        'The page awaits headers(), then reads the host header, which is shop.example for this request, so the paragraph shows that host. headers() is async in Next.js 15, and awaiting it is the supported call. Reading request headers opts the route into dynamic rendering, so this HTML is not a static Full Route Cache entry. The Full Route Cache stores prerendered HTML and the RSC payload, the React Server Components data for a route. Synchronous header access would warn in Next.js 15 and is removed in Next.js 16.',
      wrong: [
        {
          option: 'It shows unknown, because headers() is empty unless dynamic is force-static.',
          reason:
            'An empty header list is what force-static does. This page does not set force-static, so the request host is visible.',
        },
        {
          option:
            'It prerenders shop.example into the Full Route Cache and reuses that host for every later request.',
          reason:
            'Reading headers() makes the route dynamic. The host is taken from this request, not frozen for every host.',
        },
        {
          option: 'await headers() is a client API and throws in a Server Component.',
          reason:
            'headers() is a server API from next/headers. A Server Component is the right place to await it.',
        },
      ],
      example: { lang: 'tsx', source: "import { headers } from \"next/headers\";\n\nexport default async function Page() {\n  const headerList = await headers();\n  const host = headerList.get(\"host\") ?? \"unknown\";\n  return <p>{host}</p>;\n}\n" },
      remember: 'Await headers(). Reading them makes the Next.js 15 route dynamic.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/headers',
    },
  },
  {
    id: 'n15a-043',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 params is a promise, and synchronous property access still runs but warns. Next.js 16 removes that access, so await params in a Server Component, or unwrap it with React.use in a client component.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This dynamic page prints params.id. What is the bug in Next.js 15?',
    code: {
      lang: 'tsx',
      source: "export default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  return <p>{params.id}</p>;\n}\n",
    },
    options: [
      'params.id is the supported Next.js 15 read, so this page is already correct.',
      'The Promise type is the bug. Next.js 15 params is still a plain object.',
      'params is a promise. Reading params.id is synchronous access, which warns in Next.js 15 and is removed in Next.js 16. Await params first.',
      'Dynamic segments are not passed to pages in Next.js 15, so id is always missing.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'params is a promise, so await it and then read id. Sync access warns in Next.js 15 and disappears in Next.js 16.',
      why:
        'The prop is typed as a promise of the id object, and the page reads params.id immediately. That is the old synchronous access. Next.js 15 still runs it, but it warns, because you are supposed to await params and then read id. Next.js 16 removes the sync path, so the await is required. The same promise rule applies to searchParams, cookies(), headers(), and draftMode(). A client component cannot be async, so it unwraps the promise with React.use instead.',
      wrong: [
        {
          option: 'params.id is the supported Next.js 15 read, so this page is already correct.',
          reason:
            'The supported read is await params. Direct property access is the legacy path that warns.',
        },
        {
          option: 'The Promise type is the bug. Next.js 15 params is still a plain object.',
          reason:
            'The promise type matches Next.js 15. Treating params as a plain object is the outdated style.',
        },
        {
          option: 'Dynamic segments are not passed to pages in Next.js 15, so id is always missing.',
          reason:
            'The id is still passed. It arrives inside the promise, and you await that promise to read it.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page({\n  params,\n}: {\n  params: Promise<{ id: string }>;\n}) {\n  const { id } = await params;\n  return <p>{id}</p>;\n}" },
      remember: 'Await params and searchParams in Next.js 15. Sync access is on the way out.',
      fixedCode: {
        lang: 'tsx',
        source: "export default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  return <p>{id}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/page',
    },
  },
  {
    id: 'n15a-044',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 still runs synchronous cookies(), headers(), draftMode(), params, and searchParams access, but it warns. Next.js 16 removes that synchronous access. The codemod that rewrites the calls is next-async-request-api.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A helper used by a Server Component still calls cookies() synchronously. What happens on Next.js 15, and what changes on Next.js 16?',
    options: [
      'Next.js 15 throws on the first sync call. Next.js 16 turns that call into a cached fetch.',
      'Both versions accept sync access with no warning, so the helper can stay as it is.',
      'Next.js 15 ignores the call and returns an empty jar. Next.js 16 makes cookies() synchronous again.',
      'On Next.js 15 the sync call still runs but warns. Next.js 16 removes synchronous access, so it must be awaited. The codemod is next-async-request-api.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Next.js 15 warns and still runs the sync call. Next.js 16 removes it, so the helper must await cookies().',
      why:
        'cookies(), headers(), draftMode(), params, and searchParams are async in Next.js 15, and the supported style is to await them. The old synchronous access still runs in that version so existing apps keep working, and Next.js logs a warning. Next.js 16 removes the sync path, so the helper will fail until it awaits the cookie jar and then reads the value. The codemod next-async-request-api rewrites these call sites. Client components unwrap the same promise with React.use, because a client component cannot be async.',
      wrong: [
        {
          option: 'Next.js 15 throws on the first sync call. Next.js 16 turns that call into a cached fetch.',
          reason:
            'Next.js 15 warns rather than throwing. Next.js 16 removes sync access. It does not turn cookies() into a fetch.',
        },
        {
          option: 'Both versions accept sync access with no warning, so the helper can stay as it is.',
          reason:
            'Next.js 15 already warns. Next.js 16 does not keep the sync call.',
        },
        {
          option:
            'Next.js 15 ignores the call and returns an empty jar. Next.js 16 makes cookies() synchronous again.',
          reason:
            'The sync call still runs in Next.js 15. Next.js 16 does not go back to a synchronous cookies().',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from \"next/headers\";\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get(\"theme\")?.value ?? \"light\";\n  return <p>{theme}</p>;\n}\n// Next.js 15 warns on sync cookies(). Next.js 16 removes that synchronous access." },
      remember: 'Sync request APIs warn in Next.js 15 and are removed in Next.js 16.',
      docs: 'https://nextjs.org/docs/messages/sync-dynamic-apis',
    },
  },
  {
    id: 'n15a-045',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 passes searchParams as a promise. A client component unwraps it with React.use, because client components cannot be async. Synchronous access warns in Next.js 15 and is removed in Next.js 16.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'A Server Component passes the searchParams promise into this client component. The URL is /find?q=hats. What does the heading show?',
    code: {
      lang: 'tsx',
      source: "\"use client\";\n\nimport { use } from \"react\";\n\nexport function SearchHeading({ searchParams }: { searchParams: Promise<{ q?: string }> }) {\n  const { q } = use(searchParams);\n  return <h1>{q ?? \"Search\"}</h1>;\n}\n",
    },
    options: [
      'The heading shows hats. Client components cannot be async, so React.use unwraps the searchParams promise.',
      'use() is server-only, so this throws during hydration and the heading stays empty.',
      'The promise is ignored, so the heading always shows Search.',
      'Client components must call cookies() instead of use(), so the query never arrives.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The heading shows hats. React.use unwraps the searchParams promise in the client component.',
      why:
        'The file starts with the client directive, so this component cannot be an async function and cannot await searchParams. It calls use from React on the promise, which is the React.use API, and reads q. For /find?q=hats, q is hats, so the heading shows hats instead of the Search fallback. Passing the promise from a Server Component into this client component is the supported Next.js 15 pattern. Synchronous property access on the promise would warn in Next.js 15 and is removed in Next.js 16.',
      wrong: [
        {
          option: 'use() is server-only, so this throws during hydration and the heading stays empty.',
          reason:
            'React.use is how a client component reads the promise. It is valid in this client file.',
        },
        {
          option: 'The promise is ignored, so the heading always shows Search.',
          reason:
            'use reads the promise. hats is present on this URL, so the fallback is not used.',
        },
        {
          option: 'Client components must call cookies() instead of use(), so the query never arrives.',
          reason:
            'cookies() is a server API. The query arrives through the searchParams promise and React.use.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { use } from \"react\";\n\nexport function SearchHeading({ searchParams }: { searchParams: Promise<{ q?: string }> }) {\n  const { q } = use(searchParams);\n  return <h1>{q ?? \"Search\"}</h1>;\n}" },
      remember: 'In a client component, unwrap params or searchParams with React.use.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/page',
    },
  },
  {
    id: 'n15a-046',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 provides the next-async-request-api codemod to await cookies(), headers(), draftMode(), params, and searchParams. Synchronous access still warns in that version. Next.js 16 removes synchronous access entirely.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does the next-async-request-api codemod rewrite?',
    options: [
      'Bare fetch calls, turning them back into the Next.js 14 force-cache default.',
      'Synchronous cookies(), headers(), draftMode(), params, and searchParams access, into the awaited form used by Next.js 15.',
      'experimental.ppr, turning it on for the whole app.',
      'revalidateTag calls, adding the Next.js 16 cacheLife profile so a Next.js 15 app typechecks as Next.js 16.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The codemod rewrites synchronous cookies, headers, draftMode, params, and searchParams access to awaited calls.',
      why:
        'Those five request APIs are async in Next.js 15, so Server Components should await them before reading values. Older code touched them synchronously. The codemod named next-async-request-api updates those call sites to the awaited form. Synchronous access still runs in Next.js 15, but it warns, and Next.js 16 removes it. The codemod does not change fetch caching, PPR flags, or the revalidateTag signature. Client components still unwrap a passed promise with React.use.',
      wrong: [
        {
          option: 'Bare fetch calls, turning them back into the Next.js 14 force-cache default.',
          reason:
            'Fetch caching is a separate Next.js 15 change. This codemod rewrites the async request APIs.',
        },
        {
          option: 'experimental.ppr, turning it on for the whole app.',
          reason:
            'PPR is the experimental.ppr config. The codemod name next-async-request-api is about request APIs.',
        },
        {
          option:
            'revalidateTag calls, adding the Next.js 16 cacheLife profile so a Next.js 15 app typechecks as Next.js 16.',
          reason:
            'Next.js 15 revalidateTag takes one argument. This codemod does not add the Next.js 16 profile.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies, headers, draftMode } from \"next/headers\";\n\nexport default async function Page({\n  params,\n  searchParams,\n}: {\n  params: Promise<{ id: string }>;\n  searchParams: Promise<{ q?: string }>;\n}) {\n  const [{ id }, query] = await Promise.all([params, searchParams]);\n  const jar = await cookies();\n  const headerList = await headers();\n  const preview = await draftMode();\n  const theme = jar.get(\"theme\")?.value ?? \"light\";\n  return <p>{id}:{query.q ?? \"\"}:{theme}:{headerList.get(\"host\")}:{String(preview.isEnabled)}</p>;\n}" },
      remember: 'next-async-request-api awaits cookies, headers, draftMode, params, and searchParams.',
      docs: 'https://nextjs.org/docs/messages/sync-dynamic-apis',
    },
  },
  {
    id: 'n15a-047',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 draftMode() is async, like cookies() and headers(). Synchronous isEnabled access still runs but warns. Next.js 16 removes that synchronous access.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This page checks draft mode during render. What is the bug in Next.js 15?',
    code: {
      lang: 'tsx',
      source: "import { draftMode } from \"next/headers\";\n\nexport default async function Page() {\n  const preview = draftMode().isEnabled;\n  return <p>{preview ? \"draft\" : \"live\"}</p>;\n}\n",
    },
    options: [
      'draftMode() is synchronous in Next.js 15, so isEnabled is already the correct read.',
      'draftMode only works in a Route Handler, so a page cannot tell draft from live.',
      'draftMode() is async. Synchronous isEnabled warns in Next.js 15 and is removed in Next.js 16. Await draftMode() before reading isEnabled.',
      'isEnabled is always true while a page is statically rendered, so the text is always draft.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Await draftMode() and then read isEnabled. The sync property access warns in Next.js 15 and is gone in Next.js 16.',
      why:
        'The page imports draftMode from next/headers and reads isEnabled immediately. In Next.js 15, draftMode() returns a promise, so the supported code awaits it and then reads isEnabled to choose draft or live. Synchronous access still runs, but it warns. Next.js 16 removes that sync path. This is the same async rule as cookies(), headers(), params, and searchParams. The codemod next-async-request-api covers these APIs.',
      wrong: [
        {
          option: 'draftMode() is synchronous in Next.js 15, so isEnabled is already the correct read.',
          reason:
            'draftMode() is async in Next.js 15. Reading isEnabled without await is the legacy warning path.',
        },
        {
          option: 'draftMode only works in a Route Handler, so a page cannot tell draft from live.',
          reason:
            'A Server Component page can await draftMode(). The bug is the missing await, not the file type.',
        },
        {
          option: 'isEnabled is always true while a page is statically rendered, so the text is always draft.',
          reason:
            'isEnabled reflects draft mode for the request after you await the API. Static rendering does not force it to true.',
        },
      ],
      example: { lang: 'tsx', source: "import { draftMode } from \"next/headers\";\n\nexport default async function Page() {\n  const preview = await draftMode();\n  return <p>{preview.isEnabled ? \"draft\" : \"live\"}</p>;\n}\n" },
      remember: 'Await draftMode() before isEnabled. Sync access warns in 15 and is removed in 16.',
      fixedCode: {
        lang: 'tsx',
        source: "import { draftMode } from \"next/headers\";\n\nexport default async function Page() {\n  const preview = await draftMode();\n  return <p>{preview.isEnabled ? \"draft\" : \"live\"}</p>;\n}\n",
      },
      docs: 'https://nextjs.org/docs/app/api-reference/functions/draft-mode',
    },
  },
  {
    id: 'n15a-048',
    tech: 'next15',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 connection() from next/server waits until there is a real request and opts the route into dynamic rendering. A fetch-only page can otherwise be prerendered. Next.js 16 still uses connection() for that per-request wait.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A page only fetches a public status URL. It is being prerendered, and you need it to run on every request. There is no cookie to read. What should you call in Next.js 15?',
    options: [
      'Read cookies() and ignore the value. A cookie read is the only opt-in to dynamic rendering.',
      'Export revalidate = 0. That waits for a real request in the same way connection() does.',
      'Pass cache no-store on the fetch. A page that only fetches then cannot be prerendered.',
      'Await connection() from next/server. It waits until there is a real request and opts the route into dynamic rendering.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Await connection() from next/server. That waits for a real request without reading a cookie.',
      why:
        'A page that only fetches can still be prerendered, and that HTML and RSC payload can sit in the Full Route Cache. The RSC payload is the React Server Components data for the route. connection() from next/server waits until a real request exists, which opts the route into dynamic rendering so the status fetch runs per request. You do not need to read cookies() when there is no cookie to use. cache no-store keeps that fetch out of the Data Cache, the persistent server store of fetch results, but it does not by itself stop the page from being prerendered. revalidate = 0 is not a substitute for connection().',
      wrong: [
        {
          option:
            'Read cookies() and ignore the value. A cookie read is the only opt-in to dynamic rendering.',
          reason:
            'cookies() is one opt-in. connection() exists for the case where you need per-request work and have no cookie to read.',
        },
        {
          option: 'Export revalidate = 0. That waits for a real request in the same way connection() does.',
          reason:
            'revalidate is an ISR setting. connection() is the API that waits for a request.',
        },
        {
          option: 'Pass cache no-store on the fetch. A page that only fetches then cannot be prerendered.',
          reason:
            'A fetch-only page can still be prerendered into the Full Route Cache even when the fetch is uncached.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from \"next/server\";\n\nexport default async function Page() {\n  await connection();\n  const res = await fetch(\"https://example.com/status\");\n  const data = await res.json();\n  return <p>{data.status}</p>;\n}" },
      remember: 'Use connection() when a fetch-only page must wait for a real request.',
      docs: 'https://nextjs.org/docs/app/api-reference/functions/connection',
    },
  },
] satisfies Question[];

