# Hero Two Columns Block

Hero de una sola columna de contenido superpuesto sobre una **imagen de fondo responsive**. El bloque combina una o varias imágenes autoradas en un único `<picture>` con `<source media>` por breakpoint y coloca los encabezados centrados encima. Incluye un descargo "Actor portrayal" opcional en la esquina inferior.

## 1. Authoring Contract

`decorate` recorre **todas las filas** del bloque y clasifica cada una leyendo su **primera celda**:

- **Filas solo-imagen** (celda con `picture` y **sin encabezado**): aportan las imágenes de fondo responsive. Se acumulan en orden para generar las `<source>`.
- **Fila de contenido** (celda con encabezado `h1`/`h2`/`h3`/`h4`): es el texto superpuesto. Si no se encuentra ninguna, se usa la última fila.

El orden de las filas de imagen mapea a estas media queries (mayor primero):

```text
1ª fila de imagen  → (min-width: 1200px)
2ª fila de imagen  → (min-width: 768px)
3ª fila de imagen  → (min-width: 375px)  + <img> fallback
```

```text
| hero-two-columns | |
| [imagen desktop 1200px] |
| [imagen tablet 768px]   |
| [imagen móvil 375px]    |
| ### Subtítulo (H3)      |
| # Título principal (H1) |
| *Actor portrayal*       |
```

Del contenido de la fila de texto:

- Todos los encabezados (`h1`..`h4`) se mueven a un contenedor `hero-two-columns-content`.
- El **descargo** es el `<p>` que contiene un `<em>` y **no** contiene imagen; se marca como `hero-two-columns-caption` y se posiciona abajo a la derecha.

### Compatibilidad hacia atrás (legacy)

Si no hay filas de imagen dedicadas, el bloque busca un `picture` dentro de la fila de contenido y lo usa como fondo único.

### Variante financial-assistance

La sección puede llevar la clase `hero-banner-financial-assistance` (aplicada al contenedor de sección), que ajusta el padding del contenido y el ancho máximo del `h1` en móvil, tablet y desktop.

## Accessibility

- El `<img>` fallback conserva el `alt` de la imagen móvil autorada.
- La imagen de fondo se carga con `loading="eager"` (es LCP).
- Se preservan los encabezados autorados (`h1`/`h3`), manteniendo la jerarquía del documento.
- El descargo se mantiene como texto (`<p><em>`), sin sustituir el `alt` de la imagen.

> Nota: el bloque no añade `role`/`aria-*` explícitos.

## CSS Customization

`hero-two-columns.css` **no define variables `--custom-property`**; usa valores literales. Puntos de personalización habituales:

- Gradiente de fondo móvil: `linear-gradient(120deg, #cdeef7 0%, #e8f6fb 60%, #f3fafd 100%)` en `.hero-two-columns` (se desactiva en >= 768px, donde manda la imagen).
- Color del subtítulo (`h3`): `#333`.
- Color del título (`h1`): `#046183` (teal de marca).
- Fuente: `proxima-nova, arial, sans-serif`.
- `object-position: 70% center` en la imagen de fondo (>= 768px).

Breakpoints: 600px, 768px, 1200px y 1900px.

## Performance Notes

- **`<picture>` responsive único**: una sola imagen sirve las tres resoluciones vía `<source media>`, evitando descargar assets innecesarios.
- La imagen de fondo usa `loading="eager"` por ser el LCP del hero.
- Sin JavaScript de interacción ni observers; la decoración es síncrona.
- En móvil el fondo se sustituye por un gradiente CSS ligero; la imagen a sangre completa solo aparece desde 768px.
