import type { Question } from '../types';

export const playwrightQuestions = [
  {
    id: "pw-001",
    tech: "playwright",
    topic: "locators",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Which locators should a Playwright test prefer, and where do CSS and XPath belong?",
    options: [
      "getByRole, getByLabel, getByPlaceholder, getByText, and getByTestId, with CSS and XPath kept as last resorts",
      "CSS selectors first, because they are faster and stricter than role locators",
      "XPath first, because it is the only locator that can see text inside a button",
      "Only getByTestId, because role, label, placeholder, and text locators are deprecated",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Prefer getByRole, getByLabel, getByPlaceholder, getByText, and getByTestId. Use CSS or XPath only when those cannot express the target.",
      why: "Playwright builds locators around what a person can perceive: the role and accessible name, the label, the placeholder, the visible text, or an explicit test id. Those queries survive class renames and layout changes that break a CSS path. getByRole is the usual first choice because it matches the accessibility tree, and the others cover form fields and stable hooks. page.locator with a CSS or XPath string still works, but it is the fallback for cases the user-facing locators cannot describe, not the default style of a new test.",
      wrong: [
        {
          option: "CSS selectors first, because they are faster and stricter than role locators",
          reason: "Speed is not the ranking Playwright documents. User-facing locators come first, and CSS is a last resort.",
        },
        {
          option: "XPath first, because it is the only locator that can see text inside a button",
          reason: "XPath is a last resort. getByRole and getByText already see the accessible name and the visible text.",
        },
        {
          option: "Only getByTestId, because role, label, placeholder, and text locators are deprecated",
          reason: "None of those five locators is deprecated. getByTestId is recommended, and so are the user-facing ones.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { test, expect } from '@playwright/test';\ntest('signs in with user-facing locators', async ({ page }) => {\n  await page.goto('https://app.example/login');\n  await page.getByLabel('Email').fill('ada@example.com');\n  await page.getByPlaceholder('Password').fill('secret');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByTestId('home')).toBeVisible();\n});",
      },
      remember: "Start with getByRole, getByLabel, getByPlaceholder, getByText, or getByTestId. Leave CSS and XPath for last.",
    },
  },
  {
    id: "pw-002",
    tech: "playwright",
    topic: "locators",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The page has two buttons. Their accessible names are Save and Save draft. What does this click do?",
    code: {
      lang: "ts",
      source: "await page.getByRole('button', { name: 'Save' }).click();",
    },
    options: [
      "It clicks the button whose accessible name is exactly Save",
      "It throws a strict mode violation because both buttons match",
      "It clicks Save draft, because the longer name wins",
      "It waits until one button disappears, then clicks the one that remains",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The click throws a strict mode violation because the name Save matches both buttons.",
      why: "For getByRole, a string name is a case-insensitive substring of the accessible name unless you pass exact: true. Save matches the button named Save, and it also matches Save draft. The locator therefore points at two buttons. click requires one element, so strict mode throws instead of guessing. The action does not drop down to the shorter name, and it does not wait for one of the buttons to leave the page. Pass exact: true, or use the full accessible name, when only the Save button should match.",
      wrong: [
        {
          option: "It clicks the button whose accessible name is exactly Save",
          reason: "A string name is a case-insensitive substring, not a whole-string match. Save is contained in Save draft, so both buttons match.",
        },
        {
          option: "It clicks Save draft, because the longer name wins",
          reason: "Playwright does not rank matches by length. Two matches make the action throw instead of choosing one.",
        },
        {
          option: "It waits until one button disappears, then clicks the one that remains",
          reason: "An action does not wait for extra matches to disappear. Strict mode fails as soon as the click sees more than one element.",
        },
      ],
      example: {
        lang: "ts",
        source: "const save = page.getByRole('button', { name: 'Save', exact: true });\nawait save.click();\nconst draft = page.getByRole('button', { name: 'Save draft' });\nawait draft.click();\nawait expect(page.getByRole('status')).toHaveText('Saved');\nconst either = page.getByRole('button', { name: 'Save' });\nconst count = await either.count();\nawait expect(either).toHaveCount(count);",
      },
      remember: "A string name on getByRole is a case-insensitive substring. exact: true makes it the whole name.",
    },
  },
  {
    id: "pw-003",
    tech: "playwright",
    topic: "locators",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The only Docs control is a link: an anchor whose href is /docs and whose text is Docs. This click never finds it. What is the bug?",
    code: {
      lang: "ts",
      source: "await page.getByRole('button', { name: 'Docs' }).click();",
    },
    options: [
      "The href has to be passed as the name option or the link stays invisible to getByRole",
      "An anchor with an href has the button role, so this locator should already match",
      "The accessible role is link, so a button locator matches nothing and the click times out",
      "getByRole ignores name and clicks the first button anywhere on the page",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The element is a link, not a button, so the locator matches nothing and the click waits until it times out.",
      why: "getByRole reads the accessibility tree, including implicit roles. An anchor with an href is a link, and its accessible name is Docs. A button role does not include that anchor, so the locator stays empty. click then auto-waits for an actionable button and ends in a timeout. The name option is already the right text. The role in the call has to be the role the element actually exposes.",
      wrong: [
        {
          option: "The href has to be passed as the name option or the link stays invisible to getByRole",
          reason: "name is the accessible name, which is the text Docs. The URL is not part of that name.",
        },
        {
          option: "An anchor with an href has the button role, so this locator should already match",
          reason: "An anchor with an href has the implicit role link. It is a button only if the markup says so.",
        },
        {
          option: "getByRole ignores name and clicks the first button anywhere on the page",
          reason: "name is applied. The call fails because no button has that name, not because the name is discarded.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.getByRole('link', { name: 'Docs' }).click();\nawait expect(page).toHaveURL('https://app.example/docs');\nconst heading = page.getByRole('heading', { name: 'Docs' });\nawait expect(heading).toBeVisible();\nawait page.getByRole('link', { name: 'Home' }).click();\nawait expect(heading).toBeHidden();",
      },
      remember: "Use the implicit role: an anchor with an href is a link, not a button.",
      fixedCode: {
        lang: "ts",
        source: "await page.getByRole('link', { name: 'Docs' }).click();\nawait expect(page).toHaveURL('https://app.example/docs');\nconst heading = page.getByRole('heading', { name: 'Docs' });\nawait expect(heading).toBeVisible();\nawait page.getByRole('link', { name: 'Home' }).click();\nawait expect(heading).toBeHidden();",
      },
    },
  },
  {
    id: "pw-004",
    tech: "playwright",
    topic: "locators",
    kind: "concept",
    difficulty: "expert",
    prompt: "Before locator.click runs, which actionability checks does Playwright wait for?",
    options: [
      "Only that the element is attached to the DOM",
      "Only that the element is visible",
      "That the element is visible and stable, while a disabled element is still clicked",
      "That the locator resolves to one element, and that element is visible, stable, enabled, and receiving events",
    ],
    correctIndex: 3,
    explanation: {
      answer: "click waits until the locator matches one element that is visible, stable, enabled, and receiving events.",
      why: "Playwright does not click on the first frame where a node exists. The locator must resolve to exactly one element, and that element must be visible, stable (the same box for two animation frames), enabled, and the hit target for the pointer so another layer is not covering it. If any check fails, click keeps waiting until the timeout. fill is also auto-waited, but its checks are different: the control must be visible, enabled, and editable. A fixed delay is not part of either action.",
      wrong: [
        {
          option: "Only that the element is attached to the DOM",
          reason: "Attachment is not enough. A hidden, moving, disabled, or covered element is not clicked yet.",
        },
        {
          option: "Only that the element is visible",
          reason: "Visibility is one check. The element must also be stable, enabled, receiving events, and the only match.",
        },
        {
          option: "That the element is visible and stable, while a disabled element is still clicked",
          reason: "A disabled element fails the enabled check. click waits until it is enabled or the action times out.",
        },
      ],
      example: {
        lang: "ts",
        source: "const save = page.getByRole('button', { name: 'Save' });\nawait save.click();\nconst email = page.getByLabel('Email');\nawait email.fill('ada@example.com');\nawait page.getByRole('button', { name: 'Continue' }).click();\nawait expect(page.getByRole('status')).toHaveText('Saved');",
      },
      remember: "click waits for one element that is visible, stable, enabled, and receiving events.",
    },
  },
  {
    id: "pw-005",
    tech: "playwright",
    topic: "locators",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The page still has buttons named Save and Save draft. What does this click do?",
    code: {
      lang: "ts",
      source: "await page.getByRole('button', { name: 'Save', exact: true }).click();",
    },
    options: [
      "It clicks the Save button, because exact requires the whole accessible name",
      "It still matches both buttons and throws a strict mode violation",
      "exact is case-insensitive, so Save draft still matches and is clicked",
      "It throws immediately because exact cannot be combined with getByRole",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The click hits the Save button. exact: true demands the whole accessible name, so Save draft is left out.",
      why: "Without exact, the string Save is a case-insensitive substring and both buttons match. exact: true changes that rule to a case-sensitive comparison against the whole accessible name, after trimming whitespace. Save matches only the first button. Save draft fails the whole-string check, so the locator is unique and click proceeds against that one button. The option is not ignored, and it does not compare names case-insensitively.",
      wrong: [
        {
          option: "It still matches both buttons and throws a strict mode violation",
          reason: "exact: true turns off substring matching, so Save draft no longer matches.",
        },
        {
          option: "exact is case-insensitive, so Save draft still matches and is clicked",
          reason: "exact match is case-sensitive and whole-string. Save draft is a different name.",
        },
        {
          option: "It throws immediately because exact cannot be combined with getByRole",
          reason: "exact is a documented option of getByRole. It narrows the name; it does not make the call invalid.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.getByRole('button', { name: 'Save', exact: true }).click();\nawait expect(page.getByRole('status')).toHaveText('Saved');\nawait page.getByRole('button', { name: 'Save draft', exact: true }).click();\nawait expect(page.getByRole('status')).toHaveText('Draft saved');\nconst loose = page.getByRole('button', { name: 'Save' });\nawait expect(loose).toHaveCount(2);",
      },
      remember: "exact: true on getByRole matches the whole accessible name and is case-sensitive.",
    },
  },
  {
    id: "pw-006",
    tech: "playwright",
    topic: "locators",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Delete opens a confirm dialog. This click never finishes. What is the bug?",
    code: {
      lang: "ts",
      source: "page.once('dialog', (dialog) => {\n  console.log(dialog.message());\n});\nawait page.getByRole('button', { name: 'Delete' }).click();",
    },
    options: [
      "console.log accepts the dialog, so the hang must come from the button role",
      "The listener never accepts or dismisses the dialog, so the click stalls",
      "page.once cannot observe a confirm dialog, so the listener never runs",
      "A listener makes Playwright accept the dialog, so this click should return",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The listener is in place before the click, but it only logs. A dialog listener must accept or dismiss, or the action hangs.",
      why: "Register the dialog handler before the action that opens the dialog. This code does that. The remaining requirement is inside the handler: call dialog.accept or dialog.dismiss. A confirm dialog is modal, so the click cannot finish while it is open. The listener here prints the message and returns, leaving the dialog up, so the click stalls until the timeout. If no listener were registered at all, Playwright would dismiss the dialog automatically. A listener that exists and does not handle the dialog is the case that hangs.",
      wrong: [
        {
          option: "console.log accepts the dialog, so the hang must come from the button role",
          reason: "Logging the message does not accept or dismiss. The dialog stays open and blocks the page.",
        },
        {
          option: "page.once cannot observe a confirm dialog, so the listener never runs",
          reason: "page.once is a normal dialog listener. It runs, and then it fails to handle the dialog.",
        },
        {
          option: "A listener makes Playwright accept the dialog, so this click should return",
          reason: "A listener replaces auto-dismiss. Playwright waits for that listener to accept or dismiss.",
        },
      ],
      example: {
        lang: "ts",
        source: "page.once('dialog', (dialog) => {\n  dialog.accept();\n});\nawait page.getByRole('button', { name: 'Delete' }).click();\nawait expect(page.getByRole('status')).toHaveText('Deleted');\nawait expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);",
      },
      remember: "Put the dialog listener before the click, and accept or dismiss inside it, or the action stalls.",
      fixedCode: {
        lang: "ts",
        source: "page.once('dialog', (dialog) => {\n  dialog.accept();\n});\nawait page.getByRole('button', { name: 'Delete' }).click();\nawait expect(page.getByRole('status')).toHaveText('Deleted');\nawait expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);",
      },
    },
  },
  {
    id: "pw-007",
    tech: "playwright",
    topic: "locators",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Every row is a listitem and every row has a Delete button. How should the test click Delete for the row whose text is Ada?",
    options: [
      "Call getByRole for the Delete button and then first, because first is the supported way to pick a row",
      "Call page.locator with a CSS button selector and nth(0), because lists are indexed from the page root",
      "Filter the listitem with hasText Ada, then getByRole for the Delete button inside that item",
      "Use getByText on Delete alone, because a text locator ignores the surrounding rows",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Filter the listitem by the text Ada, then click the Delete button inside that filtered locator.",
      why: "Chaining from the whole list of rows to every Delete button still matches one button per row, and the click is strict. filter with hasText narrows the listitem to the row that contains Ada. hasText looks in the element and its descendants, and a string is a case-insensitive substring. From that single row, getByRole for the Delete button matches one control, so click has a unique target. Positional helpers such as first and nth skip the strictness check without looking at the row contents.",
      wrong: [
        {
          option: "Call getByRole for the Delete button and then first, because first is the supported way to pick a row",
          reason: "first opts out of strict mode by position. It is not tied to the row text and can click the wrong Delete.",
        },
        {
          option: "Call page.locator with a CSS button selector and nth(0), because lists are indexed from the page root",
          reason: "nth picks by index, which breaks when the row order changes. It is not the locator Playwright recommends here.",
        },
        {
          option: "Use getByText on Delete alone, because a text locator ignores the surrounding rows",
          reason: "A text locator for Delete matches every Delete button. It does not know which row you meant.",
        },
      ],
      example: {
        lang: "ts",
        source: "const row = page\n  .getByRole('listitem')\n  .filter({ hasText: 'Ada' });\nawait row.getByRole('button', { name: 'Delete' }).click();\nawait expect(row).toHaveCount(0);\nawait expect(page.getByRole('listitem')).toHaveCount(2);",
      },
      remember: "Filter the row by its text, then locate the button inside that row.",
    },
  },
  {
    id: "pw-008",
    tech: "playwright",
    topic: "locators",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The list items are Apple, then Banana, then Cherry. What does this click hit?",
    code: {
      lang: "ts",
      source: "const rows = page.getByRole('listitem');\nconst second = rows.nth(1);\nawait second.click();",
    },
    options: [
      "Apple, because nth counts from 1",
      "Cherry, because a positive index counts from the end",
      "It throws a strict mode violation because three items match the listitem role",
      "Banana, because nth is zero-based and 1 is the second item",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The click hits Banana. nth(1) is the second match because the index starts at zero.",
      why: "locator.nth receives a zero-based index. The first listitem is nth(0), the second is nth(1), and the third is nth(2). Apple, Banana, Cherry therefore puts Banana at index 1. The parent locator matches three items, which would make a click on the parent throw, but nth returns a locator for a single index, so strict mode is satisfied and Banana is clicked. The index is not one-based, and it does not count backward.",
      wrong: [
        {
          option: "Apple, because nth counts from 1",
          reason: "nth is zero-based. nth(0) is the first item, so nth(1) is not Apple.",
        },
        {
          option: "Cherry, because a positive index counts from the end",
          reason: "last is the end of the list. A positive nth index counts forward from the start.",
        },
        {
          option: "It throws a strict mode violation because three items match the listitem role",
          reason: "nth narrows the locator to one index, so the click is no longer targeting all three items.",
        },
      ],
      example: {
        lang: "ts",
        source: "const rows = page.getByRole('listitem');\nawait rows.nth(0).click();\nawait expect(page.getByRole('status')).toHaveText('Apple');\nawait rows.nth(1).click();\nawait expect(page.getByRole('status')).toHaveText('Banana');\nawait rows.nth(2).click();\nawait expect(page.getByRole('status')).toHaveText('Cherry');",
      },
      remember: "nth is zero-based. nth(1) is the second match, and it targets one element.",
    },
  },
  {
    id: "pw-009",
    tech: "playwright",
    topic: "locators",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Three list items each contain a Delete button. This click fails. What is the bug?",
    code: {
      lang: "ts",
      source: "await page\n  .getByRole('listitem')\n  .getByRole('button', { name: 'Delete' })\n  .click();",
    },
    options: [
      "The locator matches every Delete button inside a list item, so click throws a strict mode violation",
      "The inner getByRole searches from the document root, so the listitem locator is ignored",
      "click activates every matched button in order and then passes",
      "getByRole cannot be chained, so this fails before it looks at the page",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The chained locator matches three Delete buttons, and click throws because strict mode requires one element.",
      why: "The outer locator matches every listitem. The inner getByRole looks for a Delete button inside those items, and each row has one, so the result is three buttons. Actions and single-element assertions use strict mode: more than one match throws rather than clicking the first. The chain does not restart at the document root, and click does not iterate. Narrow to one row with filter before asking for the button.",
      wrong: [
        {
          option: "The inner getByRole searches from the document root, so the listitem locator is ignored",
          reason: "A locator chained from another locator searches inside the outer matches. The listitem step is used.",
        },
        {
          option: "click activates every matched button in order and then passes",
          reason: "click does not fan out. More than one match is a strict mode error, not a loop.",
        },
        {
          option: "getByRole cannot be chained, so this fails before it looks at the page",
          reason: "Chaining getByRole is supported. The failure happens at click time because three buttons match.",
        },
      ],
      example: {
        lang: "ts",
        source: "const row = page\n  .getByRole('listitem')\n  .filter({ hasText: 'Ada' });\nawait row.getByRole('button', { name: 'Delete' }).click();\nawait expect(row).toHaveCount(0);\nawait expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);",
      },
      remember: "A chain that still matches several elements throws when you click. Filter until one element remains.",
      fixedCode: {
        lang: "ts",
        source: "const row = page\n  .getByRole('listitem')\n  .filter({ hasText: 'Ada' });\nawait row.getByRole('button', { name: 'Delete' }).click();\nawait expect(row).toHaveCount(0);\nawait expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);",
      },
    },
  },
  {
    id: "pw-010",
    tech: "playwright",
    topic: "locators",
    kind: "scenario",
    difficulty: "expert",
    prompt: "Save stays disabled until the form is valid. The test fills the last field and then needs to click Save. What should it do?",
    options: [
      "Call page.waitForTimeout before the click so the button has time to become enabled",
      "Click Save and let Playwright wait until the button is enabled and otherwise actionable",
      "Poll locator.isEnabled in a loop, because click does not consider the disabled state",
      "Call locator.dispatchEvent with click so the disabled check is skipped",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Click Save immediately. The click auto-waits until the button is visible, stable, enabled, and receiving events.",
      why: "After the last fill, the app may enable Save on a later render. locator.click waits through that gap. The action does not run while the button is disabled; enabled is one of the actionability checks, along with visible, stable, and receiving events, and the locator must match one element. A sleep adds delay even when the button is already ready, and it can still be too short. isEnabled is an instant read, and dispatchEvent bypasses the checks that click is there to perform.",
      wrong: [
        {
          option: "Call page.waitForTimeout before the click so the button has time to become enabled",
          reason: "waitForTimeout is a fixed sleep. It is a last resort, and click already waits until the button is enabled.",
        },
        {
          option: "Poll locator.isEnabled in a loop, because click does not consider the disabled state",
          reason: "click includes the enabled check. A manual poll repeats work the action already does.",
        },
        {
          option: "Call locator.dispatchEvent with click so the disabled check is skipped",
          reason: "dispatchEvent skips actionability checks, so it can fire on a button the user still cannot press.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.getByLabel('Email').fill('ada@example.com');\nawait page.getByLabel('Name').fill('Ada');\nconst save = page.getByRole('button', { name: 'Save' });\nawait save.click();\nawait expect(page.getByRole('status')).toHaveText('Saved');\nawait expect(save).toBeEnabled();",
      },
      remember: "Click the button. Playwright waits until it is actionable, including enabled.",
    },
  },
  {
    id: "pw-011",
    tech: "playwright",
    topic: "assertions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What do await expect(locator).toBeVisible() and await expect(locator).toHaveText() do while the page is still updating?",
    options: [
      "They read the DOM once and return immediately",
      "They wait until the element is attached, then check the condition a single time",
      "They retry until the condition is met or the assertion timeout ends",
      "They retry forever unless timeout is 0, and 0 is the default",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Both assertions retry until the locator matches the condition or the assertion timeout is reached.",
      why: "toBeVisible and toHaveText are web-first matchers. Playwright re-reads the locator, checks the condition, and tries again until it passes or the expect timeout ends. The default for that timeout is five seconds, and you can override it on the call or in the expect timeout config. They are asynchronous, so the test must await them. A plain expect on a string or a boolean that you already read does not enter this retry loop.",
      wrong: [
        {
          option: "They read the DOM once and return immediately",
          reason: "Those matchers are web-first. They poll the locator instead of sampling it once.",
        },
        {
          option: "They wait until the element is attached, then check the condition a single time",
          reason: "Attachment is not the condition. Each retry checks visibility or the text again.",
        },
        {
          option: "They retry forever unless timeout is 0, and 0 is the default",
          reason: "The default assertion timeout is five seconds, not unlimited, and not zero.",
        },
      ],
      example: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect(status).toBeVisible();\nawait expect(status).toHaveText('Ready');\nawait expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();\nawait expect(page.getByRole('listitem')).toHaveCount(3);\nawait expect(page).toHaveTitle('Inbox');",
      },
      remember: "Web-first assertions such as toBeVisible and toHaveText retry until the timeout.",
    },
  },
  {
    id: "pw-012",
    tech: "playwright",
    topic: "assertions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The status element is already showing Loading, and the app will change it to Ready after this read returns. What happens?",
    code: {
      lang: "ts",
      source: "const status = page.getByTestId('status');\nconst text = await status.textContent();\nexpect(text).toBe('Ready');",
    },
    options: [
      "The expect retries until the text is Ready",
      "textContent waits until the text equals Ready, then the expect passes",
      "The call fails because textContent is not allowed on a locator",
      "textContent returns Loading, and the plain expect fails without retrying",
    ],
    correctIndex: 3,
    explanation: {
      answer: "textContent captures Loading, and expect(text).toBe checks that string once, so the assertion fails.",
      why: "The element is already on the page, so textContent resolves with the current text, Loading. That string is then a normal value. expect(text).toBe is not a web-first matcher, so it does not go back to the DOM when the app later paints Ready. The update is invisible to an assertion that closed over the old string. await expect(status).toHaveText('Ready') would re-read the locator until the new text appears or the timeout ends.",
      wrong: [
        {
          option: "The expect retries until the text is Ready",
          reason: "expect on a string checks that value once. The retry belongs to expect(locator), not to a captured string.",
        },
        {
          option: "textContent waits until the text equals Ready, then the expect passes",
          reason: "textContent returns the text it sees when the element is available. It does not poll for a target string.",
        },
        {
          option: "The call fails because textContent is not allowed on a locator",
          reason: "locator.textContent is a real method. The failure is the one-shot assertion after it.",
        },
      ],
      example: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect(status).toHaveText('Ready');\nawait expect(status).toBeVisible();\nconst text = await status.textContent();\nexpect(text).toBe('Ready');\nawait expect(page.getByRole('status')).toHaveText('Ready');",
      },
      remember: "Reading textContent and then using a plain expect does not retry.",
    },
  },
  {
    id: "pw-013",
    tech: "playwright",
    topic: "assertions",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The list items arrive after a fetch. This check often sees zero items. What is the bug?",
    code: {
      lang: "ts",
      source: "const items = page.getByRole('listitem');\nconst count = await items.count();\nexpect(count).toBe(3);",
    },
    options: [
      "count returns the current number immediately, and the plain expect does not retry",
      "count waits until three items exist, so the failure must be a strict mode error",
      "expect on a number retries for the assertion timeout",
      "toHaveCount would also return immediately, so replacing count would not help",
    ],
    correctIndex: 0,
    explanation: {
      answer: "count does not wait for the items, and expect on that number checks it once.",
      why: "locator.count asks how many elements match right now and returns that number. If the fetch has not rendered the rows yet, the number is 0. expect(count).toBe is a generic matcher, so it fails immediately instead of trying again after the response. Strict mode is not involved, because count is allowed to see many elements. The retrying form is await expect(items).toHaveCount(3), which keeps looking until three rows exist or the assertion timeout ends.",
      wrong: [
        {
          option: "count waits until three items exist, so the failure must be a strict mode error",
          reason: "count does not wait for elements to appear. An empty list at that instant yields zero.",
        },
        {
          option: "expect on a number retries for the assertion timeout",
          reason: "A numeric expect checks the number it was given. It does not poll the locator.",
        },
        {
          option: "toHaveCount would also return immediately, so replacing count would not help",
          reason: "toHaveCount is the web-first matcher. It retries until the count matches.",
        },
      ],
      example: {
        lang: "ts",
        source: "const items = page.getByRole('listitem');\nawait expect(items).toHaveCount(3);\nawait expect(items.nth(0)).toHaveText('Ada');\nawait expect(items.nth(1)).toHaveText('Bea');\nawait expect(items.nth(2)).toHaveText('Cam');\nconst count = await items.count();\nexpect(count).toBe(3);",
      },
      remember: "count does not wait for elements to appear. toHaveCount does.",
      fixedCode: {
        lang: "ts",
        source: "const items = page.getByRole('listitem');\nawait expect(items).toHaveCount(3);\nawait expect(items.nth(0)).toHaveText('Ada');\nawait expect(items.nth(1)).toHaveText('Bea');\nawait expect(items.nth(2)).toHaveText('Cam');\nconst count = await items.count();\nexpect(count).toBe(3);",
      },
    },
  },
  {
    id: "pw-014",
    tech: "playwright",
    topic: "assertions",
    kind: "concept",
    difficulty: "expert",
    prompt: "Which statement about locator.count and expect(locator).toHaveCount is correct?",
    options: [
      "Both return the current count immediately and never retry",
      "count does not wait for elements to appear, and toHaveCount retries until the count matches",
      "toHaveCount throws whenever the expected number is greater than zero",
      "count retries for the assertion timeout, and toHaveCount does not",
    ],
    correctIndex: 1,
    explanation: {
      answer: "count is an immediate read. toHaveCount retries until the locator matches that many elements.",
      why: "count is a query. It reports the matches that exist at the moment it runs, including zero when the list has not rendered. It does not use the assertion timeout. toHaveCount is a web-first assertion: Playwright counts, compares, and counts again until the number matches or the expect timeout ends. Use the assertion when the test is waiting for UI. Use count only after the page is already in the state you want to measure, or when you intentionally want a snapshot.",
      wrong: [
        {
          option: "Both return the current count immediately and never retry",
          reason: "toHaveCount is web-first. It keeps querying until the expected count is true or the timeout ends.",
        },
        {
          option: "toHaveCount throws whenever the expected number is greater than zero",
          reason: "A positive expected count is normal. The matcher waits until that many elements match.",
        },
        {
          option: "count retries for the assertion timeout, and toHaveCount does not",
          reason: "That swaps the two APIs. The instant read is count, and the retrying assertion is toHaveCount.",
        },
      ],
      example: {
        lang: "ts",
        source: "const items = page.getByRole('listitem');\nawait expect(items).toHaveCount(3);\nconst count = await items.count();\nexpect(count).toBe(3);\nawait page.getByRole('button', { name: 'Add' }).click();\nawait expect(items).toHaveCount(4);",
      },
      remember: "count snapshots the current matches. toHaveCount retries.",
    },
  },
  {
    id: "pw-015",
    tech: "playwright",
    topic: "assertions",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The status element text stays Ready now. What does this assertion do?",
    code: {
      lang: "ts",
      source: "await expect(page.getByTestId('status')).toHaveText('Ready');",
    },
    options: [
      "It passes because toHaveText matches a substring",
      "It passes because extra words are ignored after whitespace normalization",
      "It fails because toHaveText requires the whole text, not a substring",
      "It throws a strict mode violation before the text is compared",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The assertion fails. toHaveText compares the whole string, and Ready now is not Ready.",
      why: "toHaveText retries, but each attempt compares the element text with the full expected string. For a string, Playwright normalizes whitespace and then checks that the texts are the same. Ready now still contains the second word, so the match never succeeds and the assertion times out. Case is sensitive unless you pass ignoreCase. A substring check is toContainText, which would accept Ready inside Ready now. Strict mode is not the failure when only one element matches.",
      wrong: [
        {
          option: "It passes because toHaveText matches a substring",
          reason: "A string passed to toHaveText is the whole text. Substring matching is toContainText.",
        },
        {
          option: "It passes because extra words are ignored after whitespace normalization",
          reason: "Whitespace normalization collapses spaces and line breaks. It does not drop the word now.",
        },
        {
          option: "It throws a strict mode violation before the text is compared",
          reason: "One status element is a single match. The failure is the text comparison after retries.",
        },
      ],
      example: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect(status).toHaveText('Ready now');\nawait expect(status).toContainText('Ready');\nawait expect(status).toContainText('now');\nawait expect(page.getByRole('listitem')).toHaveText([\n  'Ada',\n  'Bea',\n]);",
      },
      remember: "toHaveText checks the whole text. toContainText checks a substring.",
    },
  },
  {
    id: "pw-016",
    tech: "playwright",
    topic: "assertions",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The author added a two-second pause because the status text shows up late. What is the bug?",
    code: {
      lang: "ts",
      source: "await page.waitForTimeout(2000);\nawait expect(page.getByTestId('status')).toHaveText('Ready');",
    },
    options: [
      "toHaveText does not retry, so the sleep is required for the assertion to see Ready",
      "waitForTimeout retries the next assertion until that assertion passes",
      "Web-first assertions read the DOM once, so a sleep is the only wait they can use",
      "waitForTimeout is a fixed sleep. The web-first assertion already retries, so the sleep only slows the test",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The pause is a fixed delay. toHaveText already waits for Ready, so the sleep is not how you wait for the UI.",
      why: "page.waitForTimeout always burns the full two seconds, whether the status is already Ready or not. It does not look at the page. The following toHaveText call is what actually waits: it retries the text check until it passes or the assertion timeout ends. If Ready takes longer than two seconds, the assertion still has to do that wait afterward, so the sleep did not remove the race. If Ready is fast, the sleep only made the test slower. Keep the web-first assertion and delete the timeout. A fixed sleep is a last resort, not the wait for UI.",
      wrong: [
        {
          option: "toHaveText does not retry, so the sleep is required for the assertion to see Ready",
          reason: "toHaveText retries until Ready appears or the assertion timeout ends. The sleep is not what makes it retry.",
        },
        {
          option: "waitForTimeout retries the next assertion until that assertion passes",
          reason: "waitForTimeout only resolves after two seconds. It does not poll the status text.",
        },
        {
          option: "Web-first assertions read the DOM once, so a sleep is the only wait they can use",
          reason: "toHaveText is web-first. It re-reads the locator on its own.",
        },
      ],
      example: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect(status).toBeVisible();\nawait expect(status).toHaveText('Ready');\nawait page.getByRole('button', { name: 'Refresh' }).click();\nawait expect(status).toHaveText('Ready');\nawait expect(page.getByRole('listitem')).toHaveCount(3);",
      },
      remember: "Wait with a web-first assertion. page.waitForTimeout is a last resort, not the UI wait.",
      fixedCode: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect(status).toBeVisible();\nawait expect(status).toHaveText('Ready');\nawait page.getByRole('button', { name: 'Refresh' }).click();\nawait expect(status).toHaveText('Ready');\nawait expect(page.getByRole('listitem')).toHaveCount(3);",
      },
    },
  },
  {
    id: "pw-017",
    tech: "playwright",
    topic: "assertions",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does expect.soft change about a failing web-first assertion?",
    options: [
      "It records the failure and lets the test continue, and the test still fails if a soft assertion failed",
      "It turns the failure into a warning and the test passes",
      "It adds extra retries, then stops the test the way a normal expect does",
      "It works only for toHaveText, and it still stops the test at the first failure",
    ],
    correctIndex: 0,
    explanation: {
      answer: "expect.soft records the failure and continues. The test is still failed at the end if any soft assertion failed.",
      why: "A normal expect stops the test at the first failed assertion, so later checks never run. expect.soft still retries a web-first matcher until it passes or times out, but a failure is stored on the test and execution moves to the next line. You can check several labels in one run and see every miss. The test does not pass. When the test function returns, any stored soft failure fails the test. A later hard expect still stops the test immediately if that hard expect fails.",
      wrong: [
        {
          option: "It turns the failure into a warning and the test passes",
          reason: "A soft failure still fails the test. Continuing is so later checks can run and be reported too.",
        },
        {
          option: "It adds extra retries, then stops the test the way a normal expect does",
          reason: "Soft does not mean a longer timeout. The difference is that execution continues after the failure.",
        },
        {
          option: "It works only for toHaveText, and it still stops the test at the first failure",
          reason: "expect.soft is not limited to one matcher, and continuing past the failure is the point.",
        },
      ],
      example: {
        lang: "ts",
        source: "await expect.soft(page.getByTestId('status')).toHaveText('Ready');\nawait expect.soft(page.getByTestId('eta')).toHaveText('1 day');\nawait page.getByRole('link', { name: 'Next' }).click();\nawait expect.soft(page.getByRole('heading', { name: 'Review' })).toBeVisible();\nawait expect(page.getByRole('button', { name: 'Pay' })).toBeVisible();\nexpect(test.info().errors).toHaveLength(0);",
      },
      remember: "expect.soft collects failures and continues. The test still fails if one of them failed.",
    },
  },
  {
    id: "pw-018",
    tech: "playwright",
    topic: "assertions",
    kind: "code-output",
    difficulty: "expert",
    prompt: "The status element is visible and its text stays Waiting. What does this test do?",
    code: {
      lang: "ts",
      source: "await expect.soft(page.getByTestId('status')).toHaveText('Ready');\nawait expect(page.getByTestId('status')).toBeVisible();",
    },
    options: [
      "It stops at toHaveText and never runs toBeVisible",
      "toHaveText fails softly, toBeVisible runs and passes, and the test fails because of the soft failure",
      "Both assertions pass because a soft matcher ignores the expected text",
      "The test passes because the later passing expect clears the soft failure",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The soft text check fails and the test continues. Visibility passes, then the test fails because the soft assertion failed.",
      why: "expect.soft(locator).toHaveText still retries until Ready appears or the assertion timeout ends. The text stays Waiting, so that attempt is recorded as a failure and the function moves on instead of throwing out of the test. The next line is an ordinary expect(locator).toBeVisible. The element is visible, so it passes. Nothing clears the stored soft error. When the test ends, that error fails the test. A hard failure on the first line would have skipped the second line; the soft form is what lets it run.",
      wrong: [
        {
          option: "It stops at toHaveText and never runs toBeVisible",
          reason: "Soft failures do not abort the test. The hard toBeVisible line still runs.",
        },
        {
          option: "Both assertions pass because a soft matcher ignores the expected text",
          reason: "expect.soft still checks the expected text. Waiting does not satisfy Ready.",
        },
        {
          option: "The test passes because the later passing expect clears the soft failure",
          reason: "A later pass does not erase stored soft errors. One soft failure fails the test.",
        },
      ],
      example: {
        lang: "ts",
        source: "const status = page.getByTestId('status');\nawait expect.soft(status).toHaveText('Ready');\nawait expect.soft(page.getByTestId('eta')).toHaveText('1 day');\nawait expect(status).toBeVisible();\nawait page.getByRole('button', { name: 'Continue' }).click();\nawait expect(page.getByRole('heading')).toBeVisible();",
      },
      remember: "A soft failure does not stop the test and is not cleared by a later passing expect.",
    },
  },
  {
    id: "pw-019",
    tech: "playwright",
    topic: "network",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What can a page.route handler do with a request, and when must you register the route?",
    options: [
      "It can only abort, and you register it after the response has already arrived",
      "It can only read the body, and the registration order does not matter",
      "It can fulfill, abort, or continue, and you register it before the action that sends the request",
      "It replaces page.goto, so the test must not navigate after calling route",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The handler fulfills, aborts, or continues the request. Register the route before the action that triggers it.",
      why: "page.route sits in front of the network. In the handler, route.fulfill answers from the test, route.abort fails the request, and route.continue sends it on, with optional overrides. One of those calls has to happen or the request hangs. The handler runs only for requests that start after the route is registered. Set it up, then goto or click. A request that already completed is untouched by a route you add afterward.",
      wrong: [
        {
          option: "It can only abort, and you register it after the response has already arrived",
          reason: "fulfill and continue are the other two outcomes. A route registered after the request cannot change that request.",
        },
        {
          option: "It can only read the body, and the registration order does not matter",
          reason: "The handler is not a read-only log. It has to settle the request, and it must be installed first.",
        },
        {
          option: "It replaces page.goto, so the test must not navigate after calling route",
          reason: "route does not navigate. You still goto, click, or otherwise trigger the request after the route exists.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/items', (route) => {\n  route.fulfill({ json: { items: [] } });\n});\nawait page.goto('https://shop.example/items');\nawait expect(page.getByText('No items')).toBeVisible();\nawait page.unroute('**/api/items');",
      },
      remember: "Register page.route first. Then fulfill, abort, or continue the request.",
    },
  },
  {
    id: "pw-020",
    tech: "playwright",
    topic: "network",
    kind: "code-output",
    difficulty: "expert",
    prompt: "page.goto waits until the document and its /api/items response have finished. The route is registered after that. Does the mock apply to the fetch that happened during goto?",
    code: {
      lang: "ts",
      source: "await page.goto('https://shop.example/items');\nawait page.route('**/api/items', (route) => {\n  route.fulfill({ json: { items: [] } });\n});",
    },
    options: [
      "Yes. route rewrites requests that have already finished",
      "Yes. fulfill runs before navigation even when the route line comes later",
      "goto throws because the route was not registered yet",
      "No. That fetch already finished, so this mock does not apply to it",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The mock does not apply to that fetch. The route was registered after the response had already arrived.",
      why: "The prompt states that goto resolves only after /api/items has responded. The route call is the next line, so it misses that request. Playwright does not replay finished traffic through a new handler. The fulfill callback is not hoisted above the navigation. Later matching requests, such as a refresh click after this route exists, would be mocked. To mock the load itself, register the route and then call goto.",
      wrong: [
        {
          option: "Yes. route rewrites requests that have already finished",
          reason: "A route does not edit a response that the page has already received.",
        },
        {
          option: "Yes. fulfill runs before navigation even when the route line comes later",
          reason: "Source order is the runtime order. The route starts affecting requests only after that await runs.",
        },
        {
          option: "goto throws because the route was not registered yet",
          reason: "goto is allowed without a route. It uses the real network for requests that are not intercepted.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/items', (route) => {\n  route.fulfill({ json: { items: [] } });\n});\nawait page.goto('https://shop.example/items');\nawait expect(page.getByRole('status')).toHaveText('No items');\nawait page.getByRole('button', { name: 'Refresh' }).click();\nawait expect(page.getByRole('status')).toHaveText('No items');",
      },
      remember: "Register the route before the action that sends the request.",
    },
  },
  {
    id: "pw-021",
    tech: "playwright",
    topic: "network",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The page waits on /api/items during goto, and the test times out. What is the bug?",
    code: {
      lang: "ts",
      source: "await page.route('**/api/items', (route) => {\n  console.log(route.request().url());\n});\nawait page.goto('https://shop.example/items');",
    },
    options: [
      "The handler never fulfills, aborts, or continues the request, so the request hangs",
      "console.log fulfills the request with an empty body, so the hang is inside goto itself",
      "The route callback runs only after goto returns, so the log line is unreachable",
      "A handler that does not call fulfill is treated as continue, so the page should load",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The handler logs the URL and returns. The request hangs because nothing fulfills, aborts, or continues it.",
      why: "The route is registered before goto, so it does intercept /api/items. Interception means the browser will not finish that request until the handler settles it. console.log only prints the URL. route.fulfill would answer from the test, route.abort would fail it, and route.continue would send it to the network. None of those runs, so the load waits until the test times out. A handler is not an observer; the request event is the observer.",
      wrong: [
        {
          option: "console.log fulfills the request with an empty body, so the hang is inside goto itself",
          reason: "Logging does not settle the route. The browser is still waiting for a response.",
        },
        {
          option: "The route callback runs only after goto returns, so the log line is unreachable",
          reason: "The handler runs when the matching request starts, which is during goto, not after it returns.",
        },
        {
          option: "A handler that does not call fulfill is treated as continue, so the page should load",
          reason: "There is no implicit continue. If the handler returns without settling the route, the request waits.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/items', (route) => {\n  route.fulfill({ json: { items: [] } });\n});\nawait page.goto('https://shop.example/items');\nawait expect(page.getByRole('status')).toHaveText('No items');\nawait page.unroute('**/api/items');",
      },
      remember: "Every route handler must fulfill, abort, or continue. Otherwise the request hangs.",
      fixedCode: {
        lang: "ts",
        source: "await page.route('**/api/items', (route) => {\n  route.fulfill({ json: { items: [] } });\n});\nawait page.goto('https://shop.example/items');\nawait expect(page.getByRole('status')).toHaveText('No items');\nawait page.unroute('**/api/items');",
      },
    },
  },
  {
    id: "pw-022",
    tech: "playwright",
    topic: "network",
    kind: "code-output",
    difficulty: "expert",
    prompt: "After this route is installed, the page requests https://shop.example/api/v1/user.json. Is that request fulfilled by the route?",
    code: {
      lang: "ts",
      source: "await page.route('https://shop.example/api/*.json', (route) => {\n  route.fulfill({ json: { ok: true } });\n});",
    },
    options: [
      "Yes. A single star matches every character, including slashes",
      "No. A single star does not match a slash, so the v1 segment is outside the pattern",
      "Yes. A string passed to page.route is a regular expression",
      "Yes, but only in Firefox. Chromium treats the star as a literal",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The request is not fulfilled. One star does not cross the slash in front of v1.",
      why: "page.route treats a string as a glob, and the glob must match the entire URL. One star matches any characters except a slash. Two stars match across slashes. The pattern ends with /api/*.json, which fits /api/user.json and does not fit /api/v1/user.json, because v1 and the following slash are outside what one star can consume. The quotes do not make it a regular expression, and the rule is not browser-specific. A pattern such as **/api/**/*.json would cover the extra segment.",
      wrong: [
        {
          option: "Yes. A single star matches every character, including slashes",
          reason: "In a Playwright URL glob, one star matches within a single path segment. It stops at a slash.",
        },
        {
          option: "Yes. A string passed to page.route is a regular expression",
          reason: "A string pattern is a glob. A regular expression is written as a regex literal, not as a quoted string.",
        },
        {
          option: "Yes, but only in Firefox. Chromium treats the star as a literal",
          reason: "URL globs use the same star rules in every browser Playwright drives.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/**/*.json', (route) => {\n  route.fulfill({ json: { ok: true } });\n});\nawait page.goto('https://shop.example/');\nconst user = page.waitForResponse('**/api/v1/user.json');\nawait page.getByRole('button', { name: 'Load user' }).click();\nconst response = await user;\nexpect(response.ok()).toBe(true);",
      },
      remember: "In a URL glob, one star stops at a slash. Two stars can cross slashes. The pattern matches the whole URL.",
    },
  },
  {
    id: "pw-023",
    tech: "playwright",
    topic: "network",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "Refresh sends /api/items and the response often arrives before the next line runs. The wait then times out. What is the bug?",
    code: {
      lang: "ts",
      source: "await page.getByRole('button', { name: 'Refresh' }).click();\nconst response = await page.waitForResponse('**/api/items');",
    },
    options: [
      "waitForResponse can only be used with page.goto, not with a click",
      "A glob is not allowed inside waitForResponse",
      "The waiter is created after the click, so the response can be missed",
      "waitForResponse repeats the click until some response arrives",
    ],
    correctIndex: 2,
    explanation: {
      answer: "The response can finish during the click, before waitForResponse starts listening, so the wait sits until timeout.",
      why: "waitForResponse arms a listener and then resolves on the next matching response. In this order the click is awaited first. If /api/items returns while that click is still running, the response is already done when the waiter is created, and the waiter does not look backward. It waits for a later response that never comes. Create the promise, then click, then await the promise. The same ordering rule applies to a route: install it before the action that sends the request.",
      wrong: [
        {
          option: "waitForResponse can only be used with page.goto, not with a click",
          reason: "waitForResponse listens for any matching response. The trigger can be a click.",
        },
        {
          option: "A glob is not allowed inside waitForResponse",
          reason: "A string pattern is a glob, which is a documented way to call waitForResponse.",
        },
        {
          option: "waitForResponse repeats the click until some response arrives",
          reason: "The waiter does not perform the click. It only observes a response that starts after it is created.",
        },
      ],
      example: {
        lang: "ts",
        source: "const responsePromise = page.waitForResponse('**/api/items');\nawait page.getByRole('button', { name: 'Refresh' }).click();\nconst response = await responsePromise;\nexpect(response.ok()).toBe(true);\nconst body = await response.json();\nexpect(body.items.length).toBeGreaterThan(0);",
      },
      remember: "Start waitForResponse before the click, then await it after the click.",
      fixedCode: {
        lang: "ts",
        source: "const responsePromise = page.waitForResponse('**/api/items');\nawait page.getByRole('button', { name: 'Refresh' }).click();\nconst response = await responsePromise;\nexpect(response.ok()).toBe(true);\nconst body = await response.json();\nexpect(body.items.length).toBeGreaterThan(0);",
      },
    },
  },
  {
    id: "pw-024",
    tech: "playwright",
    topic: "network",
    kind: "concept",
    difficulty: "expert",
    prompt: "Two page.route handlers both match the same request. Which one runs, and how do you pass the request to the other?",
    options: [
      "The first registered route always wins, and there is no way to defer to the other",
      "Both handlers run in parallel, and the first fulfill becomes the response",
      "Playwright merges every fulfill body into one response",
      "The route registered last is checked first, and route.fallback continues to the next match",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The most recently registered matching route runs first. route.fallback hands that request to the next matching route.",
      why: "When several page.route patterns match, Playwright tries the one you registered last. That handler must fulfill, abort, continue, or call route.fallback. route.fallback passes the request to the next matching handler, and if none remains the request continues to the network. Page routes are also checked before browser-context routes when both match. If the winning handler returns without settling the route and without calling fallback, the request hangs.",
      wrong: [
        {
          option: "The first registered route always wins, and there is no way to defer to the other",
          reason: "Precedence is the reverse of registration order. The later route is tried first.",
        },
        {
          option: "Both handlers run in parallel, and the first fulfill becomes the response",
          reason: "Only one handler owns the request at a time. A second fulfill does not race the first.",
        },
        {
          option: "Playwright merges every fulfill body into one response",
          reason: "Bodies are not merged. The handler that settles the route supplies the response.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/**', (route) => {\n  route.fulfill({ json: { name: 'broad' } });\n});\nawait page.route('**/api/user', (route) => {\n  if (route.request().method() === 'GET') {\n    route.fallback();\n    return;\n  }\n  route.fulfill({ json: { name: 'posted' } });\n});\nawait page.goto('https://app.example/profile');",
      },
      remember: "The last registered matching route runs first. Call route.fallback to try the next one.",
    },
  },
  {
    id: "pw-025",
    tech: "playwright",
    topic: "network",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The profile page fetches /api/user while it loads. What does that intercepted response contain?",
    code: {
      lang: "ts",
      source: "await page.route('**/api/user', (route) => {\n  route.fulfill({ json: { name: 'Ada' } });\n});\nawait page.goto('https://app.example/profile');",
    },
    options: [
      "A 200 response whose JSON body is an object with name Ada, and the real server is not called",
      "An empty 204, because fulfill ignores the json option",
      "The real server body, because fulfill only logs the request",
      "A failed request, because fulfill requires a contentType field before json is accepted",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The page receives status 200 and JSON for an object whose name is Ada. The real server is not called for that request.",
      why: "The route is registered before goto, and the glob matches the profile fetch. route.fulfill with json serializes the object, sets the response content type to JSON, and uses status 200 unless you pass another status. That response is produced in the test process. continue would have reached the network; fulfill does not. The page then parses the body and can render Ada. A handler that forgot to fulfill, abort, or continue would hang instead of returning this body.",
      wrong: [
        {
          option: "An empty 204, because fulfill ignores the json option",
          reason: "json supplies the body and a JSON content type. The default status is 200, not 204.",
        },
        {
          option: "The real server body, because fulfill only logs the request",
          reason: "fulfill answers from the test. The matching request is not sent to the real server.",
        },
        {
          option: "A failed request, because fulfill requires a contentType field before json is accepted",
          reason: "json is enough. Playwright serializes the object and sets the JSON content type.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/user', (route) => {\n  route.fulfill({ json: { name: 'Ada' } });\n});\nawait page.goto('https://app.example/profile');\nawait expect(page.getByRole('heading')).toHaveText('Ada');\nconst name = page.getByTestId('name');\nawait expect(name).toHaveText('Ada');",
      },
      remember: "route.fulfill({ json }) returns that JSON with status 200 and does not call the real server.",
    },
  },
  {
    id: "pw-026",
    tech: "playwright",
    topic: "network",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The author wants /api/user to return a fixture. The real request still goes out. What is the bug?",
    code: {
      lang: "ts",
      source: "page.on('request', async (request) => {\n  if (request.url().includes('/api/user')) {\n    await request.response();\n  }\n});\nawait page.goto('https://app.example/profile');",
    },
    options: [
      "The request event runs before the network stack and replaces the body when response is awaited",
      "The request event only observes traffic. Mock the call with page.route and fulfill, abort, or continue",
      "includes matches nothing, so the condition is why the body is unchanged",
      "Calling response aborts the request before it leaves the browser",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The request listener can only observe the call. A mock has to be a page.route that fulfills, aborts, or continues.",
      why: "page.on with the request event fires for traffic the page is already making. The Request object can report the URL and, through response, the real response once it exists. It cannot fulfill or abort that call. Awaiting response therefore waits for the network instead of replacing it. Install page.route for the same URL before goto, and inside the handler call route.fulfill with the fixture, or route.abort, or route.continue. The route has to exist before the profile navigation sends /api/user.",
      wrong: [
        {
          option: "The request event runs before the network stack and replaces the body when response is awaited",
          reason: "The request event does not own the route. Awaiting response waits for the real response; it does not write one.",
        },
        {
          option: "includes matches nothing, so the condition is why the body is unchanged",
          reason: "includes is a substring check and would see /api/user. The URL check is not why the server is contacted.",
        },
        {
          option: "Calling response aborts the request before it leaves the browser",
          reason: "response reads the response for an observed request. Aborting is route.abort on a page.route handler.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.route('**/api/user', (route) => {\n  route.fulfill({ json: { name: 'Ada' } });\n});\npage.on('request', (request) => {\n  if (request.url().includes('/api/user')) {\n    console.log(request.method());\n  }\n});\nawait page.goto('https://app.example/profile');\nawait expect(page.getByRole('heading')).toHaveText('Ada');",
      },
      remember: "Observe with request and response events. Mock with page.route before the action.",
      fixedCode: {
        lang: "ts",
        source: "await page.route('**/api/user', (route) => {\n  route.fulfill({ json: { name: 'Ada' } });\n});\nawait page.goto('https://app.example/profile');\nawait expect(page.getByRole('heading')).toHaveText('Ada');\nawait page.unroute('**/api/user');",
      },
    },
  },
  {
    id: "pw-027",
    tech: "playwright",
    topic: "isolation",
    kind: "concept",
    difficulty: "expert",
    prompt: "What browser state does a Playwright test start with, compared with the test that ran before it?",
    options: [
      "The same context as the rest of the file, so cookies leak from test to test",
      "A new page inside the previous test context",
      "A fresh browser context, so cookies and storage are not shared unless you pass storageState",
      "A brand-new browser process, and storageState cannot put cookies back",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Each test gets a fresh browser context. Cookies and storage stay out of the next test unless that test loads storageState.",
      why: "Playwright Test gives every test its own browser context and a page in that context. A context is an isolated profile: its cookies, localStorage, and sessionStorage start empty and disappear when the test ends. The next test does not inherit them, even when both tests run in the same worker and in the same file. Pass storageState when a test should start from cookies and localStorage you saved earlier. That loads a copy into the new context. It does not keep one live context open across tests.",
      wrong: [
        {
          option: "The same context as the rest of the file, so cookies leak from test to test",
          reason: "The test runner creates a context per test. A shared file-level context is not the default.",
        },
        {
          option: "A new page inside the previous test context",
          reason: "The new page does not reuse the previous context. The context is new as well.",
        },
        {
          option: "A brand-new browser process, and storageState cannot put cookies back",
          reason: "Contexts are isolated inside a browser the worker can reuse. storageState is how saved cookies are loaded into the new context.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { test, expect } from '@playwright/test';\ntest('one', async ({ context }) => {\n  await context.addCookies([{ name: 'session', value: 'one', url: 'https://app.example' }]);\n  expect(await context.cookies()).toHaveLength(1);\n});\ntest('two', async ({ context }) => {\n  expect(await context.cookies()).toHaveLength(0);\n});",
      },
      remember: "Each test gets a fresh context. Share cookies only by passing storageState.",
    },
  },
  {
    id: "pw-028",
    tech: "playwright",
    topic: "isolation",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "These are two tests in one file. No storageState is configured. What does the second test read?",
    code: {
      lang: "ts",
      source: "test('saves a cookie', async ({ context }) => {\n  await context.addCookies([{\n    name: 'session',\n    value: 'abc',\n    url: 'https://app.example',\n  }]);\n});\ntest('reads cookies', async ({ context }) => {\n  const cookies = await context.cookies();\n  console.log(cookies);\n});",
    },
    options: [
      "The session cookie, because tests in one file share a context",
      "The session cookie, because a worker keeps one cookie jar for the whole file",
      "Every cookie written by every project in the run",
      "No session cookie from the first test, because the second test has a new context",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The second test sees an empty cookie jar. Its context is not the context that received the session cookie.",
      why: "The first test adds a cookie to the context fixture it was given. When that test ends, the context closes and the cookie goes with it. The second test gets a new context and a new page. context.cookies on that object does not list the session cookie, so the expectation of an empty array passes. Running the file in one worker, or with workers set to 1, does not change this. storageState is the opt-in that copies saved cookies into a new context.",
      wrong: [
        {
          option: "The session cookie, because tests in one file share a context",
          reason: "Declaration order does not merge contexts. Each test function receives its own.",
        },
        {
          option: "The session cookie, because a worker keeps one cookie jar for the whole file",
          reason: "A worker may run both tests, but the runner still opens a new context for each one.",
        },
        {
          option: "Every cookie written by every project in the run",
          reason: "Projects do not pour cookies into later tests. Isolation is per test context.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { test, expect } from '@playwright/test';\ntest('saves a cookie', async ({ context }) => {\n  await context.addCookies([{\n    name: 'session',\n    value: 'abc',\n    url: 'https://app.example',\n  }]);\n  expect(await context.cookies()).toHaveLength(1);\n});\ntest('reads cookies', async ({ context }) => {\n  expect(await context.cookies()).toEqual([]);\n});",
      },
      remember: "A cookie added in one test is gone in the next test unless you load storageState.",
    },
  },
  {
    id: "pw-029",
    tech: "playwright",
    topic: "isolation",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The author expects the guest page to have an empty cookie jar. guestContext.cookies includes the admin session. What is the bug?",
    code: {
      lang: "ts",
      source: "const context = await browser.newContext();\nconst admin = await context.newPage();\nconst guest = await context.newPage();\nawait context.addCookies([{\n  name: 'session',\n  value: 'admin',\n  url: 'https://app.example',\n}]);\nconst guestCookies = await guest.context().cookies();",
    },
    options: [
      "Both pages share one context, so they share cookies. A second newContext isolates the guest",
      "newPage creates a new context, so the guest cookie jar cannot see addCookies",
      "addCookies applies only to the page that is focused, so the guest read should be empty",
      "Cookies are stored per page, even when the pages come from one context",
    ],
    correctIndex: 0,
    explanation: {
      answer: "admin and guest are pages in one context, so the cookie is visible to both. A separate browser.newContext isolates the guest.",
      why: "browser.newContext creates the cookie jar. Every page from that context shares it, which is why two pages can participate in the same login. guest.context() is the same object as context, so cookies() returns the session that addCookies just stored. The read is not scoped to the guest tab. Call browser.newContext a second time and open the guest page from that context. browser.newPage is a different shortcut: it creates a page in a brand-new context, and closing that page closes that context.",
      wrong: [
        {
          option: "newPage creates a new context, so the guest cookie jar cannot see addCookies",
          reason: "context.newPage adds a page to the context you already created. It does not call newContext.",
        },
        {
          option: "addCookies applies only to the page that is focused, so the guest read should be empty",
          reason: "addCookies writes the context cookie jar. Focus is irrelevant, and both pages use that jar.",
        },
        {
          option: "Cookies are stored per page, even when the pages come from one context",
          reason: "Pages do not get private cookie jars inside one context. The jar belongs to the context.",
        },
      ],
      example: {
        lang: "ts",
        source: "const adminContext = await browser.newContext();\nconst guestContext = await browser.newContext();\nconst admin = await adminContext.newPage();\nconst guest = await guestContext.newPage();\nawait adminContext.addCookies([{\n  name: 'session',\n  value: 'admin',\n  url: 'https://app.example',\n}]);\nexpect(await guestContext.cookies()).toEqual([]);\nawait admin.close();\nawait guest.close();",
      },
      remember: "Pages in one context share cookies. browser.newContext starts a separate cookie jar.",
      fixedCode: {
        lang: "ts",
        source: "const adminContext = await browser.newContext();\nconst guestContext = await browser.newContext();\nconst admin = await adminContext.newPage();\nconst guest = await guestContext.newPage();\nawait adminContext.addCookies([{\n  name: 'session',\n  value: 'admin',\n  url: 'https://app.example',\n}]);\nexpect(await guestContext.cookies()).toEqual([]);\nawait admin.close();\nawait guest.close();",
      },
    },
  },
  {
    id: "pw-030",
    tech: "playwright",
    topic: "isolation",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does storageState save, and why do tests pass that file in?",
    options: [
      "Only sessionStorage, which is why a login survives a new tab in the same context",
      "Cookies and localStorage, so a new context can start signed in and skip the login UI",
      "The whole browser profile, including extensions and the on-disk cache",
      "Nothing on disk. It only copies state between pages that already share a context",
    ],
    correctIndex: 1,
    explanation: {
      answer: "storageState saves cookies and localStorage so later tests can start already signed in and skip the login UI.",
      why: "After a login you call context.storageState and pass a path. The file holds the cookies and the localStorage entries needed to look signed in. Point the project config or test.use at that file and each test still gets its own context, but the context is created from the snapshot. That is how a suite skips the login form. Session storage is not part of the file. Current Playwright also stores IndexedDB in that snapshot. Editing a cookie during a test does not rewrite the file unless you save storageState again.",
      wrong: [
        {
          option: "Only sessionStorage, which is why a login survives a new tab in the same context",
          reason: "Session storage is not in the storageState file. Cookies and localStorage are.",
        },
        {
          option: "The whole browser profile, including extensions and the on-disk cache",
          reason: "storageState is a snapshot of site storage, not a copy of the browser installation or cache.",
        },
        {
          option: "Nothing on disk. It only copies state between pages that already share a context",
          reason: "context.storageState writes a file, and the config or test.use reads it into a new context.",
        },
      ],
      example: {
        lang: "ts",
        source: "await page.goto('https://app.example/login');\nawait page.getByLabel('Email').fill('ada@example.com');\nawait page.getByLabel('Password').fill('secret');\nawait page.getByRole('button', { name: 'Sign in' }).click();\nawait expect(page.getByRole('button', { name: 'Account' })).toBeVisible();\nawait page.context().storageState({ path: 'playwright/.auth/user.json' });",
      },
      remember: "storageState saves cookies and localStorage so the next context can skip the login UI.",
    },
  },
  {
    id: "pw-031",
    tech: "playwright",
    topic: "isolation",
    kind: "code-output",
    difficulty: "expert",
    prompt: "fullyParallel is left at its default. workers is 4. A file declares test A and then test B. How do A and B run?",
    code: {
      lang: "ts",
      source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 4,\n});",
    },
    options: [
      "A and B run at the same time in two workers because workers is 4",
      "A and B share one browser context because they share a worker",
      "A runs, then B, in one worker. Other files can use the other workers",
      "B runs before A because workers reverses declaration order",
    ],
    correctIndex: 2,
    explanation: {
      answer: "A finishes before B starts, both in the same worker. The other workers can run other files at the same time.",
      why: "By default, tests in one file run in order in one worker. workers: 4 only raises the number of worker processes, so up to four files can run at once. It does not turn on fullyParallel, and it does not reorder A and B. The shared worker also does not mean a shared browser context: when A ends, its context is closed, and B gets a new one. Set fullyParallel, or configure a describe with mode parallel, when the tests in this file should run at the same time.",
      wrong: [
        {
          option: "A and B run at the same time in two workers because workers is 4",
          reason: "workers caps how many worker processes exist. It does not parallelize tests inside one file.",
        },
        {
          option: "A and B share one browser context because they share a worker",
          reason: "Sharing a worker does not share a context. Each test still starts with a fresh context.",
        },
        {
          option: "B runs before A because workers reverses declaration order",
          reason: "In a file, declaration order is the run order when fullyParallel is off.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 4,\n});\ntest('A', async ({ page }) => {\n  await page.goto('https://app.example/a');\n});\ntest('B', async ({ page }) => {\n  await page.goto('https://app.example/b');\n});",
      },
      remember: "workers limits worker processes. Tests in one file stay in order in one worker unless fullyParallel is on.",
    },
  },
  {
    id: "pw-032",
    tech: "playwright",
    topic: "isolation",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "creates the draft writes a draft through the UI. publishes the draft expects that same server draft and expects to run second. The file is flaky. What is the bug?",
    code: {
      lang: "ts",
      source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  fullyParallel: true,\n  workers: 4,\n});",
    },
    options: [
      "fullyParallel puts every test in the file on one shared context, so cookies collide",
      "workers: 4 forces the file to run in order, so the flake must be inside the locator",
      "fullyParallel changes fixtures only and leaves the two tests in declaration order",
      "The two tests can run at the same time, each in a fresh context, so the second cannot rely on the first",
    ],
    correctIndex: 3,
    explanation: {
      answer: "fullyParallel lets these tests run together in separate contexts, so the publisher cannot depend on the creator.",
      why: "With fullyParallel, tests in one file are allowed to run at the same time, in different workers. Declaration order is not a happens-before relationship, and each test still receives a fresh browser context, so cookies from the first test are not visible in the second. The server draft is shared mutable state with a race. workers: 4 is only the pool size. Make each test create the draft it needs. Turning fullyParallel off restores order in one worker, but the contexts are still separate, so browser state would not transfer either way.",
      wrong: [
        {
          option: "fullyParallel puts every test in the file on one shared context, so cookies collide",
          reason: "fullyParallel does the opposite of sharing a context. Parallel tests get separate contexts and separate workers.",
        },
        {
          option: "workers: 4 forces the file to run in order, so the flake must be inside the locator",
          reason: "workers does not force order inside the file. fullyParallel is what allows the tests to overlap.",
        },
        {
          option: "fullyParallel changes fixtures only and leaves the two tests in declaration order",
          reason: "fullyParallel is the switch that runs tests from one file at the same time. Order is no longer guaranteed.",
        },
      ],
      example: {
        lang: "ts",
        source: "test('publishes a draft', async ({ page }) => {\n  await page.goto('https://app.example/drafts/new');\n  await page.getByLabel('Title').fill('Notes');\n  await page.getByRole('button', { name: 'Create' }).click();\n  await page.getByRole('button', { name: 'Publish' }).click();\n  await expect(page.getByRole('status')).toHaveText('Published');\n});",
      },
      remember: "fullyParallel runs tests in one file at the same time. Do not depend on another test.",
      fixedCode: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 4,\n});\ntest('publishes a draft', async ({ page }) => {\n  await page.goto('https://app.example/drafts/new');\n  await page.getByLabel('Title').fill('Notes');\n  await page.getByRole('button', { name: 'Create' }).click();\n  await page.getByRole('button', { name: 'Publish' }).click();\n  await expect(page.getByRole('status')).toHaveText('Published');\n});",
      },
    },
  },
  {
    id: "pw-033",
    tech: "playwright",
    topic: "isolation",
    kind: "concept",
    difficulty: "expert",
    prompt: "The config sets trace to on-first-retry. When is a trace recorded?",
    options: [
      "On the first retry of a test, not on the first attempt",
      "On every attempt, including tests that pass the first time",
      "Only when the test passes on the first try",
      "For the whole worker as a video, because trace and video are the same option",
    ],
    correctIndex: 0,
    explanation: {
      answer: "A trace is recorded when a test is retried for the first time. The first attempt is not traced.",
      why: "trace: on-first-retry tells the runner to capture a trace for the first retry, which is the usual CI setting because tracing every successful test is expensive. The attempt that failed originally is not the one this mode records. If retries is 0, a retry never starts, so this mode writes no trace. Pair it with retries of at least 1 when you want a zip after a failure. on traces every test, and retain-on-failure keeps traces only for failures. video is configured separately.",
      wrong: [
        {
          option: "On every attempt, including tests that pass the first time",
          reason: "on records every test. on-first-retry waits until a retry actually happens.",
        },
        {
          option: "Only when the test passes on the first try",
          reason: "A first-try pass does not retry, so this setting records nothing for that test.",
        },
        {
          option: "For the whole worker as a video, because trace and video are the same option",
          reason: "video is a separate option. A trace is the trace zip the viewer opens.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  retries: 1,\n  use: {\n    trace: 'on-first-retry',\n  },\n});",
      },
      remember: "trace: on-first-retry records a trace when a retry happens, not on the first attempt.",
    },
  },
  {
    id: "pw-034",
    tech: "playwright",
    topic: "isolation",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "baseURL is https://app.example. Where does this goto navigate?",
    code: {
      lang: "ts",
      source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  use: {\n    baseURL: 'https://app.example',\n  },\n});\nawait page.goto('/settings');",
    },
    options: [
      "https://settings, because a leading slash replaces the host",
      "https://app.example/settings",
      "The path /settings on a file server started by the test runner",
      "It throws, because goto requires an absolute URL even when baseURL is set",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The page opens https://app.example/settings. baseURL is applied to the relative path.",
      why: "use.baseURL is the prefix for relative URLs passed to page.goto. The path /settings is resolved against https://app.example, producing https://app.example/settings. The call does not throw for being relative, and it does not look for a file on disk. An absolute URL such as https://other.example/settings would ignore the base. The same base is considered when a string route or wait pattern does not start with a star.",
      wrong: [
        {
          option: "https://settings, because a leading slash replaces the host",
          reason: "The leading slash is the path. It is resolved against the baseURL host, not used as a host.",
        },
        {
          option: "The path /settings on a file server started by the test runner",
          reason: "baseURL is an application origin you set. It does not start a separate static file server.",
        },
        {
          option: "It throws, because goto requires an absolute URL even when baseURL is set",
          reason: "A relative path is valid when baseURL is set. Absolute URLs still bypass it.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  use: {\n    baseURL: 'https://app.example',\n  },\n});\nawait page.goto('/settings');\nawait expect(page).toHaveURL('https://app.example/settings');\nawait page.goto('/account');\nawait expect(page).toHaveURL('https://app.example/account');",
      },
      remember: "baseURL lets page.goto take a relative path such as /settings.",
    },
  },
  {
    id: "pw-035",
    tech: "playwright",
    topic: "isolation",
    kind: "scenario",
    difficulty: "expert",
    prompt: "Most tests need a signed-in user, and repeating the login form in every test is slow. How should the suite start those tests already signed in?",
    options: [
      "Log in during the first test and leave that page open for the rest of the file",
      "Set workers to 1 so the cookie jar is shared by later tests",
      "Save storageState after one login and load that file from the config or test.use",
      "Put the password in baseURL so every goto submits the login form",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Log in once, save storageState, and load that file in the project config or with test.use so each new context starts signed in.",
      why: "The login UI is slow to repeat, but leaving a page open would couple tests and break as soon as the context closes. storageState writes the cookies and localStorage from a context that just signed in. The setup project or a single setup test can do that write. Every other test still receives a fresh context; the config or test.use passes the file in, and Playwright copies those cookies and localStorage into the new context. Session storage is not in the file. A cookie changed during a test stays in that test.",
      wrong: [
        {
          option: "Log in during the first test and leave that page open for the rest of the file",
          reason: "The page and its context close at the end of the test. Later tests do not inherit that page.",
        },
        {
          option: "Set workers to 1 so the cookie jar is shared by later tests",
          reason: "workers: 1 runs one test at a time. Each test still gets a fresh context and an empty cookie jar.",
        },
        {
          option: "Put the password in baseURL so every goto submits the login form",
          reason: "baseURL only resolves relative URLs. It does not submit a form or set cookies.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  use: {\n    baseURL: 'https://app.example',\n    storageState: 'playwright/.auth/user.json',\n  },\n});\ntest('sees the account', async ({ page }) => {\n  await page.goto('/account');\n  await expect(page.getByRole('heading', { name: 'Ada' })).toBeVisible();\n});",
      },
      remember: "Save storageState after login and load it so each fresh context skips the login UI.",
    },
  },
  {
    id: "pw-036",
    tech: "playwright",
    topic: "isolation",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The author set workers to 1 so a cookie created in one test would be visible in the next test. The next test still has an empty jar. What is the bug?",
    code: {
      lang: "ts",
      source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 1,\n});",
    },
    options: [
      "workers: 1 merges every test into one context, so the jar should not be empty",
      "A single worker keeps the page fixture alive, so the cookie should survive",
      "Cookie sharing requires fullyParallel rather than workers",
      "workers only limits how many test processes run. Each test still has a fresh context, so reuse cookies with storageState",
    ],
    correctIndex: 3,
    explanation: {
      answer: "workers: 1 only runs a single worker. It does not share browser contexts. Load storageState when the next test needs those cookies.",
      why: "The workers setting caps worker processes. At 1, files and tests run one after another in that process. Isolation does not change: the runner opens a browser context, runs the test, and closes the context. The next test opens another context with an empty cookie jar. fullyParallel is about overlap, not about preserving cookies. To start the next test signed in, save storageState from the login and pass that file into the new context. The file is a copy of cookies and localStorage, not a live jar shared by the worker.",
      wrong: [
        {
          option: "workers: 1 merges every test into one context, so the jar should not be empty",
          reason: "One worker still creates a new context per test. The contexts are not merged.",
        },
        {
          option: "A single worker keeps the page fixture alive, so the cookie should survive",
          reason: "The page fixture is built for the test and closed afterward. The next test gets another page.",
        },
        {
          option: "Cookie sharing requires fullyParallel rather than workers",
          reason: "fullyParallel overlaps tests. It does not hand the previous context to the next test.",
        },
      ],
      example: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 1,\n  use: {\n    storageState: 'playwright/.auth/user.json',\n  },\n});\ntest('reads the saved session', async ({ context }) => {\n  const cookies = await context.cookies();\n  expect(cookies.some((cookie) => cookie.name === 'session')).toBe(true);\n});",
      },
      remember: "workers controls parallelism. A fresh context still isolates cookies unless you pass storageState.",
      fixedCode: {
        lang: "ts",
        source: "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  workers: 1,\n  use: {\n    storageState: 'playwright/.auth/user.json',\n  },\n});",
      },
    },
  }
] satisfies Question[];
