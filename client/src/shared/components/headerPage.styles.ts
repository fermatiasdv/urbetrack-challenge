/**
 * Style objects for `HeaderPage` — SOLO para valores sin equivalente como prop de
 * `@radix-ui/themes` (color primario exacto de `designTokens`, ya que `Theme` en `main.tsx` no
 * fija ningún `accentColor`). Mismo patrón que `client/src/app/layout/sidebar.styles.ts` →
 * `reportIncidentButtonStyle` (docs/feature/01-modify-sidebar.md).
 *
 * Ver spec: docs/feature/05-vehicles-header.md, "Decisiones propuestas" #2.
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../../app/styles/tokens'

/** Botón de acción del encabezado, color primario (`designTokens.colors.primary`/`onPrimary`). */
export const headerPageActionButtonStyle: CSSProperties = {
  backgroundColor: designTokens.colors.primary,
  color: designTokens.colors.onPrimary
}
