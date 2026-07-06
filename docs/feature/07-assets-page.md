# SPEC — Pantalla de Activos (Assets Page)

**Tipo:** feature
**Estado:** Aprobado por el usuario (2026-07-06) e implementado. Los 4 gaps quedaron resueltos
según lo propuesto (neutral vía `inverseSurface`, ícono `Ban`, migración de `useZonesQuery` a
`shared/`, mensajes de éxito/error calcados de vehículos). Ver "Hallazgos de verificación".
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/02-vehicle-statuscard.md](./02-vehicle-statuscard.md),
[docs/feature/03-vehicles-table.md](./03-vehicles-table.md),
[docs/feature/04-vehicles-filtertable.md](./04-vehicles-filtertable.md),
[docs/feature/05-vehicles-header.md](./05-vehicles-header.md),
[docs/feature/06-vehicles-modal.md](./06-vehicles-modal.md),
[docs/specs/architecture.md](../specs/architecture.md), [docs/verified-scope.md](../verified-scope.md)
§2.3, §6, §7.2, §7.4, [docs/METHODS.md](../METHODS.md) "Assets" y "Limitaciones conocidas",
`api/src/schemas/asset.schema.ts`, `@tanstack/react-table`, `@radix-ui/themes` (`Card`, `Table`,
`DropdownMenu`, `AlertDialog`, `Dialog`, `Select`, `Popover`, `CheckboxGroup` — todos ya instalados)

## Decisiones del usuario (2026-07-06, confirmadas antes de este spec)

1. **Ampliación de alcance sobre `docs/verified-scope.md` §7.2** (que hoy define el modal de
   Activos como solo lectura, sin "Modificar"/"Guardar"): se agrega **Eliminar** (mismo patrón sin
   backend que vehículos, §7.4) y se agrega **edición del campo `status`** — único campo editable,
   igual que en vehículos la Placa es el único campo editable. `type`, `zoneId`, `lat`, `lng` y
   `address` siguen siendo de solo lectura.
2. **Alcance de esta ronda: todo junto.** Un solo spec/PR que cubre header, tarjetas de estado,
   tabla con acciones (editar estado / eliminar), filtros y modal — a diferencia de vehículos, que
   se hizo en 5 specs incrementales (02 a 06). Se documentan igual todas las decisiones de diseño
   que en cada spec de vehículos, consolidadas en un único documento.
3. **Reutilización explícita pedida por el usuario:** "podés reutilizar los componentes que ya
   fueron creados llevándolos a shared". Como `assets` es la **segunda feature** que necesita
   tarjetas de estado, menú de acciones de fila y diálogo de confirmación de borrado, se cumple la
   regla de `architecture.md` ("un módulo pasa a `shared` únicamente cuando es utilizado por al
   menos dos features distintas") — este spec generaliza y promueve a `shared/components/` los
   componentes de vehículos que aplican 1:1 a activos, y **modifica `features/vehicles/` para
   consumir las versiones compartidas** (sin duplicar la lógica). El detalle está en la sección
   "Generalización a `shared/`".

## Objetivo

Construir la pantalla de Activos (`client/src/features/assets/pages/AssetsPage.tsx`, hoy un
placeholder `<h1>Activos</h1>`) con la misma estructura que Vehículos:

1. `HeaderPage` (ya en `shared/`) con título, subtítulo y acción "Agregar Activo" (placeholder, sin
   modal de alta — mismo criterio que `handleAddVehicle`).
2. Tarjetas de estado (Total + 4 estados: `OK`, `DAMAGED`, `FULL`, `OUT_OF_SERVICE`).
3. Barra de filtros: Tipo, Estado, Zona (multi-select) + "Restablecer".
4. Tabla (TanStack Table) con columnas Tipo, Estado, Zona, Dirección, Latitud, Longitud y una
   columna de Acciones (Detalles, Editar, Eliminar).
5. Modal de detalle/edición: solo lectura por defecto; en modo edición permite cambiar únicamente
   `status` (`Select`), con Guardar/Cancelar y mensajes de éxito/error.

## Diagnóstico

- El backend mock ya expone `GET /assets` (`api/src/controllers/assets.controller.ts`,
  filtrable por `status`/`type` vía query params, no por `zoneId`) y `POST /assets` (sin uso en
  este spec: no hay alta desde el frontend, igual que vehículos). No hay `PUT`/`PATCH`/`DELETE`
  (`docs/METHODS.md` "Limitaciones conocidas") — igual que vehículos, "Eliminar" y "Guardar" actúan
  solo sobre el estado global del frontend (`docs/verified-scope.md` §7.4, generalizado en
  `architecture.md` como patrón para todo ABMC sin backend).
- Modelo (`api/src/schemas/asset.schema.ts`, `docs/verified-scope.md` §2.3):

  ```ts
  type AssetType = 'BIN' | 'CONTAINER' | 'BENCH'
  type AssetStatus = 'OK' | 'DAMAGED' | 'FULL' | 'OUT_OF_SERVICE'

  interface Asset {
    id: string
    type: AssetType
    status: AssetStatus
    lat: number
    lng: number
    address: string
    zoneId: string
  }
  ```

  No existe todavía en `shared/types/domain.types.ts` — se agrega ahí (fuente única de verdad de
  tipado, [chore 04](../chore/04-move-typed.md)), igual que `Vehicle`/`Zone`.
- **Sin mockup visual propio** (a diferencia de vehículos, que tenía `docs/designs/02-05`): no se
  proveyó un diseño de referencia para Activos. Este spec reutiliza 1:1 los patrones visuales ya
  validados de vehículos (misma librería de componentes Radix, mismos tokens de color/tipografía),
  sin inventar un layout nuevo.
- **1500 registros sin paginación:** igual que en vehículos ([feature 04](./04-vehicles-filtertable.md)
  "Fuera de alcance"), la paginación de 15 filas (`docs/verified-scope.md` §6.1) queda fuera de este
  spec por paridad de alcance con vehículos. Se deja anotado como el primer fast-follow recomendado,
  porque el volumen de activos (1500) hace la ausencia de paginación más notoria que en vehículos.
- **Zona por `zoneId` crudo, no por geometría derivada:** `docs/verified-scope.md` §10.5 exige que
  la zona "real" de un activo se derive de sus coordenadas contra polígonos/bounding boxes de zona,
  no del `zoneId` que manda el backend (que se asigna aleatoriamente). Esa geometría de zonas no
  existe todavía en el frontend (el mapa, que sería su primer consumidor, tampoco está construido).
  **Simplificación de este spec (gap, ver más abajo):** se traduce `zoneId -> name` vía `GET /zones`
  (mismo patrón que vehículos), igual que hoy no existe ninguna derivación geográfica en el proyecto.
  Cuando se implemente el mapa y su geometría de zonas, este mismo spec de Activos deberá migrar a
  la zona derivada — no es una regresión introducida aquí, es el mismo estado del arte del resto del
  proyecto.
- **Coordenadas redondeadas a 4 decimales** (`docs/scope.md` disclaimer, `docs/verified-scope.md`
  §4 y criterio de aceptación #3): se aplica solo al **formato de visualización** en tabla y modal
  (`lat.toFixed(4)` / `lng.toFixed(4)`), sin tocar el valor crudo del store.

## Generalización a `shared/` (pedido explícito del usuario)

Se promueven 4 módulos desde `features/vehicles/` a `shared/components/`, generalizándolos para que
no conozcan nada específico de vehículos ni de activos. `features/vehicles/` se modifica para
consumir las versiones compartidas (sin cambiar su comportamiento ni sus tests observables).

| Módulo compartido | Generaliza | Antes (solo vehicles) | Ahora (vehicles + assets) |
|---|---|---|---|
| `shared/components/StatusSummaryCards.tsx` + `StatusSummaryCard.tsx` + `statusSummaryCard.styles.ts` | `VehicleStatusCards`/`VehicleStatusCard`/`vehicleStatusCard.styles.ts` | Tipo `VehicleStatusCardData` con `key: VehicleStatusKey` cerrado | Tipo genérico `StatusSummaryCardData<TKey extends string>`: `{ key: TKey; label: string; value: number; icon: LucideIcon; secondaryIcon?: LucideIcon; secondaryText: string; colorRole: 'primary' \| 'success' \| 'tertiary' \| 'error' \| 'neutral' }`. El color ya no se resuelve por un mapeo interno `Record<VehicleStatusKey, ...>`: cada card trae su `colorRole` ya resuelto por quien construye los datos (`useVehicleStatusCards`/`useAssetStatusCards`), y el componente compartido solo traduce `colorRole -> tokens` (una única tabla `Record<ColorRole, CardColorMapping>` en `statusSummaryCard.styles.ts`, con `neutral` nuevo para el caso "negro" de `OUT_OF_SERVICE` de activos, ver Gap 1) |
| `shared/components/RowActionsMenu.tsx` | `VehicleRowActionsMenu` | Ítems hardcodeados (Detalles/Editar/Eliminar) atados a `useVehicleModalStore` | Componente genérico que recibe `items: RowActionItem[]` (`{ label: string; onSelect: () => void; color?: 'red' }`) y solo renderiza el `DropdownMenu`. Cada feature arma su propio wrapper fino (`VehicleRowActionsMenu`, `AssetRowActionsMenu`) que arma el array de `items` con sus propias acciones/stores — el shared no importa `useVehicleModalStore` ni `useAssetModalStore` |
| `shared/components/ConfirmAlertDialog.tsx` | `DeleteVehicleAlertDialog` | Copy y acción de borrado de vehículo hardcodeados | Componente genérico `{ open, onOpenChange, title, description, acceptLabel, cancelLabel, onAccept }` (mismo mapeo de colores Aceptar=red/No=gray). `DeleteVehicleAlertDialog`/`DeleteAssetAlertDialog` quedan como wrappers finos que arman el texto (interpolando placa o tipo+id) y pasan `onAccept={() => removeVehicle(...)}` / `onAccept={() => removeAsset(...)}` |
| `shared/components/StatusBadge.tsx` + `statusBadge.styles.ts` | `vehicleStatusBadge.styles.ts` (`statusBadgeStyleFor`/`statusDotStyleFor`) | Mapeo `Record<VehicleStatus, StatusBadgeStyle>` | Las funciones de estilo pasan a recibir un `colorRole` ya resuelto (mismo enum de la tabla de arriba) en vez de un `VehicleStatus` — cada feature mapea su propio enum de estado a `colorRole` (`vehicleStatusColorRole(status)`, `assetStatusColorRole(status)`), y el componente/estilo compartido solo sabe de `colorRole` |

Nada de esto cambia el comportamiento visual ni los tests ya verificados de vehículos: es una
extracción de la misma lógica detrás de una interfaz más genérica (parámetro `colorRole` /
`items` en vez de un enum cerrado de vehículo). Los tests existentes de
`VehicleStatusCards`/`VehicleRowActionsMenu`/`DeleteVehicleAlertDialog` se ajustan para pasar por
los wrappers finos, no se borran.

**Qué NO se generaliza (queda específico de cada feature):**

- El modal de detalle/edición completo (`VehicleModal`/`AssetModal`): el layout compartido es
  mínimo (`Dialog.Root`/`Dialog.Content`/título+badge+botón cerrar), pero el contenido del
  formulario difiere lo suficiente (placa con regex vs. status con `Select`) como para no forzar
  una abstracción prematura. Se documenta como candidato a generalizar en un futuro spec si
  aparece una tercera entidad con modal editable (`incidents` es de solo lectura, así que no
  dispara la regla de "shared" por ahora).
- Los hooks de datos (`useVehicleStatusCards`/`useAssetStatusCards`, `useFilteredVehicles`/
  `useFilteredAssets`): cada uno conoce el modelo de su propia entidad; no hay abstracción común
  razonable sin genéricos innecesarios para dos casos.

## Decisiones propuestas — Activos

### 1. Tipos de dominio

Se agrega a `client/src/shared/types/domain.types.ts` (junto a `Vehicle`/`Zone` ya existentes):

```ts
export type AssetType = 'BIN' | 'CONTAINER' | 'BENCH'
export type AssetStatus = 'OK' | 'DAMAGED' | 'FULL' | 'OUT_OF_SERVICE'

export interface Asset {
  id: string
  type: AssetType
  status: AssetStatus
  lat: number
  lng: number
  address: string
  zoneId: string
}
```

### 2. Data-fetching + store (mismo patrón que vehículos)

- `features/assets/api/useAssetsQuery.ts` — `useQuery` -> `GET /assets`, mismas opciones anti-refetch
  (`staleTime: Infinity`, `refetchOnMount/WindowFocus/Reconnect: false`) e hidratación única
  (`hasHydrated`), por la misma razón documentada en `architecture.md` "Hidratación única": los
  activos se van a poder eliminar/editar localmente y un remount de `AssetsPage` no debe pisar esas
  mutaciones con el snapshot cacheado.
- `features/assets/api/useZonesQuery.ts` **no se duplica**: se **mueve** `useZonesQuery` de
  `features/vehicles/api/` a `shared/services/useZonesQuery.ts` (zonas son un dato transversal, ya
  usado por 2 features) y ambas features importan la misma instancia/`queryKey` (`['zones']`),
  evitando 2 fetches redundantes del mismo recurso si el usuario visita ambas pantallas.
- `features/assets/store/useAssetsStore.ts` — Zustand: `{ assets: Asset[]; hasHydrated: boolean;
  setAssets(assets): void; removeAsset(id): void; updateAsset(id, changes: Partial<Asset>): void }`,
  mismo criterio que `useVehiclesStore`.
- `features/assets/store/useAssetModalStore.ts` — `{ assetId: string | null; mode: 'details' |
  'edit' | null; open(assetId, mode): void; close(): void }`, mismo shape que
  `useVehicleModalStore`.
- `features/assets/store/useAssetFiltersStore.ts` — `{ type: AssetTypeFilter; status:
  AssetStatusFilter; zoneIds: string[]; setType; setStatus; setZoneIds; reset }`. Sin campo de
  búsqueda por texto (a diferencia de vehículos): `docs/verified-scope.md` §6.2 no pide búsqueda
  para el tab de Activos (solo Tipo/Estado/Zona).

### 3. Tarjetas de estado (5: Total + 4 estados)

Usando `StatusSummaryCards` compartido (ver "Generalización a `shared/`"):

| Card | `colorRole` | Ícono (`lucide-react`) | Copy secundario |
|---|---|---|---|
| Total de Activos | `primary` | `Package` | `"<pct> del total registrado"` (100%, mismo criterio que Total de vehículos) |
| OK | `success` | `CheckCircle2` | `"<pct> del total de activos"` |
| Dañados (`DAMAGED`) | `tertiary` | `Wrench` | `"<pct> requieren reparación"` |
| Completos (`FULL`) | `error` | `AlertTriangle` | `"<pct> requieren recolección"` |
| Fuera de servicio | `neutral` (ver Gap 1) | `Ban` | `"<pct> dados de baja"` |

`useAssetStatusCards.ts` (en `features/assets/hooks/`) replica `buildVehicleStatusCards`/
`formatPercentage` para 4 estados en vez de 3, reutilizando la función `formatPercentage` (se
promueve también a `shared/utils/formatPercentage.ts`, ya que ahora la usan 2 features con la misma
fórmula exacta).

Grid responsivo: `columns={{ initial: '1', sm: '2', lg: '5' }}` (5 tarjetas en desktop, a diferencia
de las 4 de vehículos).

### 4. Tabla (TanStack Table)

Columnas (`ColumnDef<Asset>[]`, encabezados en español):

| Columna | Campo | Notas |
|---|---|---|
| Tipo | `type` | `assetTypeLabel`: `BIN`→"Cesto", `CONTAINER`→"Contenedor", `BENCH`→"Banco" (`docs/verified-scope.md` §2.3) |
| Estado | `status` | Badge con punto de color (`StatusBadge` compartido), `assetStatusLabel`: `OK`→"OK", `DAMAGED`→"Dañado", `FULL`→"Completo", `OUT_OF_SERVICE`→"Fuera de servicio" |
| Zona | `zoneId` → nombre | vía `useZonesQuery` compartido, mismo `zoneNameFor` (se promueve a `shared/utils/zoneNameFor.ts`, reutilizado por ambas features) |
| Dirección | `address` | texto tal cual (agregado respecto al mockup de vehículos porque `Asset` sí tiene esta columna en su modelo; no está prohibido por el scope, que solo exige mostrar coordenadas) |
| Latitud | `lat` | `lat.toFixed(4)` |
| Longitud | `lng` | `lng.toFixed(4)` |
| Acciones | — | `RowActionsMenu` compartido: Detalles / Editar / Eliminar |

Fuente de datos: `useFilteredAssets()` (análogo a `useFilteredVehicles`), no `useAssetsStore`
directo.

### 5. Menú de acciones y borrado

`AssetRowActionsMenu.tsx` (wrapper fino sobre `RowActionsMenu` compartido): arma
`items = [{label: 'Detalles', onSelect: () => open(asset.id, 'details')}, {label: 'Editar',
onSelect: () => open(asset.id, 'edit')}, {label: 'Eliminar', color: 'red', onSelect: () =>
setDeleteDialogOpen(true)}]`.

`DeleteAssetAlertDialog.tsx` (wrapper fino sobre `ConfirmAlertDialog` compartido):
`title="¿Eliminar activo?"`, `description="Se eliminará el activo <TYPE_LABEL> (<address>). Esta
acción no se puede deshacer."`, `onAccept={() => removeAsset(asset.id)}` — mismo patrón que
vehículos, sin llamada a backend.

### 6. Filtros

`AssetsFilterBar.tsx`, mismo patrón visual que `VehiclesFilterBar` (sin el campo de búsqueda, ver
punto 2):

| Campo | Control | Filtra sobre |
|---|---|---|
| Tipo | `Select` (Todos + `AssetType`) | `Asset.type` |
| Estado | `Select` (Todos + `AssetStatus`) | `Asset.status` |
| Zona | `Popover` + `CheckboxGroup` multi-select (mismo componente/patrón que vehículos, reutilizando `useZonesQuery` compartido) | `Asset.zoneId` |
| Restablecer | `Button` | limpia los 3 filtros |

`utils/assetFilters.ts`: `AssetFilters`, `DEFAULT_ASSET_FILTERS`, `filterAssets(assets, filters)`
— mismo criterio AND que `filterVehicles`, sin predicado de capacidad (no aplica a activos).
`constants/assetFilterOptions.ts`: `ASSET_TYPE_FILTER_OPTIONS`/`ASSET_STATUS_FILTER_OPTIONS`,
derivadas de los enums reales + `assetTypeLabel`/`assetStatusLabel`, mismo criterio que
`vehicleFilterOptions.ts`.

### 7. Modal de detalle/edición

`AssetModal.tsx`, montado una vez en `AssetsPage.tsx`, mismo shape que `VehicleModal`:

- **Modo `details` (default):** `<TYPE> — círculo de estado (color por `colorRole`)`, Zona,
  Dirección, Latitud, Longitud — todo de solo lectura. Footer: "Cerrar" / "Modificar".
- **Modo `edit`:** aparece un `Select` de Estado (`OK`/`DAMAGED`/`FULL`/`OUT_OF_SERVICE`,
  `assetStatusLabel` como texto de cada opción) precargado con el valor actual. Footer: "Cancelar" /
  "Guardar". El resto de los campos (`type`, zona, coordenadas, dirección) permanece de solo lectura
  incluso en modo edición — es el único campo editable, análogo a la Placa en vehículos.
- **Validación:** `features/assets/schemas/assetModalSchema.ts`, con
  `z.enum(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE'])` — no hace falta regex, al ser un `Select`
  cerrado la única forma de "error" sería un estado vacío/no seleccionado, que Zod igual valida.
- **Guardado:** `updateAsset(assetId, { status: values.status })`, mismo flujo de `isSaving` y
  mensajes ("Activo actualizado correctamente." / "No fue posible actualizar el activo."),
  análogo a `docs/verified-scope.md` §7.4 pero generalizado explícitamente a Activos por la
  Decisión 1 del usuario de este spec.
- **Cierre por click afuera / Escape:** mismo criterio que `VehicleModal` (descarta el borrador de
  `status` sin llamar a `updateAsset`).

### 8. Header

`AssetsPage.tsx` monta `HeaderPage` (ya en `shared/`) con:

```ts
const assetsHeaderProps: HeaderPageProps = {
  title: 'Activos',
  subtitle: 'Estado de los activos urbanos en tiempo real',
  action: { label: 'Agregar Activo', icon: Plus, onClick: handleAddAsset }
}
```

`handleAddAsset` queda como placeholder (`console.info`), mismo criterio que `handleAddVehicle` —
el alta de activos es un spec futuro.

## Estructura de archivos propuesta

```text
client/src/shared/
  components/
    StatusSummaryCards.tsx       # nuevo (promovido de vehicles): Grid + .map()
    StatusSummaryCard.tsx        # nuevo (promovido): Card individual, colorRole genérico
    statusSummaryCard.styles.ts  # nuevo (promovido): mapeo colorRole -> tokens (agrega 'neutral')
    RowActionsMenu.tsx           # nuevo (promovido de vehicles): DropdownMenu genérico (items[])
    ConfirmAlertDialog.tsx       # nuevo (promovido de vehicles): AlertDialog genérico
    StatusBadge.tsx              # nuevo (promovido de vehicles): badge + dot, colorRole genérico
    statusBadge.styles.ts        # nuevo (promovido)
  services/
    useZonesQuery.ts             # movido de features/vehicles/api/ (ahora usado por 2 features)
  utils/
    formatPercentage.ts          # movido de features/vehicles/hooks/useVehicleStatusCards.ts
    zoneNameFor.ts                # movido de features/vehicles/utils/vehicleFormat.ts
  types/
    domain.types.ts              # se amplía: + AssetType, AssetStatus, Asset

client/src/features/vehicles/     # se modifica (sin cambiar comportamiento): consume los 6 módulos de shared/
  api/
    useVehiclesQuery.ts           # sin cambios
    # useZonesQuery.ts eliminado, se importa desde shared/services/
  components/
    VehicleStatusCards.tsx        # se simplifica: usa StatusSummaryCards de shared
    VehicleStatusCard.tsx         # eliminado (reemplazado por StatusSummaryCard de shared)
    vehicleStatusCard.styles.ts   # eliminado (reemplazado por statusSummaryCard.styles.ts de shared)
    VehicleRowActionsMenu.tsx     # se simplifica: usa RowActionsMenu de shared
    DeleteVehicleAlertDialog.tsx  # se simplifica: usa ConfirmAlertDialog de shared
    vehicleStatusBadge.styles.ts  # eliminado (reemplazado por StatusBadge/statusBadge.styles.ts de shared)
  hooks/
    useVehicleStatusCards.ts      # se ajusta: colorRole en vez de mapeo interno, usa formatPercentage de shared
  utils/
    vehicleFormat.ts               # se ajusta: zoneNameFor importado de shared, agrega vehicleStatusColorRole

client/src/features/assets/
  api/
    useAssetsQuery.ts             # nuevo
  store/
    useAssetsStore.ts             # nuevo: { assets, hasHydrated, setAssets, removeAsset, updateAsset }
    useAssetModalStore.ts         # nuevo
    useAssetFiltersStore.ts       # nuevo
  constants/
    assetFilterOptions.ts         # nuevo
  utils/
    assetFormat.ts                 # nuevo: assetTypeLabel, assetStatusLabel, assetStatusColorRole
    assetFilters.ts                # nuevo: AssetFilters, DEFAULT_ASSET_FILTERS, filterAssets
  hooks/
    useAssetStatusCards.ts        # nuevo
    useFilteredAssets.ts          # nuevo
  schemas/
    assetModalSchema.ts           # nuevo: z.enum de AssetStatus
  components/
    AssetsFilterBar.tsx           # nuevo
    AssetsTable.tsx               # nuevo
    AssetRowActionsMenu.tsx       # nuevo (wrapper fino sobre RowActionsMenu)
    DeleteAssetAlertDialog.tsx    # nuevo (wrapper fino sobre ConfirmAlertDialog)
    AssetModal.tsx                # nuevo
  pages/
    AssetsPage.tsx                # se modifica: monta HeaderPage + StatusSummaryCards + AssetsFilterBar + AssetsTable + AssetModal
```

## Gaps a resolver antes de implementar (pendiente de decisión del usuario)

1. **`colorRole: 'neutral'` para `OUT_OF_SERVICE` de activos ("negro" en `docs/verified-scope.md`
   §3.1/§10.2):** `designTokens.colors` no tiene un rol semántico "negro/neutral oscuro" (los roles
   existentes son `primary`/`success`/`tertiary`/`error`). Se propone aproximar con
   `inverseSurface`/`inverseOnSurface` (`#233143`/`#e9f1ff`, el tono más oscuro ya definido) como
   fondo/texto del ícono y del badge de estado — misma naturaleza de aproximación ya aceptada en
   [feature 02](./02-vehicle-statuscard.md) "Gaps a resolver" #1 para otros colores. Alternativa (b):
   agregar un token nuevo `neutralDark`/`onNeutralDark` a `tokens.ts`, lo cual sería un cambio de
   alcance de [chore 02](../chore/02-visual-alignment.md). Se propone (a) por defecto.
2. **Ícono para "Fuera de servicio" de activos:** se propone `Ban` (`lucide-react`), distinto de
   `AlertCircle` ya usado por "Fuera de servicio" de vehículos, para diferenciar visualmente ambas
   tarjetas cuando el usuario navega entre pantallas. A confirmar o reemplazar en implementación.
3. **Orden de migración de `useZonesQuery` a `shared/`:** mover el archivo implica actualizar los
   imports ya existentes en `features/vehicles/components/VehiclesTable.tsx`,
   `VehiclesFilterBar.tsx` y `VehicleModal.tsx`. Se confirma que esto es aceptable como parte de
   este spec (no es un spec de "solo Activos" en sentido estricto, pero es la consecuencia directa
   del pedido explícito de reutilización) — si el usuario prefiere no tocar código ya mergeado de
   vehículos, la alternativa es duplicar `useZonesQuery` en `features/assets/api/` sin promoverlo,
   a costa de 2 queries idénticas activas cuando ambas pantallas se visitan en la misma sesión.
4. **Texto exacto de mensajes de éxito/error del modal de Activos:** se propone "Activo actualizado
   correctamente." / "No fue posible actualizar el activo.", calcado del texto de vehículos
   (`docs/verified-scope.md` §7.4) con el sustantivo cambiado. A confirmar si el usuario prefiere
   otro texto.

## Fuera de alcance

- Paginación (15 registros/página) y ordenamiento por columna (`docs/verified-scope.md` §6.1) —
  mismo criterio que vehículos, queda para un spec propio; se señala como fast-follow recomendado
  dado el volumen de 1500 activos.
- Derivación geográfica de zona por polígono/bounding box (`docs/verified-scope.md` §10.5) — se usa
  el `zoneId` crudo traducido a nombre, mismo estado del arte que el resto del proyecto hoy (sin
  mapa todavía). Ver "Diagnóstico".
- Alta de activos (`POST /assets` desde el frontend, formulario de "Agregar Activo") — botón
  placeholder sin efecto, mismo criterio que "Agregar Vehículo".
- Edición de `type`, `zoneId`, `lat`, `lng` o `address` — por decisión explícita del usuario, el
  único campo editable es `status`.
- Mapa de calor, marcadores de mapa, tooltips (`docs/verified-scope.md` §3) — pertenecen a la
  feature `map`, no a la tabla/tarjetas/modal de `assets`.
- Tabs (Activos/Vehículos/Incidentes) — cada pantalla sigue siendo una ruta dedicada, sin tabs
  (mismo criterio que vehículos, `docs/verified-scope.md` §6.1 queda para un spec de navegación
  propio si se decide implementar tabs en vez de rutas separadas).
- Generalizar `VehicleModal`/`AssetModal` a un componente compartido único — ver "Qué NO se
  generaliza" arriba.

## Verificación post-implementación (cuando se apruebe y desarrolle)

1. `pnpm --filter client typecheck` compila sin errores (tipado estricto, sin `any`).
2. `pnpm --filter client lint` / `format:check` pasan sobre archivos nuevos y modificados.
3. `pnpm --filter client test`:
   - Tests nuevos de `assetFormat.ts`/`assetFilters.ts` (labels, `colorRole`, `filterAssets` con los
     3 criterios).
   - Tests nuevos de `useAssetStatusCards` (5 tarjetas, conteos y porcentajes, `total === 0`).
   - Tests nuevos de `AssetsTable` (una fila por activo filtrado, columnas correctas, coordenadas a
     4 decimales), `AssetRowActionsMenu`, `DeleteAssetAlertDialog`, `AssetsFilterBar`,
     `AssetModal` (solo lectura, modo edición, guardar status válido, cancelar, cierre por overlay).
   - Tests existentes de vehículos ajustados a los wrappers compartidos (`VehicleStatusCards`,
     `VehicleRowActionsMenu`, `DeleteVehicleAlertDialog`) siguen en verde sin cambiar sus
     aserciones observables.
   - Tests nuevos de los 4 componentes/utilidades promovidos a `shared/` (`StatusSummaryCards`,
     `RowActionsMenu`, `ConfirmAlertDialog`, `StatusBadge`, `formatPercentage`, `zoneNameFor`).
   - Cobertura ≥ 80%.
4. Revisión manual de que no hay `style={{ ... }}` literal fuera de un archivo `*.styles.ts`.
5. Revisión manual de que `features/vehicles/` no perdió ningún comportamiento visual tras consumir
   los componentes compartidos (mismo criterio de colores/labels que antes de este spec).

## Hallazgos de verificación (post-implementación)

- **El mount conectado a esta sesión no permitió instalar dependencias ni ejecutar `pnpm`
  directamente** (mismo problema ya documentado en specs anteriores de vehículos — EPERM/I-O error
  al leer `node_modules` vía el puente de archivos, y la instalación aislada tampoco pudo
  completarse dentro del límite de tiempo de esta sesión por la latencia de red del entorno).
  **No se pudo correr** `pnpm --filter client typecheck|lint|test|coverage` en esta sesión.
- Como mitigación: se hizo una revisión manual exhaustiva de cada archivo nuevo/modificado (lectura
  completa vía la herramienta de archivos, fuente de verdad), se verificaron por `grep` todas las
  referencias cruzadas a los módulos movidos/eliminados (`useZonesQuery`, `zoneNameFor`,
  `VehicleStatusCard`, `vehicleStatusCard.styles`, `vehicleStatusBadge.styles`) para confirmar que
  no quedó ningún import roto, y se ajustó un caso de tipado inseguro (`GridProps` reemplazado por
  `ComponentProps<typeof Grid>['columns']` en `StatusSummaryCards.tsx`, ya que no se pudo confirmar
  contra los `.d.ts` reales de `@radix-ui/themes` que `GridProps` esté exportado).
- **Acción pendiente del usuario:** correr `pnpm --filter client typecheck && pnpm --filter client
  lint && pnpm --filter client test && pnpm --filter client coverage` en un entorno con acceso de
  red normal antes de mergear, igual que en los hallazgos de verificación de
  [feature 05](./05-vehicles-header.md) y [feature 06](./06-vehicles-modal.md) (que documentan el
  mismo tipo de limitación de este mount).
