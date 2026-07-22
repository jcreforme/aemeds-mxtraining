# Hero Block

Hero block for AEM EDS with two variants. The **default** variant (`hero`) replicates the vyepti.com homepage banner: a full-bleed image with a heading, copy, CTA, and an "Actor portrayal" disclaimer overlaid. The **split** variant (`hero (split)`) replicates the homepage's split banner (`.teaser.homeBanner`): two image panels side by side on desktop, stacked on mobile, each with its centered copy.

## 1. Authoring Contract

The decorator chooses the variant based on the block's class: if it has the `split` class it runs `decorateSplit`, otherwise `decorateSingle`.

### Default Variant (single-panel)

`decorateSingle` takes the **first row** of the block and reads its **first two columns**: column 1 is the image (media), column 2 is the content (heading, copy, CTA, and disclaimer).

- **Column 1**: `picture` (the full-bleed image that defines the hero's height).
- **Column 2**: overlaid content.
  - The first heading (`h1`) is the title.
  - The paragraphs are the copy.
  - A link (`<a>`) is turned into the CTA (pink pill with a white arrow).
  - The **last paragraph** that is italic-only (`em`/`i`) and has no link is marked as the `hero-disclaimer` ("Actor portrayal"). A prior disclaimer with source-site classes is also detected (`.cmp-teaser__description__secondary`, `.actor-portrayl-text-shadow`, `.actor-portrayal-text-shadow`).

```text
| hero | |
| [full-bleed image]         | # say yep to VYEPTI            |
|                            | Migraine prevention that's proven… |
|                            | [Check out study results](/…)  |
|                            | *Actor portrayal*              |
```

Layout notes:

- Mobile: the image goes below and the copy on a teal panel above (the column is reversed with `flex-direction: column-reverse`). The image is cropped to `aspect-ratio: 4 / 5`.
- Desktop (>= 900px): the content is overlaid and centered over the image; `h1` takes up 64% of the width and the copy 60%.

Optional focal-point classes (authorable on the block) that adjust the image's `object-position`:

```text
| hero (focus-left)   | ...  |
| hero (focus-center) | ...  |
| hero (focus-right)  | ...  |
```

### Split Variant

`decorateSplit` iterates over **each row** of the block; each row is a panel. Within the row the cells are **order-agnostic**: the cell that contains a `picture` is the media, the other is the content.

```text
| hero (split) | |
| [left image]       | When a showstopping migraine…       |
|                    | # nope                              |
|                    | *Actor portrayal*                   |
| [right image]      | It may be time to                   |
|                    | # say **yep** to **VYEPTI**         |
|                    | Migraine prevention that's proven…  |
|                    | [Check out study results](/…)       |
|                    | *Actor portrayal*                   |
```

`decoratePanelContent` classifies each content cell:

- Headings (`h1`/`h2`/`h3`) → display text (`hero-display`). **Bold** words within the display are painted in the brand red (`--hero-accent`).
- The paragraph immediately after a heading (with no link and that is not a disclaimer) → subtext (`hero-subtext`).
- A link (`<a>`) → CTA pill (`hero-cta`); if it comes wrapped in `strong`/`em` it is unwrapped so that the link itself is the button.
- The **last paragraph** that is italic-only and has no link → disclaimer (`hero-disclaimer`).

Per-panel styles:

- **Panel 1** (`hero-panel-1`): white copy over the dark photo.
- **Panel 2** (`hero-panel-2`): teal copy, red accents, and CTA.
- Mobile: the panels stack (`grid-template-columns: 1fr`); desktop (>= 900px): side by side (`1fr 1fr`).

## Accessibility

- The CTA is a native link (`<a>`); when the link comes wrapped in `strong`/`em`, it is unwrapped to preserve clean semantics.
- The authored headings (`h1`) are kept as real headings, maintaining the document hierarchy.
- The disclaimer is kept as text (it does not replace the image's alt text).
- Respects `prefers-reduced-motion`: it disables the CTA transition.

> Note: the block does not add explicit `role`/`aria-*`; it relies on the semantic markup of headings and links.

## CSS Customization

CSS variables (design tokens) defined in `:root` inside `hero.css`:

```css
--hero-accent         /* Brand pink/red for the CTA and bold text (#c02c57) */
--hero-accent-hover   /* CTA hover (var(--accent-hover-color, #9a2346)) */
--hero-teal           /* Teal of the copy in the split panel (var(--link-color, #046183)) */
--hero-display-font   /* Display text font (nunito, …) */
--hero-text           /* Default text color (#fff) */
--hero-overlay-pad    /* Overlay padding in split (30px) */
--hero-transition     /* CTA transition (0.2s ease-in-out) */
--hero-mobile-bg      /* Teal gradient of the copy panel on mobile */
```

## Performance Notes

- **No dependencies or observers**: decoration is synchronous and only manipulates the DOM.
- The hero image defines the height; on mobile it is cropped with `aspect-ratio` and `object-fit: cover` to avoid reflow.
- The CTA arrow icon is an inline SVG via `background` (data URI), with no extra requests.
- Breakpoints: 900px (both variants) and 1440px (display size adjustment in split).
- Respects `prefers-reduced-motion`.
