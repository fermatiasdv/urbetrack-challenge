/**
 * Style exceptions for `AssetModal` without a direct prop in
 * `@radix-ui/themes`, same pattern as
 * `features/vehicles/components/vehicleModal.styles.ts`.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'

/** Background box for the "El estado del activo..." context note. */
export const assetModalContextBoxStyle: CSSProperties = {
  backgroundColor: designTokens.colors.surfaceContainerLow,
  border: `1px solid ${designTokens.colors.outlineVariant}`,
  borderRadius: designTokens.rounded.lg,
  padding: designTokens.spacing.md
}
