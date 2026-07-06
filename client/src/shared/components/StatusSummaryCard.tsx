import type { CSSProperties, JSX } from 'react'
import { Card, Flex, Text } from '@radix-ui/themes'
import type { LucideIcon } from 'lucide-react'
import {
  cardLabelStyle,
  cardSecondaryTextStyle,
  cardValueStyle,
  iconBoxStyleFor,
  secondaryColorFor,
  type StatusCardColorRole,
  type StatusCardSecondaryColorRole
} from './statusSummaryCard.styles'

export interface StatusSummaryCardData<TKey extends string = string> {
  key: TKey
  label: string
  value: number
  icon: LucideIcon
  secondaryIcon?: LucideIcon
  secondaryText: string
  iconBoxColorRole: StatusCardColorRole
  secondaryTextColorRole: StatusCardSecondaryColorRole
}

export interface StatusSummaryCardProps {
  data: StatusSummaryCardData
}

/**
 * Single "bento" card of a status summary (total + per-status counts).
 * Promoted from `features/vehicles/components/VehicleStatusCard.tsx`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`"): the component
 * itself doesn't know about vehicles or assets, it only renders whatever
 * `StatusSummaryCardData` it's given.
 */
export function StatusSummaryCard({ data }: StatusSummaryCardProps): JSX.Element {
  const Icon = data.icon
  const SecondaryIcon = data.secondaryIcon
  const secondaryTextStyle: CSSProperties = {
    ...cardSecondaryTextStyle,
    color: secondaryColorFor(data.secondaryTextColorRole)
  }

  return (
    <Card variant="surface" size="3">
      <Flex justify="between" align="start" mb="2">
        <Flex
          align="center"
          justify="center"
          width="32px"
          height="32px"
          style={iconBoxStyleFor(data.iconBoxColorRole)}
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
