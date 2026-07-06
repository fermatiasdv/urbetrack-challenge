/**
 * Pure filtering helpers for the incidents filter bar (docs/feature/08-incidents-page.md,
 * "Decisiones propuestas" #6). No React/store dependencies — unit-testable in isolation, same
 * pattern as `features/assets/utils/assetFilters.ts`. No text search field.
 */
import type { IncidentStatusFilter, IncidentTypeFilter } from '../constants/incidentFilterOptions'
import type { Incident } from '../../../shared/types/domain.types'

export interface IncidentFilters {
  type: IncidentTypeFilter
  status: IncidentStatusFilter
  zoneIds: string[]
}

export const DEFAULT_INCIDENT_FILTERS: IncidentFilters = {
  type: 'ALL',
  status: 'ALL',
  zoneIds: []
}

/**
 * Applies the 3 filters with AND semantics. `type`/`status` compare exact equality unless
 * `'ALL'`; `zoneIds` matches every incident when empty ("todas las zonas").
 */
export function filterIncidents(incidents: Incident[], filters: IncidentFilters): Incident[] {
  return incidents.filter((incident) => {
    if (filters.type !== 'ALL' && incident.type !== filters.type) {
      return false
    }
    if (filters.status !== 'ALL' && incident.status !== filters.status) {
      return false
    }
    if (filters.zoneIds.length > 0 && !filters.zoneIds.includes(incident.zoneId)) {
      return false
    }
    return true
  })
}
