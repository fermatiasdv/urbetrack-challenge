import type {
  Asset,
  AssetStatus,
  AssetType,
  Incident,
  IncidentStatus,
  IncidentType,
  SupportedZone
} from '../../shared/types/domain.types'

/**
 * Feature-local derived types for `map` (docs/feature/10-maps-create.md).
 * Distinct from the raw backend-mirrored `Asset`/`Incident` in
 * `shared/types/domain.types.ts`: these carry data derived exclusively on
 * the frontend (zone by coordinates, incident↔asset association) that never
 * comes from the backend and never should be confused with `zoneId`
 * (docs/verified-scope.md §10.5).
 */
export interface GeoTaggedAsset extends Asset {
  derivedZone: SupportedZone
}

export interface GeoTaggedIncident extends Incident {
  derivedZone: SupportedZone
}

/**
 * An incident after running the association pass (`associateIncident.ts`).
 * `associatedAssetId` is `null` when no compatible asset was found within
 * 100m (docs/feature/10-maps-create.md, "Incidentes — asociación a activo").
 */
export interface AssociatedIncident extends GeoTaggedIncident {
  associatedAssetId: string | null
}

export interface HeatmapFilters {
  statuses: IncidentStatus[]
  types: IncidentType[]
}

export interface HeatmapPoint {
  lat: number
  lng: number
  status: IncidentStatus
}

/**
 * Filters for the asset heat layers (docs/feature/14-assets-in-heatmap.md).
 * Kept parallel to `HeatmapFilters` (incidents) instead of merged, so the
 * incident filter state/schema/tests stay untouched.
 */
export interface AssetHeatmapFilters {
  statuses: AssetStatus[]
  types: AssetType[]
}

export interface AssetHeatmapPoint {
  lat: number
  lng: number
  status: AssetStatus
}
