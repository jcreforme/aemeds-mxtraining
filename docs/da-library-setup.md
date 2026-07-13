# da.live Library & Icons Setup (jcreforme)

Este documento explica cómo registrar los iconos del proyecto en el panel
**Library → Icons** de da.live, para que los autores puedan buscarlos e insertarlos
con un clic en lugar de escribir el token `:nombre:` a mano.

> Org/site de DA: **`jcreforme`** / **`aemeds-mxtraining`** (coinciden con el `owner/repo`
> de GitHub). Si migras a otra cuenta, reemplaza `jcreforme` por el nuevo org en todas
> las URLs de abajo.

---

## Cómo resuelve EDS los iconos

Cuando un autor escribe `:search:`, la página renderiza un
`<span class="icon icon-search">`, y `decorateIcons()` en `scripts/aem.js` lo convierte en:

```html
<img src="/icons/search.svg" .../>
```

Ese request `/icons/*.svg` se sirve **desde la rama de código a través de la cual se
renderiza la página** (no desde el contenido de da.live). Por lo tanto el archivo debe
existir en la carpeta `icons/` de esa rama.

> **Estado actual:** los 8 SVGs de este repo ya resuelven `200` en `main` live
> (`https://main--aemeds-mxtraining--jcreforme.aem.live/icons/*.svg`), así que **no hay
> problema de 404** — las URLs de la Library funcionan sin depender de ningún merge.

---

## Paso A — Crear la hoja de iconos

1. Abre: `https://da.live/sheet#/jcreforme/aemeds-mxtraining/docs/library/icons`
   (esto crea un documento tipo sheet en `/docs/library/icons`).
2. Nombra la pestaña **`icons`**.
3. Agrega **tres columnas** con estos encabezados exactos: **`key`**, **`value`**, **`icon`**.
   - **`key`** — el token que se inserta en el documento. Debe tener la forma `:name:`.
   - **`value`** — la etiqueta que se muestra en Library → Icons.
   - **`icon`** — la URL absoluta al SVG.
4. Pega estas filas (una por icono en `/icons`):

| key | value | icon |
| --- | --- | --- |
| `:search:` | Search | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/search.svg |
| `:download-18:` | Download | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/download-18.svg |
| `:cta-button-arrow-20-global-white:` | CTA arrow (white) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/cta-button-arrow-20-global-white.svg |
| `:cgrp-circle-steel-24-desktop:` | CGRP circle (steel) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/cgrp-circle-steel-24-desktop.svg |
| `:receptors-yellow-23-desktop:` | Receptors (yellow) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/receptors-yellow-23-desktop.svg |
| `:savings-coral-116-tablet:` | Savings coral (tablet) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/savings-coral-116-tablet.svg |
| `:savings-coral-165-desktop:` | Savings coral (desktop) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/savings-coral-165-desktop.svg |
| `:vyepti-mark-coral-24-desktop:` | VYEPTI mark (coral) | https://main--aemeds-mxtraining--jcreforme.aem.live/icons/vyepti-mark-coral-24-desktop.svg |

5. **Preview + Publish** la hoja (Sidekick → Preview, luego Publish) para que su endpoint
   JSON quede vivo en:
   `https://main--aemeds-mxtraining--jcreforme.aem.live/docs/library/icons.json`

---

## Paso B — Registrar la hoja en el config de DA

1. Abre el config: `https://da.live/config#/jcreforme/aemeds-mxtraining/`
2. Agrega (o abre) una pestaña llamada **`library`** con columnas: **`title`**, **`path`**,
   **`format`**, **`ref`**, **`icon`**, **`experience`**.
3. Agrega esta fila para los iconos:

| title | path | format | ref | icon | experience |
| --- | --- | --- | --- | --- | --- |
| Icons | https://main--aemeds-mxtraining--jcreforme.aem.live/docs/library/icons.json | | `:<content>:` | | |

   - **`title`** = `Icons` → el nombre de la entrada en el panel Library.
   - **`path`** = la URL JSON publicada de la hoja del Paso A.
   - **`ref`** = `:<content>:` → indica a da.live que inserte el `key` envuelto como token.
   - Deja `format`, `icon`, `experience` en blanco para los iconos.

4. **Preview + Publish** el config.

---

## Paso C — Verificar

1. Reabre cualquier documento en da.live.
2. Abre el panel **Library** (barra izquierda) → verás una entrada **Icons**.
3. Haz clic → aparecen los 8 iconos con sus etiquetas → al hacer clic en uno se inserta el
   token `:name:` en el cursor.

---

## (Opcional) Registrar también los blocks

La misma pestaña `library` puede exponer los blocks del proyecto para que los autores los
inserten desde la Library en lugar de escribir el nombre de la tabla. Apunta `path` a un
**documento de librería de blocks** (una página con un ejemplo de cada block):

| title | path | format | ref | icon | experience |
| --- | --- | --- | --- | --- | --- |
| Blocks | https://main--aemeds-mxtraining--jcreforme.aem.live/docs/library/blocks | | | | |

Crea esa página en `/docs/library/blocks` con una muestra autorizada de cada block, luego
preview/publish.

---

## Resumen

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `*.svg` 404 en la página | El SVG no está en la rama por la que se renderiza | Commit del SVG a `main` (en este repo ya están todos ✅) |
| Panel Library vacío | No existe config de Library para el site | Crear hoja `icons` + pestaña `library` (Pasos A–B) |
| Iconos faltan solo en Library | URLs `icon` apuntan a una rama sin el archivo | Usar URLs `main--…aem.live` (todas resuelven en este repo) |

Fuentes:
[da.live — Setup library](https://docs.da.live/administrators/guides/setup-library) ·
[Adobe Ref Demo — Setting up Library extensions](https://referencedemo.adobe.com/document-authoring-with-da/setting-up-library-extensions)
