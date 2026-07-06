import { z } from 'zod'

/**
 * Validates the shape of `MapStore.heatmapFilters`
 * (docs/feature/10-maps-create.md, "Validación (zod)"). Not used to validate
 * network responses — `GET /assets`/`GET /incidents` are not runtime-validated
 * anywhere in this project, same criterion as `assets`/`incidents` — this
 * schema only guards the filter state shape (useful for tests and for a
 * future URL-persisted filter, out of scope today).
 */
export const HeatmapFilterSchema = z.object({
  statuses: z.array(z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED'])),
  types: z.array(z.enum(['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']))
})

export type HeatmapFilterSchemaValues = z.infer<typeof HeatmapFilterSchema>
