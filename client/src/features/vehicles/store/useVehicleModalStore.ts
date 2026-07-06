import { create } from 'zustand'

export type VehicleModalMode = 'details' | 'edit'

export interface VehicleModalState {
  vehicleId: string | null
  mode: VehicleModalMode | null
  open: (vehicleId: string, mode: VehicleModalMode) => void
  close: () => void
}

/**
 * Tracks which vehicle (if any) has its detail/edit modal open, and in which
 * mode. The modal itself is out of scope for docs/feature/03-vehicles-table.md
 * (see "Gaps" #4) — this store only lets `VehicleRowActionsMenu` set the
 * intent so a future modal component can subscribe to it without prop
 * drilling through the table.
 */
export const useVehicleModalStore = create<VehicleModalState>((set) => ({
  vehicleId: null,
  mode: null,
  open: (vehicleId, mode) => set({ vehicleId, mode }),
  close: () => set({ vehicleId: null, mode: null })
}))
