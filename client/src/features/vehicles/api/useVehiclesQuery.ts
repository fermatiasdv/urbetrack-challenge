import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Vehicle } from '../types/vehicle.types'
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
 * Fetches the vehicles list from the mock backend and hydrates the Zustand
 * store on success, following the "query hydrates store" pattern
 * (docs/specs/architecture.md#estado-global-y-data-fetching).
 */
export function useVehiclesQuery(): UseQueryResult<Vehicle[]> {
  const setVehicles = useVehiclesStore((state) => state.setVehicles)

  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles
  })

  useEffect(() => {
    if (query.data) {
      setVehicles(query.data)
    }
  }, [query.data, setVehicles])

  return query
}
