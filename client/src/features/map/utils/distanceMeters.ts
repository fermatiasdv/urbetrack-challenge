/**
 * Great-circle distance between two lat/lng points, in meters, via the
 * Haversine formula. Used by `associateIncident.ts` to find the nearest
 * compatible asset within the 100m radius (docs/feature/10-maps-create.md,
 * "Reglas de negocio" → "Incidentes — asociación a activo").
 */
export interface GeoPoint {
  lat: number
  lng: number
}

const EARTH_RADIUS_METERS = 6371000

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const deltaLat = toRadians(b.lat - a.lat)
  const deltaLng = toRadians(b.lng - a.lng)

  const sinLat = Math.sin(deltaLat / 2)
  const sinLng = Math.sin(deltaLng / 2)

  const haversine =
    sinLat * sinLat + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))

  return EARTH_RADIUS_METERS * angularDistance
}
