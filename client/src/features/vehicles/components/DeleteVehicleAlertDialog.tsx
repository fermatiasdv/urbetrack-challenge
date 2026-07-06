import type { JSX } from 'react'
import { ConfirmAlertDialog } from '../../../shared/components/ConfirmAlertDialog'
import type { Vehicle } from '../../../shared/types/domain.types'
import { useVehiclesStore } from '../store/useVehiclesStore'

export interface DeleteVehicleAlertDialogProps {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation dialog for the "Eliminar" row action
 * (docs/designs/03-vehicles-table.md "Notas sobre la última columna",
 * docs/feature/03-vehicles-table.md "Decisiones propuestas" #4). Thin wrapper
 * over the shared `ConfirmAlertDialog` (docs/feature/07-assets-page.md,
 * "Generalización a `shared/`"): supplies the vehicle-specific copy and the
 * `removeVehicle` action.
 */
export function DeleteVehicleAlertDialog({
  vehicle,
  open,
  onOpenChange
}: DeleteVehicleAlertDialogProps): JSX.Element {
  const removeVehicle = useVehiclesStore((state) => state.removeVehicle)

  return (
    <ConfirmAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar vehículo?"
      description={
        <>
          Se eliminará el vehículo con placa <strong>{vehicle.plate}</strong>. Esta acción no se
          puede deshacer.
        </>
      }
      onAccept={() => removeVehicle(vehicle.id)}
    />
  )
}
