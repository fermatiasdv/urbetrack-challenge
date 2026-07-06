import { useState, type JSX } from 'react'
import { RowActionsMenu } from '../../../shared/components/RowActionsMenu'
import type { Incident } from '../../../shared/types/domain.types'
import { useIncidentModalStore } from '../store/useIncidentModalStore'
import { incidentTypeLabel } from '../utils/incidentFormat'
import { DeleteIncidentAlertDialog } from './DeleteIncidentAlertDialog'

export interface IncidentRowActionsMenuProps {
  incident: Incident
}

/**
 * Kebab menu for an incident table row. Thin wrapper over the shared
 * `RowActionsMenu` (docs/feature/08-incidents-page.md, "Decisiones propuestas" #5),
 * same pattern as `AssetRowActionsMenu`.
 */
export function IncidentRowActionsMenu({ incident }: IncidentRowActionsMenuProps): JSX.Element {
  const openModal = useIncidentModalStore((state) => state.open)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <RowActionsMenu
        triggerAriaLabel={`Acciones para el incidente ${incidentTypeLabel(incident.type)} (${
          incident.id
        })`}
        items={[
          { label: 'Detalles', onSelect: () => openModal(incident.id, 'details') },
          { label: 'Editar', onSelect: () => openModal(incident.id, 'edit') },
          { label: 'Eliminar', color: 'red', onSelect: () => setDeleteDialogOpen(true) }
        ]}
      />

      <DeleteIncidentAlertDialog
        incident={incident}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
