import type {
  AssetHeatmapFilters,
  AssetHeatmapPoint,
  AssociatedIncident,
  GeoTaggedAsset,
  HeatmapFilters,
  HeatmapPoint
} from '../types'

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

/**
 * Projects the zone-filtered assets into heatmap points, filtered by the
 * selected asset statuses/types (docs/feature/14-assets-in-heatmap.md). Same
 * AND semantics as `buildHeatmapData`: selecting none of a dimension yields an
 * empty result. `status` determines the color of the `leaflet.heat` layer.
 */
export function buildAssetHeatmapData(
  assets: GeoTaggedAsset[],
  filters: AssetHeatmapFilters
): AssetHeatmapPoint[] {
  return assets
    .filter(
      (asset) => filters.statuses.includes(asset.status) && filters.types.includes(asset.type)
    )
    .map((asset) => ({ lat: asset.lat, lng: asset.lng, status: asset.status }))
}
