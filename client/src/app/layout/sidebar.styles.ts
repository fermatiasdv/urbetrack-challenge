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

/**
 * Ítem de navegación inactivo (mockup: `text-on-surface-variant`). `justifyContent: 'flex-start'`
 * alinea el ícono+texto a la izquierda de la caja (Radix `Button` no expone prop `justify`, ver
 * docs/fix/10-styling-general.md → "Alineación centrada").
 */
export const navItemInactiveStyle: CSSProperties = {
  color: designTokens.colors.onSurfaceVariant,
  justifyContent: 'flex-start'
}

/**
 * Ítem de navegación activo (mockup: `bg-secondary-container text-on-secondary-container
 * font-bold translate-x-1`). Misma `variant="ghost"` que el inactivo (docs/fix/10-styling-
 * general.md → "Sidebar — tamaño de caja estable"): antes se alternaba entre `variant="soft"`
 * (activo) y `"ghost"` (inactivo), y como Radix da a `ghost` una altura `fit-content` distinta de
 * la altura fija del resto de las variantes, el link crecía al seleccionarse y corría a los de
 * abajo. Ahora la única diferencia entre estados es este objeto de estilos.
 */
export const navItemActiveStyle: CSSProperties = {
  backgroundColor: designTokens.colors.secondaryContainer,
  color: designTokens.colors.onSecondaryContainer,
  fontWeight: 700,
  transform: 'translateX(0.25rem)',
  justifyContent: 'flex-start'
}
