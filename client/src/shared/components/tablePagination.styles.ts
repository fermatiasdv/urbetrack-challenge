/**
 * Style exceptions for `TablePagination` that don't have a direct prop in
 * `@radix-ui/themes` (docs/feature/09-pagination-and-create-modal.md,
 * "Decisiones propuestas" #1), same pattern as the rest of `shared/components/*.styles.ts`.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../app/styles/tokens'

export const tablePaginationContainerStyle: CSSProperties = {
  borderTop: `1px solid ${designTokens.colors.outlineVariant}`,
  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`
}

export const tablePaginationSummaryTextStyle: CSSProperties = {
  ...designTokens.typography.bodyMd,
  color: designTokens.colors.onSurfaceVariant
}
