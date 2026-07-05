import { z } from 'zod'

export const incidentSchema = z.object({
  type: z.enum(['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']),
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED']).default('REPORTED'),
  description: z.string(),
  lat: z.number(),
  lng: z.number(),
  zoneId: z.string()
})
