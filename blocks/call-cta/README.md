# Call CTA Block

Franja centrada de llamada a la acción ("Need help getting started on VYEPTI? Call ...") con un icono informativo opcional sobre una banda de color teal claro. Replica el componente original `.vyepti-homepage-call-cta`.

## 1. Authoring Contract

El bloque es una tabla de **una sola fila**. La fila puede tener una o dos celdas:

- **Celda de icono** (opcional): contiene únicamente un icono/imagen y ningún texto significativo.
- **Celda de texto**: contiene el mensaje, típicamente con un enlace `tel:` en negrita.

El JS detecta la celda de icono buscando una celda que tenga `.icon`/`img` **y** sin texto. La celda de texto es la otra celda con contenido (o la última celda si no se puede determinar).

### Estructura Conceptual

```text
| call-cta | | |
| :information: | **Need help getting started on VYEPTI? Call [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
```

La celda de icono es opcional: una fila de una sola celda renderiza solo el texto.

Clases aplicadas por el JS:

- La celda de icono recibe la clase `vyepti-homepage-info-icon`.
- La celda de texto recibe la clase `vyepti-homepage-cta`.

## Accessibility

- El bloque recibe `role="note"` para exponer el mensaje como una nota informativa a tecnologías de asistencia.
- Los iconos/imágenes de la celda de icono son decorativos: reciben `aria-hidden="true"` (el mensaje lo transmite el texto).

## CSS Customization

`call-cta.css` no define custom properties propias; usa variables globales del proyecto:

- `--light-color` — fondo de la banda teal claro.
- `--body-font-size-s` — tamaño de fuente del texto (móvil).
- `--link-color` / `--link-hover-color` — color del enlace y su hover.

En desktop (>= 900px) la banda se centra con `min-width: 800px` y el icono crece de 40px a 48px.

## Performance Notes

Bloque sin dependencias externas; decoración síncrona sencilla (una sola fila, sin fetch).
