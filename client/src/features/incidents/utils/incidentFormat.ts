/**
 * Display-formatting helpers for `IncidentsTable`/`IncidentModal`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #4/#7).
 * Pure functions, no React/store dependencies — unit-testable in isolation,
 * same pattern as `features/assets/utils/assetFormat.ts`.
 */
import type { StatusCardColorRole } from '../../../shared/components/statusSummaryCard.styles'
import type { IncidentStatus, IncidentType } from '../../../shared/types/domain.types'

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  OVERFLOW: 'Desbordamiento',
  DAMAGE: 'Daño',
  LITTERING: 'Basural',
  OTHER: 'Otro'
}

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Reportado',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto'
}

/**
 * Maps each `IncidentStatus` to the generic `colorRole` consumed by the shared
 * `StatusBadge`/`StatusSummaryCard`: `REPORTED` -> error (pendiente de
 * atención), `IN_PROGRESS` -> tertiary (en resolución), `RESOLVED` -> success.
 */
const INCIDENT_STATUS_COLOR_ROLES: Record<IncidentStatus, StatusCardColorRole> = {
  REPORTED: 'error',
  IN_PROGRESS: 'tertiary',
  RESOLVED: 'success'
}

/**
 * `hourCycle: 'h23'` avoids the AM/PM ("a. m."/"p. m.") suffix `es-AR` would
 * otherwise add with the default `hour: '2-digit'` cycle, and the parts are
 * assembled manually (not `.format()`) to avoid the locale's own separator
 * (`es-AR` inserts a comma between date and time) — this guarantees the
 * exact `dd/mm/aaaa hh:mm` shape regardless of locale/ICU data available in
 * the runtime.
 */
const INCIDENT_DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
})

export function incidentTypeLabel(type: IncidentType): string {
  return INCIDENT_TYPE_LABELS[type]
}

export function incidentStatusLabel(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status]
}

export function incidentStatusColorRole(status: IncidentStatus): StatusCardColorRole {
  return INCIDENT_STATUS_COLOR_ROLES[status]
}

/** e.g. `"2024-01-15T10:30:00Z"` -> `"15/01/2024 07:30"` (formato dd/mm/aaaa hh:mm, es-AR). */
export function formatIncidentDate(createdAt: string): string {
  const parts = INCIDENT_DATE_FORMATTER.formatToParts(new Date(createdAt))
  const valueFor = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? ''

  const datePart = `${valueFor('day')}/${valueFor('month')}/${valueFor('year')}`
  const timePart = `${valueFor('hour')}:${valueFor('minute')}`
  return `${datePart} ${timePart}`
}
