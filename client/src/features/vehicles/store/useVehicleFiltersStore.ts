import { create } from 'zustand'
import type {
  CapacityFilter,
  VehicleStatusFilter,
  VehicleTypeFilter
} from '../constants/vehicleFilterOptions'
import { DEFAULT_VEHICLE_FILTERS, type VehicleFilters } from '../utils/vehicleFilters'

export interface VehicleFiltersState extends VehicleFilters {
  setPlate: (plate: string) => void
  setType: (type: VehicleTypeFilter) => void
  setCapacity: (capacity: CapacityFilter) => void
  setStatus: (status: VehicleStatusFilter) => void
  setZoneIds: (zoneIds: string[]) => void
  reset: () => void
}

/**
 * Holds the current value of the 5 vehicle filters (docs/feature/04-vehicles-filtertable.md,
 * "Decisiones propuestas" #6). Lives in `features/vehicles/` (not `app/store/`) because only this
 * feature reads it (docs/specs/architecture.md: "si un estado sólo lo usa una feature, vive en esa
 * feature").
 */
export const useVehicleFiltersStore = create<VehicleFiltersState>((set) => ({
  ...DEFAULT_VEHICLE_FILTERS,
  setPlate: (plate) => set({ plate }),
  setType: (type) => set({ type }),
  setCapacity: (capacity) => set({ capacity }),
  setStatus: (status) => set({ status }),
  setZoneIds: (zoneIds) => set({ zoneIds }),
  reset: () => set(DEFAULT_VEHICLE_FILTERS)
}))
