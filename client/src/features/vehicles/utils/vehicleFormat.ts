/**
 * Display-formatting helpers for `VehiclesTable`
 * (docs/feature/03-vehicles-table.md, "Decisiones propuestas" #1).
 * Pure functions, no React/store dependencies — unit-testable in isolation.
 */
import type { StatusCardColorRole } from '../../../shared/components/statusSummaryCard.styles'
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

/**
 * Maps each `VehicleStatus` to the generic `colorRole` consumed by the shared
 * `StatusBadge`/`StatusSummaryCard` (docs/feature/07-assets-page.md,
 * "Generalización a `shared/`"): `ACTIVE` -> success, `MAINTENANCE` -> tertiary
 * (warning), `OUT_OF_SERVICE` -> error — same mapping already established in
 * docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #5.
 */
const VEHICLE_STATUS_COLOR_ROLES: Record<VehicleStatus, StatusCardColorRole> = {
  ACTIVE: 'success',
  MAINTENANCE: 'tertiary',
  OUT_OF_SERVICE: 'error'
}

const CAPACITY_FORMATTER = new Intl.NumberFormat('es-AR')

export function vehicleTypeLabel(type: VehicleType): string {
  return VEHICLE_TYPE_LABELS[type]
}

export function vehicleStatusLabel(status: VehicleStatus): string {
  return VEHICLE_STATUS_LABELS[status]
}

export function vehicleStatusColorRole(status: VehicleStatus): StatusCardColorRole {
  return VEHICLE_STATUS_COLOR_ROLES[status]
}

/** e.g. `5500` -> `"5.500 KG"` (docs/feature/03-vehicles-table.md, Gap 5). */
export function formatCapacity(capacity: number): string {
  return `${CAPACITY_FORMATTER.format(capacity)} KG`
}
