import type { JSX } from 'react'
import { StatusSummaryCards } from '../../../shared/components/StatusSummaryCards'
import { useVehicleStatusCards } from '../hooks/useVehicleStatusCards'

/**
 * Renders the 4 vehicle status cards using the shared `StatusSummaryCards`
 * component (docs/feature/07-assets-page.md, "Generalización a `shared/`").
 * See docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #1 y #3.
 */
export function VehicleStatusCards(): JSX.Element {
  const cards = useVehicleStatusCards()

  return <StatusSummaryCards cards={cards} columns={{ initial: '1', md: '2', lg: '4' }} />
}
