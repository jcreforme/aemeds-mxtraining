# Cards Download Block

A download-tile grid, based on the `cards` block. Each card is a "download tile":
an illustration image, a heading, a short description, and one or two action links
— a **Download** link and an **Email** link. Two cards per row on desktop, single
column on mobile.

## Authoring Contract

Each block row is one card, with two cells:

- **Column 1**: the illustration image
- **Column 2**: heading + description + the action links

### Conceptual Structure

```text
| cards-download |                                                        |
| [image]        | ### VYEPTI Brochure                                    |
|                | Everybody has to start somewhere…                      |
|                | [Download :download-18:](/path.pdf) [Email :email:](#tile-modal) |
| [image]        | ### Doctor Discussion Guide                            |
|                | Put your struggle with migraine into words…            |
|                | [Download :download-18:](/path.pdf) [Email :email:](#tile-modal) |
```

## Action Links

The action links render as plain teal text links, each with a trailing icon,
sitting side by side on one row:

- Put both links in a **single paragraph**.
- Follow each link text with its icon token: `:download-18:` for Download,
  `:email:` for Email — e.g. `[Download :download-18:](url) [Email :email:](#tile-modal)`.
- A card may carry just one link (e.g. Download only).

Icons resolve to `/icons/download-18.svg` and `/icons/email.svg` (both teal,
`#046183`).

## Notes

- Images are authored as normal content images; they are constrained to a max
  width of 160px and contained within the card.
- This block is commonly nested inside `accordion` panels. When authored inside a
  panel, the accordion converts the nested table into a `cards-download` block at
  runtime.
