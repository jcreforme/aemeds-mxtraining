# Form Block — Formulario de Captura de Leads

Bloque de formulario de captura de leads. Construye un `<form>` a partir de una tabla autorada: cada fila define un campo (label + tipo). Al enviar, valida en el cliente (`checkValidity`), muestra un mensaje de agradecimiento y deshabilita el formulario. No hay backend: el envío es puramente client-side y no realiza ninguna petición de red.

## 1. Authoring Contract

Cada fila del bloque representa **un campo** del formulario.

- **Columna 1**: Label del campo (obligatorio; si está vacía, la fila se ignora).
- **Columna 2**: Tipo de campo.
- **Columna 3** (opcional): Opciones para `select`, separadas por comas (equivalente a `select:A,B` en la columna 2).

### Tipos de campo soportados

`text` · `email` · `tel` · `textarea` · `select` · `checkbox` · `submit`

Cualquier valor no reconocido en la columna 2 se trata como `text`.

### Estructura Conceptual

```text
| form           |                    |                        |
| Full Name      | text               |                        |
| Email          | email              |                        |
| Phone          | tel                |                        |
| State          | select             | California,Texas,Florida |
| Message        | textarea           |                        |
| I agree to the terms | checkbox     |                        |
| Sign Up        | submit             |                        |
```

Notas de contrato:

- El **`id`/`name`** de cada campo se deriva del label: minúsculas con espacios reemplazados por guiones, prefijado con `form-` (p. ej. `Full Name` → `form-full-name`).
- La fila **`submit`**: la columna 1 es el texto del botón (p. ej. `Sign Up`), la columna 2 es `submit`. Se renderiza como `<button type="submit" class="button primary">`.
- **`select`**: puede autorarse como `select:California,Texas` en la columna 2, o como `select` en la columna 2 con las opciones en la columna 3. Se añade una opción placeholder deshabilitada y seleccionada por defecto (`Select {label}`).
- **`textarea`**: se renderiza con `rows="4"`.
- **`checkbox`**: se renderiza en línea (input + label), y es **requerido**.
- Todos los campos excepto `select` se marcan como `required`. `email` recibe `autocomplete="email"`; `tel` recibe `autocomplete="tel"`.

### Comportamiento de envío

- El `<form>` usa `noValidate` y valida manualmente con `checkValidity()` en el evento `submit` (con `preventDefault`).
- Si es inválido, invoca `reportValidity()` y no continúa.
- Si es válido: añade la clase `form-success` al bloque, muestra el mensaje *"Thank you. Your information has been submitted."* y deshabilita todos los `input`, `select`, `textarea` y `button`.
- La clase `form-success` en CSS oculta todos los campos y el botón, dejando visible solo el mensaje.

## 2. Accessibility

- Cada campo tiene un `<label>` asociado por `htmlFor`/`id`.
- El placeholder del `select` está `disabled` para forzar una selección explícita.
- La validación nativa del navegador (`required`, tipos `email`/`tel`) provee feedback accesible vía `reportValidity()`.
- El mensaje de confirmación (`.form-message`) inicia con atributo `hidden` y se revela al enviar con éxito.
- El foco de inputs/select/textarea muestra un `outline` visible (`:focus-visible`).

## 3. CSS Customization

`form.css` no declara `--custom-properties` propias; consume variables globales con fallback:

```css
--body-font-size-s              /* tamaño de labels y del mensaje */
--vyepti-teal (#00a3a1)         /* color del outline y borde en focus */
--vyepti-teal-light (#e6f7f7)   /* fondo del mensaje de confirmación */
--vyepti-dark (#1a1a2e)         /* color del texto del mensaje */
--background-color              /* fondo de inputs/select/textarea */
```

El formulario tiene un ancho máximo de 480px y se centra automáticamente.

## 4. Performance Notes

- Sin dependencias ni peticiones de red: todo el markup se genera con DOM APIs y el envío se resuelve en cliente.
- El bloque reemplaza su contenido con `replaceChildren(form)` en una sola operación.
