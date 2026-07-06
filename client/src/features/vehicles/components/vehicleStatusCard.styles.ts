/**
 * Style objects derived from `designTokens` for values without a `@radix-ui/themes`
 * prop equivalent (exact colors, typography). Same pattern as
 * `client/src/app/layout/sidebar.styles.ts` (docs/feature/01-modify-sidebar.md).
 *
 * Color/typography mapping decisions and open gaps are documented in
 * docs/feature/02-vehicle-statuscard.md, "Decisiones propuestas" #5 and
 * "Gaps a resolver" #1-#2.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../../app/styles/tokens'
import type { VehicleStatusKey } from '../hooks/useVehicleStatusCards'

/** Big number per card (`text-3xl` in the mockup — approximated to `headlineLg`). */
export const cardValueStyle: CSSProperties = {
  ...designTokens.typography.headlineLg,
  color: designTokens.colors.onSurface
}

/** Uppercase micro-label above the value. */
export const cardLabelStyle: CSSProperties = {
  ...designTokens.typography.labelSm,
  color: designTokens.colors.onSurfaceVariant,
  textTransform: 'uppercase'
}

/** Base style for the secondary line; color is overridden per card via `secondaryColorFor`. */
export const cardSecondaryTextStyle: CSSProperties = {
  ...designTokens.typography.labelMd
}

interface CardColorMapping {
  iconBoxStyle: CSSProperties
  secondaryColor: string
}

const CARD_COLOR_MAPPING: Record<VehicleStatusKey, CardColorMapping> = {
  total: {
    iconBoxStyle: {
      backgroundColor: designTokens.colors.surfaceContainer,
      color: designTokens.colors.primary,
      borderRadius: designTokens.rounded.lg
    },
    secondaryColor: designTokens.colors.success
  },
  active: {
    iconBoxStyle: {
      backgroundColor: designTokens.colors.successContainer,
      color: designTokens.colors.success,
      borderRadius: designTokens.rounded.lg
    },
    secondaryColor: designTokens.colors.onSurfaceVariant
  },
  maintenance: {
    iconBoxStyle: {
      backgroundColor: designTokens.colors.tertiaryContainer,
      color: designTokens.colors.tertiary,
      borderRadius: designTokens.rounded.lg
    },
    secondaryColor: designTokens.colors.onSurfaceVariant
  },
  outOfService: {
    iconBoxStyle: {
      backgroundColor: designTokens.colors.errorContainer,
      color: designTokens.colors.error,
      borderRadius: designTokens.rounded.lg
    },
    secondaryColor: designTokens.colors.error
  }
}

export function iconBoxStyleFor(key: VehicleStatusKey): CSSProperties {
  return CARD_COLOR_MAPPING[key].iconBoxStyle
}

export function secondaryColorFor(key: VehicleStatusKey): string {
  return CARD_COLOR_MAPPING[key].secondaryColor
}
