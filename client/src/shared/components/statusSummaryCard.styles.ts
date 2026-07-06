/**
 * Style objects derived from `designTokens` for values without a `@radix-ui/themes`
 * prop equivalent (exact colors, typography). Promoted from
 * `features/vehicles/components/vehicleStatusCard.styles.ts`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`") now that a second
 * feature (`assets`) needs the same "bento" status card look.
 *
 * The vehicle-specific `Record<VehicleStatusKey, ...>` mapping is replaced by a
 * generic `colorRole`: whoever builds the card data (`useVehicleStatusCards`,
 * `useAssetStatusCards`) already resolves which semantic role each card uses: the
 * component/styles here only translate `colorRole -> designTokens`, they know
 * nothing about vehicles or assets.
 *
 * `'neutral'` is a role that didn't exist in the original vehicle-only mapping:
 * it approximates the "black" status color that `docs/verified-scope.md` §3.1
 * defines for `OUT_OF_SERVICE` assets, for which `designTokens.colors` has no
 * dedicated semantic role (see docs/feature/07-assets-page.md, Gap 1). It uses
 * `inverseSurface`/`inverseOnSurface`, the darkest tone already defined.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../app/styles/tokens'

export type StatusCardColorRole = 'primary' | 'success' | 'tertiary' | 'error' | 'neutral'

/** Secondary line color: any card color role, plus `'muted'` (the default gray). */
export type StatusCardSecondaryColorRole = 'muted' | StatusCardColorRole

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

const ICON_BOX_STYLE_MAPPING: Record<StatusCardColorRole, CSSProperties> = {
  primary: {
    backgroundColor: designTokens.colors.surfaceContainer,
    color: designTokens.colors.primary,
    borderRadius: designTokens.rounded.lg
  },
  success: {
    backgroundColor: designTokens.colors.successContainer,
    color: designTokens.colors.success,
    borderRadius: designTokens.rounded.lg
  },
  tertiary: {
    backgroundColor: designTokens.colors.tertiaryContainer,
    color: designTokens.colors.tertiary,
    borderRadius: designTokens.rounded.lg
  },
  error: {
    backgroundColor: designTokens.colors.errorContainer,
    color: designTokens.colors.error,
    borderRadius: designTokens.rounded.lg
  },
  neutral: {
    backgroundColor: designTokens.colors.inverseSurface,
    color: designTokens.colors.inverseOnSurface,
    borderRadius: designTokens.rounded.lg
  }
}

const SECONDARY_COLOR_MAPPING: Record<StatusCardSecondaryColorRole, string> = {
  muted: designTokens.colors.onSurfaceVariant,
  primary: designTokens.colors.primary,
  success: designTokens.colors.success,
  tertiary: designTokens.colors.tertiary,
  error: designTokens.colors.error,
  neutral: designTokens.colors.inverseSurface
}

export function iconBoxStyleFor(colorRole: StatusCardColorRole): CSSProperties {
  return ICON_BOX_STYLE_MAPPING[colorRole]
}

export function secondaryColorFor(colorRole: StatusCardSecondaryColorRole): string {
  return SECONDARY_COLOR_MAPPING[colorRole]
}
