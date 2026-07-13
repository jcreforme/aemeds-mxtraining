# Carousel Quote Block

Carrusel de slides tipo "cita" con imagen y contenido lado a lado. Cada slide combina una imagen a la derecha (a sangre completa en la celda) y contenido a la izquierda: un icono de comillas, un encabezado con línea roja de acento, texto y un link opcional. Incluye indicadores (dots), flechas de navegación previa/siguiente y detección de slide activo por scroll.

## 1. Authoring Contract

`decorate` toma **cada fila** del bloque (`:scope > div`) como un slide. Dentro de cada fila, las columnas (`:scope > div`) se clasifican por posición:

- **Columna 1** → imagen del slide (`carousel-quote-slide-image`): un `picture`.
- **Columna 2..N** → contenido del slide (`carousel-quote-slide-content`).

```text
| carousel-quote | |
| [imagen slide 1] | :icono-comillas:                 |
|                  | ## Cita o titular del slide      |
|                  | Texto de apoyo del slide…        |
|                  | [Enlace opcional](/…)            |
| [imagen slide 2] | :icono-comillas:                 |
|                  | ## Segundo titular               |
|                  | Más texto…                       |
```

En la columna de contenido, el decorador:

- Marca como `quotation` el `<p>` que contiene un `.icon` (icono de comillas), aplicándole un tamaño/escala especiales.
- Inserta un `<hr class="red-short-line">` (línea roja de acento) **después del primer encabezado** (`h1`..`h6`).
- Usa el `id` del encabezado del slide para enlazar `aria-labelledby` en el slide.

### Slide único vs. múltiples

Si el bloque tiene **una sola fila** (`rows.length < 2`), es un carrusel de un solo slide: **no** se generan indicadores, botones de navegación ni listeners. Con dos o más filas se añaden dots, flechas y la lógica de interacción completa.

## Accessibility

El bloque construye markup accesible de carrusel:

- El bloque recibe `role="region"` y `aria-roledescription="Carousel"`.
- Cada slide obtiene un `id` (`carousel-quote-{n}-slide-{i}`) y, si tiene encabezado, `aria-labelledby` apuntando a ese encabezado.
- Los slides no activos se marcan con `aria-hidden="true"` y sus links reciben `tabindex="-1"` (se quitan del orden de tabulación); el slide activo restaura los links.
- La navegación de dots va dentro de un `<nav aria-label="Carousel Slide Controls">`; cada dot es un `<button>` con `aria-label` "Show Slide {i} of {total}". El dot del slide activo se marca con `disabled`.
- Las flechas son `<button type="button">` con `aria-label` "Previous Slide" / "Next Slide" (`slide-prev` / `slide-next`).

> Los textos accesibles se toman de un objeto `placeholders` con valores por defecto en inglés (`'Carousel'`, `'Previous Slide'`, etc.).

### Interacción

- **Dots**: al hacer click, `showSlide` desplaza al slide destino (`dataset.targetSlide`).
- **Flechas**: prev/next calculan el índice a partir de `block.dataset.activeSlide`; el desplazamiento hace wrap-around (antes del primero → último; después del último → primero).
- **Scroll / snap**: los slides usan `scroll-snap-type: x mandatory`; un `IntersectionObserver` (threshold 0.5) marca el slide activo cuando entra en vista y sincroniza `aria-hidden`, `tabindex` y el estado de los dots.

## CSS Customization

Variables CSS definidas en `.carousel-quote` dentro de `carousel-quote.css`:

```css
--cq-bg        /* Fondo de cada slide (#eaf4f8) */
--cq-text      /* Color de texto/encabezado teal (#005b84) */
--cq-accent    /* Rosa de acento: línea roja e indicadores (#d62b70) */
--cq-arrow-bg  /* Fondo de los botones de flecha (rgb(255 255 255 / 88%)) */
```

Otros detalles de estilo:

- Las flechas de navegación son botones circulares con un chevron dibujado con `border` (sin imágenes).
- La línea de acento bajo el encabezado (`.red-short-line`) mide 60x3px.
- El icono de comillas (`.quotation img`) se muestra escalado (`transform: scale(3.0)`).

## Performance Notes

- **Sin autoplay**: el carrusel avanza solo por interacción del usuario (dots, flechas, scroll). No hay temporizadores.
- **IntersectionObserver** (threshold 0.5) para detectar el slide activo, más eficiente que escuchar `scroll`.
- Scroll nativo con `scroll-snap` y `scroll-behavior: smooth`; sin librerías externas.
- El slide único omite toda la lógica de interacción y observers.
- Breakpoint móvil: <= 767px (imagen arriba, contenido abajo, una sola columna).
