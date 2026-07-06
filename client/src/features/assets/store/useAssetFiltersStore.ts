import { create } from 'zustand'
import type { AssetStatusFilter, AssetTypeFilter } from '../constants/assetFilterOptions'
import { DEFAULT_ASSET_FILTERS, type AssetFilters } from '../utils/assetFilters'

export interface AssetFiltersState extends AssetFilters {
  setType: (type: AssetTypeFilter) => void
  setStatus: (status: AssetStatusFilter) => void
  setZoneIds: (zoneIds: string[]) => void
  reset: () => void
}

/**
 * Holds the current value of the 3 asset filters (Tipo/Estado/Zona,
 * docs/verified-scope.md §6.2 "Tab Activos" — no search field, unlike
 * vehicles). Lives in `features/assets/` (not `app/store/`) because only
 * this feature reads it, same criterion as `useVehicleFiltersStore`.
 */
export const useAssetFiltersStore = create<AssetFiltersState>((set) => ({
  ...DEFAULT_ASSET_FILTERS,
  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  setZoneIds: (zoneIds) => set({ zoneIds }),
  reset: () => set(DEFAULT_ASSET_FILTERS)
}))
