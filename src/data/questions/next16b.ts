import type { Question } from '../types';

export const next16bQuestions = [
  {
    id: 'n16b-001',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 used Webpack for next build unless you passed --turbopack. Next.js 16 uses Turbopack for next dev and next build. Opt out with --webpack. experimental.turbopack moves to a top-level turbopack key.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This next.config.ts still customizes Webpack. The build script is next build, with no extra flags. What is the bug on Next.js 16?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  webpack: (config) => {\n    config.resolve.alias = { lodash: \"lodash-es\" };\n    return config;\n  },\n};\n\nexport default nextConfig;",
    },
    options: [
      'next build fails until you migrate the Webpack config or pass --webpack. The Webpack config is not silently ignored, and Turbopack is already the default bundler.',
      'The webpack key is silently ignored, the alias never applies, and next build still succeeds.',
      'You must pass --turbopack. Without that flag, next build keeps using Webpack.',
      'A webpack function only fails next dev. next build still uses Webpack by default in Next.js 16.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'next build fails when a webpack config is present, until you migrate that config or pass --webpack. Turbopack is already the default, and the webpack config is not silently ignored.',
      why: 'The file exports a webpack function that aliases lodash to lodash-es, and the script calls next build with no flag. Next.js 16 uses Turbopack for both next dev and next build, so you no longer pass --turbopack to opt in. A custom webpack config makes that build fail on purpose, instead of skipping the alias and succeeding. Move the alias to the top-level turbopack.resolveAlias key, or keep this function by running next build --webpack. In Next.js 15 this same function was the normal production path because Webpack was still the default bundler.',
      wrong: [
        {
          option:
            'The webpack key is silently ignored, the alias never applies, and next build still succeeds.',
          reason:
            'Next.js 16 refuses the build when it finds a webpack config. The failure is how you notice the config, not a silent skip.',
        },
        {
          option:
            'You must pass --turbopack. Without that flag, next build keeps using Webpack.',
          reason:
            'Turbopack is already the default for next dev and next build. The old --turbopack flag is not how you turn it on, and a missing flag does not fall back to Webpack.',
        },
        {
          option:
            'A webpack function only fails next dev. next build still uses Webpack by default in Next.js 16.',
          reason:
            'The default switch covers next build as well as next dev. Production is the command that fails until you migrate the config or pass --webpack.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  turbopack: {\n    resolveAlias: {\n      lodash: \"lodash-es\",\n    },\n  },\n};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  turbopack: {\n    resolveAlias: {\n      lodash: \"lodash-es\",\n    },\n  },\n};\n\nexport default nextConfig;" },
      remember:
        'A webpack key makes next build fail until you migrate it or pass --webpack.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-002',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 used middleware.ts and a named middleware export, usually on the Edge runtime. Next.js 16 uses proxy.ts, a proxy export or a default export, and the Node.js runtime.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'This file is proxy.ts, and it has no default export. A request comes in for /dashboard. What happens?',
    code: {
      lang: 'ts',
      source:
        "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function middleware(request: NextRequest) {\n  const headers = new Headers(request.headers);\n  headers.set(\"x-request-id\", \"req-1\");\n  return NextResponse.next({\n    request: { headers },\n  });\n}\n\nexport const config = {\n  matcher: [\"/dashboard/:path*\"],\n};",
    },
    options: [
      'Next.js runs the function on the Edge runtime because it is still named middleware.',
      'Next.js errors because proxy.ts must export a function named proxy or a default function. A named middleware export does not count, so x-request-id is not applied. The proxy runtime is Node.js.',
      'The function runs, sets x-request-id, and stays on the Edge runtime until the matcher is deleted.',
      'The build fails because proxy.ts is not allowed to import NextResponse.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'proxy.ts does not accept a named middleware export. Export a function named proxy, or a default function. The file runs on Node.js, and this request does not get the header.',
      why: 'Read the file from the top. It builds a Headers copy, sets x-request-id, and returns NextResponse.next, which would be a valid proxy body. The export name is still middleware, and there is no default export. Next.js 16 requires proxy.ts to export one function, either as the name proxy or as the default. A leftover middleware name is the Next.js 15 convention, so the file fails instead of intercepting /dashboard. The matcher does not repair the export. Rename the function to proxy. A default export would also be accepted, but the docs recommend the name proxy. The runtime is Node.js either way, and you cannot set it to edge.',
      wrong: [
        {
          option:
            'Next.js runs the function on the Edge runtime because it is still named middleware.',
          reason:
            'The function name middleware does not select the Edge runtime. proxy.ts is Node.js only, and that export name is not a valid proxy entry.',
        },
        {
          option:
            'The function runs, sets x-request-id, and stays on the Edge runtime until the matcher is deleted.',
          reason:
            'The matcher is valid config. The file never gets as far as setting the header, because the export is not named proxy and is not a default function.',
        },
        {
          option:
            'The build fails because proxy.ts is not allowed to import NextResponse.',
          reason:
            'NextResponse from next/server is a normal way to continue or redirect. The failure is the missing proxy or default function export.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function proxy(request: NextRequest) {\n  const headers = new Headers(request.headers);\n  headers.set(\"x-request-id\", \"req-1\");\n  return NextResponse.next({\n    request: { headers },\n  });\n}\n\nexport const config = {\n  matcher: [\"/dashboard/:path*\"],\n};",
      },
      example: { lang: 'ts', source: "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function proxy(request: NextRequest) {\n  const headers = new Headers(request.headers);\n  headers.set(\"x-request-id\", \"req-1\");\n  return NextResponse.next({\n    request: { headers },\n  });\n}\n\nexport const config = {\n  matcher: [\"/dashboard/:path*\"],\n};" },
      remember:
        'proxy.ts must export proxy or a default function, and it runs on Node.js.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy',
    },
  },
  {
    id: 'n16b-003',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 still supported Node.js 18.18 and an older browser floor. Next.js 16 requires Node.js 20.9 or newer, drops Node.js 18, requires TypeScript 5.1 or newer, and targets Chrome 111+ and Safari 16.4+.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which platform requirement is true for Next.js 16?',
    options: [
      'Node.js 18.18 remains supported, TypeScript 5.0 is enough, and Safari 15 is still in the browser list.',
      'Node.js 20.0 is enough, Node.js 18 still runs with a warning, and TypeScript 4.9 can typecheck the app.',
      'Node.js 20.9 or newer is required, Node.js 18 is unsupported, TypeScript must be 5.1 or newer, and the browser floor includes Chrome 111+ and Safari 16.4+.',
      'Only Node.js 22 is supported, TypeScript 5.5 is required, and Chrome 120 is the minimum browser.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Next.js 16 requires Node.js 20.9 or newer, does not support Node.js 18, requires TypeScript 5.1 or newer, and expects Chrome 111+ and Safari 16.4+.',
      why: 'The runtime floor moved with this major version. Node.js 18, which Next.js 15 could still run on, is unsupported, and a 20.0 install is not new enough: the minimum is Node.js 20.9. TypeScript must be at least 5.1, so a 5.0 or 4.9 toolchain is too old to typecheck the app. The browser floor moved with the React 19.2 target as well. Chrome 111+ and Safari 16.4+ are the minimums you should plan for, and the upgrade guide pairs those with Edge 111+ and Firefox 111+. Node.js 22 is a fine newer release, but it is not the only supported line.',
      wrong: [
        {
          option:
            'Node.js 18.18 remains supported, TypeScript 5.0 is enough, and Safari 15 is still in the browser list.',
          reason:
            'That is closer to the Next.js 15 floor. Next.js 16 drops Node.js 18, starts TypeScript at 5.1, and no longer treats Safari 15 as a supported browser.',
        },
        {
          option:
            'Node.js 20.0 is enough, Node.js 18 still runs with a warning, and TypeScript 4.9 can typecheck the app.',
          reason:
            'Node.js 18 does not run with a warning. It is unsupported. The Node minimum is 20.9, and TypeScript 4.9 is below 5.1.',
        },
        {
          option:
            'Only Node.js 22 is supported, TypeScript 5.5 is required, and Chrome 120 is the minimum browser.',
          reason:
            'Node.js 20.9 and newer are supported, not only Node.js 22. TypeScript 5.1 is the minimum, and the Chrome floor is 111, not 120.',
        },
      ],
      example: { lang: 'ts', source: "// Next.js 16 minimums\nexport const engines = {\n  node: \">=20.9.0\",\n};\n\nexport const typescript = \">=5.1.0\";\n\nexport const browserslist = [\n  \"chrome >= 111\",\n  \"edge >= 111\",\n  \"firefox >= 111\",\n  \"safari >= 16.4\",\n];" },
      remember:
        'Next.js 16 needs Node.js 20.9+, TypeScript 5.1+, Chrome 111+, and Safari 16.4+.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-004',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 did not fail the build when a parallel slot lacked default.js. Next.js 16 requires default.js or default.tsx for every slot so a hard navigation with no match still has a module to render.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The @modal slot has page.tsx and no default.tsx. This layout renders that slot. What is the bug on Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import type { ReactNode } from \"react\";\n\nexport default function RootLayout(props: {\n  children: ReactNode;\n  modal: ReactNode;\n}) {\n  return (\n    <html lang=\"en\">\n      <body>\n        {props.children}\n        {props.modal}\n      </body>\n    </html>\n  );\n}",
    },
    options: [
      'The slot prop must be named slot. The name modal is invalid for a parallel route.',
      'default.tsx is only required for intercepting routes, not for a parallel slot.',
      'Next.js 16 renders null for an unmatched slot on a hard navigation, so a missing default file is valid.',
      'Every parallel slot needs default.js or default.tsx. Without it the build fails, because Next needs a module when a hard navigation does not match that slot.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Add default.js or default.tsx for the @modal slot. Next.js 16 fails the build without it, because a hard navigation that misses the slot has nothing to render.',
      why: 'The layout is wired correctly: children is the main segment and modal is the @modal parallel slot, which matches the folder name. Soft navigations can keep whatever the slot rendered last. A hard load has no previous slot state. If the URL does not match @modal, Next.js 16 needs an explicit default file so it knows what to render, and the build fails when that file is absent. Return null when the unmatched slot should show nothing, or call notFound from next/navigation when it should 404. Next.js 15 did not make the missing file a build failure in this way.',
      wrong: [
        {
          option:
            'The slot prop must be named slot. The name modal is invalid for a parallel route.',
          reason:
            'The prop name matches the slot folder. @modal is received as modal. The missing piece is default.tsx, not a rename of the prop.',
        },
        {
          option:
            'default.tsx is only required for intercepting routes, not for a parallel slot.',
          reason:
            'The new requirement is on parallel route slots. Intercepting routes are a separate pattern and do not exempt @modal from default.js.',
        },
        {
          option:
            'Next.js 16 renders null for an unmatched slot on a hard navigation, so a missing default file is valid.',
          reason:
            'Null is something you return from your own default file. Next does not invent that module for you, and the build fails while it is missing.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default function ModalDefault() {\n  return null;\n}",
      },
      example: { lang: 'tsx', source: "import type { ReactNode } from \"react\";\nexport default function ModalDefault() {\n  return null;\n}\n\nexport function RootLayout(props: {\n  children: ReactNode;\n  modal: ReactNode;\n}) {\n  return (\n    <body>\n      {props.children}\n      {props.modal}\n    </body>\n  );\n}" },
      remember:
        'Every parallel slot needs default.js or default.tsx, or the Next.js 16 build fails.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-005',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 prefetched heavier route payloads and repeated shared layouts. Next.js 16 downloads a shared layout once and incrementally prefetches only parts that are not already cached.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A dashboard nav renders 20 next/link items. Every link shares one dashboard layout, and parts of those routes are already in the client cache. What does Next.js 16 prefetch?',
    options: [
      'The shared layout is downloaded once. Incremental prefetch then downloads only the parts that are not already cached, so you may see more, smaller prefetch requests.',
      'Each link downloads a full copy of the shared layout, so prefetch traffic grows in a straight line with the link count.',
      'Prefetch is disabled for any link that shares a layout, so the layout loads only after the click.',
      'Next.js 16 waits for a click and then downloads the entire route tree in one request per link.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The shared dashboard layout is downloaded once, and each link prefetches only the uncached parts. You can see more requests, but they are smaller.',
      why: 'All 20 links share one layout, so layout deduplication fetches that layout a single time instead of attaching a fresh copy to every prefetch. Incremental prefetch then looks at the client cache and skips segments that are already there. Only the missing pieces are requested. The network panel can show more individual prefetch requests than it did in Next.js 15, with a lower total transfer. No component change is required for this behavior. Next.js 15 sent heavier per-link payloads and did not dedupe the shared layout this way. Prefetch is not turned off, and the click is not the first time the layout is allowed to download.',
      wrong: [
        {
          option:
            'Each link downloads a full copy of the shared layout, so prefetch traffic grows in a straight line with the link count.',
          reason:
            'That is the cost layout deduplication removes. The shared layout is downloaded once for the whole set of links.',
        },
        {
          option:
            'Prefetch is disabled for any link that shares a layout, so the layout loads only after the click.',
          reason:
            'Sharing a layout does not disable prefetch. It makes the shared part download once, then lets each link prefetch what it still needs.',
        },
        {
          option:
            'Next.js 16 waits for a click and then downloads the entire route tree in one request per link.',
          reason:
            'Prefetch still happens ahead of the click. It does not collapse the route into one full-tree request per link.',
        },
      ],
      example: { lang: 'tsx', source: "import Link from \"next/link\";\n\nconst hrefs = [\"/dashboard/a\", \"/dashboard/b\", \"/dashboard/c\"];\n\nexport function DashboardNav() {\n  return (\n    <nav>\n      {hrefs.map((href) => (\n        <Link key={href} href={href}>\n          {href}\n        </Link>\n      ))}\n    </nav>\n  );\n}" },
      remember:
        'Shared layouts prefetch once, and only uncached segments are downloaded after that.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-006',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 accepted a query string on a local next/image src. Next.js 16 handles that src differently, and it can break unless images.localPatterns allows the search string.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This local image worked in Next.js 15. There is no images.localPatterns config. What breaks in Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import Image from \"next/image\";\n\nexport function Avatar() {\n  return (\n    <Image\n      src=\"/avatars/ada.png?v=3\"\n      alt=\"Ada\"\n      width={64}\n      height={64}\n    />\n  );\n}",
    },
    options: [
      'width and height are illegal on a static local image in Next.js 16.',
      'A local src with a query string is handled differently and can break. Allow it with images.localPatterns, including the search pattern, or drop the query string.',
      'The alt prop must be removed for files in the public folder.',
      'Switch the import to next/legacy/image, which is the supported image component in Next.js 16.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'The query string on this local src can break in Next.js 16. Allow that exact search with images.localPatterns, or remove the query string.',
      why: 'The component renders a public-file src, /avatars/ada.png, and then appends ?v=3. Next.js 15 treated that as an ordinary local image. Next.js 16 handles a query string on a local src differently so arbitrary search params cannot be used to enumerate files, and the old markup can break. The fix that keeps the cache-buster is images.localPatterns with a pathname such as /avatars/** and search set to ?v=3. Removing ?v=3 also fixes it. width, height, and alt are still valid and are not the regression. Do not switch the import to next/legacy/image. That entry point is deprecated in this version.',
      wrong: [
        {
          option: 'width and height are illegal on a static local image in Next.js 16.',
          reason:
            'Local images that are not static imports still need width and height, or fill. Those props are not the breaking change.',
        },
        {
          option: 'The alt prop must be removed for files in the public folder.',
          reason:
            'alt is still required for an accessible image. The public folder does not make a query string safe.',
        },
        {
          option:
            'Switch the import to next/legacy/image, which is the supported image component in Next.js 16.',
          reason:
            'next/legacy/image is deprecated. The supported component is next/image, and the query string still has to be allowed or removed.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  images: {\n    localPatterns: [\n      {\n        pathname: \"/avatars/**\",\n        search: \"?v=3\",\n      },\n    ],\n  },\n};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  images: {\n    localPatterns: [\n      {\n        pathname: \"/avatars/**\",\n        search: \"?v=3\",\n      },\n    ],\n  },\n};\n\nexport default nextConfig;" },
      remember:
        'A query string on a local image src needs images.localPatterns, or it can break.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-007',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'In Next.js 15, reactCompiler lived under experimental and was off by default. In Next.js 16 the same flag is a stable top-level option, still off by default, and it still runs through Babel.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'How do you turn on the React Compiler in Next.js 16, and what should you expect?',
    options: [
      'reactCompiler: true is on by default, and the compiler runs inside Turbopack with no extra package.',
      'Leave the flag at experimental.reactCompiler. Turning it on makes production builds faster.',
      'Set the stable flag reactCompiler: true. It is off by default. Install babel-plugin-react-compiler. Builds get slower because the compiler uses Babel.',
      'Next.js 16 removed the React Compiler. Run Babel yourself outside next build.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Set reactCompiler: true in next.config. It is stable and off by default. Install babel-plugin-react-compiler, and expect slower builds because the compiler uses Babel.',
      why: 'An upgrade does not start compiling every component. The flag is stable, but it stays off until you set reactCompiler: true at the top level of next.config. Leaving it under experimental.reactCompiler is the Next.js 15 location and is not how you enable the stable option. You also install babel-plugin-react-compiler. The compiler memoizes components so you write fewer manual memo and useCallback calls, but the pass runs through Babel, so dev compiles and production builds take longer. That slowdown is expected. It is not a sign that Turbopack failed, and Next.js did not remove the integration.',
      wrong: [
        {
          option:
            'reactCompiler: true is on by default, and the compiler runs inside Turbopack with no extra package.',
          reason:
            'The flag is off by default, and the compiler is a Babel plugin you install. It is not an implicit Turbopack pass.',
        },
        {
          option:
            'Leave the flag at experimental.reactCompiler. Turning it on makes production builds faster.',
          reason:
            'The stable key is the top-level reactCompiler flag. Enabling it makes builds slower, not faster, because Babel does the compile.',
        },
        {
          option:
            'Next.js 16 removed the React Compiler. Run Babel yourself outside next build.',
          reason:
            'Support became stable in Next.js 16. You turn it on in next.config and install the plugin. You do not bolt on a separate Babel pipeline.',
        },
      ],
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\n// Install babel-plugin-react-compiler. Builds use Babel.\nconst nextConfig: NextConfig = {\n  reactCompiler: true,\n};\n\nexport default nextConfig;" },
      remember:
        'reactCompiler is stable, off by default, and slower because it uses Babel.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-008',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 still supported serverRuntimeConfig, publicRuntimeConfig, and getConfig from next/config. Next.js 16 removes all three.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does this page do on Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import getConfig from \"next/config\";\n\nexport default function Page() {\n  const { publicRuntimeConfig } = getConfig();\n  return <p>{publicRuntimeConfig.apiUrl}</p>;\n}",
    },
    options: [
      'getConfig returns process.env, so publicRuntimeConfig.apiUrl still renders the public URL.',
      'publicRuntimeConfig was removed, but getConfig and serverRuntimeConfig still work on the server.',
      'The call returns undefined and Next.js inlines the secret into the client bundle automatically.',
      'getConfig from next/config is removed, and so are publicRuntimeConfig and serverRuntimeConfig. This page cannot read a runtime config object.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The page cannot read publicRuntimeConfig. getConfig, publicRuntimeConfig, and serverRuntimeConfig were all removed. Use process.env, with the NEXT_PUBLIC_ prefix when the browser must see the value.',
      why: 'The module imports the default getConfig from next/config and immediately destructures publicRuntimeConfig to render apiUrl. That object was the Next.js 15 way to ship a public value and a separate server-only bag. Next.js 16 removes the function and both config bags, so this module does not produce a runtime config object and the paragraph never gets its URL from there. Read server-only values from process.env inside a Server Component. A value the browser must see needs the NEXT_PUBLIC_ prefix, which would replace a public apiUrl. If a server env value must be read on each request instead of inlined at build, call await connection() from next/server before the read. Use React taint APIs so a secret is not passed into a Client Component.',
      wrong: [
        {
          option:
            'getConfig returns process.env, so publicRuntimeConfig.apiUrl still renders the public URL.',
          reason:
            'getConfig was removed. It was not redefined as a wrapper around process.env, and publicRuntimeConfig is gone too.',
        },
        {
          option:
            'publicRuntimeConfig was removed, but getConfig and serverRuntimeConfig still work on the server.',
          reason:
            'All three are removed together. Keeping a serverRuntimeConfig block or a getConfig import does not preserve the server half.',
        },
        {
          option:
            'The call returns undefined and Next.js inlines the secret into the client bundle automatically.',
          reason:
            'There is no automatic inlining of a secret from this removed API. Client exposure is a separate choice you make with the NEXT_PUBLIC_ prefix.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default function Page() {\n  const apiUrl = process.env.NEXT_PUBLIC_API_URL;\n  return <p>{apiUrl}</p>;\n}",
      },
      example: { lang: 'tsx', source: "export default function Page() {\n  const apiUrl = process.env.NEXT_PUBLIC_API_URL;\n  return <p>{apiUrl}</p>;\n}\n\nfunction serverToken() {\n  return process.env.API_TOKEN;\n}" },
      remember:
        'Runtime config and getConfig are gone. Use process.env, and NEXT_PUBLIC_ for client values.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-009',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 ran lint during next build unless ignoreDuringBuilds was set, and next lint was the CLI. Next.js 16 removes next lint, the eslint config key, and lint-during-build.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'CI runs next lint, then next build. The config below tries to skip lint during the build. What is the bug on Next.js 16?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  eslint: {\n    ignoreDuringBuilds: true,\n  },\n};\n\nexport default nextConfig;",
    },
    options: [
      'next lint is removed, next build no longer runs lint, and the eslint key in next.config is removed. Run ESLint or Biome yourself.',
      'ignoreDuringBuilds still skips lint, and next lint is still the supported command.',
      'next build now fails on every lint warning, and ignoreDuringBuilds cannot turn that off.',
      'Move the eslint key to experimental.eslint. The next lint command still works.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'next lint is removed, next build no longer lints, and the eslint key is not valid config. Call ESLint or Biome directly from CI.',
      why: 'The config sets eslint.ignoreDuringBuilds, which in Next.js 15 told next build to skip its lint step. Next.js 16 removes that step entirely, removes the next lint command, and removes the eslint key, so this object does not configure lint and the CI script is calling a command Next no longer provides. A green next build does not mean the linter passed. Run ESLint or Biome as its own CI step. There is no experimental.eslint replacement, and lint warnings are not a new fatal phase of next build.',
      wrong: [
        {
          option:
            'ignoreDuringBuilds still skips lint, and next lint is still the supported command.',
          reason:
            'Both the flag and the next lint command were removed. There is no lint step left inside next build for the flag to skip.',
        },
        {
          option:
            'next build now fails on every lint warning, and ignoreDuringBuilds cannot turn that off.',
          reason:
            'next build no longer runs lint at all, so warnings do not fail the build. Lint has to be a separate command.',
        },
        {
          option:
            'Move the eslint key to experimental.eslint. The next lint command still works.',
          reason:
            'The key was removed, not moved under experimental. next lint is not a Next.js 16 command.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n\n// Run eslint or biome in CI. next lint is gone." },
      remember:
        'next lint and the eslint config key are gone. Lint with ESLint or Biome directly.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-010',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 still shipped AMP support, including useAmp and page amp config. Next.js 16 removes AMP entirely.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This Pages Router page opts into AMP and branches on useAmp. What is the bug on Next.js 16?',
    code: {
      lang: 'tsx',
      source:
        "import { useAmp } from \"next/amp\";\n\nexport const config = { amp: true };\n\nexport default function Page() {\n  const isAmp = useAmp();\n  if (isAmp) {\n    return <p>amp</p>;\n  }\n  return <p>html</p>;\n}",
    },
    options: [
      'useAmp still works in the Pages Router. Only the amp key in next.config was removed.',
      'AMP is removed. useAmp from next/amp, the amp config, and export const config = { amp: true } are all gone, so this page cannot branch on AMP.',
      'Rename useAmp to useAmp16 and set experimental.amp to true.',
      'amp: true still enables AMP. Import useAmp from next/navigation instead of next/amp.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'AMP is removed. Delete useAmp, the next/amp import, and export const config = { amp: true }, and render the normal page.',
      why: 'The page imports useAmp from next/amp, sets export const config to amp true, and returns different markup when the hook says the request is AMP. Those were the Pages Router AMP hooks. Next.js 16 removes the amp config, the useAmp hook, and that page config object. There is no AMP mode left for the branch to detect, and experimental.amp is not a replacement. next/navigation does not export useAmp. Render the HTML page directly. Next.js 15 still included these APIs, which is why this file used to build.',
      wrong: [
        {
          option:
            'useAmp still works in the Pages Router. Only the amp key in next.config was removed.',
          reason:
            'The removal covers the hook and the page-level amp config, not only a key in next.config. Pages Router AMP is gone too.',
        },
        {
          option: 'Rename useAmp to useAmp16 and set experimental.amp to true.',
          reason:
            'There is no renamed hook and no experimental flag that turns AMP back on. The feature was removed.',
        },
        {
          option:
            'amp: true still enables AMP. Import useAmp from next/navigation instead of next/amp.',
          reason:
            'amp: true is no longer a supported page config, and useAmp is not part of next/navigation.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default function Page() {\n  return <p>html</p>;\n}",
      },
      example: { lang: 'tsx', source: "export default function Page() {\n  return (\n    <main>\n      <p>html</p>\n    </main>\n  );\n}" },
      remember:
        'AMP is gone: no useAmp, no amp config, and no page config amp: true.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-011',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 accepted appIsrStatus, buildActivity, and buildActivityPosition under devIndicators. Next.js 16 removes those three options. The indicator itself remains.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'What is the bug in this Next.js 16 devIndicators config?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  devIndicators: {\n    appIsrStatus: true,\n    buildActivity: true,\n    buildActivityPosition: \"bottom-right\",\n  },\n};\n\nexport default nextConfig;",
    },
    options: [
      'devIndicators was removed entirely, so the on-screen indicator no longer exists.',
      'buildActivityPosition must be the string top-left in Next.js 16. The other two keys still work.',
      'appIsrStatus, buildActivity, and buildActivityPosition were removed. The dev indicator itself remains, but these keys are not valid.',
      'Only appIsrStatus was removed. buildActivity and buildActivityPosition still position the indicator.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Delete appIsrStatus, buildActivity, and buildActivityPosition. Those options are gone. The dev indicator itself is still there.',
      why: 'The config turns on three devIndicators fields that Next.js 15 accepted, including a bottom-right build activity position. Next.js 16 removes appIsrStatus, buildActivity, and buildActivityPosition, so this object is not valid configuration. The indicator UI was not removed with the keys. Drop these fields and leave the default indicator in place. Do not assume a new position string such as top-left replaced buildActivityPosition. If you need a different indicator later, check the current config reference instead of guessing a key.',
      wrong: [
        {
          option:
            'devIndicators was removed entirely, so the on-screen indicator no longer exists.',
          reason:
            'The three options were removed. The indicator remains, so deleting the feature from your mental model is the wrong migration.',
        },
        {
          option:
            'buildActivityPosition must be the string top-left in Next.js 16. The other two keys still work.',
          reason:
            'buildActivityPosition itself was removed. Changing its string does not restore it, and the other two keys were removed as well.',
        },
        {
          option:
            'Only appIsrStatus was removed. buildActivity and buildActivityPosition still position the indicator.',
          reason:
            'All three names are in the removal list. buildActivity and buildActivityPosition are not a leftover API.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {};\n\nexport default nextConfig;\n\n// The indicator remains. These keys were removed:\n// appIsrStatus, buildActivity, buildActivityPosition" },
      remember:
        'The dev indicator stays. appIsrStatus, buildActivity, and buildActivityPosition do not.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-012',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 made params a Promise but still allowed synchronous access for a while. Next.js 16 removes that sync access. PageProps, LayoutProps, and RouteContext from typegen, added in 15.5, are the supported types.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'This App Router page is built with Next.js 16. What happens when it reads params.slug?',
    code: {
      lang: 'tsx',
      source:
        "type Props = {\n  params: { slug: string };\n};\n\nexport default async function Page({ params }: Props) {\n  return <h1>{params.slug}</h1>;\n}",
    },
    options: [
      'params is still a plain object, so the heading text is the slug. The Next.js 15 sync warning is unchanged.',
      'searchParams replaced params, so the slug now lives at searchParams.slug.',
      'PageProps was removed in Next.js 16, so this hand-written params object is the supported type.',
      'Synchronous params access is gone. params.slug does not yield the slug. Type the page with PageProps from typegen and await params.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The heading does not get the slug from params.slug. Await params, and type the page with PageProps from Next.js typegen.',
      why: 'The props type says params is a plain object with a string slug, and the heading reads params.slug immediately. Next.js 15 had already turned params into a Promise, but it kept a temporary synchronous compatibility path. Next.js 16 removes that path, so this read does not produce the slug string. Run typegen, which has existed since Next.js 15.5 and is part of the Next.js 16 migration. PageProps, LayoutProps, and RouteContext are generated as global helpers. Type this page as PageProps for the route, await props.params, and then read slug. LayoutProps is the same idea for layouts, and RouteContext is the helper for route handlers. searchParams did not replace params.',
      wrong: [
        {
          option:
            'params is still a plain object, so the heading text is the slug. The Next.js 15 sync warning is unchanged.',
          reason:
            'The sync compatibility from Next.js 15 is gone. A hand-written object type does not make params.slug the segment string.',
        },
        {
          option:
            'searchParams replaced params, so the slug now lives at searchParams.slug.',
          reason:
            'Dynamic route segments still come from params. searchParams is the query string, and it is async too.',
        },
        {
          option:
            'PageProps was removed in Next.js 16, so this hand-written params object is the supported type.',
          reason:
            'PageProps is the supported type for an async page. The hand-written sync object is the type that no longer matches runtime.',
        },
      ],
      fixedCode: {
        lang: 'tsx',
        source:
          "export default async function Page(props: PageProps<'/blog/[slug]'>) {\n  const { slug } = await props.params;\n  return <h1>{slug}</h1>;\n}",
      },
      example: { lang: 'tsx', source: "export default async function Page(\n  props: PageProps<'/blog/[slug]'>\n) {\n  const { slug } = await props.params;\n  return <h1>{slug}</h1>;\n}\n\nexport async function GET(\n  _request: Request,\n  context: RouteContext<'/blog/[slug]'>\n) {\n  const { slug } = await context.params;\n  return Response.json({ slug });\n}" },
      remember:
        'Await params. Type it with PageProps, LayoutProps, or RouteContext from typegen.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-013',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 could still read dynamic server config through getConfig. Next.js 16 removes that. A request-time server env read calls connection() from next/server before process.env.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A Server Component must read a secret from the environment at request time. The value must not be inlined at build, and it must not reach a Client Component. What is the Next.js 16 approach?',
    options: [
      'Call await connection() from next/server before reading process.env. Keep the value on the server, and use React taint APIs so the secret is not passed into a Client Component.',
      'Put the secret in publicRuntimeConfig so Next.js keeps it dynamic and server-only.',
      'Prefix the secret with NEXT_PUBLIC_ so it is read at request time and stays off the client.',
      'Read process.env first, then call await connection() from next/headers so the build can still inline the value.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Await connection() from next/server, then read process.env. Keep the secret on the server and taint it so a Client Component cannot receive it.',
      why: 'Next.js may inline a process.env read while it builds the server bundle. If this secret has to be read on the request instead, call await connection() from next/server first. That ties the render to a live request, and only then do you read process.env. The order matters: reading first and calling connection later does not undo an inline. NEXT_PUBLIC_ publishes a value to client bundles, so it is the wrong prefix for a secret. publicRuntimeConfig was removed with getConfig. The import is next/server, not next/headers. If any later prop would hand the secret to a Client Component, use the React taint APIs so React rejects that pass.',
      wrong: [
        {
          option:
            'Put the secret in publicRuntimeConfig so Next.js keeps it dynamic and server-only.',
          reason:
            'publicRuntimeConfig was removed, and the public bag was never the place for a server-only secret.',
        },
        {
          option:
            'Prefix the secret with NEXT_PUBLIC_ so it is read at request time and stays off the client.',
          reason:
            'NEXT_PUBLIC_ is what makes a value visible in Client Components. It does not keep a secret on the server or force a request-time read.',
        },
        {
          option:
            'Read process.env first, then call await connection() from next/headers so the build can still inline the value.',
          reason:
            'connection() has to run before the read, and it is exported from next/server. Calling it afterward from next/headers does not stop inlining.',
        },
      ],
      example: { lang: 'tsx', source: "import { connection } from \"next/server\";\nimport { experimental_taintUniqueValue } from \"react\";\n\nexport async function loadSecret() {\n  await connection();\n  const token = process.env.API_TOKEN;\n  if (token) {\n    experimental_taintUniqueValue(\n      \"Do not pass API_TOKEN to a Client Component\",\n      process,\n      token\n    );\n  }\n  return token;\n}" },
      remember:
        'Await connection() from next/server before a request-time env read, and taint secrets.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-014',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 middleware could run on the Edge runtime. Next.js 16 proxy.ts is Node.js only and cannot be set to edge. middleware.ts remains only for Edge, and it is deprecated.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'What is the bug in this proxy.ts file?',
    code: {
      lang: 'ts',
      source:
        "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport const runtime = \"edge\";\n\nexport function proxy(request: NextRequest) {\n  return NextResponse.next();\n}",
    },
    options: [
      'The matcher is missing, so proxy.ts refuses to run on the Node.js runtime.',
      'proxy.ts always uses the Node.js runtime. The runtime option is not available, and setting it throws. Keep middleware.ts only if you still need the Edge runtime.',
      'runtime edge is required for proxy.ts. The bug is that the function is named proxy instead of middleware.',
      'A default export is required, so this named proxy export is ignored.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Delete export const runtime. proxy.ts is Node.js only, and setting runtime throws. Use deprecated middleware.ts only when you still need Edge.',
      why: 'The function name is already the one Next.js 16 wants: a named proxy export that continues the request with NextResponse.next. The bug is the line above it, export const runtime set to edge. Proxy defaults to the Node.js runtime. The runtime option is not available in a proxy file, and setting it throws, so this file does not become an Edge function. A matcher is optional and is not why the runtime line fails. A named proxy export is valid. A default export would also be fine, but it is not required here. If the handler truly must stay on Edge, keep the deprecated middleware.ts file and the middleware export instead of renaming that Edge file to proxy.ts.',
      wrong: [
        {
          option:
            'The matcher is missing, so proxy.ts refuses to run on the Node.js runtime.',
          reason:
            'A proxy can run without a matcher. The throw comes from setting runtime, which proxy files do not allow.',
        },
        {
          option:
            'runtime edge is required for proxy.ts. The bug is that the function is named proxy instead of middleware.',
          reason:
            'Edge is not allowed on proxy.ts, and the function should stay named proxy. The middleware name belongs to the deprecated Edge file.',
        },
        {
          option:
            'A default export is required, so this named proxy export is ignored.',
          reason:
            'A named proxy export is the recommended form. A default export is an alternative, not a requirement that ignores this function.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function proxy(request: NextRequest) {\n  return NextResponse.next();\n}",
      },
      example: { lang: 'ts', source: "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function proxy(request: NextRequest) {\n  return NextResponse.next();\n}" },
      remember:
        'proxy.ts is Node.js only. Setting runtime throws. Edge stays on deprecated middleware.ts.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy',
    },
  },
  {
    id: 'n16b-015',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'The Next.js 15 App Router shipped on React 19. The Next.js 16 App Router uses React 19.2, which adds View Transitions for updates inside a transition or a navigation.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do View Transitions do in the Next.js 16 App Router?',
    options: [
      'They animate every render, including updates that happen outside a transition.',
      'They replace the Pages Router and stay off until you install a separate view-transitions package.',
      'They animate updates that happen inside a transition or a navigation. The App Router in Next.js 16 uses React 19.2.',
      'They hide inactive UI with display:none while keeping state, which is what Activity does.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'View Transitions animate an update that is inside a transition, and they animate navigations. They come from React 19.2 in the Next.js 16 App Router.',
      why: 'The Next.js 16 App Router is on React 19.2, not the React 19 baseline that came with Next.js 15. View Transitions are one of the React 19.2 highlights you can use from that router. They animate elements whose update happens inside a transition, and they also animate navigations. An ordinary render that is not in a transition is not automatically animated. You do not install a separate package to turn the Pages Router off. Activity is the other React 19.2 highlight people mix up with this one: Activity hides UI with display:none, keeps state, and cleans up effects. That is not what a view transition does.',
      wrong: [
        {
          option:
            'They animate every render, including updates that happen outside a transition.',
          reason:
            'The animation is scoped to a transition or a navigation. Updates outside that boundary are not automatically animated.',
        },
        {
          option:
            'They replace the Pages Router and stay off until you install a separate view-transitions package.',
          reason:
            'View Transitions are a React 19.2 feature in the App Router. They do not remove the Pages Router, and they are not a third-party package you have to add.',
        },
        {
          option:
            'They hide inactive UI with display:none while keeping state, which is what Activity does.',
          reason:
            'That hide, keep-state, and clean-up-effects behavior is Activity. View Transitions animate a transition or navigation update.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { startTransition, useState, ViewTransition } from \"react\";\n\nexport function Panel() {\n  const [open, setOpen] = useState(false);\n  return (\n    <ViewTransition>\n      <button onClick={() => startTransition(() => setOpen((v) => !v))}>\n        {open ? \"Open\" : \"Closed\"}\n      </button>\n    </ViewTransition>\n  );\n}" },
      remember:
        'View Transitions animate transition and navigation updates in the React 19.2 App Router.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-016',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'useEffectEvent is part of React 19.2, which the Next.js 16 App Router uses. The Next.js 15 App Router was on React 19 and did not ship this hook as a React 19.2 API.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'The parent passes a new onMessage function on every render. What does this effect do?',
    code: {
      lang: 'tsx',
      source:
        "\"use client\";\n\nimport { useEffect, useEffectEvent } from \"react\";\n\ntype Socket = {\n  on: (event: string, cb: (text: string) => void) => void;\n  disconnect: () => void;\n};\n\ndeclare function connect(roomId: string): Socket;\n\nexport function Chat(props: {\n  roomId: string;\n  onMessage: (text: string) => void;\n}) {\n  const onMessageEvent = useEffectEvent((text: string) => {\n    props.onMessage(text);\n  });\n\n  useEffect(() => {\n    const socket = connect(props.roomId);\n    socket.on(\"message\", onMessageEvent);\n    return () => socket.disconnect();\n  }, [props.roomId]);\n\n  return null;\n}",
    },
    options: [
      'The effect reconnects on every render because onMessageEvent changes identity each time.',
      'useEffectEvent was removed in React 19.2, so this file fails to compile on Next.js 16.',
      'The effect cleanup is skipped, because useEffectEvent opts the effect out of cleanup.',
      'The effect stays tied to roomId. onMessageEvent calls the latest onMessage and is not an effect dependency.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'The socket stays connected when only onMessage changes. useEffectEvent calls the latest onMessage, and the effect re-runs only when roomId changes.',
      why: 'Read the component from top to bottom. useEffectEvent wraps the call to props.onMessage, which pulls that non-reactive logic out of the effect. The effect then connects with props.roomId, subscribes to message, and returns a cleanup that disconnects. The dependency array lists only props.roomId. When the parent passes a new onMessage function, React does not re-run the effect and does not drop the socket. The event function still calls the latest onMessage. When roomId changes, the cleanup disconnects the old socket and the effect connects again. This hook is part of React 19.2, which the Next.js 16 App Router uses. It was not a React 19.2 App Router API in Next.js 15, and it does not disable effect cleanup.',
      wrong: [
        {
          option:
            'The effect reconnects on every render because onMessageEvent changes identity each time.',
          reason:
            'useEffectEvent exists so the latest callback can be used without putting that callback in the dependency array. onMessage changing does not reconnect the socket.',
        },
        {
          option:
            'useEffectEvent was removed in React 19.2, so this file fails to compile on Next.js 16.',
          reason:
            'React 19.2 adds useEffectEvent, and the Next.js 16 App Router uses React 19.2. The import is valid.',
        },
        {
          option:
            'The effect cleanup is skipped, because useEffectEvent opts the effect out of cleanup.',
          reason:
            'The cleanup still runs when roomId changes or the component unmounts. useEffectEvent does not cancel the disconnect function.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { useEffect, useEffectEvent } from \"react\";\ndeclare function connect(roomId: string): { on: (e: string, cb: (t: string) => void) => void; disconnect: () => void };\n\nexport function Chat(props: { roomId: string; onMessage: (text: string) => void }) {\n  const onMessage = useEffectEvent((text: string) => {\n    props.onMessage(text);\n  });\n  useEffect(() => {\n    const socket = connect(props.roomId);\n    socket.on(\"message\", onMessage);\n    return () => socket.disconnect();\n  }, [props.roomId]);\n  return null;\n}" },
      remember:
        'useEffectEvent reads the latest props without making the effect re-run.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-017',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 used skipMiddlewareUrlNormalize alongside middleware.ts. Next.js 16 renames that flag to skipProxyUrlNormalize so it matches proxy.ts.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This config is supposed to skip URL normalization for the Next.js 16 proxy. What is the bug?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  skipMiddlewareUrlNormalize: true,\n};\n\nexport default nextConfig;",
    },
    options: [
      'skipMiddlewareUrlNormalize was renamed to skipProxyUrlNormalize.',
      'The flag was removed, and URL normalization can no longer be skipped.',
      'Move the flag to experimental.skipMiddlewareUrlNormalize.',
      'proxy.ts reads this flag only when the file is still named middleware.ts.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Rename skipMiddlewareUrlNormalize to skipProxyUrlNormalize. The behavior still exists under the proxy name.',
      why: 'The config sets skipMiddlewareUrlNormalize to true. That name matched middleware.ts in Next.js 15. Next.js 16 renames middleware config flags to proxy flags, so the key that actually skips normalization is skipProxyUrlNormalize. The old key does not turn the behavior on. The feature was not deleted and it did not move under experimental. It also does not depend on keeping a file named middleware.ts. skipTrailingSlashRedirect is a different flag and keeps its own name, so do not rename that one while fixing this key.',
      wrong: [
        {
          option:
            'The flag was removed, and URL normalization can no longer be skipped.',
          reason:
            'The behavior remains. Only the config name changed, from skipMiddlewareUrlNormalize to skipProxyUrlNormalize.',
        },
        {
          option: 'Move the flag to experimental.skipMiddlewareUrlNormalize.',
          reason:
            'The flag is not experimental. It was renamed at the top level of next.config to skipProxyUrlNormalize.',
        },
        {
          option:
            'proxy.ts reads this flag only when the file is still named middleware.ts.',
          reason:
            'The rename exists because proxy replaced middleware. Keeping the old filename is not how you enable the new key.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  skipProxyUrlNormalize: true,\n};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  skipProxyUrlNormalize: true,\n};\n\nexport default nextConfig;" },
      remember:
        'skipMiddlewareUrlNormalize is now skipProxyUrlNormalize.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-018',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Activity arrives with React 19.2 in the Next.js 16 App Router. The Next.js 15 App Router did not include this React 19.2 component.',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What does the React Activity component do in a Next.js 16 app?',
    options: [
      'It animates a navigation with View Transitions and unmounts the old tree immediately.',
      'It hides UI with display:none, keeps the component state, and cleans up effects while that UI is hidden.',
      'It prefetches hidden routes and keeps their effects running so the hidden UI stays live.',
      'It replaces Suspense and shows a fallback until the hidden tree is ready to paint.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Activity hides UI with display:none, keeps the component state, and cleans up effects while the UI is hidden.',
      why: 'Activity is a React 19.2 feature in the Next.js 16 App Router, for UI you want to keep around in the background. When the tree is hidden, React uses display:none so the DOM stays mounted and state is preserved. Effects are cleaned up, so timers and subscriptions do not keep running behind the hidden UI. Showing the tree again restores that state instead of mounting it from scratch. It does not animate a navigation. That is View Transitions. It does not prefetch routes, and it does not replace Suspense or render a fallback. Next.js 15 did not ship this component in the App Router.',
      wrong: [
        {
          option:
            'It animates a navigation with View Transitions and unmounts the old tree immediately.',
          reason:
            'View Transitions animate a transition or navigation. Activity keeps the hidden tree and its state, and it cleans up effects instead of using an animation.',
        },
        {
          option:
            'It prefetches hidden routes and keeps their effects running so the hidden UI stays live.',
          reason:
            'Prefetch is a separate router behavior. Activity cleans effects up while the UI is hidden. It does not leave them running.',
        },
        {
          option:
            'It replaces Suspense and shows a fallback until the hidden tree is ready to paint.',
          reason:
            'Suspense still shows fallbacks for unfinished work. Activity is about hiding already rendered UI without throwing its state away.',
        },
      ],
      example: { lang: 'tsx', source: "'use client';\n\nimport { Activity, useState } from \"react\";\n\nexport function SidebarSlot() {\n  const [open, setOpen] = useState(true);\n  return (\n    <>\n      <button onClick={() => setOpen((value) => !value)}>Toggle</button>\n      <Activity mode={open ? \"visible\" : \"hidden\"}>\n        <aside>Sidebar</aside>\n      </Activity>\n    </>\n  );\n}" },
      remember:
        'Activity hides with display:none, keeps state, and cleans up effects.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-019',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 accepted images.domains and was looser about optimizing images from a local IP. Next.js 16 deprecates images.domains in favor of images.remotePatterns, restricts local IP optimization, and changes image defaults such as minimumCacheTTL, imageSizes, and qualities.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'What is wrong with this Next.js 16 image config?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  images: {\n    domains: [\"images.example.com\", \"192.168.1.20\"],\n  },\n};\n\nexport default nextConfig;",
    },
    options: [
      'domains is still the supported allow-list, and optimizing a local IP is allowed by default.',
      'Rename domains to imageSizes. The old minimumCacheTTL, imageSizes, and qualities defaults are safe to keep relying on.',
      'images.domains is deprecated in favor of images.remotePatterns, and optimizing images from a local IP is restricted. If you depended on the old minimumCacheTTL, imageSizes, or qualities defaults, set them explicitly.',
      'next/legacy/image is the supported import, and remotePatterns was removed in Next.js 16.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Replace images.domains with images.remotePatterns. Local IP optimization is restricted. Set minimumCacheTTL, imageSizes, or qualities yourself if you depended on the old defaults.',
      why: 'The config allow-lists images.example.com and the private address 192.168.1.20 through images.domains. Next.js 16 deprecates images.domains. The replacement is images.remotePatterns, where you name the protocol and hostname for the public host. A second breaking change restricts optimization of images from a local IP, so the private address is not a host you should expect to optimize the way Next.js 15 did. Only set images.dangerouslyAllowLocalIP to true when you understand the SSRF risk on a private network. The defaults for minimumCacheTTL, imageSizes, and qualities also changed. Do not guess the new numbers. If the app depended on an old default, set that value explicitly. next/legacy/image is deprecated too, so it is not a way around this config.',
      wrong: [
        {
          option:
            'domains is still the supported allow-list, and optimizing a local IP is allowed by default.',
          reason:
            'images.domains is deprecated, and local IP optimization is restricted rather than left open by default.',
        },
        {
          option:
            'Rename domains to imageSizes. The old minimumCacheTTL, imageSizes, and qualities defaults are safe to keep relying on.',
          reason:
            'imageSizes is a width list, not a host allow-list. Those defaults changed, so relying on the old ones is the unsafe choice.',
        },
        {
          option:
            'next/legacy/image is the supported import, and remotePatterns was removed in Next.js 16.',
          reason:
            'next/legacy/image is deprecated. remotePatterns is the replacement for images.domains, not a removed API.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  images: {\n    remotePatterns: [\n      {\n        protocol: \"https\",\n        hostname: \"images.example.com\",\n      },\n    ],\n  },\n};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  images: {\n    remotePatterns: [\n      {\n        protocol: \"https\",\n        hostname: \"images.example.com\",\n      },\n    ],\n  },\n};\n\nexport default nextConfig;" },
      remember:
        'Use images.remotePatterns. Local IP optimization is restricted. Set changed image defaults explicitly.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-020',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 middleware.ts was the request interceptor and ran on the Edge runtime. Next.js 16 keeps middleware.ts only for Edge, marks it deprecated, and adds proxy.ts for the Node.js runtime.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt:
      'The app has this middleware.ts and no proxy.ts. The team still needs the Edge runtime. What does Next.js 16 do?',
    code: {
      lang: 'ts',
      source:
        "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\nexport function middleware(request: NextRequest) {\n  return NextResponse.next();\n}",
    },
    options: [
      'middleware.ts is deleted by the upgrade and every request fails closed.',
      'middleware.ts now runs on Node.js, and the Edge runtime is no longer available.',
      'Rename the export to proxy and keep the filename middleware.ts so the file stays on Edge.',
      'middleware.ts still runs on the Edge runtime, and it is deprecated. The Node.js replacement is proxy.ts with a function named proxy.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'This middleware.ts file still runs on the Edge runtime, and it is deprecated. proxy.ts with a proxy function is the Node.js replacement, not an Edge rename.',
      why: 'The file is still named middleware.ts and still exports a function named middleware that returns NextResponse.next. Next.js 16 does not delete that file and does not move it onto Node.js. It remains the path for the Edge runtime, and that path is deprecated. Do not rename only the function to proxy while leaving the filename as middleware.ts. The Node.js convention is the opposite pair: the file is proxy.ts and the export is proxy, or a default export, with the name proxy recommended. You cannot set proxy.ts to edge. Keep this file while the team still needs Edge, and do not blindly rename an Edge middleware file to proxy.ts.',
      wrong: [
        {
          option:
            'middleware.ts is deleted by the upgrade and every request fails closed.',
          reason:
            'The file still works for the Edge runtime. Requests are not failed closed just because proxy.ts is absent.',
        },
        {
          option:
            'middleware.ts now runs on Node.js, and the Edge runtime is no longer available.',
          reason:
            'Node.js is the proxy.ts runtime. middleware.ts is the remaining Edge file, and Edge was not removed.',
        },
        {
          option:
            'Rename the export to proxy and keep the filename middleware.ts so the file stays on Edge.',
          reason:
            'The Edge file keeps the middleware filename and the middleware export. The proxy name belongs to proxy.ts, which cannot run on Edge.',
        },
      ],
      example: { lang: 'ts', source: "import { NextResponse } from \"next/server\";\nimport type { NextRequest } from \"next/server\";\n\n// proxy.ts — Node.js runtime\nexport function proxy(request: NextRequest) {\n  return NextResponse.next();\n}\n\n// middleware.ts — deprecated, Edge runtime only\nexport function middleware(request: NextRequest) {\n  return NextResponse.next();\n}" },
      remember:
        'middleware.ts is the deprecated Edge path. proxy.ts is the Node.js path.',
      docs: 'https://nextjs.org/docs/app/api-reference/file-conventions/proxy',
    },
  },
  {
    id: 'n16b-021',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'after() from next/server existed in Next.js 15 and still exists in Next.js 16. What Next.js 16 removed is serverRuntimeConfig, publicRuntimeConfig, and getConfig from next/config.',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt:
      'A migration note says Next.js 16 removed after() from next/server, and that every env var is visible in Client Components. Which conclusion is right?',
    options: [
      'Keep after() from next/server. Read server secrets from process.env on the server. Client-visible values need the NEXT_PUBLIC_ prefix. Use React taint APIs so a secret is not passed into a Client Component.',
      'Delete every after() call because the API was removed, and prefix secrets with NEXT_PUBLIC_ so they stay server-only.',
      'Move after() to next/cache, and publish secrets on the window object after navigation.',
      'after() now runs only inside proxy.ts, and a NEXT_PUBLIC_ value is never shipped to the browser.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Keep after() from next/server. Read secrets from process.env on the server, use NEXT_PUBLIC_ only for client-visible values, and taint secrets so they cannot reach a Client Component.',
      why: 'after() from next/server is still part of Next.js 16. Deleting those calls, moving them to next/cache, or confining them to proxy.ts is not this upgrade. The APIs that were removed are serverRuntimeConfig, publicRuntimeConfig, and getConfig from next/config. Server code reads process.env directly. The NEXT_PUBLIC_ prefix is what exposes a value to Client Components, so adding it to a secret does the opposite of hiding it. A value that must never be passed into a Client Component should be protected with the React taint APIs. If a server env value must be read at request time rather than inlined at build, await connection() from next/server before reading it.',
      wrong: [
        {
          option:
            'Delete every after() call because the API was removed, and prefix secrets with NEXT_PUBLIC_ so they stay server-only.',
          reason:
            'after() was not removed. NEXT_PUBLIC_ makes a value client-visible, so it does not keep a secret on the server.',
        },
        {
          option:
            'Move after() to next/cache, and publish secrets on the window object after navigation.',
          reason:
            'after() stays in next/server. Putting a secret on the window object publishes it to the browser.',
        },
        {
          option:
            'after() now runs only inside proxy.ts, and a NEXT_PUBLIC_ value is never shipped to the browser.',
          reason:
            'after() is not limited to proxy.ts. A NEXT_PUBLIC_ value is shipped to the browser on purpose.',
        },
      ],
      example: { lang: 'tsx', source: "import { after } from \"next/server\";\nimport { experimental_taintUniqueValue } from \"react\";\n\nexport async function Page() {\n  const secret = process.env.API_TOKEN;\n  if (secret) {\n    experimental_taintUniqueValue(\n      \"Do not pass API_TOKEN to a Client Component\",\n      process,\n      secret\n    );\n  }\n  after(() => console.log(\"request finished\"));\n  return <p>{process.env.NEXT_PUBLIC_API_URL}</p>;\n}" },
      remember:
        'after() remains. NEXT_PUBLIC_ is for the client, and taint keeps secrets out of Client Components.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
  {
    id: 'n16b-022',
    tech: 'next16',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 read Turbopack settings from experimental.turbopack and required --turbopack to opt in. Next.js 16 uses a top-level turbopack key, and Turbopack is already the default unless you pass --webpack.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This Turbopack alias config was valid in Next.js 15. What is the bug on Next.js 16?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  experimental: {\n    turbopack: {\n      resolveAlias: {\n        lodash: \"lodash-es\",\n      },\n    },\n  },\n};\n\nexport default nextConfig;",
    },
    options: [
      'Keep the alias under experimental.turbopack and pass --turbopack to next dev and next build.',
      'Move the object to the top-level turbopack key. Turbopack is already the default for next dev and next build. Opt out with --webpack.',
      'Put resolveAlias on the webpack key. --turbopack is still required to opt in.',
      'Delete the alias. A custom bundler config is silently ignored and the build succeeds.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Move the alias to the top-level turbopack key. Turbopack is already the default for next dev and next build. Pass --webpack only if you still want Webpack.',
      why: 'The config nests resolveAlias under experimental.turbopack, which is where Next.js 15 kept these options, and you used to pass --turbopack to opt in. Next.js 16 moves that object to a top-level turbopack key, so this experimental block is not the current location for the lodash alias. You no longer pass --turbopack to turn the bundler on. next dev and next build already use Turbopack. Pass --webpack when you need to opt out. Putting the alias on a webpack function is not the Turbopack migration, and a custom webpack config is not silently ignored: next build fails until you migrate it or pass --webpack. The Build Adapters API is a separate alpha and is not how you set this alias.',
      wrong: [
        {
          option:
            'Keep the alias under experimental.turbopack and pass --turbopack to next dev and next build.',
          reason:
            'experimental.turbopack is the old location, and --turbopack is no longer how you opt in. The default bundler is already Turbopack.',
        },
        {
          option:
            'Put resolveAlias on the webpack key. --turbopack is still required to opt in.',
          reason:
            'resolveAlias belongs on the top-level turbopack key. A webpack config makes next build fail, and --turbopack is not required to select Turbopack.',
        },
        {
          option:
            'Delete the alias. A custom bundler config is silently ignored and the build succeeds.',
          reason:
            'The alias can move to turbopack.resolveAlias. A webpack config is not silently ignored, and deleting the alias is not the migration.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  turbopack: {\n    resolveAlias: {\n      lodash: \"lodash-es\",\n    },\n  },\n};\n\nexport default nextConfig;",
      },
      example: { lang: 'ts', source: "import type { NextConfig } from \"next\";\n\nconst nextConfig: NextConfig = {\n  turbopack: {\n    resolveAlias: {\n      lodash: \"lodash-es\",\n    },\n  },\n};\n\nexport default nextConfig;" },
      remember:
        'Turbopack options live on the top-level turbopack key. Opt out with --webpack.',
      docs: 'https://nextjs.org/docs/app/guides/upgrading/version-16',
    },
  },
] satisfies Question[];
