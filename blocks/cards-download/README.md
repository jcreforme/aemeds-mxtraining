# Cards Download Block

A standalone resource-card grid: a logo/illustration on the left and a heading, description, and **Download** / **Email** action links on the right. Matches the vyepti.com "Resources to help you get started with treatment" section. Two cards per row on desktop, single column on mobile.

## Authoring Contract

Create a **two-column table** named `cards-download`. Each row is one card: the LEFT cell is the image/logo, the RIGHT cell is the body (heading, description, and action links).

```text
| cards-download | |
| [VYEPTI CONNECT logo] | ### Financial Assistance and Patient Support Brochure |
|                       | Learn more about how VYEPTI CONNECT can help you… |
|                       | [Download :download-18:](/…brochure.pdf) |
|                       | [Email :email:](#tile-modal) |
| [savings icon]        | ### Copay Assistance Information |
|                       | Learn how the VYEPTI copay assistance program… |
|                       | [Download :download-18:](/…flashcard.pdf) |
|                       | [Email :email:](#tile-modal) |
```

- **Left cell** — the logo/illustration image (a large content image, e.g. the VYEPTI CONNECT logo or a `$` graphic).
- **Right cell**:
  - a **Heading 3** — the card title (teal `#046183`).
  - one or more paragraphs — the description. Inline links stay underlined.
  - the **action links** — each a link whose text is the whole paragraph (e.g. `Download`, `Email`). They are grouped onto one row and render as plain teal links. Add a trailing icon with a token (`:download-18:`, `:email:`).

Any paragraph that is only a link becomes an action link; regular paragraphs stay as body copy.

## Layout

- **Mobile**: single column, image centered above the body, actions centered.
- **Desktop (≥900px)**: two cards per row; within each card the image (160px) sits left of the body, actions left-aligned.

## Notes

- This pattern was extracted from the `accordion` block's download variant into a dedicated block so it can be authored standalone (without an accordion). The two implementations are independent.
- Action-link icons use `:icon:` tokens so they resolve through Document Authoring; the card logos are content images (paste them, or reference the source asset URL).

## Visual QA Checklist

- [ ] Two cards per row on desktop; single column on mobile.
- [ ] Image/logo on the left, capped at 160px; body on the right.
- [ ] Heading is teal `#046183`.
- [ ] Download / Email render as plain teal links with a trailing icon, side by side on one row.
