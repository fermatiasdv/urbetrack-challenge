import type { JSX } from 'react'
import { Text } from '@radix-ui/themes'
import type { AssetStatus } from '../../../shared/types/domain.types'
import { ASSET_STATUS_LEGEND_LABELS, ASSET_STATUS_TOOLTIP_COLOR } from '../utils/assetMarkerColor'
import type { AssociatedIncident } from '../types'

export interface AssetTooltipProps {
  associatedIncident: AssociatedIncident | null
  assetStatus: AssetStatus
}

/**
 * Tooltip content shown on hover over an asset marker
 * (docs/feature/10-maps-create.md, "Tooltip"). With an associated incident:
 * type + status. Without one: the asset's own status label
 * (`ASSET_STATUS_LEGEND_LABELS`) in its matching color
 * (`ASSET_STATUS_TOOLTIP_COLOR`) — e.g. `FULL` shows "Completo" in red,
 * matching the marker's own color. Updated 2026-07-06
 * (docs/specs/fix-resolved-color-and-asset-tooltip-status.md): previously
 * always showed the fixed literal "Estado OK" in green regardless of the
 * asset's real status (docs/verified-scope.md §10.6, now superseded).
 */
export function AssetTooltip({ associatedIncident, assetStatus }: AssetTooltipProps): JSX.Element {
  if (associatedIncident === null) {
    return (
      <Text size="2" color={ASSET_STATUS_TOOLTIP_COLOR[assetStatus]} weight="medium">
        {ASSET_STATUS_LEGEND_LABELS[assetStatus]}
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
