import { useMemo } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import type { StatusSummaryCardData } from '../../../shared/components/StatusSummaryCard'
import { formatPercentage } from '../../../shared/utils/formatPercentage'
import type { Incident, IncidentStatus } from '../../../shared/types/domain.types'
import { useIncidentsStore } from '../store/useIncidentsStore'

export type IncidentStatusKey = 'total' | 'reported' | 'inProgress' | 'resolved'

function countByStatus(incidents: Incident[], status: IncidentStatus): number {
  return incidents.filter((incident) => incident.status === status).length
}

/**
 * Pure builder for the 4 incident status cards (Total + Reportados/En
 * Progreso/Resueltos), mirroring `buildAssetStatusCards`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #3).
 */
export function buildIncidentStatusCards(
  incidents: Incident[]
): StatusSummaryCardData<IncidentStatusKey>[] {
  const total = incidents.length
  const reportedCount = countByStatus(incidents, 'REPORTED')
  const inProgressCount = countByStatus(incidents, 'IN_PROGRESS')
  const resolvedCount = countByStatus(incidents, 'RESOLVED')

  return [
    {
      key: 'total',
      label: 'Total de Incidentes',
      value: total,
      icon: AlertTriangle,
      secondaryText: `${formatPercentage(total, total)} del total registrado`,
      iconBoxColorRole: 'primary',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'reported',
      label: 'Reportados',
      value: reportedCount,
      icon: AlertCircle,
      secondaryText: `${formatPercentage(reportedCount, total)} pendientes de atención`,
      iconBoxColorRole: 'error',
      secondaryTextColorRole: 'error'
    },
    {
      key: 'inProgress',
      label: 'En Progreso',
      value: inProgressCount,
      icon: Clock,
      secondaryText: `${formatPercentage(inProgressCount, total)} en resolución`,
      iconBoxColorRole: 'tertiary',
      secondaryTextColorRole: 'muted'
    },
    {
      key: 'resolved',
      label: 'Resueltos',
      value: resolvedCount,
      icon: CheckCircle2,
      secondaryText: `${formatPercentage(resolvedCount, total)} del total de incidentes`,
      iconBoxColorRole: 'success',
      secondaryTextColorRole: 'muted'
    }
  ]
}

/** Derives the 4 status cards from the incidents store (memoized). */
export function useIncidentStatusCards(): StatusSummaryCardData<IncidentStatusKey>[] {
  const incidents = useIncidentsStore((state) => state.incidents)
  return useMemo(() => buildIncidentStatusCards(incidents), [incidents])
}
