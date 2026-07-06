/**
 * Style exceptions for `IncidentModal` that don't have a direct prop in
 * `@radix-ui/themes`, same pattern as `vehicleModal.styles.ts`.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'

/** Background box for the read-only "Fecha de creación" context note. */
export const incidentModalContextBoxStyle: CSSProperties = {
  backgroundColor: designTokens.colors.surfaceContainerLow,
  border: `1px solid ${designTokens.colors.outlineVariant}`,
  borderRadius: designTokens.rounded.lg,
  padding: designTokens.spacing.md
}
