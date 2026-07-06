# SPEC — Tarjetas de estado de vehículos (Vehicle Status Cards)

**Tipo:** feature
**Estado:** Implementado y verificado. `pnpm --filter client lint`, `typecheck` y `test` corridos
por el usuario, todos en verde (`test` detectó y corrigió una regresión real en
`src/app/router/router.test.tsx`, ver "Hallazgos de verificación" más abajo).
**Fecha:** 2026-07-06
**Relacionado:** [docs/designs/02-vehicles-status-cards.md](../designs/02-vehicles-status-cards.md),
[docs/specs/architecture.md](../specs/architecture.md),
[docs/specs/component-test-vehicles-table.md](../specs/component-test-vehicles-table.md),
[docs/verified-scope.md](../verified-scope.md) §2.2 y §11,
`client/src/app/styles/tokens.ts`, `client/src/features/vehicles/`, `@radix-ui/themes` Card
(https://www.radix-ui.com/themes/docs/components/card)

## Objetivo

Mostrar, en la pantalla de Vehículos (`client/src/features/vehicles/pages/VehiclesPage.tsx`), un
resumen general del estado de la flota mediante 4 tarjetas ("bento cards"):

1. Total de vehículos.
2. Vehículos activos (`ACTIVE`), con su porcentaje sobre el total.
3. Vehículos en mantenimiento (`MAINTENANCE`), con su porcentaje sobre el total.
4. Vehículos fuera de servicio (`OUT_OF_SERVICE`), con su porcentaje sobre el total.

El mockup de referencia (fuente de verdad visual) es
[docs/designs/02-vehicles-status-cards.md](../designs/02-vehicles-status-cards.md). Los valores
`452`/`312`/`84`/`56`/`69%`/`18.5%`/`12.4%` del mockup son de ejemplo — este spec reemplaza esos
literales por valores **calculados en runtime** a partir de los vehículos reales (`GET /vehicles`).

**Decisión explícita de alcance (pedido del usuario):** no se crean 4 tarjetas hardcodeadas en el
JSX. Se define un **objeto/array de datos** que mapea cada tarjeta (label, valor, ícono, color,
copy secundario) y se renderiza dinámicamente con `.map()` sobre un componente `VehicleStatusCard`
reutilizable.

## Diagnóstico

- `client/src/features/vehicles/` hoy solo tiene `pages/VehiclesPage.tsx`, un placeholder
  (`<h1>Vehículos</h1>`, ver [chore 03](../chore/03-navigation-shell-router.md)). No existe
  `api/`, `store/`, `types/` ni `components/` para esta feature todavía — este spec es el primer
  desarrollo funcional de `vehicles`.
- El backend mock ya expone `GET /vehicles` (`api/src/controllers/vehicles.controller.ts`,
  `api/src/routes/vehicles.routes.ts`), con el modelo (`api/src/data/vehicles.ts`,
  `api/src/schemas/vehicle.schema.ts`):

  ```ts
  type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'
  type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

  interface Vehicle {
    id: string
    plate: string
    type: VehicleType
    status: VehicleStatus
    capacity: number
    zoneId: string
  }
  ```

  Coincide con `docs/verified-scope.md` §2.2 (estados de vehículo) y con el `RawVehicle` ya
  definido en [component-test-vehicles-table.md](../specs/component-test-vehicles-table.md) §4.
  No hace falta ampliar el modelo de datos: los 3 estados del mockup (`Activos` = `ACTIVE`, `En
  mantenimiento` = `MAINTENANCE`, `Fuera de servicio` = `OUT_OF_SERVICE`) ya existen en el backend.
- El patrón de data-fetching + estado global ya está formalizado en
  [architecture.md](../specs/architecture.md#estado-global-y-data-fetching): React Query trae los
  datos, Zustand es la fuente de verdad para la UI. Este spec sigue ese mismo patrón para
  `vehicles`, replicando la estructura de `component-test` (`useVehiclesQuery` → hidrata
  `useVehiclesStore`).
- El mockup usa clases utilitarias tipo Tailwind (no instalado, igual que en
  [spec 01](./01-modify-sidebar.md)) que se leen como referencias a `designTokens`
  (`client/src/app/styles/tokens.ts`). Varios valores del mockup **no tienen token equivalente
  hoy** (ver "Gaps a resolver").
- El usuario pidió explícitamente usar el componente
  [`Card` de `@radix-ui/themes`](https://www.radix-ui.com/themes/docs/components/card) para las
  tarjetas. Confirmado contra la documentación oficial: `Card` se basa en `div`, soporta
  `asChild`, `size` (`"1"–"5"`, default `"1"`) y `variant` (`"surface" | "classic" | "ghost"`,
  default `"surface"`), y solo acepta **margin props** (no `p`/layout props como `position` —
  mismo hallazgo ya documentado en [spec 01](./01-modify-sidebar.md) punto 5 de "Gaps a resolver").
  El padding interno de `Card` lo da su `size`, no un prop `p` propio.

## Decisiones propuestas (a confirmar antes de implementar)

1. **Estructura de datos dinámica, no 4 cards fijas.** Se define un tipo `VehicleStatusCardData` y
   una función pura `buildVehicleStatusCards(vehicles: Vehicle[]): VehicleStatusCardData[]` (o
   `Record`) que:
   - Calcula `total = vehicles.length`.
   - Calcula `activeCount`, `maintenanceCount`, `outOfServiceCount` filtrando por `status`.
   - Calcula el porcentaje de cada estado sobre el total: `Math.round((count / total) * 1000) /
     10` (un decimal, como `69%`/`18.5%`/`12.4%` del mockup), con `0` cuando `total === 0` (sin
     división por cero).
   - Devuelve un array de 4 entradas (`total`, `active`, `maintenance`, `outOfService`), cada una
     con: `key`, `label`, `value` (número formateado), `icon` (componente `lucide-react`),
     `secondaryText` (copy bajo el valor) y los tokens de color a aplicar (fondo del ícono, color
     del ícono, color del texto de porcentaje).
   - `VehiclesPage.tsx` (o un componente hijo `VehicleStatusCards.tsx`) itera ese array con
     `.map()` y renderiza un único componente `VehicleStatusCard` por entrada — sin JSX repetido
     para cada tarjeta.
2. **Fuente de los datos: React Query + Zustand, patrón ya establecido.**
   - `features/vehicles/api/useVehiclesQuery.ts`: hook `useQuery` que llama a `GET /vehicles`
     (mismo mock, sin nuevos endpoints).
   - `features/vehicles/store/useVehiclesStore.ts`: store Zustand `{ vehicles: Vehicle[];
     setVehicles(vehicles): void }`, hidratado en `useEffect` cuando la query resuelve (mismo
     patrón que `component-test` y que "Patrón: query hidrata store" de
     [architecture.md](../specs/architecture.md#patrón-query-hidrata-store)).
   - Las tarjetas leen del store (no directo de la query), consistente con "el store de Zustand es
     la fuente de verdad para los componentes de UI".
   - Mientras `isLoading`, las 4 tarjetas muestran skeleton (`@radix-ui/themes` `Skeleton`, mismo
     mecanismo que la tabla de `component-test`), no un estado vacío.
3. **Componente de tarjeta sobre `Card` de `@radix-ui/themes`.** Mapeo mockup → Radix:

   | Elemento del mockup | Componente Radix |
   |---|---|
   | Tarjeta (`div.bg-surface-container-lowest...`) | `Card` (`variant="surface"`, `size` a definir en implementación según el padding real que dé cada `size` vs. `p-lg`) |
   | Grilla `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md` | `Grid` de `@radix-ui/themes` (`columns` responsive) en vez de clases CSS de grilla |
   | Fila ícono + label (`flex justify-between items-start`) | `Flex` (`justify="between"`, `align="start"`) |
   | Caja de ícono (`span.p-2.bg-...rounded-lg`) | `Flex` (`align="center"`, `justify="center"`) con estilo de fondo/color (ver punto 5, sin equivalente en prop de Radix) |
   | Label superior (`font-label-sm ... uppercase`) | `Text` (`size` aproximado a `labelSm`, con estilo de `letterSpacing`/`textTransform` si Radix no lo cubre) |
   | Valor grande (`text-3xl font-bold`) | `Heading` o `Text` de mayor tamaño (ver gap de tipografía, punto 2 de "Gaps") |
   | Línea secundaria (ícono `trending_up` + copy, o `%` + copy) | `Flex` (`gap="1"`, `align="center"`) con `Text` |
   | Íconos (`inventory`, `check_circle`, `build`, `error_outline`, `trending_up`) | `lucide-react`, ver mapeo punto 4 |

4. **Íconos: `lucide-react`**, mismo criterio que [spec 01](./01-modify-sidebar.md) punto 3 (sin
   agregar Material Symbols). Mapeo propuesto:

   | Mockup (`material-symbols-outlined`) | `lucide-react` |
   |---|---|
   | `inventory` (Total de Vehículos) | `Truck` |
   | `check_circle` (Activos) | `CheckCircle2` |
   | `build` (En mantenimiento) | `Wrench` |
   | `error_outline` (Fuera de servicio) | `AlertCircle` |
   | `trending_up` (tendencia del total) | `TrendingUp` |

5. **Colores: mapear a roles semánticos existentes de `designTokens.colors`, sin agregar tokens
   nuevos**, ya que los hex del mockup no están en `tokens.ts` pero corresponden 1:1 a roles
   semánticos ya definidos (`success`/`tertiary`/`error`, documentados en `tokens.ts` como
   "Success = ACTIVE", "Warning/tertiary = MAINTENANCE", "Error = OUT_OF_SERVICE"):

   | Tarjeta | Hex del mockup | Rol semántico | Token propuesto (`designTokens.colors`) |
   |---|---|---|---|
   | Total — caja de ícono | `bg-surface-container` / `text-primary` | neutro/marca | `surfaceContainer` / `primary` |
   | Total — línea de tendencia | `text-[#4caf50]` | positivo | `success` (aproximación; el hex exacto no está en tokens, ver "Gaps") |
   | Activos — caja de ícono | `bg-[#e8f5e9]` / `text-[#2e7d32]` | éxito | `successContainer` / `success` |
   | Mantenimiento — caja de ícono | `bg-[#fff3e0]` / `text-[#ef6c00]` | advertencia | `tertiaryContainer` / `tertiary` |
   | Fuera de servicio — caja de ícono | `bg-[#ffebee]` / `text-[#c62828]` | error | `errorContainer` / `error` |
   | Fuera de servicio — porcentaje (`text-error`) | ya es una clase de token | error | `error` (ya coincide 1:1, sin gap) |

   Estos objetos de color/tamaño sin equivalente en props de Radix se definen en un archivo nuevo
   `client/src/features/vehicles/components/vehicleStatusCard.styles.ts` (mismo patrón que
   `sidebar.styles.ts` de [spec 01](./01-modify-sidebar.md)): objetos `CSSProperties` tipados
   construidos desde `designTokens`, nunca `style={{ ... }}` literal en el JSX.
6. **Ubicación:** las tarjetas se renderizan en `VehiclesPage.tsx`, arriba de donde luego vivirá la
   tabla de vehículos (§6 de `docs/verified-scope.md`, fuera de alcance de este spec). Este spec
   **no** implementa la tabla ni sus filtros/tabs, solo el resumen de estados.
7. **Formato de porcentaje:** un decimal cuando no es entero (`18.5%`, `12.4%`), sin decimales
   cuando el resultado es entero (`69%`, no `69.0%`) — replica el mockup.

## Estructura de archivos propuesta

```text
client/src/features/vehicles/
  api/
    useVehiclesQuery.ts          # useQuery -> GET /vehicles
  store/
    useVehiclesStore.ts          # Zustand: { vehicles, setVehicles }
  hooks/
    useVehicleStatusCards.ts     # deriva VehicleStatusCardData[] desde el store (memoizado)
  components/
    VehicleStatusCards.tsx       # Grid + .map() sobre VehicleStatusCard
    VehicleStatusCard.tsx        # tarjeta individual (Card + Flex + Text/Heading)
    vehicleStatusCard.styles.ts  # objetos CSSProperties desde designTokens (colores/tipografía)
  pages/
    VehiclesPage.tsx             # se modifica: monta <VehicleStatusCards />
```

> `Vehicle`, `VehicleStatus`, `VehicleType` (mismo shape que `api/src/types`) viven en
> `client/src/shared/types/domain.types.ts`, fuente única de verdad del tipado de dominio
> (ver [chore 04](../chore/04-move-typed.md)), no en un `types/` propio de la feature.

Todos los directorios nuevos existen porque la feature `vehicles` los necesita (regla de
"Estructura interna de una feature" en [architecture.md](../specs/architecture.md)); no se agrega
nada a `shared/` porque nada de esto se reutiliza todavía desde una segunda feature.

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **Colores exactos del mockup vs. roles de `designTokens`:** el mockup usa hex específicos
   (`#4caf50`, `#e8f5e9`/`#2e7d32`, `#fff3e0`/`#ef6c00`, `#ffebee`/`#c62828`) que **no coinciden
   exactamente** con los valores actuales de `success`/`successContainer`,
   `tertiary`/`tertiaryContainer`, `error`/`errorContainer` en `tokens.ts` (son tonos similares
   pero no idénticos). Falta decidir: (a) usar los tokens existentes tal cual (aproximación, sin
   tocar `tokens.ts`) — opción propuesta por defecto, o (b) ajustar esos valores en
   `tokens.ts`/agregar variantes nuevas, lo que sería un cambio de alcance de
   [chore 02](../chore/02-visual-alignment.md), no de este feature.
2. **Tipografía `text-3xl` (valor grande de cada card) sin equivalente exacto en
   `designTokens.typography`:** la escala tipográfica tiene `headlineLg` (32px/700) y `headlineMd`
   (24px/600), pero no un tamaño "3xl" propio. Falta decidir cuál de las dos se usa (se propone
   `headlineLg`, más cercano a `text-3xl` de Tailwind ≈ 30px) o si se define un nuevo nivel en
   `tokens.ts` (fuera de alcance de este feature).
3. **`shadow-sm` y `rounded-xl` del mockup:** si se usa `Card` de Radix, la sombra la resuelve el
   componente (igual que en [spec 01](./01-modify-sidebar.md) punto 2 de "Gaps"); el radio
   (`rounded-xl` = `designTokens.rounded.xl`, 0.75rem) se aproxima al enum cerrado `radius` de
   Radix (`"large"`), misma limitación ya documentada en spec 01.
4. **`size` de `Card` a usar:** Radix `Card` no tiene un prop `p` directo — su padding depende del
   `size` (`"1"`–`"5"`). Falta confirmar en implementación cuál `size` se aproxima mejor a
   `p-lg` (24px) del mockup, o si hace falta un ajuste puntual vía `style` (como excepción
   documentada, igual que `sidebarContainerStyle` en spec 01).
5. **Vehículos con estado desconocido:** el modelo de backend solo define 3 estados
   (`ACTIVE`/`MAINTENANCE`/`OUT_OF_SERVICE`), por lo que `activeCount + maintenanceCount +
   outOfServiceCount === total` siempre. No hay estado "sin clasificar" a contemplar — se deja
   anotado por si el modelo se amplía a futuro.

## Fuera de alcance

- La tabla de vehículos, sus filtros/tabs y el modal de edición (`docs/verified-scope.md` §6/§7),
  que se desarrollan en un feature propio posterior.
- Modificar `tokens.ts` (colores o tipografía) — este spec usa los tokens existentes con las
  aproximaciones documentadas en "Gaps a resolver"; si el usuario prefiere fidelidad exacta al
  mockup, ese ajuste es un cambio de alcance de [chore 02](../chore/02-visual-alignment.md).
  contra `tokens.ts`.
- Cualquier lógica de asignación de vehículos a incidentes/activos (`docs/verified-scope.md` §5).
- Instalar Tailwind o Material Symbols.

## Hallazgos de verificación (post-implementación)

- **`src/app/router/router.test.tsx` no envolvía `<RouterProvider>` en `<QueryClientProvider>`.**
  Antes de este feature ninguna pantalla ruteada usaba `@tanstack/react-query` (todas eran
  placeholders), así que el test de integración del router nunca necesitó ese provider, pese a que
  `main.tsx` sí lo monta por encima del router en la app real. Al montar `useVehiclesQuery` en
  `VehiclesPage`, `pnpm --filter client test` falló:
  `router integration > keeps the sidebar mounted (same DOM node) while navigating between
  screens` — `Error: No QueryClient set, use QueryClientProvider to set one` al navegar a
  `/vehiculos`.
  **Decisión:** corregir el test, no el componente — es el test el que quedó desalineado con la
  composición real de providers de `main.tsx`, no `VehiclesPage`. Se envuelve `<RouterProvider>` en
  ambos `it()` de `describe('router integration', ...)` con un `QueryClientProvider` propio (mismo
  patrón ya usado en `component-test/VehiclesTable.test.tsx`: `new QueryClient({ defaultOptions: {
  queries: { retry: false } } })`), sin tocar `main.tsx` (que ya está bien).
- `pnpm --filter client lint` no reportó errores nuevos; los 3 warnings existentes
  (`Unused eslint-disable directive`) son de archivos generados en `client/coverage/`, no
  relacionados con este feature.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre los archivos nuevos.
3. `pnpm --filter client test` — tests unitarios de `buildVehicleStatusCards`/
   `useVehicleStatusCards` (conteos y porcentajes correctos, incluyendo `total === 0`) y de
   render de `VehicleStatusCards` (4 tarjetas, valores correctos, skeleton mientras carga),
   cobertura ≥ 80%.
4. Revisión manual de que las 4 tarjetas se generan iterando el array/objeto de datos (no 4
   bloques JSX hardcodeados) y que no hay `style={{ ... }}` literal fuera de
   `vehicleStatusCard.styles.ts`.
5. Verificación visual contra el mockup de
   [docs/designs/02-vehicles-status-cards.md](../designs/02-vehicles-status-cards.md).
