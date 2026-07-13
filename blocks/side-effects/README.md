# Side Effects Block — Imagen + Contenido

Bloque de dos columnas (imagen + contenido) sobre fondo teal degradado, usado para destacar resultados de eficacia/seguridad. Soporta una imagen de fondo de desktop opcional, una caption superpuesta sobre la imagen (p. ej. "Actor portrayal"), y de-énfasis automático de paréntesis finales en los encabezados.

## 1. Authoring Contract

El bloque lee sus filas (`block.children`) así:

### Fila de fondo (opcional)

Si hay más de una fila y la **primera** fila tiene **una sola celda con una imagen**, esa imagen se usa como **fondo de desktop**: su `src` se expone en la custom property `--side-effects-bg` sobre el bloque, y la fila se elimina para que no se renderice como contenido. El fondo solo se aplica en ≥1200px.

### Fila de contenido (obligatoria)

La fila de contenido tiene **dos celdas**:

- **Celda 1 — Imagen** → `.side-effects-image`. La imagen (`<picture>`) se envuelve en un `.side-effects-figure`. Cualquier texto restante en la celda (fuera del `picture`/`img`) se captura como **caption** y se renderiza en `<span class="side-effects-caption">`, superpuesta sobre la imagen (p. ej. "Actor portrayal"). La caption puede ser un `<p>` propio, texto inline en el `<p>` de la imagen, o un nodo de texto suelto.
- **Celda 2 — Contenido** → `.side-effects-content`. Texto, encabezados (`h1`/`h2`/`h3`), párrafos.

### Estructura Conceptual

```text
| side-effects |                          |
| ![](bg-desktop.png) |                    |   ← fila de fondo opcional (1 celda con imagen)
| ![](woman.png) Actor portrayal | ## Up to 40% saw
|                          | # zero migraine days
|                          | ...copy... |
```

O sin fondo:

```text
| side-effects |                          |
| ![](woman.png) Actor portrayal | ## Up to 40% saw
|                          | # zero migraine days |
```

### De-énfasis de paréntesis en encabezados

En la celda de contenido, para cada `h1`/`h2`/`h3` cuyo texto termine en un paréntesis (p. ej. *"for a month or more (any 28 days in a row)"*), el paréntesis final se envuelve en `<span class="side-effects-light">` y se renderiza con peso normal (usando la fuente body, porque la fuente de encabezado solo trae peso 700). Solo aplica si el encabezado no tiene elementos hijos.

## 2. Accessibility

- La imagen conserva su `alt` autorado (el bloque no lo modifica).
- Los encabezados mantienen su nivel semántico (`h1`/`h2`/`h3`), preservando el outline del documento.

## 3. CSS Customization

`side-effects.css` define la siguiente custom property (fijada por el JS):

```css
--side-effects-bg  /* url() de la imagen de fondo de desktop (≥1200px); fallback: gradiente teal */
```

También consume `--body-font-family` para el paréntesis de-enfatizado. Colores fijos de marca:

```css
#eff6f9 / gradiente #d6eef7→#f2f9fc  /* fondo teal claro */
#046183  /* encabezados teal (h2/h3) */
#c02c57  /* headline principal (h1), p. ej. "zero migraine days" */
#333     /* texto y strong */
```

Layout: columna invertida en móvil (imagen abajo), fila 50/50 en desktop (≥900px). La caption se posiciona absoluta a la derecha/abajo de la imagen con `text-shadow` blanco.

## 4. Performance Notes

- El fondo de desktop se aplica solo en ≥1200px vía media query, evitando descargarlo en pantallas pequeñas.
