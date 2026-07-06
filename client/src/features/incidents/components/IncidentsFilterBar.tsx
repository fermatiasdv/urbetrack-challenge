import type { JSX } from 'react'
import { Button, CheckboxGroup, Flex, Popover, Select, Text } from '@radix-ui/themes'
import { useIncidentFiltersStore } from '../store/useIncidentFiltersStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import {
  INCIDENT_STATUS_FILTER_OPTIONS,
  INCIDENT_TYPE_FILTER_OPTIONS
} from '../constants/incidentFilterOptions'
import { field, filterContainer, label, resetButton, select } from './incidentsFilterBar.styles'

/** Trigger label for the Zona popover, same helper as `AssetsFilterBar`. */
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
 * Filter bar above `IncidentsTable` (docs/feature/08-incidents-page.md, "Decisiones propuestas" #6):
 * Tipo, Estado, Zona (multi-select) + "Restablecer". Same pattern as `AssetsFilterBar`, no search
 * field. All filtering happens locally, no query is triggered from here.
 */
export function IncidentsFilterBar(): JSX.Element {
  const type = useIncidentFiltersStore((state) => state.type)
  const status = useIncidentFiltersStore((state) => state.status)
  const zoneIds = useIncidentFiltersStore((state) => state.zoneIds)
  const setType = useIncidentFiltersStore((state) => state.setType)
  const setStatus = useIncidentFiltersStore((state) => state.setStatus)
  const setZoneIds = useIncidentFiltersStore((state) => state.setZoneIds)
  const reset = useIncidentFiltersStore((state) => state.reset)

  const { data: zones } = useZonesQuery()
  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  return (
    <Flex wrap="wrap" style={filterContainer} mb="4">
      <Flex direction="column" style={field}>
        <Text as="label" style={label}>
          Tipo
        </Text>
        <Select.Root value={type} onValueChange={setType}>
          <Select.Trigger aria-label="Tipo" style={select} />
          <Select.Content>
            {INCIDENT_TYPE_FILTER_OPTIONS.map((option) => (
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
            {INCIDENT_STATUS_FILTER_OPTIONS.map((option) => (
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
