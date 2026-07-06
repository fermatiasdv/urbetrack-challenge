/**
 * Pure filtering helpers for the vehicles filter bar
 * (docs/feature/04-vehicles-filtertable.md, "Decisiones propuestas" #2 y #5).
 * No React/store dependencies — unit-testable in isolation, same pattern as `vehicleFormat.ts`.
 */
import type {
  CapacityFilter,
  VehicleStatusFilter,
  VehicleTypeFilter
} from '../constants/vehicleFilterOptions'
import type { Vehicle } from '../../../shared/types/domain.types'

export interface VehicleFilters {
  plate: string
  type: VehicleTypeFilter
  capacity: CapacityFilter
  status: VehicleStatusFilter
  zoneIds: string[]
}

export const DEFAULT_VEHICLE_FILTERS: VehicleFilters = {
  plate: '',
  type: 'ALL',
  capacity: 'ALL',
  status: 'ALL',
  zoneIds: []
}

/**
 * Capacity range boundaries confirmed by the user (2026-07-06): "hasta o igual a" (inclusive on
 * the upper bound), aligned to the max capacity per vehicle type (docs/verified-scope.md §2.2 —
 * Pickup 1000 kg, Van 2000 kg, Truck 5000 kg). No gaps or overlaps: `capacity === 1000` (a
 * Pickup's ceiling) falls in `LTE_1000`, `capacity === 2000` (a Van's ceiling) falls in
 * `BETWEEN_1000_2000`, and any Truck above 2000 falls in `GT_2000`.
 */
export function matchesCapacityFilter(capacity: number, filter: CapacityFilter): boolean {
  switch (filter) {
    case 'ALL':
      return true
    case 'LTE_1000':
      return capacity <= 1000
    case 'BETWEEN_1000_2000':
      return capacity > 1000 && capacity <= 2000
    case 'GT_2000':
      return capacity > 2000
  }
}

/**
 * Applies the 5 filters with AND semantics. `plate` matches by case-insensitive substring
 * (confirmed by the user 2026-07-06 — covers the prefix case too); `type`/`status` compare exact
 * equality unless `'ALL'`; `zoneIds` matches every vehicle when empty ("todas las zonas").
 */
export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  const normalizedPlate = filters.plate.trim().toLowerCase()

  return vehicles.filter((vehicle) => {
    if (normalizedPlate && !vehicle.plate.toLowerCase().includes(normalizedPlate)) {
      return false
    }
    if (filters.type !== 'ALL' && vehicle.type !== filters.type) {
      return false
    }
    if (filters.status !== 'ALL' && vehicle.status !== filters.status) {
      return false
    }
    if (!matchesCapacityFilter(vehicle.capacity, filters.capacity)) {
      return false
    }
    if (filters.zoneIds.length > 0 && !filters.zoneIds.includes(vehicle.zoneId)) {
      return false
    }
    return true
  })
}
