# Alert Strip Block

Franja de aviso (alert strip) a ancho completo, pensada para colocarse justo debajo del hero. Muestra un icono opcional y un mensaje corto (por ejemplo, un teléfono de contacto). Se anuncia a lectores de pantalla como una nota.

## 1. Authoring Contract

El bloque usa **una sola fila** con hasta **dos celdas**:

- **Celda 1 (opcional)**: solo un icono. Se marca como `alert-strip-icon` y se trata como decorativa.
- **Celda 2 (o única celda)**: el texto del mensaje. Se marca como `alert-strip-text`.

La clasificación es dinámica: una celda que contiene un `.icon` y **no tiene texto** se considera icono (`alert-strip-icon`); cualquier otra celda se considera texto (`alert-strip-text`). Por eso una sola celda con texto también funciona.

### Estructura Conceptual

```text
| alert-strip | |
| :icon:      | **¿Necesitas ayuda para comenzar? Llama [833-4-VYEPTI](tel:8334893784) (833-489-3784).** |
```

Versión solo texto (sin icono):

```text
| alert-strip |
| **¿Necesitas ayuda para comenzar? Llama al 833-489-3784.** |
```

## 2. Accessibility

Comportamiento real presente en `alert-strip.js`:

- El bloque recibe `role="note"`.
- Una celda que es solo icono recibe `aria-hidden="true"` (decorativa, se oculta a lectores de pantalla).

## 3. CSS Customization

`alert-strip.css` no define variables CSS propias. Consume variables globales:

```css
--light-color         /* Fondo de la franja */
--body-font-size-s    /* Tamaño del texto */
--link-color          /* Color de los links */
--link-hover-color    /* Color de los links en hover */
```

Detalles de layout:

- La franja sangra a ancho completo del viewport (`max-width: none`, `padding: 0` en el wrapper) y elimina el margen superior de la sección para quedar pegada al hero.
- El contenido interno se centra con `flex` y se limita a `max-width: 1200px`.
- El icono mide 40x40px en móvil y 48x48px en desktop (`width >= 900px`).
- Los links se muestran subrayados y con `white-space: nowrap`.
