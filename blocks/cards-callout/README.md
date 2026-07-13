# Cards Callout Block

Variante del cards block orientada a destacar información (callout). Comparte la misma lógica de decoración que `cards`: transforma cada fila del bloque en un item de lista (`<ul>` / `<li>`) mostrado en una cuadrícula responsiva, con soporte para imagen y cuerpo de texto por tarjeta.

## 1. Authoring Contract

Cada **fila** del bloque representa una tarjeta. Dentro de cada fila, cada **celda** se convierte en una parte de la tarjeta:

- Una celda cuyo único contenido es una imagen (`picture`) se marca como `cards-callout-card-image`.
- Cualquier otra celda se marca como `cards-callout-card-body` (título, texto, links, etc.).

### Estructura Conceptual

```text
| cards-callout | |
| [imagen] | ### Título del callout         |
|          | Texto destacado del callout.    |
| [imagen] | ### Otro callout                |
|          | Más texto destacado.            |
```

Notas derivadas del código:

- El bloque recorre `block.children` (las filas) y mueve el contenido de cada fila a un `<li>`.
- La detección de imagen es literal: la celda debe tener **un único hijo** que contenga un `<picture>` para clasificarse como `cards-callout-card-image`.
- Las imágenes se reemplazan por versiones optimizadas con `createOptimizedPicture` (ancho de 750px, sin `eager`).

## 2. CSS Customization

`cards-callout.css` no define variables CSS propias. Consume la variable global:

```css
--background-color   /* Fondo de cada tarjeta (li) */
```

Detalles de layout:

- La cuadrícula usa `grid-template-columns: repeat(auto-fill, minmax(257px, 1fr))` con `gap: 24px`.
- Cada tarjeta tiene borde `1px solid #dadada`.
- Las imágenes se ajustan con `aspect-ratio: 4 / 3` y `object-fit: cover`.

## 3. Performance Notes

- Las imágenes se optimizan con `createOptimizedPicture` y se cargan de forma diferida (`eager = false`), lo que favorece el LCP cuando el bloque está por debajo del pliegue.
