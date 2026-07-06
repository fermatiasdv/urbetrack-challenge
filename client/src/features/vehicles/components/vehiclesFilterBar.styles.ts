/**
 * Style object for the outer container of `VehiclesFilterBar`
 * (docs/designs/04-vehicles-filtertable.md: `bg-surface-container-lowest p-md rounded-xl
 * border border-outline-variant shadow-sm mb-md`), values without a direct `@radix-ui/themes`
 * prop equivalent. Same pattern as `vehicleStatusCard.styles.ts` / `vehicleStatusBadge.styles.ts`.
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
