# Columns Hero Block

Variante del columns block orientada a secciones hero. Comparte la lógica de decoración de `columns` pero con estilos pensados para imágenes a ancho completo. Distribuye el contenido de cada fila en columnas lado a lado en desktop y apiladas en móvil.

## 1. Authoring Contract

Cada **fila** del bloque es un grupo de columnas; cada **celda** de la fila es una columna.

- El número de columnas se toma de la **primera fila** (`block.firstElementChild.children`) y se añade la clase `columns-hero-{N}-cols` al bloque (ej. `columns-hero-2-cols`).
- Si una columna contiene **únicamente** una imagen (un `picture` como único hijo de su `div`), se marca con la clase `columns-hero-img-col`.

### Estructura Conceptual

```text
| columns-hero | |
| # Título hero                | [imagen] |
| Subtítulo y llamado a acción |          |
```

En este ejemplo la primera fila tiene 2 celdas → el bloque recibe la clase `columns-hero-2-cols`, y la segunda celda (solo imagen) recibe `columns-hero-img-col`.

### Comportamiento de Layout

- **Móvil** (por defecto): las columnas se apilan verticalmente (`flex-direction: column`). Las columnas de imagen (`columns-hero-img-col`) se colocan primero (`order: 0`), el resto después (`order: 1`).
- **Desktop** (`width >= 900px`): las columnas se muestran en fila, centradas verticalmente, con `gap: 24px` y reparto equitativo (`flex: 1`).
- A diferencia de `columns`, las imágenes ocupan `width: 100%` (ancho completo de su columna).

## 2. CSS Customization

`columns-hero.css` no define variables CSS propias. Aplica estilos de layout (flex, orden de columnas e imágenes a ancho completo).

## 3. Notas

- El número de columnas debe ser consistente entre filas; el conteo se calcula solo a partir de la primera fila.
