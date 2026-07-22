# Accordion Block

Accordion block for AEM EDS with support for nested content (including other blocks such as `columns`, `cards`, etc.). It supports three variants: **exclusive** (one open panel), **multi-open** (multiple panels open simultaneously), and **faq** (card layout from the [vyepti.com/vyepti-faq](https://www.vyepti.com/vyepti-faq) page).

## 1. Authoring Contract

Each block row represents an accordion item.

- **Column 1**: Item title (trigger)
- **Column 2..N**: Panel content (text, links, nested blocks)

### Conceptual Structure

```text
| accordion | |
| Getting Started | [panel content] |
| Support         | [panel content] |
```

### Default Behavior (Single-Open / Exclusive)

- The first item starts open.
- Opening an item automatically closes the others.
- Smooth animation on open and close (220ms).

### Multi-Open Variant

To allow multiple panels to be open simultaneously, add the `multi-open` class to the block:

```text
| accordion (multi-open) | |
| Before Treatment   | [content] |
| During Treatment   | [content] |
| After Treatment    | [content] |
```

In this variant:

- All panels can be open at once.
- The first item starts open; the rest start closed.
- Each click toggles the state of the clicked panel independently.

### FAQ Variant

Replica of the design of the live site's FAQ page. Add the `faq` class to the block:

```text
| accordion (faq) | |
| About VYEPTI                | [questions and answers] |
| Treatment with VYEPTI       | [questions and answers] |
| Access and Support          | [questions and answers] |
```

Differences from the standard accordion:

- **All items start closed** (in the standard variant the first one starts open).
- Each category renders as a **rounded card** (background `#eff6f9`, radius 10px, soft shadow, 24px spacing).
- Title in dark gray semi-bold (24px mobile / 28px desktop), teal chevron on the right.
- Exclusive behavior: opening a category closes the others (combinable with `multi-open` if needed).

**Panel content (authoring contract):**

- Each **question** is written as a **Heading 3** (or Heading 4) within the content cell.
- The **answer** is the paragraphs/lists that follow each question.
- Starting from the second question, a gray divider line (`#a4a4a4`) is automatically added above the question.
- Links render in teal, bold, and underlined (as on the live site).

```text
| accordion (faq) | |
| About VYEPTI | ### What is VYEPTI?              ← question (H3)
|              | VYEPTI is a prescription medicine…  ← answer
|              | ### How does VYEPTI work?        ← question (H3)
|              | VYEPTI is an aCGRP…                 ← answer |
```

Test page: `drafts/faq-test.html` (`http://localhost:3000/drafts/faq-test`).

### Nested Content

If a panel contains nested blocks (`columns`, `cards`, `hero`, etc.):

- They are detected automatically in the panel content.
- They are decorated and loaded **only when the panel is expanded** (lazy loading).
- This optimizes performance by avoiding loading unnecessary blocks.

## 2. Accessibility

- Each trigger is a `<button>` wrapped in an `<h3 class="accordion-header">`, just like the live site — the accordion titles are part of the document outline.
- Each `<button>` exposes `aria-expanded` (indicates whether the panel is open).
- Each panel uses `role="region"` and `aria-labelledby` (links to its title).
- Full keyboard navigation support: Tab, Space/Enter to activate.
- Respects `prefers-reduced-motion`: disables animations if the user prefers.

## 3. Test Cases

Use `drafts/accordion-test.html` to validate (run with `npm run lint` before commit):

### Single-Open (Exclusive)

1. **Text content**: 3 basic items, only one open at a time ✅
2. **With nested block (columns)**: Columns is decorated on expand ✅
3. **Multi-cell content + nested block (cards)**: Cards loads correctly ✅

### Multi-Open

4. **Basic multi-open**: 3 items, all can be open, each click toggles independently ✅
5. **Multi-open with nested columns**: 2 items with nested columns, works correctly ✅

## 4. Local Testing

```sh
npx -y @adobe/aem-cli up --no-open --html-folder drafts
```

Then open: `http://localhost:3000/drafts/accordion-test`

Verify:

- ✅ Navigation and panel toggling
- ✅ Smooth animations
- ✅ Nested blocks are decorated correctly
- ✅ Exclusive vs multi-open behavior according to class

## 5. CSS Customization

CSS variables available in `accordion.css`:

```css
--accordion-border-color      /* Border of the items */
--accordion-header-bg         /* Background of the trigger */
--accordion-header-bg-hover   /* Background on hover */
--accordion-header-text       /* Text color */
--accordion-body-bg           /* Background of the panel */
--accordion-icon-color        /* Chevron icon color */
```

Additional variables for the FAQ variant:

```css
--accordion-faq-card-bg        /* Card background (#eff6f9) */
--accordion-faq-title-color    /* Title and questions color (#484848) */
--accordion-faq-divider-color  /* Divider line between questions (#a4a4a4) */
```

## 6. Performance Notes

- **Lazy loading of blocks**: Nested blocks are only loaded on expand → better LCP
- **Optimized animations**: Uses `will-change` and transforms for efficient rendering
- **Reduced motion**: Respects the user's preference (does not animate if enabled)

## 7. PR Checklist

Before committing:

```sh
npm run lint        # Validate JS and CSS
npm run lint:fix    # Auto-fix minor issues
```

Then:

```sh
git checkout -b feature/accordion-multi-open
git add blocks/accordion/ drafts/accordion-test.html
git commit -m "feat(accordion): add multi-open variant with nested block support"
```

In the PR, include a preview link: `https://{branch}--{repo}--{owner}.aem.page/drafts/accordion-test`
