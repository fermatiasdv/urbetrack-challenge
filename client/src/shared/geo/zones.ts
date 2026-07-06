import type { BoundingBox, SupportedZone } from '../types/domain.types'

/**
 * Bounding boxes for the 5 geographically supported zones. Rectangular and
 * mutually disjoint by construction (verified in `zones.test.ts`), approximating
 * each neighborhood's real position within `BA_BOUNDS` (`api/src/utils/geo.ts`).
 * This is the single source of truth for zone geometry — see
 * docs/specs/geo-zone-derivation.md (MAP-00) for the rationale and the margins
 * kept between adjacent zones.
 */
export const ZONES: Record<SupportedZone, BoundingBox> = {
  MICROCENTRO: { minLat: -34.612, maxLat: -34.6, minLng: -58.383, maxLng: -58.368 },
  RECOLETA: { minLat: -34.596, maxLat: -34.585, minLng: -58.4, maxLng: -58.385 },
  PALERMO: { minLat: -34.584, maxLat: -34.565, minLng: -58.43, maxLng: -58.4 },
  BELGRANO: { minLat: -34.564, maxLat: -34.545, minLng: -58.465, maxLng: -58.435 },
  CABALLITO: { minLat: -34.63, maxLat: -34.615, minLng: -58.45, maxLng: -58.43 }
}
