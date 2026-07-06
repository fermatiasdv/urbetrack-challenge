import type { JSX } from 'react'
import { Callout, Flex } from '@radix-ui/themes'
import { TriangleAlert } from 'lucide-react'
import { useAssignmentStore } from '../assignment/useAssignmentStore'
import { ZONES } from '../../../shared/geo/zones'
import { SUPPORTED_ZONE_LABELS } from '../../../shared/geo/supportedZoneLabel'
import type { SupportedZone } from '../../../shared/types/domain.types'
import { availabilityAlertStyle } from './mapPage.styles'

const ALL_ZONES = Object.keys(ZONES) as SupportedZone[]

/**
 * Non-dismissible, full-width alert shown below the map and above
 * `MapEntityTabs` (docs/feature/12-availability-alert.md, verified-scope.md
 * §10.8) — one `Callout` per zone with `zoneAvailability[zone] === false`
 * (`useAssignmentStore`, docs/feature/11-vehicle-assignment-engine.md).
 *
 * Renders `null` when every zone has at least one `ACTIVE` vehicle. Text
 * includes the affected zone's display name (§10.8, actualizado 2026-07-06,
 * docs/feature/12-availability-alert.md "Revisión 2026-07-06"); zones without
 * availability are never consolidated into a single alert.
 */
export function AvailabilityAlert(): JSX.Element | null {
  const zoneAvailability = useAssignmentStore((state) => state.zoneAvailability)
  const unavailableZones = ALL_ZONES.filter((zone) => !zoneAvailability[zone])

  if (unavailableZones.length === 0) {
    return null
  }

  return (
    <Flex direction="column" gap="2" data-testid="availability-alert">
      {unavailableZones.map((zone) => (
        <Callout.Root key={zone} color="red" style={availabilityAlertStyle} role="alert">
          <Callout.Icon>
            <TriangleAlert size={16} />
          </Callout.Icon>
          <Callout.Text>
            No hay vehículos disponibles para {SUPPORTED_ZONE_LABELS[zone]}
          </Callout.Text>
        </Callout.Root>
      ))}
    </Flex>
  )
}
