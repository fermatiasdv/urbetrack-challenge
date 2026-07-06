import type { IncidentStatus } from '../../../shared/types/domain.types'

/**
 * Literal hex colors for incident status, shared by `HeatmapLegend`,
 * `IncidentMarkersLayer` (independent incident markers, colored the same way
 * as the heatmap so both readings agree) and `HeatmapLayer` (per-status
 * gradient). Palette confirmed in docs/verified-scope.md §10.7 /
 * docs/feature/10-maps-create.md: REPORTED azul, IN_PROGRESS amarillo,
 * RESOLVED verde.
 */
export const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  REPORTED: '#3b82f6',
  IN_PROGRESS: '#eab308',
  RESOLVED: '#22c55e'
}

export const INCIDENT_STATUS_LEGEND_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Reportado',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto'
}
