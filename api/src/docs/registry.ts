import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { assetSchema } from '../schemas/asset.schema'
import { incidentSchema } from '../schemas/incident.schema'
import { vehicleSchema } from '../schemas/vehicle.schema'
import {
  assetResponseSchema,
  zoneResponseSchema,
  incidentResponseSchema,
  vehicleResponseSchema,
  notFoundErrorSchema,
  validationErrorSchema
} from './schemas'

export const registry = new OpenAPIRegistry()

const jsonContent = <T extends z.ZodTypeAny>(schema: T) => ({
  content: {
    'application/json': { schema }
  }
})

// ---- Assets ----

registry.registerPath({
  method: 'get',
  path: '/assets',
  tags: ['Assets'],
  summary: 'Listar assets urbanos',
  description: 'Lista assets urbanos (tachos, contenedores, bancos), filtrable por status y type.',
  request: {
    query: z.object({
      status: z.enum(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE']).optional(),
      type: z.enum(['BIN', 'CONTAINER', 'BENCH']).optional()
    })
  },
  responses: {
    200: { description: 'Lista de assets', ...jsonContent(z.array(assetResponseSchema)) }
  }
})

registry.registerPath({
  method: 'post',
  path: '/assets',
  tags: ['Assets'],
  summary: 'Crear un asset urbano',
  request: {
    body: { ...jsonContent(assetSchema) }
  },
  responses: {
    201: { description: 'Asset creado', ...jsonContent(assetResponseSchema) },
    400: { description: 'Validación fallida', ...jsonContent(validationErrorSchema) }
  }
})

// ---- Zones ----

registry.registerPath({
  method: 'get',
  path: '/zones',
  tags: ['Zones'],
  summary: 'Listar zonas',
  description: 'Lista todas las zonas disponibles (datos fijos de referencia).',
  responses: {
    200: { description: 'Lista de zonas', ...jsonContent(z.array(zoneResponseSchema)) }
  }
})

registry.registerPath({
  method: 'get',
  path: '/zones/{id}',
  tags: ['Zones'],
  summary: 'Obtener una zona por id',
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) })
  },
  responses: {
    200: { description: 'Zona encontrada', ...jsonContent(zoneResponseSchema) },
    404: { description: 'Zona no encontrada', ...jsonContent(notFoundErrorSchema) }
  }
})

// ---- Incidents ----

registry.registerPath({
  method: 'get',
  path: '/incidents',
  tags: ['Incidents'],
  summary: 'Listar incidentes',
  description: 'Lista incidentes, filtrable por status, type y zoneId.',
  request: {
    query: z.object({
      status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED']).optional(),
      type: z.enum(['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']).optional(),
      zoneId: z.string().optional()
    })
  },
  responses: {
    200: { description: 'Lista de incidentes', ...jsonContent(z.array(incidentResponseSchema)) }
  }
})

registry.registerPath({
  method: 'get',
  path: '/incidents/{id}',
  tags: ['Incidents'],
  summary: 'Obtener un incidente por id',
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) })
  },
  responses: {
    200: { description: 'Incidente encontrado', ...jsonContent(incidentResponseSchema) },
    404: { description: 'Incidente no encontrado', ...jsonContent(notFoundErrorSchema) }
  }
})

registry.registerPath({
  method: 'post',
  path: '/incidents',
  tags: ['Incidents'],
  summary: 'Crear un incidente',
  request: {
    body: { ...jsonContent(incidentSchema) }
  },
  responses: {
    201: { description: 'Incidente creado', ...jsonContent(incidentResponseSchema) },
    400: { description: 'Validación fallida', ...jsonContent(validationErrorSchema) }
  }
})

// ---- Vehicles ----

registry.registerPath({
  method: 'get',
  path: '/vehicles',
  tags: ['Vehicles'],
  summary: 'Listar vehículos',
  description: 'Lista vehículos, filtrable por status, type y zoneId.',
  request: {
    query: z.object({
      status: z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']).optional(),
      type: z.enum(['TRUCK', 'VAN', 'PICKUP']).optional(),
      zoneId: z.string().optional()
    })
  },
  responses: {
    200: { description: 'Lista de vehículos', ...jsonContent(z.array(vehicleResponseSchema)) }
  }
})

registry.registerPath({
  method: 'get',
  path: '/vehicles/{id}',
  tags: ['Vehicles'],
  summary: 'Obtener un vehículo por id',
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) })
  },
  responses: {
    200: { description: 'Vehículo encontrado', ...jsonContent(vehicleResponseSchema) },
    404: { description: 'Vehículo no encontrado', ...jsonContent(notFoundErrorSchema) }
  }
})

registry.registerPath({
  method: 'post',
  path: '/vehicles',
  tags: ['Vehicles'],
  summary: 'Crear un vehículo',
  request: {
    body: { ...jsonContent(vehicleSchema) }
  },
  responses: {
    201: { description: 'Vehículo creado', ...jsonContent(vehicleResponseSchema) },
    400: { description: 'Validación fallida', ...jsonContent(validationErrorSchema) }
  }
})
