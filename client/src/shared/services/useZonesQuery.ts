import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Zone } from '../types/domain.types'

/**
 * Base URL of the mock backend (see API.md — fixed at http://localhost:3000,
 * no reverse proxy / env var configured yet in `client`). Same value as
 * `features/vehicles/api/useVehiclesQuery.ts`.
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
 * `zoneId` into its display name (docs/verified-scope.md §10.4).
 *
 * Moved to `shared/services/` (docs/feature/07-assets-page.md, "Generalización
 * a `shared/`") because it's used by 2 features (`vehicles` and `assets`): a
 * single `queryKey` (`['zones']`) means both screens share the same React
 * Query cache entry instead of firing 2 redundant fetches of the same
 * resource in the same app session.
 */
export function useZonesQuery(): UseQueryResult<Zone[]> {
  return useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones
  })
}
