/**
 * Objetos de estilos para la Sidebar — SOLO para los valores del lineamiento visual que no tienen
 * equivalente como prop de un componente de `@radix-ui/themes` (colores hex de `designTokens` y
 * tipografía exacta de `designTokens.typography`). Todo lo demás (spacing, radios, layout fijo,
 * estados hover/activo) se resuelve con props de Radix directamente en `Sidebar.tsx`.
 *
 * Ver spec: docs/feature/01-modify-sidebar.md → "Mapeo de tokens a props de Radix".
 */
import type { CSSProperties } from 'react'
import { designTokens } from '../styles/tokens'

/**
 * Contenedor `<aside>` (mockup: `bg-surface-container-low shadow-sm border-r border-outline-
 * variant z-40`). `backgroundColor`/`borderRight` no tienen prop de Radix (color hex propio);
 * `boxShadow` y `zIndex` tampoco (no hay componente de Radix ni token en `designTokens` para
 * ninguno de los dos, ver spec → "Gaps a resolver"). Se resuelven acá, como excepción puntual.
 */
export const sidebarContainerStyle: CSSProperties = {
  backgroundColor: designTokens.colors.surfaceContainerLow,
  borderRight: `1px solid ${designTokens.colors.outlineVariant}`,
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  zIndex: 40
}

/** Caja de 32x32 del logo, fondo `primary` (mockup: `w-8 h-8 bg-primary rounded`). */
export const sidebarLogoBoxStyle: CSSProperties = {
  backgroundColor: designTokens.colors.primary,
  color: designTokens.colors.onPrimary
}

/** Título "Logistics Manager" (mockup: `font-title-md text-title-md font-bold text-primary`). */
export const sidebarTitleStyle: CSSProperties = {
  ...designTokens.typography.titleMd,
  color: designTokens.colors.primary
}

/** Subtítulo "Operational Hub" (mockup: `font-label-md text-label-md text-on-surface-variant`). */
export const sidebarSubtitleStyle: CSSProperties = {
  ...designTokens.typography.labelMd,
  color: designTokens.colors.onSurfaceVariant
}

/** Texto de cada ítem de navegación (mockup: `font-label-md text-label-md`). */
export const navItemLabelStyle: CSSProperties = {
  ...designTokens.typography.labelMd
}

/** Ítem de navegación inactivo (mockup: `text-on-surface-variant`). */
export const navItemInactiveStyle: CSSProperties = {
  color: designTokens.colors.onSurfaceVariant
}

/**
 * Ítem de navegación activo (mockup: `bg-secondary-container text-on-secondary-container
 * font-bold translate-x-1`).
 */
export const navItemActiveStyle: CSSProperties = {
  backgroundColor: designTokens.colors.secondaryContainer,
  color: designTokens.colors.onSecondaryContainer,
  fontWeight: 700,
  transform: 'translateX(0.25rem)'
}

/**
 * Botón "Report Incident" (mockup: `w-full bg-tertiary text-on-tertiary font-bold`). `width:
 * '100%'` es la única propiedad de layout que se resuelve acá porque `Button` de Radix no expone
 * una prop nativa de ancho completo (ver spec, "Gaps a resolver" → nota Card vs. Box).
 */
export const reportIncidentButtonStyle: CSSProperties = {
  width: '100%',
  backgroundColor: designTokens.colors.tertiary,
  color: designTokens.colors.onTertiary,
  fontWeight: 700
}
