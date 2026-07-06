import type { AssetStatus } from '../../../shared/types/domain.types'

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

export function assetMarkerColor(status: AssetStatus): string {
  return ASSET_MARKER_COLORS[status]
}
