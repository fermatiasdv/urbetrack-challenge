/**
 * Style exception for the "Descripción" column of `IncidentsTable`
 * (docs/feature/08-incidents-page.md, Gap 2): truncates long descriptions
 * with an ellipsis instead of breaking the column width, the full text stays
 * visible in `IncidentModal`.
 */
import type { CSSProperties } from 'react'

export const descriptionCellStyle: CSSProperties = {
  display: 'block',
  maxWidth: '280px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}
