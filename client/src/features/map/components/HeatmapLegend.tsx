import type { JSX } from 'react'
import { INCIDENT_STATUS_LEGEND_LABELS } from '../constants/incidentStatusColors'
import type { IncidentStatus } from '../../../shared/types/domain.types'
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

const INCIDENT_STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']

/**
 * Dedicated dot color per status for this legend (docs/specs/fix-map-sidebar-panel-style.md):
 * uses the sidebar's own `colors` palette instead of `INCIDENT_STATUS_COLORS` (which colors the
 * actual heatmap gradient/markers — kept separate on purpose, see the spec's "Fuera de alcance").
 */
const LEGEND_DOT_COLOR: Record<IncidentStatus, string> = {
  REPORTED: colors.reported,
  IN_PROGRESS: colors.progress,
  RESOLVED: colors.solved
}

/**
 * "Mapa de calor" section of the map sidebar panel (docs/specs/fix-map-sidebar-panel-style.md),
 * visible only while the heatmap is enabled (CA-07). Shows only incident statuses now — asset
 * statuses used to be duplicated here (docs/feature/14-assets-in-heatmap.md) but already render,
 * always, in the "Activos" section (`AssetLegend`) above.
 */
export function HeatmapLegend(): JSX.Element {
  return (
    <div style={section} data-testid="heatmap-legend">
      <div style={sectionHeader}>
        <div style={sectionHeaderTextGroup}>
          <span style={title}>Mapa de calor</span>
          <span style={subtitle}>Incidentes resaltados</span>
        </div>
      </div>
      <div style={legend}>
        {INCIDENT_STATUSES.map((status) => (
          <div key={status} style={legendItem}>
            <span style={dot(LEGEND_DOT_COLOR[status])} />
            <span>{INCIDENT_STATUS_LEGEND_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
