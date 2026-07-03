import { z } from 'zod'

export const assetSchema = z.object({
  type: z.enum(['BIN', 'CONTAINER', 'BENCH']),
  status: z.enum(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE']),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  zoneId: z.string()
})
