# SPEC — Rediseño de la Sidebar (layout & estilo)

**Tipo:** feature
**Estado:** Implementado. `tsc --noEmit` verificado en un entorno aislado con `Sidebar.tsx`,
`sidebar.styles.ts`, `AppLayout.tsx` y `tokens.ts` contra los tipos reales de `@radix-ui/themes`,
`lucide-react` y `@tanstack/react-router` instalados (sin errores). Pendiente correr, en el
entorno habitual del usuario, `pnpm --filter client lint`/`format:check`/`test`/`coverage` (no se
pudo ejecutar `pnpm` sobre este workspace en la sesión por un problema de montaje de archivos
ajeno al código; ver "Verificación post-implementación").
**Fecha:** 2026-07-05
**Relacionado:** [docs/designs/01-sidebar-layout-style.md](../designs/01-sidebar-layout-style.md), [docs/chore/03-navigation-shell-router.md](../chore/03-navigation-shell-router.md), [docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md), [docs/specs/architecture.md](../specs/architecture.md), `client/src/app/layout/`, `client/src/app/styles/tokens.ts`, `@radix-ui/themes`

## Objetivo

1. Crear `docs/designs/01-sidebar-layout-style.md` con el mockup de la sidebar (HTML + clases
   utilitarias + nombres de design tokens) provisto por el usuario, como **fuente de verdad
   visual** — hecho, ver el archivo.
2. Usar ese mockup como base de verdad para modificar los componentes de layout existentes en
   `client/src/app/layout/` (`Sidebar.tsx`, `AppLayout.tsx`), construidos sobre **componentes de
   `@radix-ui/themes`** (ya instalado en `client`, ver `main.tsx` → `<Theme>`) y consumiendo
   `designTokens` (`client/src/app/styles/tokens.ts`, spec [chore 02](../chore/02-visual-alignment.md))
   en lugar de estilos CSS/inline ad hoc.

Este documento **es el spec**: describe diagnóstico, decisiones propuestas y el plan de cambios.
No se toca ningún componente de `client/src` hasta que este spec quede aprobado (regla del
proyecto).

## Diagnóstico

- `client/src/app/layout/Sidebar.tsx` y `AppLayout.tsx` existen (creados en
  [chore 03](../chore/03-navigation-shell-router.md)) y hoy usan **estilos inline literales**
  (`style={{ ... }}` con valores hardcodeados: `#e2e8f0`, `1.5rem`, etc.), sin `designTokens` y sin
  ningún componente de `@radix-ui/themes`.
- **`@radix-ui/themes` ya está instalado** (`client/package.json`) y en uso (`main.tsx` envuelve la
  app en `<Theme>`), pero **ningún componente del proyecto lo usa todavía** — hoy es solo el
  proveedor de estilos base (`@radix-ui/themes/styles.css`). Este feature es el primer consumidor
  real de sus componentes.
- El mockup en `docs/designs/01-sidebar-layout-style.md` está escrito con clases utilitarias tipo
  Tailwind (`bg-surface-container-low`, `text-on-primary`, `rounded-lg`, `p-md`, `gap-sm`, etc.).
  **Tailwind no está instalado** en `client` (confirmado en
  [chore 02](../chore/02-visual-alignment.md) → "Diagnóstico") y no se instala en este feature (ver
  "Fuera de alcance"). Los nombres de clase coinciden 1:1 con las claves kebab-case de
  `designTokens` (colores M3, `spacing`, `rounded`), así que se leen como **referencias a tokens**.
- Los íconos del mockup usan `material-symbols-outlined` (Material Symbols de Google, vía fuente
  web), no instalado en el proyecto. La sidebar actual usa `lucide-react`, declarado como librería
  de íconos del proyecto en [architecture.md](../specs/architecture.md#íconos) y en chore 03.
- El mockup posiciona la sidebar con `fixed left-0 top-16 h-[calc(100vh-64px)]`, lo que asume una
  **barra superior (topbar) de 64px** ya existente en el shell. Hoy `AppLayout.tsx` **no tiene
  topbar**: es solo `<Sidebar /> + <main><Outlet/></main>` en un `flex` de altura completa. No
  existe ningún spec que introduzca una topbar.
- El copy de navegación del mockup difiere del texto funcional definido en
  [docs/scope.md](../scope.md#ampliación-de-alcance-2026-07-05) / chore 03: "Mapas" (vs. "Mapa"),
  "Registro de Activos" (vs. "Activos"). Las rutas (`to`) no cambian, solo el label visible.
- El encabezado del mockup ("Logistics Manager" / "Operational Hub" + logo en caja `bg-primary`)
  reemplaza el wordmark actual ("URBETRACK" + ícono `Truck`), pedido explícitamente en scope.md /
  chore 03.
- El botón "Report Incident" del mockup no tiene, en el mockup, ruta ni handler asociado.
- `@radix-ui/themes` expone `color` (paleta fija de Radix: `blue`, `gray`, `green`, etc.) y
  `radius` (`"none" | "small" | "medium" | "large" | "full"`) como **enums cerrados**, no valores
  arbitrarios. `designTokens.colors` son hex literales del lineamiento M3 y no coinciden con
  ninguna escala de Radix; `designTokens.rounded` sí son valores puntuales (rem) que sí pueden
  aproximarse al enum de Radix. Esto condiciona qué se resuelve con props de Radix y qué necesita
  un objeto de estilos (ver "Decisiones" y "Gaps a resolver").

## Decisiones propuestas (a confirmar antes de implementar)

1. **Sin Tailwind, sin CSS nuevo, sin estilos inline literales en el JSX.** Se construye la sidebar
   con **componentes de `@radix-ui/themes`**, aprovechando sus props de layout/spacing/tipografía
   (que ya evitan tener que escribir CSS a mano). Solo cuando un valor del mockup no tiene
   equivalente expresable como prop de un componente Radix (colores hex de `designTokens`,
   tipografía exacta de `designTokens.typography`), se define un **objeto de estilos con nombre**
   (`const ...Style: CSSProperties = {...}`, construido a partir de `designTokens`), nunca un
   literal `style={{ ... }}` escrito directamente en el JSX del componente.
2. **Mapeo mockup → componente de `@radix-ui/themes`:**

   | Elemento del mockup | Rol visual | Componente Radix |
   |---|---|---|
   | `<aside>` contenedor | superficie fija, sombra, borde derecho | `Card` (da fondo + borde + sombra por defecto; ver nota "Card vs. Box" abajo) |
   | Caja de logo (`w-8 h-8 bg-primary rounded`) | ícono sobre superficie de color | `Flex` (`align="center"`, `justify="center"`, `width`/`height` fijos) |
   | Título "Logistics Manager" | jerarquía tipográfica principal | `Heading` (`size` aproximado, ver mapeo tipografía) |
   | Subtítulo "Operational Hub" | texto secundario | `Text` (`size` aproximado, `color="gray"` como base, override de color exacto vía estilo si aplica) |
   | Cada ítem de navegación (`<button>`) | link con estado activo/hover | `Button` (`variant="ghost"` inactivo / `variant="soft"` activo) con `asChild` envolviendo `<Link>` de `@tanstack/react-router` |
   | Íconos (`material-symbols-outlined`) | ícono de cada ítem | `lucide-react` (decisión ya tomada, ver punto 3), como children del `Button` |
   | Separador antes del footer (`border-t`) | línea divisoria | `Separator` (`orientation="horizontal"`) |
   | Botón "Report Incident" | CTA de ancho completo | `Button` (`variant="solid"`, `size="3"`); Radix `Button` no tiene prop nativa de ancho completo, se documenta como excepción puntual (`width: '100%'` en el objeto de estilos, no CSS nuevo) |

   **Card vs. Box:** se prefiere `Card` porque su variante por defecto ya resuelve
   fondo+borde+sombra (lo que el mockup pide con `bg-surface-container-low ... shadow-sm
   border-r`) sin tener que definir sombra/borde a mano. Si en la implementación `Card` resulta
   demasiado opinado (padding propio, radios propios que choquen con el layout fijo), se cae a
   `Box` + el objeto de estilos fallback para `boxShadow`/`borderRight`. Se decide cuál de las dos
   al implementar, documentando el resultado en este mismo spec.
3. **Íconos: mantener `lucide-react`, sin agregar Material Symbols** (decisión ya tomada,
   confirmada). Mapeo:
   | Mockup (`material-symbols-outlined`) | `lucide-react` |
   |---|---|
   | `local_shipping` (logo y "Vehículos") | `Truck` |
   | `dashboard` | `LayoutDashboard` |
   | `map` | `Map` |
   | `inventory_2` | `Package` |
   | `report_problem` | `AlertTriangle` |
   | `add_alert` | `BellPlus` |
4. **Sin topbar: la sidebar ocupa el alto completo.** Como no existe spec ni implementación de una
   barra superior, se adapta el mockup para este cambio: `position="fixed"`, `top="0"`,
   `height="100vh"` (en vez de `top-16` / `calc(100vh-64px)`) — todos props de layout nativos de
   `Card`/`Box` de Radix, no CSS. `AppLayout.tsx` pasa a reservar `marginLeft` (ancho de la
   sidebar, `16rem`) en el contenedor de `<Outlet/>` vía prop `ml` de `Box`, ya que la sidebar deja
   de participar del `flex` (pasa a `fixed`).
5. **Encabezado: adoptar el texto del mockup ("Logistics Manager" / "Operational Hub")** como
   fuente de verdad de este cambio, reemplazando "URBETRACK". Se documenta la divergencia con
   scope.md/chore 03 y se propone actualizar esa mención en un follow-up de scope, fuera del
   alcance de este spec.
6. **Labels de navegación: adoptar los del mockup** ("Mapas", "Registro de Activos"), manteniendo
   las rutas (`to`) ya definidas en chore 03 (`/mapa`, `/activos`) sin cambios.
7. **Botón "Report Incident": placeholder sin acción**, con el estilo del mockup pero sin
   `onClick` real (o con un no-op documentado con `// TODO`), ya que no existe todavía una feature
   de alta de incidentes ni ruta destino.
8. **Estado activo del link de navegación** vía `activeProps` de `@tanstack/react-router`
   (mecanismo ya usado en el `Sidebar.tsx` actual), aplicado dinámicamente a cualquier ítem activo
   — no fijo en "Dashboard" como en el mockup estático — cambiando el `variant` del `Button` de
   `"ghost"` a `"soft"` y aplicando el objeto de estilos de color activo
   (`secondaryContainer`/`onSecondaryContainer`).
9. **Spacing y radios: usar la escala numérica de Radix (`gap`/`p` de `Flex`/`Box`, `radius` de
   `Card`/`Button`) en vez de valores px propios**, aproximando `designTokens.spacing` /
   `designTokens.rounded` a esa escala (tablas de mapeo abajo). Es una aproximación, no un mapeo
   exacto 1:1 — se documenta como tal.

## Mapeo de tokens a props de Radix (para no escribir CSS)

### Spacing (`designTokens.spacing` → escala `1`–`9` de Radix, usada en `gap`/`p`/`m`)

| `designTokens.spacing` | valor | escala Radix más cercana |
|---|---|---|
| `xs` | 4px | `1` (4px) |
| `sm` | 8px | `2` (8px) |
| `md` | 16px | `4` (16px) |
| `lg` | 24px | `5` (24px) |
| `xl` | 32px | `6` (32px) |

### Radios (`designTokens.rounded` → prop `radius` de Radix, enum cerrado)

| `designTokens.rounded` | valor | `radius` de Radix |
|---|---|---|
| `sm` | 0.125rem | `"small"` |
| `DEFAULT` | 0.25rem | `"medium"` |
| `md` | 0.375rem | `"medium"` (misma aproximación que `DEFAULT`, Radix no distingue estos dos) |
| `lg` | 0.5rem | `"large"` |
| `xl` | 0.75rem | `"large"` (misma aproximación que `lg`) |
| `full` | 9999px | `"full"` |

### Colores y tipografía (sin equivalente en props de Radix → objeto de estilos)

`designTokens.colors` (hex) y `designTokens.typography` (fuente/tamaño/peso/interlineado exactos)
no tienen prop de Radix que los exprese literalmente (`color` de Radix es una paleta cerrada,
`size` de `Text`/`Heading` es una escala tipográfica propia de Radix, no la nuestra). Para estos
casos se define, en un archivo nuevo `client/src/app/layout/sidebar.styles.ts`, un set de objetos
`CSSProperties` tipados construidos desde `designTokens` (no CSS, no literales inline):

```ts
// client/src/app/layout/sidebar.styles.ts (nuevo archivo, propuesto)
import type { CSSProperties } from 'react'
import { designTokens } from '../styles/tokens'

export const sidebarLogoBoxStyle: CSSProperties = {
  backgroundColor: designTokens.colors.primary
}

export const sidebarTitleStyle: CSSProperties = {
  ...designTokens.typography.titleMd,
  color: designTokens.colors.primary
}

export const sidebarSubtitleStyle: CSSProperties = {
  ...designTokens.typography.labelMd,
  color: designTokens.colors.onSurfaceVariant
}

export const navItemActiveStyle: CSSProperties = {
  backgroundColor: designTokens.colors.secondaryContainer,
  color: designTokens.colors.onSecondaryContainer
}

export const reportIncidentButtonStyle: CSSProperties = {
  width: '100%',
  backgroundColor: designTokens.colors.tertiary,
  color: designTokens.colors.onTertiary
}
```

Estos objetos se importan y se pasan al prop `style` de los componentes Radix correspondientes
(`<Card style={sidebarLogoBoxStyle}>`, etc.). No se usan clases CSS ni `styled-components`; es la
única forma tipada, sin CSS, de aplicar un valor que Radix no expone como prop.

## Cambios propuestos

### `client/src/app/layout/sidebar.styles.ts` (nuevo)

Objetos de estilos derivados de `designTokens` para los valores sin equivalente en props de Radix
(colores hex, tipografía exacta), según la sección anterior.

### `client/src/app/layout/Sidebar.tsx` (se reemplaza el contenido)

- Se reconstruye sobre `Card`/`Box`, `Flex`, `Heading`, `Text`, `Separator` y `Button` de
  `@radix-ui/themes` (import `{ Card, Flex, Heading, Text, Separator, Button } from
  '@radix-ui/themes'`), en vez de un `<nav>` con estilos inline.
- Layout fijo de alto completo vía props (`position="fixed"`, `top="0"`, `left="0"`, `width="16rem"`,
  `height="100vh"`), spacing vía `p`/`gap` (tabla de mapeo), sin CSS manual.
- Header: `Flex` con la caja de logo (ícono `Truck` + `sidebarLogoBoxStyle`) y el bloque de
  título/subtítulo (`Heading`/`Text` + `sidebarTitleStyle`/`sidebarSubtitleStyle`).
- Nav: mismo `NAV_ITEMS` (mismas rutas de chore 03), labels actualizados (decisión 6), íconos
  mapeados (decisión 3). Cada ítem es un `Button` con `asChild` envolviendo un `Link`;
  `variant`/estilo cambian según `activeProps` (decisión 8).
- Footer: `Separator` + `Button` "Report Incident" (`reportIncidentButtonStyle`, decisión 7).

### `client/src/app/layout/AppLayout.tsx` (se modifica)

- La sidebar deja de estar en el flujo `flex` (pasa a `position="fixed"`, decisión 4).
- El contenedor de `<Outlet/>` se reconstruye con `Box` de `@radix-ui/themes` (`ml="..."` en vez de
  `flex: 1` inline) para reservar el ancho de la sidebar fija.

### `Sidebar.test.tsx`

- Se actualiza para reflejar los nuevos labels ("Mapas", "Registro de Activos") y para verificar
  que el ítem activo recibe el estado/estilo de `activeProps` (decisión 8), manteniendo la
  cobertura existente (navegación, no re-render de la sidebar entre rutas).

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **Aproximaciones de `radius` aceptadas:** el enum cerrado de Radix colapsa `DEFAULT`/`md` en
   `"medium"` y `lg`/`xl` en `"large"` (tabla arriba). Si se requiere fidelidad píxel-a-píxel con
   `designTokens.rounded`, la alternativa es tratar el radio también como objeto de estilos
   (`borderRadius: designTokens.rounded.lg`) en vez de la prop `radius` de Radix — a decidir.
2. **`shadow-sm` y `z-40` del mockup:** no existen en `DesignTokens` (solo `colors`, `typography`,
   `rounded`, `spacing`). Si se usa `Card` (punto 2 del mapeo) la sombra la resuelve el componente
   sin necesidad de token nuevo; el `z-index` sigue sin tener equivalente en Radix ni en
   `tokens.ts` — falta decidir si se agrega un token `zIndex` a `tokens.ts` (fuera del alcance de
   este spec, requeriría modificar chore 02) o si se hardcodea puntualmente en
   `sidebar.styles.ts`.
3. **Confirmar decisión 4 (sin topbar):** alternativa sería introducir ya una topbar de 64px para
   respetar el mockup literal (`top-16`). Se propone la opción "sin topbar" para no anticipar un
   componente sin spec propio.
4. **Confirmar decisión 5 (rebrand del header):** reemplazar "URBETRACK" por "Logistics Manager /
   Operational Hub" es un cambio de producto, no solo visual; requiere aprobación explícita antes
   de tocar `scope.md`.
5. **`Card` vs. `Box` para el contenedor (punto 2) — resuelto: `Box`.** `Card` (categoría
   "Components" de Radix Themes) solo soporta *margin props*, no *layout props* (`position`, `top`,
   `left`, `width`, `height`, `p`) — confirmado contra la documentación oficial de Radix Themes.
   Como la sidebar necesita `position="fixed"` + padding sin CSS manual, se usa `Box` (categoría
   "Layout", sí soporta todas esas props) y se agrega `sidebarContainerStyle` en
   `sidebar.styles.ts` para el fondo/sombra/borde/`z-index` que `Card` habría dado gratis.
6. **Estado activo — implementado con `useMatchRoute`, no `activeProps`.** `Button asChild`
   envolviendo `Link` hace que Radix (`Slot`) renderice el `Button` *como* el `<a>` de `Link`;
   usar `activeProps` de `Link` para setear estilos en simultáneo con el `style`/`variant` que ya
   define el `Button` termina en dos fuentes de estilo compitiendo sobre el mismo nodo. En cambio,
   `Sidebar.tsx` llama a `useMatchRoute()` (hook de `@tanstack/react-router`) para calcular
   `isActive` por ítem y con ese valor decide el `variant` (`"soft"`/`"ghost"`) y el objeto de
   estilos (`navItemActiveStyle`/`navItemInactiveStyle`) del `Button`, una única fuente de verdad
   para el estado activo.

## Fuera de alcance

- Instalar Tailwind, Material Symbols o cualquier librería de utilidades CSS nueva.
- Wiring del theme global de `@radix-ui/themes` (`accentColor`, `radius` del `<Theme>` raíz,
  variables CSS de acento) con `designTokens` — eso sigue siendo lo que
  [chore 02](../chore/02-visual-alignment.md) dejó fuera de alcance a nivel de **theme completo**;
  este feature solo consume props/objetos de estilos por componente, sin tocar `<Theme>` en
  `main.tsx`.
- Implementar una topbar/app-bar superior.
- La funcionalidad del botón "Report Incident" (alta de incidentes).
- Actualizar `docs/scope.md` con el nuevo copy del header — se deja anotado como follow-up, no se
  hace en este spec.
- Agregar un token `zIndex` a `client/src/app/styles/tokens.ts` — si se decide necesario, es un
  cambio a chore 02, no a este feature.

## Verificación post-implementación

1. `pnpm --filter client typecheck` compila sin errores.
2. `pnpm --filter client lint` / `format:check` pasan sobre `Sidebar.tsx`, `AppLayout.tsx`,
   `sidebar.styles.ts` y su test.
3. `pnpm --filter client test` — `Sidebar.test.tsx` actualizado pasa, cobertura ≥ 80%.
4. Revisión manual de que no se agregó ningún archivo `.css` nuevo ni ningún `style={{ ... }}`
   literal en el JSX de `Sidebar.tsx`/`AppLayout.tsx` (solo props de Radix + los objetos
   importados de `sidebar.styles.ts`).
5. Verificación visual: la sidebar ocupa el alto completo de la ventana, permanece fija al
   scrollear el contenido, el ítem de navegación activo se resalta al cambiar de ruta, y el
   contenido (`Outlet`) no queda oculto detrás de la sidebar.
