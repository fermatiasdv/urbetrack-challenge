import type { JSX } from 'react'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import type { Vehicle } from '../types/vehicle.types'
import { useVehiclesStore } from '../store/useVehiclesStore'

export interface DeleteVehicleAlertDialogProps {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Confirmation dialog for the "Eliminar" row action
 * (docs/designs/03-vehicles-table.md "Notas sobre la última columna",
 * docs/feature/03-vehicles-table.md "Decisiones propuestas" #4).
 *
 * "Aceptar" (red, destructive) removes the vehicle from the global store and
 * closes the dialog. "No" (gray, per Gap 2) just closes it — no deletion.
 */
export function DeleteVehicleAlertDialog({
  vehicle,
  open,
  onOpenChange
}: DeleteVehicleAlertDialogProps): JSX.Element {
  const removeVehicle = useVehiclesStore((state) => state.removeVehicle)

  function handleAccept(): void {
    removeVehicle(vehicle.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="420px">
        <AlertDialog.Title>¿Eliminar vehículo?</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Se eliminará el vehículo con placa <strong>{vehicle.plate}</strong>. Esta acción no se
          puede deshacer.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              No
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleAccept}>
              Aceptar
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
