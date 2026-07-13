# Quote Block

Bloque de cita destacada con un panel de texto (cita, autor y disclaimer) junto a una imagen. El JavaScript es mínimo: solo añade la clase `quote-block` al bloque; todo el diseño vive en el CSS, que se basa en el **orden de los párrafos** y la estructura de celdas.

## 1. Authoring Contract

El bloque usa **una fila** con **dos celdas**:

- **Celda 1**: el texto de la cita. El orden de los párrafos importa porque el CSS los estiliza por posición:
  - **Párrafo 1** → texto grande de la cita (con una línea divisoria roja debajo, generada por CSS).
  - **Párrafo 2** → nombre del autor.
  - **Párrafo 3** → disclaimer / texto secundario.
- **Celda 2**: la imagen que acompaña la cita.

### Estructura Conceptual

```text
| quote | |
| "Texto de la cita destacada."   | [imagen] |
| Nombre del Autor                |          |
| Disclaimer o texto legal.       |          |
```

(Los tres párrafos van todos en la primera celda; la imagen ocupa la segunda celda.)

## 2. CSS Customization

`quote.css` no define variables CSS propias. Usa colores y layout fijos:

- Fondo del bloque `#eff6f9`, `border-radius: 12px`, `max-width: 1200px`.
- Layout en fila (texto `flex: 2`, imagen `flex: 1`) en desktop; se apila en columna bajo 900px.
- Cita (párrafo 1): `1.4rem`, bold, color `#1a4a5c`, con divisor rojo `#c0392b` (40x3px) generado vía `::after`.
- Autor (párrafo 2): `1rem`, 600, color `#1a4a5c`.
- Disclaimer (párrafo 3): `0.85rem`, color `#555`.
- En móvil (`width < 900px`) la tarjeta pierde el radio, se centra el texto y la imagen se extiende a `100vw`.

## 3. Notas

- El estilo depende del **orden** de los párrafos (`nth-child(1/2/3)`). Autorear los párrafos en el orden esperado (cita, autor, disclaimer) es parte del contrato.
