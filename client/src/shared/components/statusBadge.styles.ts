/**
 * Status badge colors (colored pill + dot, docs/designs/03-vehicles-table.md
 * mockup). Promoted from
 * `features/vehicles/components/vehicleStatusBadge.styles.ts`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`"): the mapping
 * key is now a generic `StatusCardColorRole` (shared with the status summary
 * cards, `statusSummaryCard.styles.ts`) instead of `VehicleStatus`. Each
 * feature maps its own status enum to a `colorRole`
 * (`vehicleStatusColorRole`, `assetStatusColorRole`).
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../app/styles/tokens'
import type { StatusCardColorRole } from './statusSummaryCard.styles'

interface StatusBadgeColorMapping {
  badge: CSSProperties
  dot: CSSProperties
}

const STATUS_BADGE_COLOR_MAPPING: Record<StatusCardColorRole, StatusBadgeColorMapping> = {
  primary: {
    badge: {
      backgroundColor: designTokens.colors.surfaceContainer,
      color: designTokens.colors.primary
    },
    dot: { backgroundColor: designTokens.colors.primary }
  },
  success: {
    badge: {
      backgroundColor: designTokens.colors.successContainer,
      color: designTokens.colors.onSuccessContainer
    },
    dot: { backgroundColor: designTokens.colors.success }
  },
  tertiary: {
    badge: {
      backgroundColor: designTokens.colors.tertiaryContainer,
      color: designTokens.colors.onTertiaryContainer
    },
    dot: { backgroundColor: designTokens.colors.tertiary }
  },
  error: {
    badge: {
      backgroundColor: designTokens.colors.errorContainer,
      color: designTokens.colors.onErrorContainer
    },
    dot: { backgroundColor: designTokens.colors.error }
  },
  neutral: {
    badge: {
      backgroundColor: designTokens.colors.inverseSurface,
      color: designTokens.colors.inverseOnSurface
    },
    dot: { backgroundColor: designTokens.colors.inverseSurface }
  }
}

export function statusBadgeStyleFor(colorRole: StatusCardColorRole): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
    borderRadius: designTokens.rounded.full,
    ...designTokens.typography.labelSm,
    ...STATUS_BADGE_COLOR_MAPPING[colorRole].badge
  }
}

export function statusDotStyleFor(colorRole: StatusCardColorRole): CSSProperties {
  return {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: designTokens.rounded.full,
    ...STATUS_BADGE_COLOR_MAPPING[colorRole].dot
  }
}
