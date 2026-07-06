import { useState, type JSX } from 'react'
import { RowActionsMenu } from '../../../shared/components/RowActionsMenu'
import type { Vehicle } from '../../../shared/types/domain.types'
import { useVehicleModalStore } from '../store/useVehicleModalStore'
import { DeleteVehicleAlertDialog } from './DeleteVehicleAlertDialog'

export interface VehicleRowActionsMenuProps {
  vehicle: Vehicle
}

/**
 * Kebab menu for a vehicle table row. Thin wrapper over the shared
 * `RowActionsMenu` (docs/feature/07-assets-page.md, "Generalización a
 * `shared/`"): builds the vehicle-specific items array (Detalles/Editar
 * dispatch to `useVehicleModalStore`, Eliminar opens
 * `DeleteVehicleAlertDialog` instead of the modal).
 */
export function VehicleRowActionsMenu({ vehicle }: VehicleRowActionsMenuProps): JSX.Element {
  const openModal = useVehicleModalStore((state) => state.open)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <RowActionsMenu
        triggerAriaLabel={`Acciones para el vehículo ${vehicle.plate}`}
        items={[
          { label: 'Detalles', onSelect: () => openModal(vehicle.id, 'details') },
          { label: 'Editar', onSelect: () => openModal(vehicle.id, 'edit') },
          { label: 'Eliminar', color: 'red', onSelect: () => setDeleteDialogOpen(true) }
        ]}
      />

      <DeleteVehicleAlertDialog
        vehicle={vehicle}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
