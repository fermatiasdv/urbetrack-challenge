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

/**
 * Full-width container for `AvailabilityAlert`
 * (docs/feature/12-availability-alert.md, restricción 2 "ancho completo").
 */
export const availabilityAlertStyle: CSSProperties = {
  width: '100%'
}

/**
 * Fixed-width container for `MapEntityTabs` (docs/specs/fix-map-entity-tabs-width.md): 75% of the
 * screen, as a fixed value — not relative to the tables' own content.
 */
export const mapEntityTabsContainerStyle: CSSProperties = {
  width: '75%'
}
