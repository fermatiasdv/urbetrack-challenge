import { useMemo } from 'react'
import { useIncidentsStore } from '../store/useIncidentsStore'
import { useIncidentFiltersStore } from '../store/useIncidentFiltersStore'
import { filterIncidents } from '../utils/incidentFilters'
import type { Incident } from '../../../shared/types/domain.types'

/**
 * Derives the filtered incident list from `useIncidentsStore` +
 * `useIncidentFiltersStore`, same pattern as `useFilteredAssets`.
 * `IncidentsTable` reads from this hook instead of `useIncidentsStore`
 * directly.
 */
export function useFilteredIncidents(): Incident[] {
  const incidents = useIncidentsStore((state) => state.incidents)
  const type = useIncidentFiltersStore((state) => state.type)
  const status = useIncidentFiltersStore((state) => state.status)
  const zoneIds = useIncidentFiltersStore((state) => state.zoneIds)

  return useMemo(
    () => filterIncidents(incidents, { type, status, zoneIds }),
    [incidents, type, status, zoneIds]
  )
}
