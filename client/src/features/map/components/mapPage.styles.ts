import type { CSSProperties } from 'react'

/**
 * Literal styles for the `map` feature, kept out of JSX per project
 * convention (co-located `*.styles.ts`, same as other features).
 */
export const mapLayoutStyle: CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  width: '100%'
}

export const mapContainerStyle: CSSProperties = {
  height: '520px',
  flex: '1 1 0%',
  minWidth: 0,
  borderRadius: '8px'
}

export const heatmapSidebarStyle: CSSProperties = {
  width: '220px',
  flexShrink: 0
}

export function heatmapLegendSwatchStyle(color: string): CSSProperties {
  return {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    background: color
  }
}

/**
 * Full-width container for `AvailabilityAlert`
 * (docs/feature/12-availability-alert.md, restricción 2 "ancho completo").
 */
export const availabilityAlertStyle: CSSProperties = {
  width: '100%'
}
