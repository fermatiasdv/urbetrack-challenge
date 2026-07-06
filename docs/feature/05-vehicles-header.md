# SPEC — Encabezado de pantalla reutilizable (`HeaderPage`) + uso en Vehículos

**Tipo:** feature
**Estado:** Implementado y verificado (2026-07-06). Ampliación de alcance pedida explícitamente
por el usuario: el encabezado deja de ser un componente propio de `vehicles` y pasa a ser un
componente compartido (`shared/components/HeaderPage`), porque se va a reutilizar en la mayoría de
las pantallas de la app a medida que se desarrollen. `typecheck`, `lint` y `format:check` en
verde; `test` en verde para `HeaderPage.test.tsx` (4/4) y `VehiclesPage.test.tsx` (2/2) — ver
"Hallazgos de verificación".
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/02-vehicle-statuscard.md](./02-vehicle-statuscard.md),
[docs/feature/03-vehicles-table.md](./03-vehicles-table.md),
[docs/feature/04-vehicles-filtertable.md](./04-vehicles-filtertable.md),
[docs/feature/01-modify-sidebar.md](./01-modify-sidebar.md),
[docs/specs/architecture.md](../specs/architecture.md) (secciones "shared" y "Regla para
shared"), `client/src/app/styles/tokens.ts`, `client/src/app/layout/sidebar.styles.ts`,
`client/src/features/vehicles/pages/VehiclesPage.tsx`, `@radix-ui/themes` `Button`
(https://www.radix-ui.com/themes/docs/components/button)

## Objetivo

1. Crear `HeaderPage`, un componente **presentacional y genérico** en `client/src/shared/
   components/`, que renderiza el encabezado de una pantalla: título (izquierda, arriba),
   subtítulo opcional (izquierda, debajo del título) y un botón de acción opcional (derecha,
   contra el margen).
2. Usarlo desde `VehiclesPage.tsx` (única pantalla que lo consume por ahora) reemplazando el
   `<h1>Vehículos</h1>` placeholder actual, con: título "Vehículos", subtítulo "Disponibilidad de
   los vehículos en tiempo real" y botón "Agregar Vehículo" (ícono "+", color primario).
3. El resto de las pantallas (`AssetsPage`, `IncidentsPage`, `DashboardPage`, `MapPage`, hoy
   placeholders con su propio `<h1>`) adoptan `HeaderPage` cuando se desarrollen en sus specs
   propios — **fuera de alcance de este spec**, que solo entrega el componente y lo conecta en
   Vehículos.

## Diagnóstico

- Este spec reemplaza a la versión anterior de `docs/feature/05-vehicles-header.md`, que proponía
  un componente `VehiclesHeader` local a `features/vehicles/components/`. El usuario pidió
  explícitamente subirlo a `shared/` **antes** de que una segunda feature lo necesite, como
  excepción documentada a la regla de `shared/README.md` ("un módulo migra desde una feature a
  `shared/` recién cuando una segunda feature lo necesita"): la excepción se justifica porque el
  usuario ya confirmó la intención de reutilizarlo en la mayoría de las pantallas, no es una
  anticipación especulativa de Claude.
- `client/src/shared/components/` existe pero está vacío (solo `.gitkeep`) — este es el primer
  componente compartido real del proyecto.
- De los 3 subelementos (título, subtítulo, botón de acción), el único obligatorio es el título;
  las otras 4 pantallas placeholder hoy solo tienen un `<h1>` sin subtítulo ni acción, por lo que
  el componente debe soportar renderizarse solo con título.
- El botón de acción necesita texto + ícono + handler simultáneamente para tener sentido (no hay
  caso de uso de "botón sin acción" o "ícono sin botón"), por lo que se modela como **un único
  objeto opcional** (`action`), no como 3 props sueltas y opcionales de forma independiente —
  evita estados inválidos como "hay ícono pero no hay botón".
- Confirmado contra el código real: `Theme` en `main.tsx` **no** fija ningún `accentColor` (se
  usa el default de Radix, un azul distinto al `primary` de `designTokens`). El spec anterior
  asumía, sin verificar, que el color primario del botón salía gratis del tema de Radix — es
  incorrecto. El proyecto ya resuelve este mismo problema en `sidebar.styles.ts` →
  `reportIncidentButtonStyle` ([spec 01](./01-modify-sidebar.md)): un objeto `CSSProperties` con
  `backgroundColor`/`color` tomados de `designTokens.colors`, pasado a la prop `style` de `Button`.
  `HeaderPage` sigue el mismo patrón para el botón de acción.
- Íconos: `lucide-react` (ya usado en todo el proyecto, sin Material Symbols). El tipo del ícono
  del botón de acción es `LucideIcon` (mismo tipo ya usado en
  `features/vehicles/hooks/useVehicleStatusCards.ts` para `VehicleStatusCardData.icon`), no un
  `ReactNode` genérico — mantiene la prop tipada contra la librería de íconos real del proyecto.

## Decisiones propuestas

1. **Componente `HeaderPage`**, nuevo, en `client/src/shared/components/HeaderPage.tsx`:

   ```tsx
   export interface HeaderPageAction {
     label: string
     icon?: LucideIcon
     onClick: () => void
   }

   export interface HeaderPageProps {
     title: string
     subtitle?: string
     action?: HeaderPageAction
   }

   export function HeaderPage({ title, subtitle, action }: HeaderPageProps): JSX.Element
   ```

   Solo `title` es obligatorio; `subtitle` y `action` son opcionales y no se renderizan si no se
   pasan (sin espacios reservados vacíos).
2. **Mapeo a `@radix-ui/themes`/tokens** (mismo criterio que specs anteriores, sin CSS a mano
   salvo lo que no tenga prop de Radix):

   | Elemento | Componente / origen |
   |---|---|
   | Contenedor | `<header>` semántico + `Flex` (`justify="between"`, `align="center"`) |
   | `title` | `Heading` |
   | `subtitle` (si viene) | `Text` (`color="gray"`), debajo del título, dentro del mismo bloque izquierdo (`Flex direction="column"`) |
   | `action` (si viene) | `Button` (`variant="solid"`, `size="3"`), con `style` de `headerPageActionButtonStyle` (`client/src/shared/components/headerPage.styles.ts`, mismo patrón que `reportIncidentButtonStyle`): `backgroundColor: designTokens.colors.primary`, `color: designTokens.colors.onPrimary` |
   | `action.icon` (si viene) | instancia del componente `LucideIcon` recibido, como children del `Button`, antes del `label` |

3. **Uso desde `VehiclesPage.tsx`:** la página arma un objeto de props (no props sueltas inline en
   el JSX, pedido explícito del usuario) y lo spreadea sobre `HeaderPage`:

   ```tsx
   const vehiclesHeaderProps: HeaderPageProps = {
     title: 'Vehículos',
     subtitle: 'Disponibilidad de los vehículos en tiempo real',
     action: {
       label: 'Agregar Vehículo',
       icon: Plus,
       onClick: handleAddVehicle
     }
   }

   <HeaderPage {...vehiclesHeaderProps} />
   ```

   `handleAddVehicle` es, por ahora, un placeholder sin efecto visible (el modal de alta de
   vehículo es un spec futuro, ver "Fuera de alcance" — mismo razonamiento que la versión anterior
   de este spec).
4. **Se quita el `<h1>Vehículos</h1>`** de `VehiclesPage.tsx`: el título pasa a vivir dentro de
   `HeaderPage` vía `vehiclesHeaderProps.title`.
5. **Ubicación en `VehiclesPage.tsx`:** `<HeaderPage {...vehiclesHeaderProps} />` se monta primero,
   antes del `if (isLoading)` — no depende de que los vehículos hayan cargado, a diferencia de
   `VehicleStatusCards`/`VehiclesFilterBar`/`VehiclesTable`, que siguen detrás del `Skeleton`
   mientras `isLoading` es `true`.
6. **No se migra ni se toca** ninguna otra pantalla (`AssetsPage`, `IncidentsPage`,
   `DashboardPage`, `MapPage`) en este spec — cada una adopta `HeaderPage` en su propio spec de
   desarrollo futuro, con su propio `title`/`subtitle`/`action` según corresponda.

## Estructura de archivos propuesta

```text
client/src/shared/components/
  HeaderPage.tsx           # nuevo: título (obligatorio) + subtítulo (opcional) + Button de acción (opcional)
  headerPage.styles.ts     # nuevo: headerPageActionButtonStyle (colores primary/onPrimary, sin prop equivalente en Radix)
client/src/features/vehicles/
  pages/
    VehiclesPage.tsx        # se modifica: quita <h1>Vehículos</h1>, arma vehiclesHeaderProps y monta <HeaderPage {...vehiclesHeaderProps} /> arriba de todo (antes del Skeleton)
```

## Fuera de alcance

- El modal de alta de vehículo en sí (formulario, validación de placa, llamada a `POST
  /vehicles`, mensajes de éxito/error) — spec propio posterior, análogo al modal de
  detalle/edición de `docs/verified-scope.md` §7. `handleAddVehicle` queda como placeholder.
- Cualquier store nuevo o ampliación de `useVehicleModalStore` para soportar el modo de creación —
  se decide en el spec del modal.
- Adoptar `HeaderPage` en `AssetsPage`, `IncidentsPage`, `DashboardPage` o `MapPage` — se hace
  pantalla por pantalla, en el spec que desarrolle cada una.
- Variantes de `HeaderPage` no pedidas (breadcrumbs, tabs, múltiples acciones) — el componente
  soporta exactamente 1 acción opcional, ampliar a más de una acción es un cambio de alcance
  futuro si se necesita.

## Verificación post-implementación

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos/modificados.
3. `pnpm --filter client test` — test de `HeaderPage` (renderiza solo título cuando no se pasan
   `subtitle`/`action`; renderiza subtítulo cuando se pasa; renderiza el botón con ícono y label, y
   el click invoca `action.onClick`, cuando se pasa `action`) y ajuste del test existente de
   `VehiclesPage` si asertaba sobre el `<h1>Vehículos</h1>` removido, cobertura ≥ 80%.
4. Revisión manual de que no queda ningún `<h1>Vehículos</h1>` ni texto "Vehículos" duplicado en
   `VehiclesPage.tsx`.
5. Revisión manual de que no hay `style={{ ... }}` literal fuera de `headerPage.styles.ts`.

## Hallazgos de verificación (post-implementación)

- El mount de `client/` usado en esta sesión no permite correr `pnpm` directamente sobre el
  workspace conectado (mismo problema ya documentado en specs anteriores: EPERM al hacer
  `unlink` de un archivo temporal que pnpm usa para detectar el filesystem del store). Se
  verificó en una copia aislada del repo (`tar` del working tree a un directorio del propio
  entorno Linux, `pnpm install` ahí), no en el mount real — mismo criterio que la verificación de
  [feature 01](./01-modify-sidebar.md).
- `pnpm --filter client typecheck`: sin errores.
- `pnpm --filter client lint`: sin errores en los archivos nuevos/modificados (`HeaderPage.tsx`,
  `headerPage.styles.ts`, `HeaderPage.test.tsx`, `VehiclesPage.tsx`).
- `pnpm --filter client format:check`: `HeaderPage.tsx` necesitó un ajuste de formato (el `Button`
  del botón de acción se parte en múltiples líneas por el largo de la línea) — aplicado.
- `pnpm --filter client test`: `HeaderPage.test.tsx` (4/4) y `VehiclesPage.test.tsx` (2/2) en
  verde. `VehiclesFilterBar.test.tsx` tuvo 3 fallas preexistentes, no relacionadas con este spec
  (`TypeError: target.hasPointerCapture is not a function` al interactuar con `Select` de
  `@radix-ui/themes` bajo jsdom) — no se modificó ningún archivo de `VehiclesFilterBar` en este
  spec; se deja anotado para un fix aparte, fuera de este alcance.
