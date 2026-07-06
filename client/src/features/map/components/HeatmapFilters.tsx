import type { JSX } from 'react'
import { Flex } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import { HeatmapFilterGroup } from './HeatmapFilterGroup'
import { filters } from './mapSidebarPanel.styles'
import type { IncidentStatus, IncidentType } from '../../../shared/types/domain.types'

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: 'REPORTED', label: 'Reportado' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'RESOLVED', label: 'Resuelto' }
]

const TYPE_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: 'OVERFLOW', label: 'Desbordamiento' },
  { value: 'DAMAGE', label: 'Daño' },
  { value: 'LITTERING', label: 'Basural' },
  { value: 'OTHER', label: 'Otro' }
]

/**
 * Heatmap status/type filters for incidents (docs/feature/10-maps-create.md,
 * "Heatmap"), allowing one/several/all values per filter independently
 * (CA-06). Delegates each filter to the shared `HeatmapFilterGroup`, the same
 * component `AssetHeatmapFilters` uses for assets
 * (docs/feature/14-assets-in-heatmap.md).
 */
export function HeatmapFilters(): JSX.Element {
  const heatmapFilters = useMapStore((state) => state.heatmapFilters)
  const setHeatmapFilters = useMapStore((state) => state.setHeatmapFilters)

  return (
    <Flex style={filters} data-testid="heatmap-filters">
      <HeatmapFilterGroup
        label="Estado"
        triggerAriaLabel="Estado del heatmap"
        options={STATUS_OPTIONS}
        selected={heatmapFilters.statuses}
        onChange={(statuses) => setHeatmapFilters({ ...heatmapFilters, statuses })}
      />
      <HeatmapFilterGroup
        label="Tipo"
        triggerAriaLabel="Tipo de incidente del heatmap"
        options={TYPE_OPTIONS}
        selected={heatmapFilters.types}
        onChange={(types) => setHeatmapFilters({ ...heatmapFilters, types })}
      />
    </Flex>
  )
}
