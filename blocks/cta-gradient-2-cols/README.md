# CTA Gradient 2 Cols Block

Rejilla de tarjetas de llamada a la acción. En móvil se apilan en una sola columna; en desktop (>= 900px) se muestran en dos columnas. Cada tarjeta tiene una barra de acento con gradiente (teal -> coral -> magenta) anclada al pie.

## 1. Authoring Contract

Cada **fila** del bloque es una tarjeta. El JS recorre `block.children` (cada fila = una tarjeta) y:

- Añade la clase `cta-card` a cada fila.
- Añade la clase `cta-card-body` a su primer hijo (la celda de contenido).

### Estructura Conceptual

```text
| cta-gradient-2-cols | |
| #### Eyebrow ← H4 (teal) ## Título ← H2/H3 (magenta) Texto de apoyo. [Learn More](/link) ← botón |
| #### Eyebrow ## Otro título Más texto. [Get Started](/start) |
```

Cada fila (tarjeta) contiene una celda con eyebrow, encabezado, párrafo y un enlace botón. Con dos filas se obtiene el layout de dos columnas en desktop.

Convenciones tipográficas aplicadas vía CSS:

- `h4` -> eyebrow en teal (#046183).
- `h2` / `h3` -> encabezado en magenta (#c02c57).
- `p` -> texto de cuerpo en gris (#333).
- `a.button` (dentro de `p.button-wrapper`) -> botón redondeado teal con flecha.

## Iconos

El botón CTA añade una flecha vía background de la celda `::after`:

- `/icons/cta-button-arrow-20-global-white.svg`

## CSS Customization

`cta-gradient-2-cols.css` no define custom properties propias; los colores están codificados directamente (teal `#046183`, hover `#035270`, magenta `#c02c57`). El contenedor usa `display: grid` con `max-width: 1140px` y `gap: 24px`.

## Performance Notes

Decoración síncrona muy ligera (solo asigna clases), sin dependencias ni fetch.
