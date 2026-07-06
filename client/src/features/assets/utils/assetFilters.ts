/**
 * Pure filtering helpers for the assets filter bar (docs/feature/07-assets-page.md, "Decisiones
 * propuestas" #6). No React/store dependencies — unit-testable in isolation, same pattern as
 * `features/vehicles/utils/vehicleFilters.ts`. No capacity predicate (doesn't apply to assets) and
 * no text search (docs/verified-scope.md §6.2 doesn't request one for the "Activos" tab).
 */
import type { AssetStatusFilter, AssetTypeFilter } from '../constants/assetFilterOptions'
import type { Asset } from '../../../shared/types/domain.types'

export interface AssetFilters {
  type: AssetTypeFilter
  status: AssetStatusFilter
  zoneIds: string[]
}

export const DEFAULT_ASSET_FILTERS: AssetFilters = {
  type: 'ALL',
  status: 'ALL',
  zoneIds: []
}

/**
 * Applies the 3 filters with AND semantics. `type`/`status` compare exact equality unless
 * `'ALL'`; `zoneIds` matches every asset when empty ("todas las zonas").
 */
export function filterAssets(assets: Asset[], filters: AssetFilters): Asset[] {
  return assets.filter((asset) => {
    if (filters.type !== 'ALL' && asset.type !== filters.type) {
      return false
    }
    if (filters.status !== 'ALL' && asset.status !== filters.status) {
      return false
    }
    if (filters.zoneIds.length > 0 && !filters.zoneIds.includes(asset.zoneId)) {
      return false
    }
    return true
  })
}
