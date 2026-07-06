import { z } from 'zod'

/**
 * Accepted plate formats (docs/verified-scope.md §7.1): three letters + three
 * digits (`AAA111`) or two letters + three digits + two letters (`AA111AA`).
 */
export const PLATE_REGEX = /^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/

/**
 * Validation for the vehicle modal's edit form (docs/feature/06-vehicles-modal.md,
 * "Decisiones propuestas" #3). Only the plate is editable
 * (docs/verified-scope.md §7.1), so it's the only field in this schema. The
 * message matches the one shown in the mockup
 * (docs/designs/05-vehicles-modal.md): "Formato de placa inválido".
 */
export const vehicleModalFormSchema = z.object({
  plate: z.string().trim().toUpperCase().regex(PLATE_REGEX, 'Formato de placa inválido')
})

export type VehicleModalFormValues = z.infer<typeof vehicleModalFormSchema>
