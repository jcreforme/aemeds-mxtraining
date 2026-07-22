# Widget Block

Dynamic "widget" loader. It takes a link to a file under `/widgets/` and loads its resources inline: the HTML is injected into the block, and its associated CSS and JS are loaded and executed. It allows packaging self-contained mini-components (HTML + CSS + JS) outside the standard block system.

## 1. Authoring Contract

The block contains a **link** (`a[href]`) that points to a widget inside `/widgets/`. The widget name is derived from the last segment of the path (without the extension); the remaining segments form the widget's folder.

### Conceptual Structure

```text
| widget | |
| [my-widget](/widgets/path1/my-widget.html) |
```

From that link, the JS resolves and loads three sibling resources using `window.hlx.codeBasePath`:

- `/widgets/{path}/{name}.html` -> injected as the block's `innerHTML` (via `fetch`).
- `/widgets/{path}/{name}.css` -> loaded with `loadCSS`.
- `/widgets/{path}/{name}.js` -> dynamically imported; if it exports a `default`, it is invoked with the widget element.

### Classes and data applied after loading

- The `{name}` class (widget name) is added to the block and `block` is removed.
- `widget.dataset.source` = original href of the link.
- Each query parameter of the href is copied to `widget.dataset[key]`.
- The `.widget-wrapper` container becomes `{name}-wrapper` and the `.widget-container` becomes `{name}-container`.

If loading fails, the error is logged to the console (`console.error`) and the block is left undecorated.

## CSS Customization

`widget.css` only declares `display: block` for the block; it does not define custom properties. The visual styling of each widget is provided by its own `{name}.css` loaded dynamically.

## Performance Notes

- On-demand loading: the widget's HTML, CSS, and JS are requested at runtime (`fetch` + dynamic `import()` + `loadCSS`), which adds additional network requests.
- The CSS and JS decoration are awaited in parallel with `Promise.all`.
