import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Asset } from '../../../shared/types/domain.types'
import { useAssetsStore } from '../store/useAssetsStore'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000,
 * no reverse proxy / env var configured yet in `client`). Same value as
 * `features/vehicles/api/useVehiclesQuery.ts`.
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
 * Fetches the assets list from the mock backend and hydrates the Zustand
 * store **once** on success, following the "query hydrates store" pattern
 * (docs/specs/architecture.md#estado-global-y-data-fetching, "Hidratación
 * única") — same `hasHydrated` guard and disabled-refetch options as
 * `useVehiclesQuery`, for the same reason: once "Eliminar"/"Guardar" mutate
 * this store locally, a remount of `AssetsPage` must not overwrite those
 * mutations with the cached fetch result (the mock backend has no write
 * endpoints, docs/METHODS.md).
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
