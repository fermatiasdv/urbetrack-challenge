import { z } from 'zod'

export const vehicleSchema = z.object({
  plate: z.string(),
  type: z.enum(['TRUCK', 'VAN', 'PICKUP']),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']).default('ACTIVE'),
  capacity: z.number().positive(),
  zoneId: z.string()
})
