import { z } from 'zod'
import { PLATE_REGEX } from './vehicleModalSchema'

/**
 * Validates the "Agregar Vehículo" create form
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3).
 * `status` is elegible por el usuario (decisión 2026-07-06, a diferencia de
 * Incidentes que fija `REPORTED` por defecto) — el vehículo puede darse de
 * alta ya en cualquiera de sus 3 estados.
 */
export const vehicleCreateFormSchema = z.object({
  plate: z.string().trim().toUpperCase().regex(PLATE_REGEX, 'Formato de placa inválido'),
  type: z.enum(['TRUCK', 'VAN', 'PICKUP'], {
    errorMap: () => ({ message: 'Seleccioná un tipo de vehículo' })
  }),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacidad inválida' })
    .positive('La capacidad debe ser mayor a 0'),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'], {
    errorMap: () => ({ message: 'Seleccioná un estado' })
  }),
  zoneId: z.string().min(1, 'Seleccioná una zona')
})

export type VehicleCreateFormValues = z.infer<typeof vehicleCreateFormSchema>
