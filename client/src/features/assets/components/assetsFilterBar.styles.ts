/**
 * Style object for the outer container of `AssetsFilterBar`, same pattern as
 * `features/vehicles/components/vehiclesFilterBar.styles.ts`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #6).
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'

export const filterBarContainerStyle: CSSProperties = {
  backgroundColor: designTokens.colors.surfaceContainerLowest,
  padding: designTokens.spacing.md,
  borderRadius: designTokens.rounded.xl,
  border: `1px solid ${designTokens.colors.outlineVariant}`,
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
}

export const filterFieldLabelStyle: CSSProperties = {
  ...designTokens.typography.labelMd,
  color: designTokens.colors.onSurfaceVariant,
  display: 'block',
  marginBottom: designTokens.spacing.xs
}
