# Teaser Block — Authoring Guide

The Teaser block pairs an image with editorial text and a call-to-action link. It supports three layout variants, chosen by the block name used in the table header.

---

## Variants at a glance

| Variant | Table header | Mobile | Desktop |
|---|---|---|---|
| **Image Right** | `Teaser (Image Right)` | Image stacked above content | Two columns: content left, image right |
| **Image Left** | `Teaser (Image Left)` | Image stacked above content | Two columns: image left, content right |
| **Image Center** | `Teaser (Image Center)` | Image above content, both centered | Image above content, both centered |

> **Tip:** Alternate Image Right and Image Left teasers down a page for the zig-zag editorial layout used on the live site.

> **Legacy names:** Pages authored with the older headers `Teaser (Teaser Image Right Align First)` and `Teaser (Teaser Image Center Align)` continue to work — the block maps them to Image Right and Image Center automatically. Use the short names for all new content.

---

## Authoring structure

Create a **one-row, two-column** table. The variant name goes in the header row.

### Example — Image Right

| Teaser (Image Right) | |
|:---|:---|
| *(Insert image here)* | **IS MIGRAINE IMPACTING YOUR LIFE?** ← eyebrow (bold only) |
| | ## The battle with migraine disability. ← heading |
| | Body paragraph text goes here. |
| | [Learn More](https://example.com) ← CTA link (standalone paragraph) |

> **Note:** In Google Docs / SharePoint the image and all content text go in the same row — the table above is split across multiple lines only for readability.

The same structure applies to `Teaser (Image Left)` and `Teaser (Image Center)` — only the header changes.

### Cell order is flexible

The image may go in **either** cell — the block finds it automatically. This means you can author content-first or image-first, whichever reads better in the document. The visual position of the image is controlled **only by the variant name**, never by cell order.

---

## Cell-by-cell rules

### Image cell

- Insert exactly **one image** using **Insert › Image**.
- Always add descriptive **alt text** — required for accessibility. Use `""` only for purely decorative images.
- In the split variants the image keeps its natural aspect ratio, so pre-cropped artwork renders exactly as uploaded.

### Content cell

Content is read top-to-bottom in this exact order:

| Element | How to author | Notes |
|---|---|---|
| **Eyebrow** (optional) | A paragraph containing **bold text only**, placed before the heading | Renders as a small rose uppercase label |
| **Heading** | Heading 2 or Heading 3 (`##` / `###`) | Do **not** use bold text as a substitute |
| **Body** | Regular paragraphs and/or bullet lists | Keep concise — short paragraphs work best |
| **CTA link** (optional) | A standalone paragraph with one link | Automatically renders as a rose pill button |

An **image-only teaser** (empty content cell) is also supported — useful for centered logos or badges with the Image Center variant.

---

## What renders where

### Image Right

```
Mobile (< 900 px):          Desktop (≥ 900 px):
┌─────────────────┐          ┌──────────┬──────────┐
│     Image       │          │ EYEBROW  │          │
├─────────────────┤          │ Heading  │  Image   │
│ EYEBROW         │          │ Body     │          │
│ Heading         │          │ [CTA]    │          │
│ Body text       │          └──────────┴──────────┘
│ [CTA button]    │
└─────────────────┘
```

### Image Left

```
Mobile (< 900 px):          Desktop (≥ 900 px):
┌─────────────────┐          ┌──────────┬──────────┐
│     Image       │          │          │ EYEBROW  │
├─────────────────┤          │  Image   │ Heading  │
│ EYEBROW         │          │          │ Body     │
│ Heading         │          │          │ [CTA]    │
│ Body text       │          └──────────┴──────────┘
│ [CTA button]    │
└─────────────────┘
```

### Image Center

```
All screen sizes:
┌───────────────────┐
│      Image        │
├───────────────────┤
│     EYEBROW       │
│     Heading       │
│    Body text      │
│      [CTA]        │
└───────────────────┘
```

---

## Rules summary

| Rule | Detail |
|---|---|
| Table shape | Exactly **one body row, two columns** |
| Image | One image per teaser, in either cell, with alt text |
| Eyebrow format | Standalone paragraph with **bold text only**, before the heading |
| Heading level | Use **Heading 2** or Heading 3 — not bold/strong text |
| CTA | At most **one CTA link**, in its own standalone paragraph |
| Layout control | Choose position with the variant name — cell order does not affect layout |

---

## Example rendered HTML

After decoration the block produces:

```html
<div class="teaser image-right block">
  <div class="teaser-image">
    <picture>
      <source type="image/webp" srcset="./media_1.webp">
      <img loading="lazy" alt="Patient Image" src="./media_1.png">
    </picture>
  </div>
  <div class="teaser-content">
    <p class="teaser-eyebrow"><strong>IS MIGRAINE IMPACTING YOUR LIFE?</strong></p>
    <h2 class="teaser-heading">The battle with migraine disability.</h2>
    <p>Let's face it—no matter how often you get migraine attacks…</p>
    <p class="button-container">
      <a href="#" class="button primary">Learn More</a>
    </p>
  </div>
</div>
```
