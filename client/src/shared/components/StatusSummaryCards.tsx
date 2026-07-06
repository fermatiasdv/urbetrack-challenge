import type { ComponentProps, JSX } from 'react'
import { Grid } from '@radix-ui/themes'
import { StatusSummaryCard, type StatusSummaryCardData } from './StatusSummaryCard'

export interface StatusSummaryCardsProps {
  cards: StatusSummaryCardData[]
  columns?: ComponentProps<typeof Grid>['columns']
}

/**
 * Renders a list of status summary cards by mapping over the dynamic data array
 * returned by a feature's own hook (`useVehicleStatusCards`, `useAssetStatusCards`)
 * — no hardcoded per-card JSX. Promoted from
 * `features/vehicles/components/VehicleStatusCards.tsx`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`").
 */
export function StatusSummaryCards({
  cards,
  columns = { initial: '1', md: '2', lg: '4' }
}: StatusSummaryCardsProps): JSX.Element {
  return (
    <Grid columns={columns} gap="4" mb="5">
      {cards.map((card) => (
        <StatusSummaryCard key={card.key} data={card} />
      ))}
    </Grid>
  )
}
