import './zod-setup'

import { z } from 'zod'
import { assetSchema } from '../schemas/asset.schema'
import { zoneSchema } from '../schemas/zone.schema'
import { incidentSchema } from '../schemas/incident.schema'
import { vehicleSchema } from '../schemas/vehicle.schema'

// Variantes "de respuesta" de los schemas de validación existentes.
// No modifican los schemas originales: solo agregan los campos que genera
// el backend (`id`, `createdAt`) y metadata de OpenAPI (nombre + ejemplos).

export const assetResponseSchema = assetSchema
  .extend({
    id: z.string().openapi({ example: '1719123456789' })
  })
  .openapi('Asset')

export const zoneResponseSchema = zoneSchema
  .extend({
    id: z.string().openapi({ example: '1' })
  })
  .openapi('Zone')

export const incidentResponseSchema = incidentSchema
  .extend({
    id: z.string().openapi({ example: '1' }),
    createdAt: z.string().openapi({ example: '2024-01-15T10:30:00Z' })
  })
  .openapi('Incident')

export const vehicleResponseSchema = vehicleSchema
  .extend({
    id: z.string().openapi({ example: '1' })
  })
  .openapi('Vehicle')

export const notFoundErrorSchema = z
  .object({
    message: z.string().openapi({ example: 'Zone not found' })
  })
  .openapi('NotFoundError')

export const validationErrorSchema = z
  .object({
    issues: z.array(z.any()).openapi({ example: [] }),
    name: z.literal('ZodError')
  })
  .openapi('ValidationError')
