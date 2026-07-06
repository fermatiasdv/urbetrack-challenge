import type { AssetType } from '../../../shared/types/domain.types'
import type { AssociatedIncident, GeoTaggedAsset, GeoTaggedIncident } from '../types'
import { distanceMeters } from './distanceMeters'

const ASSOCIABLE_ASSET_TYPES: AssetType[] = ['BIN', 'CONTAINER']
const MAX_ASSOCIATION_DISTANCE_METERS = 100

/**
 * Associates `OVERFLOW` incidents to the nearest compatible asset (`BIN` or
 * `CONTAINER`, never `BENCH`) within a 100m radius
 * (docs/feature/10-maps-create.md, "Incidentes — asociación a activo";
 * docs/verified-scope.md §4). When a match is found, the incident adopts the
 * asset's coordinates. Incidents that are not `OVERFLOW`, or that have no
 * compatible asset within range, keep their original coordinates and get
 * `associatedAssetId: null` — they remain visible as independent incidents
 * (CA-09).
 */
export function associateIncidents(
  incidents: GeoTaggedIncident[],
  assets: GeoTaggedAsset[]
): AssociatedIncident[] {
  const candidateAssets = assets.filter((asset) => ASSOCIABLE_ASSET_TYPES.includes(asset.type))

  return incidents.map((incident) => associateOne(incident, candidateAssets))
}

function associateOne(
  incident: GeoTaggedIncident,
  candidateAssets: GeoTaggedAsset[]
): AssociatedIncident {
  if (incident.type !== 'OVERFLOW' || candidateAssets.length === 0) {
    return { ...incident, associatedAssetId: null }
  }

  const nearest = findNearestAsset(incident, candidateAssets)

  if (nearest === null) {
    return { ...incident, associatedAssetId: null }
  }

  return {
    ...incident,
    lat: nearest.asset.lat,
    lng: nearest.asset.lng,
    associatedAssetId: nearest.asset.id
  }
}

function findNearestAsset(
  incident: GeoTaggedIncident,
  candidateAssets: GeoTaggedAsset[]
): { asset: GeoTaggedAsset; distance: number } | null {
  let closest: { asset: GeoTaggedAsset; distance: number } | null = null

  for (const asset of candidateAssets) {
    const distance = distanceMeters(incident, asset)

    if (distance > MAX_ASSOCIATION_DISTANCE_METERS) {
      continue
    }

    if (closest === null || distance < closest.distance) {
      closest = { asset, distance }
    }
  }

  return closest
}
