# CTA 1 Col Block

Tarjeta única de llamada a la acción (una columna) con encabezado, texto y botón. En móvil/tablet muestra una barra de acento con gradiente (teal -> coral -> magenta) al pie de la tarjeta; en desktop la disposición pasa a fila horizontal y una imagen de marca opcional se ancla al borde izquierdo.

## 1. Authoring Contract

El bloque es una tabla de **una sola fila**. Cada celda de esa fila se clasifica automáticamente según su contenido:

- Celda que contiene `picture`/`img` -> `cta-card-shape` (gráfico de marca, visible solo en desktop).
- Celda que contiene un enlace `a` -> `cta-card-action` (el botón CTA).
- Cualquier otra celda -> `cta-card-text` (eyebrow, encabezado y párrafo).

La fila completa recibe la clase `cta-card`.

### Estructura Conceptual

```text
| cta-1-col | | |
| ![shape](shape.png) | #### Eyebrow ← H4 (teal) ## Título ← H2/H3 (magenta) Texto de apoyo. | [Get Started](/start) |
```

El orden y número de celdas es flexible: la clasificación se hace por contenido, no por posición. Una celda sin imagen ni enlace siempre se trata como texto.

Convenciones tipográficas aplicadas vía CSS:

- `h4` -> eyebrow en teal (#046183).
- `h2` / `h3` -> encabezado en magenta (#c02c57).
- `p` -> texto de cuerpo en gris (#333).
- `a.button` -> botón redondeado teal con flecha.

## Iconos

El botón CTA añade una flecha vía background de la celda `::after`:

- `/icons/cta-button-arrow-20-global-white.svg`

## CSS Customization

`cta-1-col.css` no define custom properties propias; los colores están codificados directamente (teal `#046183`, hover `#035270`, magenta `#c02c57`). El ancho máximo del bloque es `1140px`.

## Performance Notes

- La imagen de marca (`cta-card-shape`) está oculta en móvil/tablet (`display: none`) y solo se muestra en desktop (>= 900px).
- Decoración síncrona sencilla, sin dependencias ni fetch.
