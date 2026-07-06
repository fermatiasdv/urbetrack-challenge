import { useMemo } from 'react'
import { useAssetsStore } from '../../../shared/services/assets/useAssetsStore'
import { useAssetFiltersStore } from '../store/useAssetFiltersStore'
import { filterAssets } from '../utils/assetFilters'
import type { Asset } from '../../../shared/types/domain.types'

/**
 * Derives the filtered asset list from `useAssetsStore` + `useAssetFiltersStore`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #4). `AssetsTable` reads from this hook
 * instead of `useAssetsStore` directly, same pattern as `useFilteredVehicles`.
 */
export function useFilteredAssets(): Asset[] {
  const assets = useAssetsStore((state) => state.assets)
  const type = useAssetFiltersStore((state) => state.type)
  const status = useAssetFiltersStore((state) => state.status)
  const zoneIds = useAssetFiltersStore((state) => state.zoneIds)

  return useMemo(
    () => filterAssets(assets, { type, status, zoneIds }),
    [assets, type, status, zoneIds]
  )
}
