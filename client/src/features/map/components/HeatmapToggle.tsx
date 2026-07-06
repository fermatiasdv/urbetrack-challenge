import type { JSX } from 'react'
import { useMapStore } from '../store/useMapStore'
import { toggleCard, toggleTextGroup, title, subtitle } from './mapSidebarPanel.styles'

/**
 * Heatmap on/off toggle (docs/specs/fix-map-sidebar-panel-style.md), extracted from
 * `MapPage.tsx`'s `<Heading>` row into its own "bento" card at the top of the map sidebar panel.
 * Same store wiring as before (`heatmapEnabled`/`toggleHeatmap`), only the markup/styling changed.
 */
export function HeatmapToggle(): JSX.Element {
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const toggleHeatmap = useMapStore((state) => state.toggleHeatmap)

  return (
    <label style={toggleCard}>
      <input type="checkbox" checked={heatmapEnabled} onChange={toggleHeatmap} />
      <span style={toggleTextGroup}>
        <span style={title}>Mapa de calor</span>
        <span style={subtitle}>Visualiza intensidad en el mapa</span>
      </span>
    </label>
  )
}
