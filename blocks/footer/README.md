# Footer Block — Global Footer

The footer renders the site-wide footer from a shared fragment. It replicates the vyepti.com footer: a teal strip of legal links, a legal copy block with the magenta "For assistance, call" button (phone call), and a row of social icons + Lundbeck logo aligned to the right.

`decorate(block)` loads the footer fragment with `loadFragment()`, empties the block, and distributes the fragment's authored sections into three bands (`legal`, `info`, `brand`) based on their order.

---

## 1. Authoring Contract

The footer is authored **only once**, in the fragment document in the content drive. The path is resolved as follows:

1. If the page defines the `footer` metadata, that path is used (resolved against the current origin).
2. Otherwise, the default path **`/fragments/footer`** is used.

The fragment must contain **three sections**, separated by horizontal rules (`---`), in this exact order. The JS assigns the classes based on position (`footer.children[0..2]`):

```text
footer.children[0]  →  .footer-legal   (teal strip of legal links)
footer.children[1]  →  .footer-info    (legal copy + call button)
footer.children[2]  →  .footer-brand   (social icons + Lundbeck logo)
```

### Section 1 — Legal links (teal strip)

A list of links (Privacy Policy, Terms of Use, etc.). They render centered, white on a teal background (`--link-color`), with automatic wrapping.

### Section 2 — Legal copy + assistance call

- One or more paragraphs of legal copy.
- A `tel:` phone link preceded by a label paragraph (e.g. *For assistance, call*).

The JS (`decorateCallToAction`) locates the `a[href^="tel:"]` link, turns it into the magenta button (`.button.primary.footer-call`), and groups it with the preceding label paragraph inside a `.footer-cta`. This group is prepended to the start of the info section.

Parsing robustness details:

- `stripBoldMarkers` removes literal `**` markers that an author may have typed instead of using the editor's bold formatting.
- Any `<strong>`/`<em>` wrapping the link is unwrapped, so that the link itself is the button (it does not rely on auto-buttonization).

### Section 3 — Social + logo

A row of icon links (social networks) and the Lundbeck logo. `decorateIconLinks` visually hides the text of the icon links (wrapping it in `<span class="visually-hidden">`) so that only the icon appears on screen, while remaining available to screen readers.

```text
| footer |
```

(The block on the page is empty; all content lives in the fragment.)

---

## 2. Accessibility

- Icon-only links (social, Lundbeck logo) retain their text for screen readers via `span.visually-hidden`; only the icon is shown visually.
- The call button is a real `tel:` link, keyboard-navigable, with `:hover` and `:focus-visible` states.

---

## 3. CSS Customization

`footer.css` does not declare its own `--custom-properties`; it consumes the site's global variables:

```css
--background-color   /* footer background and text over the teal strip */
--body-font-size-xs  /* base footer size */
--link-color         /* teal background of the legal strip */
--light-color        /* color of legal links on hover */
--dark-color         /* text color of the info section */
--text-color         /* color of the "For assistance, call" label */
--accent-color       /* background of the magenta call button */
--accent-hover-color /* button background on hover/focus */
```

### Expected icons

- **`../../icons/call.svg`** — phone icon drawn with `::before` on the `a.footer-call` button (16×19px). NOTE: this file **does not currently exist** in `/icons/`, so the pseudo-element will produce a 404; add `call.svg` for the icon to be displayed.
- **`.icon-lundbeck`** — Lundbeck logo (160px wide on mobile, 27px for the social icons on desktop), provided as an icon in the fragment.

---

## 4. Performance Notes

- The footer is loaded as a fragment in the lazy phase via `loadFragment()`, outside the critical LCP path.
- Editing and publishing the fragment document updates the footer on all pages immediately.
