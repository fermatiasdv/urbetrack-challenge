import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

// Debe ejecutarse una única vez, antes de que cualquier schema use `.openapi()`.
// Este módulo se importa (por su efecto secundario) al principio de `registry.ts`.
extendZodWithOpenApi(z)
