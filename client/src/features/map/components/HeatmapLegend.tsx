import type { JSX } from 'react'
import { Flex, Text } from '@radix-ui/themes'
import {
  INCIDENT_STATUS_COLORS,
  INCIDENT_STATUS_LEGEND_LABELS
} from '../constants/incidentStatusColors'
import type { IncidentStatus } from '../../../shared/types/domain.types'
import { legendSwatchStyle } from './mapPage.styles'

const STATUSES: IncidentStatus[] = ['REPORTED', 'IN_PROGRESS', 'RESOLVED']

/**
 * Legend to the right of the map (docs/feature/10-maps-create.md, "Heatmap"),
 * visible only while the heatmap is enabled (CA-07). `REPORTED` azul,
 * `IN_PROGRESS` amarillo, `RESOLVED` verde (docs/verified-scope.md §10.7).
 */
export function HeatmapLegend(): JSX.Element {
  return (
    <Flex direction="column" gap="2" data-testid="heatmap-legend">
      <Text size="2" weight="bold">
        Referencias
      </Text>
      {STATUSES.map((status) => (
        <Flex key={status} align="center" gap="2">
          <span style={legendSwatchStyle(INCIDENT_STATUS_COLORS[status])} />
          <Text size="2">{INCIDENT_STATUS_LEGEND_LABELS[status]}</Text>
        </Flex>
      ))}
    </Flex>
  )
}
