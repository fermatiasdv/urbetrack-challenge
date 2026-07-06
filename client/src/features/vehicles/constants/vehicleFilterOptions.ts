/**
 * Static filter option lists for `VehiclesFilterBar`
 * (docs/feature/04-vehicles-filtertable.md, "Decisiones propuestas" #3).
 *
 * `VEHICLE_TYPE_FILTER_OPTIONS` / `VEHICLE_STATUS_FILTER_OPTIONS` are derived from the real
 * `VehicleType`/`VehicleStatus` unions and reuse `vehicleTypeLabel`/`vehicleStatusLabel`
 * (`utils/vehicleFormat.ts`) for their labels, so they never drift from the rest of the UI if the
 * backend enum changes. `CAPACITY_FILTER_OPTIONS` has no backend equivalent (see Decisión 2 of the
 * spec): its 3 ranges are "hasta o igual a" the max capacity per vehicle type documented in
 * docs/verified-scope.md §2.2 (Pickup 1000 kg, Van 2000 kg, Truck 5000 kg). Zone options are
 * intentionally NOT here — they come from `useZonesQuery` (dynamic, backend-driven), not a static
 * constant.
 */
import type { VehicleStatus, VehicleType } from '../types/vehicle.types'
import { vehicleStatusLabel, vehicleTypeLabel } from '../utils/vehicleFormat'

export type VehicleTypeFilter = 'ALL' | VehicleType
export type VehicleStatusFilter = 'ALL' | VehicleStatus
export type CapacityFilter = 'ALL' | 'LTE_1000' | 'BETWEEN_1000_2000' | 'GT_2000'

interface FilterOption<TValue extends string> {
  value: TValue
  label: string
}

const VEHICLE_TYPES: VehicleType[] = ['TRUCK', 'VAN', 'PICKUP']
const VEHICLE_STATUSES: VehicleStatus[] = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']

export const VEHICLE_TYPE_FILTER_OPTIONS: FilterOption<VehicleTypeFilter>[] = [
  { value: 'ALL', label: 'Todos los tipos' },
  ...VEHICLE_TYPES.map((type) => ({ value: type, label: vehicleTypeLabel(type) }))
]

export const VEHICLE_STATUS_FILTER_OPTIONS: FilterOption<VehicleStatusFilter>[] = [
  { value: 'ALL', label: 'Todos los estados' },
  ...VEHICLE_STATUSES.map((status) => ({ value: status, label: vehicleStatusLabel(status) }))
]

export const CAPACITY_FILTER_OPTIONS: FilterOption<CapacityFilter>[] = [
  { value: 'ALL', label: 'Todas las capacidades' },
  { value: 'LTE_1000', label: 'Hasta 1.000 KG' },
  { value: 'BETWEEN_1000_2000', label: 'Entre 1.001 y 2.000 KG' },
  { value: 'GT_2000', label: 'Más de 2.000 KG' }
]
