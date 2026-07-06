import { create } from 'zustand'

export type IncidentModalMode = 'details' | 'edit' | 'create'

export interface IncidentModalState {
  incidentId: string | null
  mode: IncidentModalMode | null
  open: (incidentId: string, mode: 'details' | 'edit') => void
  openCreate: () => void
  close: () => void
}

/**
 * Tracks which incident (if any) has its detail/edit modal open, and in which
 * mode — plus the `'create'` mode for the "Agregar Incidente" alta
 * (docs/feature/09-pagination-and-create-modal.md), which has no
 * `incidentId` since it creates a brand new record. Same shape as
 * `useAssetModalStore`, extended with `openCreate()` from the start (this
 * feature is built after paginación/alta were already specified together).
 */
export const useIncidentModalStore = create<IncidentModalState>((set) => ({
  incidentId: null,
  mode: null,
  open: (incidentId, mode) => set({ incidentId, mode }),
  openCreate: () => set({ incidentId: null, mode: 'create' }),
  close: () => set({ incidentId: null, mode: null })
}))
