import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Asset } from '../../types/domain.types'
import { useAssetsStore } from './useAssetsStore'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000,
 * no reverse proxy / env var configured yet in `client`). Same value as
 * `shared/services/incidents/useIncidentsQuery.ts`.
 */
const API_BASE_URL = 'http://localhost:3000'

export async function fetchAssets(): Promise<Asset[]> {
  const response = await fetch(`${API_BASE_URL}/assets`)

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`)
  }

  return (await response.json()) as Asset[]
}

/**
 * Creates a new asset against the mock backend
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #4).
 * Unlike edit/delete, `POST /assets` exists and is implemented
 * (`api/src/controllers/assets.controller.ts`), so the alta calls it for real
 * instead of only mutating the store — the response carries the
 * server-issued `id`.
 */
export async function createAsset(payload: {
  type: Asset['type']
  status: Asset['status']
  address: string
  zoneId: string
  lat: number
  lng: number
}): Promise<Asset> {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Failed to create asset: ${response.status}`)
  }

  return (await response.json()) as Asset
}

/**
 * Fetches the assets list from the mock backend and hydrates the Zustand
 * store **once** on success, following the "query hydrates store" pattern
 * (docs/specs/architecture.md#estado-global-y-data-fetching, "Hidratación
 * única") — same `hasHydrated` guard and disabled-refetch options as
 * `useVehiclesQuery`, for the same reason: once "Eliminar"/"Guardar" mutate
 * this store locally, a remount of `AssetsPage`/`MapPage` must not overwrite
 * those mutations with the cached fetch result (the mock backend has no
 * write endpoints, docs/METHODS.md).
 *
 * Moved to `shared/services/assets/` (docs/feature/10-maps-create.md,
 * decisión #3): both `features/assets` and `features/map` consume this same
 * query/store pair, so a single `['assets']` query key means one `GET
 * /assets` per app session, not one per feature.
 */
export function useAssetsQuery(): UseQueryResult<Asset[]> {
  const setAssets = useAssetsStore((state) => state.setAssets)
  const hasHydrated = useAssetsStore((state) => state.hasHydrated)

  const query = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  useEffect(() => {
    if (query.data && !hasHydrated) {
      setAssets(query.data)
    }
  }, [query.data, hasHydrated, setAssets])

  return query
}
