# Fragment Block

Bloque estándar de AEM Edge Delivery ([block-collection/fragment](https://www.aem.live/developer/block-collection/fragment)) que incluye el contenido de otra página del sitio en línea, como un fragmento reutilizable. Útil para contenido compartido entre páginas (avisos, banners legales, secciones comunes).

## 1. Authoring Contract

El bloque contiene la **ruta al fragmento**. Puede escribirse de dos formas (el JS acepta ambas):

- Un **enlace** (`a`) cuyo `href` apunta a la ruta del fragmento.
- O el **texto plano** de la ruta dentro del bloque.

La ruta debe ser una ruta interna absoluta que empiece con `/` (no se aceptan URLs con `//`).

### Estructura Conceptual

```text
| fragment | |
| [/fragments/shared/footer-note](/fragments/shared/footer-note) |
```

o simplemente:

```text
| fragment | |
| /fragments/shared/footer-note |
```

### Comportamiento

- El JS hace `fetch` de `{path}.plain.html`, decora el contenido con `decorateMain` y lo carga con `loadSections`.
- Reescribe las rutas base de medios (`img[src^="./media_"]` y `source[srcset^="./media_"]`) para resolverlas relativas al path del fragmento.
- Reemplaza el contenido del bloque con los nodos del fragmento cargado.
- **Fail-open**: si algo falla, se asegura de que la sección padre no quede oculta (marca `sectionStatus = 'loaded'` y limpia `display`). Los errores se registran con `console.error`.

`loadFragment(path)` se exporta y puede reutilizarse desde otros blocks (p. ej. header/footer).

## CSS Customization

`fragment.css` está intencionalmente vacío (solo un comentario `stylelint-disable`). El fragmento hereda el estilo de las secciones y blocks que contiene.

## Performance Notes

- El fragmento se carga vía `fetch` en tiempo de ejecución, lo que añade una petición de red adicional y decoración/carga de sus propias secciones.
