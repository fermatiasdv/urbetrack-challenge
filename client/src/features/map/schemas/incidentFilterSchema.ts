import { HeatmapFilterSchema } from './heatmapFilterSchema'

/**
 * Kept as a separate export from `HeatmapFilterSchema`
 * (docs/feature/10-maps-create.md, "Validación (zod)") even though it
 * validates the same shape today: the heatmap filter and a general incident
 * filter are conceptually different concerns that happen to coincide right
 * now (both filter by `status`/`type`) — this avoids assuming they'll always
 * stay 100% interchangeable if one of them grows independently later (e.g. a
 * zone filter added only to one of the two).
 */
export const IncidentFilterSchema = HeatmapFilterSchema
