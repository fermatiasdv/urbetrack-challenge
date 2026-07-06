/**
 * Style objects for the redesigned map sidebar panel (docs/specs/fix-map-sidebar-panel-style.md):
 * the container (`panel`), its inner sections (`section`/`sectionHeader`/`title`/`subtitle`), the
 * heatmap toggle (`toggleCard`), legends (`legend`/`legendItem`/`dot`) and the heatmap filters
 * (`filters`/`label`/`select`/`dropdownMenu`/`checkboxItem`). `colors` is a dedicated palette for
 * the legend "dots" only — separate from `assetMarkerColor`/`incidentStatusColors`, which color
 * the actual map pins/heatmap gradient (out of scope, see the spec).
 */
import type { CSSProperties } from 'react'

export const panel: CSSProperties = {
  width: '320px',
  background: '#FFFFFF',
  borderRadius: '24px',
  padding: '20px',
  border: '1px solid rgba(15,23,42,.06)',
  boxShadow: '0 1px 2px rgba(0,0,0,.03), 0 12px 40px rgba(15,23,42,.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
}

export const section: CSSProperties = {
  background: '#FCFCFD',
  borderRadius: '18px',
  border: '1px solid #EEF2F7',
  overflow: 'hidden'
}

export const sectionHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 18px',
  borderBottom: '1px solid #F1F5F9'
}

/** Stacks `title`/`subtitle` inside `sectionHeader` (not given explicitly by the user, needed for layout). */
export const sectionHeaderTextGroup: CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}

export const title: CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#0F172A'
}

export const subtitle: CSSProperties = {
  fontSize: '12px',
  color: '#64748B',
  marginTop: '2px'
}

export const toggleCard: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  borderRadius: '16px',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0'
}

/** Stacks the toggle's title/subtitle text next to the checkbox (not given explicitly, needed for layout). */
export const toggleTextGroup: CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}

export const legend: CSSProperties = {
  padding: '8px 18px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

export const legendItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  color: '#334155'
}

export function dot(color: string): CSSProperties {
  return {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    background: color,
    boxShadow: `0 0 0 4px ${color}20`
  }
}

export const filters: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
  padding: '16px 18px'
}

export const label: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  marginBottom: '6px'
}

export const select: CSSProperties = {
  height: '40px',
  padding: '0 12px',
  borderRadius: '12px',
  border: '1px solid #E2E8F0',
  background: '#FFF',
  fontSize: '13px',
  color: '#0F172A',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(15,23,42,.03)',
  transition: '.2s'
}

export const dropdownMenu: CSSProperties = {
  padding: '12px',
  borderRadius: '16px',
  background: '#FFF',
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgba(15,23,42,.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}

export const checkboxItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: '#334155'
}

/** Dedicated palette for the sidebar legend dots (see file header comment). */
export const colors = {
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F97316',
  inactive: '#475569',
  reported: '#3B82F6',
  progress: '#FACC15',
  solved: '#8B5CF6'
}
