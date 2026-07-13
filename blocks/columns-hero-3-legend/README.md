# Columns Hero 3 Legend Block

Bloque de columnas para una sección tipo hero con **texto**, **gráfico/imagen** y una **leyenda con iconos**. El decorador clasifica automáticamente cada columna por su contenido (encabezados, lista, imágenes) y aplica un layout asimétrico en desktop. Soporta un descargo (`h6`) que se reubica según el breakpoint.

## 1. Authoring Contract

`decorate` toma la **primera fila** del bloque y trata cada celda como una columna. Añade al bloque la clase `columns-hero-3-legend-{N}-cols` según el número de columnas.

Cada columna se clasifica leyendo su contenido:

- **Columna de leyenda** (`columns-hero-3-legend-legend-col`): contiene una lista (`ul`/`ol`) cuyos items llevan **iconos** (`picture`/`img`) y **no** tiene encabezados.
- **Columna de imagen/gráfico** (`columns-hero-3-legend-img-col`): contiene solo `picture`(s), sin lista ni encabezados.
- **Columna de texto**: el resto (encabezado + párrafos + lista de bullets sin iconos).

```text
| columns-hero-3-legend | | |
| ## Título teal        | [imagen desktop]   | - [icono] Etiqueta 1 |
| Texto descriptivo     | [imagen móvil]     | - [icono] Etiqueta 2 |
| - bullet uno          |                    | - [icono] Etiqueta 3 |
| - bullet dos          |                    |                      |
| ###### Descargo (h6)  |                    |                      |
```

### Columna de imagen: swap desktop/móvil

Si la columna de imagen tiene **dos o más** `picture`, el bloque construye un `<picture>` responsive único que intercambia en el breakpoint **900px**:

- 1ª imagen → `<source media="(min-width: 900px)">` (desktop).
- 2ª imagen → `<img>` fallback (móvil), con `loading="lazy"`.

El resto de imágenes autoradas se eliminan.

### Descargo (h6) reubicable

El descargo se autora como `h6` **dentro de la columna de texto** y recibe la clase `columns-hero-3-legend-disclaimer`. Su posición se ajusta con un `matchMedia('(min-width: 900px)')`:

- **Desktop (>= 900px)**: permanece al final de la columna de texto.
- **Móvil**: se mueve al final de la fila, para quedar debajo del gráfico y la leyenda (no directamente bajo los bullets).

El listener `change` reubica el descargo dinámicamente al cambiar de breakpoint.

### Layout

- Móvil/tablet: columnas apiladas, contenido centrado, `max-width: 540px`.
- Desktop (>= 900px): tres columnas en fila con anchos asimétricos aprox. 5 / 5 / 2 (texto / gráfico / leyenda), alineado a la izquierda, `max-width: 1140px`.
- La leyenda es una fila horizontal centrada en móvil y una lista vertical apilada en desktop.

## Accessibility

- Se preservan los encabezados autorados (`h2`, `h6`), manteniendo la jerarquía del documento.
- El `<img>` fallback del swap conserva el `alt` de la imagen móvil autorada.
- Las listas se mantienen como listas semánticas (`ul`/`ol`, `li`).

> Nota: el bloque no añade `role`/`aria-*` explícitos.

## CSS Customization

`columns-hero-3-legend.css` **no define variables `--custom-property`**; usa valores literales. Puntos de personalización habituales:

- Fondo a sangre completa de la sección: `#eff6f9`.
- Color del título (`h2`): `#046183` (teal de marca).
- Marcador de bullets de la lista de texto: `\2022` en color `#c02c57` (rosa de marca), 30px.
- Tamaño de los iconos de leyenda: `24px`.
- Flex ratios desktop: texto `5`, imagen `5`, leyenda `2`.

Breakpoint principal: 900px.

## Performance Notes

- **`<picture>` responsive único**: cuando hay imagen desktop + móvil, un solo `<picture>` sirve ambas vía `<source media>`, con `loading="lazy"` en el fallback.
- La reubicación del descargo usa `matchMedia` (sin polling ni resize listeners costosos).
- Sin dependencias externas; decoración síncrona.
