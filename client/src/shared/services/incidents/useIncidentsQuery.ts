import { useEffect } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Incident } from '../../types/domain.types'
import { useIncidentsStore } from './useIncidentsStore'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000).
 * Same value as `shared/services/assets/useAssetsQuery.ts`.
 */
const API_BASE_URL = 'http://localhost:3000'

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetch(`${API_BASE_URL}/incidents`)

  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.status}`)
  }

  return (await response.json()) as Incident[]
}

/**
 * Creates a new incident against the mock backend
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #4).
 * Unlike edit/delete, `POST /incidents` exists and is implemented
 * (`api/src/controllers/incidents.controller.ts`), so the alta calls it for
 * real instead of only mutating the store — the response carries the
 * server-issued `id`/`createdAt`.
 */
export async function createIncident(payload: {
  type: Incident['type']
  description: string
  zoneId: string
  lat: number
  lng: number
}): Promise<Incident> {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Failed to create incident: ${response.status}`)
  }

  return (await response.json()) as Incident
}

/**
 * Fetches the incidents list from the mock backend and hydrates the Zustand
 * store **once** on success, following the "query hydrates store" pattern
 * (docs/specs/architecture.md#estado-global-y-data-fetching, "Hidratación
 * única") — same `hasHydrated` guard and disabled-refetch options as
 * `useAssetsQuery`.
 *
 * Moved to `shared/services/incidents/` (docs/feature/10-maps-create.md,
 * decisión #3): both `features/incidents` and `features/map` consume this
 * same query/store pair.
 */
export function useIncidentsQuery(): UseQueryResult<Incident[]> {
  const setIncidents = useIncidentsStore((state) => state.setIncidents)
  const hasHydrated = useIncidentsStore((state) => state.hasHydrated)

  const query = useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  useEffect(() => {
    if (query.data && !hasHydrated) {
      setIncidents(query.data)
    }
  }, [query.data, hasHydrated, setIncidents])

  return query
}
