import { z } from 'zod'

/**
 * Validates the only editable field of the incident modal in "edit" mode:
 * `status` (docs/feature/08-incidents-page.md, "Decisiones propuestas" #7).
 * Mirrors `assetModalFormSchema.ts`.
 */
export const incidentModalFormSchema = z.object({
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED'])
})

export type IncidentModalFormValues = z.infer<typeof incidentModalFormSchema>
