import type { CSSProperties, JSX } from 'react'
import { Card, Flex, Text } from '@radix-ui/themes'
import type { VehicleStatusCardData } from '../hooks/useVehicleStatusCards'
import {
  cardLabelStyle,
  cardSecondaryTextStyle,
  cardValueStyle,
  iconBoxStyleFor,
  secondaryColorFor
} from './vehicleStatusCard.styles'

export interface VehicleStatusCardProps {
  data: VehicleStatusCardData
}

/**
 * Single "bento" card of the vehicle status summary.
 * See docs/designs/02-vehicles-status-cards.md (mockup) and
 * docs/feature/02-vehicle-statuscard.md (mapping to `@radix-ui/themes` Card).
 */
export function VehicleStatusCard({ data }: VehicleStatusCardProps): JSX.Element {
  const Icon = data.icon
  const SecondaryIcon = data.secondaryIcon
  const secondaryTextStyle: CSSProperties = {
    ...cardSecondaryTextStyle,
    color: secondaryColorFor(data.key)
  }

  return (
    <Card variant="surface" size="3">
      <Flex justify="between" align="start" mb="2">
        <Flex
          align="center"
          justify="center"
          width="32px"
          height="32px"
          style={iconBoxStyleFor(data.key)}
        >
          <Icon size={18} aria-hidden />
        </Flex>
        <Text as="span" style={cardLabelStyle}>
          {data.label}
        </Text>
      </Flex>
      <Text as="div" style={cardValueStyle}>
        {data.value}
      </Text>
      <Flex align="center" gap="1" mt="2">
        {SecondaryIcon ? (
          <SecondaryIcon size={14} aria-hidden color={secondaryTextStyle.color} />
        ) : null}
        <Text as="span" style={secondaryTextStyle}>
          {data.secondaryText}
        </Text>
      </Flex>
    </Card>
  )
}
