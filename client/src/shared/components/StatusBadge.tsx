import type { JSX } from 'react'
import type { StatusCardColorRole } from './statusSummaryCard.styles'
import { statusBadgeStyleFor, statusDotStyleFor } from './statusBadge.styles'

export interface StatusBadgeProps {
  colorRole: StatusCardColorRole
  label: string
}

/**
 * Colored pill + dot status indicator, used in tables and modals
 * (docs/designs/03-vehicles-table.md). Promoted from the inline
 * `<span style={statusBadgeStyleFor(...)}>` markup duplicated in
 * `VehiclesTable`/`VehicleModal` (docs/feature/07-assets-page.md,
 * "Generalización a `shared/`").
 */
export function StatusBadge({ colorRole, label }: StatusBadgeProps): JSX.Element {
  return (
    <span style={statusBadgeStyleFor(colorRole)}>
      <span style={statusDotStyleFor(colorRole)} aria-hidden />
      {label}
    </span>
  )
}
