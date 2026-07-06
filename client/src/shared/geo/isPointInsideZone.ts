import type { BoundingBox } from '../types/domain.types'

/**
 * Point-in-zone test against a rectangular `BoundingBox`, inclusive on all 4
 * edges. Does not round the input itself — callers (e.g. `deriveZone`) are
 * responsible for rounding beforehand (docs/specs/geo-zone-derivation.md).
 */
export function isPointInsideZone(lat: number, lng: number, zone: BoundingBox): boolean {
  return lat >= zone.minLat && lat <= zone.maxLat && lng >= zone.minLng && lng <= zone.maxLng
}
