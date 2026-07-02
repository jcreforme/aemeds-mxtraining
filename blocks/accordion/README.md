# Accordion Block

Accordion block para AEM EDS con soporte de contenido anidado (incluyendo otros blocks como `columns`, `cards`, etc.). Soporta dos variantes: **exclusive** (un panel abierto) y **multi-open** (múltiples paneles abiertos simultáneamente).

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

### Contenido Anidado

Si un panel contiene blocks anidados (`columns`, `cards`, `hero`, etc.):

- Se detectan automáticamente en el contenido del panel.
- Se decoran y cargan **solo al expandir el panel** (lazy loading).
- Esto optimiza rendimiento evitando cargar blocks innecesarios.

## 2. Accessibility

- Cada header es un `<button>` con `aria-expanded` (indica si el panel está abierto).
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
