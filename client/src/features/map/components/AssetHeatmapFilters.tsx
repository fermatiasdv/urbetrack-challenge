import type { JSX } from 'react'
import { Flex } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import { HeatmapFilterGroup } from './HeatmapFilterGroup'
import { ASSET_STATUS_LEGEND_LABELS, ASSET_TYPE_LEGEND_LABELS } from '../utils/assetMarkerColor'
import { filters } from './mapSidebarPanel.styles'
import type { AssetStatus, AssetType } from '../../../shared/types/domain.types'

const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: 'OK', label: ASSET_STATUS_LEGEND_LABELS.OK },
  { value: 'FULL', label: ASSET_STATUS_LEGEND_LABELS.FULL },
  { value: 'DAMAGED', label: ASSET_STATUS_LEGEND_LABELS.DAMAGED },
  { value: 'OUT_OF_SERVICE', label: ASSET_STATUS_LEGEND_LABELS.OUT_OF_SERVICE }
]

const TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'CONTAINER', label: ASSET_TYPE_LEGEND_LABELS.CONTAINER },
  { value: 'BIN', label: ASSET_TYPE_LEGEND_LABELS.BIN },
  { value: 'BENCH', label: ASSET_TYPE_LEGEND_LABELS.BENCH }
]

/**
 * Heatmap status/type filters for assets (docs/feature/14-assets-in-heatmap.md),
 * mirroring `HeatmapFilters` (incidentes) via the shared `HeatmapFilterGroup`.
 * Independent from the incident filters (one/several/all per filter, AND).
 */
export function AssetHeatmapFilters(): JSX.Element {
  const assetHeatmapFilters = useMapStore((state) => state.assetHeatmapFilters)
  const setAssetHeatmapFilters = useMapStore((state) => state.setAssetHeatmapFilters)

  return (
    <Flex style={filters} data-testid="asset-heatmap-filters">
      <HeatmapFilterGroup
        label="Estado de activo"
        triggerAriaLabel="Estado de activo del heatmap"
        options={STATUS_OPTIONS}
        selected={assetHeatmapFilters.statuses}
        onChange={(statuses) => setAssetHeatmapFilters({ ...assetHeatmapFilters, statuses })}
      />
      <HeatmapFilterGroup
        label="Tipo de activo"
        triggerAriaLabel="Tipo de activo del heatmap"
        options={TYPE_OPTIONS}
        selected={assetHeatmapFilters.types}
        onChange={(types) => setAssetHeatmapFilters({ ...assetHeatmapFilters, types })}
      />
    </Flex>
  )
}
