# SPEC — Activos irradiando en el mapa de calor (heatmap de activos)

**Tipo:** feature
**Estado:** Aprobado e implementado (2026-07-06). Pendiente únicamente el afinado **visual** de la
densidad de las capas de activo (el usuario lo ajusta al verlo — ver "Estado de implementación").
**Fecha:** 2026-07-06
**Rama:** `feat/asset-legends` (decisión del usuario 2026-07-06 — se continúa sobre la rama actual,
junto con los cambios de `AssetLegend` ya presentes, en vez de abrir una rama nueva).
**Relacionado:** [docs/feature/10-maps-create.md](./10-maps-create.md) ("Heatmap", `HeatmapLayer`,
`HeatmapFilters`, `HeatmapLegend`, `buildHeatmapData`, decisión #4), [docs/feature/13-asset-legend.md](./13-asset-legend.md)
(`AssetLegend`, `ASSET_MARKER_COLORS`, `ASSET_STATUS_LEGEND_LABELS`),
[docs/verified-scope.md](../verified-scope.md) §3.1/§3.2/§10.2/§10.7,
`client/src/features/map/components/HeatmapLayer.tsx`, `HeatmapFilters.tsx`, `HeatmapLegend.tsx`,
`utils/buildHeatmapData.ts`, `utils/assetMarkerColor.ts`, `store/useMapStore.ts`,
`schemas/heatmapFilterSchema.ts`, `leaflet.heat`

## Objetivo

Hacer que **los activos también irradien calor** en el mapa de calor, no solo los incidentes. Hoy
el heatmap se construye exclusivamente a partir de incidentes (`buildHeatmapData(incidents, …)`); los
activos se dibujan como marcadores puntuales (`AssetMarkersLayer`) pero no aportan ningún halo. Este
cambio agrega una capa de calor por **estado de activo**, cada una con el color del propio marcador
del activo (`ASSET_MARKER_COLORS`: `OK` verde, `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE`
negro), filtrable por estado y por tipo de activo — en paralelo, y con la misma mecánica, que el
filtro de incidentes ya existente.

## Motivación (pedido del usuario, 2026-07-06)

El usuario preguntó por qué, con el mapa de calor activo, los marcadores rojos (activos `FULL`) no
muestran ninguna aureola. La investigación confirmó que el heatmap sólo proyecta incidentes
(`HeatmapLayer` → `buildHeatmapData(incidents, …)`), y ningún incidente es rojo (`REPORTED` azul,
`IN_PROGRESS` amarillo, `RESOLVED` violeta). El rojo es exclusivamente el color de marcador de un
activo `FULL`, y los activos no eran fuente del heatmap.

Decisión del usuario: **todos los puntos del mapa deben irradiar, cada uno con su color** — no sólo
los incidentes. En este mapa los únicos puntos con coordenadas son activos e incidentes (los
vehículos no tienen `lat`/`lng` en el modelo, §10.4), así que "todos" = activos + incidentes.

## Decisiones tomadas por el usuario (2026-07-06)

1. **Rama:** se continúa sobre `feat/asset-legends` (no se abre rama nueva), aun conviviendo con los
   cambios de `AssetLegend`.
2. **Filtros propios de activos:** el panel del heatmap gana controles de **Estado de activo**
   (`OK`/`FULL`/`DAMAGED`/`OUT_OF_SERVICE`) y **Tipo de activo** (`CONTAINER`/`BIN`/`BENCH`),
   independientes de los filtros de incidente, con la misma semántica AND (uno/varios/todos por
   filtro) y el mismo atajo "Todos" ya usados para incidentes (CA-06 de
   [10-maps-create.md](./10-maps-create.md)).
3. **Leyenda del heatmap extendida:** `HeatmapLegend` suma una subsección "Activos" con los 4
   colores/labels de `ASSET_MARKER_COLORS`/`ASSET_STATUS_LEGEND_LABELS`, además de la subsección
   "Incidentes" que ya tiene. La `AssetLegend` (leyenda de marcadores, siempre visible) se mantiene
   sin cambios — la superposición de colores de activo entre ambas es intencional y aceptada por el
   usuario (misma paleta que ya comparten marcador y heat de activo).

## Diagnóstico (contra el código actual)

- **`leaflet.heat` no colorea puntos individuales dentro de una capa** (ya documentado en
  [10-maps-create.md](./10-maps-create.md), decisión #4 y sección "Componentes"): hoy `HeatmapLayer`
  monta **una `L.heatLayer` monocromática por estado de incidente seleccionado**, con
  `gradient: { 0.4: color, 1: color }` = `INCIDENT_STATUS_COLORS[status]`. El mismo patrón se replica
  para activos: **una capa por estado de activo seleccionado**, con gradiente = `ASSET_MARKER_COLORS[status]`.
- **`buildHeatmapData(incidents, filters)`** (`utils/buildHeatmapData.ts`) filtra incidentes por
  `status` AND `type` y proyecta `{ lat, lng, status }`. Se agrega una función hermana para activos.
- **`ASSET_MARKER_COLORS` y `ASSET_STATUS_LEGEND_LABELS`** ya existen en `utils/assetMarkerColor.ts`
  (de [13-asset-legend.md](./13-asset-legend.md)) — se reutilizan tal cual para el gradiente y la
  leyenda. Falta sólo un mapa de **labels por tipo de activo** para las opciones del filtro
  (`CONTAINER`→"Contenedor", `BIN`→"Cesto", `BENCH`→"Banco" — mismo vocabulario que `assetTypeLabel`
  de `features/assets`), que hoy no existe en `features/map/`
  (existe `assetTypeLabel` en `features/assets`, pero `map` no puede importar de `assets` —
  `architecture.md` — mismo precedente que `ASSET_STATUS_LEGEND_LABELS`).
- **`MapStore.heatmapFilters`** hoy es `{ statuses: IncidentStatus[]; types: IncidentType[] }`. Se
  agrega un estado paralelo `assetHeatmapFilters: { statuses: AssetStatus[]; types: AssetType[] }`,
  sin tocar el existente (evita romper `HeatmapFilters.tsx`, el schema y sus tests).
- **Densidad — 1500 activos vs. 40 incidentes.** Con ~1500 activos, el heat de activos es
  drásticamente más denso que el de incidentes y, con los mismos parámetros (`radius: 25`,
  intensidad `1` por punto), saturaría el mapa hasta volverlo un manto sólido. Este spec ajusta la
  intensidad/radio de las capas de activo (ver "Densidad y tuning") — es el único parámetro que
  requiere validación **visual** manual, no automática.
- **`OUT_OF_SERVICE` es negro.** Su gradiente de calor renderiza como un oscurecimiento del mapa (no
  un color vivo); es correcto y consistente con el marcador negro, sólo se deja constancia.

## Diseño

### Archivos

```text
client/src/features/map/
  types.ts                          # + AssetHeatmapFilters, + AssetHeatmapPoint
  store/
    useMapStore.ts                   # + assetHeatmapFilters (default: todo seleccionado) + setAssetHeatmapFilters
    useMapStore.test.ts              # + casos para el nuevo estado/acción
  schemas/
    heatmapFilterSchema.ts           # + AssetHeatmapFilterSchema (AssetStatus[] / AssetType[])
    heatmapFilterSchema.test.ts      # + casos del schema de activos
  utils/
    buildHeatmapData.ts              # + buildAssetHeatmapData(assets, filters)
    buildHeatmapData.test.ts         # + casos de filtrado de activos (status AND type)
    assetMarkerColor.ts              # + ASSET_TYPE_LEGEND_LABELS (labels de tipo para el filtro)
    assetMarkerColor.test.ts         # + caso para las labels de tipo
  components/
    HeatmapFilterGroup.tsx           # nuevo: popover genérico (label + "Todos" + CheckboxGroup) reutilizable
    HeatmapFilterGroup.test.tsx      # nuevo
    HeatmapFilters.tsx               # refactor: usa HeatmapFilterGroup para Estado/Tipo de incidente
    HeatmapFilters.test.tsx          # ajuste por refactor (sin cambiar comportamiento de incidentes)
    AssetHeatmapFilters.tsx          # nuevo: Estado/Tipo de activo, mismo patrón, vía HeatmapFilterGroup
    AssetHeatmapFilters.test.tsx     # nuevo
    HeatmapLayer.tsx                 # + una capa L.heatLayer por estado de activo seleccionado
    HeatmapLayer.test.tsx            # + caso: se crean capas de activo con su gradiente
    HeatmapLegend.tsx                # + subsección "Activos" (4 colores/labels)
    HeatmapLegend.test.tsx           # + caso: labels de activo presentes
  pages/
    MapPage.tsx                       # monta <AssetHeatmapFilters /> junto a <HeatmapFilters /> cuando heatmapEnabled
    MapPage.test.tsx                  # + caso: filtros de activo visibles sólo con heatmap activo
```

### Tipos nuevos (`types.ts`)

```ts
export interface AssetHeatmapFilters {
  statuses: AssetStatus[]
  types: AssetType[]
}

export interface AssetHeatmapPoint {
  lat: number
  lng: number
  status: AssetStatus
}
```

`HeatmapFilters`/`HeatmapPoint` (incidentes) se mantienen sin cambios.

### `MapStore` (`useMapStore.ts`)

```ts
const ALL_ASSET_HEATMAP_FILTERS: AssetHeatmapFilters = {
  statuses: ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE'],
  types: ['CONTAINER', 'BIN', 'BENCH']
}

export interface MapState {
  // ...sin cambios...
  assetHeatmapFilters: AssetHeatmapFilters
  setAssetHeatmapFilters: (filters: AssetHeatmapFilters) => void
}
```

`assetHeatmapFilters` arranca con **todo seleccionado** (mismo criterio que `heatmapFilters`, CA-05
de [10-maps-create.md](./10-maps-create.md): con el heatmap habilitado por defecto, todos los
activos irradian de entrada). `syncFromShared` no cambia.

### `buildAssetHeatmapData` (`utils/buildHeatmapData.ts`)

```ts
export function buildAssetHeatmapData(
  assets: GeoTaggedAsset[],
  filters: AssetHeatmapFilters
): AssetHeatmapPoint[]
```

Filtra por `status` AND `type` (misma semántica que `buildHeatmapData`: seleccionar ninguno en una
dimensión vacía el resultado) y proyecta `{ lat, lng, status }`. Los activos ya vienen filtrados por
zona desde `MapStore` (`GeoTaggedAsset`), igual que los incidentes.

### `HeatmapLayer` (`components/HeatmapLayer.tsx`)

Se agrega, dentro del mismo `useEffect` que ya crea las capas de incidente (tras el guard de
`map.getSize()` no-`0x0`, sin tocar esa lógica), un bloque simétrico que crea **una `L.heatLayer` por
estado de activo seleccionado**:

```ts
const ASSET_STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

const assetLayers = ASSET_STATUSES
  .filter((status) => assetHeatmapFilters.statuses.includes(status))
  .map((status) => {
    const points = buildAssetHeatmapData(assets, {
      statuses: [status],
      types: assetHeatmapFilters.types
    })
    const color = ASSET_MARKER_COLORS[status]
    const tuples = points.map((p): L.HeatLatLngTuple => [p.lat, p.lng, ASSET_POINT_INTENSITY])
    return L.heatLayer(tuples, {
      radius: ASSET_HEAT_RADIUS,
      blur: 15,
      max: ASSET_HEAT_MAX,
      gradient: { 0.4: color, 1: color }
    }).addTo(map)
  })
```

Todas las capas (incidente + activo) se acumulan en el mismo array `layers` y se remueven juntas en
el cleanup — sin cambiar el contrato de `HeatmapLayer` (sigue sin props, sigue usando `useMap()`, y
sigue recreándose cuando cambian `incidents`/`assets`/`heatmapFilters`/`assetHeatmapFilters`, que se
agregan al array de dependencias del efecto).

### Densidad y tuning (capas de activo)

Para que ~1500 activos no saturen el mapa (el único ajuste que se valida visualmente):

- `ASSET_POINT_INTENSITY = 0.4` (menor que el `1` de incidentes) — cada activo aporta menos calor.
- `ASSET_HEAT_MAX = 3.0` — sube el techo de saturación de `leaflet.heat` (default `1.0`) para que un
  cúmulo de activos no llegue tan rápido al color pleno del gradiente.
- `ASSET_HEAT_RADIUS = 20` (levemente menor que el `25` de incidentes).

Son valores de partida, agrupados como constantes nombradas en `HeatmapLayer.tsx`, a afinar en la
verificación visual (`pnpm dev`) hasta que activos e incidentes convivan de forma legible. Ningún
otro contrato depende de estos números.

### `HeatmapFilterGroup` (`components/HeatmapFilterGroup.tsx`) — nuevo, reutilizable

Extrae el popover ya repetido dos veces en `HeatmapFilters` (label + botón con `triggerLabel` +
"Todos" + `CheckboxGroup`) a un componente genérico, para no cuadruplicar ese boilerplate al sumar
los 2 filtros de activo:

```tsx
interface HeatmapFilterGroupProps<T extends string> {
  label: string
  triggerAriaLabel: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (values: T[]) => void
}
```

`HeatmapFilters` (incidentes) y `AssetHeatmapFilters` (activos) lo consumen. `triggerLabel` (hoy
local en `HeatmapFilters.tsx`) se mueve a este componente. Sin cambio de comportamiento visible para
los filtros de incidente — misma UI, mismos `data-testid`/`aria-label`.

### `AssetHeatmapFilters` (`components/AssetHeatmapFilters.tsx`) — nuevo

Espeja `HeatmapFilters` pero para activos, vía `HeatmapFilterGroup`:

```tsx
const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: 'OK', label: 'OK' },
  { value: 'FULL', label: 'Completo' },
  { value: 'DAMAGED', label: 'Dañado' },
  { value: 'OUT_OF_SERVICE', label: 'Fuera de servicio' }
]
const TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'CONTAINER', label: 'Contenedor' },
  { value: 'BIN', label: 'Cesto' },
  { value: 'BENCH', label: 'Banco' }
]
```

Lee/escribe `assetHeatmapFilters`/`setAssetHeatmapFilters` de `MapStore`. `data-testid="asset-heatmap-filters"`.

### `HeatmapLegend` (`components/HeatmapLegend.tsx`)

Se agrega una subsección "Activos" debajo de la de incidentes, reutilizando `legendSwatchStyle` y
la paleta/labels de activos:

```tsx
<Flex direction="column" gap="2" data-testid="heatmap-legend">
  <Text size="2" weight="bold">Incidentes</Text>
  {INCIDENT_STATUSES.map(/* ...igual que hoy... */)}
  <Text size="2" weight="bold">Activos</Text>
  {ASSET_STATUSES.map((status) => (
    <Flex key={status} align="center" gap="2">
      <span style={legendSwatchStyle(assetMarkerColor(status))} />
      <Text size="2">{ASSET_STATUS_LEGEND_LABELS[status]}</Text>
    </Flex>
  ))}
</Flex>
```

El título general pasa de "Referencias" a dos encabezados de grupo ("Incidentes" / "Activos"). Sigue
mostrándose sólo con el heatmap activo (CA-07, sin regresión).

### Integración en `MapPage`

```tsx
<Flex direction="column" gap="4" style={heatmapSidebarStyle}>
  <AssetLegend />
  {heatmapEnabled ? (
    <>
      <HeatmapFilters />
      <AssetHeatmapFilters />
      <HeatmapLegend />
    </>
  ) : null}
</Flex>
```

`AssetHeatmapFilters` vive junto a `HeatmapFilters`, dentro del mismo condicional `heatmapEnabled`.
`AssetLegend` (siempre visible) no cambia.

## Fuera de alcance

- Persistencia de `assetHeatmapFilters` entre sesiones (`localStorage`/URL) — se resetea a "todo
  seleccionado" en cada carga, igual que `heatmapFilters` (mismo criterio de
  [10-maps-create.md](./10-maps-create.md), "Fuera de alcance").
- Que los vehículos irradien — no tienen `lat`/`lng` en el modelo (§10.4), no aplica.
- Cambiar la paleta de activos o de incidentes — se reutilizan las existentes sin modificarlas.
- Unificar `heatmapFilters` (incidente) y `assetHeatmapFilters` (activo) en un único objeto — se
  dejan paralelos para no romper el estado/schema/tests ya existentes de incidentes.
- Una única leyenda consolidada que reemplace a `AssetLegend` — se mantienen ambas (decisión #3).

## Criterios de aceptación

- **CA-01:** Con el heatmap activo, los activos irradian calor, una capa por estado, coloreada con
  `ASSET_MARKER_COLORS` (`OK` verde, `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE` negro).
- **CA-02:** El panel del heatmap permite filtrar activos por **Estado** (`OK`/`FULL`/`DAMAGED`/
  `OUT_OF_SERVICE`) y por **Tipo** (`CONTAINER`/`BIN`/`BENCH`), uno/varios/todos por filtro (AND
  entre ambos), con atajo "Todos" — misma mecánica que el filtro de incidentes.
- **CA-03:** Al ingresar (heatmap habilitado por defecto), todos los activos irradian (todos los
  estados/tipos seleccionados).
- **CA-04:** Deseleccionar un estado/tipo de activo quita su capa/puntos del heatmap sin afectar el
  heat de incidentes, y viceversa (filtros independientes).
- **CA-05:** `HeatmapLegend` muestra, con el heatmap activo, tanto los colores de incidente como los
  de activo, con sus labels.
- **CA-06:** Con el heatmap apagado no se renderizan ni `HeatmapFilters` ni `AssetHeatmapFilters` ni
  `HeatmapLegend` (sin regresión sobre CA-07 de [10-maps-create.md](./10-maps-create.md)); la
  `AssetLegend` sigue visible con y sin heatmap (CA-02 de [13-asset-legend.md](./13-asset-legend.md)).
- **CA-07:** El heat de activos no satura el mapa: con la intensidad/radio/`max` definidos, activos
  e incidentes conviven de forma legible (validación visual).
- **CA-08:** Ningún componente/utilidad nuevo importa de `features/assets` (regla de dependencia) —
  labels y colores de activo viven en `features/map/utils/assetMarkerColor.ts`.

## Plan de tests

- `buildHeatmapData.test.ts`: casos de `buildAssetHeatmapData` — filtra por status AND type, status
  vacío / type vacío → resultado vacío, proyecta `{ lat, lng, status }`.
- `useMapStore.test.ts`: `assetHeatmapFilters` default = todo seleccionado; `setAssetHeatmapFilters`
  actualiza sólo ese estado sin tocar `heatmapFilters`.
- `heatmapFilterSchema.test.ts`: `AssetHeatmapFilterSchema` acepta valores válidos y rechaza estados/
  tipos inválidos.
- `assetMarkerColor.test.ts`: `ASSET_TYPE_LEGEND_LABELS` cubre las 3 claves con su texto.
- `HeatmapFilterGroup.test.tsx`: render, "Todos" selecciona/limpia, seleccionar un ítem llama
  `onChange`.
- `AssetHeatmapFilters.test.tsx`: refleja/actualiza `assetHeatmapFilters`.
- `HeatmapFilters.test.tsx`: se mantiene verde tras el refactor a `HeatmapFilterGroup` (sin cambio de
  comportamiento de incidentes).
- `HeatmapLayer.test.tsx`: mockeando `L.heatLayer`, se crea una capa por estado de activo
  seleccionado con su gradiente; el guard de `getSize()` `0x0` sigue cubierto.
- `HeatmapLegend.test.tsx`: labels de incidente y de activo presentes.
- `MapPage.test.tsx`: `asset-heatmap-filters` visible sólo con heatmap activo; `asset-legend` visible
  con y sin heatmap.
- Cobertura ≥ 80% en los archivos nuevos/modificados.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%.
3. Revisión manual: nada nuevo importa de `features/assets`.
4. Verificación **visual** (`pnpm dev`, `/mapa`): con el heatmap activo se ve el halo de activos
   (rojo sobre `FULL`, etc.) además del de incidentes; los filtros de activo agregan/quitan calor; la
   densidad de 1500 activos es legible (ajustar `ASSET_POINT_INTENSITY`/`ASSET_HEAT_MAX`/
   `ASSET_HEAT_RADIUS` si hace falta).

## Estado de implementación

Todo implementado sobre la rama `feat/asset-legends`. A diferencia de sesiones anteriores, en este
entorno **sí** corrió la suite completa:

- ✅ `client/src/features/map/types.ts` — `AssetHeatmapFilters`, `AssetHeatmapPoint`.
- ✅ `client/src/features/map/utils/assetMarkerColor.ts` (+ test) — `ASSET_TYPE_LEGEND_LABELS`.
- ✅ `client/src/features/map/utils/buildHeatmapData.ts` (+ test) — `buildAssetHeatmapData`.
- ✅ `client/src/features/map/schemas/heatmapFilterSchema.ts` (+ test) — `AssetHeatmapFilterSchema`.
- ✅ `client/src/features/map/store/useMapStore.ts` (+ test) — `assetHeatmapFilters` + setter.
- ✅ `client/src/features/map/components/HeatmapFilterGroup.tsx` (+ test) — popover genérico nuevo.
- ✅ `client/src/features/map/components/HeatmapFilters.tsx` — refactor a `HeatmapFilterGroup`.
- ✅ `client/src/features/map/components/AssetHeatmapFilters.tsx` (+ test) — nuevo.
- ✅ `client/src/features/map/components/HeatmapLayer.tsx` (+ test) — capas de activo + tuning.
- ✅ `client/src/features/map/components/HeatmapLegend.tsx` (+ test) — subsección "Activos".
- ✅ `client/src/features/map/pages/MapPage.tsx` (+ test) — monta `AssetHeatmapFilters`.

**Verificación (2026-07-06):** `pnpm --filter client typecheck` ✅, `lint` ✅ (sin errores; sólo
warnings preexistentes en `coverage/`), `format:check` ✅, `test` ✅ — 28 archivos / 145 tests del
feature `map` en verde (32 nuevos/tocados). **Pendiente:** verificación visual del usuario para
afinar `ASSET_POINT_INTENSITY`/`ASSET_HEAT_MAX`/`ASSET_HEAT_RADIUS` con la densidad real de 1500
activos.
