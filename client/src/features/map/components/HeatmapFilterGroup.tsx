import type { JSX } from 'react'
import { Button, Checkbox, CheckboxGroup, Flex, Popover, Text } from '@radix-ui/themes'

interface HeatmapFilterGroupProps<T extends string> {
  label: string
  triggerAriaLabel: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (values: T[]) => void
}

function triggerLabel(selectedCount: number, total: number): string {
  if (selectedCount === 0) {
    return 'Ninguno'
  }
  if (selectedCount === total) {
    return 'Todos'
  }
  return `${selectedCount} seleccionados`
}

/**
 * Generic labeled multi-select popover (label + trigger + "Todos" shortcut +
 * `CheckboxGroup`), shared by `HeatmapFilters` (incidentes) and
 * `AssetHeatmapFilters` (activos) so the popover boilerplate isn't repeated
 * per filter (docs/feature/14-assets-in-heatmap.md). Uno/varios/todos por
 * filtro (CA-06 de docs/feature/10-maps-create.md).
 */
export function HeatmapFilterGroup<T extends string>({
  label,
  triggerAriaLabel,
  options,
  selected,
  onChange
}: HeatmapFilterGroupProps<T>): JSX.Element {
  const allSelected = selected.length === options.length

  return (
    <Flex direction="column" gap="1">
      <Text size="2" color="gray">
        {label}
      </Text>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="surface" color="gray" aria-label={triggerAriaLabel}>
            {triggerLabel(selected.length, options.length)}
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Flex direction="column" gap="2">
            <Text as="label" size="2">
              <Flex gap="2" align="center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    onChange(checked ? options.map((option) => option.value) : [])
                  }
                />
                Todos
              </Flex>
            </Text>
            <CheckboxGroup.Root value={selected} onValueChange={(value) => onChange(value as T[])}>
              {options.map((option) => (
                <CheckboxGroup.Item key={option.value} value={option.value}>
                  {option.label}
                </CheckboxGroup.Item>
              ))}
            </CheckboxGroup.Root>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  )
}
