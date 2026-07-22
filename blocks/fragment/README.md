# Fragment Block

Standard AEM Edge Delivery block ([block-collection/fragment](https://www.aem.live/developer/block-collection/fragment)) that includes the content of another page of the site inline, as a reusable fragment. Useful for content shared across pages (notices, legal banners, common sections).

## 1. Authoring Contract

The block contains the **path to the fragment**. It can be written in two ways (the JS accepts both):

- A **link** (`a`) whose `href` points to the fragment path.
- Or the **plain text** of the path inside the block.

The path must be an absolute internal path starting with `/` (URLs with `//` are not accepted).

### Conceptual Structure

```text
| fragment | |
| [/fragments/shared/footer-note](/fragments/shared/footer-note) |
```

or simply:

```text
| fragment | |
| /fragments/shared/footer-note |
```

### Behavior

- The JS does a `fetch` of `{path}.plain.html`, decorates the content with `decorateMain`, and loads it with `loadSections`.
- It rewrites the base media paths (`img[src^="./media_"]` and `source[srcset^="./media_"]`) to resolve them relative to the fragment path.
- It replaces the block's content with the nodes of the loaded fragment.
- **Fail-open**: if something fails, it ensures the parent section is not left hidden (it sets `sectionStatus = 'loaded'` and clears `display`). Errors are logged with `console.error`.

`loadFragment(path)` is exported and can be reused from other blocks (e.g. header/footer).

## CSS Customization

`fragment.css` is intentionally empty (only a `stylelint-disable` comment). The fragment inherits the styling of the sections and blocks it contains.

## Performance Notes

- The fragment is loaded via `fetch` at runtime, which adds an additional network request and decoration/loading of its own sections.
