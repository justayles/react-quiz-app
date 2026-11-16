import type { Question } from '../types';

export const rtlQuestions = [
  {
    id: "rtl-001",
    tech: "rtl",
    topic: "queries",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Which query should you try first when the element is exposed to assistive technology?",
    options: [
      "getByRole, because it matches the role and accessible name a person can perceive",
      "getByTestId, because a test id stays stable when the visible label changes",
      "getByText, because text is always checked before role and label",
      "container.querySelector, because the container is the only node render searches",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Start with getByRole. It asks for the role and the accessible name a person can perceive.",
      why: "A role is the kind of control in the accessibility tree, the structure assistive technology reads. An accessible name is the label that technology announces, taken from visible text, a connected label, or aria-label. getByRole asks for both, so the test follows the same information a person uses. After role, prefer the label text, then the placeholder, then other visible text, then the current form value. getByTestId is the escape hatch when those queries do not fit, because a person cannot see or hear a test id. A class name and component state are invisible in that same way, so they are not how you find the element.",
      wrong: [
        {
          option: "getByTestId, because a test id stays stable when the visible label changes",
          reason: "A test id is invisible to a person. It is the escape hatch for the rare case where role, label, placeholder, text, and display value do not fit.",
        },
        {
          option: "getByText, because text is always checked before role and label",
          reason: "Visible text comes after role, label, and placeholder. Role is the first choice because it matches how assistive technology reads the control.",
        },
        {
          option: "container.querySelector, because the container is the only node render searches",
          reason: "querySelector can see styling hooks a person never uses. screen queries document.body, and the first query should still be getByRole.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('offers save on the profile form', () => {\n  render(<ProfileForm />);\n  const save = screen.getByRole('button', { name: 'Save' });\n  expect(save).toBeEnabled();\n  expect(screen.getByRole('textbox', { name: 'Display name' })).toBeInTheDocument();\n});",
      },
      remember: "Reach for getByRole before label, placeholder, text, display value, or test id.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-002",
    tech: "rtl",
    topic: "queries",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "This test wants to prove that no status message is showing. What is the bug?",
    code: {
      lang: 'tsx',
      source: "render(<Editor />);\nexpect(screen.getByRole('status')).not.toBeInTheDocument();",
    },
    options: [
      "not.toBeInTheDocument passes when the status is present, so the matcher is reversed",
      "getByRole throws when it finds nothing, so the absence check never reaches the matcher",
      "screen searches only the render container, so a status in document.body is ignored",
      "toBeInTheDocument accepts only test ids, so a role query cannot use it",
    ],
    correctIndex: 1,
    explanation: {
      answer: "getByRole throws when the status is missing, so the test fails before the absence matcher can pass.",
      why: "Walk the two lines in order. render mounts Editor. The next line calls getByRole for a status. getBy throws when it finds zero matches and also when it finds more than one. Here the status is absent, so the call throws before expect runs. The matcher not.toBeInTheDocument never gets a chance to pass. If the status were present, the matcher would fail too, so this line cannot pass in either case. queryBy returns null when nothing matches, which is what an absence check needs. It still throws if more than one status matches, because a single-element query must stay unambiguous.",
      wrong: [
        {
          option: "not.toBeInTheDocument passes when the status is present, so the matcher is reversed",
          reason: "The matcher direction is fine. The failure happens earlier: getByRole throws on zero matches, so expect never runs.",
        },
        {
          option: "screen searches only the render container, so a status in document.body is ignored",
          reason: "screen queries document.body, which includes the default render container. The bug is the getBy query used for an absence check.",
        },
        {
          option: "toBeInTheDocument accepts only test ids, so a role query cannot use it",
          reason: "toBeInTheDocument comes from jest-dom and checks that a node is in the document. It is not limited to test ids.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('does not show a status before save', () => {\n  render(<Editor />);\n  expect(screen.queryByRole('status')).not.toBeInTheDocument();\n});",
      },
      remember: "Assert absence with queryBy, which returns null when nothing matches.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('does not show a status before save', () => {\n  render(<Editor />);\n  const status = screen.queryByRole('status');\n  expect(status).toBeNull();\n});",
      },
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-003",
    tech: "rtl",
    topic: "queries",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "No alert is rendered. What is alerts after this query?",
    code: {
      lang: 'tsx',
      source: "render(<QuietPage />);\nconst alerts = screen.queryAllByRole('alert');",
    },
    options: [
      "It throws, because every query throws when the count is zero",
      "It is null, because a missing role is always returned as null",
      "It is an empty array",
      "It is undefined, so the test can supply its own default",
    ],
    correctIndex: 2,
    explanation: {
      answer: "alerts is an empty array. queryAllBy returns [] when nothing matches.",
      why: "queryAllBy is the many-element query that does not throw when nothing matches. QuietPage renders no alert, so queryAllByRole returns an empty array and the length is zero. getAllBy would throw on that same empty result, because the get form requires at least one match. The singular queryBy would return null, not an array. An empty array is a normal result you can assert on, and it means the role is absent.",
      wrong: [
        {
          option: "It throws, because every query throws when the count is zero",
          reason: "getAllBy throws when nothing matches. queryAllBy is the form that stays quiet and returns an empty array.",
        },
        {
          option: "It is null, because a missing role is always returned as null",
          reason: "null is the zero-match result of the singular queryBy. The All form returns an array.",
        },
        {
          option: "It is undefined, so the test can supply its own default",
          reason: "A missing match is an empty array, not undefined. You can assert that the length is zero.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('starts with no alerts', () => {\n  render(<QuietPage />);\n  const alerts = screen.queryAllByRole('alert');\n  expect(alerts).toHaveLength(0);\n});",
      },
      remember: "queryAllBy returns an empty array when nothing matches.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-004",
    tech: "rtl",
    topic: "queries",
    kind: "concept",
    difficulty: "expert",
    prompt: "getByRole is called with a name option. What does that option compare?",
    options: [
      "The id attribute of the element",
      "The HTML name attribute submitted with a form control",
      "The CSS class list on the element",
      "The accessible name, from the label, the text, or aria-label",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The name option compares the accessible name, not the id or the form name.",
      why: "The name option filters by the accessible name. That name is the string assistive technology would announce. It is computed from a connected label, from the text inside the control, or from aria-label. The id attribute is only the hook that connects a label to a control. The HTML name attribute is the key submitted with the form, and it is a different string. A class name is styling, not a name in the accessibility tree. Passing the id or the form name to the name option misses the control even when a person can use it.",
      wrong: [
        {
          option: "The id attribute of the element",
          reason: "The id only connects a label to a control. The name option does not compare that attribute.",
        },
        {
          option: "The HTML name attribute submitted with a form control",
          reason: "The HTML name attribute is the key submitted with the form. It is a different string from the accessible name.",
        },
        {
          option: "The CSS class list on the element",
          reason: "A class list is styling. A person does not find a control by its class, and getByRole does not either.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds the email field by its label', () => {\n  render(<EmailForm />);\n  const email = screen.getByRole('textbox', { name: 'Email address' });\n  expect(email).toHaveValue('');\n});",
      },
      remember: "The name option is the accessible name, not the id.",
      docs: "https://testing-library.com/docs/queries/byrole",
    },
  },
  {
    id: "rtl-005",
    tech: "rtl",
    topic: "queries",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The test fails to find the email field. What is the bug?",
    code: {
      lang: 'tsx',
      source: "render(\n  <form>\n    <label htmlFor='user-email'>Email address</label>\n    <input id='user-email' name='email' />\n  </form>,\n);\nscreen.getByRole('textbox', { name: 'user-email' });",
    },
    options: [
      "The name option is compared with the id, but the accessible name is Email address",
      "textbox is the wrong role, because an input with no type has no role",
      "htmlFor must copy the name attribute, so this label is not connected",
      "getByRole skips form controls, so the field needs a test id",
    ],
    correctIndex: 0,
    explanation: {
      answer: "The name option looks for the accessible name Email address, not the id user-email.",
      why: "Walk the markup from top to bottom. The label text is Email address, and htmlFor matches the input id user-email, so the label is connected. The input also has a form name of email, which is the value submitted with the form, not the name a person hears. The input has no type, so its role is textbox. getByRole then filters with name user-email. That option compares the accessible name, which is Email address, not the id. The query throws because no textbox has that accessible name. Ask for Email address instead.",
      wrong: [
        {
          option: "textbox is the wrong role, because an input with no type has no role",
          reason: "An input with no type has the role textbox. The role is right, and the name filter is what misses.",
        },
        {
          option: "htmlFor must copy the name attribute, so this label is not connected",
          reason: "htmlFor must match the id, and it does. The label is connected. The form name attribute is a separate string.",
        },
        {
          option: "getByRole skips form controls, so the field needs a test id",
          reason: "getByRole is the preferred way to find a textbox. A test id is only the escape hatch.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds the email field by its label', () => {\n  render(<EmailForm />);\n  const email = screen.getByRole('textbox', { name: 'Email address' });\n  expect(email).toBeInTheDocument();\n});",
      },
      remember: "Match getByRole name to the label text, not the id.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds the email field by its label', () => {\n  render(\n    <form>\n      <label htmlFor='user-email'>Email address</label>\n      <input id='user-email' name='email' />\n    </form>,\n  );\n  expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();\n});",
      },
      docs: "https://testing-library.com/docs/queries/byrole",
    },
  },
  {
    id: "rtl-006",
    tech: "rtl",
    topic: "queries",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Two buttons are named Save. What does this query do?",
    code: {
      lang: 'tsx',
      source: "render(\n  <div>\n    <button>Save</button>\n    <button>Save</button>\n  </div>,\n);\nscreen.getByRole('button', { name: 'Save' });",
    },
    options: [
      "It returns the first Save button and ignores the second",
      "It throws, because getBy requires exactly one match",
      "It returns an array of both Save buttons",
      "It returns null and lets the assertion decide",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The query throws because getBy requires exactly one match and two Save buttons were found.",
      why: "The tree contains two buttons, and the accessible name of each button is the text Save. getByRole looks for exactly one button with that name. Finding two is a failure, so the call throws and does not return an element. It does not pick the first match. getAllByRole is the form that returns the array of every match, and it throws only when the array would be empty. queryByRole would also throw here, because the singular query form throws when more than one element matches.",
      wrong: [
        {
          option: "It returns the first Save button and ignores the second",
          reason: "getBy does not pick the first match. More than one match is a hard failure.",
        },
        {
          option: "It returns an array of both Save buttons",
          reason: "An array is the result of getAllBy or queryAllBy. The singular getBy throws instead.",
        },
        {
          option: "It returns null and lets the assertion decide",
          reason: "null is the zero-match result of queryBy. Two matches make getBy throw, not return null.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('lists two save actions', () => {\n  render(<DualSave />);\n  const saves = screen.getAllByRole('button', { name: 'Save' });\n  expect(saves).toHaveLength(2);\n});",
      },
      remember: "getBy throws when it finds zero matches or more than one.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-007",
    tech: "rtl",
    topic: "queries",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does hidden: true change when you pass it to getByRole?",
    options: [
      "It matches only elements whose CSS visibility is hidden",
      "It drops elements that already have an accessible name",
      "It includes elements that are not exposed to the accessibility tree, such as a script or a hidden input in some cases",
      "It ignores the role and returns every node in the container",
    ],
    correctIndex: 2,
    explanation: {
      answer: "hidden: true includes elements that are not exposed to the accessibility tree. Prefer what a person can perceive.",
      why: "The accessibility tree is the structure assistive technology uses. It leaves out nodes a person cannot perceive, such as a script, a style tag, or a control the page has hidden. By default, getByRole searches only that tree, so those nodes are skipped. hidden: true widens the search to include elements that are not exposed, such as a script or a hidden input in some cases. That flag is a tool for a rare case, not the usual query. Prefer a query for what a person can see or hear, and leave hidden off.",
      wrong: [
        {
          option: "It matches only elements whose CSS visibility is hidden",
          reason: "The flag is wider than one CSS property. It includes elements the accessibility tree normally leaves out.",
        },
        {
          option: "It drops elements that already have an accessible name",
          reason: "It does not remove named elements. It adds elements that were excluded from the accessibility tree.",
        },
        {
          option: "It ignores the role and returns every node in the container",
          reason: "The role check stays on. hidden only changes which elements are eligible for that role check.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('reads the message a person can see', () => {\n  render(<Notice />);\n  const status = screen.getByRole('status');\n  expect(status).toHaveTextContent('Saved');\n});",
      },
      remember: "Leave hidden off and test what a person can perceive.",
      docs: "https://testing-library.com/docs/queries/byrole",
    },
  },
  {
    id: "rtl-008",
    tech: "rtl",
    topic: "queries",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Inbox and Archive each render a Delete button. What is the bug?",
    code: {
      lang: 'tsx',
      source: "render(\n  <div>\n    <section aria-label='Inbox'>\n      <button>Delete</button>\n    </section>\n    <section aria-label='Archive'>\n      <button>Delete</button>\n    </section>\n  </div>,\n);\nscreen.getByRole('button', { name: 'Delete' });",
    },
    options: [
      "Delete is not a valid accessible name, so the buttons cannot be found",
      "getByRole looks only inside the first section, so Archive is never searched",
      "within searches document.body and ignores the element you pass it",
      "Two Delete buttons match, so getByRole throws instead of returning one",
    ],
    correctIndex: 3,
    explanation: {
      answer: "Two Delete buttons match, so getByRole throws. Search inside one region with within.",
      why: "Each section has an accessible name, Inbox or Archive, so each section has the role region. Inside each region is a button whose accessible name is Delete. screen.getByRole searches the whole document and finds both buttons. getBy throws when it finds more than one match, so the test stops there. within takes one element and returns queries that search only inside it. Take the Inbox region first, then getByRole for Delete inside that region. The Archive button is no longer a second match.",
      wrong: [
        {
          option: "Delete is not a valid accessible name, so the buttons cannot be found",
          reason: "The button text Delete is a valid accessible name. The failure is that two buttons share it.",
        },
        {
          option: "getByRole looks only inside the first section, so Archive is never searched",
          reason: "screen queries document.body, so both sections are searched. That is why two buttons match.",
        },
        {
          option: "within searches document.body and ignores the element you pass it",
          reason: "within limits the following queries to the element you pass. It does not search the whole body.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen, within } from '@testing-library/react';\n\ntest('deletes a message from the inbox only', () => {\n  render(<Mailboxes />);\n  const inbox = screen.getByRole('region', { name: 'Inbox' });\n  const remove = within(inbox).getByRole('button', { name: 'Delete' });\n  expect(remove).toBeEnabled();\n});",
      },
      remember: "When two controls share a name, use within to search inside one region.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen, within } from '@testing-library/react';\n\ntest('deletes a message from the inbox only', () => {\n  render(<Mailboxes />);\n  const inbox = screen.getByRole('region', { name: 'Inbox' });\n  expect(within(inbox).getByRole('button', { name: 'Delete' })).toBeEnabled();\n});",
      },
      docs: "https://testing-library.com/docs/dom-testing-library/api-within",
    },
  },
  {
    id: "rtl-009",
    tech: "rtl",
    topic: "queries",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Ready is applied after a timer. What does the getByText line do?",
    code: {
      lang: 'tsx',
      source: "import { useEffect, useState } from 'react';\nimport { render, screen } from '@testing-library/react';\n\nfunction Panel() {\n  const [label, setLabel] = useState('Loading');\n  useEffect(() => {\n    const id = setTimeout(() => setLabel('Ready'), 50);\n    return () => clearTimeout(id);\n  }, []);\n  return <p>{label}</p>;\n}\n\nrender(<Panel />);\nscreen.getByText('Ready');",
    },
    options: [
      "It throws immediately, because Ready is not in the document yet",
      "It waits up to one second and then returns the Ready paragraph",
      "It returns null, and the test continues without an error",
      "It retries through the timer, because render waits for every timeout",
    ],
    correctIndex: 0,
    explanation: {
      answer: "getByText throws immediately because Ready appears only after the timer fires.",
      why: "Panel starts with the text Loading. render mounts it and flushes the effect, so the timeout is scheduled, but fifty milliseconds have not passed and the text is still Loading. getByText does not retry. It throws immediately when it finds zero matches, which is what happens on the Ready line. A later timer is an update that has not happened yet. findByText is the query that returns a promise, retries until the timeout, and resolves when Ready appears. Use that when the element shows up after an update.",
      wrong: [
        {
          option: "It waits up to one second and then returns the Ready paragraph",
          reason: "getBy does not retry. findBy is the query that waits and returns a promise.",
        },
        {
          option: "It returns null, and the test continues without an error",
          reason: "null is what queryBy returns for zero matches. getBy throws instead.",
        },
        {
          option: "It retries through the timer, because render waits for every timeout",
          reason: "render flushes the effect, so the timer is scheduled, but it does not wait for that timer to fire.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('waits until the panel is ready', async () => {\n  render(<Panel />);\n  expect(screen.getByText('Loading')).toBeInTheDocument();\n  expect(await screen.findByText('Ready')).toBeInTheDocument();\n});",
      },
      remember: "getBy throws on a missing element. Use findBy when it appears after an update.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-010",
    tech: "rtl",
    topic: "queries",
    kind: "scenario",
    difficulty: "expert",
    prompt: "You need the test to pass only when a success status is absent. Which query belongs in that assertion?",
    options: [
      "getByRole('status'), because a thrown error means the status is absent",
      "queryByRole('status'), because it returns null when no status is rendered",
      "findByRole('status'), because the promise resolves to null when the status is missing",
      "getAllByRole('status'), because an empty array means the status is absent",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Use queryByRole. It returns null when the status is missing, so the absence assertion can pass.",
      why: "An absence check needs a query that stays quiet when the element is missing. queryByRole returns null in that case, and expect on that null can assert it is not in the document. getByRole throws on zero matches, so the test fails even though the status is correctly gone. getAllByRole also throws when it finds nothing. findByRole returns a promise and retries. If the status never appears, the promise rejects instead of resolving to null. Rejection is a failed lookup, not an absence result.",
      wrong: [
        {
          option: "getByRole('status'), because a thrown error means the status is absent",
          reason: "getBy throws when it finds nothing. A thrown error fails the test, so it cannot prove the status is gone.",
        },
        {
          option: "findByRole('status'), because the promise resolves to null when the status is missing",
          reason: "findBy retries and rejects if the status never appears. It does not resolve to null.",
        },
        {
          option: "getAllByRole('status'), because an empty array means the status is absent",
          reason: "getAllBy throws when it finds nothing. queryAllBy is the form that returns an empty array.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('hides the success message at first', () => {\n  render(<Page />);\n  const status = screen.queryByRole('status');\n  expect(status).not.toBeInTheDocument();\n});",
      },
      remember: "queryBy returns null for zero matches. findBy rejects instead.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-011",
    tech: "rtl",
    topic: "queries",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The button renders, but screen cannot find it. What is the bug?",
    code: {
      lang: 'tsx',
      source: "const container = document.createElement('div');\nrender(<SaveButton />, { container });\nscreen.getByRole('button', { name: 'Save' });",
    },
    options: [
      "render ignores container and always mounts a second copy into a hidden frame",
      "getByRole cannot find a button unless the button has a test id",
      "screen queries document.body, and this container was never attached to the document",
      "A custom container removes the button role, so the accessible name is lost",
    ],
    correctIndex: 2,
    explanation: {
      answer: "screen queries document.body, and the custom container was never attached to the document.",
      why: "render returns the container it mounted into, plus rerender and unmount. By default that container is a div placed on document.body, and screen queries document.body, so screen can see the button. This test creates its own div and never appends that div to the document. The button is rendered into a node that is not on document.body. screen still queries document.body, so getByRole finds nothing and throws. The queries returned by render are bound to that container, which is why they can see the button when screen cannot. The usual fix is to let render attach its own container, then query with screen.",
      wrong: [
        {
          option: "render ignores container and always mounts a second copy into a hidden frame",
          reason: "render uses the container you pass. This container is real, but it was never inserted into document.body.",
        },
        {
          option: "getByRole cannot find a button unless the button has a test id",
          reason: "A button with the text Save has a role and an accessible name. A test id is not required.",
        },
        {
          option: "A custom container removes the button role, so the accessible name is lost",
          reason: "The container does not strip roles. The button is simply outside the document that screen searches.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds the save button in the document', () => {\n  render(<SaveButton />);\n  const save = screen.getByRole('button', { name: 'Save' });\n  expect(save).toBeEnabled();\n});",
      },
      remember: "screen queries document.body. Leave the container on the document.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds save after the container is attached', () => {\n  const container = document.createElement('div');\n  document.body.appendChild(container);\n  render(<SaveButton />, { container });\n  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();\n});",
      },
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-012",
    tech: "rtl",
    topic: "queries",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Two Save buttons are rendered. What does queryByRole do?",
    code: {
      lang: 'tsx',
      source: "render(\n  <div>\n    <button>Save</button>\n    <button>Save</button>\n  </div>,\n);\nscreen.queryByRole('button', { name: 'Save' });",
    },
    options: [
      "It returns an array of both buttons",
      "It returns null, because the match count is not exactly one",
      "It returns the first button and skips the second",
      "It throws, because more than one element matches",
    ],
    correctIndex: 3,
    explanation: {
      answer: "queryByRole throws because more than one Save button matches.",
      why: "queryBy is still a single-element query. Two Save buttons mean more than one match, so queryByRole throws. It returns null only when the count is zero. It does not return the first button, and it does not return an array. queryAllByRole is the form that returns every match and returns an empty array when nothing matches. Use that, or getAllByRole, when two buttons share a name. Use within when you meant only one of them.",
      wrong: [
        {
          option: "It returns an array of both buttons",
          reason: "An array is the result of queryAllBy. The singular queryBy does not collect every match.",
        },
        {
          option: "It returns null, because the match count is not exactly one",
          reason: "queryBy returns null only when nothing matches. More than one match is a thrown error.",
        },
        {
          option: "It returns the first button and skips the second",
          reason: "queryBy does not choose the first element. Two matches make it throw.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('counts the save buttons', () => {\n  render(<DualSave />);\n  const saves = screen.queryAllByRole('button', { name: 'Save' });\n  expect(saves).toHaveLength(2);\n});",
      },
      remember: "queryBy returns null for zero matches and throws when it finds more than one.",
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
  {
    id: "rtl-013",
    tech: "rtl",
    topic: "user-events",
    kind: "concept",
    difficulty: "advanced",
    prompt: "In @testing-library/user-event v14, how should a test click a button?",
    options: [
      "Call userEvent.setup(), then await the click method on that session",
      "Call fireEvent.click, because user-event only moves the pointer and never clicks",
      "Call user.click without setup and without await, because click is synchronous",
      "Call userEvent.dispatch('click'), which returns the clicked element",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Call userEvent.setup(), then await user.click on the button.",
      why: "user-event v14 asks you to create a session with userEvent.setup() before you interact. A session is the object that remembers pointer and keyboard state across calls. click, type, and keyboard on that session return a promise, which is a result that finishes later. await waits until the full interaction and the React updates it caused have settled. fireEvent.click is a different API: it dispatches one click and skips the rest of the interaction, including hover, pointer down, and focus. Calling click without await lets the test continue while that promise is still running.",
      wrong: [
        {
          option: "Call fireEvent.click, because user-event only moves the pointer and never clicks",
          reason: "fireEvent.click dispatches one click and skips hover, pointer down, and focus. user.click performs the whole interaction.",
        },
        {
          option: "Call user.click without setup and without await, because click is synchronous",
          reason: "click returns a promise. Skip the await and the test continues while the interaction is still running.",
        },
        {
          option: "Call userEvent.dispatch('click'), which returns the clicked element",
          reason: "There is no dispatch helper to call. The session from setup exposes click, and that method returns a promise.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('saves when the button is clicked', async () => {\n  const user = userEvent.setup();\n  render(<ProfileForm />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(await screen.findByRole('status')).toHaveTextContent('Saved');\n});",
      },
      remember: "setup() first, then await user.click. The click method returns a promise.",
      docs: "https://testing-library.com/docs/user-event/intro",
    },
  },
  {
    id: "rtl-014",
    tech: "rtl",
    topic: "user-events",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The menu is supposed to open when Tools is clicked. The test never sees Tool menu. What is the bug?",
    code: {
      lang: 'tsx',
      source: "function Tools() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div>\n      <button onFocus={() => setOpen(true)}>Tools</button>\n      {open ? <p>Tool menu</p> : null}\n    </div>\n  );\n}\n\nrender(<Tools />);\nfireEvent.click(screen.getByRole('button', { name: 'Tools' }));\nexpect(screen.getByText('Tool menu')).toBeInTheDocument();",
    },
    options: [
      "fireEvent.click focuses the button and then clicks, so the menu should open",
      "fireEvent.click dispatches only a click, so the focus handler that opens the menu never runs",
      "Tools is not the accessible name, because the name option reads the id",
      "onFocus cannot update state, so the component must store the flag on the button",
    ],
    correctIndex: 1,
    explanation: {
      answer: "fireEvent.click never focuses the button, so the onFocus handler that opens the menu does not run.",
      why: "Tools starts closed. The button opens the menu in onFocus, and a real click focuses a button as part of the interaction. Walk the test: render mounts the closed menu, getByRole finds Tools, then fireEvent.click runs. fireEvent.click dispatches one click and skips the rest of the interaction, including hover, pointer down, and focus. The focus handler never runs, open stays false, and Tool menu is not rendered, so getByText throws. user.click performs that pointer sequence, including focus, so the menu opens. Await that click.",
      wrong: [
        {
          option: "fireEvent.click focuses the button and then clicks, so the menu should open",
          reason: "fireEvent.click does not focus the button. It dispatches one click and skips hover, pointer down, and focus.",
        },
        {
          option: "Tools is not the accessible name, because the name option reads the id",
          reason: "The accessible name is the button text Tools. The query finds the button. The click is what skips focus.",
        },
        {
          option: "onFocus cannot update state, so the component must store the flag on the button",
          reason: "onFocus can update state. The handler never runs because this click does not focus the button.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('opens the tool menu on click', async () => {\n  const user = userEvent.setup();\n  render(<Tools />);\n  await user.click(screen.getByRole('button', { name: 'Tools' }));\n  expect(screen.getByText('Tool menu')).toBeInTheDocument();\n});",
      },
      remember: "fireEvent.click dispatches one click and skips focus. Await user.click for the real sequence.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('opens the tool menu on click', async () => {\n  const user = userEvent.setup();\n  render(<Tools />);\n  const tools = screen.getByRole('button', { name: 'Tools' });\n  await user.click(tools);\n  expect(screen.getByText('Tool menu')).toBeInTheDocument();\n});",
      },
      docs: "https://testing-library.com/docs/user-event/intro",
    },
  },
  {
    id: "rtl-015",
    tech: "rtl",
    topic: "user-events",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The textbox is focusable. What does the awaited type call do?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<input aria-label='City' />);\nawait user.type(screen.getByRole('textbox', { name: 'City' }), 'Paris');",
    },
    options: [
      "It leaves the value empty, because type only hovers over the textbox",
      "It throws, because a session from setup() cannot type into a textbox",
      "It clicks the textbox and then the value becomes Paris",
      "It writes Paris in one change event and never focuses the textbox",
    ],
    correctIndex: 2,
    explanation: {
      answer: "type clicks the textbox and then types, so the value becomes Paris.",
      why: "setup creates a session, and render mounts a focusable textbox whose accessible name is City. The accessible name comes from aria-label. user.type clicks that element and then types each character. The click focuses the textbox because an input is focusable. The characters then go into the focused field, so the value becomes Paris. This is not a single change event, and it is not hover alone. The await matters because type returns a promise and the value is ready after that promise finishes.",
      wrong: [
        {
          option: "It leaves the value empty, because type only hovers over the textbox",
          reason: "type does more than hover. It clicks a focusable textbox and then types each character.",
        },
        {
          option: "It throws, because a session from setup() cannot type into a textbox",
          reason: "setup() is the recommended way to type. The session can type into a focusable textbox.",
        },
        {
          option: "It writes Paris in one change event and never focuses the textbox",
          reason: "type does not collapse the text into one change event. It clicks, which focuses the input, and then types.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('fills the city field', async () => {\n  const user = userEvent.setup();\n  render(<CityField />);\n  await user.type(screen.getByRole('textbox', { name: 'City' }), 'Paris');\n  expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();\n});",
      },
      remember: "user.type clicks a focusable element and then types. Await the promise.",
      docs: "https://testing-library.com/docs/user-event/keyboard",
    },
  },
  {
    id: "rtl-016",
    tech: "rtl",
    topic: "user-events",
    kind: "concept",
    difficulty: "expert",
    prompt: "Why is user.type a poor way to enter text into a plain div that has no tabindex and is not content editable?",
    options: [
      "type accepts only digits, so letters are discarded",
      "type sends one change event and never tries to focus",
      "type requires a test id on the target before it will run",
      "type clicks the element and then types, and that click does not focus an element that is not focusable",
    ],
    correctIndex: 3,
    explanation: {
      answer: "type clicks and then types, and a click does not focus a plain div that is not focusable.",
      why: "user.type always clicks its target and then types. A click focuses the element only when the element is focusable, such as an input, a textarea, or a button. A plain div with no tabindex is not focusable, and it is not content editable, so the click does not move focus there. The keystrokes that follow have nowhere useful to land, and the text does not show up in the div. Put the text in a textbox and use type on that textbox. If the right element is already focused, use keyboard, which sends keys to the focused element and does not click first.",
      wrong: [
        {
          option: "type accepts only digits, so letters are discarded",
          reason: "type can enter letters. The target is the problem, not the characters.",
        },
        {
          option: "type sends one change event and never tries to focus",
          reason: "type does try to focus, by clicking first. A plain div is not focusable, so the click does not land there.",
        },
        {
          option: "type requires a test id on the target before it will run",
          reason: "type does not look for a test id. It needs a focusable element, such as a textbox.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('types into the city field', async () => {\n  const user = userEvent.setup();\n  render(<CityField />);\n  const city = screen.getByRole('textbox', { name: 'City' });\n  await user.type(city, 'Paris');\n  expect(city).toHaveValue('Paris');\n});",
      },
      remember: "type clicks, then types. Use it on a focusable element such as a textbox.",
      docs: "https://testing-library.com/docs/user-event/keyboard",
    },
  },
  {
    id: "rtl-017",
    tech: "rtl",
    topic: "user-events",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "This Vitest test uses fake timers and then awaits type. The await never finishes. What is the bug?",
    code: {
      lang: 'tsx',
      source: "vi.useFakeTimers();\nconst user = userEvent.setup();\nrender(<NameField />);\nawait user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');",
    },
    options: [
      "Fake timers are on, but setup was not given advanceTimers, so the typing delays never finish",
      "type cannot target a textbox, so the test must dispatch a change event instead",
      "vi.useFakeTimers clears document.body, so the textbox is gone before type runs",
      "setup() is illegal before render, so the session has no document",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Fake timers freeze the typing delays, and setup was not given advanceTimers to move the clock.",
      why: "vi.useFakeTimers switches Vitest to fake timers. Fake timers freeze setTimeout until the test advances the clock. user-event waits between keystrokes through those timers. The default delay is zero milliseconds, and that still schedules a timer. setup() was called without advanceTimers, so nobody advances the clock, and the await on type never finishes. Pass advanceTimers: vi.advanceTimersByTime, or jest.advanceTimersByTime under Jest. That callback is what lets the typing delays finish.",
      wrong: [
        {
          option: "type cannot target a textbox, so the test must dispatch a change event instead",
          reason: "type is the right method for a focusable textbox. The hang comes from frozen timers, not from the role.",
        },
        {
          option: "vi.useFakeTimers clears document.body, so the textbox is gone before type runs",
          reason: "Fake timers freeze the clock. They do not remove the nodes render just mounted.",
        },
        {
          option: "setup() is illegal before render, so the session has no document",
          reason: "Calling setup before render is the recommended order. The missing piece is advanceTimers.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('types the name with fake timers', async () => {\n  vi.useFakeTimers();\n  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });\n  render(<NameField />);\n  const name = screen.getByRole('textbox', { name: 'Name' });\n  await user.type(name, 'Ada');\n  expect(name).toHaveValue('Ada');\n});",
      },
      remember: "With fake timers, pass advanceTimers to userEvent.setup or the typing delays never finish.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('types the name with fake timers', async () => {\n  vi.useFakeTimers();\n  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });\n  render(<NameField />);\n  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');\n  expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();\n});",
      },
      docs: "https://testing-library.com/docs/user-event/options",
    },
  },
  {
    id: "rtl-018",
    tech: "rtl",
    topic: "user-events",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Both lines target the same Save button. What does user.click do that fireEvent.click does not?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<SaveButton />);\nawait user.click(screen.getByRole('button', { name: 'Save' }));\nfireEvent.click(screen.getByRole('button', { name: 'Save' }));",
    },
    options: [
      "user.click fires hover only, and the click event is left to fireEvent",
      "user.click also hovers, presses the pointer, and focuses, while fireEvent.click dispatches one click",
      "user.click returns the button text, while fireEvent.click returns a promise",
      "fireEvent.click retries until the button is enabled, while user.click does not",
    ],
    correctIndex: 1,
    explanation: {
      answer: "user.click hovers, presses the pointer, and focuses before the click. fireEvent.click dispatches only the click.",
      why: "Read the two calls in order. user.click is a session method. It hovers the button, presses the pointer down, focuses the button, and then clicks. That is the sequence a person produces. fireEvent.click dispatches one click event and skips the rest, including hover, pointer down, and focus. Handlers for focus or mouse down run for the first call and do not run for the second. user.click also returns a promise, which this test awaits. It does not return the button text.",
      wrong: [
        {
          option: "user.click fires hover only, and the click event is left to fireEvent",
          reason: "user.click does click. The extra work is the hover, pointer press, and focus that lead up to that click.",
        },
        {
          option: "user.click returns the button text, while fireEvent.click returns a promise",
          reason: "user.click returns a promise, not the button text. fireEvent.click does not return that promise.",
        },
        {
          option: "fireEvent.click retries until the button is enabled, while user.click does not",
          reason: "Neither call retries. findBy and waitFor are the utilities that retry.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('clicks save the way a person would', async () => {\n  const user = userEvent.setup();\n  render(<SaveButton />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(await screen.findByRole('status')).toHaveTextContent('Saved');\n});",
      },
      remember: "user.click performs hover, pointer down, and focus. fireEvent.click dispatches one click.",
      docs: "https://testing-library.com/docs/user-event/intro",
    },
  },
  {
    id: "rtl-019",
    tech: "rtl",
    topic: "user-events",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "The query field is already focused. You want to press Enter without clicking the field again. Which call does that?",
    options: [
      "await user.type(document.body, '{Enter}'), because type always sends keys to the body",
      "fireEvent.click(field), because a click is how Enter is encoded",
      "await user.keyboard('{Enter}'), because keyboard sends keys to the element that is already focused",
      "await user.type(field, '{Enter}'), because type does not click before it sends keys",
    ],
    correctIndex: 2,
    explanation: {
      answer: "await user.keyboard with Enter. keyboard sends keys to the element that already has focus.",
      why: "keyboard sends keys to the element that already has focus. The field is focused, so await user.keyboard with the Enter key presses Enter there and does not click again. Curly braces around Enter name that special key. type is the wrong tool for this goal because type clicks the element before it types. Clicking again is the step we want to avoid. fireEvent.click dispatches a click, not the Enter key. Typing at document.body would aim the click and the keys at the body.",
      wrong: [
        {
          option: "await user.type(document.body, '{Enter}'), because type always sends keys to the body",
          reason: "type clicks its target and then types. Pointing it at document.body does not press Enter in the focused field.",
        },
        {
          option: "fireEvent.click(field), because a click is how Enter is encoded",
          reason: "A click is a pointer interaction, not the Enter key. fireEvent.click also skips the rest of a real click.",
        },
        {
          option: "await user.type(field, '{Enter}'), because type does not click before it sends keys",
          reason: "type clicks the element before it types. That extra click is the step this test is trying to avoid.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('submits from the focused field', async () => {\n  const user = userEvent.setup();\n  render(<SearchBox />);\n  const query = screen.getByRole('textbox', { name: 'Query' });\n  query.focus();\n  await user.keyboard('{Enter}');\n  expect(await screen.findByRole('status')).toHaveTextContent('Searched');\n});",
      },
      remember: "keyboard types into the focused element. type clicks its target first.",
      docs: "https://testing-library.com/docs/user-event/keyboard",
    },
  },
  {
    id: "rtl-020",
    tech: "rtl",
    topic: "user-events",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The count should become Count 1 after Add is clicked. What is the bug?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<Counter />);\nuser.click(screen.getByRole('button', { name: 'Add' }));\nexpect(screen.getByText('Count 1')).toBeInTheDocument();",
    },
    options: [
      "setup() must run after the click, or the session has no pointer",
      "Add is read from the id, so the button query does not match the label",
      "getByText waits for Count 1, so a missing await cannot fail this test",
      "click returns a promise, and the assertion runs before that interaction finishes",
    ],
    correctIndex: 3,
    explanation: {
      answer: "click returns a promise. The assertion runs before that interaction finishes.",
      why: "setup creates a session and render mounts Counter. user.click returns a promise. The test ignores that promise and immediately calls getByText. The assertion can run before the click finishes, so Count 1 may not exist yet and getByText throws. getBy does not retry. A later state update from the abandoned promise can also arrive after the test has moved on. React then warns that the update was not wrapped in act. act is the helper that flushes renders before an assertion. Await the click, then assert.",
      wrong: [
        {
          option: "setup() must run after the click, or the session has no pointer",
          reason: "setup before the click is the recommended order. The bug is that the returned promise is ignored.",
        },
        {
          option: "Add is read from the id, so the button query does not match the label",
          reason: "The name option uses the accessible name Add, which is the button text. The query can find the button.",
        },
        {
          option: "getByText waits for Count 1, so a missing await cannot fail this test",
          reason: "getByText does not retry. It throws immediately if Count 1 is not there yet.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('adds one to the count', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  await user.click(screen.getByRole('button', { name: 'Add' }));\n  expect(screen.getByText('Count 1')).toBeInTheDocument();\n});",
      },
      remember: "Await user.click. It returns a promise, and getBy does not wait for it.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('adds one to the count', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  await user.click(screen.getByRole('button', { name: 'Add' }));\n  expect(screen.getByRole('status')).toHaveTextContent('Count 1');\n});",
      },
      docs: "https://testing-library.com/docs/user-event/intro",
    },
  },
  {
    id: "rtl-021",
    tech: "rtl",
    topic: "user-events",
    kind: "concept",
    difficulty: "advanced",
    prompt: "How do user.keyboard and user.type differ?",
    options: [
      "keyboard sends keys to whatever is already focused, and type clicks its target before typing",
      "keyboard clicks the target first, and type never moves focus",
      "Both send one change event and skip the keydown and keyup events",
      "type is the method that works on an element that is not focusable",
    ],
    correctIndex: 0,
    explanation: {
      answer: "keyboard types into the focused element. type clicks its target and then types.",
      why: "type takes an element, clicks it, and then types. The click is how type focuses a focusable control. keyboard does not click. It sends keys, including keys such as Enter, to whatever element is already focused. Use type when you have a textbox that still needs the click. Use keyboard when focus is already in the right place. Neither method is a single change event, and type does not work well on an element that is not focusable.",
      wrong: [
        {
          option: "keyboard clicks the target first, and type never moves focus",
          reason: "That swaps the two methods. type is the one that clicks first. keyboard leaves focus where it is.",
        },
        {
          option: "Both send one change event and skip the keydown and keyup events",
          reason: "Both methods produce the key sequence. Neither one collapses the input into a single change event.",
        },
        {
          option: "type is the method that works on an element that is not focusable",
          reason: "type does not work well on an element that is not focusable, because its click cannot focus that element.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('types into a field and then presses Enter', async () => {\n  const user = userEvent.setup();\n  render(<CityField />);\n  const city = screen.getByRole('textbox', { name: 'City' });\n  await user.type(city, 'Paris');\n  await user.keyboard('{Enter}');\n  expect(city).toHaveValue('Paris');\n});",
      },
      remember: "type clicks, then types. keyboard sends keys to the element that is already focused.",
      docs: "https://testing-library.com/docs/user-event/keyboard",
    },
  },
  {
    id: "rtl-022",
    tech: "rtl",
    topic: "user-events",
    kind: "code-output",
    difficulty: "expert",
    prompt: "Jest fake timers are enabled, and setup receives advanceTimers. What happens when the test awaits type?",
    code: {
      lang: 'tsx',
      source: "jest.useFakeTimers();\nconst user = userEvent.setup({\n  advanceTimers: jest.advanceTimersByTime,\n});\nrender(<NameField />);\nawait user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');",
    },
    options: [
      "advanceTimers disables typing, so the textbox stays empty",
      "Jest advances the typing delays, so the awaited type can finish",
      "advanceTimers switches the session to fireEvent, so only one change event fires",
      "Jest ignores advanceTimers unless the callback is vi.advanceTimersByTime",
    ],
    correctIndex: 1,
    explanation: {
      answer: "Jest advances the typing delays, so the awaited type call can finish.",
      why: "jest.useFakeTimers freezes timers, including the short delays user-event puts between keystrokes. advanceTimers tells the session how to move that clock. Passing jest.advanceTimersByTime lets those delays finish, so the awaited type call can complete and the name field receives Ada. The same idea under Vitest uses vi.advanceTimersByTime. The option does not disable typing, and it does not switch the session to fireEvent. You pass the advancer from the runner you actually enabled.",
      wrong: [
        {
          option: "advanceTimers disables typing, so the textbox stays empty",
          reason: "advanceTimers exists so typing can finish under fake timers. It does not turn typing off.",
        },
        {
          option: "advanceTimers switches the session to fireEvent, so only one change event fires",
          reason: "The session still uses user-event. advanceTimers only tells it how to move the fake clock.",
        },
        {
          option: "Jest ignores advanceTimers unless the callback is vi.advanceTimersByTime",
          reason: "Pass the advancer from the runner you enabled. Jest uses jest.advanceTimersByTime, and Vitest uses vi.advanceTimersByTime.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('types while Jest fake timers are on', async () => {\n  jest.useFakeTimers();\n  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });\n  render(<NameField />);\n  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada');\n  expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();\n});",
      },
      remember: "Pass jest.advanceTimersByTime or vi.advanceTimersByTime to match the fake timers you turned on.",
      docs: "https://testing-library.com/docs/user-event/options",
    },
  },
  {
    id: "rtl-023",
    tech: "rtl",
    topic: "async-ui",
    kind: "concept",
    difficulty: "advanced",
    prompt: "Why should user.click stay outside waitFor?",
    options: [
      "waitFor cannot run an async callback, so the click would be skipped",
      "waitFor runs its callback once, so a click inside it is safe",
      "waitFor retries its callback, so a click inside it can run more than once",
      "waitFor turns a click into a hover, so the button never receives the click",
    ],
    correctIndex: 2,
    explanation: {
      answer: "waitFor retries the callback, so a click inside it can run on every attempt.",
      why: "waitFor retries its callback until the callback stops throwing or the timeout is reached. A retry means the callback can run many times. user.click is a side effect, an action that changes the product, not a check. Put that click inside the callback and a slow status message makes the click happen again on the next try. Click once, outside waitFor, and put only the assertion in the callback. findBy is the query form of that same retry: it waits until the element appears and does not need a click inside it.",
      wrong: [
        {
          option: "waitFor cannot run an async callback, so the click would be skipped",
          reason: "waitFor can await a promise returned by the callback. The problem is the retry, not async itself.",
        },
        {
          option: "waitFor runs its callback once, so a click inside it is safe",
          reason: "waitFor runs the callback again whenever it throws, until the timeout. One run is not guaranteed.",
        },
        {
          option: "waitFor turns a click into a hover, so the button never receives the click",
          reason: "waitFor does not change the event. It only repeats the callback you gave it.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('shows saved after one click', async () => {\n  const user = userEvent.setup();\n  render(<Saver />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  await waitFor(() => {\n    expect(screen.getByText('Saved')).toBeInTheDocument();\n  });\n});",
      },
      remember: "Click once outside waitFor. Let the callback assert, or use findBy.",
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-024",
    tech: "rtl",
    topic: "async-ui",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "Saved sometimes appears twice. What is the bug?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<Saver />);\nawait waitFor(async () => {\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(screen.getByText('Saved')).toBeInTheDocument();\n});",
    },
    options: [
      "waitFor cannot be awaited, so the async keyword is what repeats the click",
      "getByText is illegal inside waitFor, and findBy cannot replace it",
      "setup() turns retries off, so the click runs as a hover instead",
      "The click sits inside waitFor, so a retry can activate Save more than once",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The click is inside waitFor, so each retry can press Save again.",
      why: "The callback passed to waitFor clicks Save and then looks for Saved. waitFor runs that callback again if Saved is not there yet, because a retry follows every thrown assertion. Each retry clicks Save again, so one slow update can save twice. The await on waitFor does not stop those repeats. It only waits for the whole retry loop. Click once before waitFor. Then wait with findByText, which is the query form of the retry, or with a waitFor callback that only asserts.",
      wrong: [
        {
          option: "waitFor cannot be awaited, so the async keyword is what repeats the click",
          reason: "Awaiting waitFor is correct. The repeat comes from the click living inside the retried callback.",
        },
        {
          option: "getByText is illegal inside waitFor, and findBy cannot replace it",
          reason: "An assertion with getByText can live inside waitFor. findBy is the query form of the same retry.",
        },
        {
          option: "setup() turns retries off, so the click runs as a hover instead",
          reason: "setup() does not disable waitFor, and it does not turn click into hover.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('saves once', async () => {\n  const user = userEvent.setup();\n  render(<Saver />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(await screen.findByText('Saved')).toBeInTheDocument();\n});",
      },
      remember: "Do not put user.click inside waitFor. A retry can run it again.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('saves once', async () => {\n  const user = userEvent.setup();\n  render(<Saver />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  await waitFor(() => {\n    expect(screen.getByText('Saved')).toBeInTheDocument();\n  });\n});",
      },
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-025",
    tech: "rtl",
    topic: "async-ui",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "The heading text becomes Ready on a later update. What is heading?",
    code: {
      lang: 'tsx',
      source: "render(<Loader />);\nconst heading = await screen.findByRole('heading', { name: 'Ready' });",
    },
    options: [
      "The heading element, after findBy retries until Ready appears",
      "null, because findBy returns null when the first try misses",
      "An array, because findBy is the many-element form of getBy",
      "undefined, because findBy only asserts and does not return the node",
    ],
    correctIndex: 0,
    explanation: {
      answer: "heading is the element. findBy retries until one Ready heading appears, then resolves to it.",
      why: "findByRole returns a promise. The test awaits it, so heading is the element the promise resolves to, not the promise itself. findBy retries until one heading with the accessible name Ready appears. The accessible name is the heading text. If Ready never appears, or the lookup otherwise fails, the promise rejects. The default timeout is 1000 milliseconds. findBy does not return null, and it does not return an array. findAllBy is the many-element form. Use findBy when the element appears after an update.",
      wrong: [
        {
          option: "null, because findBy returns null when the first try misses",
          reason: "queryBy returns null on a miss. findBy retries and rejects if it fails. It does not resolve to null.",
        },
        {
          option: "An array, because findBy is the many-element form of getBy",
          reason: "findAllBy returns the array. findBy resolves to the one element.",
        },
        {
          option: "undefined, because findBy only asserts and does not return the node",
          reason: "findBy resolves to the element so you can assert on it. It is not assertion-only.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('waits for the loaded heading', async () => {\n  render(<Loader />);\n  const heading = await screen.findByRole('heading', { name: 'Ready' });\n  expect(heading).toBeInTheDocument();\n});",
      },
      remember: "findBy returns a promise of the element. It retries, and it rejects if it fails.",
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-026",
    tech: "rtl",
    topic: "async-ui",
    kind: "concept",
    difficulty: "expert",
    prompt: "A test logs a warning that a React update was not wrapped in act. What does that warning usually mean here?",
    options: [
      "The component called useState, which tests are not allowed to render",
      "A state update ran after the test finished, often because findBy or user-event was not awaited",
      "render forgot to return container, so React skipped the commit",
      "toBeInTheDocument ran without Jest, so every matcher needs its own act call",
    ],
    correctIndex: 1,
    explanation: {
      answer: "An update ran after the test finished, usually because a findBy or user-event promise was not awaited.",
      why: "act is the React helper that flushes renders and effects so a test sees settled UI. React Testing Library already wraps render, events, and its async utilities in act. A warning that an update was not wrapped in act usually means a state update ran after the test finished. The common cause is a missing await. findBy and the user-event methods return promises. If you do not await them, the work continues and calls setState after the test has left. Await those promises. The warning is not caused by using state in the component, and the document matcher is unrelated to act.",
      wrong: [
        {
          option: "The component called useState, which tests are not allowed to render",
          reason: "useState is normal in the component under test. The warning is about when the update happened.",
        },
        {
          option: "render forgot to return container, so React skipped the commit",
          reason: "render returns container, rerender, and unmount, and it already commits the tree inside act.",
        },
        {
          option: "toBeInTheDocument ran without Jest, so every matcher needs its own act call",
          reason: "toBeInTheDocument comes from jest-dom. It is not the source of an act warning.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('awaits the click and the status', async () => {\n  const user = userEvent.setup();\n  render(<Form />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(await screen.findByRole('status')).toHaveTextContent('Saved');\n});",
      },
      remember: "An act warning usually means an update landed after the test. Await findBy and user-event.",
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-027",
    tech: "rtl",
    topic: "async-ui",
    kind: "spot-the-bug",
    difficulty: "advanced",
    prompt: "The assertion does not read the status text. What is the bug?",
    code: {
      lang: 'tsx',
      source: "render(<Notice />);\nconst status = screen.findByRole('status');\nexpect(status).toHaveTextContent('Saved');",
    },
    options: [
      "findByRole throws on the first miss, so no promise is created",
      "status is null, because findBy returns null until the next render",
      "findByRole returns a promise, and the assertion reads that promise instead of the element",
      "The status role is excluded unless hidden is true, so the query is empty",
    ],
    correctIndex: 2,
    explanation: {
      answer: "findByRole returns a promise. The assertion reads that promise because the test never awaits it.",
      why: "findByRole returns a promise and retries until the status appears. The test stores that promise in status and does not await it. expect then runs toHaveTextContent on the promise object. A promise is a future result, not the status element, so the matcher is not reading the text Saved. The element may appear later, after the assertion already failed, and that late update can also warn about act. Await the findBy call, then assert on the element. queryBy would return null immediately, which is a different tool.",
      wrong: [
        {
          option: "findByRole throws on the first miss, so no promise is created",
          reason: "findBy does not throw on the first miss. It returns a promise and retries until the timeout.",
        },
        {
          option: "status is null, because findBy returns null until the next render",
          reason: "queryBy returns null. findBy resolves to the element, or rejects if it fails.",
        },
        {
          option: "The status role is excluded unless hidden is true, so the query is empty",
          reason: "A visible status is in the accessibility tree. hidden is not required to find it.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('reads the saved status', async () => {\n  render(<Notice />);\n  const status = await screen.findByRole('status');\n  expect(status).toHaveTextContent('Saved');\n});",
      },
      remember: "Await findBy. It returns a promise of the element, not the element itself.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('reads the saved status', async () => {\n  render(<Notice />);\n  expect(await screen.findByRole('status')).toHaveTextContent('Saved');\n});",
      },
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-028",
    tech: "rtl",
    topic: "async-ui",
    kind: "scenario",
    difficulty: "expert",
    prompt: "A confirm dialog appears only after the publish request finishes. The test should wait for it and fail if it never appears. Which call fits?",
    options: [
      "screen.getByRole('dialog'), because getBy retries for one second",
      "screen.queryByRole('dialog'), because a null result is retried by the matcher",
      "waitFor(() => user.click(openButton)), so the click repeats until a dialog exists",
      "await screen.findByRole('dialog'), because findBy retries and rejects if the dialog never appears",
    ],
    correctIndex: 3,
    explanation: {
      answer: "await findByRole for the dialog. It retries, and it rejects if the dialog never appears.",
      why: "The dialog is missing on the first render and appears only after the request updates the UI. findByRole returns a promise, retries until one dialog appears, and rejects if that fails. Await it. getByRole does not retry, so it throws on the first miss. queryByRole returns null and does not retry either. Putting user.click inside waitFor is worse, because waitFor can run the callback more than once and publish again. Click once if a click is what starts the request, then await findByRole.",
      wrong: [
        {
          option: "screen.getByRole('dialog'), because getBy retries for one second",
          reason: "getBy does not retry. It throws immediately when the dialog is still missing.",
        },
        {
          option: "screen.queryByRole('dialog'), because a null result is retried by the matcher",
          reason: "queryBy returns null and does not retry. The matcher does not keep looking.",
        },
        {
          option: "waitFor(() => user.click(openButton)), so the click repeats until a dialog exists",
          reason: "A click inside waitFor is a side effect. Retries can run that click more than once.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('opens the confirm dialog', async () => {\n  const user = userEvent.setup();\n  render(<Publisher />);\n  await user.click(screen.getByRole('button', { name: 'Publish' }));\n  const dialog = await screen.findByRole('dialog', { name: 'Confirm' });\n  expect(dialog).toBeInTheDocument();\n});",
      },
      remember: "findBy retries until the element appears and rejects if that fails.",
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-029",
    tech: "rtl",
    topic: "async-ui",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "Publish is clicked once, and the status text appears on a later update. What does this test do?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<Editor />);\nawait user.click(screen.getByRole('button', { name: 'Publish' }));\nawait waitFor(() => {\n  expect(screen.getByRole('status')).toHaveTextContent('Published');\n});",
    },
    options: [
      "The click runs once, and waitFor retries only the status assertion",
      "waitFor clicks Publish again on every retry, so the article can publish twice",
      "getByRole inside waitFor returns null, so the assertion passes on the first try",
      "The test fails immediately, because waitFor does not retry a failing expect",
    ],
    correctIndex: 0,
    explanation: {
      answer: "Publish is clicked once. waitFor retries only the assertion until the status says Published.",
      why: "The click is outside waitFor, so Publish is activated once. waitFor then runs the callback. The callback asks for a status whose text is Published. getByRole throws if that status is not there yet, and a failing expect throws too. waitFor catches that throw and retries until the callback completes or the time limit is hit. The retries do not click again. getByRole does not return null, so a missing status cannot make the assertion pass early. findBy is the query form of this same retry when you only need the element to appear.",
      wrong: [
        {
          option: "waitFor clicks Publish again on every retry, so the article can publish twice",
          reason: "The click is outside the callback. Only the status assertion is retried.",
        },
        {
          option: "getByRole inside waitFor returns null, so the assertion passes on the first try",
          reason: "getByRole throws when the status is missing. It does not return null, so a miss cannot pass the assertion.",
        },
        {
          option: "The test fails immediately, because waitFor does not retry a failing expect",
          reason: "A failing expect throws, and waitFor retries a callback that throws until it passes or times out.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('publishes once and then waits for the status', async () => {\n  const user = userEvent.setup();\n  render(<Editor />);\n  await user.click(screen.getByRole('button', { name: 'Publish' }));\n  await waitFor(() => {\n    expect(screen.getByRole('status')).toHaveTextContent('Published');\n  });\n});",
      },
      remember: "Keep side effects outside waitFor. The callback is retried, the click is not.",
      docs: "https://testing-library.com/docs/dom-testing-library/api-async",
    },
  },
  {
    id: "rtl-030",
    tech: "rtl",
    topic: "async-ui",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The test function is async, but React still warns that an update was not wrapped in act. What is the bug?",
    code: {
      lang: 'tsx',
      source: "const user = userEvent.setup();\nrender(<Form />);\nuser.click(screen.getByRole('button', { name: 'Save' }));\nexpect(await screen.findByRole('status')).toHaveTextContent('Saved');",
    },
    options: [
      "findByRole resolves to null, so the status text is never checked",
      "The click promise is not awaited, so its state update can land after the test finishes and React warns about act",
      "setup() stops findBy from retrying, so the status is never observed",
      "An async test cannot await a query, so findBy is unsupported",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The click promise is not awaited, so its update can run after the test and trigger an act warning.",
      why: "The test awaits findByRole, but it does not await user.click. click returns a promise. That interaction yields while it hovers, focuses, and clicks, and the state update can finish after the test function has returned. act is the React helper that flushes renders. Testing Library wraps updates that it knows about, but a promise you abandoned can set state after the test is over. React then warns that the update was not wrapped in act. Await the click first, then await the status query. Making the test function async does not await a promise you never used await on.",
      wrong: [
        {
          option: "findByRole resolves to null, so the status text is never checked",
          reason: "findBy resolves to the element or rejects. It does not resolve to null, and this line does await it.",
        },
        {
          option: "setup() stops findBy from retrying, so the status is never observed",
          reason: "setup() does not change findBy. The click is the promise that was left running.",
        },
        {
          option: "An async test cannot await a query, so findBy is unsupported",
          reason: "An async test is how you await findBy and user-event. Both return promises.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('saves and waits for the status', async () => {\n  const user = userEvent.setup();\n  render(<Form />);\n  await user.click(screen.getByRole('button', { name: 'Save' }));\n  expect(await screen.findByRole('status')).toHaveTextContent('Saved');\n});",
      },
      remember: "Await user.click and findBy, or a later update can warn about act.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('saves and waits for the status', async () => {\n  const user = userEvent.setup();\n  render(<Form />);\n  const save = screen.getByRole('button', { name: 'Save' });\n  await user.click(save);\n  const status = await screen.findByRole('status');\n  expect(status).toHaveTextContent('Saved');\n});",
      },
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-031",
    tech: "rtl",
    topic: "patterns",
    kind: "concept",
    difficulty: "advanced",
    prompt: "What does renderHook from @testing-library/react return, and what is the wrapper option for?",
    options: [
      "It returns the container element, and wrapper replaces the hook with a DOM node",
      "It returns screen queries, and wrapper sets the attribute used by getByTestId",
      "It returns result and rerender, and wrapper wraps the hook in providers",
      "It returns unmount only, and wrapper sets the assertion timeout",
    ],
    correctIndex: 2,
    explanation: {
      answer: "renderHook returns result and rerender. wrapper puts providers around the hook.",
      why: "renderHook mounts a small component whose only job is to call your hook. It returns result and rerender. result.current is the latest value the hook returned. rerender(newProps) updates that same mounted tree and passes the new props into the hook. In this test the hook formats the start prop it just received, so the label follows those latest props. That rerender does not mount a second hook. The wrapper option is a component that receives children and wraps that tree, which is how you supply providers such as context. A provider is a component that makes a value available to the components inside it. unmount is also returned when you need to tear the hook down yourself.",
      wrong: [
        {
          option: "It returns the container element, and wrapper replaces the hook with a DOM node",
          reason: "render returns the container. renderHook returns the hook result, and wrapper still renders the hook.",
        },
        {
          option: "It returns screen queries, and wrapper sets the attribute used by getByTestId",
          reason: "screen is a separate export. wrapper does not configure the test id attribute.",
        },
        {
          option: "It returns unmount only, and wrapper sets the assertion timeout",
          reason: "unmount is available, but result and rerender are the values you use to read and update the hook. wrapper is not a timeout.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { renderHook } from '@testing-library/react';\n\ntest('updates the same hook when props change', () => {\n  const { result, rerender } = renderHook(\n    (props: { start: number }) => useCountLabel(props.start),\n    {\n      initialProps: { start: 1 },\n      wrapper: function Wrapper(props: { children: React.ReactNode }) {\n        return <CountProvider>{props.children}</CountProvider>;\n      },\n    },\n  );\n  expect(result.current).toBe('Count 1');\n  rerender({ start: 2 });\n  expect(result.current).toBe('Count 2');\n});",
      },
      remember: "renderHook gives you result and rerender. wrapper supplies the providers.",
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-032",
    tech: "rtl",
    topic: "patterns",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The assertion never gets as far as checking the text 2. What is the bug?",
    code: {
      lang: 'tsx',
      source: "function Counter(props: { start: number }) {\n  return <p role='status'>{props.start}</p>;\n}\n\nconst { getByRole } = render(<Counter start={1} />);\nrender(<Counter start={2} />);\nexpect(getByRole('status')).toHaveTextContent('2');",
    },
    options: [
      "rerender is the call that mounts a second tree, and render updates the first tree",
      "start is read from context, so a prop cannot change the status text",
      "getByRole skips the status role unless hidden is true",
      "The second render mounts another tree, so two status elements match and getByRole throws",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The second render mounts another tree, so getByRole finds two status elements and throws.",
      why: "Counter renders one status whose text is the start prop. The first render mounts that tree and returns getByRole bound to document.body, because screen and the default render queries use document.body. The second render() call does not update that tree. It mounts a second tree, so the document now contains two status elements, one with text 1 and one with text 2. getByRole throws when it finds more than one match, and the expect line never runs. rerender(nextElement) updates the same mounted tree, so the single status changes from 1 to 2.",
      wrong: [
        {
          option: "rerender is the call that mounts a second tree, and render updates the first tree",
          reason: "That swaps the two calls. A second render mounts another tree. rerender updates the tree you already mounted.",
        },
        {
          option: "start is read from context, so a prop cannot change the status text",
          reason: "Counter reads the start prop and puts it in the status text. Context is not involved.",
        },
        {
          option: "getByRole skips the status role unless hidden is true",
          reason: "A status role is exposed. hidden is for elements the accessibility tree normally skips.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('updates the same counter', () => {\n  const { rerender } = render(<Counter start={1} />);\n  expect(screen.getByRole('status')).toHaveTextContent('1');\n  rerender(<Counter start={2} />);\n  expect(screen.getByRole('status')).toHaveTextContent('2');\n});",
      },
      remember: "rerender updates the same tree. A second render() mounts another one.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('updates the same counter', () => {\n  const { rerender } = render(<Counter start={1} />);\n  rerender(<Counter start={2} />);\n  expect(screen.getByRole('status')).toHaveTextContent('2');\n});",
      },
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-033",
    tech: "rtl",
    topic: "patterns",
    kind: "code-output",
    difficulty: "advanced",
    prompt: "jest-dom is not loaded. What happens on the assertion?",
    code: {
      lang: 'tsx',
      source: "import { render, screen } from '@testing-library/react';\n\nrender(<button>Save</button>);\nexpect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();",
    },
    options: [
      "The matcher is missing, because toBeInTheDocument comes from jest-dom, not from React Testing Library",
      "render installs the matcher, so the assertion passes",
      "The call returns false, and expect treats that false as a passing test",
      "screen turns the button into a boolean before the matcher is called",
    ],
    correctIndex: 0,
    explanation: {
      answer: "toBeInTheDocument is missing because it comes from jest-dom, not from React Testing Library.",
      why: "The render and the role query succeed. Save is a button whose accessible name is its text. The failure is the matcher, the expect helper named toBeInTheDocument. React Testing Library does not install that matcher. It comes from @testing-library/jest-dom, which adds document matchers to expect when that package is loaded. If it is not loaded, the assertion throws because toBeInTheDocument is not a function. Vitest uses the same package, often through its vitest entry. Load it from the test setup so every test can use it.",
      wrong: [
        {
          option: "render installs the matcher, so the assertion passes",
          reason: "render returns container, rerender, unmount, and queries. It does not add expect matchers.",
        },
        {
          option: "The call returns false, and expect treats that false as a passing test",
          reason: "The failure is that the matcher function does not exist. expect does not treat a missing matcher as a passing false.",
        },
        {
          option: "screen turns the button into a boolean before the matcher is called",
          reason: "screen.getByRole returns the button element. The missing piece is the matcher from jest-dom.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\ntest('finds the save button in the document', () => {\n  render(<button>Save</button>);\n  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();\n});",
      },
      remember: "toBeInTheDocument comes from jest-dom, not from React Testing Library.",
      docs: "https://testing-library.com/docs/ecosystem-jest-dom",
    },
  },
  {
    id: "rtl-034",
    tech: "rtl",
    topic: "patterns",
    kind: "concept",
    difficulty: "expert",
    prompt: "When does React Testing Library unmount the trees it rendered?",
    options: [
      "Only when the test calls unmount, because afterEach is never registered",
      "In afterEach, when it detects Jest or Vitest",
      "Before every query, so a test can hold only one element",
      "After the first assertion, even if the test is still running",
    ],
    correctIndex: 1,
    explanation: {
      answer: "The main import cleans up mounted trees in afterEach when it detects Jest or Vitest.",
      why: "The main @testing-library/react import looks for an afterEach function. Jest provides that function, and Vitest provides it when its test globals are in place. Finding it is how the library detects those runners. It then registers cleanup to run after each test. cleanup unmounts the trees render mounted and removes the default containers from document.body. The next test therefore starts from an empty document. The pure entry does not register that hook, so imports from pure leave cleanup to you. Queries themselves do not unmount the tree, and the first assertion does not either.",
      wrong: [
        {
          option: "Only when the test calls unmount, because afterEach is never registered",
          reason: "The main import registers cleanup on afterEach when that function exists. You can still call unmount yourself for one tree.",
        },
        {
          option: "Before every query, so a test can hold only one element",
          reason: "Queries only search. They do not unmount the tree that render mounted.",
        },
        {
          option: "After the first assertion, even if the test is still running",
          reason: "Assertions do not trigger cleanup. Cleanup runs after the test, so later assertions in the same test still see the tree.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('shows one save button', () => {\n  render(<button>Save</button>);\n  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();\n});",
      },
      remember: "Jest and Vitest get automatic cleanup in afterEach from the main React Testing Library import.",
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-035",
    tech: "rtl",
    topic: "patterns",
    kind: "scenario",
    difficulty: "advanced",
    prompt: "Page reads theme context and throws if ThemeProvider is missing. The test should render Page. How do you supply the provider?",
    options: [
      "Pass ThemeProvider as the second argument to Page itself",
      "Call render a second time so the two trees share one context value",
      "Pass a wrapper to render that puts ThemeProvider around the page",
      "Find the provider with getByTestId, because context is a DOM node",
    ],
    correctIndex: 2,
    explanation: {
      answer: "Pass a wrapper to render so ThemeProvider wraps the page in the same tree.",
      why: "Page needs theme context. Context is a value React passes down the tree, and a provider is the component that supplies it. render accepts a wrapper option. That wrapper receives the page as children and can return ThemeProvider around those children. One render then mounts a single tree with the provider in place, and screen can query the heading a person sees. A second render() call would mount a second tree rather than wrap the first. The provider is not a DOM node you find with a test id, and getByTestId is only the escape hatch when role, label, placeholder, text, and display value do not fit.",
      wrong: [
        {
          option: "Pass ThemeProvider as the second argument to Page itself",
          reason: "Page does not take the provider as a normal argument. render has a wrapper option for this.",
        },
        {
          option: "Call render a second time so the two trees share one context value",
          reason: "A second render mounts a second tree. It does not wrap the first tree in a provider.",
        },
        {
          option: "Find the provider with getByTestId, because context is a DOM node",
          reason: "Context is not a DOM node, and a test id is only the escape hatch when role and text do not fit.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('shows the themed title', () => {\n  render(<Page />, {\n    wrapper: function Wrapper(props: { children: React.ReactNode }) {\n      return <ThemeProvider>{props.children}</ThemeProvider>;\n    },\n  });\n  expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();\n});",
      },
      remember: "Use the wrapper option to put providers around the rendered page.",
      docs: "https://testing-library.com/docs/react-testing-library/api",
    },
  },
  {
    id: "rtl-036",
    tech: "rtl",
    topic: "patterns",
    kind: "spot-the-bug",
    difficulty: "expert",
    prompt: "The button works for a person, but this test is tied to an implementation detail. What is the bug?",
    code: {
      lang: 'tsx',
      source: "const { container } = render(<button className='save'>Save</button>);\nconst button = container.querySelector('.save');\nexpect(button).toBeTruthy();",
    },
    options: [
      "render does not return container, so the querySelector line never runs",
      "A class selector is the supported query, and toBeTruthy is the missing matcher",
      "A button has no role, so the class is the only way to find it",
      "The test depends on a class name a person cannot perceive, instead of the button role and name",
    ],
    correctIndex: 3,
    explanation: {
      answer: "The test looks up a class name. Query the button role and the accessible name Save instead.",
      why: "The accessible name of the button is Save, and its role is button. Those are what a person can perceive. The test ignores them and selects the class save. A class name is a styling hook. It can change without the button changing, and a person using the interface never looks it up. Component state is the same kind of hidden detail. The assertion only checks that the selector found a node. Query with getByRole and the name Save. Reach for getByTestId only when role, label, placeholder, text, and display value do not fit.",
      wrong: [
        {
          option: "render does not return container, so the querySelector line never runs",
          reason: "render does return container, along with rerender and unmount. The bug is which node the test looks up.",
        },
        {
          option: "A class selector is the supported query, and toBeTruthy is the missing matcher",
          reason: "A class selector is an implementation detail. The supported path is the role and the accessible name.",
        },
        {
          option: "A button has no role, so the class is the only way to find it",
          reason: "A button element has the role button, and its text is the accessible name Save.",
        },
      ],
      example: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds save by its role and name', () => {\n  render(<button>Save</button>);\n  const save = screen.getByRole('button', { name: 'Save' });\n  expect(save).toBeEnabled();\n});",
      },
      remember: "Query the button role and accessible name, not a class name or component state.",
      fixedCode: {
        lang: 'tsx',
        source: "import { render, screen } from '@testing-library/react';\n\ntest('finds save by its role and name', () => {\n  render(<button className='save'>Save</button>);\n  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();\n});",
      },
      docs: "https://testing-library.com/docs/queries/about",
    },
  },
] satisfies Question[];
