import type { AssetStatus, AssetType } from '../../../shared/types/domain.types'

/**
 * Literal hex colors for asset markers on the Leaflet map, per
 * docs/verified-scope.md §3.1/§10.2 and docs/feature/10-maps-create.md
 * ("Reglas de negocio" → "Activos — color de marcador"): OK verde, FULL
 * rojo, DAMAGED naranja, OUT_OF_SERVICE negro.
 *
 * Deliberately separate from `features/assets/utils/assetFormat.ts` →
 * `assetStatusColorRole`, which maps to Radix semantic roles
 * (`'success' | 'error' | 'tertiary' | 'neutral'`) for badges — Leaflet
 * marker icons need a literal CSS color, not a Radix role, and
 * `OUT_OF_SERVICE` needs to render as actual black here (the Radix role
 * mapping approximates it to `'neutral'` because Radix has no dedicated
 * "black" role).
 */
const ASSET_MARKER_COLORS: Record<AssetStatus, string> = {
  OK: '#22c55e',
  FULL: '#ef4444',
  DAMAGED: '#f97316',
  OUT_OF_SERVICE: '#000000'
}

/**
 * Labels for `AssetLegend` (docs/feature/13-asset-legend.md). Same wording as
 * `assetStatusLabel` (`features/assets/utils/assetFormat.ts`), declared
 * locally instead of imported — `map` doesn't import from `assets`
 * (architecture.md, "Regla de dependencia"), same precedent already set by
 * `ASSET_MARKER_COLORS` above vs. `assetStatusColorRole`.
 */
export const ASSET_STATUS_LEGEND_LABELS: Record<AssetStatus, string> = {
  OK: 'OK',
  FULL: 'Completo',
  DAMAGED: 'Dañado',
  OUT_OF_SERVICE: 'Fuera de servicio'
}

/**
 * Labels por tipo de activo para el filtro de activos del heatmap
 * (docs/feature/14-assets-in-heatmap.md, `AssetHeatmapFilters`). Mismo
 * vocabulario que `assetTypeLabel` (`features/assets/utils/assetFormat.ts`),
 * declarado localmente por la regla de dependencia entre features
 * (architecture.md), mismo precedente que `ASSET_STATUS_LEGEND_LABELS`.
 */
export const ASSET_TYPE_LEGEND_LABELS: Record<AssetType, string> = {
  CONTAINER: 'Contenedor',
  BIN: 'Cesto',
  BENCH: 'Banco'
}

export function assetMarkerColor(status: AssetStatus): string {
  return ASSET_MARKER_COLORS[status]
}

type AssetTooltipColor = 'green' | 'red' | 'orange' | 'gray'

/**
 * Radix Themes accent-color tokens matching `ASSET_MARKER_COLORS`, for use in
 * `<Text color="...">` (Radix doesn't accept arbitrary hex). `OUT_OF_SERVICE`
 * maps to `gray` — Radix has no dedicated "black" role, same precedent as
 * `assetStatusColorRole` in `features/assets/utils/assetFormat.ts` (`'neutral'`).
 * Used by `AssetTooltip` so the tooltip's status label/color always matches the
 * asset's own marker (docs/specs/fix-resolved-color-and-asset-tooltip-status.md).
 */
export const ASSET_STATUS_TOOLTIP_COLOR: Record<AssetStatus, AssetTooltipColor> = {
  OK: 'green',
  FULL: 'red',
  DAMAGED: 'orange',
  OUT_OF_SERVICE: 'gray'
}
