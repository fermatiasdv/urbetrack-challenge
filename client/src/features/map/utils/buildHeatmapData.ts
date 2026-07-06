import type { AssociatedIncident, HeatmapFilters, HeatmapPoint } from '../types'

/**
 * Projects the associated incidents into heatmap points, filtered by the
 * selected statuses/types (AND between both filters — one/several/all
 * selectable independently, docs/feature/10-maps-create.md CA-06).
 * Selecting none of a filter yields an empty result for that dimension
 * (nothing matches), matching the semantics of a multi-select filter with
 * nothing checked.
 */
export function buildHeatmapData(
  incidents: AssociatedIncident[],
  filters: HeatmapFilters
): HeatmapPoint[] {
  return incidents
    .filter(
      (incident) =>
        filters.statuses.includes(incident.status) && filters.types.includes(incident.type)
    )
    .map((incident) => ({ lat: incident.lat, lng: incident.lng, status: incident.status }))
}
