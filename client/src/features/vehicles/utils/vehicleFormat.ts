/**
 * Display-formatting helpers for `VehiclesTable`
 * (docs/feature/03-vehicles-table.md, "Decisiones propuestas" #1).
 * Pure functions, no React/store dependencies — unit-testable in isolation.
 */
import type { VehicleStatus, VehicleType } from '../../../shared/types/domain.types'

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TRUCK: 'Camión',
  VAN: 'Furgoneta',
  PICKUP: 'Camioneta'
}

const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  ACTIVE: 'Activo',
  MAINTENANCE: 'En mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio'
}

const CAPACITY_FORMATTER = new Intl.NumberFormat('es-AR')

export function vehicleTypeLabel(type: VehicleType): string {
  return VEHICLE_TYPE_LABELS[type]
}

export function vehicleStatusLabel(status: VehicleStatus): string {
  return VEHICLE_STATUS_LABELS[status]
}

/** e.g. `5500` -> `"5.500 KG"` (docs/feature/03-vehicles-table.md, Gap 5). */
export function formatCapacity(capacity: number): string {
  return `${CAPACITY_FORMATTER.format(capacity)} KG`
}

/**
 * Resolves the zone display name for a `zoneId`, falling back to the raw id
 * while zones are loading.
 */
export function zoneNameFor(zoneId: string, zonesById: Map<string, string>): string {
  return zonesById.get(zoneId) ?? zoneId
}
