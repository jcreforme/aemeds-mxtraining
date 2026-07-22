# Form Block — Lead Capture Form

Lead capture form block. It builds a `<form>` from an authored table: each row defines a field (label + type). On submit, it validates on the client (`checkValidity`), shows a thank-you message, and disables the form. There is no backend: submission is purely client-side and makes no network request.

## 1. Authoring Contract

Each row of the block represents **one field** of the form.

- **Column 1**: Field label (required; if empty, the row is ignored).
- **Column 2**: Field type.
- **Column 3** (optional): Options for `select`, separated by commas (equivalent to `select:A,B` in column 2).

### Supported field types

`text` · `email` · `tel` · `textarea` · `select` · `checkbox` · `submit`

Any unrecognized value in column 2 is treated as `text`.

### Conceptual Structure

```text
| form           |                    |                        |
| Full Name      | text               |                        |
| Email          | email              |                        |
| Phone          | tel                |                        |
| State          | select             | California,Texas,Florida |
| Message        | textarea           |                        |
| I agree to the terms | checkbox     |                        |
| Sign Up        | submit             |                        |
```

Contract notes:

- Each field's **`id`/`name`** is derived from the label: lowercase with spaces replaced by hyphens, prefixed with `form-` (e.g. `Full Name` → `form-full-name`).
- The **`submit`** row: column 1 is the button text (e.g. `Sign Up`), column 2 is `submit`. It renders as `<button type="submit" class="button primary">`.
- **`select`**: can be authored as `select:California,Texas` in column 2, or as `select` in column 2 with the options in column 3. A disabled placeholder option, selected by default (`Select {label}`), is added.
- **`textarea`**: renders with `rows="4"`.
- **`checkbox`**: renders inline (input + label), and is **required**.
- All fields except `select` are marked as `required`. `email` gets `autocomplete="email"`; `tel` gets `autocomplete="tel"`.

### Submission behavior

- The `<form>` uses `noValidate` and validates manually with `checkValidity()` on the `submit` event (with `preventDefault`).
- If invalid, it invokes `reportValidity()` and does not continue.
- If valid: it adds the `form-success` class to the block, shows the message *"Thank you. Your information has been submitted."* and disables all `input`, `select`, `textarea`, and `button` elements.
- The `form-success` class in CSS hides all fields and the button, leaving only the message visible.

## 2. Accessibility

- Each field has a `<label>` associated by `htmlFor`/`id`.
- The `select` placeholder is `disabled` to force an explicit selection.
- The browser's native validation (`required`, `email`/`tel` types) provides accessible feedback via `reportValidity()`.
- The confirmation message (`.form-message`) starts with the `hidden` attribute and is revealed on successful submission.
- Focusing inputs/select/textarea shows a visible `outline` (`:focus-visible`).

## 3. CSS Customization

`form.css` does not declare its own `--custom-properties`; it consumes global variables with a fallback:

```css
--body-font-size-s              /* size of labels and the message */
--vyepti-teal (#00a3a1)         /* outline color and border on focus */
--vyepti-teal-light (#e6f7f7)   /* background of the confirmation message */
--vyepti-dark (#1a1a2e)         /* text color of the message */
--background-color              /* background of inputs/select/textarea */
```

The form has a maximum width of 480px and centers automatically.

## 4. Performance Notes

- No dependencies or network requests: all markup is generated with DOM APIs and submission is resolved on the client.
- The block replaces its content with `replaceChildren(form)` in a single operation.
