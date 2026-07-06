/**
 * Style exceptions for `VehicleModal` that don't have a direct prop in
 * `@radix-ui/themes` (docs/feature/06-vehicles-modal.md, "Decisiones
 * propuestas" #2), same pattern as `vehicleStatusBadge.styles.ts` and
 * `sidebar.styles.ts`: `CSSProperties` objects built from `designTokens`,
 * never a `style={{ ... }}` literal in the JSX.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'

/** Background box for the "La patente debe seguir..." context note. */
export const vehicleModalContextBoxStyle: CSSProperties = {
  backgroundColor: designTokens.colors.surfaceContainerLow,
  border: `1px solid ${designTokens.colors.outlineVariant}`,
  borderRadius: designTokens.rounded.lg,
  padding: designTokens.spacing.md
}
