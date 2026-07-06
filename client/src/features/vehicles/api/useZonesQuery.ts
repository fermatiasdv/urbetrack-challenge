import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Zone } from '../../../shared/types/domain.types'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000,
 * no reverse proxy / env var configured yet in `client`). Same value as
 * `useVehiclesQuery.ts`.
 */
const API_BASE_URL = 'http://localhost:3000'

export async function fetchZones(): Promise<Zone[]> {
  const response = await fetch(`${API_BASE_URL}/zones`)

  if (!response.ok) {
    throw new Error(`Failed to fetch zones: ${response.status}`)
  }

  return (await response.json()) as Zone[]
}

/**
 * Fetches the zones list from the mock backend. Used to translate a
 * vehicle's `zoneId` into its display name (docs/verified-scope.md §10.4),
 * see docs/feature/03-vehicles-table.md, Gap 1.
 */
export function useZonesQuery(): UseQueryResult<Zone[]> {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones
  })
}
