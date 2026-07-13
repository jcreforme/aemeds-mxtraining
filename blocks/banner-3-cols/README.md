# Banner 3 Cols Block

Banner de columnas sobre un fondo con gradiente teal claro y esquinas superiores redondeadas. Cada fila se distribuye en columnas (apiladas en móvil, en fila desde 768px). Soporta una variante **icons** con un gráfico centrado sobre cada columna.

## 1. Authoring Contract

Cada **fila** del bloque es un grupo de columnas; cada **celda** de la fila es una columna. El JS:

- Añade a cada fila las clases `banner-3-cols-row` y `banner-3-cols-row-{N}`, donde `{N}` es el número de columnas de esa fila (p. ej. `banner-3-cols-row-3`, `banner-3-cols-row-2`).
- Añade `banner-3-cols-col` a cada columna.
- Marca como `banner-3-cols-label` el primer `h2`/`h3`/`h4` de la columna (o su primer hijo si no hay heading).

### Estructura Conceptual

```text
| banner-3-cols | | |
| ### Título A Texto A | ### Título B Texto B | ### Título C Texto C |
```

El número de columnas por fila es libre: la clase `banner-3-cols-row-{N}` refleja cuántas celdas escribió el autor. El CSS estiliza específicamente las filas de 2 columnas (`banner-3-cols-row-2`) para el bloque de estadísticas, donde:

- `h3` -> título de la estadística (teal).
- `h2` -> cifra grande destacada (magenta, itálica).
- párrafos tras el `h2` -> textos de apoyo (azul/teal según orden).
- `em` -> nota al pie pequeña en itálica.

### Variante icons

Agregar la clase `icons` al bloque activa un layout con el gráfico arriba, encabezado teal y texto debajo:

```text
| banner-3-cols (icons) | | |
| ![icono](icon1.png) ### Título A Texto A | ![icono](icon2.png) ### Título B Texto B | ![icono](icon3.png) ### Título C Texto C |
```

En esta variante, para cada columna el JS:

- Envuelve la primera `picture`/`img` en un `<div class="banner-3-cols-icon">` con `aria-hidden="true"` y lo coloca al inicio de la columna.
- Elimina los párrafos que quedaron vacíos tras extraer la imagen.

El CSS de `icons` quita el gradiente de fondo, centra el contenido y limita la imagen a `max-width: 286px`.

## Accessibility

- En la variante `icons`, el contenedor del gráfico recibe `aria-hidden="true"` (icono decorativo; el texto transmite el mensaje).

## CSS Customization

`banner-3-cols.css` no define custom properties propias; usa la variable global `--body-font-family` y colores codificados (teal `#046183`, gris `#333`, magenta `#c02c57`). El bloque tiene `max-width: 1140px` y esquinas superiores redondeadas (`border-radius: 23px 23px 0 0`).

Nota: el archivo también incluye reglas globales para `main h2#side-effects-in-clinical-studies` y su párrafo/enlace siguiente (fuera del scope del bloque).

## Performance Notes

Decoración síncrona ligera, sin dependencias ni fetch. En la variante `icons` solo se manipula el DOM (mover imagen, limpiar párrafos vacíos).
