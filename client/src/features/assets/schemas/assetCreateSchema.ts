import { z } from 'zod'

/**
 * Validates the "Agregar Activo" create form
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3).
 * `status` es elegible por el usuario (decisión 2026-07-06), igual que en
 * Vehículos.
 */
export const assetCreateFormSchema = z.object({
  type: z.enum(['BIN', 'CONTAINER', 'BENCH'], {
    errorMap: () => ({ message: 'Seleccioná un tipo de activo' })
  }),
  status: z.enum(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE'], {
    errorMap: () => ({ message: 'Seleccioná un estado' })
  }),
  address: z.string().trim().min(1, 'La dirección es obligatoria'),
  zoneId: z.string().min(1, 'Seleccioná una zona'),
  lat: z.coerce.number({ invalid_type_error: 'Latitud inválida' }),
  lng: z.coerce.number({ invalid_type_error: 'Longitud inválida' })
})

export type AssetCreateFormValues = z.infer<typeof assetCreateFormSchema>
