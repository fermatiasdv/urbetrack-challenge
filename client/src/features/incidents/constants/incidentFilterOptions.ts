/**
 * Static filter option lists for `IncidentsFilterBar`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #6). Same
 * pattern as `features/assets/constants/assetFilterOptions.ts`: derived from
 * the real `IncidentType`/`IncidentStatus` unions and reusing
 * `incidentTypeLabel`/`incidentStatusLabel` for their labels. Zone options
 * are NOT here — they come from the shared `useZonesQuery`.
 */
import type { IncidentStatus, IncidentType } from '../../../shared/types/domain.types'
import { incidentStatusLabel, incidentTypeLabel } from '../utils/incidentFormat'

export type IncidentTypeFilter = 'ALL' | IncidentType
export type IncidentStatusFilter = 'ALL' | IncidentStatus

interface FilterOption<TValue extends string> {
  value: TValue
  label: string
}

const INCIDENT_TYPES: IncidentType[] = ['OVERFLOW', 'DAMAGE', 'LITTERING', 'OTHER']
const INCIDENT_STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']

export const INCIDENT_TYPE_FILTER_OPTIONS: FilterOption<IncidentTypeFilter>[] = [
  { value: 'ALL', label: 'Todos los tipos' },
  ...INCIDENT_TYPES.map((type) => ({ value: type, label: incidentTypeLabel(type) }))
]

export const INCIDENT_STATUS_FILTER_OPTIONS: FilterOption<IncidentStatusFilter>[] = [
  { value: 'ALL', label: 'Todos los estados' },
  ...INCIDENT_STATUSES.map((status) => ({ value: status, label: incidentStatusLabel(status) }))
]
