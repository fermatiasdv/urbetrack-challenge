import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Vehicle } from '../../../shared/types/domain.types'
import { useVehiclesStore } from '../store/useVehiclesStore'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000,
 * no reverse proxy / env var configured yet in `client`).
 */
const API_BASE_URL = 'http://localhost:3000'

export async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE_URL}/vehicles`)

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicles: ${response.status}`)
  }

  return (await response.json()) as Vehicle[]
}

/**
 * Creates a new vehicle against the mock backend
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #4).
 * Unlike edit/delete, `POST /vehicles` exists and is implemented
 * (`api/src/controllers/vehicles.controller.ts`), so the alta calls it for
 * real instead of only mutating the store — the response carries the
 * server-issued `id`.
 */
export async function createVehicle(payload: {
  plate: string
  type: Vehicle['type']
  capacity: number
  status: Vehicle['status']
  zoneId: string
}): Promise<Vehicle> {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Failed to create vehicle: ${response.status}`)
  }

  return (await response.json()) as Vehicle
}

/**
 * Fetches the vehicles list from the mock backend and hydrates the Zustand
 * store **once** on success, following the "query hydrates store" pattern
 * (docs/specs/architecture.md#estado-global-y-data-fetching, "Hidratación
 * única").
 *
 * The `hasHydrated` guard and the disabled refetch options below fix a real
 * bug (2026-07-06): without them, remounting this hook (e.g. navigating away
 * from `/vehiculos` and back) re-ran the hydration effect with the cached
 * fetch result, silently reverting any local-only mutation (delete, edit)
 * made after the initial load — the mock backend has no write endpoints
 * (docs/METHODS.md), so nothing the server returns should ever overwrite the
 * store again once it holds the user's session state.
 */
export function useVehiclesQuery(): UseQueryResult<Vehicle[]> {
  const setVehicles = useVehiclesStore((state) => state.setVehicles)
  const hasHydrated = useVehiclesStore((state) => state.hasHydrated)

  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  useEffect(() => {
    if (query.data && !hasHydrated) {
      setVehicles(query.data)
    }
  }, [query.data, hasHydrated, setVehicles])

  return query
}
