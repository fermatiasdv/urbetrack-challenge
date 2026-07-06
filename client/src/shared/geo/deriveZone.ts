import type { SupportedZone } from '../types/domain.types'
import { isPointInsideZone } from './isPointInsideZone'
import { roundCoordinates } from './roundCoordinates'
import { ZONES } from './zones'

/**
 * Derives a point's real zone exclusively from its coordinates, rounded to 4
 * decimals before evaluation (CA-06). Never reads `zoneId` (CA-05): the
 * backend's `zoneId` is assigned randomly in the seed and is not a reliable
 * location indicator (docs/verified-scope.md §10.5). Returns `null` when the
 * point falls outside all 5 supported zones (CA-04).
 */
export function deriveZone(lat: number, lng: number): SupportedZone | null {
  const rounded = roundCoordinates(lat, lng)

  const match = (Object.keys(ZONES) as SupportedZone[]).find((zone) =>
    isPointInsideZone(rounded.lat, rounded.lng, ZONES[zone])
  )

  return match ?? null
}
