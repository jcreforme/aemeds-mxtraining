# Study Results Block — Resultados del Estudio

Bloque que presenta los resultados de un estudio clínico dentro de una caja con esquinas superiores redondeadas y fondo degradado teal. Clasifica automáticamente cada fila según su forma (número de celdas y presencia de imagen) en cuatro tipos de contenido: título, fila de estadísticas (3 columnas), banner de seguridad, y fila de impacto (imagen + texto).

## 1. Authoring Contract

`decorate(block)` primero normaliza la estructura (ver más abajo) y luego `classify(block)` recorre `block.children` y asigna clases según la forma de cada fila:

| Forma de la fila | Clase asignada | Uso |
|------------------|----------------|-----|
| 3 celdas | `.study-results-stats` (cada celda → `.study-results-stat`) | Fila de 3 estadísticas |
| 1 celda con imagen | `.study-results-safety` | Banner de seguridad (icono escudo + heading) |
| 2 celdas | `.study-results-impact` (celda 1 → `-impact-image`, celda 2 → `-impact-text`) | Imagen redonda + texto |
| 1 celda con heading y texto | `.study-results-title` | Título de sección (se deja) |
| 1 celda sin heading | *(se elimina)* | Fila vacía descartada |

En las filas de estadísticas, la **etiqueta** de cada stat es un `<h4>` (o el primer hijo de la celda) y recibe `.study-results-stat-label`.

### Estructura Conceptual

```text
| study-results |          |          |
| ## Study Results         |          |          |   ← título (1 celda con heading)
| #### 75%                 | #### 50% | #### 30% |   ← 3 stats (h4 = label + texto debajo)
| Reduction ...            | ...      | ...      |
| ![](shield.svg) ## Well-studied safety |    |    |   ← banner seguridad (1 celda + imagen)
| ![](patient.png)         | ## Real impact **for patients** ... |  ← impacto (imagen + texto) |
```

### Normalización de tabla anidada

Cuando el bloque se autora como una **tabla anidada** cuya celda de nombre no es la primera, EDS deja el `<table>` crudo dentro del bloque. En ese caso el JS reconstruye la estructura esperada de `div`/celdas:

- Un encabezado (`h1`/`h2`/`h3`) autorado **fuera** de la tabla se **extrae** y se coloca **antes** del bloque, envuelto en `.study-results-title`, para que renderice como título de sección (no dentro de la caja).
- Cada `<tr>` (excepto el que dice `study-results`) se convierte en una fila `div` con celdas `div` que preservan el `innerHTML` de cada `<td>`.
- Tras reconstruir, se ejecuta `classify()`.

## 2. Variante Odd

El CSS soporta un contexto `.study-results-odd` (aplicado en la sección/página, no por el JS) que invierte los colores del texto de impacto:

```text
.study-results-odd  →  h2 en #333, strong en teal #046183 (en vez de coral)
```

## 3. Accessibility

- El bloque no añade roles ni ARIA; se apoya en la semántica de los encabezados autorados (`h1`/`h2`/`h3`/`h4`), que preservan el outline del documento.
- Las imágenes conservan su `alt` autorado.

## 4. CSS Customization

`study-results.css` no declara `--custom-properties` propias; consume `--body-font-family` y `--heading-font-family`. Colores fijos de marca:

```css
#046183  /* teal: título, labels de stats, heading de seguridad */
#c02c57  /* coral: strong en el texto de impacto */
#333     /* texto base */
gradiente #e8f3f5 → #fff  /* fondo degradado de la caja */
```

Detalles: caja con `border-radius: 23px 23px 0 0`, ancho máximo 1140px. La imagen de impacto se recorta en círculo (`border-radius: 50%`, 250px). El banner de seguridad usa un icono de ~116px. Layout responsivo: stacks en columna en móvil, fila de 3 stats y fila de impacto lado a lado en ≥700px/≥900px.

## 5. Performance Notes

- No hay peticiones de red ni dependencias: toda la clasificación se realiza con DOM APIs en la decoración.
