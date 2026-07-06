/**
 * Style objects for `IncidentsFilterBar`, same pattern as
 * `features/assets/components/assetsFilterBar.styles.ts`
 * (docs/specs/fix-filter-inputs-style.md).
 */
import type { CSSProperties } from 'react'

export const filterContainer: CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'end'
}

export const field: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
}

export const label: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  letterSpacing: '.02em'
}

export const input: CSSProperties = {
  height: '40px',
  padding: '0 12px',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  background: '#FFF',
  fontSize: '13px',
  color: '#0F172A',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(15,23,42,.03)',
  transition: 'all .2s ease'
}

/** Sin campo de placa en Incidentes, se exporta igual por consistencia con las otras 2 features. */
export const plateInput: CSSProperties = {
  ...input,
  width: '240px',
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '.04em'
}

export const select: CSSProperties = {
  ...input,
  width: '180px'
}

export const resetButton: CSSProperties = {
  height: '40px',
  padding: '0 16px',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  background: '#F8FAFC',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: '.2s'
}
