import { create } from 'zustand'
import type { Asset } from '../../../shared/types/domain.types'

export interface AssetsState {
  assets: Asset[]
  hasHydrated: boolean
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, changes: Partial<Asset>) => void
}

/**
 * Source of truth for the `assets` feature (docs/specs/architecture.md
 * "Dónde vive cada store"). Hydrated **once** by `useAssetsQuery`
 * (`hasHydrated` guards against a later remount/refetch overwriting local
 * mutations — same "Hidratación única" rationale as `useVehiclesStore`).
 *
 * `removeAsset` backs the "Eliminar" row action and `updateAsset` backs
 * "Guardar" in `AssetModal` (docs/feature/07-assets-page.md, decisión de
 * ampliación de alcance del usuario sobre docs/verified-scope.md §7.2): the
 * mock backend has no `DELETE`/`PUT`/`PATCH` (docs/METHODS.md "Limitaciones
 * conocidas"), so both actions only mutate this in-memory store, same
 * pattern as `useVehiclesStore`.
 */
export const useAssetsStore = create<AssetsState>((set) => ({
  assets: [],
  hasHydrated: false,
  setAssets: (assets) => set({ assets, hasHydrated: true }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (id) =>
    set((state) => ({ assets: state.assets.filter((asset) => asset.id !== id) })),
  updateAsset: (id, changes) =>
    set((state) => ({
      assets: state.assets.map((asset) => (asset.id === id ? { ...asset, ...changes } : asset))
    }))
}))
