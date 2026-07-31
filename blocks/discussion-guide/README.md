# Discussion Guide Block — Stepped Questionnaire

A multi-step, interactive questionnaire (a "wizard"). It builds a stepped `<form>` from an authored table: a teal header bar with a step counter (`1 of N`), a segmented progress bar, one step shown at a time, and Back/Next navigation. On the final step, the user submits and sees a compiled, printable summary of their answers to bring to a doctor's appointment. Answers can optionally be POSTed to an endpoint as JSON.

Inspired by patterns like the Vyepti "Doctor Discussion Guide".

## 1. Authoring Contract

The first cell of each row is a **keyword** that determines what the row does.

| Keyword    | Column 2                | Column 3                          | Column 4     |
| ---------- | ----------------------- | --------------------------------- | ------------ |
| `title`    | Guide title (header bar) | —                                 | —            |
| `step`     | Step heading (optional) | —                                 | —            |
| `question` | Question heading        | Help text (may contain markup)    | Input type   |
| `option`   | Option label            | Icon name (from `/icons`)         | —            |
| `submit`   | Button label            | Submit endpoint URL (optional)    | —            |

### Input types (column 4 of a `question` row)

`multiselect` (default) · `singleselect` · `text` · `textarea` · `email` · `tel`

- **`multiselect`** — icon answer cards, "select all that apply" (checkboxes, square markers).
- **`singleselect`** — icon answer cards, pick one (radios, round markers).
- **`text` / `email` / `tel`** — a single-line input.
- **`textarea`** — a multi-line input (`rows="4"`).

Any unrecognized value defaults to `multiselect`.

### Grouping into steps

- Add `step` rows to group multiple questions onto one screen. Each `question`/`option` row after a `step` belongs to that step until the next `step`.
- If **no** `step` rows are present, **each question becomes its own step** automatically.

### Conceptual Structure

```text
| discussion-guide |                                          |                       |             |
| title            | Start your Doctor Discussion Guide       |                       |             |
| step             | About you                                |                       |             |
| question         | My name is                               | Optional              | text        |
| question         | What activities are impacted by migraine?| Select all that apply | multiselect |
| option           | Social events with friends/family        | graphic-schedule      |             |
| option           | Work/school                              | information           |             |
| option           | None of the above                        | call                  |             |
| step             | Your symptoms                            |                       |             |
| question         | How often do you get migraine attacks?   | Select one            | singleselect|
| option           | A few days a month                       |                       |             |
| option           | Several days a week                      |                       |             |
| submit           | See my guide                             | https://example/api   |             |
```

Contract notes:

- Each question's **`id`/`name`** is derived from its heading: lowercased, non-alphanumerics collapsed to hyphens, prefixed with `dg-` (e.g. `My name is` → `dg-my-name-is`).
- **Icons** reference SVGs in `/icons`. Use the file name without extension (e.g. `graphic-schedule` for `/icons/graphic-schedule.svg`). Icons are decorated by the core `decorateIcons` helper. Omit the icon cell for text-only cards.
- The **`submit`** row's column 3 is optional. If provided, answers are POSTed there as JSON (`{ answers: [{ question, answer }] }`). If omitted (or the request fails), the summary is still shown — submission never blocks the guide.
- Help text (column 3 of a `question`) preserves authored markup, so multiple paragraphs and inline emphasis are supported.

## 2. Behavior

- One step is visible at a time (`.dg-step-active`). **Back** is hidden on the first step; **Next** is replaced by the **Submit** button on the last step.
- The progress bar has one segment per step; completed/current segments are highlighted.
- Focus moves to the first field of each step when it becomes active.
- On submit, the header, body, and navigation are replaced with the compiled summary (`<dl>`) plus a **Print / Save as PDF** button (`window.print()`). A `@media print` rule hides the navigation and progress bar so the printout is clean.

## 3. Accessibility

- Multi-select groups use `role="group"`; single-select groups use `role="radiogroup"`, each labelled by the question heading.
- Native checkbox/radio inputs are visually hidden but remain in the DOM and keyboard-focusable; the visible marker reflects `:checked` state, and focus is shown via `:focus-visible`.
- The progress bar exposes `role="progressbar"` with `aria-valuemin`/`max`/`now`.

## 4. Styling

- Scoped under `.discussion-guide`. Mobile-first; a `min-width: 900px` query widens card padding.
- Uses the site's `--vyepti-teal` token (fallback `#046183`) for the header, headings, and selected states, with a coral accent (`#e8615a`) on completed progress segments.
