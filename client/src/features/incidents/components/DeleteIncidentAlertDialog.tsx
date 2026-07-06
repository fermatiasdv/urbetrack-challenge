import type { JSX } from 'react'
import { ConfirmAlertDialog } from '../../../shared/components/ConfirmAlertDialog'
import type { Incident } from '../../../shared/types/domain.types'
import { useIncidentsStore } from '../store/useIncidentsStore'
import { incidentTypeLabel, formatIncidentDate } from '../utils/incidentFormat'

export interface DeleteIncidentAlertDialogProps {
  incident: Incident
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation dialog for the "Eliminar" row action of an incident. Thin
 * wrapper over the shared `ConfirmAlertDialog`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #5), same
 * pattern as `DeleteAssetAlertDialog`.
 */
export function DeleteIncidentAlertDialog({
  incident,
  open,
  onOpenChange
}: DeleteIncidentAlertDialogProps): JSX.Element {
  const removeIncident = useIncidentsStore((state) => state.removeIncident)

  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar incidente?"
      description={
        <>
          Se eliminará el incidente <strong>{incidentTypeLabel(incident.type)}</strong> reportado el{' '}
          {formatIncidentDate(incident.createdAt)}. Esta acción no se puede deshacer.
        </>
      }
      onAccept={() => removeIncident(incident.id)}
    />
  )
}
