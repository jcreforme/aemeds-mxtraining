# ISI Block — Authoring Guide

The ISI (Important Safety Information) block renders the required pharmaceutical safety disclosure. It automatically produces two coordinated components from a single authored table:

1. **Sticky bottom tray** — fixed to the viewport bottom while the user reads the page.
2. **Inline panel** — anchored in the page flow, above the footer, at `#SafetyPanelInfo`.

---

## Authoring in Google Docs / SharePoint

Create a one-column table with the block name **isi** in the header row, and all content in a single body cell:

| isi |
|-----|
| *(all ISI content — see structure below)* |

### Content structure inside the cell

The block splits content into sections using **Heading 5** (`#####`) as dividers. You must have exactly two sections in this order:

1. **APPROVED USE** — heading + one paragraph summary
2. **IMPORTANT SAFETY INFORMATION** — heading + one summary paragraph + full detail (bullet lists, additional paragraphs, PI/PPI links)

```
##### APPROVED USE
VYEPTI is a prescription medicine used for the preventive treatment of migraine in adults.

##### IMPORTANT SAFETY INFORMATION
**Do not receive VYEPTI** if you have a known allergy to eptinezumab-jjmr or its ingredients.

**VYEPTI may cause serious side effects such as:**
- **Allergic reactions.** Call your healthcare provider or get emergency medical help right away…
- **High blood pressure.** High blood pressure or worsening of high blood pressure can happen…
- **Raynaud's phenomenon.** A type of circulation problem…

**Before starting VYEPTI,** tell your healthcare provider about all your medical conditions…

**Tell your healthcare provider** about all the medicines you take…

**The most common side effects** of VYEPTI include stuffy nose and scratchy throat…

**You are encouraged to report negative side effects of prescription drugs to the FDA.
Visit [www.fda.gov/medwatch](https://www.fda.gov/medwatch) or call 1-800-FDA-1088.**

**For more information, please see the [Prescribing Information](…) and [Patient Information](…).**
```

---

## What renders where

### Sticky bottom tray

| Content | Desktop | Mobile |
|---------|---------|--------|
| ISI heading + **first paragraph** | Left column | Full width |
| "AND APPROVED USE" subtitle | Hidden | Shown inside ISI heading |
| APPROVED USE heading + paragraph | Right column | Hidden |
| +/− toggle button | Far right | Far right |
| Full ISI detail (bullets, paragraphs) | Slides in below header on expand | Slides in below header on expand |

- The tray **automatically slides away** when the user scrolls to the inline panel.
- Clicking the header area or the +/− button **expands / collapses** the full ISI detail.
- The Escape key collapses the tray when expanded.
- Links inside the expanded body open normally without collapsing the tray.

### Inline panel (`#SafetyPanelInfo`)

All content is always visible — there is no accordion here. Layout is single-column:

1. APPROVED USE heading + paragraph
2. IMPORTANT SAFETY INFORMATION heading + first paragraph
3. Full ISI detail (bullets and remaining paragraphs)

A **back-to-top button** (blue circle, top-right) is always visible and scrolls the user to the top of the page.

---

## Rules for authors

| Rule | Detail |
|------|--------|
| Section order | APPROVED USE must come **before** IMPORTANT SAFETY INFORMATION |
| Section headings | Must use **Heading 5** — not bold text, not Heading 4 or 6 |
| APPROVED USE body | One paragraph only. Additional paragraphs will appear in the tray summary but not the tray detail |
| ISI summary | The **first** paragraph after the IMPORTANT SAFETY INFORMATION heading appears in the collapsed tray. Make it the most critical disclosure ("Do not receive…") |
| ISI detail | Everything after the first ISI paragraph is hidden in the tray until the user expands it |
| PDF links | Links ending in `.pdf` automatically open in a new tab |
| Placement on page | Place the ISI block as the **last section** on the page, just above the footer |

---

## Page placement example

```
[Hero]
[Content sections…]
[ISI]        ← last section, just above footer
[Footer]
```

The ISI block must be in its own section (its own pair of `---` dividers in Google Docs, or its own row in the page structure). Do not add other content blocks inside the same section.

---

## Anchor links

Other blocks on the page can link to the inline panel using the anchor `#SafetyPanelInfo`:

```
[See full Important Safety Information](#SafetyPanelInfo)
```

This is the same anchor used in the real site footer and utility navigation.
