import { create } from 'zustand'
import type { Vehicle } from '../../../shared/types/domain.types'

export interface VehiclesState {
  vehicles: Vehicle[]
  hasHydrated: boolean
  setVehicles: (vehicles: Vehicle[]) => void
  removeVehicle: (id: string) => void
  updateVehicle: (id: string, changes: Partial<Vehicle>) => void
}

/**
 * Source of truth for the `vehicles` feature (docs/specs/architecture.md
 * "Dónde vive cada store"). Hydrated **once** by `useVehiclesQuery`
 * (`hasHydrated` guards against a later remount/refetch overwriting local
 * mutations — see docs/specs/architecture.md "Patrón: query hidrata store" →
 * "Hidratación única", bug real corregido 2026-07-06).
 *
 * `removeVehicle` backs the "Eliminar" row action
 * (docs/feature/03-vehicles-table.md): the mock backend has no `DELETE`
 * endpoint (docs/METHODS.md "Limitaciones conocidas"), so deletion only
 * mutates this in-memory store, same pattern as vehicle edits (§7.4 of
 * docs/verified-scope.md). Because the backend never reflects this, the
 * store — once hydrated — must remain the only source of truth for the
 * whole session.
 *
 * `updateVehicle` backs "Guardar" in `VehicleModal`
 * (docs/feature/06-vehicles-modal.md): the mock backend has no `PUT`/`PATCH`
 * either, so saving only merges `changes` into the matching vehicle in this
 * store, same rationale as `removeVehicle`.
 */
export const useVehiclesStore = create<VehiclesState>((set) => ({
  vehicles: [],
  hasHydrated: false,
  setVehicles: (vehicles) => set({ vehicles, hasHydrated: true }),
  removeVehicle: (id) =>
    set((state) => ({ vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id) })),
  updateVehicle: (id, changes) =>
    set((state) => ({
      vehicles: state.vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...changes } : vehicle
      )
    }))
}))
