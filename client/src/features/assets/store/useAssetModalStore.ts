import { create } from 'zustand'

export type AssetModalMode = 'details' | 'edit'

export interface AssetModalState {
  assetId: string | null
  mode: AssetModalMode | null
  open: (assetId: string, mode: AssetModalMode) => void
  close: () => void
}

/**
 * Tracks which asset (if any) has its detail/edit modal open, and in which
 * mode. Same shape as `useVehicleModalStore`
 * (docs/feature/07-assets-page.md).
 */
export const useAssetModalStore = create<AssetModalState>((set) => ({
  assetId: null,
  mode: null,
  open: (assetId, mode) => set({ assetId, mode }),
  close: () => set({ assetId: null, mode: null })
}))
