import { create } from 'zustand'

export type VehicleModalMode = 'details' | 'edit' | 'create'

export interface VehicleModalState {
  vehicleId: string | null
  mode: VehicleModalMode | null
  open: (vehicleId: string, mode: 'details' | 'edit') => void
  openCreate: () => void
  close: () => void
}

/**
 * Tracks which vehicle (if any) has its detail/edit modal open, and in which
 * mode. The modal itself is out of scope for docs/feature/03-vehicles-table.md
 * (see "Gaps" #4) — this store only lets `VehicleRowActionsMenu` set the
 * intent so a future modal component can subscribe to it without prop
 * drilling through the table.
 *
 * `openCreate()` adds the `'create'` mode used by "Agregar Vehículo"
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3):
 * no `vehicleId` since it creates a brand new record.
 */
export const useVehicleModalStore = create<VehicleModalState>((set) => ({
  vehicleId: null,
  mode: null,
  open: (vehicleId, mode) => set({ vehicleId, mode }),
  openCreate: () => set({ vehicleId: null, mode: 'create' }),
  close: () => set({ vehicleId: null, mode: null })
}))
