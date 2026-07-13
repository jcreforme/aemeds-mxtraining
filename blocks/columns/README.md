# Columns Block

Columns block del boilerplate de AEM EDS. Distribuye el contenido de cada fila en columnas lado a lado en desktop y apiladas en móvil. Detecta automáticamente las columnas que solo contienen una imagen para reordenarlas.

## 1. Authoring Contract

Cada **fila** del bloque es un grupo de columnas; cada **celda** de la fila es una columna.

- El número de columnas se toma de la **primera fila** (`block.firstElementChild.children`) y se añade la clase `columns-{N}-cols` al bloque (ej. `columns-2-cols`).
- Si una columna contiene **únicamente** una imagen (un `picture` como único hijo de su `div`), se marca con la clase `columns-img-col`.

### Estructura Conceptual

```text
| columns | |
| ## Título de la columna         | [imagen] |
| Texto de la columna con un link |          |
```

En este ejemplo la primera fila tiene 2 celdas → el bloque recibe la clase `columns-2-cols`, y la segunda celda (solo imagen) recibe `columns-img-col`.

### Comportamiento de Layout

- **Móvil** (por defecto): las columnas se apilan verticalmente (`flex-direction: column`). Las columnas de imagen (`columns-img-col`) se colocan primero (`order: 0`), el resto después (`order: 1`).
- **Desktop** (`width >= 900px`): las columnas se muestran en fila, centradas verticalmente, con `gap: 24px` y reparto equitativo (`flex: 1`).
- Las imágenes se limitan a un `30%` de ancho y se centran.

## 2. CSS Customization

`columns.css` no define variables CSS propias. Aplica estilos fijos al contenido:

- Títulos `h2` en color `#046183`, centrados, 25px.
- Párrafos `p` centrados.
- Los links `a` se renderizan como botones tipo "pill" (borde `2px solid #046183`, `border-radius: 999px`, bold).
- Regla especial para `.columns .icon-arrow2 img` (icono de flecha en línea, 80x10px).

## 3. Notas

- El número de columnas debe ser consistente entre filas; el conteo se calcula solo a partir de la primera fila.
