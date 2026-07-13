# Paragraph Block

Bloque de tipografía para bloques de texto enriquecido (títulos, párrafos y links) con estilos de marca. El JavaScript es mínimo: solo añade la clase `paragraph-block` al bloque; todo el estilo vive en el CSS.

## 1. Authoring Contract

El bloque no impone una estructura de tabla especial. Se escribe como contenido enriquecido normal (headings, párrafos, links) y el CSS lo estiliza.

### Estructura Conceptual

```text
| paragraph |
| ## Título de sección          |
| Texto del párrafo con un link. |
| ### Subtítulo                 |
| Más texto.                    |
```

## 2. Variantes

El CSS reconoce, además de `.paragraph-block` (aplicada por el JS), la clase `.paragraph-center`. Esta clase **no** la añade el JavaScript, por lo que debe autorearse como variante del bloque (ej. `paragraph (center)`) para obtener el layout centrado.

```text
| paragraph (center) |
| ## Título centrado |
| Texto centrado en negrita. |
```

Diferencias de `.paragraph-center`:

- Alinea todo el contenido al centro (`text-align: center`).
- `h2` a 32px en color `#046183`.
- Párrafos en negrita, 16px, con padding vertical.

## 3. CSS Customization

`paragraph.css` no define variables CSS propias. Usa colores fijos:

- `h2` / `h3`: color `#1a4a5c` (h2 700/1.75rem, h3 600/1.35rem).
- `h4` / `h5`: color `#046183`.
- Párrafos: 16px, `line-height: 1.6`, color `#333`.
- Links `a`: color `#046183`.
- Ancho máximo `1140px`; padding lateral reducido bajo 900px y eliminado bajo 450px.
