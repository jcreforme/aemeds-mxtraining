# Hero Block

Hero block para AEM EDS con dos variantes. La variante **por defecto** (`hero`) replica el banner de portada de vyepti.com: una imagen a sangre completa con encabezado, copy, CTA y un descargo "Actor portrayal" superpuestos. La variante **split** (`hero (split)`) replica el banner dividido de la portada (`.teaser.homeBanner`): dos paneles de imagen lado a lado en desktop, apilados en móvil, cada uno con su copy centrado.

## 1. Authoring Contract

El decorador elige la variante según la clase del bloque: si tiene la clase `split` ejecuta `decorateSplit`, de lo contrario `decorateSingle`.

### Variante por Defecto (single-panel)

`decorateSingle` toma la **primera fila** del bloque y lee sus **dos primeras columnas**: la columna 1 es la imagen (media), la columna 2 es el contenido (encabezado, copy, CTA y descargo).

- **Columna 1**: `picture` (la imagen a sangre completa que define la altura del hero).
- **Columna 2**: contenido superpuesto.
  - El primer encabezado (`h1`) es el título.
  - Los párrafos son el copy.
  - Un link (`<a>`) se convierte en el CTA (pill rosa con flecha blanca).
  - El **último párrafo** que sea solo itálica (`em`/`i`) y sin link se marca como descargo `hero-disclaimer` ("Actor portrayal"). También se detecta un descargo previo con clases del sitio origen (`.cmp-teaser__description__secondary`, `.actor-portrayl-text-shadow`, `.actor-portrayal-text-shadow`).

```text
| hero | |
| [imagen a sangre completa] | # say yep to VYEPTI            |
|                            | Migraine prevention that's proven… |
|                            | [Check out study results](/…)  |
|                            | *Actor portrayal*              |
```

Notas de layout:

- Móvil: la imagen va debajo y el copy sobre un panel teal encima (la columna se invierte con `flex-direction: column-reverse`). La imagen se recorta a `aspect-ratio: 4 / 5`.
- Desktop (>= 900px): el contenido se superpone y centra sobre la imagen; `h1` ocupa 64% del ancho y el copy 60%.

Clases opcionales de punto focal (autorables en el bloque) que ajustan `object-position` de la imagen:

```text
| hero (focus-left)   | ...  |
| hero (focus-center) | ...  |
| hero (focus-right)  | ...  |
```

### Variante Split

`decorateSplit` recorre **cada fila** del bloque; cada fila es un panel. Dentro de la fila las celdas son **order-agnostic**: la celda que contiene un `picture` es el media, la otra es el contenido.

```text
| hero (split) | |
| [imagen izquierda] | When a showstopping migraine…       |
|                    | # nope                              |
|                    | *Actor portrayal*                   |
| [imagen derecha]   | It may be time to                   |
|                    | # say **yep** to **VYEPTI**         |
|                    | Migraine prevention that's proven…  |
|                    | [Check out study results](/…)       |
|                    | *Actor portrayal*                   |
```

`decoratePanelContent` clasifica cada celda de contenido:

- Encabezados (`h1`/`h2`/`h3`) → texto display (`hero-display`). Las palabras en **negrita** dentro del display se pintan en rojo de marca (`--hero-accent`).
- El párrafo inmediatamente después de un encabezado (sin link y que no sea descargo) → subtexto (`hero-subtext`).
- Un link (`<a>`) → CTA pill (`hero-cta`); si viene envuelto en `strong`/`em` se desenvuelve para que el propio link sea el botón.
- El **último párrafo** solo itálica y sin link → descargo (`hero-disclaimer`).

Estilos por panel:

- **Panel 1** (`hero-panel-1`): copy blanco sobre la foto oscura.
- **Panel 2** (`hero-panel-2`): copy teal, acentos rojos y CTA.
- Móvil: los paneles se apilan (`grid-template-columns: 1fr`); desktop (>= 900px): lado a lado (`1fr 1fr`).

## Accessibility

- El CTA es un link nativo (`<a>`); cuando el link viene envuelto en `strong`/`em`, se desenvuelve para preservar semántica limpia.
- Los encabezados autorados (`h1`) se conservan como encabezados reales, manteniendo la jerarquía del documento.
- El descargo se mantiene como texto (no reemplaza texto alternativo de imagen).
- Respeta `prefers-reduced-motion`: desactiva la transición del CTA.

> Nota: el bloque no añade `role`/`aria-*` explícitos; se apoya en el markup semántico de encabezados y links.

## CSS Customization

Variables CSS (design tokens) definidas en `:root` dentro de `hero.css`:

```css
--hero-accent         /* Rosa/rojo de marca del CTA y negritas (#c02c57) */
--hero-accent-hover   /* Hover del CTA (var(--accent-hover-color, #9a2346)) */
--hero-teal           /* Teal del copy en panel split (var(--link-color, #046183)) */
--hero-display-font   /* Fuente del texto display (nunito, …) */
--hero-text           /* Color de texto por defecto (#fff) */
--hero-overlay-pad    /* Padding del overlay en split (30px) */
--hero-transition     /* Transición del CTA (0.2s ease-in-out) */
--hero-mobile-bg      /* Gradiente teal del panel de copy en móvil */
```

## Performance Notes

- **Sin dependencias ni observers**: la decoración es síncrona y solo manipula DOM.
- La imagen del hero define la altura; en móvil se recorta con `aspect-ratio` y `object-fit: cover` para evitar reflow.
- El icono de flecha del CTA es un SVG inline vía `background` (data URI), sin peticiones extra.
- Breakpoints: 900px (ambas variantes) y 1440px (ajuste de tamaño display en split).
- Respeta `prefers-reduced-motion`.
