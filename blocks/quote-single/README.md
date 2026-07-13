# Quote Single Block — Cita Destacada

Bloque de cita destacada sobre panel teal, con imagen art-directed opcional a la derecha (en desktop). Renderiza una cita, un autor y un disclaimer opcional junto a una imagen responsiva construida como `<picture>` a partir de imágenes provistas por el autor.

## 1. Authoring Contract

El bloque es tolerante a distintas formas de autoría, porque el pegado desde DA puede aplanar el contenido en una sola celda. El JS **no depende de una tabla rígida**: consulta el DOM directamente.

### Texto de la cita

- **Cita**: el primer `blockquote`, `h1`, `h2` o `h3` del bloque → `.quote-single-quote`.
- **Autor**: el primer párrafo que contiene un `<strong>` → `.quote-single-author`.
- **Disclaimer** (opcional): el último párrafo, si no es el autor → `.quote-single-disclaimer`.

Se filtran los párrafos que contienen imágenes, los que están dentro de un `blockquote`, los vacíos y los que son etiquetas de breakpoint (`desktop`, `tablet`, `mobile`, `small desktop`).

### Imágenes responsivas (opcional)

Cada imagen se empareja con la **etiqueta de breakpoint** que la precede (texto en el elemento hermano previo). Solo se soportan dos imágenes:

- Etiqueta que contiene **`desktop`** → obtiene su propio `<source media="(min-width: 900px)">`.
- Cualquier otra (incluida `mobile` / `tablet`) → se usa como `<img>` de fallback.

El `alt` de la imagen se toma del texto del autor.

### Estructura Conceptual

Como filas separadas (label + imagen):

```text
| quote-single |                                          |
| "VYEPTI helped me get back to my life."                 |
| **Jane D., VYEPTI patient**                             |
| Individual results may vary.                            |
| desktop      | ![](quote-desktop.png)                    |
| mobile       | ![](quote-mobile.png)                     |
```

O aplanado en una sola celda (secuencia de párrafos), igualmente soportado:

```text
| quote-single |
| "VYEPTI helped me get back to my life."
| **Jane D., VYEPTI patient**
| Individual results may vary.
| desktop
| ![](quote-desktop.png)
| mobile
| ![](quote-mobile.png) |
```

## 2. Variante Sin Imagen

Si el autor no provee ninguna imagen, el bloque recibe la clase **`quote-single-no-image`** automáticamente y el texto ocupa todo el panel (ancho máximo 760px móvil, 100% en desktop). No es una clase que el autor añada: se aplica por ausencia de imágenes.

## 3. Accessibility

- La imagen recibe `alt` derivado del texto del autor.
- Las imágenes se cargan con `loading="lazy"`.
- La cita se renderiza con el elemento semántico autorado (`blockquote`/`h1`/`h2`/`h3`), preservando el outline del documento.

## 4. CSS Customization

`quote-single.css` no declara `--custom-properties` propias; usa colores fijos de marca y consume `--body-font-family`. Colores clave:

```css
#046183  /* fondo teal del panel */
#e8635a  /* coral: círculo de la comilla decorativa y línea sobre el autor */
#fff     /* texto blanco */
```

Detalles visuales: comilla decorativa (`\201C`) en un círculo coral, línea coral de 50×4px sobre el autor, layout en columna en móvil y en fila (60% texto / 40% imagen) en desktop (≥900px). La imagen usa `object-fit: cover` con `object-position: center bottom`.

## 5. Performance Notes

- `<picture>` art-directed sirve la imagen desktop solo en ≥900px vía `<source media>`, evitando descargar la variante grande en móvil.
- Imágenes con `loading="lazy"`.
