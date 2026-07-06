import { create } from 'zustand'
import type { Vehicle } from '../types/vehicle.types'

export interface VehiclesState {
  vehicles: Vehicle[]
  setVehicles: (vehicles: Vehicle[]) => void
}

/**
 * Source of truth for the `vehicles` feature (docs/specs/architecture.md
 * "Dónde vive cada store"). Hydrated by `useVehiclesQuery`.
 */
export const useVehiclesStore = create<VehiclesState>((set) => ({
  vehicles: [],
  setVehicles: (vehicles) => set({ vehicles })
}))
