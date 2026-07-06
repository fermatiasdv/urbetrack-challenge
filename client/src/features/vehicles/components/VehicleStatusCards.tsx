import type { JSX } from 'react'
import { Grid } from '@radix-ui/themes'
import { useVehicleStatusCards } from '../hooks/useVehicleStatusCards'
import { VehicleStatusCard } from './VehicleStatusCard'

/**
 * Renders the 4 vehicle status cards by mapping over the dynamic data array
 * returned by `useVehicleStatusCards` — no hardcoded per-card JSX.
 * See docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #1 y #3.
 */
export function VehicleStatusCards(): JSX.Element {
  const cards = useVehicleStatusCards()

  return (
    <Grid columns={{ initial: '1', md: '2', lg: '4' }} gap="4" mb="5">
      {cards.map((card) => (
        <VehicleStatusCard key={card.key} data={card} />
      ))}
    </Grid>
  )
}
