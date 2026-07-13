# Footer Block — Pie de Página Global

El footer renderiza el pie de página global del sitio a partir de un fragmento compartido. Replica el pie de vyepti.com: una franja teal de enlaces legales, un bloque de copy legal con el botón magenta "For assistance, call" (llamada telefónica), y una fila de iconos sociales + logo de Lundbeck alineada a la derecha.

`decorate(block)` carga el fragmento del footer con `loadFragment()`, vacía el bloque, y reparte las secciones autoradas del fragmento en tres bandas (`legal`, `info`, `brand`) según su orden.

---

## 1. Authoring Contract

El footer se autora **una sola vez**, en el documento del fragmento en el content drive. La ruta se resuelve así:

1. Si la página define el metadato `footer`, se usa esa ruta (resuelta contra el origen actual).
2. Si no, se usa la ruta por defecto **`/fragments/footer`**.

El fragmento debe contener **tres secciones**, separadas por reglas horizontales (`---`), en este orden exacto. El JS asigna las clases según la posición (`footer.children[0..2]`):

```text
footer.children[0]  →  .footer-legal   (franja teal de enlaces legales)
footer.children[1]  →  .footer-info    (copy legal + botón de llamada)
footer.children[2]  →  .footer-brand   (iconos sociales + logo Lundbeck)
```

### Sección 1 — Enlaces legales (franja teal)

Una lista de enlaces (Privacy Policy, Terms of Use, etc.). Se renderizan centrados, en blanco sobre fondo teal (`--link-color`), con wrap automático.

### Sección 2 — Copy legal + llamada de asistencia

- Uno o más párrafos de copy legal.
- Un enlace telefónico `tel:` precedido por un párrafo de etiqueta (p. ej. *For assistance, call*).

El JS (`decorateCallToAction`) localiza el enlace `a[href^="tel:"]`, lo convierte en el botón magenta (`.button.primary.footer-call`), y lo agrupa con el párrafo de etiqueta que lo precede dentro de un `.footer-cta`. Este grupo se antepone al inicio de la sección info.

Detalles de robustez del parseo:

- `stripBoldMarkers` elimina marcadores literales `**` que un autor haya escrito en lugar de usar el formato negrita del editor.
- Se desenvuelve cualquier `<strong>`/`<em>` que envuelva el enlace, de modo que el propio enlace sea el botón (no depende de la auto-buttonization).

### Sección 3 — Sociales + logo

Una fila de enlaces con iconos (redes sociales) y el logo de Lundbeck. `decorateIconLinks` oculta visualmente el texto de los enlaces con icono (envolviéndolo en `<span class="visually-hidden">`) para que quede solo el icono en pantalla, pero disponible para lectores de pantalla.

```text
| footer |
```

(El bloque en la página está vacío; todo el contenido vive en el fragmento.)

---

## 2. Accessibility

- Los enlaces solo-icono (sociales, logo Lundbeck) conservan su texto para lectores de pantalla mediante `span.visually-hidden`; visualmente se muestra solo el icono.
- El botón de llamada es un enlace `tel:` real, navegable por teclado, con estados `:hover` y `:focus-visible`.

---

## 3. CSS Customization

`footer.css` no declara `--custom-properties` propias; consume variables globales del sitio:

```css
--background-color   /* fondo del footer y texto sobre la franja teal */
--body-font-size-xs  /* tamaño base del pie */
--link-color         /* fondo teal de la franja legal */
--light-color        /* color de enlaces legales en hover */
--dark-color         /* color del texto de la sección info */
--text-color         /* color de la etiqueta "For assistance, call" */
--accent-color       /* fondo del botón magenta de llamada */
--accent-hover-color /* fondo del botón en hover/focus */
```

### Iconos esperados

- **`../../icons/call.svg`** — icono de teléfono dibujado con `::before` sobre el botón `a.footer-call` (16×19px). NOTA: este archivo **no existe** actualmente en `/icons/`, por lo que el pseudo-elemento producirá un 404; agregar `call.svg` para que se muestre el icono.
- **`.icon-lundbeck`** — logo de Lundbeck (160px de ancho móvil, 27px los iconos sociales en desktop), provisto como icono en el fragmento.

---

## 4. Performance Notes

- El footer se carga como fragmento en la fase lazy vía `loadFragment()`, fuera del camino crítico de LCP.
- Editar y publicar el documento del fragmento actualiza el pie en todas las páginas de inmediato.
