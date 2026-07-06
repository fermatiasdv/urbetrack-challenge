import { z } from 'zod'

/**
 * The 5 geographically supported zones (docs/specs/geo-zone-derivation.md,
 * `SupportedZone`). Used to validate `MapStore.selectedZone` and any future
 * zone-selection UI, kept in sync by hand with `SupportedZone` in
 * `shared/types/domain.types.ts` (no runtime dependency between the two —
 * this schema does not replace that type, it validates values against it).
 */
export const ZoneSchema = z.enum(['MICROCENTRO', 'PALERMO', 'RECOLETA', 'BELGRANO', 'CABALLITO'])
