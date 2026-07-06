/**
 * Status badge colors for the vehicle table (docs/designs/03-vehicles-table.md
 * mockup: colored pill + dot per status). Mapped to the same semantic roles
 * already used for the status cards
 * (docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #5):
 * ACTIVE -> success, MAINTENANCE -> tertiary (warning), OUT_OF_SERVICE -> error.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'
import type { VehicleStatus } from '../types/vehicle.types'

interface StatusBadgeStyle {
  badge: CSSProperties
  dot: CSSProperties
}

const STATUS_BADGE_MAPPING: Record<VehicleStatus, StatusBadgeStyle> = {
  ACTIVE: {
    badge: {
      backgroundColor: designTokens.colors.successContainer,
      color: designTokens.colors.onSuccessContainer
    },
    dot: { backgroundColor: designTokens.colors.success }
  },
  MAINTENANCE: {
    badge: {
      backgroundColor: designTokens.colors.tertiaryContainer,
      color: designTokens.colors.onTertiaryContainer
    },
    dot: { backgroundColor: designTokens.colors.tertiary }
  },
  OUT_OF_SERVICE: {
    badge: {
      backgroundColor: designTokens.colors.errorContainer,
      color: designTokens.colors.onErrorContainer
    },
    dot: { backgroundColor: designTokens.colors.error }
  }
}

export function statusBadgeStyleFor(status: VehicleStatus): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
    borderRadius: designTokens.rounded.full,
    ...designTokens.typography.labelSm,
    ...STATUS_BADGE_MAPPING[status].badge
  }
}

export function statusDotStyleFor(status: VehicleStatus): CSSProperties {
  return {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: designTokens.rounded.full,
    ...STATUS_BADGE_MAPPING[status].dot
  }
}
