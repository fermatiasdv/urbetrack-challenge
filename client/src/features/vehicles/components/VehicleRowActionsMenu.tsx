import { useState, type JSX } from 'react'
import { IconButton, DropdownMenu } from '@radix-ui/themes'
import { MoreVertical } from 'lucide-react'
import type { Vehicle } from '../types/vehicle.types'
import { useVehicleModalStore } from '../store/useVehicleModalStore'
import { DeleteVehicleAlertDialog } from './DeleteVehicleAlertDialog'

export interface VehicleRowActionsMenuProps {
  vehicle: Vehicle
}

/**
 * Kebab menu for a table row (docs/designs/03-vehicles-table.md `more_vert`
 * button). Radix `DropdownMenu.Content` anchors right below the trigger,
 * matching "se despliega justo debajo de los puntos"
 * (docs/feature/03-vehicles-table.md "Decisiones propuestas" #3).
 *
 * "Detalles"/"Editar" set the intent on `useVehicleModalStore` (the modal
 * itself is out of scope for this feature). "Eliminar" opens
 * `DeleteVehicleAlertDialog` instead of the modal.
 */
export function VehicleRowActionsMenu({ vehicle }: VehicleRowActionsMenuProps): JSX.Element {
  const openModal = useVehicleModalStore((state) => state.open)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            variant="ghost"
            color="gray"
            aria-label={`Acciones para el vehículo ${vehicle.plate}`}
          >
            <MoreVertical size={18} aria-hidden />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => openModal(vehicle.id, 'details')}>
            Detalles
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => openModal(vehicle.id, 'edit')}>
            Editar
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" onSelect={() => setDeleteDialogOpen(true)}>
            Eliminar
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <DeleteVehicleAlertDialog
        vehicle={vehicle}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
