import type { Question } from '../types';

export const next15BlueprintQuestions: Question[] = [
  {
    id: 'n15b-025',
    tech: 'next15',
    topic: 'rendering',
    versionNote:
      'Next.js 15 does not cache a fetch that omits cache and revalidate. A static or ISR result is opt-in through revalidate. Next.js 16 with cacheComponents replaces that segment config with use cache and cacheLife.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which mapping matches CSR, SSR, SSG, and ISR in a Next.js 15 app?',
    options: [
      'CSR fetches in the browser. SSR renders on the server per request. SSG reuses build output. ISR reuses a static result and refreshes it after revalidate.',
      'CSR renders at build time. SSG fetches in the browser. ISR renders on every request and never reuses HTML.',
      'SSR and ISR are both client-only. SSG is a per-request server render with cookies().',
      'ISR waits for a fresh render before it can send HTML after the window expires.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'CSR runs in the browser, SSR renders for the request, SSG reuses a build, and ISR serves a stale static result while a refresh runs after the revalidate window.',
      why: 'Client-side rendering loads a shell and then fetches data in the browser, so the data is not in the first HTML. Server rendering runs the page on the server for that request, which is what a route becomes when it reads cookies, headers, or an uncached fetch. Static generation runs at build time and can reuse the result until you deploy again. Incremental static regeneration is the static result plus a lifetime: export const revalidate or fetch with next.revalidate. After that window, Next.js 15 can still send the previous HTML and regenerate, which is stale-while-revalidate. A fetch with no cache option is not stored in the Data Cache in Next.js 15, so a page is not static just because it uses fetch. The client fetch remains CSR even when the route around it was rendered on the server.',
      wrong: [
        {
          option: 'CSR renders at build time. SSG fetches in the browser. ISR renders on every request and never reuses HTML.',
          reason: 'Those are the other modes. Build reuse is SSG, the browser fetch is CSR, and ISR does reuse HTML.',
        },
        {
          option: 'SSR and ISR are both client-only. SSG is a per-request server render with cookies().',
          reason: 'cookies() makes a route dynamic, which is SSR. ISR and SSG are server results that can be reused.',
        },
        {
          option: 'ISR waits for a fresh render before it can send HTML after the window expires.',
          reason: 'After the window, the previous HTML can be sent while regeneration runs. Waiting would be a full dynamic render.',
        },
      ],
      example: { lang: 'tsx', source: "export const revalidate = 60;\n\nexport default async function Page() {\n  const res = await fetch('https://example.com/feed', { next: { revalidate: 60 } });\n  const data = await res.json();\n  return <p>{data.updatedAt}</p>;\n}\n" },
      remember: 'CSR is the browser. SSR is per request. SSG is the build. ISR refreshes a static result after revalidate.',
    },
  },
];

export const next16BlueprintQuestions: Question[] = [
  {
    id: 'n16b-023',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 opted into ISR with export const revalidate or next.revalidate. Next.js 16 with cacheComponents rejects that segment config and uses use cache plus cacheLife instead.',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'With cacheComponents enabled, which statement matches the old SSG and ISR ideas?',
    options: [
      'Nothing is cached until use cache. cacheLife sets the lifetime that revalidate used to set. A request API outside that scope stays dynamic.',
      'export const revalidate = 60 still sets the ISR window, and use cache is an alias for client fetching.',
      'Every fetch is static at build time, and cacheLife only affects cookies().',
      'CSR disappears, because Cache Components move every read into the browser.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Cache Components cache nothing until use cache. cacheLife is the lifetime, and reads of cookies or headers stay per request.',
      why: 'The four delivery ideas still describe what the user waits for. A client fetch is still CSR. Work that runs on each request is the dynamic, SSR-style path, and it is the default when cacheComponents is on and you never write a cache directive. A use cache scope stores its result so later requests can reuse it, which is the static idea. cacheLife(\'hours\') is the Next.js 16 replacement for a one-hour export const revalidate, including the stale-while-revalidate behavior of that lifetime. Reading cookies() or headers() inside the cached scope is rejected, because that value belongs to one visitor and must not be stored for everyone. Read the request value first and pass it in, or leave that work outside the cache so it stays dynamic.',
      wrong: [
        {
          option: 'export const revalidate = 60 still sets the ISR window, and use cache is an alias for client fetching.',
          reason: 'The segment export is rejected when cacheComponents is on. use cache marks server work, not a browser fetch.',
        },
        {
          option: 'Every fetch is static at build time, and cacheLife only affects cookies().',
          reason: 'Fetches are dynamic until a use cache scope includes them. cacheLife is the lifetime of that cached work.',
        },
        {
          option: 'CSR disappears, because Cache Components move every read into the browser.',
          reason: 'Client fetches remain client fetches. Cache Components change how server work is stored.',
        },
      ],
      example: { lang: 'tsx', source: "import { cacheLife } from 'next/cache';\n\nexport default async function Page() {\n  const posts = await getPosts();\n  return <p>{posts.length}</p>;\n}\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://example.com/posts');\n  return res.json();\n}\n" },
      remember: 'use cache opts in. cacheLife replaces revalidate. Request data stays outside the cache.',
    },
  },
];
