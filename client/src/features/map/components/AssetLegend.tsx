import type { JSX, ReactNode } from 'react'
import { ASSET_STATUS_LEGEND_LABELS } from '../utils/assetMarkerColor'
import type { AssetStatus } from '../../../shared/types/domain.types'
import {
  colors,
  dot,
  legend,
  legendItem,
  section,
  sectionHeader,
  sectionHeaderTextGroup,
  subtitle,
  title
} from './mapSidebarPanel.styles'

const STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

/**
 * Dedicated dot color per status for this legend (docs/specs/fix-map-sidebar-panel-style.md):
 * uses the sidebar's own `colors` palette instead of `assetMarkerColor` (which colors the actual
 * map pins — kept separate on purpose, see the spec's "Fuera de alcance").
 */
const LEGEND_DOT_COLOR: Record<AssetStatus, string> = {
  OK: colors.success,
  FULL: colors.danger,
  DAMAGED: colors.warning,
  OUT_OF_SERVICE: colors.inactive
}

export interface AssetLegendProps {
  /**
   * Rendered inside the same "Activos" section box, below the legend — used by `MapPage` to nest
   * `HeatmapFilters`/`AssetHeatmapFilters` there when the heatmap is enabled (per the visual
   * hierarchy requested in docs/specs/fix-map-sidebar-panel-style.md).
   */
  children?: ReactNode
}

/**
 * "Activos" section of the map sidebar panel (docs/feature/13-asset-legend.md, restyled per
 * docs/specs/fix-map-sidebar-panel-style.md): always visible next to the map, regardless of the
 * heatmap toggle, since asset markers render either way.
 */
export function AssetLegend({ children }: AssetLegendProps): JSX.Element {
  return (
    <div style={section} data-testid="asset-legend">
      <div style={sectionHeader}>
        <div style={sectionHeaderTextGroup}>
          <span style={title}>Activos</span>
          <span style={subtitle}>Filtra los activos visibles</span>
        </div>
      </div>
      <div style={legend}>
        {STATUSES.map((status) => (
          <div key={status} style={legendItem}>
            <span style={dot(LEGEND_DOT_COLOR[status])} />
            <span>{ASSET_STATUS_LEGEND_LABELS[status]}</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
