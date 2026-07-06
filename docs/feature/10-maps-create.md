# SPEC — Pantalla de Mapa (Map Create, MAP-01)

**Tipo:** feature
**Estado:** Aprobado por el usuario (2026-07-06) e implementado en esta sesión, con la dependencia
bloqueante ya anticipada: la sección "Disponibilidad operativa" (`AvailabilityAlert`) **no se
implementó** — depende de [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md),
spec nuevo todavía no aprobado. El resto de esta feature (marcadores, asociación, tooltips, heatmap
con `leaflet.heat`, tabs con las 3 tablas reutilizadas, promoción de `assets`/`incidents` a
`shared/services/`) se implementó íntegramente. Ver "Hallazgos de verificación" al final de este
documento.
**Fecha:** 2026-07-06
**Relacionado:** [docs/specs/geo-zone-derivation.md](../specs/geo-zone-derivation.md) (MAP-00,
`deriveZone`/`isPointInsideZone`/`roundCoordinates`/`ZONES`, ya implementado),
[docs/specs/architecture.md](../specs/architecture.md) ("Estado global y data-fetching", "Patrón:
query hidrata store", "Hidratación única", "Regla para shared"),
[docs/feature/07-assets-page.md](./07-assets-page.md), [docs/feature/08-incidents-page.md](./08-incidents-page.md),
[docs/feature/09-pagination-and-create-modal.md](./09-pagination-and-create-modal.md) (`TablePagination`,
`TABLE_PAGE_SIZE`), [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md)
(motor de asignación, bloqueante solo para `AvailabilityAlert`),
[docs/verified-scope.md](../verified-scope.md) §3, §4, §5, §6.1, §10.5, §10.6, §10.7, §10.8,
`client/src/features/map/pages/MapPage.tsx` (placeholder actual, `<h1>Mapa</h1>`), `leaflet`,
`react-leaflet`, `@tanstack/react-query`, `zustand`, `zod`, `@tanstack/react-table`,
`@radix-ui/themes` (Tabs), `leaflet.heat` (**dependencia nueva**, se agrega en este cambio)

## Objetivo

Construir la pantalla de Mapa (`client/src/features/map/pages/MapPage.tsx`, hoy un placeholder
`<h1>Mapa</h1>`): mapa Leaflet con marcadores de activos coloreados por estado, asociación de
incidentes a activos, tooltips, mapa de calor (`leaflet.heat`) con filtros y leyenda, y — debajo del
mapa — un componente `Tabs` (Radix) con 3 pestañas (Activos, Vehículos, Incidentes) que muestran
únicamente la tabla paginada de cada entidad. Es la primera feature que consume `deriveZone`/`ZONES`
([MAP-00](../specs/geo-zone-derivation.md)) para excluir puntos fuera de las 5 zonas soportadas.

## Decisiones tomadas por el usuario (2026-07-06)

Resuelven los gaps planteados en la primera versión de este spec:

1. **Disponibilidad operativa → motor completo, spec aparte y bloqueante.** El criterio real de
   "vehículos disponibles" (§5 de `verified-scope.md`: compatibilidad vehículo↔tipo de activo,
   prioridad `ACTIVE` > misma zona > menor capacidad suficiente, contención por prioridad de tipo de
   incidente) se especifica en un documento propio,
   [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md). Ese spec debe
   aprobarse e implementarse **antes** de que `AvailabilityAlert` pueda construirse contra el
   criterio real. En este cambio, `AvailabilityAlert` **no se implementa** (ver "Fuera de alcance").
2. **Tabs reintroducidas debajo del mapa.** Se agrega un componente `Tabs` (`@radix-ui/themes`) con 3
   pestañas — "Activos", "Vehículos", "Incidentes" — debajo del mapa. Cada pestaña muestra
   **únicamente la tabla paginada** de esa entidad (`AssetsTable`/`VehiclesTable`/`IncidentsTable`,
   reutilizadas tal cual), **sin** su barra de filtros ni sus `StatusSummaryCards`. El mapa en sí no
   cambia de contenido al cambiar de pestaña (vive arriba de las tabs, siempre visible). Esto
   reintroduce, acotado a `MapPage`, el layout que el scope original (`docs/scope.md` §6.1)
   describía con MUI Tabs — sin afectar las rutas dedicadas ya existentes (`/vehiculos`, `/activos`,
   `/incidentes`), que siguen existiendo sin cambios.
3. **`useAssetsQuery`/`useIncidentsQuery` se promueven a `shared/services/`.** Deja de haber fetch
   duplicado: `map`, `assets` e `incidents` comparten la misma query y el mismo store (un único
   `GET /assets` / `GET /incidents` por sesión de la app, mismo criterio de "Hidratación única").
   Aplica la regla de `architecture.md` ("Un módulo pasa a shared únicamente cuando es utilizado por
   al menos dos features") — ahora hay 2 features (`map` + `assets`/`incidents`) consumiendo el mismo
   dato, igual que ya ocurrió con `useZonesQuery` (`docs/feature/07-assets-page.md`, "Generalización a
   `shared/`").
4. **Heatmap con `leaflet.heat`.** Se agrega como dependencia nueva de `client/package.json`
   (`leaflet.heat` + tipos si existen en DefinitelyTyped; si no, se declara un `.d.ts` mínimo local
   en `shared/types/` o `features/map/types/`), en vez de una implementación propia sobre Canvas.

## Diagnóstico

- **`MapPage` es un placeholder puro** (`return <h1>Mapa</h1>`), sin ningún componente de mapa,
  store, ni query propios de la feature `map`.
- **`shared/geo/` ya resuelve la derivación de zona** (MAP-00, aprobado e implementado):
  `deriveZone(lat, lng): SupportedZone | null`, `ZONES: Record<SupportedZone, BoundingBox>`,
  `roundCoordinates`, `isPointInsideZone`. Este spec es el **primer consumidor real**.
- **Modelos ya tipados en `shared/types/domain.types.ts`:** `Asset`, `Incident`, `Vehicle`,
  `SupportedZone`, `BoundingBox`. Ninguno tiene un campo de asociación incidente↔activo — esa
  relación es puramente derivada en el frontend (§4 de `verified-scope.md`).
- **`features/assets`/`features/incidents` hoy tienen su propio store y query**
  (`useAssetsStore`+`useAssetsQuery`, `useIncidentsStore`+`useIncidentsQuery`). Por la decisión #3,
  ambos pares se **mueven** a `shared/services/` en este cambio (`useAssetsStore` y `useAssetsQuery`
  pasan de `features/assets/{store,api}/` a `shared/services/assets/`; análogo para `incidents`).
  `features/assets`/`features/incidents` actualizan sus imports (`from '../store/useAssetsStore'` →
  `from '../../../shared/services/assets/useAssetsStore'`), sin cambiar ningún comportamiento ni
  test existente más allá de la ruta de import. `map` importa exactamente los mismos módulos.
- **Paleta de color de activos ya normalizada** (`docs/verified-scope.md` §10.2), pero
  `features/assets/utils/assetFormat.ts` → `assetStatusColorRole` mapea a **roles semánticos de
  Radix** (`'success' | 'error' | 'tertiary' | 'neutral'`), no a colores hex. Los íconos de marcador
  de Leaflet y los puntos de `leaflet.heat` necesitan color literal — se crea una utilidad propia de
  `map` (§3).
- **Ninguna geometría de asociación incidente↔activo existe todavía** (distancia en metros, vecino
  más cercano) — se crea en este spec.
- **No existe ningún componente `Tabs` en el proyecto todavía.** Se agrega en este spec, acotado a
  `MapPage` (decisión #2) — no reemplaza las rutas `/vehiculos`/`/activos`/`/incidentes`, que
  siguen existiendo sin cambios (con sus propios filtros y `StatusSummaryCards`, que las tabs de
  `MapPage` no incluyen).
- **`leaflet.heat` no está en `client/package.json`** — se agrega en este cambio (decisión #4). No
  tiene tipos oficiales en `@types/leaflet.heat` estables para todas las versiones; si el paquete de
  tipos no existe o está desactualizado, se declara una ambient declaration mínima
  (`declare module 'leaflet.heat'`) en vez de usar `any`, preservando el tipado estricto exigido por
  el proyecto.
- **El motor de asignación vehículo↔activo (§5 de `verified-scope.md`) no está implementado** —
  movido a su propio spec bloqueante (decisión #1).

## Reglas de negocio (fuente: pedido del usuario + verified-scope.md)

### Zonas soportadas

Microcentro, Palermo, Recoleta, Belgrano, Caballito — ya modeladas en `shared/geo/zones.ts`
(`SupportedZone`, `ZONES`). Todo punto (activo o incidente) cuyas coordenadas no caigan dentro de
ninguna de las 5 se descarta por completo: no se renderiza en el mapa, no entra a ninguna tabla de
esta pantalla, no participa del heatmap. La zona de un punto se determina **exclusivamente** por
`deriveZone(lat, lng)` — el `zoneId` que trae el backend en `Asset`/`Incident` **nunca** se lee para
esto (§10.5, ya resuelto y validado por MAP-00).

### Activos — color de marcador

| Estado | Color |
|---|---|
| `OK` | Verde |
| `FULL` | Rojo |
| `DAMAGED` | Naranja |
| `OUT_OF_SERVICE` | Negro |

### Incidentes — asociación a activo

- Solo aplica a incidentes `type === 'OVERFLOW'` sobre activos `type === 'BIN'` o `'CONTAINER'`
  (`'BENCH'` nunca se asocia, aunque el incidente sea `OVERFLOW`).
- Se busca el activo compatible más cercano dentro de un radio máximo de **100 metros**.
- Si existe: `incident.lat = asset.lat`, `incident.lng = asset.lng`.
- Si no existe: el incidente mantiene sus coordenadas originales y se muestra como incidente
  independiente (marcador propio).
- Se calcula **una vez**, sobre los datos ya filtrados por zona, y se persiste en `MapStore`.

### Tooltip (hover sobre marcador de activo)

- Con incidente asociado: `Tipo de incidente: <TYPE>` / `Estado del incidente: <STATUS>`.
- Sin incidente asociado: la etiqueta del propio `AssetStatus` del activo (`OK`, "Completo",
  "Dañado" o "Fuera de servicio") en el color correspondiente al marcador (`verified-scope.md`
  §10.6, actualizado 2026-07-06 — antes mostraba siempre el literal fijo "Estado OK" en verde).

### Heatmap (`leaflet.heat`)

- Habilitado por defecto al ingresar a la pantalla.
- Filtra por estado (`REPORTED`/`IN_PROGRESS`/`RESOLVED`) y por tipo
  (`OVERFLOW`/`DAMAGE`/`LITTERING`/`OTHER`), uno/varios/todos en cada filtro (AND entre ambos).
- Leyenda a la derecha del mapa, visible mientras el heatmap está activo: `REPORTED` azul,
  `IN_PROGRESS` amarillo, `RESOLVED` violeta (actualizado 2026-07-06, antes verde).
- **Los activos también irradian** (ampliación 2026-07-06, ver "Addendum 3" y
  [docs/feature/14-assets-in-heatmap.md](./14-assets-in-heatmap.md)): además de los incidentes, el
  heatmap proyecta una capa por estado de activo, coloreada con `ASSET_MARKER_COLORS` (`OK` verde,
  `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE` negro), filtrable por estado y tipo de activo con
  la misma mecánica que los incidentes, y con su propia subsección en la leyenda.

### Tabs (debajo del mapa)

- 3 pestañas: "Activos", "Vehículos", "Incidentes".
- Cada pestaña muestra solo la tabla paginada (15 filas) de esa entidad — sin filtros, sin cards de
  estado.

### Disponibilidad operativa — diferido

Ver [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md). No se
implementa en este cambio.

## Decisiones propuestas

### 1. Tipos de dominio — sin cambios

`Asset`, `Incident`, `Vehicle`, `SupportedZone`, `BoundingBox` ya existen en
`shared/types/domain.types.ts`. Los tipos propios de la feature (`GeoTaggedAsset`,
`AssociatedIncident`, filtros de heatmap) viven en `features/map/`.

### 2. Origen de los datos — promoción a `shared/services/`

```text
shared/services/
  assets/
    useAssetsQuery.ts     # movido desde features/assets/api/useAssetsQuery.ts (mismo contenido)
    useAssetsStore.ts      # movido desde features/assets/store/useAssetsStore.ts (mismo contenido)
  incidents/
    useIncidentsQuery.ts   # movido desde features/incidents/api/useIncidentsQuery.ts
    useIncidentsStore.ts   # movido desde features/incidents/store/useIncidentsStore.ts
  zones/
    useZonesQuery.ts       # ya vivía en shared/services/, sin cambios
```

`features/assets` y `features/incidents` actualizan únicamente las rutas de import de estos 4
archivos (sin cambiar comportamiento, props, ni tests — se re-ejecutan tal cual desde su nueva
ubicación, movidos junto con sus `.test.ts(x)` para mantener la co-localización de
`architecture.md`). `features/map` importa los mismos 4 módulos, sin duplicar ningún fetch.
`useAssetModalStore`/`useAssetFiltersStore`/`useIncidentModalStore`/`useIncidentFiltersStore`
**no** se mueven (son estado de UI propio de cada pantalla, no datos compartidos con `map`).

### 3. Filtro geográfico — primer consumo real de `deriveZone`

Al hidratar `MapStore` desde `useAssetsStore`/`useIncidentsStore` (ya promovidos, decisión #2), cada
`Asset`/`Incident` pasa por:

```ts
const zone = deriveZone(item.lat, item.lng)
if (zone === null) continue // se descarta, no entra a MapStore
```

```ts
export interface GeoTaggedAsset extends Asset {
  derivedZone: SupportedZone
}

export interface GeoTaggedIncident extends Incident {
  derivedZone: SupportedZone
}
```

`MapStore` deriva su propio estado a partir de `shared/services/assets`/`shared/services/incidents`
(vía un `useEffect` de sincronización, no una segunda hidratación por query): cuando
`useAssetsStore.assets`/`useIncidentsStore.incidents` cambian (incluida cualquier mutación local,
alta/edición/borrado hecha desde `/activos`/`/incidentes`), `MapStore` recalcula su vista geo-tagged
y la asociación — así el mapa se mantiene sincronizado en tiempo real con esas pantallas, sin
necesidad de refetch (mismo objetivo que "Filtros, tablas, mapa, mapa de calor y modales se
mantienen sincronizados sobre una única fuente de datos", `verified-scope.md` criterio #24).

### 4. Utilidades geográficas nuevas — `features/map/utils/`

```ts
// distanceMeters.ts — fórmula de Haversine
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number

// associateIncident.ts
export interface AssociatedIncident extends GeoTaggedIncident {
  associatedAssetId: string | null
}

export function associateIncidents(
  incidents: GeoTaggedIncident[],
  assets: GeoTaggedAsset[]
): AssociatedIncident[]

// buildHeatmapData.ts
export function buildHeatmapData(
  incidents: AssociatedIncident[],
  filters: HeatmapFilters
): HeatmapPoint[] // { lat, lng, status } — status determina el color en la capa leaflet.heat

// assetMarkerColor.ts
export function assetMarkerColor(status: AssetStatus): string // hex literal
```

`roundCoordinates`, `isPointInsideZone`, `deriveZone` se importan desde `shared/geo/` (MAP-00), no
se reimplementan.

### 5. `MapStore` (Zustand) — fuente única de verdad de la feature

```ts
export interface MapState {
  assets: GeoTaggedAsset[]
  incidents: AssociatedIncident[]
  heatmapEnabled: boolean
  heatmapFilters: HeatmapFilters // { statuses: IncidentStatus[]; types: IncidentType[] }
  selectedZone: SupportedZone | null // reservado, sin UI en este spec

  syncFromShared: (assets: Asset[], incidents: Incident[]) => void // deriveZone + descarta + asocia
  toggleHeatmap: () => void
  setHeatmapFilters: (filters: HeatmapFilters) => void
  setSelectedZone: (zone: SupportedZone | null) => void
}
```

`syncFromShared` se invoca desde un hook (`useSyncMapStore`, en `features/map/hooks/`) suscripto a
`shared/services/assets/useAssetsStore` y `shared/services/incidents/useIncidentsStore` — se
recalcula cada vez que cualquiera de esos dos arrays cambia de referencia (Zustand `subscribe` o,
más simple, un `useEffect` con ambos arrays como dependencias en `MapPage`). No usa el flag
`hasHydrated` de esos stores como bloqueo — se recalcula en cada cambio real de referencia, barato
para 1500+40 elementos.

`heatmapFilters` por defecto: todos los estados y todos los tipos seleccionados (CA-05).

### 6. Componentes — jerarquía y responsabilidad

```text
MapPage
  MapContainer (react-leaflet)
    ZoneLayer               # opcional: dibuja los 5 bounding boxes de ZONES como Rectangle
    AssetMarkersLayer        # un Marker por GeoTaggedAsset, color por status
      AssetTooltip
    IncidentMarkersLayer     # un Marker por AssociatedIncident con associatedAssetId === null
    HeatmapLayer             # wrapper de react-leaflet sobre leaflet.heat, solo si heatmapEnabled
  HeatmapFilters              # checkboxes de estado/tipo, solo si heatmapEnabled
  HeatmapLegend               # solo si heatmapEnabled, lado derecho
  MapEntityTabs                # Tabs (Radix): Activos / Vehículos / Incidentes
    AssetsTable (reutilizado, sin AssetsFilterBar ni StatusSummaryCards)
    VehiclesTable (reutilizado, sin VehiclesFilterBar ni StatusSummaryCards)
    IncidentsTable (reutilizado, sin IncidentsFilterBar ni StatusSummaryCards)
```

- **`AssetMarkersLayer`**: color vía `assetMarkerColor(status)` (hex literal, no
  `StatusCardColorRole`). Busca el `AssociatedIncident` con `associatedAssetId === asset.id` (si hay
  más de uno, se usa el primero encontrado — dataset fijo de 40 incidentes hace esto poco probable).
- **`IncidentMarkersLayer`**: solo incidentes con `associatedAssetId === null`.
- **`HeatmapLayer`**: usa `leaflet.heat` (`L.heatLayer(points, options)`) montado/desmontado vía
  `useMap()` de `react-leaflet` en un `useEffect`, recibiendo `buildHeatmapData()` como `points`
  (con intensidad uniforme; el color por estado se resuelve coloreando 3 capas `heatLayer`
  superpuestas —una por estado— con su gradiente correspondiente, ya que `leaflet.heat` no soporta
  color por punto individual dentro de una misma capa).
- **`HeatmapFilters`**: checkboxes de Estado/Tipo con atajo "Todos", mismo patrón visual que el
  filtro de zona multi-select ya usado en `AssetsFilterBar`/`IncidentsFilterBar`/`VehiclesFilterBar`.
- **`MapEntityTabs`**: `Tabs.Root` + `Tabs.List` (3 `Tabs.Trigger`) + `Tabs.Content` por pestaña.
  Cada `Tabs.Content` monta la tabla ya existente de esa feature
  (`features/assets/components/AssetsTable`, `features/vehicles/components/VehiclesTable`,
  `features/incidents/components/IncidentsTable`) pasándole como fuente de datos el array completo
  de la entidad (`useAssetsStore().assets`, etc. — ya promovido a `shared/services/`, sin filtro
  aplicado, ya que esta vista no incluye barra de filtros) y activando su paginación existente
  (`TablePagination`/`TABLE_PAGE_SIZE`, `docs/feature/09-pagination-and-create-modal.md`) — no se
  reimplementa paginación nueva, se reutiliza la ya construida en cada tabla.

### 7. Validación (`zod`)

```ts
export const HeatmapFilterSchema = z.object({
  statuses: z.array(z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED'])),
  types: z.array(z.enum(['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']))
})
export const IncidentFilterSchema = HeatmapFilterSchema
export const ZoneSchema = z.enum(['MICROCENTRO', 'PALERMO', 'RECOLETA', 'BELGRANO', 'CABALLITO'])
```

## Estructura de archivos propuesta

```text
client/package.json                        # + leaflet.heat

client/src/shared/services/
  assets/
    useAssetsQuery.ts                      # movido desde features/assets/api/
    useAssetsQuery.test.tsx
    useAssetsStore.ts                      # movido desde features/assets/store/
    useAssetsStore.test.ts
  incidents/
    useIncidentsQuery.ts                   # movido desde features/incidents/api/
    useIncidentsQuery.test.tsx
    useIncidentsStore.ts                   # movido desde features/incidents/store/
    useIncidentsStore.test.ts

client/src/features/assets/
  api/useAssetsQuery.ts                    # eliminado, re-exporta o se borra + se actualizan imports
  store/useAssetsStore.ts                  # eliminado, se actualizan imports

client/src/features/incidents/            # análogo a assets

client/src/features/map/
  hooks/
    useSyncMapStore.ts
  store/
    useMapStore.ts
  schemas/
    zoneSchema.ts
    incidentFilterSchema.ts
    heatmapFilterSchema.ts
  utils/
    distanceMeters.ts (+ .test.ts)
    associateIncident.ts (+ .test.ts)
    buildHeatmapData.ts (+ .test.ts)
    assetMarkerColor.ts (+ .test.ts)
  components/
    ZoneLayer.tsx
    AssetMarkersLayer.tsx
    IncidentMarkersLayer.tsx
    AssetTooltip.tsx
    HeatmapLayer.tsx
    HeatmapLegend.tsx
    HeatmapFilters.tsx
    MapEntityTabs.tsx
    mapPage.styles.ts
  types/
    leaflet.heat.d.ts                      # solo si no hay tipos oficiales publicados
  pages/
    MapPage.tsx
```

## Fuera de alcance

- `AvailabilityAlert` y todo el motor de asignación vehículo↔activo/incidente (§5) — ver
  [docs/feature/11-vehicle-assignment-engine.md](./11-vehicle-assignment-engine.md), spec y feature
  aparte, bloqueante para ese componente puntual únicamente.
- Selector de zona en el mapa (`selectedZone` existe en `MapStore` para uso futuro, sin UI en este
  spec).
- Alta/edición/borrado de activos o incidentes desde el mapa (clic en marcador solo tooltip; las
  tablas embebidas en las tabs son de solo lectura en cuanto a paginación/orden, no exponen acciones
  de fila — ver "Gap" sobre esto en la tabla de tareas).
- Persistencia de `heatmapFilters`/`heatmapEnabled`/pestaña activa entre sesiones (`localStorage`) —
  se resetea a valores por defecto en cada carga de la app.
- Migración de `assets`/`incidents` para consumir `deriveZone` en sus propias tablas/filtros (fuera
  de `map`) — sigue pendiente como deuda de MAP-00; `map` sí lo usa para su propio filtrado interno.

## Nota abierta (no bloqueante, a confirmar durante implementación)

Las tablas reutilizadas en `MapEntityTabs` (`AssetsTable`/`VehiclesTable`/`IncidentsTable`) hoy
incluyen su columna de "Acciones" (Detalles/Editar/Eliminar) y abren los modales de cada feature. La
decisión del usuario fue "solo mostrás el mapa, no los filtros ni cards de estado" — no menciona la
columna de acciones ni los modales. Se propone dejarlos tal cual (mismo componente, sin recortar
columnas) porque removerlos requeriría una variante nueva de cada tabla; si se prefiere una versión
de solo lectura sin acciones dentro de las tabs del mapa, se ajusta como fast-follow.

## Tareas técnicas

| Tarea | Contenido |
|---|---|
| MAP-01.1 | Geometrías de zonas — ya resuelto por MAP-00. |
| MAP-01.2 | `deriveZone()` — ya resuelto por MAP-00, se reutiliza. |
| MAP-01.3 | Limpieza de datos — filtro por `deriveZone !== null` en `useSyncMapStore`. |
| MAP-01.4 | Asociación incidente-activo — `distanceMeters` + `associateIncident`. |
| MAP-01.5 | Store de mapa — `useMapStore`. |
| MAP-01.6 | Promover `useAssetsQuery`/`useAssetsStore` a `shared/services/assets/`. |
| MAP-01.7 | Promover `useIncidentsQuery`/`useIncidentsStore` a `shared/services/incidents/`. |
| MAP-01.8 | Capas de marcadores — `AssetMarkersLayer`, `IncidentMarkersLayer`. |
| MAP-01.9 | Heatmap — agregar `leaflet.heat`, `HeatmapLayer`. |
| MAP-01.10 | Filtros heatmap — `HeatmapFilters`. |
| MAP-01.11 | Leyenda — `HeatmapLegend`. |
| MAP-01.12 | Alertas operativas — diferido, ver spec 11. |
| MAP-01.13 | Tooltips — `AssetTooltip`. |
| MAP-01.14 | Pruebas unitarias — ver "Plan de tests". |
| MAP-01.15 | Integrar con estado global — `MapPage` monta `useSyncMapStore` + todos los componentes. |
| MAP-01.16 | `MapEntityTabs` — Tabs con las 3 tablas reutilizadas, sin filtros ni cards. |

## Criterios de aceptación

- **CA-01:** Se renderizan únicamente puntos contenidos dentro de las cinco zonas soportadas.
- **CA-02:** Las coordenadas se muestran con precisión de cuatro decimales.
- **CA-03:** Los activos usan la paleta `OK` verde, `FULL` rojo, `DAMAGED` naranja,
  `OUT_OF_SERVICE` negro.
- **CA-04:** El usuario puede activar y desactivar el heatmap.
- **CA-05:** El heatmap aparece habilitado al ingresar a la pantalla.
- **CA-06:** Los filtros del heatmap permiten seleccionar uno, varios o todos los valores.
- **CA-07:** La leyenda del heatmap permanece visible cuando el heatmap está activo.
- **CA-08:** Los incidentes `OVERFLOW` se asocian al activo compatible más cercano dentro de 100m.
- **CA-09:** Los incidentes sin activo asociado continúan siendo visibles.
- **CA-10:** Los tooltips muestran información del incidente asociado.
- **CA-11:** Los activos sin incidente muestran la etiqueta de su propio estado (`OK`, "Completo",
  "Dañado" o "Fuera de servicio") en el color correspondiente (actualizado 2026-07-06, antes
  mostraban siempre "Estado OK" en verde).
- **CA-12:** *(diferido a spec 11)* La alerta de disponibilidad se muestra cuando no hay vehículos
  disponibles.
- **CA-13:** Debajo del mapa hay 3 pestañas (Activos/Vehículos/Incidentes) que muestran la tabla
  paginada de cada entidad sin filtros ni cards de estado.
- **CA-14:** `map`, `assets` e `incidents` comparten una única carga de red por sesión de `GET
  /assets` y `GET /incidents` (sin fetch duplicado).

## Plan de tests

- `distanceMeters.test.ts`, `associateIncident.test.ts`, `buildHeatmapData.test.ts`,
  `assetMarkerColor.test.ts` — casos descritos en la versión previa de este spec (bordes de 100m,
  tipos no compatibles, filtros combinados, colores por estado).
- `useMapStore.test.ts` / `useSyncMapStore.test.ts`: descarta puntos fuera de zona, asocia
  correctamente, recalcula ante cambios en los stores compartidos (incluida una mutación local desde
  `assets`/`incidents`, ej. `removeAsset`).
- `useAssetsQuery.test.tsx`/`useAssetsStore.test.ts`/`useIncidentsQuery.test.tsx`/
  `useIncidentsStore.test.ts` — se mueven junto con su implementación a `shared/services/`, mismos
  casos ya cubiertos, ajustando únicamente rutas de import.
- `MapEntityTabs.test.tsx`: cambia de pestaña y renderiza la tabla correspondiente, paginación
  visible, sin filtros ni cards.
- Componentes de mapa (`AssetTooltip`, `HeatmapFilters`, `HeatmapLegend`): render con props/estado
  mockeado.
- Cobertura ≥ 80% en las 4 métricas.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%.
3. Revisión manual de que `features/map` no importa nada de `features/assets`/`features/incidents`
   directamente (solo de `shared/services/`), y de que `features/assets`/`features/incidents` no
   quedaron con imports rotos tras la promoción.
4. Verificación visual manual (`pnpm dev`): heatmap por defecto, colores de marcador, tooltips,
   tabs con sus 3 tablas paginadas.

## Excepción de dependencia — `MapEntityTabs`

`MapEntityTabs.tsx` (`features/map/components/`) importa directamente
`features/assets/components/AssetsTable`, `features/vehicles/components/VehiclesTable`,
`features/incidents/components/IncidentsTable` y `features/vehicles/api/useVehiclesQuery` —
una excepción explícita y deliberada a la regla de dependencia de `architecture.md` ("una feature
no importa de otra feature"), consecuencia directa de la decisión #2 del usuario (reutilizar esas
3 tablas tal cual dentro de las tabs del mapa). No se generalizó a `shared/` porque esas tablas
siguen siendo 100% propias de sus pantallas dedicadas (`/activos`, `/vehiculos`, `/incidentes`), con
su propia barra de filtros y `StatusSummaryCards` — moverlas rompería esa cohesión sin necesidad,
cuando el único caso de reutilización real es este montaje puntual en `MapPage`.

`useVehiclesQuery()` (todavía en `features/vehicles/api/`, **no** promovido a `shared/` —
a diferencia de `assets`/`incidents`, ninguna otra pantalla de `map` necesita el store de
vehículos crudo, solo la tabla ya armada) se monta también desde `MapEntityTabs` para que la
pestaña "Vehículos" tenga datos incluso si `/mapa` se visita sin haber pasado antes por
`/vehiculos` — mismo patrón "hidratación única" (`hasHydrated` evita una doble hidratación si
ambas pantallas llegan a montarse en la misma sesión).

## Hallazgos de verificación (post-implementación)

- **El entorno de esta sesión no permite ejecutar `pnpm`/`git` de forma confiable**: `git status`
  falla con `fatal: unknown index entry format 0x31310000` (índice de git corrompido en este mount),
  y no hay `pnpm` instalado ni permisos para instalarlo (`npm install -g pnpm` falla por permisos de
  sistema de archivos). Los binarios locales de `client/node_modules/.bin/{tsc,vitest}` están
  corruptos en este mount (`SyntaxError: missing ) after argument list` / `unexpected EOF` al
  ejecutarlos), y `node_modules/.pnpm` no existe en este mount — mismo tipo de limitación de puente
  de archivos ya documentada en specs anteriores (`docs/feature/07-assets-page.md`,
  `docs/specs/geo-zone-derivation.md` "Hallazgos de verificación"). **No se pudo correr
  `pnpm --filter client typecheck|lint|test|coverage` en esta sesión.**
- **Mitigación:** implementación completa vía lectura/escritura directa de archivos (no a través de
  `bash`, que en sesiones anteriores demostró operar sobre una copia potencialmente desincronizada
  del filesystem) y revisión manual línea por línea de cada archivo nuevo/modificado, prestando
  especial atención a `noUncheckedIndexedAccess` (activo en `client/tsconfig.json`): se corrigieron
  dos casos reales encontrados en esta revisión —
  `useMapStore.ts` (`geoTaggedIncidents` sin tipo explícito) y `HeatmapLayer.tsx` (el array de
  tuplas `[lat, lng, intensidad]` para `L.heatLayer` se inferiría como `number[][]`, no asignable a
  `HeatLatLngTuple[]`, sin una anotación de retorno explícita en el `.map`).
- **Tipos de `leaflet.heat`:** se usó el paquete `@types/leaflet.heat@^0.2.5` (confirmado existente
  y compatible con `leaflet@^1.9` vía registry de npm), evitando declarar un `.d.ts` ambient propio
  como preveía la primera versión de este spec.
- **Acción pendiente del usuario:** correr `pnpm install` (para bajar `leaflet.heat`/
  `@types/leaflet.heat`, agregados a `client/package.json` pero no instalados en este mount) y luego
  `pnpm --filter client typecheck && pnpm --filter client lint && pnpm --filter client test &&
  pnpm --filter client coverage` en un entorno con acceso normal al proyecto antes de mergear —
  mismo pedido que en specs previos con la misma limitación de entorno.
- **Continuidad de sesión:** una ejecución previa de este mismo cambio se interrumpió por límite de
  uso mensual tras haber creado únicamente las 4 copias en `shared/services/{assets,incidents}/`
  (sin borrar los archivos viejos ni actualizar el resto de los imports). Esta sesión verificó el
  contenido de esas 4 copias (correcto), completó el borrado de los 8 archivos viejos duplicados
  (`features/assets/{api,store}/useAssets{Query,Store}.{ts,test.ts(x)}`,
  `features/incidents/{api,store}/useIncidents{Query,Store}.{ts,test.ts(x)}` — requirió habilitar
  borrado del directorio del proyecto vía la herramienta correspondiente, ya que estaba bloqueado
  por defecto) y actualizó los ~11 archivos de `features/incidents/**` que todavía apuntaban a las
  rutas viejas.

## Addendum — fix `IndexSizeError` en `HeatmapLayer` (2026-07-06)

**Bug reportado por el usuario:** al abrir `/mapa` (heatmap habilitado por defecto, CA-05), el
navegador tira `Uncaught IndexSizeError: Failed to execute 'getImageData' on
'CanvasRenderingContext2D': The source width is 0` en `leaflet__heat.js` (`draw` → `_redraw` →
`_reset` → `onAdd`), lanzado desde `HeatmapLayer.tsx:44` (`L.heatLayer(...).addTo(map)`).

**Causa raíz:** `leaflet.heat@0.2.0` (`_initCanvas`, `dist/leaflet-heat.js`) fija el tamaño del
canvas del heatmap leyendo `map.getSize()` en el momento en que la capa se agrega (`onAdd`). Como
`heatmapEnabled` es `true` por defecto, `HeatmapLayer` monta su `useEffect` y llama
`L.heatLayer(...).addTo(map)` en el mismo ciclo en que `MapContainer` inicializa el mapa de
Leaflet — antes de que el contenedor tenga un tamaño de layout resuelto. Si en ese instante
`map.getSize()` devuelve `{x: 0, y: 0}`, el canvas queda con `width = 0` y el primer `draw()`
interno (`ctx.getImageData(0, 0, 0, height)`) lanza `IndexSizeError`. No depende de la cantidad de
puntos del heatmap ni de `buildHeatmapData` — reproducible incluso con el array de tuplas vacío.

**Fix (acotado, sin cambiar el criterio de "Componentes" de la sección 6):** en el `useEffect` de
`HeatmapLayer`, antes de crear las capas `L.heatLayer`, se verifica `map.getSize()`. Si el
contenedor todavía reporta tamaño `0x0` en cualquiera de sus dos ejes, se reintenta en el próximo
frame (`requestAnimationFrame`) en vez de crear la capa inmediatamente, hasta que el mapa reporte un
tamaño real. El cleanup del efecto cancela cualquier reintento pendiente además de remover las capas
ya creadas. No se usa el evento `'load'` de Leaflet como guardia porque solo se dispara una vez en
el ciclo de vida del mapa (no cubre remontajes de `HeatmapLayer` posteriores, p. ej. al
desactivar/reactivar el heatmap después de que el mapa ya cargó) — el polling por `rAF` cubre ambos
casos con la misma lógica.

Sin cambios de contrato: `HeatmapLayer` sigue sin props, sigue usando `useMap()` +
`buildHeatmapData()` + un `L.heatLayer` monocromático por estado (sección 6), y sigue removiendo
todas las capas creadas al desmontar/recalcular.

**Test agregado:** `HeatmapLayer.test.tsx` — nuevo caso que mockea `useMap().getSize()` devolviendo
`{x: 0, y: 0}` en la primera llamada y un tamaño real después, mockea `requestAnimationFrame` para
ejecutar el callback sincrónicamente, y verifica que `L.heatLayer` recién se crea tras el reintento.

**Verificación:** mismo bloqueo de entorno ya documentado en "Hallazgos de verificación" de este
spec — `client/package.json` en este mount está corrupto (`SyntaxError: Unterminated string in
JSON`, confirmado con `JSON.parse` directo) y no hay `pnpm` disponible, por lo que no se pudo correr
`pnpm --filter client typecheck|lint|test` en esta sesión. Pendiente que el usuario corra esos
comandos en un entorno normal antes de mergear.

## Addendum 2 — mapa en blanco (ancho 0) tras el fix del heatmap (2026-07-06)

**Bug reportado por el usuario:** tras aplicar el addendum anterior, el crash desaparece pero el
mapa sigue sin verse — el espacio se reserva (520px de alto) pero no se ve ningún tile ni control de
Leaflet dentro.

**Diagnóstico (sesión de navegador conectada a `http://localhost:5173/mapa`):** los tiles de
`tile.openstreetmap.org` se piden y responden `200 OK`, y no hay errores en consola — el problema es
puramente de layout/CSS, no de red ni de la capa de Leaflet. Inspeccionando el DOM en vivo,
`.leaflet-container` (el div raíz que `MapContainer` crea a partir de `mapContainerStyle`) mide
`width: 0px` / `height: 520px`. La altura es correcta porque `mapContainerStyle.height` es un valor
absoluto; el ancho colapsa porque `mapContainerStyle.width: '100%'` es un porcentaje resuelto contra
`mapLayoutStyle` (`display:'flex'`, fila, sin `width` propio) — al ser hijo de un `Flex` en columna
sin ancho explícito, esa fila no se estira al ancho disponible sino que se ajusta a "fit-content"
(mide exactamente lo que ocupan sus hijos: el sidebar de heatmap de 220px + el gap de 16px = 236px,
confirmado en el DOM). Un porcentaje contra un ancho de padre indeterminado resuelve a `0`, así que
`MapContainer` terminaba con `width: 0px` — mapa invisible aunque el alto reservado se viera bien.

**Fix (`client/src/features/map/components/mapPage.styles.ts`):**
- `mapLayoutStyle`: se agrega `width: '100%'` para que la fila ocupe el ancho completo de la columna
  que la contiene, en vez de depender de "fit-content".
- `mapContainerStyle`: se reemplaza `width: '100%'` (porcentaje, frágil contra un padre flex) por
  `flex: '1 1 0%'` + `minWidth: 0` — patrón estándar de "ocupar el espacio restante" en una fila
  flex junto a un hermano de ancho fijo (`heatmapSidebarStyle`, `width: '220px'`, `flexShrink: 0`),
  sin depender de que el padre tenga un ancho resuelto de antemano.

Sin cambios de contrato de componentes ni de la sección 6 — este addendum solo ajusta valores de
`mapPage.styles.ts`, ya cubiertos por "Estructura de archivos propuesta"
(`features/map/components/mapPage.styles.ts`).

**Verificación:** confirmado visualmente con Claude in Chrome contra `http://localhost:5173/mapa`
(servidor del usuario corriendo localmente) — antes del fix, `.leaflet-container` medía `width: 0px`
pese a `height: 520px` correcto; pendiente re-verificar tras aplicar el cambio. Mismo bloqueo de
`pnpm`/`typecheck`/`test` en este mount que en los hallazgos anteriores — no se pudo correr la suite
automatizada en esta sesión.

## Addendum 3 — activos irradiando en el heatmap (2026-07-06)

**Pedido del usuario:** que **todos** los puntos del mapa irradien calor, cada uno con su color, no
sólo los incidentes. Hoy el heatmap sólo proyecta incidentes; los activos son marcadores puntuales
sin halo. El detalle completo (diseño, filtros de activo, densidad de 1500 puntos, leyenda extendida,
archivos, tests) vive en su spec propio: **[docs/feature/14-assets-in-heatmap.md](./14-assets-in-heatmap.md)**
(estado: propuesto, pendiente de aprobación — spec-first).

**Impacto sobre este documento (cuando 14 se apruebe e implemente):**

- **"Reglas de negocio" → "Heatmap":** ya anotado arriba — los activos irradian una capa por estado,
  coloreada con `ASSET_MARKER_COLORS`, filtrable por estado/tipo de activo.
- **Sección 6 "Componentes":**
  - `HeatmapLayer` monta, además de una capa monocromática por estado de **incidente**, una por
    estado de **activo** (mismo mecanismo `L.heatLayer` + gradiente monocromático, ya que
    `leaflet.heat` no colorea puntos individuales dentro de una capa). Se agregan `assets` y
    `assetHeatmapFilters` a sus dependencias.
  - Se agrega `AssetHeatmapFilters` (filtros de estado/tipo de activo) junto a `HeatmapFilters`, y un
    `HeatmapFilterGroup` genérico reutilizado por ambos.
  - `HeatmapLegend` gana una subsección "Activos".
- **Sección 7 "Validación (zod)":** se agrega `AssetHeatmapFilterSchema`
  (`statuses: AssetStatus[]`, `types: AssetType[]`).
- **Criterios de aceptación:** los CA de esta ampliación se numeran y verifican en el spec 14
  (CA-01…CA-08 de ese documento), no se renumeran los CA-01…CA-14 de este.

Sin cambios sobre el resto de este spec — la asociación incidente↔activo, las tabs, los tooltips y
el resto de la feature no se ven afectados.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           