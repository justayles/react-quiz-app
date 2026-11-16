import type { Question } from '../types';

export const next15bQuestions = [
  {
    id: 'n15b-001',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'In Next.js 15, next dev --turbopack (also --turbo) is the stable dev bundler, and production builds still use webpack unless you opt into Turbopack. Next.js 16 makes Turbopack the default for both next dev and next build, and you opt out with --webpack.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'In Next.js 15, what does next dev --turbopack do, and what does next build use by default?',
    options: [
      'It turns on the stable Turbopack dev server. next build still uses webpack unless you opt into Turbopack.',
      'It makes Turbopack the bundler for both next dev and next build, with no extra flag.',
      'It is an alias that still runs the webpack dev server and only prints a warning.',
      'It enables Turbopack for production only, while next dev stays on webpack.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'next dev --turbopack selects the stable Turbopack dev server. Production builds stay on webpack unless you opt into Turbopack.',
      why: 'Passing --turbopack, also spelled --turbo, turns on the stable Turbopack dev server. A production next build still uses webpack unless you opt that build into Turbopack. The dev flag does not switch production builds over by itself. Put the flag on the dev script only, and choose the production bundler separately.',
      wrong: [
        {
          option:
            'It makes Turbopack the bundler for both next dev and next build, with no extra flag.',
          reason:
            'That is the later default. In this version the production build stays on webpack until you opt in.',
        },
        {
          option:
            'It is an alias that still runs the webpack dev server and only prints a warning.',
          reason:
            'The flag really switches the dev server to Turbopack. It is not a warning alias for webpack.',
        },
        {
          option: 'It enables Turbopack for production only, while next dev stays on webpack.',
          reason:
            'The flag is for next dev. Production is the command that still defaults to webpack.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "const nextScripts = {\n  dev: 'next dev --turbopack',\n  build: 'next build',\n  start: 'next start',\n} as const;\n\nexport default nextScripts;\n",
      },
      remember:
        'In Next.js 15, Turbopack is the stable dev bundler; production still defaults to webpack.',
    },
  },
  {
    id: 'n15b-002',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 reads Turbopack options from experimental.turbopack. Next.js 16 moves that same object to the top-level turbopack key.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This next.config.ts is for a Next.js 15 app. What is wrong?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  turbopack: {\n    resolveAlias: {\n      underscore: 'lodash',\n    },\n  },\n};\n\nexport default nextConfig;\n",
    },
    options: [
      'resolveAlias is not a Turbopack setting, so the alias is dropped and the rest of the file is fine.',
      'Next.js 15 reads Turbopack settings from experimental.turbopack. The top-level turbopack key is the Next.js 16 shape and does not configure Next.js 15.',
      'next.config.ts cannot export a typed config object, so Next.js ignores the file until you rename it to next.config.js.',
      'The alias is applied only when you pass --webpack to next dev, because Turbopack has no resolveAlias.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Move the Turbopack object under experimental.turbopack. The top-level turbopack key is the Next.js 16 config shape.',
      why: 'This config object uses the top-level turbopack key. That key is how the following major version reads Turbopack options. This version still looks under experimental.turbopack, so the alias never reaches the dev bundler. Move the same object under experimental and leave the rest of the config as it is.',
      wrong: [
        {
          option:
            'resolveAlias is not a Turbopack setting, so the alias is dropped and the rest of the file is fine.',
          reason:
            'resolveAlias is a real Turbopack setting. The object is simply nested under the wrong key for this version.',
        },
        {
          option:
            'next.config.ts cannot export a typed config object, so Next.js ignores the file until you rename it to next.config.js.',
          reason:
            'next.config.ts is supported, and a typed object export is a normal config. The filename is not the bug.',
        },
        {
          option:
            'The alias is applied only when you pass --webpack to next dev, because Turbopack has no resolveAlias.',
          reason:
            '--webpack selects webpack, which does not read this Turbopack alias. The fix is the experimental.turbopack key.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  experimental: {\n    turbopack: {\n      resolveAlias: {\n        underscore: 'lodash',\n      },\n    },\n  },\n};\n\nexport default nextConfig;\n",
      },
      remember: 'Next.js 15: experimental.turbopack. Next.js 16: top-level turbopack.',
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  experimental: {\n    turbopack: {\n      resolveAlias: {\n        underscore: 'lodash',\n      },\n    },\n  },\n};\n\nexport default nextConfig;\n",
      },
    },
  },
  {
    id: 'n15b-003',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 supports next.config.ts, including a type-only import of NextConfig from next. Next.js 16 keeps that TypeScript config filename and the same NextConfig type.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Next.js 15 starts and loads this next.config.ts. What is the result?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  poweredByHeader: false,\n};\n\nexport default nextConfig;\n",
    },
    options: [
      'Next.js refuses to load the file because config files must be named next.config.js or next.config.mjs.',
      'The type import survives as a runtime import, and poweredByHeader is ignored because that option was removed.',
      'Next.js loads this file, applies poweredByHeader: false, and the type-only import has no runtime value.',
      'The default export must be a function that returns the config, so this object export is skipped.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Next.js loads this TypeScript config and turns the x-powered-by header off. The NextConfig import is type-only, so it disappears before the file runs.',
      why: 'Next.js 15 loads next.config.ts directly, so this file is the real config and poweredByHeader: false is applied. The line that imports the NextConfig type is erased before the file runs, which means it adds no runtime import. You do not need to switch the export to a function for this object to count. A JavaScript config is still allowed, but it is not required.',
      wrong: [
        {
          option:
            'Next.js refuses to load the file because config files must be named next.config.js or next.config.mjs.',
          reason:
            'next.config.ts is a supported config filename in this version. The server loads it.',
        },
        {
          option:
            'The type import survives as a runtime import, and poweredByHeader is ignored because that option was removed.',
          reason:
            'import type is erased, and poweredByHeader is still a real option. false removes the header.',
        },
        {
          option:
            'The default export must be a function that returns the config, so this object export is skipped.',
          reason:
            'A function export is optional. A plain object default export is valid and is used as the config.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  poweredByHeader: false,\n};\n\nexport default nextConfig;\n",
      },
      remember: 'next.config.ts plus import type { NextConfig } from next is a normal Next.js 15 config.',
    },
  },
  {
    id: 'n15b-004',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 made instrumentation.ts stable, so register runs without experimental.instrumentationHook. Next.js 16 keeps register and onRequestError stable and still does not use that flag.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'How do you enable instrumentation.ts in Next.js 15, and what does onRequestError receive?',
    options: [
      'Set experimental.instrumentationHook to true and export only register. onRequestError is not a function you export from instrumentation.ts.',
      'Call onRequestError from next/server inside middleware. register stays experimental until you set the hook flag.',
      'Add instrumentation.ts and set experimental.instrumentationHook. onRequestError reports Pages Router errors only.',
      'Export register from instrumentation.ts. The hook is stable, so you do not set experimental.instrumentationHook. onRequestError receives the error, the request, and context that names the router and whether the failure came from a Server Component, a Server Action, a Route Handler, or Middleware.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Export register from instrumentation.ts and do not set experimental.instrumentationHook. onRequestError reports the request plus which router and which server surface failed.',
      why: 'Drop a register function in instrumentation.ts and the server picks it up without a config flag. experimental.instrumentationHook is the old switch and is not how you enable the file. onRequestError sits in the same module and is called with the error, the request, and a context object. That context tells you whether the router was the App Router or the Pages Router, and whether the failure came from a Server Component, a Server Action, a Route Handler, or Middleware.',
      wrong: [
        {
          option:
            'Set experimental.instrumentationHook to true and export only register. onRequestError is not a function you export from instrumentation.ts.',
          reason:
            'The experimental flag is not required, and onRequestError is a real export from the same file.',
        },
        {
          option:
            'Call onRequestError from next/server inside middleware. register stays experimental until you set the hook flag.',
          reason:
            'register is stable in this version. onRequestError is exported from instrumentation.ts, not called from middleware.',
        },
        {
          option:
            'Add instrumentation.ts and set experimental.instrumentationHook. onRequestError reports Pages Router errors only.',
          reason:
            'You do not set the old flag. The context covers both the App Router and the Pages Router.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "export async function register() {\n  console.log('instrumentation ready');\n}\n\nexport async function onRequestError(\n  error: Error,\n  request: { path: string; method: string },\n  context: {\n    routerKind: 'App Router' | 'Pages Router';\n    routeType: 'render' | 'route' | 'action' | 'middleware';\n  }\n) {\n  console.error(context.routeType, request.path, error.message);\n}\n",
      },
      remember:
        'instrumentation.ts is stable: export register, and do not set experimental.instrumentationHook.',
    },
  },
  {
    id: 'n15b-005',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 onRequestError context uses routerKind for App Router or Pages Router, and routeType for the server surface. Next.js 16 keeps that split and still does not require experimental.instrumentationHook.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'This onRequestError is supposed to log middleware failures. What is wrong with the condition?',
    code: {
      lang: 'ts',
      source:
        "export async function onRequestError(\n  error: Error,\n  request: { path: string; method: string },\n  context: { routerKind: string; routeType: string }\n) {\n  if (context.routerKind === 'middleware') {\n    console.error(request.method, request.path, error.message);\n  }\n}\n",
    },
    options: [
      'routerKind is only App Router or Pages Router. Middleware is reported on routeType, so this condition never matches a middleware failure.',
      'onRequestError cannot be async, so the function returns before the comparison runs.',
      'The request argument has no path field, so reading request.path throws before the if.',
      'context is empty unless experimental.instrumentationHook is true, so routerKind is always undefined.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Compare routeType to middleware. routerKind only says whether the router was the App Router or the Pages Router.',
      why: 'routerKind reports the router family, App Router or Pages Router. It is never the string middleware. The surface that failed is routeType: render for a Server Component, route for a Route Handler, action for a Server Action, and middleware for Middleware. This condition compares the wrong field, so a middleware failure never enters the branch. Check routeType when you want that surface.',
      wrong: [
        {
          option: 'onRequestError cannot be async, so the function returns before the comparison runs.',
          reason: 'The hook may be async. The comparison runs, and it checks the wrong field.',
        },
        {
          option: 'The request argument has no path field, so reading request.path throws before the if.',
          reason: 'The request object includes path and method. The log line is fine. The if condition is not.',
        },
        {
          option:
            'context is empty unless experimental.instrumentationHook is true, so routerKind is always undefined.',
          reason:
            'The hook is stable without that flag, and context is populated. routerKind is simply the wrong field for this check.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "export async function onRequestError(\n  error: Error,\n  request: { path: string; method: string },\n  context: { routerKind: string; routeType: string }\n) {\n  if (context.routeType === 'middleware') {\n    console.error(request.method, request.path, error.message);\n  }\n}\n",
      },
      remember:
        'routerKind is App Router or Pages Router. routeType names the Server Component, Route Handler, Server Action, or Middleware.',
      fixedCode: {
        lang: 'ts',
        source:
          "export async function onRequestError(\n  error: Error,\n  request: { path: string; method: string },\n  context: { routerKind: string; routeType: string }\n) {\n  if (context.routeType === 'middleware') {\n    console.error(request.method, request.path, error.message);\n  }\n}\n",
      },
    },
  },
  {
    id: 'n15b-006',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 added Form in next/form for navigations whose action is a URL. Next.js 16 keeps that component, and a Server Action is still a function action in both versions.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'A search box should navigate to /search, prefetch that route, use a client transition when JavaScript is available, and still submit when JavaScript is off. Which implementation matches Next.js 15?',
    options: [
      'A Server Action that receives FormData and calls redirect. Form from next/form cannot navigate to a URL.',
      'Import Form from next/form and set action to the string /search. It prefetches, navigates on the client, and still works with no JavaScript. A Server Action is a function action, not this component.',
      'Import Form from next/form and set action to an async server function. The string action is only a polyfill for Server Actions.',
      'A Route Handler that returns a React element. next/form is an alias of that handler and does not render a form.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Use Form from next/form with a URL action. A Server Action is a function you pass as the action of a form, not this component.',
      why: 'A search form whose action is a URL should use Form from next/form. That component prefetches the destination, performs a client navigation when JavaScript is available, and still submits as a normal form when JavaScript is not. A Server Action is a function passed as the action, not this component. Use a normal form element when the action is a function.',
      wrong: [
        {
          option:
            'A Server Action that receives FormData and calls redirect. Form from next/form cannot navigate to a URL.',
          reason:
            'A redirect inside an action is a different tool. Form from next/form is exactly the component that navigates to a URL.',
        },
        {
          option:
            'Import Form from next/form and set action to an async server function. The string action is only a polyfill for Server Actions.',
          reason:
            'This component is for a string URL. A Server Action is the function form of action, and it is not what Form is for.',
        },
        {
          option:
            'A Route Handler that returns a React element. next/form is an alias of that handler and does not render a form.',
          reason:
            'next/form exports a form component. It is not a Route Handler, and it does render a form.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import { Form } from 'next/form';\n\nexport default function SearchForm() {\n  return (\n    <Form action='/search'>\n      <input name='q' />\n      <button type='submit'>Search</button>\n    </Form>\n  );\n}\n",
      },
      remember: 'URL navigation: Form from next/form. Server Action: a function action.',
    },
  },
  {
    id: 'n15b-007',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 Form from next/form prefetches a URL action, does a client navigation, and still submits with no JavaScript. Next.js 16 keeps that behavior, and it is still not how you bind a Server Action.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'What happens when this form is submitted with JavaScript enabled, and when JavaScript is disabled?',
    code: {
      lang: 'tsx',
      source:
        "import { Form } from 'next/form';\n\nexport default function SearchForm() {\n  return (\n    <Form action='/search'>\n      <input name='q' />\n      <button type='submit'>Search</button>\n    </Form>\n  );\n}\n",
    },
    options: [
      'Both cases POST to a hidden Server Action. The /search string is only a prefetch hint.',
      'With JavaScript, Next.js calls a Server Action named search. Without JavaScript, the submit is cancelled.',
      'With JavaScript, Next.js prefetches and performs a client navigation to /search. Without JavaScript, the browser performs a normal navigation to /search.',
      'The form only works with JavaScript, because next/form removes the action attribute and cancels native submit.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'JavaScript gets a prefetched client navigation to /search. No JavaScript gets a normal browser navigation to the same URL.',
      why: 'The action prop is the string /search, so this is a navigation form rather than a Server Action. While JavaScript is on, Form prefetches that route and submits with a client navigation. With JavaScript off, the browser falls back to an ordinary form navigation to the same URL. Nothing in this file registers a server function.',
      wrong: [
        {
          option: 'Both cases POST to a hidden Server Action. The /search string is only a prefetch hint.',
          reason:
            'A string action is the destination URL. There is no hidden Server Action behind this form.',
        },
        {
          option:
            'With JavaScript, Next.js calls a Server Action named search. Without JavaScript, the submit is cancelled.',
          reason:
            'The segment search is a path, not a function name. The no-JavaScript case still navigates.',
        },
        {
          option:
            'The form only works with JavaScript, because next/form removes the action attribute and cancels native submit.',
          reason:
            'The component keeps a real action so the form still works when JavaScript never loads.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import { Form } from 'next/form';\n\nexport default function SearchForm() {\n  return (\n    <Form action='/search'>\n      <input name='q' />\n      <button type='submit'>Search</button>\n    </Form>\n  );\n}\n",
      },
      remember: 'next/form with a URL action navigates, with or without JavaScript.',
    },
  },
  {
    id: 'n15b-008',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 replaced experimental.serverComponentsExternalPackages with top-level serverExternalPackages. Next.js 16 keeps serverExternalPackages as the opt-out and does not restore the experimental name.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author wants bcrypt to stay external to the App Router server bundle. What is wrong?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  experimental: {\n    serverComponentsExternalPackages: ['bcrypt'],\n  },\n};\n\nexport default nextConfig;\n",
    },
    options: [
      'The App Router already leaves every package external, so listing bcrypt is the bug and the array should be deleted.',
      'bundlePagesRouterDependencies is the App Router opt-out list, so the array should move to that key.',
      'The experimental key still works if each name is prefixed with node:.',
      'Next.js 15 does not read experimental.serverComponentsExternalPackages. Opt these packages out with the top-level serverExternalPackages array.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Use the top-level serverExternalPackages array. The experimental.serverComponentsExternalPackages name is the old key people still write by mistake.',
      why: 'The App Router bundles external server packages by default, and the opt-out list is the top-level serverExternalPackages array. experimental.serverComponentsExternalPackages is the previous name, and this version does not read it. The package in this array therefore stays in the bundle. Rename the key and move it to the top level of the config.',
      wrong: [
        {
          option:
            'The App Router already leaves every package external, so listing bcrypt is the bug and the array should be deleted.',
          reason:
            'The App Router default is to bundle server packages. You list a package when you want it to stay external.',
        },
        {
          option:
            'bundlePagesRouterDependencies is the App Router opt-out list, so the array should move to that key.',
          reason:
            'That flag opts the Pages Router into bundling. It is not the App Router opt-out list.',
        },
        {
          option: 'The experimental key still works if each name is prefixed with node:.',
          reason:
            'A node: prefix does not revive the old key. The supported name is serverExternalPackages, and the package name stays bcrypt.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  serverExternalPackages: ['bcrypt'],\n};\n\nexport default nextConfig;\n",
      },
      remember:
        'App Router bundles server packages by default. Opt out with serverExternalPackages, not the old experimental name.',
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  serverExternalPackages: ['bcrypt'],\n};\n\nexport default nextConfig;\n",
      },
    },
  },
  {
    id: 'n15b-009',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 bundles App Router server packages by default, with serverExternalPackages as the opt-out and bundlePagesRouterDependencies for the Pages Router. Next.js 16 keeps those two config names.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement about server package bundling in Next.js 15 is correct?',
    options: [
      'The App Router bundles external server packages by default. serverExternalPackages opts specific packages out. bundlePagesRouterDependencies opts the Pages Router into bundling.',
      'Both routers leave every npm package external. serverExternalPackages is what turns bundling on for the App Router.',
      'The App Router bundles packages only when you set bundlePagesRouterDependencies. serverExternalPackages is the old name for that flag.',
      'experimental.serverComponentsExternalPackages is still the supported opt-out, and serverExternalPackages is ignored.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'The App Router bundles server packages unless you list them in serverExternalPackages. bundlePagesRouterDependencies is what opts the Pages Router into that bundling.',
      why: 'Bundling is on by default for server code in the App Router, which is a change from leaving those packages external. serverExternalPackages names the packages that should stay external anyway, such as native addons. The Pages Router still does not bundle its dependencies unless bundlePagesRouterDependencies is set. That second flag opts the Pages Router in. It is not the App Router opt-out, and the old experimental key is not the supported name.',
      wrong: [
        {
          option:
            'Both routers leave every npm package external. serverExternalPackages is what turns bundling on for the App Router.',
          reason:
            'The App Router already bundles. serverExternalPackages turns bundling off for the names you list.',
        },
        {
          option:
            'The App Router bundles packages only when you set bundlePagesRouterDependencies. serverExternalPackages is the old name for that flag.',
          reason:
            'The App Router bundles without that flag. The flag is the Pages Router opt-in, and serverExternalPackages is a different list.',
        },
        {
          option:
            'experimental.serverComponentsExternalPackages is still the supported opt-out, and serverExternalPackages is ignored.',
          reason:
            'The experimental name is the leftover people still write. serverExternalPackages is the key this version reads.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  serverExternalPackages: ['bcrypt'],\n  bundlePagesRouterDependencies: true,\n};\n\nexport default nextConfig;\n",
      },
      remember:
        'App Router bundles by default. serverExternalPackages opts out. bundlePagesRouterDependencies opts the Pages Router in.',
    },
  },
  {
    id: 'n15b-010',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 replaced experimental.swrDelta with expireTime, which defaults to one year, and it does not overwrite a Cache-Control header you set. Next.js 16 keeps expireTime for that ISR window and still preserves your Cache-Control header.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This config is meant to set a one-hour stale-while-revalidate window for self-hosted ISR. What is wrong?',
    code: {
      lang: 'ts',
      source:
        "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  experimental: {\n    swrDelta: 3600,\n  },\n};\n\nexport default nextConfig;\n",
    },
    options: [
      'swrDelta must be a string such as 3600s. A number is ignored even under the right key.',
      'The ISR stale-while-revalidate window is expireTime on the top-level config. experimental.swrDelta is the old name and does not set that window in Next.js 15.',
      'expireTime replaced swrDelta, but it only applies when you also set a custom cacheHandler.',
      'Next.js 15 always overwrites Cache-Control, so this experimental flag is the only way to choose a max-age.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Set top-level expireTime. experimental.swrDelta is the old name and does not control the ISR window anymore.',
      why: 'The ISR stale-while-revalidate window is the top-level expireTime setting, measured in seconds. experimental.swrDelta is the old name and no longer sets that window. The replacement uses 3600, which is one hour, and omitting the key leaves the one-year default. This version also does not overwrite a Cache-Control header you set yourself, so expireTime is not a tool for replacing that header.',
      wrong: [
        {
          option: 'swrDelta must be a string such as 3600s. A number is ignored even under the right key.',
          reason:
            'The unit is a number of seconds, but the key itself is wrong. expireTime: 3600 is the one-hour setting.',
        },
        {
          option: 'expireTime replaced swrDelta, but it only applies when you also set a custom cacheHandler.',
          reason:
            'expireTime stands on its own for the ISR stale-while-revalidate window. A custom cache handler is not required.',
        },
        {
          option:
            'Next.js 15 always overwrites Cache-Control, so this experimental flag is the only way to choose a max-age.',
          reason:
            'This version does not overwrite a Cache-Control header you set. The experimental flag is not read as the ISR window.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  expireTime: 3600,\n};\n\nexport default nextConfig;\n",
      },
      remember:
        'Self-hosted ISR uses expireTime in seconds. The default is one year, and your own Cache-Control header stays.',
      fixedCode: {
        lang: 'ts',
        source:
          "import type { NextConfig } from 'next';\n\nconst nextConfig: NextConfig = {\n  expireTime: 3600,\n};\n\nexport default nextConfig;\n",
      },
    },
  },
  {
    id: 'n15b-011',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 removed the squoosh image optimizer and uses sharp automatically for next start and standalone output. Next.js 16 keeps sharp for next/image and does not bring squoosh back.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt:
      'You self-host Next.js 15 with next start. How are optimized images processed, and what happened to squoosh?',
    options: [
      'You must install squoosh. sharp is used only when output is export.',
      'Images are optimized in the browser, so neither sharp nor squoosh runs on the server.',
      'sharp is used automatically for next/image when you next start or use standalone output. The squoosh optimizer was removed.',
      'next start skips image optimization unless you set images.loader to squoosh.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'next start and standalone output use sharp for next/image automatically. The squoosh optimizer is gone.',
      why: 'Self-hosted image optimization no longer goes through squoosh, because that optimizer was removed. When you run next start, or when you run a standalone server, sharp is the optimizer next/image uses automatically. You do not select it with a squoosh loader name. A static export still has no server optimizer, and that is a separate case from next start and standalone.',
      wrong: [
        {
          option: 'You must install squoosh. sharp is used only when output is export.',
          reason:
            'squoosh was removed. sharp is the optimizer for next start and standalone, not for a static export.',
        },
        {
          option: 'Images are optimized in the browser, so neither sharp nor squoosh runs on the server.',
          reason:
            'Optimization runs on the server. sharp is selected for next start and standalone output.',
        },
        {
          option: 'next start skips image optimization unless you set images.loader to squoosh.',
          reason:
            'There is no squoosh loader to select. next start already uses sharp without that setting.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import Image from 'next/image';\n\nexport default function Cover() {\n  return (\n    <Image\n      src='/cover.png'\n      alt='Cover'\n      width={1200}\n      height={630}\n    />\n  );\n}\n",
      },
      remember: 'Self-hosted next/image uses sharp on next start and standalone. squoosh is gone.',
    },
  },
  {
    id: 'n15b-012',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 throws when a next/image src has leading or trailing spaces instead of trimming them. Next.js 16 keeps that strict check.',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'What does Next.js 15 do with this next/image src?',
    code: {
      lang: 'tsx',
      source:
        "import Image from 'next/image';\n\nexport default function Avatar() {\n  return <Image src=' /avatar.png ' alt='Avatar' width={64} height={64} />;\n}\n",
    },
    options: [
      'It trims the spaces and optimizes /avatar.png.',
      'It encodes the spaces as %20 and requests that path from the optimizer.',
      'It treats the value as an external URL and skips the optimizer.',
      'It throws because src has leading or trailing spaces.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'next/image throws. A src with leading or trailing spaces is rejected instead of trimmed.',
      why: 'The src value starts and ends with a space, even though the intended path is /avatar.png. next/image refuses leading or trailing spaces instead of trimming them. The component throws when it sees this string. Encoding the spaces or treating the path as remote would hide a bad source, so the runtime rejects it. Pass the path with the spaces removed.',
      wrong: [
        {
          option: 'It trims the spaces and optimizes /avatar.png.',
          reason: 'Older code could look like it tolerated padding. This version throws instead of trimming.',
        },
        {
          option: 'It encodes the spaces as %20 and requests that path from the optimizer.',
          reason: 'The spaces are not encoded into a path. The invalid src fails before optimization.',
        },
        {
          option: 'It treats the value as an external URL and skips the optimizer.',
          reason: 'A local path with padding is not an external URL. The component throws on the spaces.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import Image from 'next/image';\n\nexport default function Avatar() {\n  return (\n    <Image\n      src='/avatar.png'\n      alt='Avatar'\n      width={64}\n      height={64}\n    />\n  );\n}\n",
      },
      remember: 'next/image throws when src has leading or trailing spaces.',
    },
  },
  {
    id: 'n15b-013',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 serves optimized images with Content-Disposition attachment by default, and the separate @next/font package is gone. Next.js 16 keeps both: import fonts from next/font, and the optimized-image disposition stays attachment.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement about images and fonts in Next.js 15 is correct?',
    options: [
      'Optimized images use Content-Disposition attachment by default. The external @next/font package is gone, so you import fonts from next/font.',
      'Optimized images are served inline by default. Install @next/font to load fonts in the App Router.',
      'Content-Disposition defaults to inline, and next/font works only if @next/font is installed beside it.',
      'Fonts must be imported from @next/font/google, and attachment is only used when you set images.unoptimized.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Optimized images default to Content-Disposition attachment. Import fonts from next/font, because the external @next/font package is gone.',
      why: 'Optimized images use a default Content-Disposition of attachment. Fonts are imported from next/font, usually through next/font/google or next/font/local. The external @next/font package is gone, so adding that dependency does not bring the old import back. The disposition default and the font entry are separate changes, and neither one depends on installing the removed package.',
      wrong: [
        {
          option:
            'Optimized images are served inline by default. Install @next/font to load fonts in the App Router.',
          reason:
            'The optimized-image default is attachment, and fonts come from the built-in next/font module.',
        },
        {
          option:
            'Content-Disposition defaults to inline, and next/font works only if @next/font is installed beside it.',
          reason:
            'The default disposition is attachment. next/font does not need the removed package.',
        },
        {
          option:
            'Fonts must be imported from @next/font/google, and attachment is only used when you set images.unoptimized.',
          reason:
            'The import path is next/font, not the removed package. attachment is the optimizer default, not an unoptimized-only mode.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import { Inter } from 'next/font/google';\nimport Image from 'next/image';\n\nconst inter = Inter({ subsets: ['latin'] });\n\nexport default function Page() {\n  return (\n    <main className={inter.className}>\n      <Image src='/logo.png' alt='Logo' width={120} height={40} />\n    </main>\n  );\n}\n",
      },
      remember: 'Optimized images default to attachment. Import fonts from next/font, not @next/font.',
    },
  },
  {
    id: 'n15b-014',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 requires error.tsx to be a Client Component, and it catches the segment and below, not the layout beside it. Next.js 16 keeps that boundary and still requires the client directive.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'This file is app/dashboard/error.tsx. The team expects it to catch errors from the dashboard page and from app/dashboard/layout.tsx. What is wrong?',
    code: {
      lang: 'tsx',
      source:
        "export default function Error({\n  error,\n}: {\n  error: Error & { digest?: string };\n}) {\n  return <p>Segment failed: {error.message}</p>;\n}\n",
    },
    options: [
      'error.tsx must export generateStaticParams, or Next.js skips the file during a static build.',
      'It must be a Client Component, and this file has no use client directive. Even after that fix, it catches the segment and below, not the layout.tsx beside it.',
      'The component must be named SegmentError. A default export named Error is reserved and never mounts.',
      'error.tsx is a Pages Router file. The App Router catches the same failures in pages/_error.tsx.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Add the use client directive. The boundary then covers the dashboard segment and below, and still does not cover the layout file beside it.',
      why: 'An error file is an error boundary, and error boundaries have to be Client Components. This module never sets the use client directive, so it is not a valid error file. After you add that directive, the boundary still covers the segment and the routes nested under it. It does not cover the layout file that sits beside it, because that layout wraps the boundary. A failure in the dashboard layout is handled by a parent boundary, or by global-error when the root layout fails.',
      wrong: [
        {
          option:
            'error.tsx must export generateStaticParams, or Next.js skips the file during a static build.',
          reason:
            'generateStaticParams belongs on a dynamic page or layout that wants build-time params. It is not what makes an error file valid.',
        },
        {
          option:
            'The component must be named SegmentError. A default export named Error is reserved and never mounts.',
          reason:
            'The default export can be named Error. The missing client directive is what keeps this file from being a boundary.',
        },
        {
          option:
            'error.tsx is a Pages Router file. The App Router catches the same failures in pages/_error.tsx.',
          reason:
            'error.tsx is the App Router segment boundary. pages/_error is the old Pages Router file and is not the replacement here.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "'use client';\n\nexport default function Error({\n  error,\n}: {\n  error: Error & { digest?: string };\n}) {\n  return <p>Segment failed: {error.message}</p>;\n}\n",
      },
      remember: 'error.tsx is a Client Component for its segment and below, not for the layout beside it.',
      fixedCode: {
        lang: 'tsx',
        source:
          "'use client';\n\nexport default function Error({\n  error,\n}: {\n  error: Error & { digest?: string };\n}) {\n  return <p>Segment failed: {error.message}</p>;\n}\n",
      },
    },
  },
  {
    id: 'n15b-015',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'In Next.js 15, global-error.tsx replaces the root layout, so it must be a Client Component and must render html and body. Next.js 16 keeps that root-error contract.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'The root layout throws. What is wrong with this global-error file as the replacement UI?',
    code: {
      lang: 'tsx',
      source:
        "'use client';\n\nexport default function GlobalError({\n  error,\n}: {\n  error: Error & { digest?: string };\n}) {\n  return <p>Root failed: {error.message}</p>;\n}\n",
    },
    options: [
      'Next.js wraps this component in the root layout html and body, so the paragraph is a valid root error UI.',
      'The file is ignored because global-error must be a Server Component, and the root error falls through to the root error.tsx.',
      'global-error replaces the root layout, so this component must render html and body. A bare paragraph is not a valid root document.',
      'not-found renders instead, because a root layout error is treated as a notFound call.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'global-error replaces the root layout, so it has to render html and body. The client directive is already present, and the missing document tags are the problem.',
      why: 'global-error replaces the root layout when the root layout throws, and it must be a Client Component. This file already has the use client directive, so that part is fine. Because the root layout is replaced, the component also has to render html and body itself. A bare paragraph leaves the document without those tags. not-found is not used here, because this path is an unexpected root error rather than a notFound call.',
      wrong: [
        {
          option:
            'Next.js wraps this component in the root layout html and body, so the paragraph is a valid root error UI.',
          reason:
            'The root layout is what failed, so it cannot wrap this UI. This file has to provide html and body.',
        },
        {
          option:
            'The file is ignored because global-error must be a Server Component, and the root error falls through to the root error.tsx.',
          reason:
            'global-error must be a Client Component, which this file is. A root error.tsx cannot replace the root layout.',
        },
        {
          option: 'not-found renders instead, because a root layout error is treated as a notFound call.',
          reason:
            'A thrown error is not a notFound call. not-found does not replace the root layout for this failure.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "'use client';\n\nexport default function GlobalError({\n  error,\n}: {\n  error: Error & { digest?: string };\n}) {\n  return (\n    <html>\n      <body>\n        <p>Root failed: {error.message}</p>\n      </body>\n    </html>\n  );\n}\n",
      },
      remember: 'global-error is a Client Component that renders html and body in place of the root layout.',
    },
  },
  {
    id: 'n15b-016',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 and Next.js 16 use the same special files here: not-found.tsx for notFound(), error.tsx for unexpected segment errors, and loading.tsx for the segment Suspense fallback.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'Which file renders when a Server Component calls notFound(), and how is that different from error.tsx and loading.tsx?',
    options: [
      'error.tsx renders for notFound(), and not-found.tsx renders only when a route folder is missing on disk.',
      'loading.tsx renders for notFound() until the page finishes streaming, then error.tsx replaces it.',
      'global-error.tsx renders for every notFound() so the root layout can show a missing-page status.',
      'not-found.tsx renders for notFound(). error.tsx is for unexpected errors in the segment, and loading.tsx is the Suspense fallback while the page resolves.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'notFound() renders not-found.tsx. error.tsx is for unexpected exceptions, and loading.tsx is only the Suspense fallback while the page resolves.',
      why: 'notFound() renders the closest not-found file and sets the not-found status. It does not render the error file, and it does not render global-error. The error file is the boundary for an unexpected exception in that segment. The loading file is unrelated to either case: it is the fallback shown while the segment page is still resolving. Pick the file that matches the signal you actually raised.',
      wrong: [
        {
          option:
            'error.tsx renders for notFound(), and not-found.tsx renders only when a route folder is missing on disk.',
          reason:
            'notFound() selects not-found.tsx. A missing folder is a routing miss, not the only reason that file exists.',
        },
        {
          option: 'loading.tsx renders for notFound() until the page finishes streaming, then error.tsx replaces it.',
          reason:
            'loading.tsx is a Suspense fallback for a slow page. It is not the not-found UI and it does not hand off to error.tsx.',
        },
        {
          option:
            'global-error.tsx renders for every notFound() so the root layout can show a missing-page status.',
          reason:
            'global-error replaces the root layout after a root error. A notFound call uses not-found.tsx and keeps the surrounding layout.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import { notFound } from 'next/navigation';\n\nexport default async function Page({\n  params,\n}: {\n  params: Promise<{ id: string }>;\n}) {\n  const { id } = await params;\n  if (id === 'missing') {\n    notFound();\n  }\n  return <h1>{id}</h1>;\n}\n",
      },
      remember: 'notFound() shows not-found.tsx. Thrown errors show error.tsx. loading.tsx is the Suspense fallback.',
    },
  },
  {
    id: 'n15b-017',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 loading.tsx wraps that segment page in Suspense and streams the fallback while the page resolves. Next.js 16 keeps that instant-loading boundary, and it still does not wrap the layout.',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt:
      'The author mounted the loading UI around the layout children and believes that is how loading.tsx streams. The Loading function never renders children. What is wrong?',
    code: {
      lang: 'tsx',
      source:
        "import type { ReactNode } from 'react';\n\nfunction Loading({ children }: { children: ReactNode }) {\n  return <p>Loading dashboard...</p>;\n}\n\nexport default function DashboardLayout({\n  children,\n}: {\n  children: ReactNode;\n}) {\n  return (\n    <section>\n      <nav>Dashboard</nav>\n      <Loading>{children}</Loading>\n    </section>\n  );\n}\n",
    },
    options: [
      'loading.tsx is not a wrapper you render around children. Next.js uses that file as the Suspense fallback for the page, so the layout can paint immediately while the page resolves. This component also drops its children, so the page would never show.',
      'The file must be named suspense.tsx or Next.js will not stream. loading.tsx is only a Pages Router API.',
      'A loading file wraps the layout too, so the nav is supposed to stay hidden. The bug is rendering the nav outside Loading.',
      'loading.tsx must be a Client Component that throws a promise. A Server Component fallback never streams.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Leave loading.tsx as a fallback component and render children from the layout. Next.js wraps the page in Suspense and streams that fallback while the page resolves.',
      why: 'The loading file is a file convention, not a wrapper you mount around children. Next.js wraps that segment page in Suspense and uses the file as the fallback while the page resolves. Rendering the component yourself does not create that boundary, and this Loading function never renders its children, so the page would be dropped. The layout should render children directly and can paint the nav immediately. The fallback streams in place of the page, not around the layout.',
      wrong: [
        {
          option:
            'The file must be named suspense.tsx or Next.js will not stream. loading.tsx is only a Pages Router API.',
          reason:
            'The App Router filename is loading.tsx. Renaming it to suspense.tsx removes the convention.',
        },
        {
          option:
            'A loading file wraps the layout too, so the nav is supposed to stay hidden. The bug is rendering the nav outside Loading.',
          reason:
            'The layout stays outside the Suspense boundary. The nav is supposed to show while the page fallback streams.',
        },
        {
          option:
            'loading.tsx must be a Client Component that throws a promise. A Server Component fallback never streams.',
          reason:
            'The fallback can be a Server Component. Suspense streams it because of the file convention, not because the component throws.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import type { ReactNode } from 'react';\n\nexport default function DashboardLayout({\n  children,\n}: {\n  children: ReactNode;\n}) {\n  return (\n    <section>\n      <nav>Dashboard</nav>\n      {children}\n    </section>\n  );\n}\n",
      },
      remember: 'loading.tsx is the Suspense fallback for that segment page. It does not wrap the layout.',
      fixedCode: {
        lang: 'tsx',
        source:
          "import type { ReactNode } from 'react';\n\nexport default function DashboardLayout({\n  children,\n}: {\n  children: ReactNode;\n}) {\n  return (\n    <section>\n      <nav>Dashboard</nav>\n      {children}\n    </section>\n  );\n}\n",
      },
    },
  },
  {
    id: 'n15b-018',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'In Next.js 15, middleware.ts runs on the Edge runtime before the route renders. Next.js 16 renames the Node.js version of this file to proxy.ts and keeps middleware.ts only for the Edge runtime, where it is deprecated.',
    kind: 'scenario',
    difficulty: 'expert',
    prompt:
      'middleware.ts matches /account and redirects anonymous users to /login. The account page reads the session and returns private data. What should the team rely on?',
    options: [
      'Remove the page-level session check so middleware is the single auth boundary. A matcher makes a second check redundant.',
      'Keep a check where the account data is read. Middleware runs first on the Edge runtime, but a bug or a misconfigured matcher can skip it, so it is not a complete auth boundary.',
      'Move the session lookup into a client effect. Middleware cannot see cookies, so the page check is the only one that can run.',
      'Replace the file with a Server Action. Middleware runs after the route renders, so it cannot block the page.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Keep authorizing where the private data is read. Middleware can redirect early, and it is still not a complete boundary if a bug or a bad matcher skips it.',
      why: 'Middleware runs on the Edge runtime before the matched route renders, so it can redirect early. A matcher that is too narrow, or a bug in the middleware file, means that redirect never runs for the request. The account page still has to check the session at the point it reads private data. That second check is defense in depth, not a duplicate you delete once the matcher looks right. Client effects and Server Actions do not replace the check beside the data.',
      wrong: [
        {
          option:
            'Remove the page-level session check so middleware is the single auth boundary. A matcher makes a second check redundant.',
          reason:
            'A matcher can be wrong and a bug can skip the file. The read site still has to authorize.',
        },
        {
          option:
            'Move the session lookup into a client effect. Middleware cannot see cookies, so the page check is the only one that can run.',
          reason:
            'Middleware can read the request, including cookies. A client effect is the wrong place to decide whether private data may be read.',
        },
        {
          option:
            'Replace the file with a Server Action. Middleware runs after the route renders, so it cannot block the page.',
          reason:
            'Middleware runs before rendering. A Server Action is a later mutation endpoint, not a substitute for the data check.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import { redirect } from 'next/navigation';\nimport { getSession } from './session';\nimport { db } from './db';\n\nexport default async function AccountPage() {\n  const session = await getSession();\n  if (!session) {\n    redirect('/login');\n  }\n  const account = await db.user.findUnique({\n    where: { id: session.userId },\n  });\n  return <p>{account?.email}</p>;\n}\n",
      },
      remember: 'Middleware is an early Edge check. Still authorize where the data is read.',
    },
  },
  {
    id: 'n15b-019',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 middleware runs on the Edge runtime before rendering, and a matcher limits the paths. Next.js 16 keeps Edge middleware.ts only as a deprecated file and moves the Node.js successor to proxy.ts.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'A visitor opens /about, and another opens /dashboard/settings. Which requests run this middleware?',
    code: {
      lang: 'ts',
      source:
        "import { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  const requestHeaders = new Headers(request.headers);\n  requestHeaders.set('x-request-path', request.nextUrl.pathname);\n  return NextResponse.next({\n    request: { headers: requestHeaders },\n  });\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*'],\n};\n",
    },
    options: [
      'Middleware runs for both paths because a matcher is only a build-time hint.',
      'Middleware runs for /about only. Dynamic segments such as :path* are ignored on the Edge runtime.',
      'Middleware runs for /dashboard/settings and does not run for /about. The matcher limits which paths invoke this Edge function before render.',
      'Middleware runs after both pages render, then rewrites /about into /dashboard.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        '/dashboard/settings matches the matcher, so middleware runs on the Edge runtime before that route renders. /about does not match, so middleware does not run.',
      why: 'The config matcher is the list of paths that invoke this middleware. /dashboard/:path* includes /dashboard/settings, so that request runs the function on the Edge runtime before the route renders. /about does not match, so middleware does not run for it. The function then copies the request headers and sets a path header for the routes that did match. A matcher is not a rewrite, and it is not applied after rendering.',
      wrong: [
        {
          option: 'Middleware runs for both paths because a matcher is only a build-time hint.',
          reason: 'The matcher actually filters requests. Paths outside it never enter this function.',
        },
        {
          option:
            'Middleware runs for /about only. Dynamic segments such as :path* are ignored on the Edge runtime.',
          reason:
            ':path* is a real matcher pattern. /about is outside the pattern, and /dashboard/settings is inside it.',
        },
        {
          option: 'Middleware runs after both pages render, then rewrites /about into /dashboard.',
          reason:
            'Middleware runs before rendering, and this function calls NextResponse.next. It does not rewrite /about.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "import { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  const requestHeaders = new Headers(request.headers);\n  requestHeaders.set('x-request-path', request.nextUrl.pathname);\n  return NextResponse.next({\n    request: { headers: requestHeaders },\n  });\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*'],\n};\n",
      },
      remember: 'A matcher limits which paths run Edge middleware, and it runs before the route renders.',
    },
  },
  {
    id: 'n15b-020',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Route groups work the same in Next.js 15 and Next.js 16: a parenthesized folder does not add a URL segment. Parallel slots and intercepting prefixes are also unchanged between these versions.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The about page lives at app/(marketing)/about/page.tsx. This home page links to it. What is wrong with the href?',
    code: {
      lang: 'tsx',
      source:
        "import Link from 'next/link';\n\nexport default function HomePage() {\n  return <Link href='/marketing/about'>About</Link>;\n}\n",
    },
    options: [
      'Route groups add a URL segment only when the folder uses parentheses, so the href is already correct.',
      'The parentheses make this a parallel route slot, so the href must be /@marketing/about.',
      'Intercepting routes require the href to start with a dot folder, so the link should point at /(.)marketing/about.',
      'A route group does not change the URL. The page is /about, so this href points at a path the group never created.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'Link to /about. The (marketing) folder is a route group, so it organizes the files and does not appear in the URL.',
      why: 'Parentheses mark a route group, which organizes files without adding a segment. The folder (marketing) is invisible in the URL, so the about page inside it is served at /about. The link points at /marketing/about, a path this group never created. Parallel slots use an @ folder, and intercepting routes use a dot prefix, so neither of those rules fits this folder. Point the href at /about.',
      wrong: [
        {
          option:
            'Route groups add a URL segment only when the folder uses parentheses, so the href is already correct.',
          reason:
            'The parentheses are what keep the folder out of the URL. They do not insert a marketing segment.',
        },
        {
          option: 'The parentheses make this a parallel route slot, so the href must be /@marketing/about.',
          reason:
            'A parallel slot folder starts with @. Parentheses are a group, and neither symbol becomes a URL segment.',
        },
        {
          option:
            'Intercepting routes require the href to start with a dot folder, so the link should point at /(.)marketing/about.',
          reason:
            'The dot prefix is a file-system convention for intercepting, not something you put in an href. This folder is a group.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import Link from 'next/link';\n\nexport default function HomePage() {\n  return (\n    <Link href='/about'>About</Link>\n  );\n}\n",
      },
      remember: 'A (folder) route group does not change the URL.',
      fixedCode: {
        lang: 'tsx',
        source:
          "import Link from 'next/link';\n\nexport default function HomePage() {\n  return <Link href='/about'>About</Link>;\n}\n",
      },
    },
  },
  {
    id: 'n15b-021',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Parallel routes and intercepting routes behave the same in Next.js 15 and Next.js 16. @slot folders stay out of the URL, and (.), (..), and (...) still intercept only during in-app navigation.',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'How do parallel routes and intercepting routes behave in the App Router?',
    options: [
      'Parallel routes live in @slot folders. Each slot needs a page, and the layout renders those slots as props. An intercepting route uses a (.), (..), or (...) prefix so a client navigation can render inside the current layout, while a hard load renders the full page.',
      '@slot folders become URL segments such as /@modal. Intercepting routes change the URL to include the dot prefix.',
      'Parallel slots replace the children prop and do not need their own page. Intercepting routes only run on a hard load.',
      'Route groups use the @ prefix, and intercepting routes use a plain (folder) name so they change the URL.',
    ],
    correctIndex: 0,
    explanation: {
      answer:
        'Render @slot folders as layout props, and give each slot a page. Intercepting prefixes render inside the current layout on client navigations and as a full page on a hard load.',
      why: 'A folder named with an @ is a slot, not a URL segment. The layout receives it as a prop, next to children, and each slot needs its own page for the routes it handles. On a hard load, an unmatched slot also needs a default file, or that slot has nothing to render. Intercepting routes use a (.) prefix for the same level, (..) for a level above, or (...) from the root. A client navigation can then render that route inside the current layout, while a full document load renders the real page.',
      wrong: [
        {
          option:
            '@slot folders become URL segments such as /@modal. Intercepting routes change the URL to include the dot prefix.',
          reason:
            'Neither @ nor the dot prefix is part of the URL. Slots are props, and the intercepting folder only changes how a soft navigation renders.',
        },
        {
          option:
            'Parallel slots replace the children prop and do not need their own page. Intercepting routes only run on a hard load.',
          reason:
            'Slots are extra props beside children, and each one needs a page. Intercepting happens on in-app navigation, not only on a hard load.',
        },
        {
          option:
            'Route groups use the @ prefix, and intercepting routes use a plain (folder) name so they change the URL.',
          reason:
            'Route groups use parentheses and do not change the URL. @ is a parallel slot, and intercepting folders include a dot.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "import type { ReactNode } from 'react';\n\nexport default function Layout({\n  children,\n  modal,\n}: {\n  children: ReactNode;\n  modal: ReactNode;\n}) {\n  return (\n    <div>\n      {children}\n      {modal}\n    </div>\n  );\n}\n",
      },
      remember:
        '@slot is a prop and needs a page. (.), (..), and (...) intercept in-app navigation and stay a full page on a hard load.',
    },
  },
  {
    id: 'n15b-022',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 still exposes Server Actions as POST endpoints. It omits unused actions from the client bundle and uses unguessable action ids that rotate between builds. Next.js 16 keeps those protections, and you still authorize inside the action.',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt:
      'The author says this is safe because unused actions are omitted from the client bundle and action ids are unguessable and rotate every build. What is still wrong?',
    code: {
      lang: 'ts',
      source:
        "'use server';\n\nimport { db } from './db';\n\nexport async function deleteAccount(userId: string) {\n  await db.user.delete({ where: { id: userId } });\n}\n",
    },
    options: [
      'The use server directive must sit on the function, not the file, or the action is public. Moving the directive removes the need for an auth check.',
      'The action is still a public POST endpoint. Omitting unused actions and rotating unguessable ids are not an auth check. This function must verify the caller before it deletes anything.',
      'Server Actions are private calls that only the rendering Server Component can invoke, so the bug is importing db on the server.',
      'Action ids are sequential integers in Next.js 15, so the fix is to set experimental.serverActions.bodySizeLimit.',
    ],
    correctIndex: 1,
    explanation: {
      answer:
        'Authorize inside the action and delete the session user. Hidden, rotating action ids do not check who called the public POST endpoint.',
      why: 'Next.js 15 omits unused Server Actions from the client bundle, and it assigns unguessable action ids that rotate between builds. Those are real protections, and they still leave deleteAccount as a public POST endpoint. Neither one checks who the caller is. The function has to authorize the current session and should delete that session user instead of trusting a userId argument. Build-time hiding is not an authorization check.',
      wrong: [
        {
          option:
            'The use server directive must sit on the function, not the file, or the action is public. Moving the directive removes the need for an auth check.',
          reason:
            'A file-level use server directive is valid. Moving it does not authorize the caller.',
        },
        {
          option:
            'Server Actions are private calls that only the rendering Server Component can invoke, so the bug is importing db on the server.',
          reason:
            'The action is still a POST endpoint. Importing the database on the server is appropriate, and the missing piece is the auth check.',
        },
        {
          option:
            'Action ids are sequential integers in Next.js 15, so the fix is to set experimental.serverActions.bodySizeLimit.',
          reason:
            'The ids are unguessable and rotate between builds. bodySizeLimit only caps payload size and does not authorize the delete.',
        },
      ],
      example: {
        lang: 'ts',
        source:
          "'use server';\n\nimport { db } from './db';\nimport { getSession } from './session';\n\nexport async function deleteAccount() {\n  const session = await getSession();\n  if (!session) {\n    throw new Error('You must be signed in.');\n  }\n  await db.user.delete({ where: { id: session.userId } });\n}\n",
      },
      remember: 'Server Actions stay public POST endpoints. Check auth inside the action.',
      fixedCode: {
        lang: 'ts',
        source:
          "'use server';\n\nimport { db } from './db';\nimport { getSession } from './session';\n\nexport async function deleteAccount() {\n  const session = await getSession();\n  if (!session) {\n    throw new Error('You must be signed in.');\n  }\n  await db.user.delete({ where: { id: session.userId } });\n}\n",
      },
    },
  },
  {
    id: 'n15b-023',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 reuses Server Component fetch results across dev HMR so a save does not repeat the request. That reuse is not the production Data Cache. Next.js 16 keeps dev HMR reuse separate from production caching.',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt:
      'During next dev, a teammate saves this Server Component ten times in a minute. The usage endpoint bills every request. What does Next.js 15 do with those fetches?',
    code: {
      lang: 'tsx',
      source:
        "type Usage = { total: number };\n\nexport default async function BillingPage() {\n  const response = await fetch('https://billing.example/usage', {\n    cache: 'no-store',\n  });\n  const usage = (await response.json()) as Usage;\n  return <p>Used {usage.total}</p>;\n}\n",
    },
    options: [
      'Each save calls the billing API, because cache: no-store disables every cache, including the dev HMR reuse.',
      'The responses are written to the production Data Cache, so later deployments serve the first result until revalidatePath runs.',
      'Dev HMR reuses the fetch result from the previous render, so those saves do not each call the billing API. That reuse is a dev convenience and is not the production Data Cache.',
      'Next.js skips fetch during next dev and only calls the API when you run next build.',
    ],
    correctIndex: 2,
    explanation: {
      answer:
        'Saves in next dev reuse the previous Server Component fetch result. That HMR reuse is not the production Data Cache.',
      why: 'Saving this Server Component triggers a dev HMR render that reuses fetch results from the previous render. The billing API is not called again on each of those saves, which is the point of the reuse when an API charges per request. That store lives only in the dev server. It is not the production Data Cache, so a no-store fetch is still not saved for production. A production build does not keep this dev shortcut.',
      wrong: [
        {
          option:
            'Each save calls the billing API, because cache: no-store disables every cache, including the dev HMR reuse.',
          reason:
            'no-store talks about the production Data Cache. The dev server still reuses the previous render across HMR.',
        },
        {
          option:
            'The responses are written to the production Data Cache, so later deployments serve the first result until revalidatePath runs.',
          reason:
            'The HMR reuse never becomes the production Data Cache. A later deployment does not serve this dev result.',
        },
        {
          option: 'Next.js skips fetch during next dev and only calls the API when you run next build.',
          reason:
            'Dev still fetches. It reuses the result across saves, and the first render in a session can still reach the API.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "type Usage = { total: number };\n\nexport default async function BillingPage() {\n  const response = await fetch('https://billing.example/usage', {\n    cache: 'no-store',\n  });\n  const usage = (await response.json()) as Usage;\n  return <p>Used {usage.total}</p>;\n}\n",
      },
      remember: 'Dev HMR can reuse Server Component fetches. That store is not the production Data Cache.',
    },
  },
  {
    id: 'n15b-024',
    tech: 'next15',
    topic: 'routing-other',
    versionNote:
      'Next.js 15 static generation renders a page once and reuses that work for the HTML and the client payload, and build workers can share the fetch cache. Next.js 16 keeps that single render when a page is statically generated.',
    kind: 'concept',
    difficulty: 'expert',
    prompt:
      'During a production build, Next.js statically generates a page that fetches shared product data. Which description is correct?',
    options: [
      'The page is rendered twice, once for HTML and once for the client payload, and each worker keeps a private fetch cache.',
      'Static generation runs only in the browser after hydration, so the build does not call fetch.',
      'Workers cannot share fetch results, so each worker must call the origin again when the URL and options match.',
      'Next.js renders the page once and reuses that work for the HTML and the client payload. Workers can share the fetch cache during the build.',
    ],
    correctIndex: 3,
    explanation: {
      answer:
        'A static page is rendered once for both the HTML and the client payload. Build workers can share the fetch cache.',
      why: 'Static generation does the page work once. The HTML document and the client payload are both produced from that single result, so the build does not render the page a second time for the router. During that build, workers can share the fetch cache when they request the same data. Each worker does not have to call the origin again just because it is a different process. The sharing is a build-time fetch cache, which is separate from a browser cache.',
      wrong: [
        {
          option:
            'The page is rendered twice, once for HTML and once for the client payload, and each worker keeps a private fetch cache.',
          reason:
            'The HTML and the client payload share one render. Workers can also share fetch results during the build.',
        },
        {
          option: 'Static generation runs only in the browser after hydration, so the build does not call fetch.',
          reason:
            'Static generation happens at build time. The browser receives the result and does not do that render.',
        },
        {
          option:
            'Workers cannot share fetch results, so each worker must call the origin again when the URL and options match.',
          reason:
            'Matching fetches can be shared across workers during the build, so a second worker can reuse the cached response.',
        },
      ],
      example: {
        lang: 'tsx',
        source:
          "type Product = { name: string };\n\nexport default async function ProductsPage() {\n  const response = await fetch('https://shop.example/products', {\n    cache: 'force-cache',\n  });\n  const products = (await response.json()) as Product[];\n  return <p>{products.length} products</p>;\n}\n",
      },
      remember:
        'Static generation renders once for the HTML and the client payload, and build workers can share the fetch cache.',
    },
  },
] satisfies Question[];
