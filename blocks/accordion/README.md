# Accordion Block

Accordion block para AEM EDS con soporte de contenido anidado (incluyendo otros blocks como `columns`, `cards`, etc.). Soporta tres variantes: **exclusive** (un panel abierto), **multi-open** (múltiples paneles abiertos simultáneamente) y **faq** (diseño de tarjetas de la página [vyepti.com/vyepti-faq](https://www.vyepti.com/vyepti-faq)).

## 1. Authoring Contract

Cada fila del bloque representa un item del acordeón.

- **Columna 1**: Título del item (trigger)
- **Columna 2..N**: Contenido del panel (texto, links, blocks anidados)

### Estructura Conceptual

```text
| accordion | |
| Getting Started | [contenido del panel] |
| Support         | [contenido del panel] |
```

### Comportamiento por Defecto (Single-Open / Exclusive)

- El primer item inicia abierto.
- Al abrir un item, los demás se cierran automáticamente.
- Animación suave en apertura y cierre (220ms).

### Variante Multi-Open

Para permitir múltiples paneles abiertos simultáneamente, agregar clase `multi-open` al bloque:

```text
| accordion (multi-open) | |
| Before Treatment   | [contenido] |
| During Treatment   | [contenido] |
| After Treatment    | [contenido] |
```

En esta variante:

- Todos los paneles pueden estar abiertos a la vez.
- El primer item inicia abierto; los demás cerrados.
- Cada click alterna el estado del panel clickeado independientemente.

### Variante FAQ

Réplica del diseño de la página de FAQs del sitio en vivo. Agregar la clase `faq` al bloque:

```text
| accordion (faq) | |
| About VYEPTI                | [preguntas y respuestas] |
| Treatment with VYEPTI       | [preguntas y respuestas] |
| Access and Support          | [preguntas y respuestas] |
```

Diferencias con el accordion estándar:

- **Todos los items inician cerrados** (en el estándar el primero inicia abierto).
- Cada categoría se renderiza como **tarjeta redondeada** (fondo `#eff6f9`, radio 10px, sombra suave, separación de 24px).
- Título en gris oscuro semi-bold (24px móvil / 28px desktop), chevron teal a la derecha.
- Comportamiento exclusive: abrir una categoría cierra las demás (combinable con `multi-open` si se requiere).

**Contenido del panel (contrato de autoría):**

- Cada **pregunta** se escribe como **Heading 3** (o Heading 4) dentro de la celda de contenido.
- La **respuesta** son los párrafos/listas que siguen a cada pregunta.
- A partir de la segunda pregunta se agrega automáticamente una línea divisoria gris (`#a4a4a4`) arriba de la pregunta.
- Los links se renderizan en teal, bold y subrayados (como en el sitio en vivo).

```text
| accordion (faq) | |
| About VYEPTI | ### What is VYEPTI?              ← pregunta (H3)
|              | VYEPTI is a prescription medicine…  ← respuesta
|              | ### How does VYEPTI work?        ← pregunta (H3)
|              | VYEPTI is an aCGRP…                 ← respuesta |
```

Página de prueba: `drafts/faq-test.html` (`http://localhost:3000/drafts/faq-test`).

### Contenido Anidado

Si un panel contiene blocks anidados (`columns`, `cards`, `hero`, etc.):

- Se detectan automáticamente en el contenido del panel.
- Se decoran y cargan **solo al expandir el panel** (lazy loading).
- Esto optimiza rendimiento evitando cargar blocks innecesarios.

## 2. Accessibility

- Cada trigger es un `<button>` envuelto en un `<h3 class="accordion-header">`, igual que el sitio en vivo — los títulos del accordion forman parte del outline del documento.
- Cada `<button>` expone `aria-expanded` (indica si el panel está abierto).
- Cada panel usa `role="region"` y `aria-labelledby` (enlaza con su título).
- Soporte completo para navegación por teclado: Tab, Space/Enter para activar.
- Respeta `prefers-reduced-motion`: desactiva animaciones si el usuario lo prefiere.

## 3. Test Cases

Usar `drafts/accordion-test.html` para validar (ejecutado con `npm run lint` antes de commit):

### Single-Open (Exclusive)

1. **Contenido de texto**: 3 items básicos, solo uno abierto a la vez ✅
2. **Con block anidado (columns)**: Columns se decora al expandir ✅
3. **Contenido multi-celda + block anidado (cards)**: Cards se carga correctamente ✅

### Multi-Open

4. **Multi-open básico**: 3 items, todos pueden estar abiertos, cada click alterna independientemente ✅
5. **Multi-open con nested columns**: 2 items con columns anidado, funciona correctamente ✅

## 4. Local Testing

```sh
npx -y @adobe/aem-cli up --no-open --html-folder drafts
```

Luego abrir: `http://localhost:3000/drafts/accordion-test`

Verifica:

- ✅ Navegación y toggle de paneles
- ✅ Animaciones suaves
- ✅ Blocks anidados se decoran correctamente
- ✅ Comportamiento exclusive vs multi-open según clase

## 5. CSS Customization

Variables CSS disponibles en `accordion.css`:

```css
--accordion-border-color      /* Borde de los items */
--accordion-header-bg         /* Background del trigger */
--accordion-header-bg-hover   /* Background on hover */
--accordion-header-text       /* Color del texto */
--accordion-body-bg           /* Background del panel */
--accordion-icon-color        /* Color del chevron icon */
```

Variables adicionales de la variante FAQ:

```css
--accordion-faq-card-bg        /* Fondo de la tarjeta (#eff6f9) */
--accordion-faq-title-color    /* Color del título y preguntas (#484848) */
--accordion-faq-divider-color  /* Línea divisoria entre preguntas (#a4a4a4) */
```

## 6. Performance Notes

- **Lazy loading de blocks**: Blocks anidados solo se cargan al expandir → mejor LCP
- **Animaciones optimizadas**: Usa `will-change` y transforms para renderizado eficiente
- **Reduced motion**: Respeta preferencia del usuario (no anima si está activado)

## 7. PR Checklist

Antes de hacer commit:

```sh
npm run lint        # Valida JS y CSS
npm run lint:fix    # Auto-fix problemas menores
```

Luego:

```sh
git checkout -b feature/accordion-multi-open
git add blocks/accordion/ drafts/accordion-test.html
git commit -m "feat(accordion): add multi-open variant with nested block support"
```

En la PR, incluir link de preview: `https://{branch}--{repo}--{owner}.aem.page/drafts/accordion-test`
