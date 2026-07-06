import type { JSX } from 'react'
import { Text } from '@radix-ui/themes'
import type { AssociatedIncident } from '../types'

export interface AssetTooltipProps {
  associatedIncident: AssociatedIncident | null
}

/**
 * Tooltip content shown on hover over an asset marker
 * (docs/feature/10-maps-create.md, "Tooltip"). With an associated incident:
 * type + status. Without one: the literal "Estado OK" in green
 * (docs/verified-scope.md §10.6) — regardless of the asset's own
 * `AssetStatus`, per the resolved ambiguity in that section.
 */
export function AssetTooltip({ associatedIncident }: AssetTooltipProps): JSX.Element {
  if (associatedIncident === null) {
    return (
      <Text size="2" color="green" weight="medium">
        Estado OK
      </Text>
    )
  }

  return (
    <Text size="2">
      <Text as="div">Tipo de incidente: {associatedIncident.type}</Text>
      <Text as="div">Estado del incidente: {associatedIncident.status}</Text>
    </Text>
  )
}
