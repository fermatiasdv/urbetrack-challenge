import { create } from 'zustand'

export type AssetModalMode = 'details' | 'edit' | 'create'

export interface AssetModalState {
  assetId: string | null
  mode: AssetModalMode | null
  open: (assetId: string, mode: 'details' | 'edit') => void
  openCreate: () => void
  close: () => void
}

/**
 * Tracks which asset (if any) has its detail/edit modal open, and in which
 * mode. Same shape as `useVehicleModalStore` (docs/feature/07-assets-page.md).
 *
 * `openCreate()` adds the `'create'` mode used by "Agregar Activo"
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #3):
 * no `assetId` since it creates a brand new record.
 */
export const useAssetModalStore = create<AssetModalState>((set) => ({
  assetId: null,
  mode: null,
  open: (assetId, mode) => set({ assetId, mode }),
  openCreate: () => set({ assetId: null, mode: 'create' }),
  close: () => set({ assetId: null, mode: null })
}))
