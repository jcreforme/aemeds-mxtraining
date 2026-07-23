# Cards Download Block

A download-tile grid, based on the `cards` block. Each card is a "download tile":
an illustration image, a heading, a short description, and two action links — a
**Download** link and an **Email** link. Two cards per row on desktop, single
column on mobile.

## Authoring Contract

Each block row is one card, with two cells:

- **Column 1**: the illustration image
- **Column 2**: heading + description + the two action links

### Conceptual Structure

```text
| cards-download |                                                        |
| [image]        | ### VYEPTI Brochure                                    |
|                | Everybody has to start somewhere…                      |
|                | **[Download](/path/to.pdf)**                           |
|                | _[Email](#tile-modal)_                                 |
| [image]        | ### Doctor Discussion Guide                            |
|                | Put your struggle with migraine into words…            |
|                | **[Download](/path/to.pdf)**                           |
|                | _[Email](#tile-modal)_                                 |
```

## Action Links (important)

The two links only render as pill buttons when the author marks them up with the
project's button convention (see `decorateButtons` in `scripts/scripts.js`):

- **Download** → wrap in **bold** (`**Download**`) → renders as the primary
  (solid) button.
- **Email** → wrap in _italic_ (`_Email_`) → renders as the secondary
  (outlined) button.

Each link must be alone in its own paragraph. A plain, unformatted link will
render as normal text, not a button.

## Notes

- Images should be authored as normal content images; they are constrained to a
  max width of 160px and contained within the card.
- A card may carry a single link (e.g. an external "Learn more" link) — it will
  render as a primary button if bolded.
