import type { Question } from '../types';

export const next16aQuestions = [
  {
    id: 'n16a-001',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 kept Partial Prerendering and the cache directive behind experimental.ppr, experimental.dynamicIO, and experimental.useCache. Next.js 16 replaces those flags with the single setting cacheComponents: true.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'You set cacheComponents: true in next.config. What does that switch turn on?',
    options: [
      'Cache Components, replacing experimental.dynamicIO, experimental.useCache, and the experimental PPR flags.',
      'The Next.js 15 fetch Data Cache as the default for every fetch in the app.',
      'Only the old experimental.ppr flag, under a new config name.',
      'Static generation of every route at build time, with request APIs forbidden.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'cacheComponents: true enables Cache Components and replaces the experimental flags Next.js 15 used for this model.',
      why: 'Cache Components is the Next.js 16 model for storing fetched results behind an explicit directive. Turning the flag on retires experimental.dynamicIO, experimental.useCache, and the experimental Partial Prerendering flags rather than stacking another layer on them. Partial Prerendering means a static shell with holes that stream later. The flag does not restore the old fetch Data Cache, which was the shared store for fetch results, and it does not force every route to be static.',
      wrong: [
        {
          option: 'The Next.js 15 fetch Data Cache as the default for every fetch in the app.',
          reason:
            'Cache Components does not bring back the old default. Nothing is cached until you opt in.',
        },
        {
          option: 'Only the old experimental.ppr flag, under a new config name.',
          reason:
            'experimental.ppr is removed, along with experimental.dynamicIO and experimental.useCache. cacheComponents replaces all three.',
        },
        {
          option: 'Static generation of every route at build time, with request APIs forbidden.',
          reason:
            'Routes stay dynamic until you opt into caching. Request APIs such as cookies() still exist. You await them.',
        },
      ],
      example: { lang: 'ts', source: "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  // Next.js 15 used experimental.ppr, experimental.dynamicIO, and experimental.useCache.\n  cacheComponents: true,\n};\n\nexport default nextConfig;\n" },
      remember: 'cacheComponents replaces the Next 15 experimental cache and PPR flags.',
    },
  },
  {
    id: 'n16a-002',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 cached fetch results unless you opted out with cache: no-store or unstable_noStore. Next.js 16 with Cache Components flips that default: nothing is cached until you opt in with use cache.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'With cacheComponents enabled, what is cached if you never write a cache directive?',
    options: [
      'Every fetch, until the next deployment, matching the older Next.js default.',
      'Nothing. Code stays dynamic until you opt in with the use cache directive.',
      'Only fetches that omit the cache: no-store option.',
      'Layouts and pages, while Route Handlers stay fully dynamic.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Nothing is cached by default. Work stays dynamic until a use cache directive covers it.',
      why: 'Dynamic here means the code runs for the request instead of reusing a stored result. A use cache directive is the opt-in mark that stores fetches inside its scope, which is the file, component, or function it applies to. Without that mark, Cache Components leaves the work uncached. Omitting a no-store option does not turn the old fetch default back on. Layouts, pages, and Route Handlers follow the same rule.',
      wrong: [
        {
          option: 'Every fetch, until the next deployment, matching the older Next.js default.',
          reason:
            'That was the Next.js 15 fetch Data Cache habit. Cache Components does not cache fetches unless you opt in.',
        },
        {
          option: 'Only fetches that omit the cache: no-store option.',
          reason:
            'Leaving out no-store does not select the Cache Components store. The directive is what opts in.',
        },
        {
          option: 'Layouts and pages, while Route Handlers stay fully dynamic.',
          reason:
            'No route type is cached as a group. Each scope is dynamic until it opts in.',
        },
      ],
      example: { lang: 'tsx', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nexport default async function Page() {\n  const live = await fetch('https://api.example.com/time');\n  const posts = await getPosts();\n  const stamp = await live.text();\n  return <p>{stamp}{posts.length}</p>;\n}\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n" },
      remember: 'Under Cache Components, uncached is the default. Opt in with use cache.',
    },
  },
  {
    id: 'n16a-003',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 cached a Route Handler fetch with next.revalidate or next.tags on the fetch call. Next.js 16 does not allow the use cache directive on the GET export itself. Call a helper that owns the directive.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This Route Handler was meant to cache the posts fetch. What is wrong?',
    code: {
      lang: 'ts',
      source:
        "export async function GET() {\n  'use cache';\n  const res = await fetch('https://api.example.com/posts');\n  return Response.json(await res.json());\n}\n",
    },
    options: [
      'The fetch URL has to be a relative path inside the Next.js app.',
      'GET must be a synchronous function when Cache Components is enabled.',
      'The use cache directive cannot sit on a Route Handler GET export. Move it into a helper and call that helper.',
      'Response.json was removed, so the handler cannot return JSON.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'The directive is inside GET, which is not allowed. Cache a helper, then call that helper from the handler.',
      why: 'The function opens with the use cache directive, which marks a scope so fetches inside it are stored. That directive may sit at the top of a file, at the start of a component, or at the start of a normal function. It may not sit on a Route Handler GET export. The absolute URL, the async keyword, and Response.json are all valid. Move the directive into a helper and return that helper result from GET.',
      wrong: [
        {
          option: 'The fetch URL has to be a relative path inside the Next.js app.',
          reason: 'An absolute URL is a normal fetch target. The bug is the directive on GET.',
        },
        {
          option: 'GET must be a synchronous function when Cache Components is enabled.',
          reason: 'Route Handlers stay async. The restriction is where the directive is placed.',
        },
        {
          option: 'Response.json was removed, so the handler cannot return JSON.',
          reason: 'Response.json still builds the HTTP response. It is unrelated to this cache error.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "async function getPosts() {\n  'use cache';\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nexport async function GET() {\n  return Response.json(await getPosts());\n}\n",
      },
      example: { lang: 'ts', source: "async function getPosts() {\n  'use cache';\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nexport async function GET() {\n  return Response.json(await getPosts());\n}\n" },
      remember: 'Do not put use cache on GET. Put it on a helper the handler calls.',
    },
  },
  {
    id: 'n16a-004',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 let a route read cookies() while a separate fetch Data Cache entry was stored. Next.js 16 errors if cookies(), headers(), or another request API runs inside a use cache scope.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This cached function reads the theme cookie. What happens when it runs?',
    code: {
      lang: 'ts',
      source:
        "import { cookies } from 'next/headers';\n\nasync function loadTheme() {\n  'use cache';\n  const jar = await cookies();\n  return jar.get('theme')?.value ?? 'light';\n}\n",
    },
    options: [
      'It caches one theme for every user and reuses that string until the server restarts.',
      'It works only when cacheComponents is off, and otherwise the cookie is ignored.',
      'The cookie read is skipped, so the function always returns the string light.',
      'It errors. Request APIs such as cookies() cannot run inside a use cache scope.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The function errors. Read the cookie outside the cached function and pass the plain string in.',
      why: 'loadTheme starts a use cache scope, which is shared stored work, then immediately calls cookies(). cookies() is a request API: it reads data that exists only on the current HTTP request. Next.js rejects that read inside the cached scope instead of storing one visitor cookie for everyone. The fallback string light is not returned, and turning cacheComponents off is not how you fix the call. Read the cookie first, then pass that string into the cached function as an argument.',
      wrong: [
        {
          option:
            'It caches one theme for every user and reuses that string until the server restarts.',
          reason:
            'The call errors before any shared entry is stored. A request API is not allowed in that scope.',
        },
        {
          option: 'It works only when cacheComponents is off, and otherwise the cookie is ignored.',
          reason:
            'The directive is a Cache Components feature. The cookie is not silently ignored. The read is an error.',
        },
        {
          option: 'The cookie read is skipped, so the function always returns the string light.',
          reason:
            'There is no skip-and-default behavior. cookies() inside the cached function is an error.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cookies } from 'next/headers';\n\nasync function loadThemeLabel(theme: string) {\n  'use cache';\n  const res = await fetch('https://api.example.com/themes/' + theme);\n  return res.text();\n}\n\nexport async function ThemeBanner() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value ?? 'light';\n  const label = await loadThemeLabel(theme);\n  return <p>{label}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\n\nasync function loadThemeLabel(theme: string) {\n  'use cache';\n  const res = await fetch('https://api.example.com/themes/' + theme);\n  return res.text();\n}\n\nexport async function ThemeBanner() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value ?? 'light';\n  const label = await loadThemeLabel(theme);\n  return <p>{label}</p>;\n}\n" },
      remember: 'Read cookies outside use cache, then pass the plain value in.',
    },
  },
  {
    id: 'n16a-005',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 had no stable use cache directive. The experimental form was limited. Next.js 16 lets the directive mark a file, a component, or a function, and fetches in that scope are cached.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Where is the use cache directive allowed to sit?',
    options: [
      'At the top of a file, at the start of a component, or at the start of a function. Fetches in that scope are cached.',
      'Only as the first line of a file, the same placement rule as the use client directive.',
      'Only as an option on a fetch call, beside cache and next.',
      'Only inside a Server Action, after the use server directive.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The directive can open a file, a component, or a function. Fetches inside that marked scope are cached.',
      why: 'Scope means the file, component, or function the directive applies to. A line at the top of a file covers fetches in that module. A line at the start of one function covers fetches in that function only. That is wider than a fetch option and it is not limited to Server Actions, which are functions that run on the server when a form or client calls them. File-only placement would stop you from caching a single helper.',
      wrong: [
        {
          option:
            'Only as the first line of a file, the same placement rule as the use client directive.',
          reason:
            'File scope is one legal place. Component scope and function scope are legal too.',
        },
        {
          option: 'Only as an option on a fetch call, beside cache and next.',
          reason:
            'The directive marks a scope. It is not a fetch option like the old cache or next fields.',
        },
        {
          option: 'Only inside a Server Action, after the use server directive.',
          reason:
            'Server Actions are not the only legal site. Files, components, and ordinary functions can carry it.',
        },
      ],
      example: { lang: 'tsx', source: "import { cacheLife, cacheTag } from 'next/cache';\n\n// The directive may also be the first line of the file.\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nexport async function PostList() {\n  'use cache';\n  const posts = await getPosts();\n  return <p>{posts.length}</p>;\n}\n" },
      remember: 'use cache can mark a file, a component, or a function.',
    },
  },
  {
    id: 'n16a-006',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 exposed these helpers as unstable_cacheLife and unstable_cacheTag while the feature was experimental. Next.js 16 exports the stable names cacheLife and cacheTag from next/cache, with no unstable_ prefix.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This helper was migrated off the experimental cache helpers. What is still wrong?',
    code: {
      lang: 'ts',
      source:
        "import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n",
    },
    options: [
      'cacheLife must receive a number of seconds, so the hours argument is invalid.',
      'The unstable_ names are the old experimental API. Import cacheLife and cacheTag from next/cache.',
      'cacheTag must be called above the directive, outside the function.',
      'A fetch inside use cache stays uncached unless you also pass cache: force-cache.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Drop the unstable_ prefix. cacheLife and cacheTag are stable imports from next/cache.',
      why: 'The import aliases unstable_cacheLife and unstable_cacheTag, which are the Next.js 15 experimental names. Inside the cached function, cacheLife sets a cache profile, a named lifetime such as hours, and cacheTag attaches a label used later to invalidate the entry. Both calls already sit in the right place, after the directive. The fetch in that scope is cached without cache: force-cache. Replace the import with cacheLife and cacheTag.',
      wrong: [
        {
          option: 'cacheLife must receive a number of seconds, so the hours argument is invalid.',
          reason:
            'Built-in profiles are names: seconds, minutes, hours, days, weeks, and max. hours is valid.',
        },
        {
          option: 'cacheTag must be called above the directive, outside the function.',
          reason:
            'Tag and lifetime calls belong inside the cached function, after the directive.',
        },
        {
          option: 'A fetch inside use cache stays uncached unless you also pass cache: force-cache.',
          reason:
            'The directive already caches fetches in that scope. force-cache is the old fetch option.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n",
      },
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n" },
      remember: 'Import cacheLife and cacheTag. Do not use the unstable_ prefix.',
    },
  },
  {
    id: 'n16a-007',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 set a page lifetime with export const revalidate = 3600. Next.js 16 rejects that segment export when cacheComponents is on. cacheLife with the hours profile is the replacement.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'A Next.js 15 page used export const revalidate = 3600. Which Next.js 16 call replaces that hour-long lifetime?',
    options: [
      'cacheLife(3600) inside a use cache function.',
      'revalidateTag with the argument hours, after the fetch returns.',
      'cacheLife with the hours profile, inside a function marked with use cache.',
      'cacheTag with the argument 3600, so the number is the lifetime.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'cacheLife with the hours profile, inside a use cache function, replaces export const revalidate = 3600.',
      why: 'A cache profile is a built-in name for how long a stored entry should live. The names are seconds, minutes, hours, days, weeks, and max. The hours profile is the stand-in for a 3600 second revalidate export. You pass that name to cacheLife inside the cached function. A tag is a label for later invalidation, not a timer, so encoding 3600 as a tag does not set the lifetime.',
      wrong: [
        {
          option: 'cacheLife(3600) inside a use cache function.',
          reason:
            'The built-in call takes a profile name such as hours, not the raw second count 3600.',
        },
        {
          option: 'revalidateTag with the argument hours, after the fetch returns.',
          reason:
            'revalidateTag invalidates a tag. It does not set the lifetime that revalidate = 3600 used to set.',
        },
        {
          option: 'cacheTag with the argument 3600, so the number is the lifetime.',
          reason:
            'cacheTag labels an entry. The lifetime belongs to cacheLife and a profile name.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  // Next.js 15 used export const revalidate = 3600.\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n" },
      remember: 'cacheLife with the hours profile replaces revalidate = 3600.',
    },
  },
  {
    id: 'n16a-008',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 tagged a fetch through the next.tags option, and revalidateTag later expired those entries. Next.js 16 replaces that fetch option with cacheTag inside a use cache scope.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'In Next.js 15 you tagged a fetch with next.tags set to posts. Under Cache Components, how do you attach that same tag?',
    options: [
      'Keep next.tags on the fetch call. It still writes the Cache Components entry.',
      'Pass the tag list as the second argument to cacheLife.',
      'Call revalidatePath with posts immediately after the fetch.',
      'Wrap the fetch in a use cache function and call cacheTag with posts inside it.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Put the fetch in a cached function and call cacheTag with posts. That replaces next.tags.',
      why: 'A cache tag is a label on a stored entry so a later invalidation call can find it. In Cache Components you apply that label with cacheTag from next/cache, inside the function that starts with the use cache directive. The old next.tags field on fetch is not how this model records the tag. cacheLife sets a lifetime profile, which is a named duration, not a list of tags. revalidatePath expires a URL path, and calling it after the fetch does not label the entry.',
      wrong: [
        {
          option: 'Keep next.tags on the fetch call. It still writes the Cache Components entry.',
          reason:
            'next.tags belonged to the fetch Data Cache. Cache Components uses cacheTag inside the directive.',
        },
        {
          option: 'Pass the tag list as the second argument to cacheLife.',
          reason: 'cacheLife receives a profile or a lifetime object. Tags go to cacheTag.',
        },
        {
          option: 'Call revalidatePath with posts immediately after the fetch.',
          reason:
            'revalidatePath expires a path. It does not tag the fetch you just made.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  // Next.js 15 tagged the fetch with next.tags set to posts.\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n" },
      remember: 'cacheTag with posts replaces fetch next.tags.',
    },
  },
  {
    id: 'n16a-009',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'The Next.js 15 fetch Data Cache could persist across server instances. A Next.js 16 use cache entry lives in memory for one instance, so a new deployment starts empty unless you opt into remote caching.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'Where does a normal use cache entry live, and what happens to it on a new deployment?',
    options: [
      'In memory on that server instance. It is dropped when the instance is destroyed, and it does not survive a new deployment.',
      'In the old fetch Data Cache on disk, so it survives deploys and is shared with other instances.',
      'In the browser cache, so each visitor keeps the entry after a deploy.',
      'In a cookie, so the value travels with the user across deployments.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'use cache keeps entries in memory for that server instance. They are dropped when the instance is destroyed and they do not survive a new deployment.',
      why: 'An instance is one running server process. The entry is stored in that process memory, so another machine does not see it, and stopping the process deletes it. A deployment starts new instances, so those entries are gone. The old fetch Data Cache did persist across instances. For durable storage, use the directive written as use cache: remote, or configure a cache handler.',
      wrong: [
        {
          option:
            'In the old fetch Data Cache on disk, so it survives deploys and is shared with other instances.',
          reason:
            'That persistence belonged to the old fetch Data Cache. A normal use cache entry does not survive a new deployment.',
        },
        {
          option: 'In the browser cache, so each visitor keeps the entry after a deploy.',
          reason: 'The entry is server memory for one instance, not the browser cache.',
        },
        {
          option: 'In a cookie, so the value travels with the user across deployments.',
          reason: 'Cookies are request data. They are not the use cache store.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nasync function getDurablePosts() {\n  'use cache: remote';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/archive');\n  return res.json();\n}\n" },
      remember: 'use cache is per-instance memory. It does not survive a new deployment.',
    },
  },
  {
    id: 'n16a-010',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 had no use cache: private directive. Shared fetch caching could not safely include per-request data. Next.js 16 adds this directive for dedupe inside one request, and it is not a cross-user cache.',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does the directive use cache: private actually store?',
    options: [
      'One shared copy of private user data, reused for every visitor.',
      'Request-scoped dedupe that may read runtime data. It is not a shared cache across users.',
      'A durable store that survives new deployments, the same job as use cache: remote.',
      'A replacement for cookies() that publishes the cookie jar to other requests.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'use cache: private dedupes work inside a single request and may read runtime data. It is not shared across users.',
      why: 'Dedupe means repeated calls in the same request reuse one result instead of running again. Runtime data means values that exist only for that request, such as cookies. A private cache may see that data because the result is not handed to other users. It is a different directive from use cache: remote, which is the durable store. If a short private lifetime would shrink how long the route will still serve an older result, cacheLife with stale set to Infinity keeps that private cache from shortening the route stale time.',
      wrong: [
        {
          option: 'One shared copy of private user data, reused for every visitor.',
          reason:
            'Private means this request only. It is not a shared cache across users.',
        },
        {
          option:
            'A durable store that survives new deployments, the same job as use cache: remote.',
          reason:
            'Durable cross-deployment storage is use cache: remote or a cache handler. Private is request-scoped.',
        },
        {
          option: 'A replacement for cookies() that publishes the cookie jar to other requests.',
          reason:
            'It does not replace cookies(), and it does not publish one visitor data to other requests.',
        },
      ],
      example: { lang: 'ts', source: "import { cookies } from 'next/headers';\nimport { cacheLife, cacheTag } from 'next/cache';\n\nasync function loadTheme() {\n  'use cache: private';\n  cacheLife({ stale: Infinity });\n  cacheTag('theme');\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value ?? 'light';\n  const res = await fetch('https://api.example.com/themes/' + theme);\n  return res.text();\n}\n" },
      remember: 'use cache: private is per request. It is not shared across users.',
    },
  },
  {
    id: 'n16a-011',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 unstable_cache took an explicit key-parts array, and you chose what went into it. Next.js 16 builds the use cache key from arguments and closed-over values, and those values must be serializable.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The page reads the theme cookie, then passes the cookie jar into a cached component. What is the bug?',
    code: {
      lang: 'tsx',
      source:
        "import { cookies } from 'next/headers';\n\nasync function CachedTheme({ themeJar }: { themeJar: Awaited<ReturnType<typeof cookies>> }) {\n  'use cache';\n  const theme = themeJar.get('theme')?.value ?? 'light';\n  return <p>{theme}</p>;\n}\n\nexport default async function Page() {\n  const themeJar = await cookies();\n  return <CachedTheme themeJar={themeJar} />;\n}\n",
    },
    options: [
      'A cached function is not allowed to return JSX.',
      'Awaited was removed from TypeScript, so the prop type fails for that reason alone.',
      'The cookie jar is not a serializable cache key. Read the theme string first and pass that string in.',
      'cookies() must be called inside CachedTheme, next to the use cache directive.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Pass a plain string, not the cookie jar. Arguments become the cache key and must be serializable.',
      why: 'Page awaits cookies() and passes the whole jar into CachedTheme. A cache key is the identity of a stored entry: the same key finds the same result. Next.js builds that key from the function arguments and from values the function closes over, meaning values it uses from the surrounding scope. Serializable means the value can be turned into plain data such as a string. A cookie jar is a live request object, so it cannot be that key, and the fix is to pass the theme string instead, while returning JSX from the cached function stays allowed.',
      wrong: [
        {
          option: 'A cached function is not allowed to return JSX.',
          reason: 'A cached component may return elements. The illegal value is the jar argument.',
        },
        {
          option: 'Awaited was removed from TypeScript, so the prop type fails for that reason alone.',
          reason:
            'Awaited is still valid TypeScript. The failure is the non-serializable cookie jar key.',
        },
        {
          option: 'cookies() must be called inside CachedTheme, next to the use cache directive.',
          reason:
            'Calling cookies() inside the cached function is its own error. Pass the already-read string instead.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cookies } from 'next/headers';\n\nasync function CachedTheme({ theme }: { theme: string }) {\n  'use cache';\n  const res = await fetch('https://api.example.com/themes/' + theme);\n  const label = await res.text();\n  return <p>{label}</p>;\n}\n\nexport default async function Page() {\n  const themeJar = await cookies();\n  const theme = themeJar.get('theme')?.value ?? 'light';\n  return <CachedTheme theme={theme} />;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\n\nasync function CachedTheme({ theme }: { theme: string }) {\n  'use cache';\n  const res = await fetch('https://api.example.com/themes/' + theme);\n  const label = await res.text();\n  return <p>{label}</p>;\n}\n\nexport default async function Page() {\n  const themeJar = await cookies();\n  const theme = themeJar.get('theme')?.value ?? 'light';\n  return <CachedTheme theme={theme} />;\n}\n" },
      remember: 'Cache arguments must be serializable. Pass the cookie string, not the jar.',
    },
  },
  {
    id: 'n16a-012',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'In Next.js 15, React.cache deduped calls for the rest of a single render. Next.js 16 still does that inside one render, but each use cache function has its own React cache scope, so two cached functions do not share one React.cache result.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'Two different use cache functions both call the same React.cache-wrapped loader during one page render. Do they share that React.cache result?',
    options: [
      'Yes. React.cache is one request-wide store, and use cache functions share it.',
      'They share a result only when both functions call cacheTag with the same tag.',
      'No, because React.cache was removed in Next.js 16.',
      'No. Each use cache function has its own React cache scope, so they do not share one React.cache result.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'They do not share it. Each use cache function has a separate React.cache scope.',
      why: 'React.cache wraps a function so repeated calls with the same arguments return the saved result during one render, which avoids duplicate work. That dedupe still exists. A use cache function is its own cached scope, and each of those functions gets its own React.cache store. The second cached function runs the loader again instead of reusing the saved result from the first function. Matching cacheTag labels does not join those stores. React.cache was not removed.',
      wrong: [
        {
          option: 'Yes. React.cache is one request-wide store, and use cache functions share it.',
          reason:
            'The store is per use cache function, not one store shared by every cached function in the request.',
        },
        {
          option: 'They share a result only when both functions call cacheTag with the same tag.',
          reason:
            'cacheTag labels a use cache entry for invalidation. It does not merge React.cache scopes.',
        },
        {
          option: 'No, because React.cache was removed in Next.js 16.',
          reason:
            'React.cache still dedupes inside one render. The limit is the separate scope per cached function.',
        },
      ],
      example: { lang: 'ts', source: "import { cache } from 'react';\n\nconst loadPost = cache(async (id: string) => {\n  const res = await fetch('https://api.example.com/posts/' + id);\n  return res.json();\n});\n\nasync function getTitle(id: string) {\n  'use cache';\n  return (await loadPost(id)).title;\n}\n\nasync function getBody(id: string) {\n  'use cache';\n  return (await loadPost(id)).body;\n}\n" },
      remember:
        'React.cache still dedupes inside one render. Each use cache function has its own scope.',
    },
  },
  {
    id: 'n16a-013',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 developers called unstable_noStore, or passed cache: no-store, to opt out of the fetch Data Cache. Next.js 16 with Cache Components is uncached unless you opt in, so unstable_noStore should be removed.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This page calls unstable_noStore before a fetch. With cacheComponents enabled, what should change?',
    code: {
      lang: 'tsx',
      source:
        "import { unstable_noStore as noStore } from 'next/cache';\n\nexport default async function Page() {\n  noStore();\n  const res = await fetch('https://api.example.com/time');\n  return <p>{await res.text()}</p>;\n}\n",
    },
    options: [
      'Delete the noStore call. With Cache Components, uncached is already the default.',
      'Replace noStore() with cacheLife and the seconds profile so the time stays dynamic.',
      'Add export const dynamic = force-dynamic beside the page component.',
      'Pass cache: no-store on fetch, or the page becomes static by default.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Remove unstable_noStore. The fetch is already dynamic because nothing is cached by default.',
      why: 'The page imports unstable_noStore and calls it before fetch. That helper was an opt-out: it told Next.js not to store the work that followed. Under Cache Components the opt-out is already the default, so the call should be deleted. cacheLife with a profile would opt into caching, which is the opposite of this page. The dynamic = force-dynamic segment export also errors when cacheComponents is on. A no-store fetch option is not required to keep this request dynamic.',
      wrong: [
        {
          option: 'Replace noStore() with cacheLife and the seconds profile so the time stays dynamic.',
          reason:
            'cacheLife opts into a cache profile. It does not replace an opt-out, and uncached is already the default.',
        },
        {
          option: 'Add export const dynamic = force-dynamic beside the page component.',
          reason:
            'That segment export errors when cacheComponents is on. Dynamic rendering is already the default.',
        },
        {
          option: 'Pass cache: no-store on fetch, or the page becomes static by default.',
          reason:
            'Fetches are dynamic until a use cache directive covers them. no-store is not the new requirement.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default async function Page() {\n  const res = await fetch('https://api.example.com/time');\n  return <p>{await res.text()}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "export default async function Page() {\n  // Next.js 15 called unstable_noStore before the fetch.\n  const res = await fetch('https://api.example.com/time');\n  const text = await res.text();\n  return <p>{text}</p>;\n}\n" },
      remember: 'Uncached is the default. Delete unstable_noStore.',
    },
  },
  {
    id: 'n16a-014',
    tech: 'next16',
    topic: 'caching',
    versionNote:
      'Next.js 15 unstable_cache took a key-parts array, and that cache still persists across deployments. Next.js 16 derives the use cache key from the function arguments, and that entry does not survive a deployment unless you use remote caching.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'This helper replaced unstable_cache, which used a key-parts array of posts plus id. What is the cache key now?',
    code: {
      lang: 'ts',
      source:
        "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPost(id: string) {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts/' + id);\n  return res.json();\n}\n",
    },
    options: [
      'The array of posts and id, which you still pass as a hidden second argument.',
      'The function argument id. You no longer pass a key-parts array.',
      'The tag posts, because cacheTag replaces the key-parts array.',
      'A cookie named id, because use cache keys come only from cookies.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The cache key comes from the argument id. There is no key-parts array to pass.',
      why: 'getPost receives id, marks itself with use cache, then sets the hours profile and the posts tag before fetching that id. When you migrate off unstable_cache, you move the body into a function like this and stop passing a key-parts array. The key is built from the arguments, here the string id, and from any closed-over values, which are values captured from the surrounding scope. cacheTag only labels the entry so it can be invalidated later. unstable_cache still persists across deployments, while this use cache entry does not, unless you use the remote form.',
      wrong: [
        {
          option: 'The array of posts and id, which you still pass as a hidden second argument.',
          reason:
            'The key-parts array is gone. Arguments such as id are the key. You do not pass a second array.',
        },
        {
          option: 'The tag posts, because cacheTag replaces the key-parts array.',
          reason:
            'The tag is an invalidation label. The key still comes from the arguments.',
        },
        {
          option: 'A cookie named id, because use cache keys come only from cookies.',
          reason:
            'Cookies are illegal inside this scope. The key is the serializable argument id.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPost(id: string) {\n  'use cache';\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts/' + id);\n  return res.json();\n}\n" },
      remember: 'The use cache key comes from arguments. Do not pass a key-parts array.',
    },
  },
  {
    id: 'n16a-015',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 accepted revalidateTag with only the tag. Next.js 16 requires a second cache-life profile, such as max, and the one-argument form is deprecated and a TypeScript error.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This Server Action publishes a post and then invalidates the posts tag the Next.js 15 way. What fails?',
    code: {
      lang: 'ts',
      source:
        "'use server';\n\nimport { revalidateTag } from 'next/cache';\n\nexport async function publishPost() {\n  await savePost();\n  revalidateTag('posts');\n}\n\nasync function savePost() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n}\n",
    },
    options: [
      'revalidateTag was removed. Server Actions can only call revalidatePath.',
      'The second argument must be a number of seconds, the same unit as the old revalidate export.',
      'The call is missing the required cache profile. Use revalidateTag with posts and max.',
      'The use server directive blocks revalidateTag. Move the call to a Route Handler.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Add the profile argument. revalidateTag with the tag posts and the profile max is the Next.js 16 call.',
      why: 'publishPost saves the post, then calls revalidateTag with only the tag. revalidateTag marks matching cached entries stale so a later read can refresh them. The second argument is a cache profile, a named lifetime, and max is the usual profile for this call. The one-argument form from Next.js 15 is a TypeScript error. The call means stale-while-revalidate: readers can still see the previous content while fresh data loads. It is legal in a Server Action and in a Route Handler.',
      wrong: [
        {
          option: 'revalidateTag was removed. Server Actions can only call revalidatePath.',
          reason:
            'revalidateTag remains. It now requires the profile argument, and Server Actions may call it.',
        },
        {
          option:
            'The second argument must be a number of seconds, the same unit as the old revalidate export.',
          reason:
            'The second argument is a profile name such as max, not a raw number of seconds.',
        },
        {
          option: 'The use server directive blocks revalidateTag. Move the call to a Route Handler.',
          reason:
            'Server Actions are a supported place for revalidateTag. The missing piece is the profile.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "'use server';\n\nimport { revalidateTag } from 'next/cache';\n\nexport async function publishPost() {\n  await savePost();\n  revalidateTag('posts', 'max');\n}\n\nasync function savePost() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n}\n",
      },
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidateTag } from 'next/cache';\n\nexport async function publishPost() {\n  await savePost();\n  revalidateTag('posts', 'max');\n}\n\nasync function savePost() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n}\n" },
      remember: 'revalidateTag needs a profile, as in revalidateTag with the tag and max.',
    },
  },
  {
    id: 'n16a-016',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 revalidateTag also refreshed in the background, but the one-argument call is a type error in Next.js 16. The two-argument form, such as revalidateTag with a tag and max, is stale-while-revalidate.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'A reader requests the page while fresh data for revalidateTag(posts, max) is still loading. What can that reader see?',
    options: [
      'A 404 until the fresh fetch finishes and a new cache entry is stored.',
      'An empty list, because the tag and its data were deleted.',
      'Only the fresh posts. Every reader waits until the new data is written.',
      'Stale posts. Readers can still see stale content while fresh data loads.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The reader can still see stale content while fresh data loads. That is stale-while-revalidate.',
      why: 'Stale-while-revalidate means the previous cached content stays visible, and the fresh copy loads behind that response. revalidateTag with a profile such as max works that way in Server Actions and in Route Handlers. A different behavior, read-your-writes, makes the same request wait for the new data, and that is updateTag, not this call. The tag is not deleted, and the page is not turned into a 404 while the refresh runs.',
      wrong: [
        {
          option: 'A 404 until the fresh fetch finishes and a new cache entry is stored.',
          reason:
            'Invalidating a tag does not remove the route. Readers can still receive the previous content.',
        },
        {
          option: 'An empty list, because the tag and its data were deleted.',
          reason: 'The entry is marked stale. It is not wiped to an empty payload.',
        },
        {
          option: 'Only the fresh posts. Every reader waits until the new data is written.',
          reason:
            'Waiting for fresh data is read-your-writes, which is updateTag in a Server Action. This call is stale-while-revalidate.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidateTag } from 'next/cache';\n\nexport async function publishPost() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n  // Readers can still see stale posts while fresh data loads.\n  revalidateTag('posts', 'max');\n}\n" },
      remember: 'revalidateTag with a profile is stale-while-revalidate, not read-your-writes.',
    },
  },
  {
    id: 'n16a-017',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 Route Handlers called revalidateTag. Next.js 16 adds updateTag for Server Actions only, and calling it in a Route Handler throws. Webhooks and Route Handlers use revalidateTag with a tag and max.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This Route Handler saves a post and then calls updateTag. What happens?',
    code: {
      lang: 'ts',
      source:
        "import { updateTag } from 'next/cache';\n\nexport async function POST() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n  updateTag('posts');\n  return Response.json({ ok: true });\n}\n",
    },
    options: [
      'It throws. updateTag is Server Actions only. A Route Handler uses revalidateTag with posts and max.',
      'It expires the tag only in development, and production ignores updateTag.',
      'It fails because a POST handler cannot import anything from next/cache.',
      'It fails because the tag must include a leading slash, such as /posts.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'updateTag throws in a Route Handler. Call revalidateTag with posts and max instead.',
      why: 'POST saves the post and then calls updateTag with the posts tag. updateTag expires a tag and makes the same request wait until fresh data is ready, which is called read-your-writes. That wait is supported in a Server Action, where the rest of the action should see the new data. A Route Handler is not a Server Action, so the call throws. Webhooks and other Route Handlers use revalidateTag with the tag and the max profile. The import from next/cache is valid, and the tag does not need a leading slash.',
      wrong: [
        {
          option: 'It expires the tag only in development, and production ignores updateTag.',
          reason:
            'The handler throws in either environment. updateTag is not a development-only helper.',
        },
        {
          option: 'It fails because a POST handler cannot import anything from next/cache.',
          reason:
            'Route Handlers may import revalidateTag from next/cache. They may not call updateTag.',
        },
        {
          option: 'It fails because the tag must include a leading slash, such as /posts.',
          reason:
            'A tag is a label such as posts. A leading slash is a path, which belongs to revalidatePath.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import { revalidateTag } from 'next/cache';\n\nexport async function POST() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n  revalidateTag('posts', 'max');\n  return Response.json({ ok: true });\n}\n",
      },
      example: { lang: 'ts', source: "import { revalidateTag } from 'next/cache';\n\nexport async function POST() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n  revalidateTag('posts', 'max');\n  return Response.json({ ok: true });\n}\n" },
      remember: 'Route Handlers and webhooks call revalidateTag with a profile, not updateTag.',
    },
  },
  {
    id: 'n16a-018',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 revalidateTag was stale-while-revalidate, so the same action could still read old cached data. Next.js 16 adds updateTag, Server Actions only, when that same request must wait for fresh data.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'A Server Action updates a post, and the same request must render the new data. Which call gives you read-your-writes?',
    options: [
      'revalidateTag with posts and max, because that is the only invalidation allowed in a Server Action.',
      'updateTag with posts, which expires the tag and makes this request wait for fresh data.',
      'refresh, which expires the tag and then updates the client router.',
      'revalidatePath on the home path, because updateTag was removed.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'updateTag with posts expires the tag and makes this Server Action wait for fresh data.',
      why: 'Read-your-writes means the request that just wrote the data then reads that new data, not a stale copy. updateTag does that inside a Server Action: it expires the tag and the same request waits until the fresh value is loaded. revalidateTag with a profile still allows readers to see stale content while the refresh happens. refresh from next/cache only refreshes the client router, the navigation state in the browser, and it does not by itself expire a tagged cache. updateTag was added for this case, and revalidatePath remains a separate path API.',
      wrong: [
        {
          option:
            'revalidateTag with posts and max, because that is the only invalidation allowed in a Server Action.',
          reason:
            'Server Actions may call revalidateTag, but that call is stale-while-revalidate. Read-your-writes is updateTag.',
        },
        {
          option: 'refresh, which expires the tag and then updates the client router.',
          reason:
            'refresh updates the client router from a Server Action. It does not expire a tag by itself.',
        },
        {
          option: 'revalidatePath on the home path, because updateTag was removed.',
          reason:
            'updateTag is the Server Action API for this wait. revalidatePath is unchanged and does a different job.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { updateTag } from 'next/cache';\n\nexport async function updatePost(id: string) {\n  await fetch('https://api.example.com/posts/' + id, { method: 'POST' });\n  // revalidateTag with max stays stale-while-revalidate.\n  updateTag('posts');\n}\n" },
      remember: 'In a Server Action, updateTag is the read-your-writes call.',
    },
  },
  {
    id: 'n16a-019',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 refreshed the client by returning updated Server Component output from a Server Action, without a refresh helper. Next.js 16 adds refresh from next/cache to refresh the client router, and that call does not expire tags.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does refresh from next/cache do when you call it in a Server Action?',
    options: [
      'It expires every cache tag on the server, then reloads the browser from scratch.',
      'It is the new name for revalidatePath, with the same path argument.',
      'It refreshes the client router. It does not by itself expire a tagged cache.',
      'It can be called from a webhook Route Handler to push fresh HTML to every open browser.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'refresh updates the client router from a Server Action. It does not expire a tagged cache on its own.',
      why: 'The client router is the Next.js navigation cache in the browser. refresh tells that router to ask the server for a fresh render. The tagged server cache is a different store, and expiring it is the job of updateTag or revalidateTag. A render after refresh can still read cached data when the tag was left in place. refresh is not an alias of revalidatePath, and a webhook Route Handler is not where you call it to fan out to browsers.',
      wrong: [
        {
          option: 'It expires every cache tag on the server, then reloads the browser from scratch.',
          reason:
            'refresh does not expire tags. Tag expiry is updateTag or revalidateTag.',
        },
        {
          option: 'It is the new name for revalidatePath, with the same path argument.',
          reason: 'revalidatePath is unchanged. refresh is a separate client-router call.',
        },
        {
          option:
            'It can be called from a webhook Route Handler to push fresh HTML to every open browser.',
          reason:
            'refresh runs in a Server Action for the current client router. Webhooks use revalidateTag with a profile.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { refresh } from 'next/cache';\n\nexport async function syncRouter() {\n  // Next.js 15 had no refresh helper.\n  // refresh updates the client router and does not expire a tag.\n  refresh();\n}\n" },
      remember: 'refresh updates the client router. It does not expire tags.',
    },
  },
  {
    id: 'n16a-020',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 and Next.js 16 both export revalidatePath from next/cache with the same behavior. The breaking cache changes are the required profile on revalidateTag and the new updateTag helper.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'You want to invalidate one URL path after a mutation, the same way the Next.js 15 app did. What changed for revalidatePath?',
    options: [
      'It now requires a second cache-profile argument, like revalidateTag.',
      'It was replaced by updateTag, so path invalidation is gone.',
      'It only runs when cacheComponents is set to false.',
      'Nothing. revalidatePath is unchanged.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'revalidatePath is unchanged. Keep calling it the way you did in Next.js 15.',
      why: 'revalidatePath expires the cached result for a path, which is a URL such as the blog index, rather than a tag. That function keeps the same contract in Next.js 16. It does not take a cache profile. updateTag is an extra Server Action API for tags, and it leaves path invalidation in place. Enabling cacheComponents does not turn revalidatePath off.',
      wrong: [
        {
          option: 'It now requires a second cache-profile argument, like revalidateTag.',
          reason:
            'The new required profile belongs to revalidateTag. revalidatePath did not gain that argument.',
        },
        {
          option: 'It was replaced by updateTag, so path invalidation is gone.',
          reason: 'updateTag expires a tag inside a Server Action. revalidatePath still expires a path.',
        },
        {
          option: 'It only runs when cacheComponents is set to false.',
          reason: 'cacheComponents does not disable revalidatePath.',
        },
      ],
      example: { lang: 'ts', source: "'use server';\n\nimport { revalidatePath } from 'next/cache';\n\nexport async function publishPost() {\n  await fetch('https://api.example.com/posts', { method: 'POST' });\n  revalidatePath('/blog');\n}\n" },
      remember: 'revalidatePath works as it did in Next.js 15.',
    },
  },
  {
    id: 'n16a-021',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 used the revalidate segment export to refresh a route on a timer. Next.js 16 errors on that export when cacheComponents is on. Replace it with use cache and cacheLife.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This page still exports a segment revalidate of 3600. With cacheComponents on, what is the bug?',
    code: {
      lang: 'tsx',
      source:
        "export const revalidate = 3600;\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/posts');\n  const posts: unknown[] = await res.json();\n  return <p>{posts.length}</p>;\n}\n",
    },
    options: [
      'The revalidate segment export errors. Cache the fetch with use cache and cacheLife using the hours profile.',
      'revalidate must be the string 3600 in Next.js 16.',
      '3600 is above a new maximum of 60 seconds.',
      'The page also needs dynamic set to force-static, or the fetch stays uncached.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Delete export const revalidate. Use use cache plus cacheLife with the hours profile on the fetch helper.',
      why: 'The page sets the revalidate segment export to 3600, then fetches posts. Incremental static regeneration means serving a cached page and refreshing it on a timer, and that export was the Next.js 15 timer. When cacheComponents is on, the segment exports dynamic, revalidate, fetchCache, dynamicParams, and experimental_ppr error. The hours profile is the built-in replacement for 3600 seconds. dynamic set to force-static is also rejected. The value is not rewritten as a string, and there is no 60 second cap.',
      wrong: [
        {
          option: 'revalidate must be the string 3600 in Next.js 16.',
          reason: 'The export itself errors. The replacement is cacheLife with the hours profile, not a string export.',
        },
        {
          option: '3600 is above a new maximum of 60 seconds.',
          reason: 'There is no 60 second maximum. The export is illegal under cacheComponents.',
        },
        {
          option: 'The page also needs dynamic set to force-static, or the fetch stays uncached.',
          reason:
            'force-static is one of the segment exports that error. Opt in with use cache and cacheLife.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cacheLife } from 'next/cache';\n\nasync function getPosts(): Promise<unknown[]> {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nexport default async function Page() {\n  const posts = await getPosts();\n  return <p>{posts.length}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cacheLife } from 'next/cache';\n\nasync function getPosts(): Promise<unknown[]> {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n\nexport default async function Page() {\n  const posts = await getPosts();\n  return <p>{posts.length}</p>;\n}\n" },
      remember: 'Replace export const revalidate with use cache and cacheLife.',
    },
  },
  {
    id: 'n16a-022',
    tech: 'next16',
    topic: 'isr',
    versionNote:
      'Next.js 15 webhooks called revalidateTag with one argument from a Route Handler. Next.js 16 webhooks still use a Route Handler, but the call is revalidateTag with a tag and max. updateTag throws there.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A CMS webhook hits a Route Handler after a post is published. The handler should invalidate the posts cache. Which call is correct?',
    options: [
      'updateTag with posts, so the webhook request waits and returns the fresh HTML.',
      'revalidateTag with posts and max, because a Route Handler must not call updateTag.',
      'revalidateTag with only posts, the one-argument form, which is still the typed API.',
      'refresh, so every open browser drops the posts tag immediately.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The webhook Route Handler should call revalidateTag with posts and max.',
      why: 'A webhook is an HTTP callback from another system, handled here by a Route Handler. updateTag is limited to Server Actions and throws in a Route Handler, so it cannot make the webhook wait for fresh HTML. The one-argument revalidateTag from Next.js 15 is a TypeScript error. refresh refreshes the client router from a Server Action and does not expire a tag. revalidateTag with the max profile is the supported call, and it is stale-while-revalidate, so readers can still see older posts while fresh data loads.',
      wrong: [
        {
          option: 'updateTag with posts, so the webhook request waits and returns the fresh HTML.',
          reason:
            'updateTag throws in a Route Handler. Read-your-writes is for Server Actions.',
        },
        {
          option: 'revalidateTag with only posts, the one-argument form, which is still the typed API.',
          reason:
            'The one-argument form is deprecated and a TypeScript error. Pass a profile such as max.',
        },
        {
          option: 'refresh, so every open browser drops the posts tag immediately.',
          reason:
            'refresh does not expire a tag, and it is not the webhook API. It refreshes one client router from a Server Action.',
        },
      ],
      example: { lang: 'ts', source: "import { revalidateTag } from 'next/cache';\n\nexport async function POST() {\n  // Next.js 15 called revalidateTag with only the tag.\n  // updateTag throws in a Route Handler.\n  revalidateTag('posts', 'max');\n  return Response.json({ ok: true });\n}\n" },
      remember: 'Webhooks use revalidateTag with a profile, not updateTag or refresh.',
    },
  },
  {
    id: 'n16a-023',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 used export const dynamic = force-dynamic to opt out of static rendering. Next.js 16 errors on that export when cacheComponents is on, because uncached dynamic rendering is already the default.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This page exports dynamic = force-dynamic so the feed is never cached. With cacheComponents on, what is wrong?',
    code: {
      lang: 'tsx',
      source:
        "export const dynamic = 'force-dynamic';\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/feed');\n  return <p>{await res.text()}</p>;\n}\n",
    },
    options: [
      'force-dynamic must be spelled forceDynamic in Next.js 16.',
      'Delete the dynamic export. It errors when cacheComponents is on, and dynamic is already the default.',
      'The fetch is static unless you also export revalidate = 0.',
      'The export is silently ignored, so the page keeps the Next.js 15 Data Cache.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Remove dynamic = force-dynamic. The export errors, and dynamic behavior is already the default.',
      why: 'A segment export is a route setting written next to the page, and this file sets dynamic to force-dynamic before fetching the feed. That value used to opt into request-time rendering. With cacheComponents, the dynamic export errors. You can delete it, because code stays dynamic until you add use cache. revalidate = 0 is not a replacement, and the export is not ignored in favor of the old Data Cache.',
      wrong: [
        {
          option: 'force-dynamic must be spelled forceDynamic in Next.js 16.',
          reason: 'The spelling is not the problem. The dynamic segment export itself errors.',
        },
        {
          option: 'The fetch is static unless you also export revalidate = 0.',
          reason:
            'Uncached is the default. The revalidate export also errors when cacheComponents is on.',
        },
        {
          option: 'The export is silently ignored, so the page keeps the Next.js 15 Data Cache.',
          reason:
            'The export errors. It does not fall through to the old fetch Data Cache.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default async function Page() {\n  const res = await fetch('https://api.example.com/feed');\n  return <p>{await res.text()}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "export default async function Page() {\n  // Next.js 15 used export const dynamic = 'force-dynamic'.\n  const res = await fetch('https://api.example.com/feed');\n  const text = await res.text();\n  return <p>{text}</p>;\n}\n" },
      remember: 'Delete dynamic = force-dynamic. That behavior is already the default.',
    },
  },
  {
    id: 'n16a-024',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 could force a route to be static with dynamic = force-static. Next.js 16 errors on that export when cacheComponents is on. Opt into caching with use cache and cacheLife instead.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This docs page exported dynamic = force-static in Next.js 15. What has to replace it under Cache Components?',
    code: {
      lang: 'tsx',
      source:
        "export const dynamic = 'force-static';\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/docs');\n  return <article>{await res.text()}</article>;\n}\n",
    },
    options: [
      'Leave the export. force-static is the one segment config Next.js 16 still allows.',
      'Change it to dynamic = error so a request API fails the build.',
      'Delete the export. Mark a helper with use cache and set the lifetime with cacheLife.',
      'Add fetchCache = force-cache next to the page instead.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Remove dynamic = force-static and cache the fetch with use cache plus cacheLife.',
      why: 'The page exports dynamic as force-static, then fetches the docs body. force-static used to prerender the route and fail if it touched request data. That segment export errors when cacheComponents is on, together with dynamic, revalidate, fetchCache, dynamicParams, and experimental_ppr. The replacement is a helper that starts with use cache, with cacheLife choosing a profile such as days. fetchCache = force-cache is also rejected. Leaving force-static in place does not keep the old behavior.',
      wrong: [
        {
          option: 'Leave the export. force-static is the one segment config Next.js 16 still allows.',
          reason:
            'force-static is rejected along with the other listed segment exports. It is not a leftover exception.',
        },
        {
          option: 'Change it to dynamic = error so a request API fails the build.',
          reason: 'The dynamic export errors in every form when cacheComponents is on.',
        },
        {
          option: 'Add fetchCache = force-cache next to the page instead.',
          reason:
            'fetchCache is also an illegal segment export. Wrap the fetch in a cached function.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('days');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('days');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n" },
      remember: 'Replace dynamic = force-static with use cache and cacheLife.',
    },
  },
  {
    id: 'n16a-025',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 cached a fetch with cache: force-cache and next.revalidate. Next.js 16 with Cache Components replaces both by wrapping the fetch in a function that uses use cache and cacheLife.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This fetch still uses the Next.js 15 cache options. With Cache Components, what is the bug?',
    code: {
      lang: 'tsx',
      source:
        "export default async function Page() {\n  const res = await fetch('https://api.example.com/docs', {\n    cache: 'force-cache',\n    next: { revalidate: 3600 },\n  });\n  return <article>{await res.text()}</article>;\n}\n",
    },
    options: [
      'force-cache is now the default, so the only bug is the extra next.revalidate field.',
      'revalidate inside next must be the string hours, not a number.',
      'The fetch must be changed to cache: no-store or Cache Components rejects the call.',
      'Those fetch cache options are not the Cache Components model. Wrap the fetch in use cache and set cacheLife.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Wrap the fetch in a cached function. cache: force-cache and next.revalidate are replaced by use cache and cacheLife.',
      why: 'The page passes cache force-cache and next.revalidate of 3600 on the docs fetch. Those options belonged to the fetch Data Cache. Cache Components expects a directive on a surrounding function instead. Inside that helper, cacheLife with the hours profile replaces the 3600 second revalidate. The fetch itself does not need a cache option. force-cache is not the new default, and no-store would keep the request dynamic, which is the opposite of this cached docs page.',
      wrong: [
        {
          option: 'force-cache is now the default, so the only bug is the extra next.revalidate field.',
          reason:
            'Nothing is cached by default. Both the force-cache option and next.revalidate are replaced by a cached function.',
        },
        {
          option: 'revalidate inside next must be the string hours, not a number.',
          reason:
            'The profile name hours belongs to cacheLife, not to the old next.revalidate field.',
        },
        {
          option: 'The fetch must be changed to cache: no-store or Cache Components rejects the call.',
          reason:
            'no-store is an opt-out from the old model. This page wants a cache, so it should use the directive.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n" },
      remember: 'Wrap fetch in use cache. Drop cache: force-cache and next.revalidate.',
    },
  },
  {
    id: 'n16a-026',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 allowed generateStaticParams to return an empty array when every path should be rendered on demand. Next.js 16 throws empty-generate-static-params if that array is empty. Return at least one param.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'generateStaticParams returns an empty array so every slug is rendered on demand. What happens with cacheComponents?',
    code: {
      lang: 'tsx',
      source:
        "export function generateStaticParams() {\n  return [];\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n",
    },
    options: [
      'It throws empty-generate-static-params. generateStaticParams must return at least one param.',
      'The empty array is the supported way to mark the route as fully dynamic.',
      'It prerenders a single fallback page with an empty slug.',
      'It type-errors because PageProps was removed in Next.js 16.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Returning an empty array throws. Return at least one param object.',
      why: 'generateStaticParams lists dynamic params to prepare ahead of time, such as a slug for one blog post, and this function returns an empty list. Next.js 16 rejects that empty list with the error empty-generate-static-params. You still do not have to list every slug. Paths you leave out are rendered when someone requests them. PageProps from npx next typegen types params as a promise, and that helper was not removed. Await params as this page already does.',
      wrong: [
        {
          option: 'The empty array is the supported way to mark the route as fully dynamic.',
          reason:
            'An empty return throws. Dynamic behavior is already the default, and at least one param is required if you export the function.',
        },
        {
          option: 'It prerenders a single fallback page with an empty slug.',
          reason: 'There is no empty-slug fallback. The empty array is an error.',
        },
        {
          option: 'It type-errors because PageProps was removed in Next.js 16.',
          reason:
            'PageProps is still generated by next typegen. The failure is the empty param list.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export function generateStaticParams() {\n  return [{ slug: 'hello' }];\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "export function generateStaticParams() {\n  return [{ slug: 'hello' }];\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n" },
      remember: 'generateStaticParams must return at least one param. An empty array throws.',
    },
  },
  {
    id: 'n16a-027',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 could 404 unknown params when dynamicParams was false. Next.js 16 still renders paths you did not return from generateStaticParams. Omitted params are handled on request.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'generateStaticParams returns only the slug hello. Someone requests /blog/other, and other was not in that list. What happens?',
    options: [
      'The request 404s, because missing params are unknown at runtime.',
      'The path is rendered on request. Omitted params are not automatic 404s.',
      'The build fails, because every possible slug must be returned.',
      'Next.js serves the hello page for every unknown slug.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        '/blog/other is rendered when it is requested. Leaving it out of generateStaticParams does not 404 it.',
      why: 'generateStaticParams chooses what to prerender early. Prerender means building the page before that particular request arrives. The function is not a complete allow-list. A path that was not returned is still rendered on request, which means the server builds it when a visitor asks for it. The old allow-list switch was dynamicParams set to false, and that segment export errors when cacheComponents is on. To 404 an unknown slug, call notFound() when the param is not real data.',
      wrong: [
        {
          option: 'The request 404s, because missing params are unknown at runtime.',
          reason:
            'Unknown params still render on request. A 404 requires your own notFound() check.',
        },
        {
          option: 'The build fails, because every possible slug must be returned.',
          reason:
            'You must return at least one param, not every possible slug. The rest render on request.',
        },
        {
          option: 'Next.js serves the hello page for every unknown slug.',
          reason:
            'The omitted path gets its own render with its own param. It is not rewritten to hello.',
        },
      ],
      example: { lang: 'tsx', source: "export function generateStaticParams() {\n  return [{ slug: 'hello' }];\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  // A slug left out of the list still renders when requested.\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n" },
      remember: 'Omitted generateStaticParams paths still render on request.',
    },
  },
  {
    id: 'n16a-028',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 used export const dynamicParams = false to 404 params that generateStaticParams did not return. Next.js 16 errors on that export when cacheComponents is on. Call notFound() when the param is not real data.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This route used dynamicParams set to false so unknown slugs 404. What is the Next.js 16 bug?',
    code: {
      lang: 'tsx',
      source:
        "export const dynamicParams = false;\n\nexport function generateStaticParams() {\n  return [{ slug: 'hello' }];\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  return <p>{slug}</p>;\n}\n",
    },
    options: [
      'generateStaticParams may return only one object, so the hello entry is illegal.',
      'dynamicParams must be the string false rather than the boolean false.',
      'The dynamicParams export errors. Delete it and call notFound() when the slug is not real data.',
      'Unknown slugs already 404 without any extra check, so the export is only a warning.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Remove dynamicParams. Call notFound() when the slug is not a real post.',
      why: 'The file sets dynamicParams to false and prerenders the hello slug. That false value used to turn the generateStaticParams list into an allow-list, so any other param 404ed. The export errors when cacheComponents is on. Unknown paths are still rendered on request, so a missing slug does not 404 by itself. After you await params, check the slug against real data and call notFound(), which renders the not-found UI. Returning one param is required, not illegal.',
      wrong: [
        {
          option: 'generateStaticParams may return only one object, so the hello entry is illegal.',
          reason:
            'At least one param is required. A single hello entry is a valid list. The illegal part is dynamicParams.',
        },
        {
          option: 'dynamicParams must be the string false rather than the boolean false.',
          reason: 'The boolean is not the bug. The whole dynamicParams segment export errors.',
        },
        {
          option: 'Unknown slugs already 404 without any extra check, so the export is only a warning.',
          reason:
            'Omitted params render on request. The export errors, and a real 404 is an explicit notFound() call.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { notFound } from 'next/navigation';\n\nconst posts = ['hello'];\n\nexport function generateStaticParams() {\n  return posts.map(function (slug) {\n    return { slug: slug };\n  });\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  if (!posts.includes(slug)) {\n    notFound();\n  }\n  return <p>{slug}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { notFound } from 'next/navigation';\n\nconst posts = ['hello'];\n\nexport function generateStaticParams() {\n  return posts.map(function (slug) {\n    return { slug: slug };\n  });\n}\n\nexport default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  if (!posts.includes(slug)) notFound();\n  return <p>{slug}</p>;\n}\n" },
      remember: 'Delete dynamicParams set to false. Call notFound() for unknown params.',
    },
  },
  {
    id: 'n16a-029',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 used the fetchCache segment export to force fetch caching for a whole route. Next.js 16 errors on fetchCache when cacheComponents is on. Cache the fetches you care about with use cache.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'A Next.js 15 layout exported fetchCache = force-cache. With cacheComponents enabled, what replaces that export?',
    options: [
      'experimental.dynamicIO set to false in next.config.',
      'cache: default added to every fetch call in the layout.',
      'The same export, renamed to FetchCache, which still typechecks.',
      'A function marked with use cache around the fetches you want to store.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Delete the fetchCache export and wrap the fetches in a use cache function.',
      why: 'fetchCache was a segment-wide switch for the old fetch Data Cache. A segment export is a setting beside the layout or page. fetchCache is in the list that errors under cacheComponents, together with dynamic, revalidate, dynamicParams, and experimental_ppr. experimental.dynamicIO is one of the flags that cacheComponents replaces, not a switch you keep beside it. A cached function is what opts those fetches in.',
      wrong: [
        {
          option: 'experimental.dynamicIO set to false in next.config.',
          reason:
            'cacheComponents replaces experimental.dynamicIO. Turning that old flag off does not replace fetchCache.',
        },
        {
          option: 'cache: default added to every fetch call in the layout.',
          reason:
            'A fetch cache option does not replace the segment export. Wrap the fetch in use cache.',
        },
        {
          option: 'The same export, renamed to FetchCache, which still typechecks.',
          reason: 'There is no renamed FetchCache export. The fetchCache segment export errors.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  // Next.js 15 used export const fetchCache = 'force-cache'.\n  cacheLife('days');\n  cacheTag('docs');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n" },
      remember: 'fetchCache errors under cacheComponents. Use a cached function instead.',
    },
  },
  {
    id: 'n16a-030',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 warned on a sync cookies() read inside generateMetadata, and Suspense was not a metadata escape hatch. Next.js 16 follows the same cache rules for generateMetadata, and you still cannot wrap that function in Suspense.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'generateMetadata needs the visitor cookie to choose a title. You cannot wrap that function in Suspense. What should you do?',
    options: [
      'Keep cookies out of generateMetadata. Make the dynamic choice in a Suspense child on the page, often after connection() from next/server.',
      'Wrap the generateMetadata export in Suspense and await cookies() inside the wrapper.',
      'Export dynamic = force-dynamic so metadata is allowed to read cookies again.',
      'Call cookies() inside a use cache block in generateMetadata so the title is shared.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Do not read cookies inside generateMetadata. Put the request-specific choice in a Suspense child on the page.',
      why: 'generateMetadata builds the title and other head tags for the route. It follows the normal cache rules and can use the use cache directive when it only needs external data. It cannot be wrapped in Suspense, so a cookie or headers read there cannot become a streaming hole. connection() from next/server means wait for a real request, and the usual place for that is a Suspense child in the page, where the dynamic choice is explicit. The dynamic segment export errors when cacheComponents is on, and cookies() inside use cache is an error too.',
      wrong: [
        {
          option: 'Wrap the generateMetadata export in Suspense and await cookies() inside the wrapper.',
          reason:
            'generateMetadata cannot be wrapped in Suspense. That is why the dynamic choice moves onto the page.',
        },
        {
          option: 'Export dynamic = force-dynamic so metadata is allowed to read cookies again.',
          reason:
            'That segment export errors under cacheComponents, and it does not make a cookie read legal inside a cached metadata function.',
        },
        {
          option: 'Call cookies() inside a use cache block in generateMetadata so the title is shared.',
          reason:
            'Request APIs inside a use cache scope error. A cookie also must not become one shared title for every visitor.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from 'next/server';\nimport { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return <Suspense fallback={<p>Loading</p>}><ThemeTitle /></Suspense>;\n}\n\nasync function ThemeTitle() {\n  // generateMetadata cannot be wrapped in Suspense. Read the cookie here.\n  await connection();\n  const jar = await cookies();\n  return <p>{jar.get('theme')?.value ?? 'light'}</p>;\n}\n" },
      remember:
        'generateMetadata can use use cache for external data. It cannot be wrapped in Suspense.',
    },
  },
  {
    id: 'n16a-031',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 introduced connection() so code could wait for a real request instead of running at prerender time. Next.js 16 keeps that meaning. The helper was not removed with the experimental PPR flag.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What does connection() from next/server still mean in Next.js 16?',
    options: [
      'Skip the network and read the build-time cache only.',
      'Wait until there is a real request before the code continues.',
      'Open a WebSocket from the server to the browser.',
      'It was removed together with the experimental.ppr flag.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'connection() waits for a real request. That meaning did not change.',
      why: 'Prerender means Next.js runs a component early, before a particular visitor request exists. Some work must not run that early because it depends on the request. connection() is the explicit wait for that request. It does not read a build-time cache, and it does not open a WebSocket, which would be a live two-way connection. The experimental PPR flag is gone, and connection() remains for this wait.',
      wrong: [
        {
          option: 'Skip the network and read the build-time cache only.',
          reason: 'connection() waits for a request. It is not a build-cache read.',
        },
        {
          option: 'Open a WebSocket from the server to the browser.',
          reason: 'There is no socket. The helper only waits until a real request exists.',
        },
        {
          option: 'It was removed together with the experimental.ppr flag.',
          reason: 'The experimental PPR flag was removed. connection() still means wait for a real request.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from 'next/server';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <Suspense fallback={<p>Loading</p>}>\n      <Clock />\n    </Suspense>\n  );\n}\n\nasync function Clock() {\n  await connection();\n  const res = await fetch('https://api.example.com/time');\n  return <p>{await res.text()}</p>;\n}\n" },
      remember: 'connection() still means wait for a real request.',
    },
  },
  {
    id: 'n16a-032',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 had no stable file-level use cache directive. Caching was per fetch, through the Data Cache. Next.js 16 lets the directive sit at the top of a file, and fetches in that file scope are cached.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'The use cache directive is the first line of this file. What is cached?',
    code: {
      lang: 'tsx',
      source:
        "'use cache';\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/about');\n  return <p>{await res.text()}</p>;\n}\n",
    },
    options: [
      'Nothing. The directive is only legal at the start of a function, so this file-level line is ignored.',
      'The whole route, including any cookies() call a child file adds later.',
      'Fetches in this file. A directive at the top of the file caches fetches in that scope.',
      'Only this fetch if you also pass next.revalidate on the fetch call.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Fetches in this file are cached because the directive marks the file scope.',
      why: 'The file starts with the use cache directive, then the page fetches the about text and renders it. A directive at the top of a file applies to that module, so fetches written in the file are stored. You can also place the directive at the start of a component or a function when you want a smaller scope. A different file that calls cookies() is outside this scope, and a request API inside a cached scope would error anyway. The old next.revalidate fetch option is not required once the directive is there.',
      wrong: [
        {
          option:
            'Nothing. The directive is only legal at the start of a function, so this file-level line is ignored.',
          reason:
            'File scope is legal, along with component scope and function scope. This fetch is cached.',
        },
        {
          option: 'The whole route, including any cookies() call a child file adds later.',
          reason:
            'The directive covers this file scope. Another module is not pulled in, and cookies() inside the scope would error.',
        },
        {
          option: 'Only this fetch if you also pass next.revalidate on the fetch call.',
          reason:
            'The directive caches fetches in the file. next.revalidate is the old fetch option.',
        },
      ],
      example: { lang: 'tsx', source: "'use cache';\n\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/about');\n  return <p>{await res.text()}</p>;\n}\n" },
      remember: 'A file-level use cache directive caches fetches in that file.',
    },
  },
  {
    id: 'n16a-033',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 honored the segment exports dynamic, revalidate, and fetchCache. Next.js 16 errors on those exports when cacheComponents is on, along with dynamicParams and experimental_ppr.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A Next.js 15 page still exports dynamic, revalidate, and fetchCache. You enable cacheComponents. What happens to those three exports?',
    options: [
      'Only revalidate errors. dynamic and fetchCache keep working as in Next.js 15.',
      'They are ignored with a dev warning, the same way unknown segment config was skipped before.',
      'They turn the route back onto the Next.js 15 Data Cache for that segment only.',
      'All three error. Remove them and opt into caching with use cache where you need it.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'dynamic, revalidate, and fetchCache all error. Delete them and use use cache for data you want to store.',
      why: 'Segment exports are the route settings written beside a page or layout. Under cacheComponents, Next.js rejects dynamic, revalidate, fetchCache, dynamicParams, and experimental_ppr. They are not downgraded to warnings, and they do not restore the old Data Cache for one segment. Dynamic rendering is already the default, so dynamic = force-dynamic is deleted rather than rewritten. A timed cache is expressed with use cache and cacheLife on the work you want to store.',
      wrong: [
        {
          option: 'Only revalidate errors. dynamic and fetchCache keep working as in Next.js 15.',
          reason: 'All three are in the rejected list, along with dynamicParams and experimental_ppr.',
        },
        {
          option:
            'They are ignored with a dev warning, the same way unknown segment config was skipped before.',
          reason: 'They error when cacheComponents is on. They are not soft warnings.',
        },
        {
          option: 'They turn the route back onto the Next.js 15 Data Cache for that segment only.',
          reason:
            'The exports do not re-enable the old fetch Data Cache. Remove them and opt in with use cache.',
        },
      ],
      example: { lang: 'ts', source: "import { cacheLife, cacheTag } from 'next/cache';\n\nasync function getPosts() {\n  'use cache';\n  // Next.js 15 exported dynamic, revalidate, and fetchCache.\n  cacheLife('hours');\n  cacheTag('posts');\n  const res = await fetch('https://api.example.com/posts');\n  return res.json();\n}\n" },
      remember: 'dynamic, revalidate, and fetchCache error when cacheComponents is on.',
    },
  },
  {
    id: 'n16a-034',
    tech: 'next16',
    topic: 'rendering',
    versionNote:
      'Next.js 15 would have written export const revalidate = 3600 or passed next.revalidate on the fetch. Next.js 16 expresses that hour-long cache with use cache and cacheLife using the hours profile on the helper.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'What is true about this page once cacheComponents is enabled?',
    code: {
      lang: 'tsx',
      source:
        "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n",
    },
    options: [
      'getDocs is cached with the hours profile. The page can prerender that cached result.',
      'The helper is ignored, because only fetches written directly in the page function are cached.',
      'The hours profile means the data never expires and never checks for a newer copy.',
      'The fetch skips the helper cache unless you also pass cache: force-cache.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The helper is cached for the hours profile, so the page can prerender its result.',
      why: 'getDocs starts with use cache, chooses the hours profile, fetches the docs text, and the page awaits that result. Prerender means Next.js can run the cached work ahead of a visitor and reuse the stored result. The hours profile is the built-in replacement for a 3600 second revalidate, so it is a finite lifetime rather than a forever cache. A helper is a normal place for the directive. The fetch does not also need cache: force-cache.',
      wrong: [
        {
          option:
            'The helper is ignored, because only fetches written directly in the page function are cached.',
          reason:
            'A function is a legal place for the directive. Fetches inside getDocs are cached.',
        },
        {
          option: 'The hours profile means the data never expires and never checks for a newer copy.',
          reason:
            'hours is a finite built-in profile. It is the stand-in for revalidate = 3600, not a forever cache.',
        },
        {
          option: 'The fetch skips the helper cache unless you also pass cache: force-cache.',
          reason:
            'The directive caches the fetch. force-cache is the old fetch option and is not required here.',
        },
      ],
      example: { lang: 'tsx', source: "import { cacheLife } from 'next/cache';\n\nasync function getDocs() {\n  'use cache';\n  cacheLife('hours');\n  const res = await fetch('https://api.example.com/docs');\n  return res.text();\n}\n\nexport default async function Page() {\n  const text = await getDocs();\n  return <article>{text}</article>;\n}\n" },
      remember: 'A use cache helper with the hours profile is the cached, prerenderable fetch.',
    },
  },
  {
    id: 'n16a-035',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 turned on Partial Prerendering with the experimental.ppr flag and an experimental_ppr route export. Next.js 16 removes both. The shell and the hole come from keeping request reads inside Suspense.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do you get a static shell plus a dynamic hole in Next.js 16?',
    options: [
      'Set experimental.ppr to true in next.config and export experimental_ppr on the route.',
      'Read cookies, headers, searchParams, or awaited params inside a child wrapped in Suspense. The rest of the page is the static shell.',
      'Export dynamic = force-static and read cookies in the page component itself.',
      'Wrap the root layout in one Suspense boundary so the entire app is one hole.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Put the request read in a Suspense child. The rest of the page can prerender as the static shell.',
      why: 'Partial Prerendering means sending a static shell first and streaming the dynamic parts later. The static shell is the HTML that does not depend on this request. A dynamic hole is the spot that does, such as a cookie, a header, searchParams, or an awaited param. Reading those outside Suspense blocks the shell, and Next.js reports that in dev. Suspense is the boundary that lets the rest of the page stay static while that hole streams. The experimental PPR flag and the experimental_ppr route config are gone.',
      wrong: [
        {
          option: 'Set experimental.ppr to true in next.config and export experimental_ppr on the route.',
          reason:
            'Both the config flag and the route export are removed. cacheComponents plus Suspense is the model.',
        },
        {
          option: 'Export dynamic = force-static and read cookies in the page component itself.',
          reason:
            'That segment export errors, and a cookie read outside Suspense blocks the shell.',
        },
        {
          option: 'Wrap the root layout in one Suspense boundary so the entire app is one hole.',
          reason:
            'The shell is the markup outside the request read. Wrapping the whole app makes one hole and no shell.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <>\n      <header>Docs</header>\n      <Suspense fallback={<p>Loading</p>}><Theme /></Suspense>\n    </>\n  );\n}\n\nasync function Theme() {\n  const jar = await cookies();\n  return <p>{jar.get('theme')?.value ?? 'light'}</p>;\n}\n" },
      remember: 'PPR in Next 16 is a Suspense hole around the request read, not an experimental flag.',
    },
  },
  {
    id: 'n16a-036',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR still often awaited params in the page before the return, which holds the whole page. Next.js 16 prerenders the static shell when you await params inside a Suspense child, not at the top of the page.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The header should be a static shell while the slug is still unknown. What is wrong with this page?',
    code: {
      lang: 'tsx',
      source:
        "export default async function Page({ params }: PageProps<'/blog/[slug]'>) {\n  const { slug } = await params;\n  return (\n    <>\n      <header>Blog</header>\n      <Post slug={slug} />\n    </>\n  );\n}\n\nfunction Post({ slug }: { slug: string }) {\n  return <article>{slug}</article>;\n}\n",
    },
    options: [
      'The header must be an async server component or it cannot be part of a shell.',
      'Post must call cookies() or the page has no dynamic hole.',
      'params is awaited in the page, so the shell waits. Await params in a child wrapped in Suspense.',
      'PageProps types params as a plain object, so await params is illegal.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Move the await of params into a Suspense child. Awaiting it in the page blocks the static shell.',
      why: 'The page awaits params before it returns the header and Post. params is a promise of the dynamic route values, such as the slug. Awaiting it at the top means the header cannot be sent until the slug is known, so there is no static shell while the param is unknown. Pass the promise into a child, wrap that child in Suspense, and await inside the child. The header can then prerender, and the article streams later as the dynamic hole. PageProps types params as a promise, so the await itself is correct.',
      wrong: [
        {
          option: 'The header must be an async server component or it cannot be part of a shell.',
          reason:
            'Static markup can be a normal element. The shell is blocked because the page awaits params first.',
        },
        {
          option: 'Post must call cookies() or the page has no dynamic hole.',
          reason:
            'An awaited param is already request-specific data. The bug is awaiting it outside Suspense.',
        },
        {
          option: 'PageProps types params as a plain object, so await params is illegal.',
          reason:
            'PageProps types params as a promise. You should await it, inside a Suspense child when you want a shell.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { Suspense } from 'react';\n\nexport default function Page({ params }: PageProps<'/blog/[slug]'>) {\n  return (\n    <>\n      <header>Blog</header>\n      <Suspense fallback={<p>Loading</p>}>\n        <Post params={params} />\n      </Suspense>\n    </>\n  );\n}\n\nasync function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <article>{slug}</article>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { Suspense } from 'react';\n\nexport default function Page({ params }: PageProps<'/blog/[slug]'>) {\n  return (\n    <>\n      <header>Blog</header>\n      <Suspense fallback={<p>Loading</p>}><Post params={params} /></Suspense>\n    </>\n  );\n}\n\nasync function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <article>{slug}</article>;\n}\n" },
      remember: 'Await params inside a Suspense child when the shell should prerender first.',
    },
  },
  {
    id: 'n16a-037',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR depended on the experimental.ppr flag to split a shell from a hole. Next.js 16 does that split by awaiting params inside Suspense. The header outside that boundary is the shell.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'Which part of this page can prerender as the static shell while the slug is still unknown?',
    code: {
      lang: 'tsx',
      source:
        "import { Suspense } from 'react';\n\nexport default function Page({ params }: PageProps<'/blog/[slug]'>) {\n  return (\n    <>\n      <header>Blog</header>\n      <Suspense fallback={<p>Loading</p>}>\n        <Post params={params} />\n      </Suspense>\n    </>\n  );\n}\n\nasync function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <article>{slug}</article>;\n}\n",
    },
    options: [
      'The header and the article, because params is just a prop and both can prerender.',
      'Nothing. Any Suspense boundary turns the whole route into a dynamic render with no shell.',
      'The fallback only. The header waits on params because the page function receives that prop.',
      'The header. Post is the dynamic hole and streams after the slug is known.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The header is the static shell. The Post child is the dynamic hole that streams once the slug is known.',
      why: 'The page function does not await params. It renders the header, then passes the promise into Post behind Suspense. The header has no request data, so it can prerender as the static shell, the HTML prepared before the slug exists. Suspense marks the hole, the part that is allowed to wait. Post awaits the promise, so the article streams in after the slug is known and replaces the fallback. Receiving the promise as a prop does not block the header.',
      wrong: [
        {
          option: 'The header and the article, because params is just a prop and both can prerender.',
          reason:
            'The article waits on the awaited param inside Suspense. Only the header is free of that read.',
        },
        {
          option: 'Nothing. Any Suspense boundary turns the whole route into a dynamic render with no shell.',
          reason:
            'Suspense is what preserves the shell. Siblings outside the boundary can still prerender.',
        },
        {
          option: 'The fallback only. The header waits on params because the page function receives that prop.',
          reason:
            'Holding the params prop does not block the shell. Awaiting it in the page would. The header prerenders.',
        },
      ],
      example: { lang: 'tsx', source: "import { Suspense } from 'react';\n\nexport default function Page({ params }: PageProps<'/blog/[slug]'>) {\n  return (\n    <>\n      <header>Blog</header>\n      <Suspense fallback={<p>Loading</p>}><Post params={params} /></Suspense>\n    </>\n  );\n}\n\nasync function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <article>{slug}</article>;\n}\n" },
      remember: 'Do not await params in the page. The shell is everything outside the Suspense hole.',
    },
  },
  {
    id: 'n16a-038',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR could still end up fully dynamic if cookies() ran outside the prerender boundary. Next.js 16 reports that blocking read in dev. Move cookies() into a child wrapped in Suspense so the rest of the page stays the static shell.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This page reads the theme cookie in the page component. Dev says the static shell is blocked. What is the bug?',
    code: {
      lang: 'tsx',
      source:
        "import { cookies } from 'next/headers';\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value ?? 'light';\n  return (\n    <main className={theme}>\n      <h1>Docs</h1>\n      <p>Welcome</p>\n    </main>\n  );\n}\n",
    },
    options: [
      'The cookie is read outside Suspense, so the whole page waits. Move that read into a Suspense child.',
      'cookies() is synchronous again, so await cookies() is what blocks the shell.',
      'A string className blocks the shell. Theme has to be a client state value.',
      'The heading must be a client component before any cookie read is allowed.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Move the cookies() read into a child wrapped in Suspense so the rest of the page can be the static shell.',
      why: 'The page awaits cookies() and uses the theme on the main element before it returns the heading and the welcome copy. cookies() reads this visitor request. Doing that outside Suspense means Next.js cannot send a static shell first, and it reports the blocking read in development. The welcome copy does not need the cookie. Keep that markup outside, and read the cookie in a child inside Suspense so that child is the dynamic hole. The await is required, because the synchronous cookies() form was removed.',
      wrong: [
        {
          option: 'cookies() is synchronous again, so await cookies() is what blocks the shell.',
          reason:
            'The sync form is gone. You must await cookies(). The shell block comes from where you await it.',
        },
        {
          option: 'A string className blocks the shell. Theme has to be a client state value.',
          reason:
            'A string class is ordinary markup. The request read outside Suspense is what blocks the shell.',
        },
        {
          option: 'The heading must be a client component before any cookie read is allowed.',
          reason:
            'A server child inside Suspense may await cookies(). A client component is not the requirement.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <main>\n      <Suspense fallback={<h1>Docs</h1>}>\n        <ThemeShell />\n      </Suspense>\n      <p>Welcome</p>\n    </main>\n  );\n}\n\nasync function ThemeShell() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value ?? 'light';\n  return <h1 className={theme}>Docs</h1>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <main>\n      <Suspense fallback={<h1>Docs</h1>}><ThemeShell /></Suspense>\n      <p>Welcome</p>\n    </main>\n  );\n}\n\nasync function ThemeShell() {\n  const jar = await cookies();\n  return <h1 className={jar.get('theme')?.value ?? 'light'}>Docs</h1>;\n}\n" },
      remember: 'A cookie read outside Suspense blocks the static shell.',
    },
  },
  {
    id: 'n16a-039',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 enabled Partial Prerendering with experimental.ppr in config and sometimes experimental_ppr on the route. Next.js 16 removes both. cacheComponents is the replacement.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'A Next.js 15 next.config still has experimental.ppr set to true. You upgrade and set cacheComponents: true. What is true about that PPR flag?',
    options: [
      'It still enables Partial Prerendering for every route, and cacheComponents only handles caching.',
      'It is removed. cacheComponents replaces the experimental PPR flag and the experimental_ppr route config.',
      'It turns Partial Prerendering off, so Suspense boundaries no longer create holes.',
      'It is required in addition to cacheComponents, or the static shell never prerenders.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The experimental PPR flag and the experimental_ppr route config are removed. cacheComponents replaces them.',
      why: 'Partial Prerendering is the static shell plus streamed holes. Next.js 15 kept it behind experimental flags. Next.js 16 folds that behavior into Cache Components instead of a second flag you leave turned on. You do not keep experimental.ppr beside cacheComponents, and you do not export experimental_ppr on the route. Suspense boundaries still mark a hole. Removing the old flag does not delete those boundaries.',
      wrong: [
        {
          option:
            'It still enables Partial Prerendering for every route, and cacheComponents only handles caching.',
          reason:
            'The experimental PPR flag is removed. cacheComponents is what replaces it, not a separate cache-only switch.',
        },
        {
          option: 'It turns Partial Prerendering off, so Suspense boundaries no longer create holes.',
          reason:
            'The flag is gone, and Suspense around a request read is still how a hole is marked.',
        },
        {
          option: 'It is required in addition to cacheComponents, or the static shell never prerenders.',
          reason:
            'You do not combine the old flag with cacheComponents. The old flag is removed.',
        },
      ],
      example: { lang: 'ts', source: "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  // Next.js 15 used experimental.ppr and a route export named experimental_ppr.\n  cacheComponents: true,\n};\n\nexport default nextConfig;\n" },
      remember: 'Delete experimental.ppr. Cache Components replaces that flag.',
    },
  },
  {
    id: 'n16a-040',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 already made searchParams a promise, but experimental PPR was optional, so many pages awaited it at the top. Next.js 16 blocks the static shell when you do that outside Suspense, and it reports the read in dev.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A product page awaits searchParams in the page to highlight a tab. The product grid does not depend on the query string. Dev says the static shell is blocked. What do you change?',
    options: [
      'Stop awaiting searchParams. In Next.js 16 it is a plain object again, so the await is the block.',
      'Export dynamicParams = false so the query string is allowed at prerender time.',
      'Move the searchParams read into a small Suspense child for the tab, and leave the grid outside that child.',
      'Add cache: force-cache on the grid fetch so the tab read can stay at the top of the page.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Await searchParams in a Suspense child that renders the tab. Leave the grid in the static shell.',
      why: 'searchParams is the promise of the URL query string, such as a tab value. Awaiting it in the page ties the whole return value to that request, so the grid cannot be a static shell. The static shell is the HTML that does not need this request. Suspense around a small tab child lets that hole stream while the grid prerenders. The synchronous object form was removed, so you still await the promise. dynamicParams is a rejected segment export about route params, not the query string.',
      wrong: [
        {
          option:
            'Stop awaiting searchParams. In Next.js 16 it is a plain object again, so the await is the block.',
          reason:
            'searchParams stays a promise. The sync form was fully removed. Await it inside Suspense.',
        },
        {
          option: 'Export dynamicParams = false so the query string is allowed at prerender time.',
          reason:
            'dynamicParams errors under cacheComponents, and it does not describe searchParams.',
        },
        {
          option:
            'Add cache: force-cache on the grid fetch so the tab read can stay at the top of the page.',
          reason:
            'A fetch cache option does not unblock a searchParams read outside Suspense.',
        },
      ],
      example: { lang: 'tsx', source: "import { Suspense } from 'react';\n\nexport default function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {\n  return (\n    <>\n      <section>Grid</section>\n      <Suspense fallback={<p>Loading</p>}><Tab searchParams={searchParams} /></Suspense>\n    </>\n  );\n}\n\nasync function Tab({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {\n  const { tab } = await searchParams;\n  return <p>{tab ?? 'overview'}</p>;\n}\n" },
      remember: 'Await searchParams inside Suspense, or the shell is blocked.',
    },
  },
  {
    id: 'n16a-041',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR could prerender a layout only when request APIs stayed behind a suspense boundary. Next.js 16 reports a headers() read outside Suspense as blocking the static shell. The experimental.ppr flag is not what creates the hole.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'This layout awaits headers() before it returns. What does that do to the static shell?',
    code: {
      lang: 'tsx',
      source:
        "import { headers } from 'next/headers';\nimport type { ReactNode } from 'react';\n\nexport default async function Layout({ children }: { children: ReactNode }) {\n  const headerList = await headers();\n  const host = headerList.get('host');\n  return (\n    <>\n      <p>{host}</p>\n      {children}\n      <footer>Footer</footer>\n    </>\n  );\n}\n",
    },
    options: [
      'The footer is the static shell, and the host streams in later by itself.',
      'headers() is synchronous, so the host is included in the shell with no extra wait.',
      'The layout is cached once per host, because a headers() read is a use cache key.',
      'The whole layout waits. A headers() read outside Suspense blocks the static shell.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The layout blocks the static shell. The host, the children, and the footer all wait on headers().',
      why: 'The layout awaits headers(), reads the host, and only then returns the host paragraph, the children, and the footer. headers() is a request API, so this await is request data outside Suspense. Next.js cannot freeze a static shell that includes the footer, and it reports that blocking read in dev. The footer is part of the same blocked render, not a separate hole. The synchronous headers() form was removed, so the await is the right way to read it, but the place is wrong when you wanted a shell. Move the host into a child wrapped in Suspense if the footer should prerender.',
      wrong: [
        {
          option: 'The footer is the static shell, and the host streams in later by itself.',
          reason:
            'The await happens before the return, so the footer is not separated into a shell. The whole layout waits.',
        },
        {
          option: 'headers() is synchronous, so the host is included in the shell with no extra wait.',
          reason:
            'The sync form was removed. You await headers(), and doing that outside Suspense blocks the shell.',
        },
        {
          option: 'The layout is cached once per host, because a headers() read is a use cache key.',
          reason:
            'There is no use cache directive here. A request API inside a cached scope would error anyway.',
        },
      ],
      example: { lang: 'tsx', source: "import { headers } from 'next/headers';\nimport { Suspense, type ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <>\n      <Suspense fallback={<p>Loading</p>}><Host /></Suspense>\n      {children}\n      <footer>Footer</footer>\n    </>\n  );\n}\n\nasync function Host() {\n  return <p>{(await headers()).get('host')}</p>;\n}\n" },
      remember: 'headers() outside Suspense blocks the shell, including markup below the read.',
    },
  },
  {
    id: 'n16a-042',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 experimental PPR did not always surface a blocking params read as this dev diagnostic. Next.js 16 reports the blocking read in dev when params, cookies, headers, or searchParams run outside Suspense.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'You await params in the page component, outside Suspense, and run the app in dev. What does Next.js tell you?',
    options: [
      'It reports that the static shell is blocked by that param read.',
      'It reports a type error that params is no longer a promise.',
      'It stays silent in dev and only blocks the shell in production.',
      'It reports that every page must be wrapped in Suspense, even when it has no request data.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Next.js reports in dev that the read blocks the static shell.',
      why: 'The static shell is the part of the page that can be prepared before the request-specific value is known. Awaiting params outside Suspense ties the page to that value, so there is no shell to send first. Next.js reports that during development so you can move the read into a Suspense child. params is still a promise, which is why you await it. Pages that never read request data do not need a Suspense wrapper just to exist.',
      wrong: [
        {
          option: 'It reports a type error that params is no longer a promise.',
          reason:
            'params is still a promise. The dev report is about the shell-blocking read, not a sync params type.',
        },
        {
          option: 'It stays silent in dev and only blocks the shell in production.',
          reason: 'Next.js reports the blocking read in dev.',
        },
        {
          option: 'It reports that every page must be wrapped in Suspense, even when it has no request data.',
          reason:
            'Suspense is for the dynamic hole. A page with no request read can prerender without that wrapper.',
        },
      ],
      example: { lang: 'tsx', source: "import { Suspense } from 'react';\n\nexport default function Page({ params }: PageProps<'/blog/[slug]'>) {\n  return (\n    <>\n      <header>Blog</header>\n      <Suspense fallback={<p>Loading</p>}><Post params={params} /></Suspense>\n    </>\n  );\n}\n\nasync function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return <article>{slug}</article>;\n}\n" },
      remember: 'Dev reports a shell-blocking params read. Move it into Suspense.',
    },
  },
  {
    id: 'n16a-043',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 used export const experimental_ppr = true to opt one route into Partial Prerendering. Next.js 16 removes that route config, so the export errors when cacheComponents is on, and Suspense is how the dynamic hole is marked.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This route still exports experimental_ppr so the cart can stream. With cacheComponents on, what is the bug?',
    code: {
      lang: 'tsx',
      source:
        "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport const experimental_ppr = true;\n\nexport default function Page() {\n  return (\n    <>\n      <h1>Shop</h1>\n      <Suspense fallback={<p>Loading</p>}>\n        <Cart />\n      </Suspense>\n    </>\n  );\n}\n\nasync function Cart() {\n  const jar = await cookies();\n  const count = jar.get('cart')?.value ?? '0';\n  return <p>{count}</p>;\n}\n",
    },
    options: [
      'Suspense around Cart disables streaming, so the fallback is never shown.',
      'Delete experimental_ppr. That route export errors, and the Suspense boundary is what marks the hole.',
      'experimental_ppr must be the string true when cacheComponents is enabled.',
      'Cart must be a client component. Server components cannot render inside Suspense.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Remove experimental_ppr because it errors when cacheComponents is on, and Suspense is what marks the hole.',
      why: 'The page exports experimental_ppr, renders a shop heading, and reads the cart cookie inside Cart behind Suspense. experimental_ppr was a Next.js 15 route flag. It is one of the segment exports that error under cacheComponents, with dynamic, revalidate, fetchCache, and dynamicParams. The cookie read is request data, so the Suspense boundary is what lets the heading stay in the static shell while the count streams. A server component is allowed inside Suspense. Delete the flag and keep the boundary.',
      wrong: [
        {
          option: 'Suspense around Cart disables streaming, so the fallback is never shown.',
          reason:
            'Suspense is the streaming boundary. It is what lets the cart hole render after the shell.',
        },
        {
          option: 'experimental_ppr must be the string true when cacheComponents is enabled.',
          reason: 'The export is illegal in either spelling. Delete experimental_ppr.',
        },
        {
          option: 'Cart must be a client component. Server components cannot render inside Suspense.',
          reason:
            'A server child may await cookies() inside Suspense. That child is the dynamic hole.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <>\n      <h1>Shop</h1>\n      <Suspense fallback={<p>Loading</p>}>\n        <Cart />\n      </Suspense>\n    </>\n  );\n}\n\nasync function Cart() {\n  const jar = await cookies();\n  const count = jar.get('cart')?.value ?? '0';\n  return <p>{count}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <>\n      <h1>Shop</h1>\n      <Suspense fallback={<p>Loading</p>}><Cart /></Suspense>\n    </>\n  );\n}\n\nasync function Cart() {\n  const jar = await cookies();\n  return <p>{jar.get('cart')?.value ?? '0'}</p>;\n}\n" },
      remember: 'Delete experimental_ppr. Suspense marks the dynamic hole.',
    },
  },
  {
    id: 'n16a-044',
    tech: 'next16',
    topic: 'ppr',
    versionNote:
      'Next.js 15 needed the experimental PPR flag before a Suspense child could be a hole beside static description markup. Next.js 16 does this under Cache Components: the cookie read inside Suspense is the hole, and the description is the shell.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A product page has a static description. The price reads a cookie inside a Suspense child. Which piece is the dynamic hole?',
    options: [
      'The description, because it is the first content the visitor sees.',
      'The entire page, because any cookie read opts the route out of prerendering.',
      'The price subtree inside Suspense. The description can stay in the static shell.',
      'The Suspense fallback only. The page waits for the price before it sends any HTML.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'The price inside Suspense is the dynamic hole. The description can be the static shell.',
      why: 'A dynamic hole is the region that depends on this request and streams after the shell. The price reads a cookie, which is request data, and it sits inside Suspense, so that subtree is the hole. The description does not read the request, so it can be prerendered in the static shell, the HTML sent before the cookie is needed. One cookie read does not force the whole page to wait when that read stays inside the boundary. The fallback is the placeholder inside the hole, while the shell HTML can still be sent.',
      wrong: [
        {
          option: 'The description, because it is the first content the visitor sees.',
          reason:
            'Order on the page does not pick the hole. The hole is the Suspense child that reads the cookie.',
        },
        {
          option: 'The entire page, because any cookie read opts the route out of prerendering.',
          reason:
            'A cookie read inside Suspense is the hole. Markup outside that read can still be the shell.',
        },
        {
          option: 'The Suspense fallback only. The page waits for the price before it sends any HTML.',
          reason:
            'The shell is sent without waiting for the price. The fallback fills the hole until the price streams.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <>\n      <p>A static product description.</p>\n      <Suspense fallback={<p>Loading</p>}><Price /></Suspense>\n    </>\n  );\n}\n\nasync function Price() {\n  const jar = await cookies();\n  return <p>{jar.get('price')?.value ?? '0'}</p>;\n}\n" },
      remember: 'The Suspense child that reads the cookie is the hole. The rest can be the shell.',
    },
  },
  {
    id: 'n16a-045',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 warned when you called cookies(), headers(), draftMode(), params, or searchParams without await, and the sync form still ran. Next.js 16 removes those synchronous forms. You must await them.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This page reads the theme cookie the way Next.js 15 only warned about. What is the bug in Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import { cookies } from 'next/headers';\n\nexport default async function Page() {\n  const theme = cookies().get('theme')?.value;\n  return <p>{theme}</p>;\n}\n",
    },
    options: [
      'cookies() was removed. Read the Cookie header with a synchronous headers() call instead.',
      'The call is fine at runtime. Next.js 16 still only prints the sync warning.',
      'get must be awaited, but cookies() itself stays synchronous.',
      'cookies() returns a promise. The synchronous call was removed, so you must await it.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Await cookies(). The synchronous call is gone, not just a warning.',
      why: 'The page calls cookies() and immediately uses .get, without await. cookies() reads the Cookie header for this request and returns a promise of the cookie jar. Next.js 15 let the old sync call continue after a warning. Next.js 16 removes that sync form, so the promise is never unwrapped before .get. The same removal covers headers(), draftMode(), params, and searchParams, and you still import cookies() from next/headers, then await the jar before calling get.',
      wrong: [
        {
          option:
            'cookies() was removed. Read the Cookie header with a synchronous headers() call instead.',
          reason:
            'cookies() remains, and headers() is async too. Await cookies() and then read the theme.',
        },
        {
          option: 'The call is fine at runtime. Next.js 16 still only prints the sync warning.',
          reason: 'The warning era was Next.js 15. Next.js 16 removes the synchronous call.',
        },
        {
          option: 'get must be awaited, but cookies() itself stays synchronous.',
          reason: 'get is a normal method on the jar. The promise you await is the cookies() call.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { cookies } from 'next/headers';\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value;\n  return <p>{theme}</p>;\n}\n",
      },
      example: { lang: 'tsx', source: "import { cookies } from 'next/headers';\n\nexport default async function Page() {\n  const jar = await cookies();\n  const theme = jar.get('theme')?.value;\n  return <p>{theme}</p>;\n}\n" },
      remember: 'Await cookies(), headers(), draftMode(), params, and searchParams.',
    },
  },
  {
    id: 'n16a-046',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 printed warnings for synchronous cookies(), headers(), draftMode(), params, and searchParams. Next.js 16 removes those sync forms completely. The promise versions are the only API.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'In Next.js 15, cookies() without await was a warning. Which synchronous request APIs did Next.js 16 remove?',
    options: [
      'cookies(), headers(), draftMode(), params, and searchParams. Await all of them.',
      'Only cookies(). headers(), draftMode(), params, and searchParams stay synchronous.',
      'None. Next.js 16 made them synchronous again so they can run at build time.',
      'cookies() and headers() only. params and searchParams are plain objects again.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'All five are async only: cookies(), headers(), draftMode(), params, and searchParams.',
      why: 'A promise is a value you await before you can use the result. Next.js 15 had started that migration but still ran the old sync call after warning you. Next.js 16 finishes the break, so the sync call is gone at runtime and in the types. The list includes draftMode(), which reads whether the visitor is previewing draft content, plus the page values params and searchParams. They were not turned back into plain objects for build-time reads.',
      wrong: [
        {
          option: 'Only cookies(). headers(), draftMode(), params, and searchParams stay synchronous.',
          reason: 'The sync removal covers all five. headers(), draftMode(), params, and searchParams are promises too.',
        },
        {
          option: 'None. Next.js 16 made them synchronous again so they can run at build time.',
          reason:
            'They stayed promises. Build-time work uses a cache directive, not a sync request API.',
        },
        {
          option: 'cookies() and headers() only. params and searchParams are plain objects again.',
          reason:
            'params and searchParams are promises. The sync object form was fully removed.',
        },
      ],
      example: { lang: 'tsx', source: "import { cookies, headers, draftMode } from 'next/headers';\n\nexport default async function Page(props: PageProps<'/blog/[slug]'>) {\n  const jar = await cookies();\n  const headerList = await headers();\n  const draft = await draftMode();\n  const { slug } = await props.params;\n  const query = await props.searchParams;\n  const theme = jar.get('theme')?.value ?? 'light';\n  const host = headerList.get('host') ?? slug;\n  return <p>{draft.isEnabled ? query.tab : theme + host}</p>;\n}\n" },
      remember: 'If Next 15 warned that a request API was sync, await it in Next 16.',
    },
  },
  {
    id: 'n16a-047',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'Next.js 15.5 added npx next typegen, which generates PageProps, LayoutProps, and RouteContext, while sync params was still only a warning. Next.js 16 makes params a promise only, and PageProps types props.params as that promise.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'next typegen generated the PageProps helper used here. What is the type of props.params?',
    code: {
      lang: 'tsx',
      source:
        "export default async function Page(props: PageProps<'/blog/[slug]'>) {\n  const { slug } = await props.params;\n  return <h1>{slug}</h1>;\n}\n",
    },
    options: [
      'A plain object with a slug string, the same shape page props had before the promise migration.',
      'A promise. PageProps types params as a promise, so you await it to read slug.',
      'A string that is already the slug, so destructuring the awaited value fails.',
      'Undefined, unless the page also exports generateStaticParams.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'props.params is a promise. Await it, then read slug.',
      why: 'The page types its argument as PageProps for the blog slug route, awaits props.params, and renders slug. next typegen writes those helpers from the app directory, including PageProps, LayoutProps, and RouteContext. For this route, params is a promise of an object with a slug string, so the await unwraps it. It is not the older plain object, and it is not the slug string itself. generateStaticParams chooses which params to prerender ahead of time. It does not change params into undefined.',
      wrong: [
        {
          option:
            'A plain object with a slug string, the same shape page props had before the promise migration.',
          reason:
            'That sync object is gone. PageProps types params as a promise, which is why the page awaits it.',
        },
        {
          option: 'A string that is already the slug, so destructuring the awaited value fails.',
          reason:
            'The awaited value is the param object. slug is a field on that object, not the promise itself.',
        },
        {
          option: 'Undefined, unless the page also exports generateStaticParams.',
          reason:
            'generateStaticParams does not control whether params exists. The prop is a promise you await.',
        },
      ],
      example: { lang: 'tsx', source: "export default async function Page(props: PageProps<'/blog/[slug]'>) {\n  // Next.js 15 typed params as a plain object.\n  const params = await props.params;\n  const slug = params.slug;\n  return <h1>{slug}</h1>;\n}\n" },
      remember: 'PageProps types params as a promise. Await props.params.',
    },
  },
  {
    id: 'n16a-048',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'In Next.js 15, opengraph-image params were synchronous. In Next.js 16, params and id on opengraph-image, twitter-image, icon, and apple-icon are promises. generateImageMetadata still receives synchronous params.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This opengraph-image file treats params as a plain object. What is the bug in Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import { ImageResponse } from 'next/og';\n\nexport default async function Image({ params }: { params: { slug: string } }) {\n  const slug = params.slug;\n  return new ImageResponse(<div>{slug}</div>);\n}\n",
    },
    options: [
      'ImageResponse was removed. Image files must return a plain Response.',
      'The file must be named og.tsx. opengraph-image is no longer a special file.',
      'params is a promise on opengraph-image, twitter-image, icon, and apple-icon. Await it.',
      'params is always undefined on image routes, so the slug has to come from searchParams.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Await params. On those image file conventions, params and id are promises.',
      why: 'Image types its params as a plain object and reads params.slug before building an ImageResponse. opengraph-image is the file that draws the social preview image for a route. In Next.js 16 that function receives params as a promise, and id is a promise too when the image is selected from metadata. The same promise args apply to twitter-image, icon, and apple-icon. Reading slug on the promise does not yield the string, ImageResponse is still how you return the picture, and generateImageMetadata is the exception whose params stay synchronous.',
      wrong: [
        {
          option: 'ImageResponse was removed. Image files must return a plain Response.',
          reason: 'ImageResponse from next/og is still how you return the generated image.',
        },
        {
          option: 'The file must be named og.tsx. opengraph-image is no longer a special file.',
          reason: 'opengraph-image remains the special filename. The bug is the sync params type.',
        },
        {
          option: 'params is always undefined on image routes, so the slug has to come from searchParams.',
          reason:
            'params exists and carries the slug. It is a promise, so you await it before reading slug.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "import { ImageResponse } from 'next/og';\n\nexport default async function Image({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return new ImageResponse(<div>{slug}</div>);\n}\n",
      },
      example: { lang: 'tsx', source: "import { ImageResponse } from 'next/og';\n\nexport default async function Image({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  return new ImageResponse(<div>{slug}</div>);\n}\n" },
      remember: 'Await params and id in opengraph-image, twitter-image, icon, and apple-icon.',
    },
  },
  {
    id: 'n16a-049',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'In Next.js 15 the id passed to a sitemap function was already a number, so multiplying it worked. In Next.js 16 that id is a Promise of a string. Await it and pass it through Number before arithmetic.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This sitemap uses id in arithmetic the way Next.js 15 allowed. What is the bug?',
    code: {
      lang: 'ts',
      source:
        "export default async function sitemap({ id }: { id: number }) {\n  const start = id * 5000;\n  return [{ url: 'https://example.com/?start=' + start }];\n}\n",
    },
    options: [
      'sitemap no longer receives an id argument in Next.js 16.',
      'id is still a number. The bug is that start must be a string before it is added to the URL.',
      'Awaiting id returns a number, so wrapping it in Number is what breaks the math.',
      'id is a promise of a string. Await it and wrap it in Number before you do math.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Await id and convert it with Number. It is a promise of a string, not a number.',
      why: 'The function types id as a number and multiplies it by 5000 to build a sitemap slice URL. A generated sitemap can be split into numbered files, and id tells you which slice this call is building. Next.js 16 passes that id as a promise that resolves to a string, so the multiplication uses the wrong value. Number turns the awaited string into a numeric value you can multiply. The argument still exists. Awaiting it does not produce a number by itself, which is why the Number call comes before the math.',
      wrong: [
        {
          option: 'sitemap no longer receives an id argument in Next.js 16.',
          reason: 'id is still passed in. Its type changed to a promise of a string.',
        },
        {
          option: 'id is still a number. The bug is that start must be a string before it is added to the URL.',
          reason:
            'id is not a number anymore. The URL already concatenates start with a string. The bug is using id in arithmetic without awaiting it.',
        },
        {
          option: 'Awaiting id returns a number, so wrapping it in Number is what breaks the math.',
          reason:
            'The awaited value is a string. Number is required before arithmetic. It is the fix, not the bug.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "export default async function sitemap({ id }: { id: Promise<string> }) {\n  const start = Number(await id) * 5000;\n  return [{ url: 'https://example.com/?start=' + start }];\n}\n",
      },
      example: { lang: 'ts', source: "export default async function sitemap({ id }: { id: Promise<string> }) {\n  // Next.js 15 passed id as a number. It is now a promise of a string.\n  const raw = await id;\n  const start = Number(raw) * 5000;\n  return [{ url: 'https://example.com/?start=' + start }];\n}\n" },
      remember: 'Sitemap id is a promise of a string. Await it, then use Number, before math.',
    },
  },
  {
    id: 'n16a-050',
    tech: 'next16',
    topic: 'async-apis',
    versionNote:
      'Next.js 15 gave both generateImageMetadata and the image function synchronous params. Next.js 16 makes params and id promises on the image function only. generateImageMetadata still receives synchronous params.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'generateImageMetadata reads params.slug with no await, while the opengraph image function awaits params. Which statement matches Next.js 16?',
    options: [
      'That split is correct. generateImageMetadata still receives synchronous params. The image function params and id are promises.',
      'Both functions receive promises. generateImageMetadata must await params too.',
      'Both functions receive plain objects. The await in the image function is the mistake.',
      'params was removed from generateImageMetadata, so the sync read always sees undefined.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'generateImageMetadata can keep the synchronous params read. The image function must await params and id.',
      why: 'generateImageMetadata lists the images for a route, including their ids, before the image function draws one of them. Its params argument stayed synchronous, so params.slug is a string there. The image function that draws opengraph-image, twitter-image, icon, or apple-icon receives params and id as promises. Awaiting inside generateImageMetadata would treat a plain object as a promise, which is the wrong model. The params argument was not removed from that helper.',
      wrong: [
        {
          option: 'Both functions receive promises. generateImageMetadata must await params too.',
          reason:
            'Only the image function params and id became promises. generateImageMetadata params stay synchronous.',
        },
        {
          option: 'Both functions receive plain objects. The await in the image function is the mistake.',
          reason:
            'The image function must await params and id. The sync read belongs only to generateImageMetadata.',
        },
        {
          option: 'params was removed from generateImageMetadata, so the sync read always sees undefined.',
          reason:
            'params is still passed to generateImageMetadata, and it is still a synchronous object.',
        },
      ],
      example: { lang: 'tsx', source: "import { ImageResponse } from 'next/og';\n\nexport function generateImageMetadata({ params }: { params: { slug: string } }) {\n  return [{ id: params.slug, alt: params.slug, size: { width: 1200, height: 630 } }];\n}\n\nexport default async function Image({ params, id }: { params: Promise<{ slug: string }>; id: Promise<string> }) {\n  const { slug } = await params;\n  const imageId = await id;\n  return new ImageResponse(<div>{slug + imageId}</div>);\n}\n" },
      remember:
        'generateImageMetadata params stay sync. Await params and id in the image function.',
    },
  },
] satisfies Question[];
