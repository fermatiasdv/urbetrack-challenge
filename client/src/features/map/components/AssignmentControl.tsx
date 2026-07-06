import type { JSX } from 'react'
import { Flex, Select, Text } from '@radix-ui/themes'
import type { Vehicle } from '../../../shared/types/domain.types'
import { vehicleTypeLabel } from '../../vehicles/utils/vehicleFormat'

// Radix `Select.Item` cannot hold an empty string value, so the "unassign"
// option uses a sentinel that no real vehicle id can collide with.
const UNASSIGNED = '__unassigned__'

export interface AssignmentControlProps {
  eligibleVehicles: Vehicle[]
  assignedVehicleId: string | null
  onAssign: (vehicleId: string) => void
  onClear: () => void
}

function vehicleOptionLabel(vehicle: Vehicle): string {
  return `${vehicleTypeLabel(vehicle.type)} (${vehicle.plate})`
}

/**
 * Presentational vehicle-assignment `Select` shown inside an asset/incident
 * map `Popup` (docs/feature/maps-asign-vehicle.md §5). Purely driven by props:
 * the parent marker layer computes the eligible vehicles
 * (`vehicleEligibility.ts`) and owns the `useAssignmentsStore` writes.
 *
 * With no eligible vehicle and nothing assigned, it renders an explanatory
 * message instead of an empty dropdown.
 */
export function AssignmentControl({
  eligibleVehicles,
  assignedVehicleId,
  onAssign,
  onClear
}: AssignmentControlProps): JSX.Element {
  if (eligibleVehicles.length === 0 && assignedVehicleId === null) {
    return (
      <Text as="p" size="2" color="gray">
        No hay vehículos disponibles para asignar.
      </Text>
    )
  }

  function handleValueChange(value: string): void {
    if (value === UNASSIGNED) {
      onClear()
      return
    }
    onAssign(value)
  }

  return (
    <Flex direction="column" gap="1">
      <Text as="label" size="2" color="gray" weight="medium">
        Vehículo asignado
      </Text>
      <Select.Root value={assignedVehicleId ?? UNASSIGNED} onValueChange={handleValueChange}>
        <Select.Trigger aria-label="Vehículo asignado" placeholder="Asignar vehículo" />
        <Select.Content>
          <Select.Item value={UNASSIGNED}>Sin asignar</Select.Item>
          {eligibleVehicles.map((vehicle) => (
            <Select.Item key={vehicle.id} value={vehicle.id}>
              {vehicleOptionLabel(vehicle)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  )
}
