import type { JSX } from 'react'
import { Flex, Text } from '@radix-ui/themes'
import {
  INCIDENT_STATUS_COLORS,
  INCIDENT_STATUS_LEGEND_LABELS
} from '../constants/incidentStatusColors'
import { assetMarkerColor, ASSET_STATUS_LEGEND_LABELS } from '../utils/assetMarkerColor'
import type { AssetStatus, IncidentStatus } from '../../../shared/types/domain.types'
import { legendSwatchStyle } from './mapPage.styles'

const INCIDENT_STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']
const ASSET_STATUSES: AssetStatus[] = ['OK', 'FULL', 'DAMAGED', 'OUT_OF_SERVICE']

/**
 * Legend to the right of the map (docs/feature/10-maps-create.md, "Heatmap"),
 * visible only while the heatmap is enabled (CA-07). Two subsections since the
 * heatmap now radiates both incidents and assets
 * (docs/feature/14-assets-in-heatmap.md): incidentes (`REPORTED` azul,
 * `IN_PROGRESS` amarillo, `RESOLVED` violeta) y activos (`ASSET_MARKER_COLORS`:
 * `OK` verde, `FULL` rojo, `DAMAGED` naranja, `OUT_OF_SERVICE` negro).
 */
export function HeatmapLegend(): JSX.Element {
  return (
    <Flex direction="column" gap="2" data-testid="heatmap-legend">
      <Text size="2" weight="bold">
        Incidentes
      </Text>
      {INCIDENT_STATUSES.map((status) => (
        <Flex key={status} align="center" gap="2">
          <span style={legendSwatchStyle(INCIDENT_STATUS_COLORS[status])} />
          <Text size="2">{INCIDENT_STATUS_LEGEND_LABELS[status]}</Text>
        </Flex>
      ))}
      <Text size="2" weight="bold">
        Activos
      </Text>
      {ASSET_STATUSES.map((status) => (
        <Flex key={status} align="center" gap="2">
          <span style={legendSwatchStyle(assetMarkerColor(status))} />
          <Text size="2">{ASSET_STATUS_LEGEND_LABELS[status]}</Text>
        </Flex>
      ))}
    </Flex>
  )
}
