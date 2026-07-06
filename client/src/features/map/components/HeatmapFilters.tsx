import type { JSX } from 'react'
import { Button, Checkbox, CheckboxGroup, Flex, Popover, Text } from '@radix-ui/themes'
import { useMapStore } from '../store/useMapStore'
import type { IncidentStatus, IncidentType } from '../../../shared/types/domain.types'

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: 'REPORTED', label: 'Reportado' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'RESOLVED', label: 'Resuelto' }
]

const TYPE_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: 'OVERFLOW', label: 'Desbordamiento' },
  { value: 'DAMAGE', label: 'Daño' },
  { value: 'LITTERING', label: 'Basural' },
  { value: 'OTHER', label: 'Otro' }
]

function triggerLabel(selected: unknown[], total: number, allLabel: string): string {
  if (selected.length === 0) {
    return 'Ninguno'
  }
  if (selected.length === total) {
    return allLabel
  }
  return `${selected.length} seleccionados`
}

/**
 * Heatmap status/type filters (docs/feature/10-maps-create.md, "Heatmap"),
 * allowing one/several/all values per filter independently (CA-06). Each
 * popover includes a "Todos" shortcut that selects/clears the whole group.
 */
export function HeatmapFilters(): JSX.Element {
  const heatmapFilters = useMapStore((state) => state.heatmapFilters)
  const setHeatmapFilters = useMapStore((state) => state.setHeatmapFilters)

  const allStatusesSelected = heatmapFilters.statuses.length === STATUS_OPTIONS.length
  const allTypesSelected = heatmapFilters.types.length === TYPE_OPTIONS.length

  return (
    <Flex gap="4" align="end" data-testid="heatmap-filters">
      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Estado
        </Text>
        <Popover.Root>
          <Popover.Trigger>
            <Button variant="surface" color="gray" aria-label="Estado del heatmap">
              {triggerLabel(heatmapFilters.statuses, STATUS_OPTIONS.length, 'Todos')}
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <Flex direction="column" gap="2">
              <Text as="label" size="2">
                <Flex gap="2" align="center">
                  <Checkbox
                    checked={allStatusesSelected}
                    onCheckedChange={(checked) =>
                      setHeatmapFilters({
                        ...heatmapFilters,
                        statuses: checked ? STATUS_OPTIONS.map((option) => option.value) : []
                      })
                    }
                  />
                  Todos
                </Flex>
              </Text>
              <CheckboxGroup.Root
                value={heatmapFilters.statuses}
                onValueChange={(value) =>
                  setHeatmapFilters({ ...heatmapFilters, statuses: value as IncidentStatus[] })
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <CheckboxGroup.Item key={option.value} value={option.value}>
                    {option.label}
                  </CheckboxGroup.Item>
                ))}
              </CheckboxGroup.Root>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>

      <Flex direction="column" gap="1">
        <Text size="2" color="gray">
          Tipo
        </Text>
        <Popover.Root>
          <Popover.Trigger>
            <Button variant="surface" color="gray" aria-label="Tipo de incidente del heatmap">
              {triggerLabel(heatmapFilters.types, TYPE_OPTIONS.length, 'Todos')}
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <Flex direction="column" gap="2">
              <Text as="label" size="2">
                <Flex gap="2" align="center">
                  <Checkbox
                    checked={allTypesSelected}
                    onCheckedChange={(checked) =>
                      setHeatmapFilters({
                        ...heatmapFilters,
                        types: checked ? TYPE_OPTIONS.map((option) => option.value) : []
                      })
                    }
                  />
                  Todos
                </Flex>
              </Text>
              <CheckboxGroup.Root
                value={heatmapFilters.types}
                onValueChange={(value) =>
                  setHeatmapFilters({ ...heatmapFilters, types: value as IncidentType[] })
                }
              >
                {TYPE_OPTIONS.map((option) => (
                  <CheckboxGroup.Item key={option.value} value={option.value}>
                    {option.label}
                  </CheckboxGroup.Item>
                ))}
              </CheckboxGroup.Root>
            </Flex>
          </Popover.Content>
        </Popover.Root>
      </Flex>
    </Flex>
  )
}
