# Fix — Estilos generales: tipografía, spacing entre componentes y layout de la Sidebar

- **ID:** FIX-010
- **Status:** Implementado. Gaps resueltos por el usuario (ver "Gaps a resolver"):
  sans-serif (Poppins/Arial), Google Fonts (CDN), `gap` en `Flex` (no `padding-bottom` literal), sin
  `Theme scaling`. `tsc -b`, `eslint .` y `vitest run --coverage` verificados sin errores
  (cobertura 100% en `app/layout`, `app/styles` y las 3 páginas tocadas).
- **Related:** [docs/feature/01-modify-sidebar.md](../feature/01-modify-sidebar.md),
  [docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md),
  `client/src/app/styles/tokens.ts`, `client/src/app/layout/Sidebar.tsx`,
  `client/src/app/layout/sidebar.styles.ts`, `client/src/app/layout/AppLayout.tsx`,
  `client/src/main.tsx`, `client/index.html`, `client/src/features/assets/pages/AssetsPage.tsx`,
  `client/src/features/incidents/pages/IncidentsPage.tsx`,
  `client/src/features/vehicles/pages/VehiclesPage.tsx`
- **Date:** 2026-07-06

## 1. Pedido del usuario

**Para toda la app:**
1. Las letras se ven pequeñas: agrandarlas y usar una fuente más moderna (Poppins, con fallback a
   Arial u otra sans-serif si el navegador no tiene Poppins disponible).
2. Entre un componente (feature) y el siguiente debe haber 24px de espacio, empujando hacia abajo
   al resto de los componentes que vienen debajo.

**Sidebar:**
3. Alineación a la izquierda, no centrada.
4. El ancho/alto de la caja que contiene cada link no debe cambiar al seleccionarlo (hoy el link
   activo se agranda y corre hacia abajo a los links siguientes).
5. No debe aparecer una barra de desplazamiento por encima de "Report incident".
6. Cambiar el texto "Report incident" por "Reportar incidente".

## 2. Diagnóstico

### 2.1 Tipografía (toda la app)

- `client/src/main.tsx` envuelve toda la app en `<Theme>` de `@radix-ui/themes` **sin ningún prop**
  (ni `scaling`, ni override de fuente) e importa `@radix-ui/themes/styles.css` tal cual. Ese CSS
  fija la fuente por defecto de **todos** los componentes Radix (`Text`, `Heading`, `Button`,
  `Table`, etc.) vía variables CSS propias (`--default-font-family`), no vía nuestros
  `designTokens`.
- `designTokens.typography` (`client/src/app/styles/tokens.ts`) define `fontFamily: 'Inter'` en
  cada nivel (`bodyMd`, `titleMd`, etc.), pero **hoy solo lo consume `sidebar.styles.ts`**
  (`sidebarTitleStyle`, `sidebarSubtitleStyle`, `navItemLabelStyle`). El resto de la app
  (`HeaderPage`, `StatusSummaryCards`, tablas, modales) usa `Text`/`Heading` de Radix sin `style`
  propio, así que hereda el stack de fuente por defecto de Radix, no `designTokens`.
- Conclusión: para que "toda la app" cambie de fuente hay que tocar **dos capas**: (a) el default
  global de Radix (variable CSS, hoy sin override) y (b) `designTokens.typography.*.fontFamily`
  (para que la sidebar, que sí lo consume, quede consistente).
- Los tamaños actuales (`bodyMd`: 14px, `bodyLg`: 16px, `labelMd`: 12px, `labelSm`: 10px) son los
  mismos que trae Radix por defecto para sus escalas equivalentes — de ahí la sensación de letra
  chica reportada, ya que ninguno de los dos niveles fue pensado para una lectura más grande.
- **Contradicción a resolver:** el pedido dice "con serifas" pero después nombra únicamente fuentes
  **sans-serif** (Poppins, Arial). Poppins es una geométrica sans-serif, no tiene versión serif. Se
  asume que es un error de tipeo ("con serifas" → probablemente "sin serifas") y se sigue la lista
  explícita de fuentes (Poppins → Arial → sans-serif del sistema), pero se deja como gap a
  confirmar antes de implementar (ver "Gaps a resolver" #1).

### 2.2 Spacing entre componentes (toda la app)

`AssetsPage.tsx`, `IncidentsPage.tsx` y `VehiclesPage.tsx` comparten el mismo patrón: un `<div>`
sin estilos que apila los componentes de feature como hijos directos, **sin ningún `gap`/`margin`
entre ellos**:

```tsx
// patrón repetido en las 3 páginas (ej. AssetsPage.tsx)
<div>
  <HeaderPage {...assetsHeaderProps} />
  <StatusSummaryCards ... />
  <AssetsFilterBar />
  <AssetsTable />
  <AssetModal />
</div>
```

No hay ningún CSS global en el proyecto (no existe ni un solo archivo `.css` propio bajo
`client/src`, solo el `styles.css` de Radix), así que el espaciado entre `HeaderPage` →
`StatusSummaryCards` → `FilterBar` → `Table` hoy es **0px**, dependiendo únicamente del margen
propio de cada componente hijo (inconsistente entre sí).

### 2.3 Sidebar

Los tres síntomas de la sidebar (`client/src/app/layout/Sidebar.tsx`) tienen la misma causa raíz:

```tsx
<Button
  key={item.to}
  asChild
  variant={isActive ? 'soft' : 'ghost'}   // (a) cambia de variante al activarse
  radius="large"
  style={isActive ? navItemActiveStyle : navItemInactiveStyle}  // (b) suma fontWeight: 700
>
  <Link to={item.to}>...</Link>
</Button>
```

- **(a) Cambio de `variant`:** en `@radix-ui/themes`, la variante `"ghost"` de `Button` está pensada
  para comportarse como un link inline (usa márgenes negativos / padding reducido a propósito, para
  no ocupar más espacio que el texto). Las variantes `"solid"`/`"soft"`/`"outline"` sí tienen el
  padding "de botón" estándar. Como el link inactivo usa `"ghost"` y el activo pasa a `"soft"`,
  **cambian el box model del elemento al seleccionarlo** — esto es lo que se percibe como "se hace
  más grande" y corre a los links de abajo.
- **(b) `fontWeight: 700` solo en el activo** (`navItemActiveStyle`) agrava el efecto (texto más
  ancho/pesado) aunque no es la causa principal.
- **Barra de scroll sobre "Report incident":** el `<nav>` está envuelto en
  `<Box flexGrow="1" overflowY="auto">` (línea 80 de `Sidebar.tsx`). Al crecer el alto del ítem
  activo (por (a)+(b)), el contenido total del `<nav>` puede superar el alto disponible del
  `flexGrow`, disparando el scrollbar — es consecuencia directa del mismo bug, no un problema
  aparte.
- **Alineación centrada:** ninguno de los `Button` fija `justify`. El default de `Button` en Radix
  Themes centra su contenido (`justify-content: center`), y como el `Flex direction="column"` que
  los contiene no fija `align`, cada `Button` se estira al ancho completo del contenedor (default
  `align-items: stretch` de un contenedor flex en columna) — el ícono+texto queda centrado
  horizontalmente dentro de esa caja ancha, en vez de pegado a la izquierda.

## 3. Decisiones propuestas (a confirmar antes de implementar)

1. **Fuente:** agregar Poppins vía Google Fonts (`<link>` en `client/index.html`, pesos 400/500/
   600/700) y definir el stack `"'Poppins', Arial, sans-serif"` en dos lugares:
   - Un archivo nuevo `client/src/app/styles/global.css` (el primer CSS propio del proyecto) que
     sobreescribe la variable de Radix `--default-font-family` en `:root`, para que todos los
     componentes Radix sin `style` propio (tablas, headers, modales) también cambien de fuente.
   - `designTokens.typography.*.fontFamily` (hoy `'Inter'` en cada nivel) → el mismo stack, para
     que la sidebar (único consumidor actual de `designTokens.typography`) quede consistente.
2. **Tamaño de letra:** subir `fontSize` en `designTokens.typography` (todos los niveles, no solo
   `bodyMd`) y evaluar `<Theme scaling="110%">` en `main.tsx` como palanca adicional (afecta a todo
   componente Radix, no solo texto — ver gap #5). Propuesta de tabla de tamaños (a ajustar en
   implementación):

   | Nivel | Actual | Propuesto |
   |---|---|---|
   | `bodyMd` | 14px | 16px |
   | `bodyLg` | 16px | 18px |
   | `labelMd` | 12px | 14px |
   | `labelSm` | 10px | 12px |
   | `titleMd`/`titleLg`/`headline*` | 16–32px | +2px por nivel |

3. **Spacing entre componentes:** envolver los hijos apilados de `AssetsPage.tsx`,
   `IncidentsPage.tsx` y `VehiclesPage.tsx` en `<Flex direction="column" gap="5">` de
   `@radix-ui/themes` (escala `5` de Radix = 24px, misma equivalencia que
   [feature 01](../feature/01-modify-sidebar.md#mapeo-de-tokens-a-props-de-radix-para-no-escribir-css)
   usa para `designTokens.spacing.lg`), en vez de `padding-bottom` literal por componente — un
   `gap` en el contenedor da el mismo resultado visual (empuja hacia abajo a los componentes
   siguientes) sin dejar un padding colgando después del último elemento. Ver gap #2 si se prefiere
   `padding-bottom` explícito por componente en su lugar.
4. **Sidebar — alineación izquierda:** fijar `justify="start"` (o el estilo equivalente
   `justifyContent: 'flex-start'`) en cada `Button` de navegación, para que el ícono+texto queden
   pegados a la izquierda de la caja ya estirada al ancho completo.
5. **Sidebar — tamaño de caja estable:** usar **una sola `variant` para ambos estados** (activo/
   inactivo) — se propone `"ghost"` siempre, más compacto — y seguir distinguiendo el estado activo
   únicamente por color/fondo vía los objetos de estilo ya existentes
   (`navItemActiveStyle`/`navItemInactiveStyle` en `sidebar.styles.ts`, que ya definen
   `backgroundColor` y `color`). Esto elimina el cambio de box model al seleccionar un link. Mantener
   `fontWeight: 700` en el activo se considera seguro (no cambia `line-height` ni el ancho de la
   caja, que ya está fijo por el `Flex` padre).
6. **Sidebar — scrollbar:** al quedar todos los ítems con el mismo alto (decisión 5), el contenido
   del `<nav>` deja de superar el alto disponible y el scrollbar no debería reaparecer;
   `overflowY="auto"` se mantiene como fallback de seguridad para pantallas muy bajas, no se
   elimina.
7. **Sidebar — copy:** reemplazar el texto `"Report incident"` por `"Reportar incidente"` en el
   botón del footer de `Sidebar.tsx` (línea 109).

## 4. Cambios propuestos (archivo por archivo)

| Archivo | Cambio |
|---|---|
| `client/index.html` | `<link>` de Google Fonts para Poppins (400/500/600/700) |
| `client/src/app/styles/global.css` (nuevo) | Override de `--default-font-family` de Radix |
| `client/src/main.tsx` | Importa `global.css`; evalúa `<Theme scaling="110%">` |
| `client/src/app/styles/tokens.ts` | `fontFamily` → stack Poppins en todos los niveles de `typography`; `fontSize` de cada nivel según tabla propuesta |
| `client/src/features/assets/pages/AssetsPage.tsx` | Envuelve los hijos apilados en `<Flex direction="column" gap="5">` |
| `client/src/features/incidents/pages/IncidentsPage.tsx` | Idem |
| `client/src/features/vehicles/pages/VehiclesPage.tsx` | Idem |
| `client/src/app/layout/Sidebar.tsx` | `variant` único (`"ghost"`) en el `Button` de nav, agrega `justify="start"`, cambia el texto del footer |
| `client/src/app/layout/sidebar.styles.ts` | Sin cambios estructurales; se revisa que `navItemActiveStyle` siga dando suficiente contraste de fondo con `variant="ghost"` |
| `client/src/app/layout/Sidebar.test.tsx` | Actualiza el texto esperado a `"Reportar incidente"`; agrega assertion de que la `variant`/box no cambia entre estados |

## 5. Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **"Con serifas" vs. Poppins/Arial (sans-serif):** confirmar que es un error de tipeo y que la
   intención es una fuente **sin** serifas (Poppins → Arial → sans-serif del sistema), como sugiere
   el resto de la frase.
2. **`padding-bottom` literal vs. `gap` en el contenedor (decisión 3):** confirmar si el `gap` de
   Radix Flex es aceptable o si se requiere `padding-bottom: 24px` explícito en cada componente de
   feature (con el efecto colateral de dejar 24px "colgando" después del último componente de la
   página).
3. **Google Fonts (CDN) vs. self-host:** el `<link>` a Google Fonts agrega una dependencia de red
   externa en runtime (y en desarrollo). La alternativa es instalar `@fontsource/poppins` (paquete
   npm, sirve la fuente localmente, sin request externo). Se propone Google Fonts por simplicidad;
   confirmar si el entorno tiene restricciones (CSP, trabajo offline) que obliguen a self-host.
4. **Tamaños exactos de la tabla de la decisión 2:** son una propuesta inicial, ajustable en
   implementación tras revisión visual.
5. **`<Theme scaling="110%">` (decisión 2):** este prop de Radix no solo agranda texto, también
   agranda paddings, alturas de botones/inputs y radios de **todos** los componentes Radix de la
   app — un cambio de mayor alcance que el pedido original ("las letras se ven pequeñas"). Se deja
   como opción a confirmar; si no se aprueba, la app solo sube los `fontSize` de `designTokens` y el
   `--default-font-family` global, sin tocar `scaling`.

## 6. Fuera de alcance

- Rediseño de paleta de colores o del layout general más allá de lo descrito.
- Cambios en `docs/feature/11-vehicle-assignment-engine.md` u otras features en progreso.
- Agregar una topbar o modificar el ancho fijo de la sidebar (`SIDEBAR_WIDTH`).
- Funcionalidad real del botón "Reportar incidente" (sigue siendo un placeholder, ver
  [feature 01](../feature/01-modify-sidebar.md), decisión 7).

## 7. Verificación post-implementación (una vez aprobado e implementado)

1. `pnpm --filter client typecheck` / `lint` / `format:check` / `test` (cobertura ≥ 80%) sobre todos
   los archivos tocados.
2. Verificación visual: Poppins se renderiza en toda la app (sidebar, headers, tablas, modales), con
   tamaños de letra visiblemente mayores a los actuales.
3. Verificación visual: entre `HeaderPage`, `StatusSummaryCards`/`VehicleStatusCards`, la barra de
   filtros y la tabla hay 24px de separación consistente en Activos, Incidentes y Vehículos.
4. Verificación manual en la sidebar: los 5 links quedan alineados a la izquierda; al hacer click en
   cada uno, ningún link (activo o inactivo) cambia de alto/ancho ni corre a los de abajo; no
   aparece scrollbar por encima de "Reportar incidente" en la altura de ventana por defecto.
5. El botón del footer de la sidebar muestra el texto "Reportar incidente".
