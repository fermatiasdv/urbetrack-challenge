import type { JSX } from 'react'
import { Flex, Text } from '@radix-ui/themes'
import { assetMarkerColor, ASSET_STATUS_LEGEND_LABELS } from '../utils/assetMarkerColor'
import type { AssetStatus } from '../../../shared/types/domain.types'
import { legendSwatchStyle } from './mapPage.styles'

const STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

/**
 * Legend for asset marker colors (docs/feature/13-asset-legend.md), always
 * visible next to the map — unlike `HeatmapLegend`, not gated by
 * `heatmapEnabled`, since asset markers render regardless of the heatmap
 * toggle.
 */
export function AssetLegend(): JSX.Element {
  return (
    <Flex direction="column" gap="2" data-testid="asset-legend">
      <Text size="2" weight="bold">
        Activos
      </Text>
      {STATUSES.map((status) => (
        <Flex key={status} align="center" gap="2">
          <span style={legendSwatchStyle(assetMarkerColor(status))} />
          <Text size="2">{ASSET_STATUS_LEGEND_LABELS[status]}</Text>
        </Flex>
      ))}
    </Flex>
  )
}
