import { z } from 'zod'

/**
 * Validates the "Agregar Incidente" create form
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3).
 * `status` is fixed to `REPORTED` by the backend default (`incident.schema.ts`
 * in `api/`), not part of this form. `zoneId` has no `'ALL'` option here
 * (unlike the filter bar): the user must pick one of the 5 real zones.
 */
export const incidentCreateFormSchema = z.object({
  type: z.enum(['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER'], {
    errorMap: () => ({ message: 'Seleccioná un tipo de incidente' })
  }),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  zoneId: z.string().min(1, 'Seleccioná una zona'),
  lat: z.coerce.number({ invalid_type_error: 'Latitud inválida' }),
  lng: z.coerce.number({ invalid_type_error: 'Longitud inválida' })
})

export type IncidentCreateFormValues = z.infer<typeof incidentCreateFormSchema>
