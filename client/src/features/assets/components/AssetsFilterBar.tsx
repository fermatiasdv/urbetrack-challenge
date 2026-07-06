import type { JSX } from 'react'
import { Button, CheckboxGroup, Flex, Popover, Select, Text } from '@radix-ui/themes'
import { useAssetFiltersStore } from '../store/useAssetFiltersStore'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import {
  ASSET_STATUS_FILTER_OPTIONS,
  ASSET_TYPE_FILTER_OPTIONS
} from '../constants/assetFilterOptions'
import { filterBarContainerStyle, filterFieldLabelStyle } from './assetsFilterBar.styles'

/** Trigger label for the Zona popover, same helper as `VehiclesFilterBar`. */
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
 * Filter bar above `AssetsTable` (docs/feature/07-assets-page.md, "Decisiones propuestas" #6):
 * Tipo, Estado, Zona (multi-select) + "Restablecer". No search field, unlike
 * `VehiclesFilterBar` (docs/verified-scope.md §6.2 doesn't request one for Activos). All filtering
 * happens locally, no query is triggered from here.
 */
export function AssetsFilterBar(): JSX.Element {
  const type = useAssetFiltersStore((state) => state.type)
  const status = useAssetFiltersStore((state) => state.status)
  const zoneIds = useAssetFiltersStore((state) => state.zoneIds)
  const setType = useAssetFiltersStore((state) => state.setType)
  const setStatus = useAssetFiltersStore((state) => state.setStatus)
  const setZoneIds = useAssetFiltersStore((state) => state.setZoneIds)
  const reset = useAssetFiltersStore((state) => state.reset)

  const { data: zones } = useZonesQuery()
  const zonesById = new Map((zones ?? []).map((zone) => [zone.id, zone.name]))

  return (
    <Flex wrap="wrap" gap="4" align="end" style={filterBarContainerStyle} mb="4">
      <Flex direction="column" style={{ width: '192px' }}>
        <Text as="label" style={filterFieldLabelStyle}>
          Tipo
        </Text>
        <Select.Root value={type} onValueChange={setType}>
          <Select.Trigger aria-label="Tipo" />
          <Select.Content>
            {ASSET_TYPE_FILTER_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" style={{ width: '192px' }}>
        <Text as="label" style={filterFieldLabelStyle}>
          Estado
        </Text>
        <Select.Root value={status} onValueChange={setStatus}>
          <Select.Trigger aria-label="Estado" />
          <Select.Content>
            {ASSET_STATUS_FILTER_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" style={{ width: '192px' }}>
        <Text as="label" style={filterFieldLabelStyle}>
          Zona
        </Text>
        <Popover.Root>
          <Popover.Trigger>
            <Button variant="surface" color="gray" aria-label="Zona">
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

      <Button variant="soft" color="gray" onClick={reset}>
        Restablecer
      </Button>
    </Flex>
  )
}
