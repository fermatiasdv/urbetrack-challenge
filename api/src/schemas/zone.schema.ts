import { z } from 'zod'

export const zoneSchema = z.object({
  name: z.string()
})
