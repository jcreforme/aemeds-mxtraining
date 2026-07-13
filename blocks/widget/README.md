# Widget Block

Cargador dinámico de "widgets". Toma un enlace a un archivo bajo `/widgets/` y carga en línea sus recursos: el HTML se inyecta en el bloque, y su CSS y JS asociados se cargan y ejecutan. Permite empaquetar mini-componentes autónomos (HTML + CSS + JS) fuera del sistema estándar de blocks.

## 1. Authoring Contract

El bloque contiene un **enlace** (`a[href]`) que apunta a un widget dentro de `/widgets/`. El nombre del widget se deriva del último segmento del path (sin extensión); el resto de segmentos forman la carpeta del widget.

### Estructura Conceptual

```text
| widget | |
| [my-widget](/widgets/path1/my-widget.html) |
```

A partir de ese enlace, el JS resuelve y carga tres recursos hermanos usando `window.hlx.codeBasePath`:

- `/widgets/{path}/{name}.html` -> se inyecta como `innerHTML` del bloque (vía `fetch`).
- `/widgets/{path}/{name}.css` -> se carga con `loadCSS`.
- `/widgets/{path}/{name}.js` -> se importa dinámicamente; si exporta un `default`, se invoca con el elemento del widget.

### Clases y datos aplicados tras cargar

- Se añade al bloque la clase `{name}` (nombre del widget) y se elimina `block`.
- `widget.dataset.source` = href original del enlace.
- Cada parámetro de query del href se copia a `widget.dataset[key]`.
- El `.widget-wrapper` contenedor pasa a `{name}-wrapper` y el `.widget-container` pasa a `{name}-container`.

Si la carga falla, el error se registra en consola (`console.error`) y el bloque queda sin decorar.

## CSS Customization

`widget.css` solo declara `display: block` para el bloque; no define custom properties. El estilo visual de cada widget lo aporta su propio `{name}.css` cargado dinámicamente.

## Performance Notes

- Carga bajo demanda: HTML, CSS y JS del widget se solicitan en tiempo de ejecución (`fetch` + `import()` dinámico + `loadCSS`), lo que añade peticiones de red adicionales.
- El CSS y la decoración JS se esperan en paralelo con `Promise.all`.
