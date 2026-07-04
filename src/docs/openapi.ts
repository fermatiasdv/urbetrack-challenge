import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'

const generator = new OpenApiGeneratorV3(registry.definitions)

// Nota: mantener sincronizado con la versión de `package.json`.
export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Urban Hygiene API',
    version: '1.0.0',
    description:
      'API REST mock que sirve de fuente de datos al frontend mientras no exista un backend real. ' +
      'Los datos viven en memoria y se reinician con cada reinicio del servidor.'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }]
})
