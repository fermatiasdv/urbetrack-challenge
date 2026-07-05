import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { RawVehicle } from './types'
import { fetchVehicles } from './data'
import { useVehiclesStore } from './useVehiclesStore'

/**
 * Simulates fetching the vehicles list (1200ms delay) and hydrates the
 * Zustand store on success. `isLoading` drives the table skeleton.
 */
export function useVehiclesQuery(): UseQueryResult<RawVehicle[]> {
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
