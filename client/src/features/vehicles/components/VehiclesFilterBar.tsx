import type { JSX } from 'react'
import { Button, CheckboxGroup, Flex, Popover, Select, Text, TextField } from '@radix-ui/themes'
import { IdCard } from 'lucide-react'
import { useVehicleFiltersStore } from '../store/useVehicleFiltersStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import {
  CAPACITY_FILTER_OPTIONS,
  VEHICLE_STATUS_FILTER_OPTIONS,
  VEHICLE_TYPE_FILTER_OPTIONS
} from '../constants/vehicleFilterOptions'
import {
  field,
  filterContainer,
  label,
  plateInput,
  resetButton,
  select
} from './vehiclesFilterBar.styles'

/** Trigger label for the Zona popover (docs/feature/04-vehicles-filtertable.md, Decisión 4). */
function zoneFilterLabel(zoneIds: string[], zonesById: Map<string, string>): string {
  if (zoneIds.length === 0) {
    return 'Todas las zonas'
  }
  if (zoneIds.length === 1) {
    const [zoneId] = zoneIds
    return (zoneId && zonesById.get(zoneId)) ?? 'Todas las zonas'
  }
  return `${zoneIds.length} zonas`
}

/**
 * Filter bar above `VehiclesTable` (docs/designs/04-vehicles-filtertable.md): search by plate,
 * plus filters by type, capacity, status and zone, and a "Restablecer" button. Reads/writes
 * `useVehicleFiltersStore`; all filtering happens locally (docs/verified-scope.md §6.1), no query
 * is triggered from here.
 */
export function VehiclesFilterBar(): JSX.Element {
  const plate = useVehicleFiltersStore((state) => state.plate)
  const type = useVehicleFiltersStore((state) => state.type)
  const capacity = useVehicleFiltersStore((state) => state.capacity)
  const status = useVehicleFiltersStore((state) => state.status)
  const zoneIds = useVehicleFiltersStore((state) => state.zoneIds)
  const setPlate = useVehicleFiltersStore((state) => state.setPlate)
  const setType = useVehicleFiltersStore((state) => state.setType)
  const setCapacity = useVehicleFiltersStore((state) => state.setCapacity)
  const setStatus = useVehicleFiltersStore((state) => state.setStatus)
  const setZoneIds = useVehicleFiltersStore((state) => state.setZoneIds)
  const reset = useVehicleFiltersStore((state) => state.reset)

  const { data: zones } = useZonesQuery()
  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  return (
    <Flex wrap="wrap" style={filterContainer} mb="4">
      <Flex direction="column" style={field}>
        <Text as="label" htmlFor="vehicle-plate-filter" style={label}>
          Buscar por placa
        </Text>
        <TextField.Root
          id="vehicle-plate-filter"
          placeholder="ABC-1234"
          value={plate}
          onChange={(event) => setPlate(event.target.value)}
          style={plateInput}
        >
          <TextField.Slot>
            <IdCard size={16} aria-hidden />
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      <Flex direction="column" style={field}>
        <Text as="label" style={label}>
          Tipo
        </Text>
        <Select.Root value={type} onValueChange={setType}>
          <Select.Trigger aria-label="Tipo" style={select} />
          <Select.Content>
            {VEHICLE_TYPE_FILTER_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" style={field}>
        <Text as="label" style={label}>
          Capacidad
        </Text>
        <Select.Root value={capacity} onValueChange={setCapacity}>
          <Select.Trigger aria-label="Capacidad" style={select} />
          <Select.Content>
            {CAPACITY_FILTER_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" style={field}>
        <Text as="label" style={label}>
          Estado
        </Text>
        <Select.Root value={status} onValueChange={setStatus}>
          <Select.Trigger aria-label="Estado" style={select} />
          <Select.Content>
            {VEHICLE_STATUS_FILTER_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" style={field}>
        <Text as="label" style={label}>
          Zona
        </Text>
        <Popover.Root>
          <Popover.Trigger>
            <Button variant="surface" color="gray" aria-label="Zona" style={select}>
              {zoneFilterLabel(zoneIds, zonesById)}
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <CheckboxGroup.Root value={zoneIds} onValueChange={setZoneIds}>
              {(zones ?? []).map((zone) => (
                <CheckboxGroup.Item key={zone.id} value={zone.id}>
                  {zone.name}
                </CheckboxGroup.Item>
              ))}
            </CheckboxGroup.Root>
          </Popover.Content>
        </Popover.Root>
      </Flex>

      <Button variant="soft" color="gray" onClick={reset} style={resetButton}>
        Restablecer
      </Button>
    </Flex>
  )
}
