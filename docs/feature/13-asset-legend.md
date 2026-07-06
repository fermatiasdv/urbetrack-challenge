# SPEC — `AssetLegend` (leyenda de colores de marcador de activos)

**Tipo:** feature
**Estado:** Aprobado (2026-07-06)
**Fecha:** 2026-07-06
**Relacionado:** [docs/feature/10-maps-create.md](./10-maps-create.md) ("Activos — color de
marcador", CA-03), [docs/feature/12-availability-alert.md](./12-availability-alert.md) (patrón de
componente conectado a store + co-localización en `mapPage.styles.ts`),
[docs/verified-scope.md](../verified-scope.md) §3.1/§10.2

## Objetivo

Agregar una leyenda, visible junto al mapa, que explique los 4 colores usados por
`AssetMarkersLayer` para pintar los marcadores de activos: verde (`OK`), rojo (`FULL`), naranja
(`DAMAGED`), negro (`OUT_OF_SERVICE`).

## Motivación (gap reportado por el usuario, 2026-07-06)

El usuario preguntó por qué se ven activos/incidentes en rojo en el mapa y por qué ese color no
aparece en ninguna leyenda. Investigación confirmó que:

- El rojo es el color de marcador de un **activo en estado `FULL`** (`assetMarkerColor.ts`), no un
  incidente — los incidentes usan otra paleta sin rojo (`REPORTED` azul, `IN_PROGRESS` amarillo,
  `RESOLVED` verde, `constants/incidentStatusColors.ts`).
- La única leyenda existente, `HeatmapLegend`, documenta exclusivamente esos 3 colores de
  **incidente**, y solo se renderiza cuando `heatmapEnabled` es `true` (condicional en
  `MapPage.tsx`).
- Nunca existió una leyenda para `ASSET_MARKER_COLORS` — el spec original
  ([10-maps-create.md](./10-maps-create.md), sección "Componentes") solo previó un tooltip por
  marcador (`AssetTooltip`) para activos, sin leyenda.

Resultado: un usuario no tiene forma de saber, mirando el mapa, qué significa un marcador rojo.

## Diagnóstico

- `ASSET_MARKER_COLORS` (`client/src/features/map/utils/assetMarkerColor.ts:17-22`) ya expone los 4
  colores literales por `AssetStatus`, consumidos por `AssetMarkersLayer.tsx` — no hace falta ningún
  color nuevo, solo una etiqueta legible por estado, que hoy no existe en `features/map/` (existe
  `assetStatusLabel` en `features/assets/utils/assetFormat.ts`, pero es de otra feature —
  `architecture.md` prohíbe ese import cruzado salvo excepción explícita, y `assetMarkerColor.ts` ya
  sienta el precedente de mantener este mapeo duplicado y propio de `map` en vez de importarlo de
  `assets`).
- `HeatmapLegend.tsx` es el único componente de leyenda existente; su estructura (`Flex` +
  `Text` + swatch de color por `span`) es el patrón a reutilizar para `AssetLegend`.
- `mapPage.styles.ts` expone `heatmapLegendSwatchStyle(color)` — genérico (solo dibuja un cuadrado
  de color), reutilizable tal cual para ambas leyendas. Se renombra a `legendSwatchStyle` porque deja
  de ser exclusivo del heatmap.
- En `MapPage.tsx`, el `Flex` lateral (`heatmapSidebarStyle`, 220px) que hoy contiene
  `HeatmapFilters`/`HeatmapLegend` solo se monta si `heatmapEnabled` es `true`. Como
  `AssetMarkersLayer` se renderiza siempre (con o sin heatmap), `AssetLegend` necesita ese mismo
  sidebar montado siempre — se saca el condicional del `Flex` contenedor y se deja únicamente sobre
  `HeatmapFilters`/`HeatmapLegend`.

## Diseño

### Archivos

```text
client/src/features/map/
  utils/
    assetMarkerColor.ts          # + ASSET_STATUS_LEGEND_LABELS
    assetMarkerColor.test.ts     # + caso para las labels
  components/
    mapPage.styles.ts            # heatmapLegendSwatchStyle -> legendSwatchStyle (rename)
    HeatmapLegend.tsx             # actualiza el import del swatch renombrado
    AssetLegend.tsx               # nuevo
    AssetLegend.test.tsx          # nuevo
  pages/
    MapPage.tsx                   # monta <AssetLegend /> siempre; sidebar ya no depende de heatmapEnabled
    MapPage.test.tsx              # + caso: la leyenda de activos se ve con y sin heatmap
```

### `assetMarkerColor.ts` — labels

```ts
export const ASSET_STATUS_LEGEND_LABELS: Record<AssetStatus, string> = {
  OK: 'OK',
  FULL: 'Completo',
  DAMAGED: 'Dañado',
  OUT_OF_SERVICE: 'Fuera de servicio'
}
```

Mismo texto que `assetStatusLabel` de `features/assets/utils/assetFormat.ts` (consistencia de
vocabulario en toda la app), pero declarado localmente en `map` — no importado — por la regla de
dependencia entre features (`architecture.md`), mismo criterio ya aplicado a
`ASSET_MARKER_COLORS` frente a `assetStatusColorRole`.

### `AssetLegend.tsx`

```tsx
import type { JSX } from 'react'
import { Flex, Text } from '@radix-ui/themes'
import { assetMarkerColor, ASSET_STATUS_LEGEND_LABELS } from '../utils/assetMarkerColor'
import type { AssetStatus } from '../../../shared/types/domain.types'
import { legendSwatchStyle } from './mapPage.styles'

const STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

export function AssetLegend(): JSX.Element {
  return (
    <Flex direction="column" gap="2" data-testid="asset-legend">
      <Text size="2" weight="bold">
        Activos
      </Text>
      {STATUSES.map((status) => (
        <Flex key={status} align="center" gap="2">
          <span style={legendSwatchStyle(assetMarkerColor(status))} />
          <Text size="2">{ASSET_STATUS_LEGEND_LABELS[status]}</Text>
        </Flex>
      ))}
    </Flex>
  )
}
```

Mismo patrón que `HeatmapLegend` (componente sin props, sin conexión a store — a diferencia de
`HeatmapLegend`/`AvailabilityAlert`, no necesita leer estado: los 4 colores/labels son estáticos).

### Integración en `MapPage`

```tsx
<Flex style={mapLayoutStyle}>
  <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={mapContainerStyle}>
    {/* ...sin cambios... */}
  </MapContainer>

  <Flex direction="column" gap="4" style={heatmapSidebarStyle}>
    <AssetLegend />
    {heatmapEnabled ? (
      <>
        <HeatmapFilters />
        <HeatmapLegend />
      </>
    ) : null}
  </Flex>
</Flex>
```

El `Flex` de `heatmapSidebarStyle` deja de estar detrás de `heatmapEnabled ? ... : null` — se monta
siempre para alojar `AssetLegend`; `HeatmapFilters`/`HeatmapLegend` mantienen su propio condicional
interno, sin cambio de comportamiento para ellos (CA-07 de
[10-maps-create.md](./10-maps-create.md) sigue cumplido: la leyenda del heatmap sigue sin verse si
el heatmap está apagado).

## Fuera de alcance

- Leyenda para el color de los incidentes independientes (`IncidentMarkersLayer`) — ya cubierta por
  `HeatmapLegend` porque comparten paleta (`INCIDENT_STATUS_COLORS`); no hace falta una leyenda
  nueva ahí.
- Toggle para ocultar `AssetLegend` — siempre visible, igual que los propios marcadores de activos
  (no tiene sentido ocultar la leyenda de algo que siempre está en pantalla).
- Cambios a `ASSET_MARKER_COLORS`/paleta de activos — sin cambios de color, solo se documenta.

## Criterios de aceptación

- **CA-01:** `AssetLegend` renderiza 4 filas, una por `AssetStatus`, cada una con su color exacto de
  `ASSET_MARKER_COLORS` y su label (`OK`, `Completo`, `Dañado`, `Fuera de servicio`).
- **CA-02:** `AssetLegend` es visible tanto con `heatmapEnabled: true` como `false` (no depende del
  toggle del heatmap).
- **CA-03:** Con el heatmap apagado, `HeatmapLegend`/`HeatmapFilters` siguen sin renderizarse (sin
  regresión sobre CA-07 de `10-maps-create.md`).
- **CA-04:** `AssetLegend` no importa nada de `features/assets` (regla de dependencia,
  `architecture.md`) — únicamente `features/map/utils/assetMarkerColor`, `shared/types/domain.types`
  y `@radix-ui/themes`.

## Plan de tests

- `assetMarkerColor.test.ts`: agrega caso para `ASSET_STATUS_LEGEND_LABELS` (cubre las 4 claves con
  el texto esperado).
- `AssetLegend.test.tsx` (nuevo, mismo patrón que `HeatmapLegend.test.tsx`): renderiza y verifica los
  4 textos de label presentes.
- `MapPage.test.tsx`: nuevo caso — con `heatmapEnabled: true` y luego con `false` (toggle de
  checkbox), `asset-legend` sigue presente en ambos, mientras que `heatmap-legend`/`heatmap-filters`
  solo aparecen en el primero (ya cubierto por el test existente "hides the heatmap legend/filters
  when the heatmap is toggled off", se extiende para afirmar también la presencia de `asset-legend`).
- Cobertura ≥ 80% en los archivos nuevos/modificados.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `format:check` sin errores.
2. `pnpm --filter client test` — cobertura ≥ 80%.
3. Revisión manual: `AssetLegend` no importa nada de `features/assets`.

## Estado de implementación

- ✅ `client/src/features/map/utils/assetMarkerColor.ts` — `ASSET_STATUS_LEGEND_LABELS` agregado.
- ✅ `client/src/features/map/utils/assetMarkerColor.test.ts` — caso para las labels.
- ✅ `client/src/features/map/components/mapPage.styles.ts` — `heatmapLegendSwatchStyle` renombrado
  a `legendSwatchStyle`.
- ✅ `client/src/features/map/components/HeatmapLegend.tsx` — actualiza el import renombrado.
- ✅ `client/src/features/map/components/AssetLegend.tsx` — nuevo.
- ✅ `client/src/features/map/components/AssetLegend.test.tsx` — nuevo.
- ✅ `client/src/features/map/pages/MapPage.tsx` — `AssetLegend` montado siempre en el sidebar.
- ✅ `client/src/features/map/pages/MapPage.test.tsx` — caso nuevo (asset-legend visible con y sin
  heatmap).
